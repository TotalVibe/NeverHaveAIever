import { CATEGORIES, QUESTIONS } from './questions.js';
import { sounds } from './sound.js?v=3';
import { ConfettiEngine } from './confetti.js';

class NeverHaveIEverApp {
  constructor() {
    this.confetti = new ConfettiEngine('confetti-canvas');
    this.categories = CATEGORIES;
    this.questions = this.loadQuestions();
    this.usedQuestions = {
      spicy: new Set(),
      cringe: new Set(),
      party: new Set(),
      wholesome: new Set()
    };

    // State
    this.activeCardCategory = 'spicy';
    this.cardCount = 1;
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.currentTranslate = { x: 0, y: 0 };
    this.isAnimating = false;
    this.currentDominantDirection = null;
    this.hasVibratedThreshold = false;
    this.cardHistory = []; // Store past cards for undo feature
    this.idleHintTimer = null;
    this.isCelebrating = false;
    this.cheersTimer = null;
    this.restartRequested = false;
    this.targetIntroTimer = null;
    this.targetHideTimer = null;

    // DOM Elements
    this.stackContainer = document.getElementById('card-stack');
    this.targetButtons = {
      top: document.getElementById('target-top'),
      left: document.getElementById('target-left'),
      right: document.getElementById('target-right'),
      bottom: document.getElementById('target-bottom')
    };
    this.soundToggleBtn = document.getElementById('sound-toggle-btn');
    this.ambientGlow = document.getElementById('ambient-glow');
    this.cheersOverlay = document.getElementById('cheers-overlay');

    // Modals
    this.infoModal = document.getElementById('info-modal');
    this.customiseModal = document.getElementById('customise-modal');
    this.toastEl = document.getElementById('toast');

    this.init();
  }

  getSwipeThreshold() {
    const minDim = Math.min(window.innerWidth, window.innerHeight);
    return Math.max(55, Math.min(80, minDim * 0.18));
  }

  loadQuestions() {
    return {
      spicy: [...QUESTIONS.spicy],
      cringe: [...QUESTIONS.cringe],
      party: [...QUESTIONS.party],
      wholesome: [...QUESTIONS.wholesome]
    };
  }

  getRandomQuestion(category) {
    const list = this.questions[category];
    const used = this.usedQuestions[category];

    if (used.size >= list.length) {
      used.clear();
    }

    const available = list.filter((_, idx) => !used.has(idx));
    const randomIdx = Math.floor(Math.random() * available.length);
    const chosenQuestion = available[randomIdx];

    const originalIdx = list.indexOf(chosenQuestion);
    used.add(originalIdx);

    return chosenQuestion;
  }

  init() {
    this.renderInitialDeck();
    this.bindEvents();
    this.bindKeyboard();
    this.targetIntroTimer = setTimeout(() => this.revealTargetButtons(), 2000);
    this.updateAmbientGlow(this.activeCardCategory);
    this.bindIdleHintEvents();
    this.resetIdleHint();
  }

  revealTargetButtons() {
    const arena = document.querySelector('.game-arena');
    arena.classList.remove('intro-hidden', 'intro-hiding');
    arena.classList.add('intro-revealed');
  }

  hideTargetButtons() {
    const arena = document.querySelector('.game-arena');
    const shouldAnimate = arena.classList.contains('intro-revealed');
    clearTimeout(this.targetIntroTimer);
    clearTimeout(this.targetHideTimer);
    arena.classList.remove('intro-revealed', 'intro-hidden');
    if (!shouldAnimate) {
      arena.classList.remove('intro-hiding');
      arena.classList.add('intro-hidden');
      return;
    }

    arena.classList.add('intro-hiding');
    this.targetHideTimer = setTimeout(() => {
      arena.classList.remove('intro-hiding');
      arena.classList.add('intro-hidden');
    }, 360);
  }

  bindIdleHintEvents() {
    const resetUnlessOnHint = (e) => {
      if (e.target instanceof Element && e.target.closest('.card-hint')) return;
      this.resetIdleHint();
    };
    document.addEventListener('pointerdown', resetUnlessOnHint);
    document.addEventListener('pointermove', resetUnlessOnHint);
    document.addEventListener('keydown', () => this.resetIdleHint());
  }

  resetIdleHint() {
    clearTimeout(this.idleHintTimer);
    if (this.activeCard) {
      this.activeCard.classList.remove('hint-visible');
    }

    this.idleHintTimer = setTimeout(() => {
      if (
        !this.isDragging &&
        !this.isAnimating &&
        !this.isCelebrating &&
        this.activeCard &&
        !this.infoModal.classList.contains('active')
      ) {
        this.activeCard.classList.add('hint-visible');
      }
    }, 7000);
  }

  showToast(message) {
    if (!this.toastEl) return;
    this.toastEl.textContent = message;
    this.toastEl.classList.add('visible');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastEl.classList.remove('visible');
    }, 2200);
  }

  celebrateDoneIt() {
    if (this.isCelebrating || !this.activeCard || !this.cheersOverlay) return;

    this.isCelebrating = true;
    clearTimeout(this.idleHintTimer);
    this.activeCard.classList.remove('hint-visible');
    this.cheersOverlay.classList.add('active');
    this.cheersOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('celebration-shake');

    this.cheersTimer = setTimeout(() => this.finishCheersCelebration(), 2750);
    sounds.playCheers();
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'vibrate' in navigator) {
      try {
        navigator.vibrate([12, 63, 15, 60, 18, 57, 21, 54, 24, 51, 27, 48, 30, 45, 33, 362, 110]);
      } catch (err) {}
    }
  }

  finishCheersCelebration() {
    if (!this.isCelebrating) return;

    clearTimeout(this.cheersTimer);
    this.cheersTimer = null;
    this.cheersOverlay.classList.remove('active');
    this.cheersOverlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('celebration-shake');
    this.isCelebrating = false;
    this.resetIdleHint();
  }

  updateAmbientGlow(category) {
    const catData = Object.values(this.categories).find(c => c.id === category);
    if (catData && this.ambientGlow) {
      this.ambientGlow.style.background = `radial-gradient(circle, ${catData.glow} 0%, rgba(10, 11, 16, 0.4) 60%, transparent 75%)`;
    }
  }

  renderInitialDeck() {
    this.stackContainer.innerHTML = '';

    // 1. Create 10 visible deck stack layers (resembling the borders of the top card)
    const layersWrap = document.createElement('div');
    layersWrap.className = 'deck-layers-container';
    for (let i = 10; i >= 1; i--) {
      const layer = document.createElement('div');
      layer.className = `deck-card-layer layer-${i}`;
      layer.style.setProperty('--layer-idx', i);
      layersWrap.appendChild(layer);
    }
    this.stackContainer.appendChild(layersWrap);

    // 2. Initial playable cards
    const initialCategory = 'spicy';
    const cardData1 = {
      category: initialCategory,
      text: this.getRandomQuestion(initialCategory)
    };
    const cardData2 = {
      category: 'party',
      text: this.getRandomQuestion('party')
    };

    const card2 = this.createCardElement(cardData2, 'next', true); // Face-down on top of stack
    const card1 = this.createCardElement(cardData1, 'current', true); // Start with the decorated reverse visible

    this.stackContainer.appendChild(card2);
    this.stackContainer.appendChild(card1);

    this.activeCard = card1;
    this.activeCardCategory = initialCategory;
    this.bindCardGesture(this.activeCard);
  }

  createCardElement(data, stackClass = 'next', isFaceDown = true) {
    const cat = Object.values(this.categories).find(c => c.id === data.category) || this.categories.top;

    const card = document.createElement('div');
    card.className = `game-card ${stackClass} ${isFaceDown ? 'face-down' : ''}`;
    card.dataset.category = data.category;
    card.dataset.fullText = data.text;
    card.style.setProperty('--active-card-color', cat.color);
    card.style.setProperty('--active-card-glow', cat.glow);

    const cleanQuestion = data.text.replace(/^Never have I ever /i, '');

    card.innerHTML = `
      <div class="card-inner">
        <!-- Front Face (Question statement) -->
        <div class="card-face card-front">
          <div class="card-ambient-tint"></div>
          
          <!-- Direction Stamp Indicators -->
          <div class="swipe-stamp stamp-top">😈 SPICY NEXT</div>
          <div class="swipe-stamp stamp-left">😳 CRINGE NEXT</div>
          <div class="swipe-stamp stamp-right">🥳 PARTY NEXT</div>
          <div class="swipe-stamp stamp-bottom">😇 WHOLESOME NEXT</div>

          <!-- Card category label and decorative emoji -->
          <div class="card-header">
            <div class="category-tag" style="color: ${cat.color};">
              <span class="cat-tag-name">${cat.name}</span>
            </div>
          </div>
          <div class="category-watermark" aria-hidden="true">
            <span class="cat-tag-emoji">${cat.emoji}</span>
          </div>

          <!-- Card Body Statement (Centered) -->
          <div class="card-body">
            <div class="prompt-prefix">Never Have I Ever...</div>
            <div class="prompt-text">${cleanQuestion}</div>
          </div>
          <div class="card-hint">
            <span class="card-hint-text">Drag card or tap emoji</span>
            <button class="done-it-btn" type="button" aria-label="Celebrate that you have done it">DONE IT!</button>
          </div>
        </div>

        <!-- Back Face (Vector Texture + Fancy Cursive 2-Line Title - NO DEVIL EMOJI) -->
        <div class="card-face card-back">
          <div class="vector-pattern"></div>
          <div class="card-back-frame">
            <div class="card-back-emblem">
              <div class="crest-diamond" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2.8 13.9 9l6.3 2-6.3 2-1.9 6.2L10.1 13 3.8 11l6.3-2L12 2.8Z" />
                  <path d="m19 14 .9 2.4 2.3.8-2.3.8L19 20.5l-.8-2.5-2.4-.8 2.4-.8.8-2.4Z" />
                </svg>
              </div>
              <div class="emblem-title">
                <span class="cursive-line">Never Have</span>
                <span class="cursive-line">Ai Ever</span>
              </div>
              <button class="customise-btn" type="button" aria-label="Customise cards with AI">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.8 13.9 9l6.3 2-6.3 2-1.9 6.2L10.1 13 3.8 11l6.3-2L12 2.8Z" />
                  <path d="m19 14 .9 2.4 2.3.8-2.3.8L19 20.5l-.8-2.5-2.4-.8 2.4-.8.8-2.4Z" />
                </svg>
                <span>CUSTOMISE</span>
              </button>
              <div class="emblem-line"></div>
              <div class="emblem-sub">Swipe to Reveal</div>
            </div>
          </div>
        </div>
      </div>
    `;

    return card;
  }

  bindCardGesture(card) {
    if (!card) return;

    let currentPointerId = null;

    const onPointerDown = (e) => {
      if (this.isAnimating) return;
      if (e.target.closest('button')) return;

      this.isDragging = true;
      this.hasVibratedThreshold = false;
      this.dragStart.x = e.clientX;
      this.dragStart.y = e.clientY;
      this.currentTranslate.x = 0;
      this.currentTranslate.y = 0;
      currentPointerId = e.pointerId;

      if (card.setPointerCapture) {
        try { card.setPointerCapture(e.pointerId); } catch (err) {}
      }

      card.style.transition = 'none';
      sounds.init();

      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    };

    const onPointerMove = (e) => {
      if (!this.isDragging) return;

      if (e.cancelable) {
        e.preventDefault();
      }

      const dx = e.clientX - this.dragStart.x;
      const dy = e.clientY - this.dragStart.y;
      this.currentTranslate.x = dx;
      this.currentTranslate.y = dy;

      const dist = Math.sqrt(dx * dx + dy * dy);
      const rotation = Math.max(-25, Math.min(25, dx * 0.08));
      card.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${rotation}deg)`;

      // Direction calculation (4 quadrants centered on each axis)
      let direction = null;
      if (dist > 25) {
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        if (angle >= -135 && angle < -45) {
          direction = 'top'; // 😈 Spicy
        } else if (angle >= -45 && angle < 45) {
          direction = 'right'; // 🥳 Party
        } else if (angle >= 45 && angle < 135) {
          direction = 'bottom'; // 😇 Wholesome
        } else {
          direction = 'left'; // 😳 Cringe
        }
      }

      // Check collision with emoji target buttons
      const cursorX = e.clientX;
      const cursorY = e.clientY;
      for (const [dir, btn] of Object.entries(this.targetButtons)) {
        if (btn) {
          const rect = btn.getBoundingClientRect();
          if (
            cursorX >= rect.left - 20 &&
            cursorX <= rect.right + 20 &&
            cursorY >= rect.top - 20 &&
            cursorY <= rect.bottom + 20
          ) {
            direction = dir;
            break;
          }
        }
      }

      // Next card lifts slightly as card is dragged
      const threshold = this.getSwipeThreshold();
      const progress = Math.min(1, dist / threshold);

      const nextCard = this.stackContainer.querySelector('.game-card.next');
      if (nextCard) {
        const nextScale = 0.985 + (0.015 * progress);
        const nextY = -5 * (1 - progress);
        nextCard.style.transition = 'none';
        nextCard.style.transform = `scale(${nextScale}) translateY(${nextY}px)`;
      }

      if (dist >= threshold && !this.hasVibratedThreshold) {
        this.hasVibratedThreshold = true;
        if ('vibrate' in navigator) {
          try { navigator.vibrate(12); } catch (err) {}
        }
      } else if (dist < threshold) {
        this.hasVibratedThreshold = false;
      }

      this.updateDirectionHighlight(direction, dist, card);
    };

    const onPointerUp = (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.resetIdleHint();

      if (currentPointerId !== null && card.releasePointerCapture) {
        try { card.releasePointerCapture(currentPointerId); } catch (err) {}
        currentPointerId = null;
      }

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      const dx = this.currentTranslate.x;
      const dy = this.currentTranslate.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const threshold = this.getSwipeThreshold();

      if (dist >= threshold && this.currentDominantDirection) {
        this.executeSwipe(this.currentDominantDirection);
      } else {
        this.resetCardPosition(card);
      }
    };

    card.addEventListener('pointerdown', onPointerDown);
  }

  updateDirectionHighlight(direction, dist, card) {
    this.currentDominantDirection = direction;

    Object.values(this.targetButtons).forEach(btn => btn.classList.remove('highlight'));

    const stamps = card.querySelectorAll('.swipe-stamp');
    stamps.forEach(s => s.style.opacity = '0');

    if (!direction) return;

    const threshold = this.getSwipeThreshold();
    const progress = Math.min(1, Math.max(0, (dist - 15) / (threshold - 15)));

    if (this.targetButtons[direction]) {
      this.targetButtons[direction].classList.add('highlight');
    }

    const targetStamp = card.querySelector(`.stamp-${direction}`);
    if (targetStamp) {
      targetStamp.style.opacity = Math.max(0.2, progress).toString();
      targetStamp.style.transform = `translate(-50%, -50%) scale(${0.85 + progress * 0.25})`;
    }
  }

  resetCardPosition(card) {
    card.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    card.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';

    const nextCard = this.stackContainer.querySelector('.game-card.next');
    if (nextCard) {
      nextCard.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      nextCard.style.transform = 'scale(0.985) translateY(-5px)';
    }

    const stamps = card.querySelectorAll('.swipe-stamp');
    stamps.forEach(s => s.style.opacity = '0');

    Object.values(this.targetButtons).forEach(btn => btn.classList.remove('highlight'));
    sounds.playSnapBack();
  }

  executeSwipe(direction) {
    if (this.isAnimating || !this.activeCard) return;
    this.isAnimating = true;
    this.resetIdleHint();

    const categoryMapping = {
      top: 'spicy',       // 😈 Spicy (Top)
      left: 'cringe',     // 😳 Awkward/Cringe (Left)
      right: 'party',     // 🥳 Party (Right)
      bottom: 'wholesome' // 😇 Wholesome (Down)
    };

    const nextCategory = categoryMapping[direction];

    const activeStamp = this.activeCard.querySelector(`.stamp-${direction}`);
    if (activeStamp) {
      activeStamp.style.opacity = '1';
      activeStamp.style.transform = 'translate(-50%, -50%) scale(1.1)';
    }

    this.cardHistory.push({
      category: this.activeCard.dataset.category,
      text: this.activeCard.dataset.fullText,
      faceDown: this.activeCard.classList.contains('face-down')
    });
    if (this.cardHistory.length > 15) this.cardHistory.shift();

    sounds.playCategorySound(direction);
    if ('vibrate' in navigator) {
      try { navigator.vibrate([20, 30, 20]); } catch (e) {}
    }

    let exitX = 0;
    let exitY = 0;
    let exitRotation = 0;

    switch (direction) {
      case 'top':
        exitY = -window.innerHeight - 150;
        exitRotation = (Math.random() - 0.5) * 15;
        break;
      case 'bottom':
        exitY = window.innerHeight + 150;
        exitRotation = (Math.random() - 0.5) * 15;
        break;
      case 'left':
        exitX = -window.innerWidth - 150;
        exitRotation = -28;
        break;
      case 'right':
        exitX = window.innerWidth + 150;
        exitRotation = 28;
        break;
    }

    // Active Card flies away
    this.activeCard.style.transition = 'transform 0.42s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.35s ease-out';
    this.activeCard.style.transform = `translate3d(${exitX}px, ${exitY}px, 0) rotate(${exitRotation}deg)`;
    this.activeCard.style.opacity = '0';

    Object.values(this.targetButtons).forEach(btn => btn.classList.remove('highlight'));

    const oldCard = this.activeCard;
    const nextCard = this.stackContainer.querySelector('.game-card.next');

    if (nextCard) {
      // 1. Slide next card into center showing its vector texture reverse side
      nextCard.style.transition = 'transform 0.36s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      nextCard.className = 'game-card current face-down';
      nextCard.classList.add('card-entering');
      nextCard.addEventListener('animationend', (event) => {
        if (event.target === nextCard && event.animationName === 'card-enter') {
          nextCard.classList.remove('card-entering');
        }
      }, { once: true });
      nextCard.style.pointerEvents = 'auto';
      nextCard.style.transform = 'scale(1) translateY(0px)';

      // 2. Prepare question content on the front face of this card
      const cat = Object.values(this.categories).find(c => c.id === nextCategory);
      const newQuestion = this.getRandomQuestion(nextCategory);
      nextCard.dataset.category = nextCategory;
      nextCard.dataset.fullText = newQuestion;
      nextCard.style.setProperty('--active-card-color', cat.color);
      nextCard.style.setProperty('--active-card-glow', cat.glow);

      const catTagEmoji = nextCard.querySelector('.cat-tag-emoji');
      const catTagName = nextCard.querySelector('.cat-tag-name');
      const catTag = nextCard.querySelector('.category-tag');
      if (catTag && catTagEmoji && catTagName) {
        catTag.style.color = cat.color;
        catTagName.textContent = cat.name;
        catTagEmoji.textContent = cat.emoji;
      }

      const promptText = nextCard.querySelector('.prompt-text');
      if (promptText) {
        promptText.textContent = newQuestion.replace(/^Never have I ever /i, '');
      }

      // 3. FLIP REVEAL: Rotate card 180° in 3D to reveal front face
      setTimeout(() => {
        nextCard.classList.remove('face-down');
        sounds.playSnapBack();
      }, 100);

      this.updateAmbientGlow(nextCategory);
      this.activeCardCategory = nextCategory;
    }

    // Spawn a new face-down card waiting right underneath for the next swipe
    this.cardCount++;
    const randomBackgroundCat = ['spicy', 'cringe', 'party', 'wholesome'][Math.floor(Math.random() * 4)];
    const newNextCard = this.createCardElement({
      category: randomBackgroundCat,
      text: this.getRandomQuestion(randomBackgroundCat)
    }, 'next', true);

    // Insert just before the current card (above the deck layers)
    const currentCard = this.stackContainer.querySelector('.game-card.current');
    if (currentCard) {
      this.stackContainer.insertBefore(newNextCard, currentCard);
    } else {
      this.stackContainer.appendChild(newNextCard);
    }

    setTimeout(() => {
      if (oldCard && oldCard.parentNode) {
        oldCard.remove();
      }
      this.activeCard = nextCard;
      if (this.activeCard) {
        this.bindCardGesture(this.activeCard);
      }
      this.isAnimating = false;
      if (this.restartRequested) this.restartGame();
    }, 480);
  }

  restartGame() {
    if (this.isCelebrating) return;
    if (this.isAnimating) {
      this.restartRequested = true;
      return;
    }

    this.restartRequested = false;
    this.cardHistory = [];
    Object.values(this.usedQuestions).forEach(used => used.clear());
    this.activeCardCategory = 'spicy';
    this.cardCount = 1;
    this.renderInitialDeck();
    this.updateAmbientGlow(this.activeCardCategory);
    this.resetIdleHint();
  }

  reshuffleGame() {
    if (this.isCelebrating) return;
    if (this.isAnimating) {
      this.restartRequested = true;
      return;
    }

    this.isAnimating = true;
    this.hideTargetButtons();
    clearTimeout(this.idleHintTimer);
    this.activeCard?.classList.remove('hint-visible');
    this.stackContainer.classList.remove('reshuffle-arriving');
    this.stackContainer.classList.add('shuffling');
    sounds.playSwoosh('neutral');

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const shuffleDuration = reducedMotion ? 0 : 650;
    const landingDuration = reducedMotion ? 0 : 500;

    setTimeout(() => {
      this.stackContainer.classList.remove('shuffling');
      this.isAnimating = false;
      this.restartGame();
      this.isAnimating = true;
      this.stackContainer.classList.add('reshuffle-arriving');

      setTimeout(() => {
        this.stackContainer.classList.remove('reshuffle-arriving');
        this.isAnimating = false;
        this.resetIdleHint();
        this.targetIntroTimer = setTimeout(() => this.revealTargetButtons(), 250);
      }, landingDuration);
    }, shuffleDuration);
  }

  undoLastCard() {
    if (this.isCelebrating) return;
    if (this.isAnimating || this.cardHistory.length === 0) {
      this.showToast('No previous card to undo!');
      return;
    }
    this.isAnimating = true;

    const prevCardData = this.cardHistory.pop();
    const restoredCard = this.createCardElement(prevCardData, 'current', prevCardData.faceDown);

    restoredCard.style.transition = 'none';
    restoredCard.style.transform = 'translate3d(0, -500px, 0) scale(0.9)';
    restoredCard.style.opacity = '0';

    this.stackContainer.appendChild(restoredCard);

    if (this.activeCard) {
      this.activeCard.className = 'game-card next face-down';
      this.activeCard.style.transform = 'scale(0.985) translateY(-5px)';
    }

    restoredCard.offsetHeight;

    restoredCard.style.transition = 'transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.35s ease';
    restoredCard.style.transform = 'translate3d(0, 0, 0) scale(1)';
    restoredCard.style.opacity = '1';

    this.activeCard = restoredCard;
    this.activeCardCategory = prevCardData.category;
    this.updateAmbientGlow(prevCardData.category);
    this.bindCardGesture(this.activeCard);
    this.resetIdleHint();

    sounds.playSwoosh('bottom');
    this.showToast('Restored previous card ↺');

    setTimeout(() => {
      this.isAnimating = false;
      if (this.restartRequested) this.restartGame();
    }, 460);
  }

  handleTargetTap(direction) {
    this.resetIdleHint();
    if (this.isAnimating || !this.activeCard) return;

    sounds.init();
    const targetBtn = this.targetButtons[direction];
    if (targetBtn) {
      targetBtn.classList.add('highlight');
      setTimeout(() => targetBtn.classList.remove('highlight'), 300);
    }

    this.executeSwipe(direction);
  }

  bindEvents() {
    const groupDescriptionExamples = [
      'A bride-to-be, her ex, his new boyfriend, and eight friends with Ibiza screenshots.',
      'Six coworkers, one office crush, and a group chat that should never be subpoenaed.',
      'Four gay besties, three exes, and absolutely no one trusted with the aux cord.',
      'Two couples, one situationship, and a holiday photo nobody has explained.',
      'A birthday girl, her chaotic roommates, and the friend who keeps saying “one more bar.”'
    ];
    let nextGroupDescriptionExample = 0;

    this.cheersOverlay.addEventListener('animationend', (event) => {
      if (event.target === this.cheersOverlay && event.animationName === 'cheers-overlay-lifecycle') {
        this.finishCheersCelebration();
      }
    });

    this.stackContainer.addEventListener('click', (e) => {
      if (!(e.target instanceof Element)) return;
      const customiseButton = e.target.closest('.customise-btn');
      if (customiseButton) {
        e.preventDefault();
        e.stopPropagation();
        sounds.playClick();
        const descriptionField = this.customiseModal.querySelector('.customise-group-description');
        descriptionField.placeholder = groupDescriptionExamples[nextGroupDescriptionExample];
        nextGroupDescriptionExample = (nextGroupDescriptionExample + 1) % groupDescriptionExamples.length;
        this.customiseModal.classList.add('active');
        this.customiseModal.querySelector('.customise-modal-close').focus();
        return;
      }

      const doneItButton = e.target.closest('.done-it-btn');
      if (!doneItButton) return;
      e.preventDefault();
      e.stopPropagation();
      this.celebrateDoneIt();
    });

    const closeCustomiseModal = () => {
      this.customiseModal.classList.remove('active');
      this.stackContainer.querySelector('.game-card.current .customise-btn')?.focus();
    };
    this.customiseModal.querySelector('.customise-modal-close').addEventListener('click', () => {
      sounds.playClick();
      closeCustomiseModal();
    });
    this.customiseModal.querySelector('.customise-modal-done').addEventListener('click', () => {
      sounds.playClick();
      closeCustomiseModal();
    });
    this.customiseModal.querySelectorAll('.customise-audience-option').forEach((option) => {
      option.addEventListener('click', () => {
        const isSelected = option.getAttribute('aria-pressed') === 'true';
        option.setAttribute('aria-pressed', String(!isSelected));
        sounds.playClick();
      });
    });
    this.customiseModal.addEventListener('click', (e) => {
      if (e.target === this.customiseModal) closeCustomiseModal();
    });

    // 4 Directional Emoji Buttons
    ['top', 'left', 'right', 'bottom'].forEach(direction => {
      const btn = this.targetButtons[direction];
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleTargetTap(direction);
        });
      }
    });

    // Sound Toggle
    this.soundToggleBtn.addEventListener('click', () => {
      const isEnabled = sounds.toggle();
      this.soundToggleBtn.textContent = isEnabled ? '🔊' : '🔇';
      sounds.playClick();
      this.showToast(isEnabled ? 'Sound ON 🔊' : 'Sound MUTED 🔇');
    });

    document.getElementById('undo-btn').addEventListener('click', () => this.undoLastCard());
    document.getElementById('reshuffle-btn').addEventListener('click', () => this.reshuffleGame());

    // Info Modal
    const infoBtn = document.getElementById('info-btn');
    const closeInfoBtn = document.getElementById('close-info-btn');
    infoBtn.addEventListener('click', () => {
      sounds.playClick();
      this.infoModal.classList.add('active');
    });
    closeInfoBtn.addEventListener('click', () => {
      sounds.playClick();
      this.infoModal.classList.remove('active');
    });

    if (this.infoModal) {
      this.infoModal.addEventListener('click', (e) => {
        if (e.target === this.infoModal) {
          this.infoModal.classList.remove('active');
        }
      });
    }
  }

  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.customiseModal.classList.contains('active')) {
        this.customiseModal.classList.remove('active');
        this.stackContainer.querySelector('.game-card.current .customise-btn')?.focus();
        return;
      }
      if (this.isCelebrating) return;
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          this.handleTargetTap('top');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.handleTargetTap('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.handleTargetTap('right');
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.handleTargetTap('bottom');
          break;
        case ' ':
          e.preventDefault();
          const dirs = ['top', 'left', 'right', 'bottom'];
          this.handleTargetTap(dirs[Math.floor(Math.random() * dirs.length)]);
          break;
        case 'z':
        case 'Z':
          if (e.ctrlKey || e.metaKey || e.key === 'z') {
            this.undoLastCard();
          }
          break;
        case 'm':
        case 'M':
          this.soundToggleBtn.click();
          break;
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new NeverHaveIEverApp();
});
