import { CATEGORIES, QUESTIONS, SPICY_QUESTION_LEVELS, SHOT_DARES, DARE_CATEGORIES } from './questions.js?v=14';
import { sounds } from './sound.js?v=4';
import { ConfettiEngine } from './confetti.js';

// Pacing for classic and who-most-likely cards, in milliseconds. Raise these to slow the deck down.
const GAME_PACE = {
  exitMs: 520,       // the card flies off
  slideMs: 460,      // the next card slides into the middle
  flipDelayMs: 100,  // the next card turns over
  cooldownMs: 0      // no extra wait: swipes can follow quickly
};
const MOST_LIKELY_CATEGORY = {
  id: 'most-likely',
  name: 'Who most likely',
  emoji: '👥',
  color: '#ffd43b',
  glow: 'rgba(255, 212, 59, 0.45)'
};
const GAME_MODE_LABELS = {
  classic: 'Classic',
  'most-likely': 'Who most likely',
  'shot-dare': 'Shots & Dares'
};
// Shot dare: how long each sentence stays on screen before the next one appears
const SHOT_SENTENCE_MS = 6000;
// The Space key cue shown on the widescreen buttons
const KEY_CUE = '<kbd class="key-cue">SPACE</kbd>';
// Order of the deck screen, left to right
const DECK_ORDER = ['classic', 'most-likely', 'shot-dare'];
// Each deck's colour: the deck screen glows in the colour of the selected deck
const DECK_COLORS = { classic: '#9b5de5', 'most-likely': '#ffd43b', 'shot-dare': '#ff2d75' };
// How-to-play text for each context: the deck screen, or the game being played
const INFO_TEXT = {
  tap: {
    deck: 'Swipe sideways across the decks, or tap one. SELECT starts the game.',
    classic: 'Press an emoji button, or drag the card toward one.',
    'most-likely': 'Swipe the card in any direction to go on. Use the arrows and Indeed at the bottom.',
    'shot-dare': 'Tap the buttons below the card. Pick a dare by tapping or swiping the three cards.'
  },
  keys: {
    deck: '← → choose a game, Space to play.',
    classic: 'Arrow keys (↑ Spicy, ← Cringe, → Party, ↓ Wholesome), Spacebar to shuffle, Z to undo.',
    'most-likely': '→ goes on, ← undoes, Space is Indeed. ↑ and ↓ do nothing.',
    'shot-dare': 'Enter or Space presses the button, ← → picks a dare, Enter or Space reveals it.'
  }
};

// Five small white shot glasses for the Shots & Dares card back
const SHOT_GLASS_SVG = '<svg viewBox="0 0 24 24"><path d="M5 4h14l-2 17H7z" /><path d="M6.3 9.5h11.4" /></svg>';

// Swaps first-person words, e.g. "I've" → "you've". Used to reword the existing sentences per game.
function swapPersonWords(text, forms) {
  return text.replace(/\b(I'm|I've|I'd|I'll|I|myself|my|mine|me)\b/g, (match) => forms[match] ?? match);
}
const SHOT_PERSON = { I: 'you', "I'm": "you're", "I've": "you've", "I'd": "you'd", "I'll": "you'll", myself: 'yourself', my: 'your', mine: 'yours', me: 'you' };
const MOST_LIKELY_PERSON = { I: 'they', "I'm": "they're", "I've": "they've", "I'd": "they'd", "I'll": "they'll", myself: 'themselves', my: 'their', mine: 'theirs', me: 'them' };
// "Never have I ever X" becomes "Who's most likely… to have X"; the card shows the prefix and this line
function toMostLikely(text) {
  return `to have ${swapPersonWords(text, MOST_LIKELY_PERSON)}`;
}
// Shot dare: the card reads "Take a shot if…" then "you've ever X"
function toShotBody(text) {
  return `you've ever ${swapPersonWords(text, SHOT_PERSON)}`;
}

const SPICY_LEVELS = ['cheeky', 'spicy', 'unhinged'];
const DONE_IT_REACTION_IMAGES = {
  cheeky: 'images/cheeky.webp',
  spicy: 'images/angel.webp',
  unhinged: 'images/explosion.webp',
  cringe: 'images/akward.webp',
  party: 'images/party.webp',
  wholesome: 'images/angel.webp'
};
// Fluent Emoji 3D artwork (MIT License, Microsoft Corporation; see THIRD_PARTY_LICENSES.md).
// Emoji without a file here stay as text.
const FLUENT_CODES = new Set(['1F319', '1F346', '1F351', '1F354', '1F355', '1F370', '1F374', '1F37A', '1F37B', '1F3A4', '1F3A5', '1F3A7', '1F3AA', '1F3AB', '1F3B2', '1F3B9', '1F3CA', '1F3D3', '1F3E0', '1F3EB', '1F446', '1F446_1F3FB', '1F446_1F3FC', '1F446_1F3FD', '1F446_1F3FE', '1F446_1F3FF', '1F44B', '1F451', '1F457', '1F45A', '1F45E', '1F465', '1F468', '1F47B', '1F480', '1F483', '1F48A', '1F48B', '1F48E', '1F494', '1F4A5', '1F4A8', '1F4A9', '1F4AC', '1F4B3', '1F4B8', '1F4BB', '1F4BC', '1F4DA', '1F4DD', '1F4DE', '1F4E2', '1F4E7', '1F4F1', '1F4F2', '1F504', '1F50D', '1F511', '1F51E', '1F525', '1F57A', '1F607', '1F608', '1F60E', '1F610', '1F633', '1F634', '1F648', '1F64B', '1F695', '1F6A6', '1F6A8', '1F6AA', '1F6AB', '1F6BB', '1F6CC', '1F918', '1F925', '1F927', '1F92A', '1F92F', '1F938', '1F943', '1F94A', '1F964', '1F973', '1F974', '1F376', '1F3AF', '1F3AD', '1F984', '1F9A0', '1F9B6', '1F9B7', '1F9E5', '1F9E9', '1F9ED', '1F9F9', '1FA9E', '1FAA2', '1FAAA', '2615']);
const SKIN_TONE_HEX = new Set(['1F3FB', '1F3FC', '1F3FD', '1F3FE', '1F3FF']);

// Turns emoji text into markup, using artwork where a file exists.
// A base emoji followed by a skin-tone modifier uses the matching tone file when there is one.
function emojiMarkup(text) {
  const chars = [...text];
  let html = '';
  for (let i = 0; i < chars.length; i += 1) {
    const ch = chars[i];
    const hex = ch.codePointAt(0).toString(16).toUpperCase();
    if (ch === '\uFE0F' || SKIN_TONE_HEX.has(hex)) continue; // variation selectors and stray tones
    const nextHex = chars[i + 1] ? chars[i + 1].codePointAt(0).toString(16).toUpperCase() : '';
    const tonedKey = `${hex}_${nextHex}`;
    if (SKIN_TONE_HEX.has(nextHex) && FLUENT_CODES.has(tonedKey)) {
      html += `<img class="emoji-img" src="images/fluent/${tonedKey}.webp" alt="${ch}">`;
      i += 1;
    } else if (FLUENT_CODES.has(hex)) {
      html += `<img class="emoji-img" src="images/fluent/${hex}.webp" alt="${ch}">`;
    } else {
      html += ch;
    }
  }
  return html;
}

// The dare card back: a checkerboard of the category emoji, big and small
// alternating like a quincunx pattern (sizes live in piles.css). The cell count
// follows the card's shape — portrait cards on desktop use fewer, much bigger
// cells; the flat phone cards need twice the columns to keep cells near-square.
// Every emoji keeps its grid position but is oversized so neighbours overlap,
// and each gets its own random tilt (rotate around its centre, --rot).
function dareCardPattern(emojiText) {
  const emoji = emojiMarkup(emojiText);
  const flat = window.matchMedia('(max-width: 719px)').matches;
  const cols = flat ? 10 : 6;
  const rows = flat ? 5 : 8;
  const tilt = () => (Math.random() * 24 - 12).toFixed(1);
  let html = '';
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      html += (r + c) % 2 === 0
        ? `<span class="dare-pattern-big" style="--rot: ${tilt()}deg">${emoji}</span>`
        : `<span class="dare-pattern-small" style="--rot: ${tilt()}deg">${emoji}</span>`;
    }
  }
  return html;
}

const AGE_GATE_KEY = 'never-have-ai-ever-age-confirmed';
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
  unhinged: '💀'
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
      wholesome: new Set(),
      'most-likely': new Set()
    };

    // Game mode: chosen on the mode screen each visit (not saved, like the intensity)
    this.gameMode = 'classic';
    this.pendingMode = 'classic';
    this.setupStep = false;
    this.setupDone = false;
    this.isScreenFading = false;
    this.shotPhase = 'idle';
    this.shotTimers = [];
    this.dareBag = [];
    this.restartWithShuffle = false;
    this.afterCheers = null;
    this.dareFocus = 1;
    this.currentDare = null;

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
    this.cheersCounterpart = this.cheersOverlay.querySelector('.cheers-counterpart');

    // Modals
    this.infoModal = document.getElementById('info-modal');
    this.customiseModal = document.getElementById('customise-modal');
    this.modeModal = document.getElementById('mode-modal');
    this.toastEl = document.getElementById('toast');

    // Shot dare: the sentence cards and the dare choice
    this.shotSlot = document.getElementById('shot-slot');
    this.shotDares = document.getElementById('shot-dares');
    this.shotDareCards = [...this.shotDares.querySelectorAll('.shot-dare')];
    this.shotAction = document.getElementById('shot-action');
    this.nextPill = document.getElementById('next-pill');
    this.shotCustomise = document.getElementById('shot-customise');
    this.shotActions = document.getElementById('shot-actions');
    this.darePill = document.getElementById('dare-pill');
    // Every game waits at its intro card until START (button, Space, Enter or a first swipe)
    this.awaitingStart = true;

    this.init();
  }

  getSwipeThreshold() {
    const minDim = Math.min(window.innerWidth, window.innerHeight);
    return Math.max(55, Math.min(80, minDim * 0.18));
  }

  // Every visit starts on Cheeky; the intensity isn't remembered between visits
  loadSavedSpicyLevel() {
    return 'cheeky';
  }

  loadQuestions() {
    return {
      spicy: [...SPICY_QUESTION_LEVELS[this.spicyLevel]],
      cringe: [...QUESTIONS.cringe],
      party: [...QUESTIONS.party],
      wholesome: [...QUESTIONS.wholesome]
    };
  }

  // Looks up a category's colours and names, including the who-most-likely deck
  getCategoryData(category) {
    if (category === 'most-likely') return MOST_LIKELY_CATEGORY;
    return Object.values(this.categories).find(c => c.id === category);
  }

  getCategoryName(category) {
    if (category === 'most-likely') return MOST_LIKELY_CATEGORY.name;
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
    if (category === 'most-likely') return MOST_LIKELY_CATEGORY.emoji;
    return category === 'spicy'
      ? SPICY_LEVEL_EMOJIS[this.spicyLevel]
      : Object.values(this.categories).find(c => c.id === category)?.emoji ?? this.categories.top.emoji;
  }

  // The small line above each card's question
  getPromptPrefix(category) {
    return category === 'most-likely' ? "Who's most likely…" : 'Never Have I Ever...';
  }

  // Which category a card gets for a background card, depending on the game mode
  pickBackgroundCategory() {
    if (this.gameMode === 'most-likely') return 'most-likely';
    return ['spicy', 'cringe', 'party', 'wholesome'][Math.floor(Math.random() * 4)];
  }

  updateSpicyLevelPresentation() {
    const topTarget = this.targetButtons.top;
    topTarget.querySelector('.emoji').innerHTML = emojiMarkup(this.getCategoryEmoji('spicy'));
    topTarget.querySelector('.label').textContent = this.getCategoryName('spicy');
    topTarget.title = `Drag UP or Tap for ${this.getCategoryName('spicy')}`;
    document.getElementById('guide-spicy-emoji').innerHTML = emojiMarkup(this.getCategoryEmoji('spicy'));
    document.getElementById('guide-spicy-label').textContent = this.getCategoryName('spicy');
  }

  updateSpicyLevelPreview(level) {
    const slider = this.customiseModal.querySelector('.customise-level-slider');
    const thumb = this.customiseModal.querySelector('.customise-level-thumb');
    const selectedIndex = SPICY_LEVELS.indexOf(level);
    slider.value = String(selectedIndex);
    slider.setAttribute('aria-valuetext', SPICY_LEVEL_LABELS[level]);
    thumb.innerHTML = emojiMarkup(SPICY_LEVEL_EMOJIS[level]);
    thumb.classList.toggle('is-unhinged', level === 'unhinged');
    // Shadow colour follows the gradient position: cheeky green, spicy purple, unhinged red
    const markerGlows = {
      cheeky: ['rgba(56, 217, 169, 0.55)', 'rgba(56, 217, 169, 0.26)'],
      spicy: ['rgba(155, 93, 229, 0.55)', 'rgba(155, 93, 229, 0.26)'],
      unhinged: ['rgba(255, 77, 79, 0.55)', 'rgba(255, 77, 79, 0.26)']
    };
    const [glow, glowSoft] = markerGlows[level];
    thumb.style.setProperty('--marker-glow', glow);
    thumb.style.setProperty('--marker-glow-soft', glowSoft);
    // Centre the thumb over the level's name. The three names sit in equal columns, so this is
    // worked out from the layout (no measuring), and it is right the moment the pop-up appears.
    thumb.style.left = `calc(8px + (100% - 16px) * ${2 * selectedIndex + 1} / 6)`;
    this.customiseModal.querySelectorAll('.customise-level-option').forEach((option, index) => {
      option.classList.toggle('is-current', index === selectedIndex);
    });
  }

  // Who most likely: every deck's sentences (the chosen intensity for the spicy one), worded as "to have…"
  mostLikelyPool() {
    const sources = [
      ['spicy', this.questions.spicy],
      ['cringe', this.questions.cringe],
      ['party', this.questions.party],
      ['wholesome', this.questions.wholesome]
    ];
    return sources.flatMap(([category, list]) => list.map((item) => {
      const text = typeof item === 'string' ? item : item.text;
      const emoji = typeof item === 'string' ? undefined : item.emoji;
      return { text: toMostLikely(text), emoji: emoji ?? this.getCategoryEmoji(category), tagName: this.getCardCategoryName(category), source: category };
    }));
  }

  getRandomQuestion(category) {
    const list = category === 'most-likely' ? this.mostLikelyPool() : this.questions[category];
    const used = this.usedQuestions[category];

    if (used.size >= list.length) {
      used.clear();
    }

    const available = list.filter((_, idx) => !used.has(idx));
    const randomIdx = Math.floor(Math.random() * available.length);
    const chosenQuestion = available[randomIdx];

    const originalIdx = list.indexOf(chosenQuestion);
    used.add(originalIdx);

    // Normalize: allow per-question { text, emoji } objects (cringe) or plain strings (other categories)
    if (chosenQuestion && typeof chosenQuestion === 'object') {
      return { text: chosenQuestion.text, emoji: chosenQuestion.emoji, tagName: chosenQuestion.tagName, source: chosenQuestion.source };
    }
    return { text: chosenQuestion, emoji: undefined, tagName: undefined, source: undefined };
  }

  // Back button (Android and mobile browsers): closes pop-ups, returns to home screen from games.
  setupBackButton() {
    try {
      history.replaceState({ screen: 'home' }, '');
    } catch (_) {}

    window.addEventListener('popstate', () => {
      if (this.ageGateActive) return; // on the age question, back leaves the app

      // If in the optional first-time setup popup, reveal the deck screen underneath
      if (this.setupStep && this.customiseModal.classList.contains('active')) {
        this.cancelSetup();
        return;
      }

      if (this.modeModal.classList.contains('active')) return; // on home screen, back leaves the app

      // If an overlay popup is open (customise from in-game, info modal, etc.), close it first
      const openModal = document.querySelector('.modal-overlay.active:not(#mode-modal)');
      if (openModal) {
        const closeBtn = openModal.querySelector('.modal-close');
        if (closeBtn) closeBtn.click();
        else openModal.classList.remove('active');
        try {
          history.pushState({ screen: 'game', mode: this.gameMode }, '');
        } catch (_) {}
        return;
      }

      // When inside any game, pressing BACK returns to the home screen
      this.goHome();
    });
  }

  // Screen fade-to-black transition
  fadeTransition(action, onComplete) {
    if (this.isScreenFading) {
      if (typeof action === 'function') action();
      if (typeof onComplete === 'function') onComplete();
      return;
    }
    const curtain = document.getElementById('screen-fade-curtain');
    if (!curtain) {
      if (typeof action === 'function') action();
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    this.isScreenFading = true;
    curtain.classList.add('is-faded');

    // Peak black reached (420ms)
    setTimeout(() => {
      try {
        if (typeof action === 'function') action();
      } catch (err) {
        console.error(err);
      }

      // Soft dissolve out from black (400ms)
      requestAnimationFrame(() => {
        curtain.classList.remove('is-faded');
        setTimeout(() => {
          this.isScreenFading = false;
          if (typeof onComplete === 'function') onComplete();
        }, 460);
      });
    }, 440);
  }

  init() {
    this.preloadReactionImages();
    this.registerServiceWorker();
    this.bindInstallPrompt();
    this.updateSpicyLevelPresentation();
    this.updateSoundTogglePresentation(sounds.enabled);
    this.bindEvents();
    this.bindKeyboard();
    this.setupBackButton();
    // Each deck sits on a pile of cards, like the classic deck
    this.modeModal.querySelectorAll('.deck-tile').forEach((tile) => tile.prepend(this.buildDeckLayers()));
    const deckTitle = document.querySelector('.deck-hero-title');
    if (deckTitle) this.addTitleSparkles(deckTitle);
    // The popup Customise buttons share the starter card's purple pill and its sparkles
    const popupCustomiseButtons = [
      document.getElementById('info-customise-btn'),
      this.customiseModal.querySelector('.customise-modal-done'),
    ].filter(Boolean);
    popupCustomiseButtons.forEach((btn) => {
      this.addBorderSparkles(btn, { inset: 3, count: 6, sizeMin: 5, sizeRange: 3, durMin: 7, durRange: 4 });
    });
    // The classic intro card is where the first-time age question lives. Returning
    // visitors start on the deck screen, and their first card is only dealt when a
    // game is chosen — dealing it here put the classic card behind the fading deck
    // backdrop, visible as a flash on every refresh.
    if (this.isAgeConfirmed()) this.openModeSelect();
    else this.renderInitialDeck();
    document.querySelectorAll('.target-btn .emoji, .info-cat-emoji, .deck-emoji, .dare-watermark').forEach((el) => {
      if (!el.children.length) el.innerHTML = emojiMarkup(el.textContent);
    });
    const howToPlayCustomise = document.getElementById('info-customise-btn');
    if (howToPlayCustomise) {
      this.addBorderSparkles(howToPlayCustomise, { inset: 3, count: 6, sizeMin: 5, sizeRange: 3, durMin: 7, durRange: 4 });
    }
    document.querySelectorAll('.shot-customise').forEach((el) => {
      this.addBorderSparkles(el, { inset: 3, count: 6, sizeMin: 5, sizeRange: 3, durMin: 7, durRange: 4 });
    });
    this.targetIntroTimer = setTimeout(() => this.revealTargetButtons(), 2000);
    this.updateAmbientGlow(this.activeCardCategory);
    this.bindIdleHintEvents();
    this.resetIdleHint();
  }

  revealTargetButtons() {
    // While the game waits at the start bar, the targets (and the pill) stay hidden
    if (this.ageGateActive || this.awaitingStart) return;
    const arena = document.querySelector('.game-arena');
    clearTimeout(this.targetHideTimer);
    // Classic widescreen: re-measure the target offsets before showing them
    this.syncClassicTargetAlignment();
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
    const buttons = [this.soundToggleBtn, ...document.querySelectorAll('.deck-sound-btn')];
    buttons.forEach((btn) => this.paintSoundButton(btn, isEnabled));
  }

  paintSoundButton(button, isEnabled) {
    if (!button) return;
    button.innerHTML = isEnabled
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l5 4V6l-5 4H4Z"/><path d="M16 9a5 5 0 0 1 0 6M18.5 6.5a9 9 0 0 1 0 11"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l5 4V6l-5 4H4Z"/><path d="m16 9 5 6m0-6-5 6"/></svg>';
    button.setAttribute('aria-label', isEnabled ? 'Mute sound' : 'Enable sound');
    button.setAttribute('aria-pressed', String(isEnabled));
    button.title = isEnabled ? 'Mute Sound (M)' : 'Enable Sound (M)';
  }

  registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('sw.js').catch((error) => {
      console.error('Service worker registration failed.', error);
    });
  }

  // "Add to Home Screen" row in How to Play. Android/Chrome lets us trigger the install
  // prompt; iPhone has no API, so the row's text explains the Share menu steps instead.
  bindInstallPrompt() {
    const row = document.getElementById('info-install-row');
    const button = document.getElementById('info-install-btn');
    if (!row || !button) return;

    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isInstalled) {
      row.hidden = true;
      return;
    }

    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      deferredPrompt = event;
      button.hidden = false;
    });
    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      row.hidden = true;
    });
    button.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      sounds.playClick();
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      button.hidden = true;
    });
  }

  // Download and decode the DONE IT reaction images in the background at startup,
  // so the first celebration doesn't have to wait for them to load and pop in.
  // Loads and decodes the reaction images and every emoji artwork up front, so nothing
  // pops in mid-game. Emoji artwork is loaded in small batches when the browser is idle.
  preloadReactionImages() {
    const reactionSources = new Set([...Object.values(DONE_IT_REACTION_IMAGES), 'images/devil.webp']);
    this.reactionImageCache = [...reactionSources].map((src) => this.decodeImage(src));

    const emojiSources = [...FLUENT_CODES].map((code) => `images/fluent/${code}.webp`);
    this.emojiImageCache = [];
    const loadBatch = (start) => {
      const batch = emojiSources.slice(start, start + 12);
      this.emojiImageCache.push(...batch.map((src) => this.decodeImage(src)));
      if (start + 12 < emojiSources.length) {
        const next = () => loadBatch(start + 12);
        if ('requestIdleCallback' in window) requestIdleCallback(next);
        else setTimeout(next, 50);
      }
    };
    loadBatch(0);
  }

  decodeImage(src) {
    const img = new Image();
    img.src = src;
    if (img.decode) img.decode().catch(() => {});
    return img;
  }

  celebrateDoneIt() {
    if (this.isCelebrating || !this.activeCard || !this.cheersOverlay) return;

    if (this.activeCard.dataset.doneIt !== 'true') {
      this.activeCard.dataset.doneIt = 'true';
      this.doneItCount += 1;
      this.queueLevelUpPromptIfEligible();
    }

    clearTimeout(this.idleHintTimer);
    this.activeCard.classList.remove('hint-visible');
    // The cheers follow the category the sentence came from (Who most likely draws from every deck)
    const source = this.activeCard.dataset.sourceCategory || this.activeCard.dataset.category;
    const reactionKey = source === 'spicy' ? this.spicyLevel : source;
    this.startCheers(reactionKey);
  }

  // The cheers overlay with its picture, sound, confetti and vibration.
  // Shot dare calls this directly; the card deck calls it through celebrateDoneIt.
  startCheers(reactionKey) {
    if (this.isCelebrating || !this.cheersOverlay) return;
    this.isCelebrating = true;
    this.cheersCounterpart.src = DONE_IT_REACTION_IMAGES[reactionKey] ?? DONE_IT_REACTION_IMAGES.spicy;
    this.cheersCounterpart.className = 'cheers-image cheers-counterpart';
    if (['cheeky', 'unhinged', 'cringe', 'party'].includes(reactionKey)) {
      this.cheersCounterpart.classList.add('cheers-reaction--big');
    }
    this.cheersOverlay.classList.add('active');
    this.cheersOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('celebration-shake');

    this.cheersTimer = setTimeout(() => this.finishCheersCelebration(), 2750);
    // Start the audio from this tap, so the cheers are not held back by the browser
    sounds.init();
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
    if (this.afterCheers) {
      const next = this.afterCheers;
      this.afterCheers = null;
      next();
      return;
    }
    this.resetIdleHint();
    if (this.levelUpPromptPending) {
      this.levelUpPromptPending = false;
      this.showLevelUpCard();
    }
  }

  queueLevelUpPromptIfEligible() {
    if (
      this.gameMode === 'classic' &&
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
      : emojiMarkup('😳');
    leftButton.querySelector('.label').textContent = isActive ? 'No' : 'Cringe';
    leftButton.querySelector('.arrow-indicator').textContent = '◄';
    leftButton.title = isActive ? 'Drag LEFT or Tap No' : 'Drag LEFT or Tap for Awkward & Cringe';
    rightButton.querySelector('.emoji').innerHTML = isActive
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4.5 12.5 5 5L19.5 7.5"/></svg>'
      : emojiMarkup('🥳');
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
    card.querySelector('.cat-tag-emoji').innerHTML = emojiMarkup(nextLevel
      ? SPICY_LEVEL_EMOJIS[nextLevel]
      : SPICY_LEVEL_EMOJIS[this.spicyLevel]);
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
      emoji: this.activeCard.dataset.cardEmoji,
      tagName: this.activeCard.dataset.tagName,
      sourceCategory: this.activeCard.dataset.sourceCategory,
      exitDirection: this.activeCard.dataset.exitDirection,
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

    // Unhinged prompt: the background glow turns red, a little off the card's own red
    const upcomingLevel = SPICY_LEVELS[SPICY_LEVELS.indexOf(this.spicyLevel) + 1];
    if (upcomingLevel === 'unhinged' && this.ambientGlow) {
      this.ambientGlow.style.background = 'radial-gradient(circle, rgba(139, 90, 95, 0.4) 0%, rgba(10, 11, 16, 0.4) 60%, transparent 75%)';
    }

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
      if (this.restartRequested) this.runPendingRestart();
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
    const catData = this.getCategoryData(category);
    if (catData && this.ambientGlow) {
      this.ambientGlow.style.background = `radial-gradient(circle, ${catData.glow} 0%, rgba(10, 11, 16, 0.4) 60%, transparent 75%)`;
    }
  }

  // 18+ check: saved once on this device, then the first card is the normal intro
  isAgeConfirmed() {
    try {
      return localStorage.getItem(AGE_GATE_KEY) === '1';
    } catch (error) {
      return false;
    }
  }

  saveAgeConfirmed() {
    try {
      localStorage.setItem(AGE_GATE_KEY, '1');
    } catch (error) {
      // Storage unavailable: the question is asked again next visit
    }
  }

  // The first card asks the question inside its decorated back, so it keeps the same pattern and frame
  showAgeGate(card) {
    this.ageGateActive = true;
    document.body.classList.add('screen-age-gate');
    const front = card.querySelector('.card-back-frame');
    front.innerHTML = `
      <div class="age-gate-front">
        <p class="age-gate-kicker">Before we start</p>
        <h2 class="age-gate-question">Are you 18 or older?</h2>
        <div class="age-gate-below">
          <div class="age-gate-buttons">
            <button class="age-gate-btn age-gate-no" type="button"><kbd class="key-cue">Esc</kbd><span class="btn-label">No</span></button>
            <button class="age-gate-btn age-gate-yes" type="button"><kbd class="key-cue">Enter</kbd><span class="btn-label">Yes</span></button>
          </div>
          <p class="age-gate-denied">Sorry, this game is only for adults.</p>
        </div>
      </div>`;
    // YES wears the sparkle border (like the card's Customize button) — no spark illustration
    this.addBorderSparkles(front.querySelector('.age-gate-yes'), { inset: 3, count: 6, sizeMin: 5, sizeRange: 3, durMin: 7, durRange: 4 });
    front.querySelector('.age-gate-yes').addEventListener('click', () => {
      this.saveAgeConfirmed();
      sounds.init();
      sounds.playClick();
      this.fadeTransition(() => {
        this.ageGateActive = false;
        document.body.classList.remove('screen-age-gate');
        // Empty the arena behind the deck screen: the dealt gate card would
        // otherwise flash through the deck backdrop as it fades in
        this.clearDealtDeck();
        // Next: pick a game. Its start shuffles the deck, so the right cards get dealt
        this.openModeSelect();
      });
    });

    front.querySelector('.age-gate-no').addEventListener('click', () => {
      // Nudge the card and bring in the message; restarting the class replays the nudge
      card.classList.remove('is-nudging');
      void card.offsetWidth;
      card.classList.add('is-nudging');
      sounds.playWildSound();
      front.querySelector('.age-gate-denied').classList.add('is-visible');
      front.querySelectorAll('button').forEach(button => { button.disabled = true; });
    });
  }

  buildDeckLayers() {
    const layersWrap = document.createElement('div');
    layersWrap.className = 'deck-layers-container';
    for (let i = 10; i >= 1; i--) {
      const layer = document.createElement('div');
      layer.className = `deck-card-layer layer-${i}`;
      layer.style.setProperty('--layer-idx', i);
      layersWrap.appendChild(layer);
    }
    return layersWrap;
  }

  // Removes the dealt cards and layers from the arena (used when the deck screen takes over)
  clearDealtDeck() {
    this.stackContainer.innerHTML = '';
    this.stackContainer.classList.remove('shuffling', 'reshuffle-arriving');
    this.activeCard = null;
  }

  renderInitialDeck() {
    this.stackContainer.innerHTML = '';

    // 1. The stacked layers behind the cards
    this.stackContainer.appendChild(this.buildDeckLayers());

    // 2. Initial playable cards
    const isMostLikely = this.gameMode === 'most-likely';
    const initialCategory = isMostLikely ? 'most-likely' : 'spicy';
    const cardData1 = {
      category: initialCategory,
      text: this.getRandomQuestion(initialCategory),
      showCustomise: true
    };
    const secondCategory = isMostLikely ? 'most-likely' : 'party';
    const cardData2 = {
      category: secondCategory,
      text: this.getRandomQuestion(secondCategory)
    };

    const card2 = this.createCardElement(cardData2, 'next', true); // Face-down on top of stack
    const card1 = this.createCardElement(cardData1, 'current', true); // Start with the decorated reverse visible

    this.stackContainer.appendChild(card2);
    this.stackContainer.appendChild(card1);

    this.activeCard = card1;
    this.activeCardCategory = initialCategory;
    if (this.isAgeConfirmed()) {
      this.bindCardGesture(this.activeCard);
    } else {
      this.showAgeGate(card1);
    }
  }

  // Golden-ratio sparkles spread around the border of a parent, padded inwards by `inset`.
  // Each star flashes on its own slow rhythm.
  addBorderSparkles(parent, { inset = 8, count = 12, sizeMin = 4, sizeRange = 3, durMin = 7, durRange = 5 } = {}) {
    const layer = document.createElement('div');
    layer.className = 'card-sparkles';
    layer.setAttribute('aria-hidden', 'true');
    const phi = 0.6180339887;
    for (let i = 0; i < count; i += 1) {
      const t = ((i + 1) * phi) % 1;
      const side = Math.floor(t * 4);
      const f = (t * 4) % 1;
      const along = `calc(${inset}px + (100% - ${inset * 2}px) * ${f.toFixed(3)})`;
      const backAlong = `calc(${inset}px + (100% - ${inset * 2}px) * ${(1 - f).toFixed(3)})`;
      const position = [
        { left: along, top: `${inset}px` },
        { left: `calc(100% - ${inset}px)`, top: along },
        { left: backAlong, top: `calc(100% - ${inset}px)` },
        { left: `${inset}px`, top: backAlong }
      ][side];
      const spark = document.createElement('span');
      spark.className = 'card-sparkle';
      spark.style.left = position.left;
      spark.style.top = position.top;
      spark.style.setProperty('--sparkle-size', `${(sizeMin + (i * phi) % sizeRange).toFixed(1)}px`);
      spark.style.setProperty('--sparkle-duration', `${(durMin + (i * 1.37) % durRange).toFixed(2)}s`);
      spark.style.setProperty('--sparkle-delay', `${(i * 0.73).toFixed(2)}s`);
      layer.appendChild(spark);
    }
    parent.appendChild(layer);
    return layer;
  }

  // Sparkles scattered over a title element (used for the deck screen logo)
  addTitleSparkles(title, count = 8) {
    const phi = 0.6180339887;
    const layer = document.createElement('div');
    layer.className = 'card-sparkles title-sparkles';
    layer.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < count; i += 1) {
      const spark = document.createElement('span');
      spark.className = 'card-sparkle';
      spark.style.left = `${(10 + ((i + 1) * phi * 2 % 1) * 80).toFixed(2)}%`;
      spark.style.top = `${(8 + ((i + 1) * phi * 3 % 1) * 84).toFixed(2)}%`;
      spark.style.setProperty('--sparkle-size', `${(6 + (i * phi) % 5).toFixed(1)}px`);
      spark.style.setProperty('--sparkle-duration', `${(8 + (i * 1.91) % 4).toFixed(2)}s`);
      spark.style.setProperty('--sparkle-delay', `${(0.5 + i * 1.1).toFixed(2)}s`);
      layer.appendChild(spark);
    }
    title.appendChild(layer);
  }

  // Sparkles on a card's back: a border set, plus a few over the title
  addIntroSparkles(card) {
    const back = card.querySelector('.card-back');
    if (!back) return;
    this.addBorderSparkles(back, { inset: 8, count: 12 });

    const title = back.querySelector('.emblem-title');
    if (title) {
      const phi = 0.6180339887;
      const titleLayer = document.createElement('div');
      titleLayer.className = 'card-sparkles title-sparkles';
      titleLayer.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < 6; i += 1) {
        const spark = document.createElement('span');
        spark.className = 'card-sparkle';
        spark.style.left = `${(10 + ((i + 1) * phi * 2 % 1) * 80).toFixed(2)}%`;
        spark.style.top = `${(12 + ((i + 1) * phi * 3 % 1) * 76).toFixed(2)}%`;
        spark.style.setProperty('--sparkle-size', `${(3 + (i * phi) % 2).toFixed(1)}px`);
        spark.style.setProperty('--sparkle-duration', `${(8 + (i * 1.91) % 4).toFixed(2)}s`);
        spark.style.setProperty('--sparkle-delay', `${(0.5 + i * 1.1).toFixed(2)}s`);
        titleLayer.appendChild(spark);
      }
      title.appendChild(titleLayer);
    }

    // The starter card's Customize button gets the same sparkles as the How to Play one
    const customiseBtn = back.querySelector('.customise-btn');
    if (customiseBtn && card.classList.contains('intro-card')) {
      this.addBorderSparkles(customiseBtn, { inset: 3, count: 6, sizeMin: 5, sizeRange: 3, durMin: 7, durRange: 4 });
    }
  }

  // Card backs: the title and the footer depend on the game
  emblemTitleMarkup() {
    const lines = { 'most-likely': ["Who's Most", 'Likely'], 'shot-dare': ['Shots &amp;', 'Dares'] }[this.gameMode]
      ?? ['Never Have', 'Ai Ever'];
    return lines.map(line => `<span class="cursive-line">${line}</span>`).join('');
  }

  // The short description on the card back, between the title and the Customize button (shown only on intro card)
  blurbMarkup(isIntro = false) {
    if (!isIntro) return '';
    const text = {
      'most-likely': 'The majority selects who<br>drinks by pointing at them.',
      'shot-dare': 'The group sets the shot goal.<br>Reach it, and the dare begins.'
    }[this.gameMode] ?? 'Drink if <strong>you\'ve</strong> done it,<br>the perfect icebreaker game.';
    return `<p class="card-blurb">${text}</p>`;
  }

  emblemFooterMarkup() {
    if (this.gameMode === 'shot-dare') {
      return `<div class="shot-arch" aria-hidden="true">${SHOT_GLASS_SVG.repeat(5)}</div>`;
    }
    return '<div class="emblem-sub">Swipe to Reveal</div>';
  }

  createCardElement(data, stackClass = 'next', isFaceDown = true) {
    const cat = this.getCategoryData(data.category) || this.categories.top;

    const card = document.createElement('div');
    card.className = `game-card ${stackClass} ${isFaceDown ? 'face-down' : ''}`;
    card.dataset.category = data.category;
    card.dataset.cardType = data.cardType || 'question';
    card.dataset.fullText = data.text;
    if (data.showCustomise) card.classList.add('intro-card');
    if (data.doneIt) card.dataset.doneIt = 'true';
    card.style.setProperty('--active-card-color', cat.color);
    card.style.setProperty('--active-card-glow', cat.glow);

    // Support per-question { text, emoji } objects (cringe) or plain strings
    const question = typeof data.text === 'object' && data.text !== null ? data.text : { text: data.text };
    card.dataset.fullText = question.text;
    const cardEmoji = data.emoji ?? question.emoji ?? this.getCategoryEmoji(data.category);
    card.dataset.cardEmoji = cardEmoji;
    card.dataset.tagName = question.tagName ?? data.tagName ?? '';
    card.dataset.sourceCategory = question.source ?? data.sourceCategory ?? data.category;
    card.style.setProperty('--card-emoji', cardEmoji);

    const cleanQuestion = question.text.replace(/^Never have I ever /i, '');

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
              <span class="cat-tag-name">${question.tagName ?? data.tagName ?? this.getCardCategoryName(data.category)}</span>
            </div>
          </div>
          <div class="category-watermark" aria-hidden="true">
            <span class="cat-tag-emoji">${emojiMarkup(cardEmoji)}</span>
          </div>

          <!-- Card Body Statement (Centered) -->
          <div class="card-body">
            <div class="prompt-prefix">${this.getPromptPrefix(data.category)}</div>
            <div class="prompt-text">${cleanQuestion}</div>
          </div>
          <div class="card-hint">
            <span class="card-hint-text">${data.category === 'most-likely'
              ? '<span class="hint-full">Swipe card or arrow keys</span><span class="hint-short">Swipe or ←→</span>'
              : '<span class="hint-full">Drag card or tap emoji</span><span class="hint-short">Drag or tap</span>'}</span>
            <button class="done-it-btn" type="button" aria-label="Celebrate that you have done it">
              <kbd class="key-cue">ENTER</kbd>${this.gameMode === 'most-likely' ? 'INDEED' : 'DONE IT!'}
            </button>
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
                ${this.emblemTitleMarkup()}
              </div>
              ${this.blurbMarkup(Boolean(data.showCustomise))}
              <button class="customise-btn" type="button" aria-label="Customize cards with AI">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.8 13.9 9l6.3 2-6.3 2-1.9 6.2L10.1 13 3.8 11l6.3-2L12 2.8Z" />
                  <path d="m19 14 .9 2.4 2.3.8-2.3.8L19 20.5l-.8-2.5-2.4-.8 2.4-.8.8-2.4Z" />
                </svg>
                <span>CUSTOMIZE</span>
              </button>
              ${this.emblemFooterMarkup()}
            </div>
          </div>
        </div>
      </div>
    `;

    this.addIntroSparkles(card);

    return card;
  }

  bindCardGesture(card) {
    if (!card) return;

    let currentPointerId = null;
    let restGaps = null; // distance from the card's resting spot to each arena edge

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

      const arenaAtStart = document.querySelector('.game-arena')?.getBoundingClientRect();
      if (arenaAtStart) {
        const restBox = card.getBoundingClientRect();
        restGaps = {
          left: restBox.left - arenaAtStart.left,
          right: arenaAtStart.right - restBox.right,
          top: restBox.top - arenaAtStart.top,
          bottom: arenaAtStart.bottom - restBox.bottom
        };
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
      // Subtle 3D lean toward the drag, so the card looks like it's tilting in space
      const tiltY = Math.max(-8, Math.min(8, dx * 0.05));
      const tiltX = Math.max(-6, Math.min(6, dy * 0.05));
      const skew = Math.max(-3, Math.min(3, dx * 0.02));
      card.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${rotation}deg) rotateX(${tiltX}deg) rotateY(${tiltY}deg) skewX(${skew}deg)`;

      // Edge shade: how far the card has moved toward each side, relative to the room it had
      // at rest, so a card already close to an edge (on phones) doesn't shade on grab
      if (restGaps) {
        const moved = { left: -dx, right: dx, top: -dy, bottom: dy };
        for (const side of Object.keys(restGaps)) {
          const ratio = Math.max(0, Math.min(1, moved[side] / Math.max(1, restGaps[side])));
          const ramp = Math.max(0, (ratio - 0.4) / 0.6);
          card.style.setProperty(`--shade-${side}`, (ramp * ramp * 0.35).toFixed(3));
        }
      }

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
      ['left', 'right', 'top', 'bottom'].forEach(side => card.style.setProperty(`--shade-${side}`, '0'));

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
    if (this.gameMode === 'shot-dare') return; // shot dare has its own buttons
    if (this.awaitingStart) {
      // The first swipe starts the game and plays the intro card in the same motion
      this.beginStart({ flipCard: false });
    }
    if (this.isAnimating || this.isCelebrating || !this.activeCard) return;
    if (this.activeCard.dataset.cardType === 'level-up') {
      this.resolveLevelUp(direction);
      return;
    }
    this.swipeCount += 1;
    this.activeCard.dataset.exitDirection = direction;
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

    // Who most likely has no categories: any swipe or tap moves to the next card
    const nextCategory = this.gameMode === 'most-likely' ? 'most-likely' : categoryMapping[direction];

    const activeStamp = this.activeCard.querySelector(`.stamp-${direction}`);
    if (activeStamp) {
      activeStamp.style.opacity = '1';
      activeStamp.style.transform = 'translate(-50%, -50%) scale(1.1)';
    }

    this.cardHistory.push({
      category: this.activeCard.dataset.category,
      text: this.activeCard.dataset.fullText,
      emoji: this.activeCard.dataset.cardEmoji,
      tagName: this.activeCard.dataset.tagName,
      sourceCategory: this.activeCard.dataset.sourceCategory,
      exitDirection: this.activeCard.dataset.exitDirection,
      faceDown: this.activeCard.classList.contains('face-down'),
      doneIt: this.activeCard.dataset.doneIt === 'true'
    });
    if (this.cardHistory.length > 15) this.cardHistory.shift();

    this.syncMostLikelyPill();
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
    this.activeCard.style.transition = `transform ${GAME_PACE.exitMs}ms cubic-bezier(0.2, 0.9, 0.3, 1), opacity ${Math.round(GAME_PACE.exitMs * 0.85)}ms ease-out`;
    this.activeCard.style.transform = `translate3d(${exitX}px, ${exitY}px, 0) rotate(${exitRotation}deg)`;
    this.activeCard.style.opacity = '0';

    Object.values(this.targetButtons).forEach(btn => btn.classList.remove('highlight'));

    const oldCard = this.activeCard;
    const nextCard = this.stackContainer.querySelector('.game-card.next');

    if (nextCard) {
      // 1. Slide next card into center showing its vector texture reverse side
      nextCard.style.transition = `transform ${GAME_PACE.slideMs}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`;
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
      const cat = this.getCategoryData(nextCategory) || this.categories.top;
      const newQuestion = this.getRandomQuestion(nextCategory);
      nextCard.dataset.category = nextCategory;
      nextCard.dataset.fullText = newQuestion.text;
      const nextCardEmoji = newQuestion.emoji ?? this.getCategoryEmoji(nextCategory);
      nextCard.dataset.cardEmoji = nextCardEmoji;
      nextCard.dataset.tagName = newQuestion.tagName ?? '';
      nextCard.dataset.sourceCategory = newQuestion.source ?? nextCategory;
      nextCard.style.setProperty('--card-emoji', nextCardEmoji);
      nextCard.style.setProperty('--active-card-color', cat.color);
      nextCard.style.setProperty('--active-card-glow', cat.glow);

      const catTagEmoji = nextCard.querySelector('.cat-tag-emoji');
      const catTagName = nextCard.querySelector('.cat-tag-name');
      const catTag = nextCard.querySelector('.category-tag');
      if (catTag && catTagEmoji && catTagName) {
        catTag.style.color = cat.color;
        catTagName.textContent = newQuestion.tagName ?? this.getCardCategoryName(nextCategory);
        catTagEmoji.innerHTML = emojiMarkup(nextCardEmoji);
      }

      const promptText = nextCard.querySelector('.prompt-text');
      if (promptText) {
        promptText.textContent = newQuestion.text.replace(/^Never have I ever /i, '');
      }
      const promptPrefix = nextCard.querySelector('.prompt-prefix');
      if (promptPrefix) {
        promptPrefix.textContent = this.getPromptPrefix(nextCategory);
      }

      // 3. FLIP REVEAL: Rotate card 180° in 3D to reveal front face
      setTimeout(() => {
        nextCard.classList.remove('face-down');
        sounds.playSnapBack();
      }, GAME_PACE.flipDelayMs);

      this.updateAmbientGlow(nextCategory);
      this.activeCardCategory = nextCategory;
    }

    // Spawn a new face-down card waiting right underneath for the next swipe
    this.cardCount++;
    const randomBackgroundCat = this.pickBackgroundCategory();
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

    // The next swipe waits until the new card has landed and had a moment to be read
    const landedMs = Math.max(GAME_PACE.slideMs, GAME_PACE.flipDelayMs + 550);
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
        this.runPendingRestart();
      } else if (this.levelUpPromptPending) {
        this.levelUpPromptPending = false;
        this.showLevelUpCard();
      }
    }, landedMs + GAME_PACE.cooldownMs);
  }

  // Runs a restart that was waiting for the current animation to finish
  runPendingRestart() {
    const shuffle = this.restartWithShuffle;
    this.restartRequested = false;
    this.restartWithShuffle = false;
    if (shuffle) this.reshuffleGame();
    else this.restartGame();
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
    this.activeCardCategory = this.gameMode === 'most-likely' ? 'most-likely' : 'spicy';
    this.cardCount = 1;
    this.renderInitialDeck();
    this.syncMostLikelyPill();
    this.updateAmbientGlow(this.activeCardCategory);
    this.resetIdleHint();
  }

  reshuffleGame() {
    if (this.isCelebrating) return;
    if (this.isAnimating) {
      // Wait for the card to land, then shuffle (the juggle), not just swap the deck
      this.restartRequested = true;
      this.restartWithShuffle = true;
      return;
    }

    this.isAnimating = true;
    this.hideTargetButtons();
    clearTimeout(this.idleHintTimer);
    this.activeCard?.classList.remove('hint-visible');
    this.stackContainer.classList.remove('reshuffle-arriving');
    this.stackContainer.classList.add('shuffling');
    sounds.playShuffle();

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

  // Home: back to the deck screen. Choosing a deck brings the customise step again.
  goHome() {
    if (this.isCelebrating) return;
    if (this.modeModal.classList.contains('active')) return;
    this.fadeTransition(() => {
      this.openModeSelect();
    });
  }

  // Restart: the same game from the beginning, without the customise step
  restartCurrentGame() {
    if (this.isCelebrating) return;
    if (this.gameMode === 'shot-dare') {
      this.showShotIntro();
      return;
    }
    this.reshuffleGame();
  }

  // How to play, written for the screen it was opened from
  openInfo(context) {
    const info = this.infoModal;
    info.querySelector('#info-tap-text').textContent = INFO_TEXT.tap[context];
    info.querySelector('#info-keys-text').textContent = INFO_TEXT.keys[context];
    info.querySelectorAll('.info-cat[data-ctx]').forEach((row) => {
      row.hidden = !row.dataset.ctx.split(' ').includes(context);
    });
    info.classList.add('active');
  }

  // ----- Game decks -----

  openModeSelect() {
    if (this.isCelebrating) return;
    this.clearShotTimers();
    this.pendingMode = this.gameMode;
    this.syncModeOptions();
    this.ageGateActive = false;
    document.body.classList.remove('screen-age-gate');
    document.body.classList.add('screen-deck');
    this.modeModal.classList.add('active');
    this.positionDeckTrack();
    this.modeModal.querySelector('.mode-option[aria-pressed="true"]')?.focus({ preventScroll: true });
    try {
      if (history.state?.screen === 'game') {
        history.replaceState({ screen: 'home' }, '');
      }
    } catch (_) {}
  }

  syncModeOptions() {
    this.modeModal.querySelectorAll('.mode-option').forEach((option) => {
      option.setAttribute('aria-pressed', String(option.dataset.mode === this.pendingMode));
    });
    this.modeModal.style.setProperty('--deck-glow', DECK_COLORS[this.pendingMode]);
    this.positionDeckTrack();
  }

  // Phones: the decks are a slider, with the chosen one in the middle. Wide screens show all three.
  positionDeckTrack() {
    const track = this.modeModal.querySelector('.deck-list');
    const tile = track.children[DECK_ORDER.indexOf(this.pendingMode)];
    if (!tile) return;
    if (window.matchMedia('(min-width: 720px)').matches) {
      track.style.transform = '';
      return;
    }
    const offset = tile.offsetLeft - (track.clientWidth - tile.offsetWidth) / 2;
    track.style.transform = `translateX(${-offset}px)`;
  }

  // Classic on widescreen: line the spicy and wholesome buttons up with the UI
  // that lives outside the arena — spicy with the header controls row, wholesome
  // with the RANDOM CARD button. Their offsets are measured here because pure
  // CSS cannot see across the three containers.
  syncClassicTargetAlignment() {
    const arena = document.querySelector('.game-arena');
    if (!arena) return;
    if (this.gameMode !== 'classic' || !window.matchMedia('(min-width: 1024px)').matches) {
      arena.style.removeProperty('--target-top-align');
      arena.style.removeProperty('--target-bottom-align');
      return;
    }
    // Measure the resting layout: clear the vars, then read the boxes
    arena.style.removeProperty('--target-top-align');
    arena.style.removeProperty('--target-bottom-align');
    const header = document.querySelector('.app-header');
    const randomBtn = document.getElementById('classic-random');
    const top = document.getElementById('target-top');
    const bottom = document.getElementById('target-bottom');
    const ar = arena.getBoundingClientRect();
    const hr = header?.getBoundingClientRect();
    const tr = top?.getBoundingClientRect();
    const br = bottom?.getBoundingClientRect();
    const rr = randomBtn?.getBoundingClientRect();
    // The classic-keys row hides while a modal is open; keep the last good values then
    if (!ar.height || !hr?.height || !tr?.height || !br?.height || !rr?.height) return;
    // Spicy: vertically centred on the header row
    const topOffset = (hr.top + hr.height / 2) - ar.top - tr.height / 2;
    // Wholesome: vertically centred on the RANDOM CARD button
    const bottomOffset = ar.bottom - (rr.top + rr.height / 2) - br.height / 2;
    arena.style.setProperty('--target-top-align', `${topOffset.toFixed(1)}px`);
    arena.style.setProperty('--target-bottom-align', `${bottomOffset.toFixed(1)}px`);
  }

  // Deck chosen: the customise pop-up comes next as an optional step
  chooseMode() {
    // One entry at a time: a double click fires both the click and dblclick
    // handlers, and a second call would run straight through the fade
    if (this.isScreenFading || this.setupStep) return;
    // The customise step is asked once; after that, choosing a game goes straight in
    if (this.setupDone) {
      this.fadeTransition(() => {
        this.modeModal.classList.remove('active');
        this.startGame(this.pendingMode, { instantEntry: true });
      });
      return;
    }
    // First game: the setup pop-up sits on top of the deck screen, and the fade
    // to black happens later, once Skip or Save and Play is pressed
    if (this.setupStep) return;
    this.setupStep = true;
    this.openCustomiseModal({ from: 'setup' });
    try {
      history.pushState({ screen: 'setup' }, '');
    } catch (_) {}
  }

  // Ends the optional setup, whether the player saved or skipped it, and starts the chosen game
  finishSetup() {
    if (!this.setupStep) return;
    this.setupStep = false;
    this.setupDone = true;
    this.fadeTransition(() => {
      this.customiseModal.classList.remove('active', 'is-setup');
      this.modeModal.classList.remove('active');
      this.returnFlippedPanel({ animate: false });
      this.startGame(this.pendingMode, { instantEntry: true });
    });
  }

  // Leaving the optional setup without playing: back to the deck screen underneath
  cancelSetup() {
    this.setupStep = false;
    this.customiseModal.classList.remove('active', 'is-setup');
    this.returnFlippedPanel({ animate: false });
    try {
      history.pushState({ screen: 'home' }, '');
    } catch (_) {}
  }

  // Who's Most Likely: the first card has only Undo and Next; Indeed appears once a card has been passed
  syncMostLikelyPill() {
    this.nextPill.classList.toggle('is-first', this.gameMode === 'most-likely' && this.cardHistory.length === 0);
  }

  // Ambient glow in a given colour (the Shots & Dares pink)
  setAmbientGlow(colour) {
    if (this.ambientGlow) {
      this.ambientGlow.style.background = `radial-gradient(circle, ${colour} 0%, rgba(10, 11, 16, 0.4) 60%, transparent 75%)`;
    }
  }

  setModeClasses() {
    document.body.classList.toggle('mode-classic', this.gameMode === 'classic');
    document.body.classList.toggle('mode-most-likely', this.gameMode === 'most-likely');
    document.body.classList.toggle('mode-shot-dare', this.gameMode === 'shot-dare');
  }

  startGame(mode, { instantEntry = false } = {}) {
    // Deck -> game handover through the fade: reveal the cards fully placed, with no
    // entry motion fighting the lifting curtain. The in-game reshuffle keeps its own.
    clearTimeout(this.entryInstantTimer);
    document.body.classList.toggle('entry-instant', instantEntry);
    if (instantEntry) {
      this.entryInstantTimer = setTimeout(() => document.body.classList.remove('entry-instant'), 900);
    }

    document.body.classList.remove('screen-deck');
    this.gameMode = mode;
    this.setModeClasses();
    this.cardHistory = [];
    this.swipeCount = 0;
    this.doneItCount = 0;
    this.levelUpPromptShown = false;
    this.levelUpPromptPending = false;
    this.setLevelUpTargetMode(false);
    Object.values(this.usedQuestions).forEach(used => used.clear());
    this.activeCardCategory = mode === 'most-likely' ? 'most-likely' : 'spicy';

    // New start flow: every game waits at its intro card with CUSTOMIZE + START below it.
    // The bar is reset so labels and hidings from the previous game never leak into it.
    this.awaitingStart = true;
    document.body.classList.add('game-waiting');
    this.setStartBar('START');

    try {
      if (!history.state || history.state.screen !== 'game') {
        history.pushState({ screen: 'game', mode }, '');
      }
    } catch (_) {}

    if (mode === 'shot-dare') {
      this.setAmbientGlow('rgba(255, 45, 117, 0.45)');
      this.showShotIntro({ instantEntry });
      return;
    }
    this.syncMostLikelyPill();
    this.stackContainer.classList.remove('shuffling', 'reshuffle-arriving');
    this.isAnimating = false;
    this.restartGame();
    // Classic: the swipe targets came from the previous round, so hide them again;
    // they come back together with the START gesture. On phones they are always hidden.
    if (mode === 'classic') {
      this.syncClassicTargetAlignment();
      this.hideTargetButtons();
    }
  }

  // ----- Shot dare time -----

  clearShotTimers() {
    this.shotTimers.forEach(clearTimeout);
    this.shotTimers = [];
  }

  scheduleShot(fn, ms) {
    this.shotTimers.push(setTimeout(fn, ms));
  }

  // intro → playing → celebrating (cheers) → dare → revealed → playing ...
  setShotPhase(phase) {
    this.shotPhase = phase;
    const showingDares = phase === 'dare' || phase === 'revealed';
    this.shotSlot.hidden = showingDares;
    this.shotDares.hidden = !showingDares;
    // The intro uses START on the card; the action button below handles the rest.
    // The pill tells the truth: PLAY AGAIN answers to Enter, the others to Space.
    const labels = { intro: 'START', playing: 'SOMEONE LOST!', revealed: 'PLAY AGAIN' };
    const cues = { intro: 'SPACE', playing: 'SPACE', revealed: 'ENTER' };
    this.shotAction.hidden = !labels[phase];
    this.shotAction.innerHTML = labels[phase] ? `<kbd class="key-cue">${cues[phase]}</kbd><span class="btn-label">${labels[phase]}</span>` : '';
    this.shotCustomise.hidden = phase !== 'intro';
    this.shotActions.classList.toggle('is-split', phase === 'intro');
    this.darePill.hidden = phase !== 'dare';
  }

  // The card with its deck layers behind, built the same way as the classic cards
  showShotCard({ prefix = '', tag = 'Shots & Dares', text = '', emoji, faceDown = false, withClock = false, animate = true }) {
    if (!this.shotSlot.querySelector('.deck-layers-container')) {
      this.shotSlot.prepend(this.buildDeckLayers());
    }
    const card = this.createCardElement({
      category: 'spicy',
      text: { text, emoji },
      showCustomise: faceDown
    }, 'current', faceDown);
    if (animate) card.classList.add('card-entering');
    card.querySelector('.prompt-prefix').textContent = prefix;
    card.querySelector('.cat-tag-name').textContent = tag;
    if (withClock) card.append(this.buildShotBorder());
    this.shotSlot.querySelector('.game-card')?.remove();
    this.shotSlot.insertBefore(card, this.shotSlot.querySelector('.deck-layers-container').nextSibling);
  }

  // The countdown: the card's border fills around from the top-left corner, one lap per sentence
  buildShotBorder() {
    const border = document.createElement('span');
    border.className = 'shot-border';
    border.setAttribute('aria-hidden', 'true');
    border.style.setProperty('--shot-ms', `${SHOT_SENTENCE_MS}ms`);
    return border;
  }

  showShotIntro({ instantEntry = false } = {}) {
    this.clearShotTimers();
    this.showShotCard({ tag: 'Shots & Dares', emoji: '🥃', faceDown: true, animate: !instantEntry });
    this.setShotPhase('intro');
    this.resetIdleHint();
  }

  startShotRound() {
    this.clearShotTimers();
    this.setShotPhase('playing');
    this.revealShotSentence();
  }

  // Each sentence stays for SHOT_SENTENCE_MS, then the next one appears on its own
  revealShotSentence() {
    const question = this.getRandomQuestion('spicy'); // follows the chosen intensity
    this.showShotCard({
      prefix: 'Take a shot if...',
      tag: 'Shots & Dares',
      text: toShotBody(question.text),
      emoji: question.emoji ?? this.getCategoryEmoji('spicy'),
      withClock: true
    });
    sounds.playSnapBack();
    this.scheduleShot(() => this.revealShotSentence(), SHOT_SENTENCE_MS);
  }

  // DID IT ALL stops the game, plays the cheers, then the dare choice
  didItAll() {
    if (this.shotPhase !== 'playing' || this.isCelebrating) return;
    this.clearShotTimers();
    this.shotSlot.querySelectorAll('.shot-border').forEach((border) => border.remove());
    this.setShotPhase('celebrating');
    this.afterCheers = () => this.showShotDares();
    this.startCheers(this.spicyLevel);
  }

  drawDare() {
    if (this.dareBag.length === 0) {
      // Shuffled bag: every dare comes up once before any repeats
      this.dareBag = [...SHOT_DARES];
      for (let i = this.dareBag.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.dareBag[i], this.dareBag[j]] = [this.dareBag[j], this.dareBag[i]];
      }
    }
    return this.dareBag.pop();
  }

  showShotDares() {
    // Three different categories, and a different dare from each. Picking a card reveals its own dare.
    const categories = Object.keys(DARE_CATEGORIES).sort(() => Math.random() - 0.5).slice(0, 3);
    // Three hues spread around the colour wheel (with a little drift), one per card:
    // the faces, borders and frame lines tint subtly with the card's own hue.
    const baseHue = Math.floor(Math.random() * 360);
    this.shotDareCards.forEach((card, index) => {
      const key = categories[index];
      const pool = SHOT_DARES.filter((dare) => dare.category === key);
      const dare = pool[Math.floor(Math.random() * pool.length)];
      card.classList.remove('is-revealed', 'is-dimmed');
      card.querySelector('.shot-dare-text').textContent = dare.text;
      const back = card.querySelector('.dare-back-emoji');
      back.dataset.dareEmoji = DARE_CATEGORIES[key].emoji;
      back.innerHTML = dareCardPattern(DARE_CATEGORIES[key].emoji);
      card.style.setProperty('--tilt', `${(Math.random() * 8 - 4).toFixed(1)}deg`);
      const hue = (baseHue + index * 120 + Math.floor(Math.random() * 36) - 18 + 360) % 360;
      card.style.setProperty('--hue', String(hue));
    });
    this.setShotPhase('dare');
    this.setDareFocus(1);
    this.setAmbientGlow('rgba(255, 45, 117, 0.45)');
    this.queueDareJitters();
  }

  // Re-renders every dare card back's emoji pattern (used when the viewport
  // crosses the mobile breakpoint, where the pattern uses a different grid).
  applyDarePatterns() {
    this.shotDares.querySelectorAll('.dare-back-emoji').forEach((back) => {
      if (back.dataset.dareEmoji) back.innerHTML = dareCardPattern(back.dataset.dareEmoji);
    });
  }

  // Each card shivers for a beat, one after another, in a random order — a small
  // "pick me" jiggle each time the three-card fan appears.
  queueDareJitters() {
    if (!this.jitterTimers) this.jitterTimers = [];
    this.jitterTimers.forEach((timer) => clearTimeout(timer));
    const order = [0, 1, 2].sort(() => Math.random() - 0.5);
    this.jitterTimers = order.flatMap((cardIndex, step) => {
      const delay = 400 + step * 520;
      const card = this.shotDareCards[cardIndex];
      // Fallback in case animationend never fires (e.g. the animation is off)
      const fallback = setTimeout(() => card.classList.remove('is-jitter'), delay + 700);
      const start = setTimeout(() => {
        card.classList.remove('is-jitter');
        void card.offsetWidth; // restart the animation even if the class survived
        card.classList.add('is-jitter');
        card.addEventListener('animationend', () => card.classList.remove('is-jitter'), { once: true });
      }, delay);
      return [start, fallback];
    });
  }

  // Moves the highlight between the three dare cards (arrow keys, or a swipe on phones)
  setDareFocus(index) {
    const count = this.shotDareCards.length;
    this.dareFocus = (index + count) % count;
    this.shotDareCards.forEach((card, i) => card.classList.toggle('is-focus', i === this.dareFocus));
  }

  chooseShotDare(card) {
    if (this.shotPhase !== 'dare') return;
    card.classList.add('is-revealed');
    this.shotDareCards.forEach((other) => {
      if (other !== card) other.classList.add('is-dimmed');
    });
    this.setShotPhase('revealed');
    sounds.playSnapBack();
  }

  // "Take 1 shot to choose again": the card turns back and the selection is open again
  pickAgain() {
    if (this.shotPhase !== 'revealed') return;
    this.shotDareCards.forEach((card) => card.classList.remove('is-revealed', 'is-dimmed'));
    this.setShotPhase('dare');
    this.setDareFocus(this.dareFocus);
  }

  // The action button, and Enter or Space, go forward through the shot dare round
  shotPrimaryAction() {
    if (this.awaitingStart) {
      this.beginStart();
      return;
    }
    if (this.shotPhase === 'intro' || this.shotPhase === 'revealed') this.startShotRound();
    else if (this.shotPhase === 'playing') this.didItAll();
  }

  // The waiting start bar: CUSTOMIZE + START sharing the row equally, whatever the last game left behind
  setStartBar(label) {
    this.shotActions.classList.add('is-split');
    this.shotCustomise.hidden = false;
    this.shotAction.hidden = false;
    this.shotAction.innerHTML = `${KEY_CUE}<span class="btn-label">${label}</span>`;
    this.darePill.hidden = true;
  }

  // START (button, Space, Enter or a first swipe): the waiting intro hands over to the game
  beginStart({ flipCard = true } = {}) {
    if (!this.awaitingStart || this.ageGateActive || this.isCelebrating) return;
    this.awaitingStart = false;
    document.body.classList.remove('game-waiting');
    if (this.gameMode === 'shot-dare') {
      this.startShotRound();
      return;
    }
    sounds.init();
    sounds.playClick();
    // Like Shots & Dares, START pulls the first card: the top card turns over
    // and reveals the opening question. A first swipe or arrow key already
    // plays its motion, so those starts skip the reveal.
    if (flipCard) this.revealFirstCard();
    this.revealTargetButtons();
  }

  // Classic & who-most-likely: turn the intro card over like a real draw,
  // so the first question appears the same way Shots & Dares reveals its sentence.
  revealFirstCard() {
    const card = this.activeCard;
    if (!card || !card.classList.contains('face-down')) return;
    // The intro flourishes (blurb, customize button) live on the back; drop them
    // as the card joins play.
    card.classList.remove('intro-card');

    // Replay the same two-beat reveal the deck deals on every swipe:
    // first the card-enter motion (lift and tilt)…
    card.classList.remove('card-entering');
    void card.offsetWidth; // restart the animation even if the class survived
    card.classList.add('card-entering');
    card.addEventListener('animationend', (event) => {
      if (event.target === card && event.animationName === 'card-enter') {
        card.classList.remove('card-entering');
      }
    }, { once: true });

    // …then the 3D flip to the question face, on the same beat as in-game reveals.
    setTimeout(() => {
      card.classList.remove('face-down');
      sounds.playSnapBack();
    }, GAME_PACE.flipDelayMs);
    this.resetIdleHint();
  }

  undoLastCard() {
    if (this.isCelebrating || this.gameMode === 'shot-dare') return;
    if (this.isAnimating || this.cardHistory.length === 0) {
      this.showToast("Can't undo");
      return;
    }
    this.isAnimating = true;

    const prevCardData = this.cardHistory[this.cardHistory.length - 1];
    if (prevCardData.cardType === 'level-up' && prevCardData.spicyLevel !== this.spicyLevel) {
      this.spicyLevel = prevCardData.spicyLevel;
      this.questions.spicy = [...SPICY_QUESTION_LEVELS[this.spicyLevel]];
      this.updateSpicyLevelPresentation();
    }

    this.cardHistory.pop();
    this.syncMostLikelyPill();
    const restoredCard = prevCardData.cardType === 'level-up'
      ? this.createLevelUpCardElement(prevCardData)
      : this.createCardElement(prevCardData, 'current', prevCardData.faceDown);
    if (prevCardData.cardType === 'level-up') {
      restoredCard.classList.remove('face-down');
      this.levelUpPromptShown = true;
    }

    // Undo: the card returns from an imaginary pile outside the arena (bottom-right),
    // flipping and tilting as it lands. The swipe direction only picks the next category.
    restoredCard.style.transition = 'none';
    if (this.gameMode === 'most-likely') {
      // The card comes back from the side it was discarded to
      const fromRight = prevCardData.exitDirection !== 'left';
      restoredCard.style.transform = `translate3d(${fromRight ? '70vw' : '-70vw'}, 0, 0) rotate(${fromRight ? 18 : -18}deg) scale(0.92)`;
    } else {
      restoredCard.style.transform = 'translate3d(45vw, 45vh, 0) rotate(10deg) rotateY(180deg) scale(0.6)';
    }
    restoredCard.style.opacity = '0';

    this.stackContainer.appendChild(restoredCard);
    this.stackContainer.querySelectorAll('.game-card.next').forEach(card => card.remove());

    if (this.activeCard) {
      this.activeCard.className = 'game-card next face-down';
      this.activeCard.style.transform = 'scale(0.985) translateY(-5px)';
    }

    restoredCard.offsetHeight;

    restoredCard.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.4s ease';
    restoredCard.style.transform = 'translate3d(0, 0, 0) rotate(0deg) rotateY(0deg) scale(1)';
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

    sounds.playUndo();
    this.showToast('Undo');

    setTimeout(() => {
      this.isAnimating = false;
      if (this.restartRequested) this.runPendingRestart();
    }, 640);
  }

  handleTargetTap(direction) {
    this.resetIdleHint();
    if (this.ageGateActive || this.isAnimating || this.isCelebrating || !this.activeCard) return;
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

  // Customise pop-up transition: the current card flips away from the deck while the
  // pop-up flips in from the same direction. The card is copied onto a fixed layer so it
  // stays visible above the dimmed overlay.
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // Copies `element` onto a fixed layer and flips the copy out to the left.
  // `animateBack` = true means closing the pop-up flips the copy back in (used for the card).
  flipOutForModal(element, { animateBack = true } = {}) {
    if (!element || this.prefersReducedMotion()) return;

    const rect = element.getBoundingClientRect();
    const stage = document.createElement('div');
    stage.className = 'card-flip-stage';
    const ghost = element.cloneNode(true);
    // The copy sits in a box as wide as the card, so its container-relative sizes (title, buttons) match the original.
    // Perspective lives on this box: it must sit on the ghost's direct parent, because the stage's own
    // perspective doesn't reach a grandchild — without it the flip-out renders as a flat 2D squash
    // (the popup "collapses" sideways on wide screens). Depth scales with the panel width so big
    // pop-ups don't over-skew at the same angle that reads naturally on a phone.
    const depth = Math.max(1200, rect.width * 2.2);
    const box = document.createElement('div');
    box.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;container-type:inline-size;perspective:${depth}px;pointer-events:none;`;
    // The clone has left its #info-modal / #customise-modal subtree, so ID-scoped sizing
    // (width: clamp(480px, 86vmin, 1120px) at >=720px) no longer matches and the base
    // .modal-content max-width: 480px cap snaps it small, anchored to the box's left edge —
    // the "collapse into the left" on wide screens. Clear the maxes so the fixed box
    // (sized from the measured rect) is the sole source of truth for the clone's geometry.
    // Inline width can never beat a max-width cap, so max-width/max-height must go too.
    ghost.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;margin:0;max-width:none;max-height:none;transform:none;transition:none;pointer-events:none;';
    box.append(ghost);
    // Carry over scrolled content: the clone's scroll containers reset to the top, which
    // would make a scrolled How to Play list visibly jump during the flip
    const originalEls = [element, ...element.querySelectorAll('*')];
    const cloneEls = [ghost, ...ghost.querySelectorAll('*')];
    originalEls.forEach((el, i) => {
      const copy = cloneEls[i];
      if (!copy) return;
      if (el.scrollTop) copy.scrollTop = el.scrollTop;
      if (el.scrollLeft) copy.scrollLeft = el.scrollLeft;
    });
    stage.append(box);
    document.body.append(stage);
    element.style.visibility = 'hidden';

    ghost.animate([
      { transform: 'rotateY(0deg) translateX(0)', opacity: 1, filter: 'blur(0px)' },
      { transform: 'rotateY(-75deg) translateX(-60px) scale(0.92)', opacity: 0, filter: 'blur(10px)' }
    ], { duration: 520, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' });

    this.customiseFlip = { element, stage, ghost, animateBack };
  }

  flipModalIn(delay = 160) {
    if (this.prefersReducedMotion()) return;
    const content = this.customiseModal.querySelector('.modal-content');
    // Perspective grows with the pop-up width so widescreen panels flip with the same
    // moderate depth as phone-sized ones instead of skewing into a harsh trapezoid
    const depth = Math.max(1200, content.getBoundingClientRect().width * 2.2);
    content.animate([
      { transform: `perspective(${depth}px) rotateY(75deg) translateX(40px) scale(0.92)`, opacity: 0 },
      { transform: `perspective(${depth}px) rotateY(0deg) translateX(0) scale(1)`, opacity: 1 }
    ], { duration: 520, delay, easing: 'cubic-bezier(0.2, 0.85, 0.25, 1)', fill: 'backwards' });
  }

  returnFlippedPanel({ animate = true } = {}) {
    const flip = this.customiseFlip;
    if (!flip) return;
    this.customiseFlip = null;

    const finish = () => {
      flip.stage.remove();
      flip.element.style.visibility = '';
    };

    if (!animate || !flip.animateBack || this.prefersReducedMotion()) {
      finish();
      return;
    }
    flip.ghost.animate([
      { transform: 'rotateY(-75deg) translateX(-60px) scale(0.92)', opacity: 0, filter: 'blur(10px)' },
      { transform: 'rotateY(0deg) translateX(0)', opacity: 1, filter: 'blur(0px)' }
    ], { duration: 420, easing: 'cubic-bezier(0.2, 0.85, 0.25, 1)', fill: 'forwards' }).onfinish = finish;
  }

  bindEvents() {
    const groupDescriptionExamples = [
      'A bride-to-be, her ex, and eight friends with Ibiza screenshots.',
      'Six coworkers, one office crush, and a group chat to avoid.',
      'Four gay besties, three exes, and no one trusted with the aux.',
      'Two couples, one situationship, and a holiday photo nobody explained.',
      'A birthday girl, her chaotic roommates, and “one more bar.”'
    ];
    let nextGroupDescriptionExample = 0;
    const openCustomiseModal = ({ from = 'card' } = {}) => {
      this.updateSpicyLevelPreview(this.spicyLevel);
      const descriptionField = this.customiseModal.querySelector('.customise-group-description');
      descriptionField.placeholder = groupDescriptionExamples[nextGroupDescriptionExample];
      nextGroupDescriptionExample = (nextGroupDescriptionExample + 1) % groupDescriptionExamples.length;
      if (from === 'setup') {
        // First game: the pop-up comes in over the still-open deck screen; the fade
        // to black waits until Skip or Save and Play
        this.customiseModal.classList.add('is-setup');
        this.customiseModal.classList.add('active');
      } else if (from === 'shot') {
        this.customiseModal.classList.add('active');
      } else if (from === 'info') {
        // How to Play panel flips out (the card stays put), then the info overlay is hidden
        this.flipOutForModal(this.infoModal.querySelector('.modal-content'), { animateBack: false });
        // Hand the dark backdrop over instantly so it doesn't dip while the panels swap
        this.infoModal.classList.add('no-fade');
        this.infoModal.classList.remove('active');
        this.customiseModal.classList.add('no-fade');
        this.customiseModal.classList.add('active');
        requestAnimationFrame(() => {
          this.infoModal.classList.remove('no-fade');
          this.customiseModal.classList.remove('no-fade');
        });
      } else {
        this.flipOutForModal(this.stackContainer.querySelector('.game-card.current'), { animateBack: true });
        this.customiseModal.classList.add('active');
      }
      this.flipModalIn();
      // Focus starts on the first audience tick (Mostly men) so pressing an
      // arrow or Space begins in the pop-up's flow, not on the close ✕ in the
      // corner. The re-assert rides out the 160ms flip-in delay, which can
      // still be settling when the first key lands.
      const focusFirstTick = () => {
        // Leave any focus that already moved inside the pop-up alone
        if (this.customiseModal.contains(document.activeElement)) return;
        this.customiseModal.querySelector('.customise-audience-option')?.focus({ preventScroll: true });
        this.customiseKeyCol = 0;
      };
      focusFirstTick();
      setTimeout(focusFirstTick, 180);
      this.updateSpicyLevelPreview(this.spicyLevel);
    };
    this.openCustomiseModal = openCustomiseModal;

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

    const closeCustomiseModal = ({ returnCard = true } = {}) => {
      // During game setup, closing the pop-up just reveals the deck screen again;
      // Skip and Save and Play are what start the game
      if (this.setupStep) {
        this.cancelSetup();
        return;
      }
      this.customiseModal.classList.remove('active');
      this.returnFlippedPanel({ animate: returnCard });
      // Focus returns to the start bar's CUSTOMIZE button (the one that opened the pop-up)
      this.shotCustomise?.focus({ preventScroll: true });
    };
    this.closeCustomiseModal = closeCustomiseModal;
    this.customiseModal.querySelector('.customise-modal-close').addEventListener('click', () => {
      sounds.playClick();
      closeCustomiseModal();
    });
    // Reads the intensity slider; returns false if no level is selected
    const applyCustomiseSettings = () => {
      const selectedLevelIndex = Number(this.customiseModal.querySelector('.customise-level-slider').value);
      const selectedLevel = SPICY_LEVELS[selectedLevelIndex];
      if (!selectedLevel) {
        this.showToast('Choose a card intensity level before saving.');
        return false;
      }

      const levelChanged = selectedLevel !== this.spicyLevel;
      this.spicyLevel = selectedLevel;
      this.updateSpicyLevelPresentation();
      if (levelChanged) {
        this.questions.spicy = [...SPICY_QUESTION_LEVELS[selectedLevel]];
      }
      return true;
    };
    this.customiseModal.querySelector('.customise-modal-done').addEventListener('click', () => {
      sounds.playClick();
      if (this.setupStep) {
        if (!applyCustomiseSettings()) return;
        this.finishSetup();
        return;
      }
      if (!applyCustomiseSettings()) return;
      this.showToast('New level');
      closeCustomiseModal({ returnCard: false });
      if (this.gameMode === 'shot-dare') {
        // Shot dare has no deck to reshuffle: back to the intro, which uses the new intensity
        this.showShotIntro();
      } else {
        this.reshuffleGame();
      }
    });
    this.customiseModal.querySelector('.customise-skip-btn').addEventListener('click', () => {
      sounds.playClick();
      if (this.setupStep) {
        this.finishSetup();
        return;
      }
      closeCustomiseModal();
    });

    // Deck screen: tap to preview, double click or double tap to select and enter
    let lastDeckTapTime = 0;
    let lastDeckTapMode = null;

    this.modeModal.querySelectorAll('.mode-option').forEach((option) => {
      const selectDeck = (isDouble) => {
        this.pendingMode = option.dataset.mode;
        this.syncModeOptions();
        sounds.init();
        sounds.playClick();
        if (isDouble) {
          this.chooseMode();
        }
      };

      option.addEventListener('click', () => {
        const now = Date.now();
        const mode = option.dataset.mode;
        const isDouble = (now - lastDeckTapTime < 450) && (lastDeckTapMode === mode);
        if (isDouble) {
          lastDeckTapTime = 0;
          lastDeckTapMode = null;
          selectDeck(true);
        } else {
          lastDeckTapTime = now;
          lastDeckTapMode = mode;
          selectDeck(false);
        }
      });

      option.addEventListener('dblclick', (e) => {
        e.preventDefault();
        if (!this.modeModal.classList.contains('active')) return;
        // Same behaviour as pressing SELECT (its first click already previewed the deck)
        this.modeModal.querySelector('.deck-play').click();
      });
    });
    document.getElementById('deck-info-btn').addEventListener('click', () => {
      sounds.playClick();
      this.openInfo('deck');
    });
    document.querySelector('.deck-sound-btn').addEventListener('click', () => {
      this.soundToggleBtn.click();
    });
    window.addEventListener('resize', () => this.positionDeckTrack());
    // The dare card pattern re-flows to the card shape when crossing the phone breakpoint
    window.matchMedia('(max-width: 719px)').addEventListener('change', () => this.applyDarePatterns());
    // Phones: swipe sideways on the decks to change the selection
    const deckTrack = this.modeModal.querySelector('.deck-list');
    let deckStartX = null;
    deckTrack.addEventListener('pointerdown', (e) => { deckStartX = e.clientX; });
    deckTrack.addEventListener('pointercancel', () => { deckStartX = null; });
    deckTrack.addEventListener('pointerup', (e) => {
      if (deckStartX === null) return;
      const dx = e.clientX - deckStartX;
      deckStartX = null;
      if (Math.abs(dx) < 40) return;
      const index = DECK_ORDER.indexOf(this.pendingMode);
      const next = Math.min(DECK_ORDER.length - 1, Math.max(0, index + (dx < 0 ? 1 : -1)));
      this.pendingMode = DECK_ORDER[next];
      this.syncModeOptions();
      sounds.playClick();
    });
    this.modeModal.querySelector('.deck-play').addEventListener('click', () => {
      sounds.init();
      sounds.playClick();
      this.chooseMode();
    });

    // Who most likely: the arrows move on, the same as a swipe left or right
    document.querySelectorAll('#next-pill .next-arrow[data-dir]').forEach((arrow) => {
      arrow.addEventListener('click', () => {
        if (arrow.dataset.dir === 'left') this.undoLastCard();
        else this.handleTargetTap('right');
      });
    });
    // Classic on widescreen: the Random card key, same as pressing Space
    document.getElementById('classic-random').addEventListener('click', () => {
      const dirs = ['top', 'left', 'right', 'bottom'];
      const direction = dirs[Math.floor(Math.random() * dirs.length)];
      this.popKeyboardTargetArrow(direction);
      this.handleTargetTap(direction);
    });
    // The Indeed pill used to live in the bottom bar; it now lives on the card itself

    // Start bar: CUSTOMIZE and START sit below the intro card in every game
    this.shotCustomise.addEventListener('click', () => {
      sounds.playClick();
      // The card-deck games flip their intro card out for the pop-up; shot dare has its own card slot
      openCustomiseModal({ from: this.gameMode === 'shot-dare' ? 'shot' : 'card' });
    });
    this.shotAction.addEventListener('click', () => this.shotPrimaryAction());
    // The dare picker: previous, pick, next
    document.getElementById('dare-prev').addEventListener('click', () => this.setDareFocus(this.dareFocus - 1));
    document.getElementById('dare-next').addEventListener('click', () => this.setDareFocus(this.dareFocus + 1));
    document.getElementById('dare-pick').addEventListener('click', () => this.chooseShotDare(this.shotDareCards[this.dareFocus]));
    this.shotDareCards.forEach((card) => {
      card.querySelector('.dare-again').addEventListener('click', (e) => {
        e.stopPropagation();
        sounds.playClick();
        this.pickAgain();
      });
    });
    this.shotDareCards.forEach((card) => {
      card.addEventListener('click', () => this.chooseShotDare(card));
    });
    // Swipe sideways across the dares to move the highlight
    const dareRow = this.shotDares.querySelector('.shot-dare-row');
    let dareStartX = null;
    dareRow.addEventListener('pointerdown', (e) => { dareStartX = e.clientX; });
    dareRow.addEventListener('pointercancel', () => { dareStartX = null; });
    dareRow.addEventListener('pointerup', (e) => {
      if (dareStartX === null || this.shotPhase !== 'dare') {
        dareStartX = null;
        return;
      }
      const dx = e.clientX - dareStartX;
      dareStartX = null;
      if (Math.abs(dx) >= 40) this.setDareFocus(this.dareFocus + (dx < 0 ? 1 : -1));
    });

    // Customise: intensity slider and names, audience choices, and the backdrop
    const levelSlider = this.customiseModal.querySelector('.customise-level-slider');
    levelSlider.addEventListener('input', () => {
      const level = SPICY_LEVELS[Number(levelSlider.value)];
      if (level) this.updateSpicyLevelPreview(level);
    });
    window.addEventListener('resize', () => {
      const level = SPICY_LEVELS[Number(levelSlider.value)];
      if (level) this.updateSpicyLevelPreview(level);
      // Classic widescreen keeps the swipe targets aligned with the surrounding UI
      this.syncClassicTargetAlignment();
    });
    // Tapping a level's name selects it, the same as dragging the slider to it
    this.customiseModal.querySelectorAll('.customise-level-option').forEach((option) => {
      option.addEventListener('click', () => {
        const index = SPICY_LEVELS.indexOf(option.dataset.level);
        if (index < 0) return;
        levelSlider.value = String(index);
        this.updateSpicyLevelPreview(option.dataset.level);
        sounds.playClick();
      });
    });
    this.customiseModal.querySelectorAll('.customise-audience-option').forEach((option) => {
      option.addEventListener('click', () => {
        const isSelected = option.getAttribute('aria-pressed') === 'true';
        option.setAttribute('aria-pressed', String(!isSelected));
        sounds.playClick();
      });
    });
    this.customiseModal.addEventListener('click', (e) => {
      // Tapping the backdrop closes the normal pop-up, but not the setup step: it needs an explicit Save or Skip
      if (e.target === this.customiseModal && !this.setupStep) closeCustomiseModal();
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
    document.getElementById('home-btn').addEventListener('click', () => {
      sounds.playClick();
      this.goHome();
    });

    // Info Modal
    const infoBtn = document.getElementById('info-btn');
    const closeInfoBtn = document.getElementById('close-info-btn');
    const infoCustomiseBtn = document.getElementById('info-customise-btn');
    const infoLetsPlayBtn = document.getElementById('info-lets-play-btn');
    infoBtn.addEventListener('click', () => {
      sounds.playClick();
      this.openInfo(this.gameMode);
    });
    infoCustomiseBtn.addEventListener('click', () => {
      sounds.playClick();
      openCustomiseModal({ from: 'info' });
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

  // Arrow keys move between the decks; Enter or Space plays the one selected
  handleDeckKey(e) {
    const order = ['classic', 'most-likely', 'shot-dare'];
    const index = order.indexOf(this.pendingMode);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      this.pendingMode = order[(index + order.length - 1) % order.length];
      this.syncModeOptions();
      this.modeModal.querySelector(`.mode-option[data-mode="${this.pendingMode}"]`)?.focus({ preventScroll: true });
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      this.pendingMode = order[(index + 1) % order.length];
      this.syncModeOptions();
      this.modeModal.querySelector(`.mode-option[data-mode="${this.pendingMode}"]`)?.focus({ preventScroll: true });
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (e.target.closest?.('.deck-play')) return; // the button handles its own click
      e.preventDefault();
      this.chooseMode();
    }
  }

  // Who is playing pop-up: the keyboard works the way the layout looks. Down from
  // "Mostly women" lands on "Coworkers" (same column, one row below); the flow
  // continues down through the slider, the description box and the footer.
  // The cursor's column is remembered on the way down so Up returns where Down came from.
  moveCustomiseFocus(key, onSlider = false) {
    const modal = this.customiseModal;
    const slider = modal.querySelector('.customise-level-slider');
    const description = modal.querySelector('.customise-group-description');
    const active = document.activeElement;
    const chips = Array.from(modal.querySelectorAll('.customise-audience-option'));
    const focusEl = (el) => el?.focus({ preventScroll: true });

    // Laid out as rows: -1 the close ✕ (top-right), 0-1 the audience chips in
    // three columns, 2 the slider, 3 the description, 4 the Skip/Save footer
    const chipIndex = chips.indexOf(active);
    const isClose = modal.contains(active) && active.matches?.('.customise-modal-close');
    const isSkip = modal.contains(active) && active.matches?.('.customise-skip-btn');
    const isSave = modal.contains(active) && active.matches?.('.customise-modal-done');
    let col;
    let row;
    if (chipIndex >= 0) {
      row = Math.floor(chipIndex / 3);
      col = chipIndex % 3;
      this.customiseKeyCol = col;
    } else if (isClose) {
      row = -1;
      col = 2;
    } else if (active === slider || onSlider) {
      row = 2;
      col = this.customiseKeyCol ?? 1;
    } else if (active === description) {
      row = 3;
      col = this.customiseKeyCol ?? 1;
    } else if (isSkip || isSave) {
      row = 4;
      col = isSave ? 2 : 0;
      this.customiseKeyCol = col;
    } else {
      // Nothing focused yet (or focus lost): start on the first chip
      row = 0;
      col = 0;
    }

    if (key === 'ArrowDown') {
      if (row >= 4) return; // the footer is the bottom edge
      row += 1;
    } else if (key === 'ArrowUp') {
      if (row <= 0) {
        // Up from the chip grid reaches the ✕ in the pop-up's top corner
        focusEl(modal.querySelector('.customise-modal-close'));
        return;
      }
      row -= 1;
    } else if (key === 'ArrowLeft' || key === 'ArrowRight') {
      // Horizontal moves stay inside the current row: the chips wrap around
      // within their row and the footer toggles between Skip and Save
      if (row === 0 || row === 1) {
        col = ((col + (key === 'ArrowRight' ? 1 : -1)) % 3 + 3) % 3;
        this.customiseKeyCol = col;
        focusEl(chips[row * 3 + col]);
      } else if (row === 4) {
        focusEl(isSave ? modal.querySelector('.customise-skip-btn') : modal.querySelector('.customise-modal-done'));
      }
      return;
    } else {
      return;
    }

    if (row === -1) focusEl(modal.querySelector('.customise-modal-close'));
    else if (row === 0 || row === 1) focusEl(chips[row * 3 + col]);
    else if (row === 2) focusEl(slider);
    else if (row === 3) focusEl(description);
    else if (row === 4) focusEl(col >= 2 ? modal.querySelector('.customise-modal-done') : modal.querySelector('.customise-skip-btn'));
  }

  handleCustomiseKey(e) {
    const modal = this.customiseModal;
    const slider = modal.querySelector('.customise-level-slider');
    const description = modal.querySelector('.customise-group-description');
    // Most key events land on the focused element, but a slider that was
    // clicked (some browsers don't focus it) reports itself as the target
    let active = document.activeElement;
    let reanchored = false;
    // A key press with nothing focused inside the pop-up (opening animation,
    // a stray click) anchors itself on the first tick, Mostly men, first
    if (!modal.contains(active)) {
      active = modal.querySelector('.customise-audience-option');
      active?.focus({ preventScroll: true });
      this.customiseKeyCol = 0;
      reanchored = true;
    }
    const onSlider = active === slider || e.target === slider;

    // The slider steps the heat on Left/Right (stepped here, not natively, so
    // it works whether or not the browser gave the range real focus) and
    // pushes past itself on Up/Down, to the chips above and the box below
    if (onSlider && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      const direction = e.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = Math.min(SPICY_LEVELS.length - 1, Math.max(0, Number(slider.value) + direction));
      if (String(nextIndex) !== slider.value) {
        slider.value = String(nextIndex);
        this.updateSpicyLevelPreview(SPICY_LEVELS[nextIndex]);
        sounds.playClick();
      }
      return;
    }
    if (onSlider && (e.key === 'Home' || e.key === 'End')) return;

    // Typing owns the description box: Left/Right are caret movement and the
    // arrows only leave the box when the caret can't move further — on the
    // first line going up, or the last line going down
    if (active === description) {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
      const value = description.value;
      const pos = description.selectionStart ?? value.length;
      const caretCanMove = e.key === 'ArrowUp'
        ? value.slice(0, pos).includes('\n')
        : value.slice(pos).includes('\n');
      if (caretCanMove) return;
    } else if (active?.matches?.('input, textarea')) {
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // A focused control gets pressed: an audience tick, the close ✕, Skip or Save
      if (!reanchored && modal.contains(active) && active.matches?.('button')) {
        active.click();
        return;
      }
      // With nothing in focus: Enter saves (only Enter does, as the SAVE AND
      // PLAY pill says); Space ticks Mostly men so the pop-up reacts at once.
      // Space stays inert on the slider, which has nothing to press.
      if (e.key === 'Enter') {
        modal.querySelector('.customise-modal-done').click();
      } else if (!onSlider) {
        modal.querySelector('.customise-audience-option')?.click();
      }
      return;
    }

    // Delete (or Backspace — Macs label ⌫ "delete") is the Skip shortcut, as its pill says
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      modal.querySelector('.customise-skip-btn').click();
      return;
    }

    if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      this.moveCustomiseFocus(e.key, onSlider);
    }
  }

  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Escape closes the top pop-up first, then goes Home (the deck screen) from anywhere
      if (e.key === 'Escape') {
        if (this.customiseModal.classList.contains('active')) {
          this.closeCustomiseModal();
        } else if (this.infoModal.classList.contains('active')) {
          this.infoModal.classList.remove('active');
        } else if (this.ageGateActive) {
          // On the age question Esc is the "No" answer (the pill on the button)
          const noBtn = this.stackContainer.querySelector('.age-gate-no');
          const yesBtn = this.stackContainer.querySelector('.age-gate-yes');
          if (noBtn && yesBtn && !yesBtn.disabled) {
            e.preventDefault();
            noBtn.click();
          }
        } else if (!this.modeModal.classList.contains('active')) {
          this.goHome();
        }
        return;
      }
      if (this.customiseModal.classList.contains('active')) {
        // Enter = Save (Space only presses the focused control, Delete = Skip,
        // and the arrows move between the controls — this.handleCustomiseKey).
        // Esc is handled above.
        this.handleCustomiseKey(e);
        return;
      }
      if (this.infoModal.classList.contains('active')) {
        // Customize = Enter, Let's Play = Space. Esc is handled above.
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (e.key === 'Enter') sounds.playClick();
          // Enter activates Customize exactly like a click; Space reveals the game
          if (e.key === 'Enter') {
            document.getElementById('info-customise-btn').click();
          } else {
            this.infoModal.classList.remove('active');
          }
        }
        return;
      }
      if (this.modeModal.classList.contains('active')) {
        this.handleDeckKey(e);
        return;
      }
      if (this.ageGateActive) {
        // The age gate pills tell the truth: Enter or Space = Yes (Esc is "No", handled above)
        const yesBtn = this.stackContainer.querySelector('.age-gate-yes');
        if (yesBtn && !yesBtn.disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          yesBtn.click();
        }
        return;
      }
      if (this.isCelebrating || this.ageGateActive) return;
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
      // Holding a key down doesn't fire a stream of swipes; each press counts once
      const isGameKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter'].includes(e.key);
      if (e.repeat && isGameKey) {
        e.preventDefault();
        return;
      }

      // While waiting at the start bar: ENTER is the CUSTOMIZE shortcut; Space starts
      if (this.awaitingStart) {
        if (e.key === 'Enter') {
          e.preventDefault();
          sounds.playClick();
          this.openCustomiseModal({ from: this.gameMode === 'shot-dare' ? 'shot' : 'card' });
          return;
        }
        if (e.key === ' ' || e.key.startsWith('Arrow')) {
          e.preventDefault();
          const isArrow = e.key.startsWith('Arrow');
          // An arrow key starts the game and plays that swipe in one motion,
          // exactly like a first drag; Space reveals the first card on its own.
          this.beginStart({ flipCard: !isArrow });
          if (isArrow) {
            const dir = { ArrowUp: 'top', ArrowDown: 'bottom', ArrowLeft: 'left', ArrowRight: 'right' }[e.key];
            this.handleTargetTap(dir);
          }
        }
        return;
      }

      if (this.gameMode === 'most-likely') {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          return;
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.undoLastCard();
          return;
        }
        if (e.key === ' ') {
          e.preventDefault();
          // Space is Next (like →); Indeed is on the card via Enter
          if (this.activeCard?.dataset.cardType === 'level-up') return;
          this.handleTargetTap('right');
          return;
        }
      }

      if (this.gameMode === 'shot-dare') {
        if (this.shotPhase === 'dare') {
          // Left and up go back, right and down go on
          if (['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(e.key)) {
            e.preventDefault();
            this.setDareFocus(this.dareFocus + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1));
          } else if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            this.chooseShotDare(this.shotDareCards[this.dareFocus]);
          }
          return;
        }
        if (e.key === ' ') {
          e.preventDefault();
          // On a revealed dare Space is Pick again (its pill says so); Enter carries on
          if (this.shotPhase === 'revealed') this.pickAgain();
          else this.shotPrimaryAction();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.shotPrimaryAction();
        } else if (e.key.startsWith('Arrow')) {
          e.preventDefault();
        }
        if (e.key === 'm' || e.key === 'M') this.soundToggleBtn.click();
        return;
      }

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
        case 'Enter':
          e.preventDefault();
          // The card's own button: Classic = DONE IT, Most-Likely = INDEED
          if (this.activeCard?.dataset.cardType === 'level-up') break;
          this.celebrateDoneIt();
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
