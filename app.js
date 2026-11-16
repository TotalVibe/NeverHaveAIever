import { CATEGORIES, QUESTIONS, SPICY_QUESTION_LEVELS } from './questions.js?v=4';
import { sounds } from './sound.js?v=4';
import { ConfettiEngine } from './confetti.js';

const SPICY_LEVELS = ['cheeky', 'spicy', 'unhinged'];
const LEVEL_UP_SWIPE_THRESHOLD = 15;
const LEVEL_UP_DONE_IT_THRESHOLD = 7;
const SPICY_LEVEL_LABELS = {
  cheeky: 'Cheeky',
  spicy: 'Spicy',
  unhinged: 'Unhinged'
};
const SPICY_LEVEL_CATEGORY_NAMES = {
  cheeky: 'Cheeky & Playful',
  spicy: 'Spicy & Wild',
  unhinged: 'Unhinged & No Limits'
};
const SPICY_LEVEL_EMOJIS = {
  cheeky: '🤪',
  spicy: '😈',
  unhinged: '🤯'
};

class NeverHaveIEverApp {
  constructor() {
    this.confetti = new ConfettiEngine('confetti-canvas');
    this.categories = CATEGORIES;
    this.spicyLevel = this.loadSavedSpicyLevel();
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
    this.swipeCount = 0;
    this.doneItCount = 0;
    this.levelUpPromptShown = false;
    this.levelUpPromptPending = false;
    this.levelUpReturnCategory = 'spicy';
    this.lastLevelUpNoiseAt = 0;
    this.idleHintTimer = null;
    this.isCelebrating = false;
    this.cheersTimer = null;
    this.restartRequested = false;
    this.targetIntroTimer = null;
    this.targetHideTimer = null;
    this.screenShakeTimer = null;

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

  loadSavedSpicyLevel() {
    try {
      const savedLevel = localStorage.getItem('never-have-ai-ever-spicy-level');
      return SPICY_LEVELS.includes(savedLevel) ? savedLevel : 'spicy';
    } catch (error) {
      console.error('Unable to load the saved card intensity level.', error);
      return 'spicy';
    }
  }

  loadQuestions() {
    return {
      spicy: [...SPICY_QUESTION_LEVELS[this.spicyLevel]],
      cringe: [...QUESTIONS.cringe],
      party: [...QUESTIONS.party],
      wholesome: [...QUESTIONS.wholesome]
    };
  }

  getCategoryName(category) {
    return category === 'spicy'
      ? SPICY_LEVEL_LABELS[this.spicyLevel]
      : Object.values(this.categories).find(c => c.id === category)?.name ?? this.categories.top.name;
  }

  getCardCategoryName(category) {
    return category === 'spicy'
      ? SPICY_LEVEL_CATEGORY_NAMES[this.spicyLevel]
      : this.getCategoryName(category);
  }

  getCategoryEmoji(category) {
    return category === 'spicy'
      ? SPICY_LEVEL_EMOJIS[this.spicyLevel]
      : Object.values(this.categories).find(c => c.id === category)?.emoji ?? this.categories.top.emoji;
  }

  updateSpicyLevelPresentation() {
    const topTarget = this.targetButtons.top;
    topTarget.querySelector('.emoji').textContent = this.getCategoryEmoji('spicy');
    topTarget.querySelector('.label').textContent = this.getCategoryName('spicy');
    topTarget.title = `Drag UP or Tap for ${this.getCategoryName('spicy')}`;
    document.getElementById('guide-spicy-emoji').textContent = this.getCategoryEmoji('spicy');
    document.getElementById('guide-spicy-label').textContent = this.getCategoryName('spicy');
  }

  updateSpicyLevelPreview(level) {
    const slider = this.customiseModal.querySelector('.customise-level-slider');
    const thumb = this.customiseModal.querySelector('.customise-level-thumb');
    const selectedIndex = SPICY_LEVELS.indexOf(level);
    slider.value = String(selectedIndex);
    slider.setAttribute('aria-valuetext', SPICY_LEVEL_LABELS[level]);
    thumb.textContent = SPICY_LEVEL_EMOJIS[level];
    const markerTints = {
      cheeky: ['rgba(56, 217, 169, 0.42)', 'rgba(56, 217, 169, 0.2)', 'rgba(56, 217, 169, 0.14)'],
      spicy: ['rgba(155, 93, 229, 0.42)', 'rgba(155, 93, 229, 0.2)', 'rgba(155, 93, 229, 0.14)'],
      unhinged: ['rgba(255, 77, 79, 0.42)', 'rgba(255, 77, 79, 0.2)', 'rgba(255, 77, 79, 0.14)']
    };
    const [glow, glowSoft, glassTint] = markerTints[level];
    thumb.style.setProperty('--marker-glow', glow);
    thumb.style.setProperty('--marker-glow-soft', glowSoft);
    thumb.style.setProperty('--marker-glass-tint', glassTint);
    const thumbSize = 22;
    const thumbCenter = slider.offsetLeft + thumbSize / 2
      + selectedIndex * (slider.offsetWidth - thumbSize) / (SPICY_LEVELS.length - 1);
    thumb.style.left = `${thumbCenter}px`;
    this.customiseModal.querySelectorAll('.customise-level-option').forEach((option, index) => {
      option.classList.toggle('is-current', index === selectedIndex);
    });
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
    this.updateSpicyLevelPresentation();
    this.updateSoundTogglePresentation(sounds.enabled);
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

  updateSoundTogglePresentation(isEnabled) {
    this.soundToggleBtn.innerHTML = isEnabled
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l5 4V6l-5 4H4Z"/><path d="M16 9a5 5 0 0 1 0 6M18.5 6.5a9 9 0 0 1 0 11"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l5 4V6l-5 4H4Z"/><path d="m16 9 5 6m0-6-5 6"/></svg>';
    this.soundToggleBtn.setAttribute('aria-label', isEnabled ? 'Mute sound' : 'Enable sound');
    this.soundToggleBtn.setAttribute('aria-pressed', String(isEnabled));
    this.soundToggleBtn.title = isEnabled ? 'Mute Sound (M)' : 'Enable Sound (M)';
  }

  celebrateDoneIt() {
    if (this.isCelebrating || !this.activeCard || !this.cheersOverlay) return;

    if (this.activeCard.dataset.doneIt !== 'true') {
      this.activeCard.dataset.doneIt = 'true';
      this.doneItCount += 1;
      this.queueLevelUpPromptIfEligible();
    }

    this.isCelebrating = true;
    clearTimeout(this.idleHintTimer);
    this.activeCard.classList.remove('hint-visible');
    this.cheersOverlay.classList.add('active');
    this.cheersOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('celebration-shake');

    this.cheersTimer = setTimeout(() => this.finishCheersCelebration(), 2750);
    sounds.playCheers();
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTimeout(() => {
        const overlayBounds = this.cheersOverlay.getBoundingClientRect();
        this.confetti.burst(
          overlayBounds.left + overlayBounds.width / 2,
          overlayBounds.top + overlayBounds.height * 0.39,
          180,
          ['#ffd43b', '#a855f7'],
          'droplet'
        );
      }, 980);
    }
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
    if (this.levelUpPromptPending) {
      this.levelUpPromptPending = false;
      this.showLevelUpCard();
    }
  }

  queueLevelUpPromptIfEligible() {
    if (
      !this.levelUpPromptShown &&
      SPICY_LEVELS.indexOf(this.spicyLevel) < SPICY_LEVELS.length - 1 &&
      (this.swipeCount >= LEVEL_UP_SWIPE_THRESHOLD || this.doneItCount >= LEVEL_UP_DONE_IT_THRESHOLD)
    ) {
      this.levelUpPromptPending = true;
    }
  }

  setLevelUpTargetMode(isActive) {
    const arena = document.querySelector('.game-arena');
    arena.classList.toggle('level-up-active', isActive);

    const leftButton = this.targetButtons.left;
    const rightButton = this.targetButtons.right;
    leftButton.querySelector('.emoji').innerHTML = isActive
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>'
      : '😳';
    leftButton.querySelector('.label').textContent = isActive ? 'No' : 'Cringe';
    leftButton.querySelector('.arrow-indicator').textContent = '◄';
    leftButton.title = isActive ? 'Drag LEFT or Tap No' : 'Drag LEFT or Tap for Awkward & Cringe';
    rightButton.querySelector('.emoji').innerHTML = isActive
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4.5 12.5 5 5L19.5 7.5"/></svg>'
      : '🥳';
    rightButton.querySelector('.label').textContent = isActive ? 'Yes' : 'Party';
    rightButton.querySelector('.arrow-indicator').textContent = '►';
    rightButton.title = isActive ? 'Drag RIGHT or Tap Yes' : 'Drag RIGHT or Tap for Party & Chaos';
  }

  createLevelUpCardElement(data = {}) {
    const card = this.createCardElement({
      category: 'spicy',
      text: 'Turn it up?',
      cardType: 'level-up'
    }, 'current', true);
    const nextLevelIndex = SPICY_LEVELS.indexOf(this.spicyLevel) + 1;
    const nextLevel = SPICY_LEVELS[nextLevelIndex];

    card.classList.add('level-up-card');
    if (nextLevel === 'unhinged') card.classList.add('level-up-card-unhinged');
    card.dataset.levelUpPrevious = data.spicyLevel ?? this.spicyLevel;
    card.dataset.levelUpNext = nextLevel ?? '';
    card.dataset.levelUpReturnCategory = data.returnCategory ?? this.levelUpReturnCategory;
    card.querySelector('.cat-tag-emoji').textContent = nextLevel
      ? SPICY_LEVEL_EMOJIS[nextLevel]
      : SPICY_LEVEL_EMOJIS[this.spicyLevel];
    card.querySelector('.cat-tag-name').textContent = `Next level: ${SPICY_LEVEL_LABELS[nextLevel]}`;
    card.querySelector('.prompt-prefix').remove();
    card.querySelector('.prompt-text').textContent = 'Turn it up?';
    card.querySelector('.prompt-text').classList.add('level-up-message');
    const choiceHint = card.querySelector('.card-hint-text');
    choiceHint.classList.add('level-up-choice-hint');
    choiceHint.innerHTML = '<span>Swipe left ◄: NO</span><span>right: YES ►</span>';
    card.querySelector('.done-it-btn').remove();
    card.querySelectorAll('.swipe-stamp').forEach(stamp => stamp.remove());
    card.querySelector('.customise-btn').remove();
    return card;
  }

  showLevelUpCard() {
    if (!this.activeCard || this.spicyLevel === SPICY_LEVELS[SPICY_LEVELS.length - 1]) return;

    this.isAnimating = true;
    clearTimeout(this.idleHintTimer);
    this.activeCard.classList.remove('hint-visible');
    this.levelUpPromptShown = true;
    this.levelUpReturnCategory = this.activeCard.dataset.category || this.activeCardCategory;
    this.cardHistory.push({
      category: this.activeCard.dataset.category,
      text: this.activeCard.dataset.fullText,
      faceDown: this.activeCard.classList.contains('face-down'),
      doneIt: this.activeCard.dataset.doneIt === 'true'
    });
    if (this.cardHistory.length > 15) this.cardHistory.shift();

    const previousCard = this.activeCard;
    previousCard.style.transition = 'transform 0.32s ease, opacity 0.28s ease';
    previousCard.style.transform = `translate3d(0, -${window.innerHeight}px, 0) rotate(-5deg)`;
    previousCard.style.opacity = '0';
    this.stackContainer.querySelectorAll('.game-card.next').forEach(card => card.remove());

    const levelUpCard = this.createLevelUpCardElement({ returnCategory: this.levelUpReturnCategory });
    levelUpCard.classList.add('card-entering');
    const nextQuestion = this.createCardElement({
      category: this.levelUpReturnCategory,
      text: this.getRandomQuestion(this.levelUpReturnCategory)
    }, 'next', true);
    this.stackContainer.append(nextQuestion, levelUpCard);
    this.activeCard = levelUpCard;
    this.bindCardGesture(levelUpCard);
    this.setLevelUpTargetMode(true);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const flipDelay = reducedMotion ? 0 : 220;
    const settleDelay = reducedMotion ? 50 : 700;
    setTimeout(() => {
      levelUpCard.classList.remove('face-down');
      sounds.playSnapBack();
    }, flipDelay);
    setTimeout(() => {
      previousCard.remove();
      levelUpCard.classList.remove('card-entering');
      this.isAnimating = false;
      if (this.restartRequested) this.restartGame();
    }, settleDelay);
  }

  resolveLevelUp(direction) {
    if (this.isAnimating || !this.activeCard) return;
    if (direction !== 'left' && direction !== 'right') {
      this.resetCardPosition(this.activeCard);
      return;
    }

    const previousLevel = this.spicyLevel;
    if (direction === 'right') {
      const nextLevel = SPICY_LEVELS[SPICY_LEVELS.indexOf(this.spicyLevel) + 1];
      if (!nextLevel) {
        this.resetCardPosition(this.activeCard);
        return;
      }
      try {
        localStorage.setItem('never-have-ai-ever-spicy-level', nextLevel);
      } catch (error) {
        console.error('Unable to save the card intensity level.', error);
        this.showToast('Could not save your card intensity level.');
        this.resetCardPosition(this.activeCard);
        return;
      }

      this.spicyLevel = nextLevel;
      this.questions.spicy = [...SPICY_QUESTION_LEVELS[nextLevel]];
      this.updateSpicyLevelPresentation();
      this.swipeCount = 0;
      this.doneItCount = 0;
      this.levelUpPromptShown = false;
    }

    this.isAnimating = true;
    this.resetIdleHint();
    this.cardHistory.push({
      cardType: 'level-up',
      category: 'spicy',
      text: 'Turn it up?',
      faceDown: false,
      spicyLevel: previousLevel,
      returnCategory: this.levelUpReturnCategory
    });
    if (this.cardHistory.length > 15) this.cardHistory.shift();

    const oldCard = this.activeCard;
    oldCard.style.transition = 'transform 0.42s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.35s ease-out';
    oldCard.style.transform = `translate3d(${direction === 'right' ? window.innerWidth : -window.innerWidth}px, 0, 0) rotate(${direction === 'right' ? 28 : -28}deg)`;
    oldCard.style.opacity = '0';

    this.stackContainer.querySelectorAll('.game-card.next').forEach(card => card.remove());
    const category = direction === 'right' ? 'spicy' : this.levelUpReturnCategory;
    const nextCard = this.createCardElement({
      category,
      text: this.getRandomQuestion(category)
    }, 'current', true);
    nextCard.classList.add('card-entering');
    const backgroundCategory = ['spicy', 'cringe', 'party', 'wholesome'][Math.floor(Math.random() * 4)];
    const backgroundCard = this.createCardElement({
      category: backgroundCategory,
      text: this.getRandomQuestion(backgroundCategory)
    }, 'next', true);
    this.stackContainer.append(backgroundCard, nextCard);
    this.activeCard = nextCard;
    this.activeCardCategory = category;
    this.bindCardGesture(nextCard);
    this.updateAmbientGlow(category);
    this.setLevelUpTargetMode(false);

    setTimeout(() => {
      nextCard.classList.remove('face-down');
      sounds.playSnapBack();
    }, 100);
    setTimeout(() => {
      oldCard.remove();
      nextCard.classList.remove('card-entering');
      this.isAnimating = false;
      if (direction === 'right') this.showToast('Level up!');
    }, 480);
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
      text: this.getRandomQuestion(initialCategory),
      showCustomise: true
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
    card.dataset.cardType = data.cardType || 'question';
    card.dataset.fullText = data.text;
    if (data.showCustomise) card.classList.add('intro-card');
    if (data.doneIt) card.dataset.doneIt = 'true';
    card.style.setProperty('--active-card-color', cat.color);
    card.style.setProperty('--active-card-glow', cat.glow);

    const cleanQuestion = data.text.replace(/^Never have I ever /i, '');

    card.innerHTML = `
      <div class="card-inner">
        <!-- Front Face (Question statement) -->
        <div class="card-face card-front">
          <div class="card-ambient-tint"></div>
          
          <!-- Direction Stamp Indicators -->
          <div class="swipe-stamp stamp-top">${this.getCategoryEmoji('spicy')} ${this.getCategoryName('spicy').toUpperCase()} NEXT</div>
          <div class="swipe-stamp stamp-left">😳 CRINGE NEXT</div>
          <div class="swipe-stamp stamp-right">🥳 PARTY NEXT</div>
          <div class="swipe-stamp stamp-bottom">😇 WHOLESOME NEXT</div>

          <!-- Card category label and decorative emoji -->
          <div class="card-header">
            <div class="category-tag" style="color: ${cat.color};">
              <span class="cat-tag-name">${this.getCardCategoryName(data.category)}</span>
            </div>
          </div>
          <div class="category-watermark" aria-hidden="true">
            <span class="cat-tag-emoji">${this.getCategoryEmoji(data.category)}</span>
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
              <button class="customise-btn" type="button" aria-label="Customize cards with AI">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.8 13.9 9l6.3 2-6.3 2-1.9 6.2L10.1 13 3.8 11l6.3-2L12 2.8Z" />
                  <path d="m19 14 .9 2.4 2.3.8-2.3.8L19 20.5l-.8-2.5-2.4-.8 2.4-.8.8-2.4Z" />
                </svg>
                <span>CUSTOMIZE</span>
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
      if (this.isAnimating || this.isCelebrating) return;
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

      // The level-up prompt accepts only horizontal choices.
      let direction = null;
      if (card.dataset.cardType === 'level-up') {
        if (Math.abs(dx) > 25 && Math.abs(dx) >= Math.abs(dy)) {
          direction = dx > 0 ? 'right' : 'left';
        }
      } else if (dist > 25) {
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
        if (card.dataset.cardType === 'level-up' && dir !== 'left' && dir !== 'right') continue;
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
    if (card.dataset.cardType === 'level-up') {
      this.setLevelUpAnticipation(direction === 'right' && dist > 25, card);
    }

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

  setLevelUpAnticipation(isActive, card = this.activeCard) {
    if (card?.dataset.cardType !== 'level-up') return;
    const wasActive = card.classList.contains('level-up-anticipating');
    card.classList.toggle('level-up-anticipating', isActive);
    if (isActive && !wasActive && Date.now() - this.lastLevelUpNoiseAt >= 600) {
      this.lastLevelUpNoiseAt = Date.now();
      sounds.playAnticipation();
    }
  }

  resetCardPosition(card) {
    this.setLevelUpAnticipation(false, card);
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
    if (this.isAnimating || this.isCelebrating || !this.activeCard) return;
    if (this.activeCard.dataset.cardType === 'level-up') {
      this.resolveLevelUp(direction);
      return;
    }
    this.swipeCount += 1;
    this.queueLevelUpPromptIfEligible();
    this.isAnimating = true;
    this.resetIdleHint();
    if (direction === 'top' && this.spicyLevel === 'unhinged') {
      clearTimeout(this.screenShakeTimer);
      document.body.classList.remove('unhinged-screen-shake');
      void document.body.offsetWidth;
      document.body.classList.add('unhinged-screen-shake');
      this.screenShakeTimer = setTimeout(() => {
        document.body.classList.remove('unhinged-screen-shake');
        this.screenShakeTimer = null;
      }, 450);
    }

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
      faceDown: this.activeCard.classList.contains('face-down'),
      doneIt: this.activeCard.dataset.doneIt === 'true'
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
        catTagName.textContent = this.getCardCategoryName(nextCategory);
        catTagEmoji.textContent = this.getCategoryEmoji(nextCategory);
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
      if (this.restartRequested) {
        this.restartGame();
      } else if (this.levelUpPromptPending) {
        this.levelUpPromptPending = false;
        this.showLevelUpCard();
      }
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
    this.swipeCount = 0;
    this.doneItCount = 0;
    this.levelUpPromptShown = false;
    this.levelUpPromptPending = false;
    this.setLevelUpTargetMode(false);
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

  restartAtDefaultLevel() {
    if (this.isCelebrating) return;

    try {
      localStorage.setItem('never-have-ai-ever-spicy-level', 'spicy');
    } catch (error) {
      console.error('Unable to reset the card intensity level.', error);
      this.showToast('Could not reset card intensity.');
      return;
    }

    this.spicyLevel = 'spicy';
    this.questions.spicy = [...SPICY_QUESTION_LEVELS.spicy];
    this.customiseModal.querySelectorAll('.customise-audience-option').forEach((option) => {
      option.setAttribute('aria-pressed', 'false');
    });
    this.customiseModal.querySelector('.customise-group-description').value = '';
    this.updateSpicyLevelPresentation();
    this.reshuffleGame();
  }

  undoLastCard() {
    if (this.isCelebrating) return;
    if (this.isAnimating || this.cardHistory.length === 0) {
      this.showToast("Can't undo");
      return;
    }
    this.isAnimating = true;

    const prevCardData = this.cardHistory[this.cardHistory.length - 1];
    if (prevCardData.cardType === 'level-up' && prevCardData.spicyLevel !== this.spicyLevel) {
      try {
        localStorage.setItem('never-have-ai-ever-spicy-level', prevCardData.spicyLevel);
      } catch (error) {
        console.error('Unable to restore the previous card intensity level.', error);
        this.showToast('Could not restore the previous card intensity.');
        this.isAnimating = false;
        return;
      }
      this.spicyLevel = prevCardData.spicyLevel;
      this.questions.spicy = [...SPICY_QUESTION_LEVELS[this.spicyLevel]];
      this.updateSpicyLevelPresentation();
    }

    this.cardHistory.pop();
    const restoredCard = prevCardData.cardType === 'level-up'
      ? this.createLevelUpCardElement(prevCardData)
      : this.createCardElement(prevCardData, 'current', prevCardData.faceDown);
    if (prevCardData.cardType === 'level-up') {
      restoredCard.classList.remove('face-down');
      this.levelUpPromptShown = true;
    }

    restoredCard.style.transition = 'none';
    restoredCard.style.transform = 'translate3d(0, -500px, 0) scale(0.9)';
    restoredCard.style.opacity = '0';

    this.stackContainer.appendChild(restoredCard);
    this.stackContainer.querySelectorAll('.game-card.next').forEach(card => card.remove());

    if (this.activeCard) {
      this.activeCard.className = 'game-card next face-down';
      this.activeCard.style.transform = 'scale(0.985) translateY(-5px)';
    }

    restoredCard.offsetHeight;

    restoredCard.style.transition = 'transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.35s ease';
    restoredCard.style.transform = 'translate3d(0, 0, 0) scale(1)';
    restoredCard.style.opacity = '1';

    this.activeCard = restoredCard;
    this.levelUpReturnCategory = prevCardData.returnCategory || this.levelUpReturnCategory;
    this.activeCardCategory = prevCardData.cardType === 'level-up'
      ? this.levelUpReturnCategory
      : prevCardData.category;
    this.updateAmbientGlow(this.activeCardCategory);
    this.setLevelUpTargetMode(prevCardData.cardType === 'level-up');
    this.bindCardGesture(this.activeCard);
    this.resetIdleHint();

    sounds.playSwoosh('bottom');
    this.showToast('Undo');

    setTimeout(() => {
      this.isAnimating = false;
      if (this.restartRequested) this.restartGame();
    }, 460);
  }

  handleTargetTap(direction) {
    this.resetIdleHint();
    if (this.isAnimating || this.isCelebrating || !this.activeCard) return;
    if (this.activeCard.dataset.cardType === 'level-up' && direction !== 'left' && direction !== 'right') return;

    sounds.init();
    const targetBtn = this.targetButtons[direction];
    if (targetBtn) {
      targetBtn.classList.add('highlight');
      setTimeout(() => targetBtn.classList.remove('highlight'), 300);
    }

    this.executeSwipe(direction);
  }

  popKeyboardTargetArrow(direction) {
    const arrow = this.targetButtons[direction]?.querySelector('.arrow-indicator');
    if (!arrow) return;

    arrow.classList.remove('keyboard-pop');
    void arrow.offsetWidth;
    arrow.classList.add('keyboard-pop');
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
    const openCustomiseModal = () => {
      this.updateSpicyLevelPreview(this.spicyLevel);
      const descriptionField = this.customiseModal.querySelector('.customise-group-description');
      descriptionField.placeholder = groupDescriptionExamples[nextGroupDescriptionExample];
      nextGroupDescriptionExample = (nextGroupDescriptionExample + 1) % groupDescriptionExamples.length;
      this.customiseModal.classList.add('active');
      this.customiseModal.querySelector('.customise-modal-close').focus();
    };

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
        openCustomiseModal();
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
      const selectedLevelIndex = Number(this.customiseModal.querySelector('.customise-level-slider').value);
      const selectedLevel = SPICY_LEVELS[selectedLevelIndex];
      if (!selectedLevel) {
        this.showToast('Choose a card intensity level before saving.');
        return;
      }

      try {
        localStorage.setItem('never-have-ai-ever-spicy-level', selectedLevel);
      } catch (error) {
        console.error('Unable to save the card intensity level.', error);
        this.showToast('Could not save your card intensity level.');
        return;
      }

      const levelChanged = selectedLevel !== this.spicyLevel;
      this.spicyLevel = selectedLevel;
      this.updateSpicyLevelPresentation();
      if (levelChanged) {
        this.questions.spicy = [...SPICY_QUESTION_LEVELS[selectedLevel]];
      }
      this.showToast('New level');
      closeCustomiseModal();
      this.reshuffleGame();
    });
    const levelSlider = this.customiseModal.querySelector('.customise-level-slider');
    levelSlider.addEventListener('input', () => {
      const level = SPICY_LEVELS[Number(levelSlider.value)];
      if (level) this.updateSpicyLevelPreview(level);
    });
    window.addEventListener('resize', () => {
      const level = SPICY_LEVELS[Number(levelSlider.value)];
      if (level) this.updateSpicyLevelPreview(level);
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
    this.targetButtons.right.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'mouse' && this.activeCard?.dataset.cardType === 'level-up') {
        this.setLevelUpAnticipation(true);
      }
    });
    this.targetButtons.right.addEventListener('pointerleave', (event) => {
      if (
        event.pointerType === 'mouse' &&
        this.activeCard?.dataset.cardType === 'level-up' &&
        (!this.isDragging || this.currentDominantDirection !== 'right')
      ) {
        this.setLevelUpAnticipation(false);
      }
    });

    // Sound Toggle
    this.soundToggleBtn.addEventListener('click', () => {
      const isEnabled = sounds.toggle();
      this.updateSoundTogglePresentation(isEnabled);
      sounds.playClick();
      this.showToast(isEnabled ? 'Sound ON' : 'Muted');
    });

    document.getElementById('undo-btn').addEventListener('click', () => this.undoLastCard());
    document.getElementById('reshuffle-btn').addEventListener('click', () => this.restartAtDefaultLevel());

    // Info Modal
    const infoBtn = document.getElementById('info-btn');
    const closeInfoBtn = document.getElementById('close-info-btn');
    const infoCustomiseBtn = document.getElementById('info-customise-btn');
    const infoLetsPlayBtn = document.getElementById('info-lets-play-btn');
    infoBtn.addEventListener('click', () => {
      sounds.playClick();
      this.infoModal.classList.add('active');
    });
    infoCustomiseBtn.addEventListener('click', () => {
      sounds.playClick();
      this.infoModal.classList.remove('active');
      openCustomiseModal();
    });
    infoLetsPlayBtn.addEventListener('click', () => {
      this.infoModal.classList.remove('active');
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
          this.popKeyboardTargetArrow('top');
          this.handleTargetTap('top');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.popKeyboardTargetArrow('left');
          this.handleTargetTap('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.popKeyboardTargetArrow('right');
          this.handleTargetTap('right');
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.popKeyboardTargetArrow('bottom');
          this.handleTargetTap('bottom');
          break;
        case ' ':
          e.preventDefault();
          if (this.activeCard?.dataset.cardType === 'level-up') break;
          const dirs = ['top', 'left', 'right', 'bottom'];
          const direction = dirs[Math.floor(Math.random() * dirs.length)];
          this.popKeyboardTargetArrow(direction);
          this.handleTargetTap(direction);
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
