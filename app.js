import { CATEGORIES, QUESTIONS } from './questions.js';
import { sounds } from './sound.js';
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
    this.fingersRemaining = 10;
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.currentTranslate = { x: 0, y: 0 };
    this.isAnimating = false;
    this.currentDominantDirection = null;
    this.hasVibratedThreshold = false;
    this.cardHistory = []; // Store past cards for undo feature

    // Players feature (Pass the phone)
    this.players = [];
    this.currentPlayerIdx = 0;

    // DOM Elements
    this.stackContainer = document.getElementById('card-stack');
    this.targetButtons = {
      top: document.getElementById('target-top'),
      left: document.getElementById('target-left'),
      right: document.getElementById('target-right'),
      bottom: document.getElementById('target-bottom')
    };
    this.soundToggleBtn = document.getElementById('sound-toggle-btn');
    this.fingerTrackerBtn = document.getElementById('finger-tracker-btn');
    this.fingerCountEl = document.getElementById('finger-count');
    this.ambientGlow = document.getElementById('ambient-glow');
    this.playerTurnPill = document.getElementById('player-turn-pill');

    // Modals
    this.infoModal = document.getElementById('info-modal');
    this.customModal = document.getElementById('custom-modal');
    this.gameOverModal = document.getElementById('gameover-modal');
    this.playersModal = document.getElementById('players-modal');
    this.toastEl = document.getElementById('toast');

    this.init();
  }

  // Dynamic responsive threshold adapted to mobile screen dimensions
  getSwipeThreshold() {
    const minDim = Math.min(window.innerWidth, window.innerHeight);
    return Math.max(55, Math.min(80, minDim * 0.18));
  }

  loadQuestions() {
    const savedCustom = localStorage.getItem('nhie_custom_questions');
    const custom = savedCustom ? JSON.parse(savedCustom) : { spicy: [], cringe: [], party: [], wholesome: [] };

    return {
      spicy: [...QUESTIONS.spicy, ...(custom.spicy || [])],
      cringe: [...QUESTIONS.cringe, ...(custom.cringe || [])],
      party: [...QUESTIONS.party, ...(custom.party || [])],
      wholesome: [...QUESTIONS.wholesome, ...(custom.wholesome || [])]
    };
  }

  saveCustomQuestion(category, text) {
    if (!text.trim()) return;
    const savedCustom = localStorage.getItem('nhie_custom_questions');
    const custom = savedCustom ? JSON.parse(savedCustom) : { spicy: [], cringe: [], party: [], wholesome: [] };
    if (!custom[category]) custom[category] = [];
    custom[category].push(text.trim());
    localStorage.setItem('nhie_custom_questions', JSON.stringify(custom));
    this.questions[category].push(text.trim());
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
    this.loadSavedPlayers();
    this.renderInitialDeck();
    this.bindEvents();
    this.bindKeyboard();
    this.updateAmbientGlow(this.activeCardCategory);
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

  updateAmbientGlow(category) {
    const catData = Object.values(this.categories).find(c => c.id === category);
    if (catData && this.ambientGlow) {
      this.ambientGlow.style.background = `radial-gradient(circle, ${catData.glow} 0%, rgba(10, 11, 16, 0.4) 60%, transparent 75%)`;
    }
  }

  renderInitialDeck() {
    this.stackContainer.innerHTML = '';

    const initialCategory = 'spicy';
    const cardData1 = {
      category: initialCategory,
      text: this.getRandomQuestion(initialCategory),
      number: this.cardCount
    };
    const cardData2 = {
      category: 'party',
      text: this.getRandomQuestion('party'),
      number: this.cardCount + 1
    };
    const cardData3 = {
      category: 'wholesome',
      text: this.getRandomQuestion('wholesome'),
      number: this.cardCount + 2
    };

    const card3 = this.createCardElement(cardData3, 'third');
    const card2 = this.createCardElement(cardData2, 'next');
    const card1 = this.createCardElement(cardData1, 'current');

    this.stackContainer.appendChild(card3);
    this.stackContainer.appendChild(card2);
    this.stackContainer.appendChild(card1);

    this.activeCard = card1;
    this.activeCardCategory = initialCategory;
    this.bindCardGesture(this.activeCard);
    this.updatePlayerTurnDisplay();
  }

  createCardElement(data, stackClass = 'next') {
    const cat = Object.values(this.categories).find(c => c.id === data.category) || this.categories.top;

    const card = document.createElement('div');
    card.className = `game-card ${stackClass}`;
    card.dataset.category = data.category;
    card.dataset.fullText = data.text;
    card.style.setProperty('--active-card-color', cat.color);

    const cleanQuestion = data.text.replace(/^Never have I ever /i, '');

    card.innerHTML = `
      <div class="card-ambient-tint"></div>
      
      <!-- Direction Stamp Indicators -->
      <div class="swipe-stamp stamp-top">😈 SPICY NEXT</div>
      <div class="swipe-stamp stamp-left">😳 CRINGE NEXT</div>
      <div class="swipe-stamp stamp-right">🥳 PARTY NEXT</div>
      <div class="swipe-stamp stamp-bottom">😇 WHOLESOME NEXT</div>

      <!-- Card Top Bar -->
      <div class="card-header">
        <div class="category-tag" style="border-color: ${cat.color}66; color: ${cat.color};">
          <span class="cat-tag-emoji">${cat.emoji}</span>
          <span class="cat-tag-name">${cat.name}</span>
        </div>
        <div class="card-top-right">
          <button class="copy-card-btn" title="Copy question to clipboard" aria-label="Copy question">
            📋
          </button>
          <span class="card-number">#${data.number}</span>
        </div>
      </div>

      <!-- Card Body Statement -->
      <div class="card-body">
        <div class="prompt-prefix">Never Have I Ever...</div>
        <div class="prompt-text">${cleanQuestion}</div>
      </div>

      <!-- Card Interactive Reactions -->
      <div class="card-footer">
        <button class="reaction-btn btn-have" title="I Have Done This!">
          <span class="react-emoji">🙋</span>
          <span>I Have!</span>
          <span class="react-count have-count">0</span>
        </button>
        <button class="reaction-btn btn-never" title="Never Done This!">
          <span class="react-emoji">🙅</span>
          <span>Never!</span>
          <span class="react-count never-count">0</span>
        </button>
      </div>
    `;

    // Bind Reaction button events
    const btnHave = card.querySelector('.btn-have');
    const btnNever = card.querySelector('.btn-never');
    const countHave = card.querySelector('.have-count');
    const countNever = card.querySelector('.never-count');
    const btnCopy = card.querySelector('.copy-card-btn');

    let haveCount = 0;
    let neverCount = 0;

    btnHave.addEventListener('click', (e) => {
      e.stopPropagation();
      haveCount++;
      countHave.textContent = haveCount;
      sounds.playIHave();
      
      if ('vibrate' in navigator) {
        try { navigator.vibrate(18); } catch (err) {}
      }

      const rect = btnHave.getBoundingClientRect();
      this.confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 28, [cat.color, '#ff3366', '#ffd43b', '#20c997']);
      
      this.decrementFinger();
    });

    btnNever.addEventListener('click', (e) => {
      e.stopPropagation();
      neverCount++;
      countNever.textContent = neverCount;
      sounds.playNever();

      if ('vibrate' in navigator) {
        try { navigator.vibrate(12); } catch (err) {}
      }

      btnNever.style.transform = 'scale(1.12)';
      setTimeout(() => btnNever.style.transform = '', 150);
    });

    btnCopy.addEventListener('click', (e) => {
      e.stopPropagation();
      const textToCopy = `Never have I ever ${cleanQuestion}`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        this.showToast('Question copied to clipboard! 📋');
        sounds.playClick();
      }).catch(() => {
        this.showToast('Copied: ' + textToCopy);
      });
    });

    return card;
  }

  bindCardGesture(card) {
    if (!card) return;

    let currentPointerId = null;

    const onPointerDown = (e) => {
      if (this.isAnimating) return;
      if (e.target.closest('.card-footer') || e.target.closest('button')) return;

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

      // Prevent mobile page rubber-banding / browser scroll
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
        const angle = Math.atan2(dy, dx) * (180 / Math.PI); // -180 to +180 deg
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

      const threshold = this.getSwipeThreshold();
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

    const stamps = card.querySelectorAll('.swipe-stamp');
    stamps.forEach(s => s.style.opacity = '0');

    Object.values(this.targetButtons).forEach(btn => btn.classList.remove('highlight'));
    sounds.playSnapBack();
  }

  executeSwipe(direction) {
    if (this.isAnimating || !this.activeCard) return;
    this.isAnimating = true;

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
      number: this.cardCount
    });
    if (this.cardHistory.length > 15) this.cardHistory.shift();

    sounds.playCategorySound(direction);
    if ('vibrate' in navigator) {
      try { navigator.vibrate([20, 30, 20]); } catch (e) {}
    }

    this.advancePlayerTurn();

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

    this.activeCard.style.transition = 'transform 0.42s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.35s ease-out';
    this.activeCard.style.transform = `translate3d(${exitX}px, ${exitY}px, 0) rotate(${exitRotation}deg)`;
    this.activeCard.style.opacity = '0';

    Object.values(this.targetButtons).forEach(btn => btn.classList.remove('highlight'));

    const oldCard = this.activeCard;
    const nextCard = this.stackContainer.querySelector('.game-card.next');
    const thirdCard = this.stackContainer.querySelector('.game-card.third');

    if (nextCard) {
      nextCard.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.35s ease';
      nextCard.className = 'game-card current';
      nextCard.style.pointerEvents = 'auto';
      nextCard.style.filter = 'none';

      const cat = Object.values(this.categories).find(c => c.id === nextCategory);
      const newQuestion = this.getRandomQuestion(nextCategory);
      nextCard.dataset.category = nextCategory;
      nextCard.dataset.fullText = newQuestion;
      nextCard.style.setProperty('--active-card-color', cat.color);

      const catTagEmoji = nextCard.querySelector('.cat-tag-emoji');
      const catTagName = nextCard.querySelector('.cat-tag-name');
      const catTag = nextCard.querySelector('.category-tag');
      if (catTag && catTagEmoji && catTagName) {
        catTag.style.borderColor = `${cat.color}66`;
        catTag.style.color = cat.color;
        catTagEmoji.textContent = cat.emoji;
        catTagName.textContent = cat.name;
      }

      const promptText = nextCard.querySelector('.prompt-text');
      if (promptText) {
        promptText.textContent = newQuestion.replace(/^Never have I ever /i, '');
      }

      this.updateAmbientGlow(nextCategory);
      this.activeCardCategory = nextCategory;
    }

    if (thirdCard) {
      thirdCard.className = 'game-card next';
      thirdCard.style.transition = 'transform 0.4s ease, opacity 0.35s ease';
    }

    this.cardCount++;
    const randomBackgroundCat = ['spicy', 'cringe', 'party', 'wholesome'][Math.floor(Math.random() * 4)];
    const newThirdCard = this.createCardElement({
      category: randomBackgroundCat,
      text: this.getRandomQuestion(randomBackgroundCat),
      number: this.cardCount + 2
    }, 'third');
    this.stackContainer.insertBefore(newThirdCard, this.stackContainer.firstChild);

    setTimeout(() => {
      if (oldCard && oldCard.parentNode) {
        oldCard.remove();
      }
      this.activeCard = nextCard;
      if (this.activeCard) {
        this.bindCardGesture(this.activeCard);
      }
      this.isAnimating = false;
    }, 450);
  }

  undoLastCard() {
    if (this.isAnimating || this.cardHistory.length === 0) {
      this.showToast('No previous card to undo!');
      return;
    }
    this.isAnimating = true;

    const prevCardData = this.cardHistory.pop();
    const restoredCard = this.createCardElement(prevCardData, 'current');

    restoredCard.style.transition = 'none';
    restoredCard.style.transform = 'translate3d(0, -500px, 0) scale(0.9)';
    restoredCard.style.opacity = '0';

    this.stackContainer.appendChild(restoredCard);

    if (this.activeCard) {
      this.activeCard.className = 'game-card next';
    }

    restoredCard.offsetHeight;

    restoredCard.style.transition = 'transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.35s ease';
    restoredCard.style.transform = 'translate3d(0, 0, 0) scale(1)';
    restoredCard.style.opacity = '1';

    this.activeCard = restoredCard;
    this.activeCardCategory = prevCardData.category;
    this.updateAmbientGlow(prevCardData.category);
    this.bindCardGesture(this.activeCard);

    sounds.playSwoosh('bottom');
    this.showToast('Restored previous card ↺');

    setTimeout(() => {
      this.isAnimating = false;
    }, 460);
  }

  handleTargetTap(direction) {
    if (this.isAnimating || !this.activeCard) return;

    sounds.init();
    const targetBtn = this.targetButtons[direction];
    if (targetBtn) {
      targetBtn.classList.add('highlight');
      setTimeout(() => targetBtn.classList.remove('highlight'), 300);
    }

    this.executeSwipe(direction);
  }

  loadSavedPlayers() {
    const saved = localStorage.getItem('nhie_players');
    if (saved) {
      try {
        this.players = JSON.parse(saved);
      } catch (e) {
        this.players = [];
      }
    }
  }

  savePlayers() {
    localStorage.setItem('nhie_players', JSON.stringify(this.players));
    this.updatePlayerTurnDisplay();
  }

  advancePlayerTurn() {
    if (this.players.length > 0) {
      this.currentPlayerIdx = (this.currentPlayerIdx + 1) % this.players.length;
      this.updatePlayerTurnDisplay();
    }
  }

  updatePlayerTurnDisplay() {
    if (!this.playerTurnPill) return;
    if (this.players.length > 0) {
      const p = this.players[this.currentPlayerIdx];
      this.playerTurnPill.innerHTML = `👤 Turn: <strong>${p}</strong>`;
      this.playerTurnPill.style.display = 'inline-flex';
    } else {
      this.playerTurnPill.style.display = 'none';
    }
  }

  decrementFinger() {
    if (this.fingersRemaining > 0) {
      this.fingersRemaining--;
      this.fingerCountEl.textContent = this.fingersRemaining;
      
      this.fingerTrackerBtn.style.transform = 'scale(1.22)';
      setTimeout(() => this.fingerTrackerBtn.style.transform = '', 200);

      if (this.fingersRemaining === 0) {
        this.triggerGameOver();
      }
    }
  }

  resetFingers() {
    this.fingersRemaining = 10;
    this.fingerCountEl.textContent = '10';
  }

  triggerGameOver() {
    this.confetti.burst(window.innerWidth / 2, window.innerHeight / 2, 75, ['#ff2d75', '#ff922b', '#20c997', '#ffd43b']);
    setTimeout(() => {
      this.gameOverModal.classList.add('active');
    }, 400);
  }

  bindEvents() {
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

    // Finger Tracker Button
    this.fingerTrackerBtn.addEventListener('click', () => {
      if (this.fingersRemaining > 0) {
        this.decrementFinger();
        sounds.playIHave();
      } else {
        this.resetFingers();
        sounds.playClick();
        this.showToast('Reset to 10 Fingers 🖐️');
      }
    });

    // Undo Button
    const undoBtn = document.getElementById('undo-btn');
    if (undoBtn) {
      undoBtn.addEventListener('click', () => this.undoLastCard());
    }

    // Shuffle Button
    const shuffleBtn = document.getElementById('shuffle-btn');
    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', () => {
        const dirs = ['top', 'left', 'right', 'bottom'];
        const randomDir = dirs[Math.floor(Math.random() * dirs.length)];
        this.handleTargetTap(randomDir);
      });
    }

    // Players Modal
    const playersBtn = document.getElementById('players-btn');
    const closePlayersBtn = document.getElementById('close-players-btn');
    const addPlayerForm = document.getElementById('add-player-form');
    const playerListEl = document.getElementById('player-list');

    const renderPlayersList = () => {
      if (!playerListEl) return;
      playerListEl.innerHTML = '';
      if (this.players.length === 0) {
        playerListEl.innerHTML = '<p style="color: #64748b; font-size: 0.85rem; text-align: center; padding: 10px;">No players added yet. Add names below to enable pass-the-phone mode!</p>';
        return;
      }
      this.players.forEach((p, idx) => {
        const div = document.createElement('div');
        div.className = 'player-chip';
        div.innerHTML = `
          <span>👤 ${p}</span>
          <button type="button" class="del-player-btn" data-index="${idx}">✕</button>
        `;
        playerListEl.appendChild(div);
      });

      playerListEl.querySelectorAll('.del-player-btn').forEach(b => {
        b.addEventListener('click', (e) => {
          const idx = parseInt(e.currentTarget.dataset.index, 10);
          this.players.splice(idx, 1);
          this.savePlayers();
          renderPlayersList();
        });
      });
    };

    if (playersBtn && this.playersModal) {
      playersBtn.addEventListener('click', () => {
        sounds.playClick();
        renderPlayersList();
        this.playersModal.classList.add('active');
      });
    }

    if (closePlayersBtn && this.playersModal) {
      closePlayersBtn.addEventListener('click', () => {
        sounds.playClick();
        this.playersModal.classList.remove('active');
      });
    }

    if (addPlayerForm) {
      addPlayerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('player-name-input');
        const name = input.value.trim();
        if (name && !this.players.includes(name)) {
          this.players.push(name);
          input.value = '';
          this.savePlayers();
          renderPlayersList();
          sounds.playClick();
        }
      });
    }

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

    // Custom Question Modal
    const customBtn = document.getElementById('custom-btn');
    const closeCustomBtn = document.getElementById('close-custom-btn');
    const customForm = document.getElementById('custom-card-form');

    customBtn.addEventListener('click', () => {
      sounds.playClick();
      this.customModal.classList.add('active');
    });
    closeCustomBtn.addEventListener('click', () => {
      sounds.playClick();
      this.customModal.classList.remove('active');
    });

    customForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const catSelect = document.getElementById('custom-cat-select');
      const textInput = document.getElementById('custom-text-input');

      const cat = catSelect.value;
      const text = textInput.value;

      if (text.trim()) {
        this.saveCustomQuestion(cat, text);
        textInput.value = '';
        this.customModal.classList.remove('active');
        sounds.playPartySound(sounds.ctx ? sounds.ctx.currentTime : 0);
        this.confetti.burst();
        this.showToast('Custom card added to deck! 🎉');
      }
    });

    // Game Over Reset
    const resetGameBtn = document.getElementById('reset-game-btn');
    resetGameBtn.addEventListener('click', () => {
      this.resetFingers();
      this.gameOverModal.classList.remove('active');
      sounds.playClick();
    });

    // Close modals on overlay backdrop click
    [this.infoModal, this.customModal, this.gameOverModal, this.playersModal].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.classList.remove('active');
          }
        });
      }
    });
  }

  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
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
        case 'h':
        case 'H':
          if (this.activeCard) {
            const btnHave = this.activeCard.querySelector('.btn-have');
            if (btnHave) btnHave.click();
          }
          break;
        case 'n':
        case 'N':
          if (this.activeCard) {
            const btnNever = this.activeCard.querySelector('.btn-never');
            if (btnNever) btnNever.click();
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
