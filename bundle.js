// Never Have AI ever - Tinder Sliding Edition (Enhanced -Y Stack Deck & Cursive Title)
(function() {
// Comprehensive bank of Never Have I Ever questions organized by categories

const CATEGORIES = {
  top: {
    id: 'spicy',
    name: 'Spicy & Wild',
    emoji: '😈',
    color: '#ff2d75',
    gradient: 'linear-gradient(135deg, #ff2d75, #ff0844)',
    glow: 'rgba(255, 45, 117, 0.45)',
    description: 'Naughty, dating, crushes, intimate secrets & wild romance',
    direction: 'TOP'
  },
  left: {
    id: 'cringe',
    name: 'Awkward & Cringe',
    emoji: '😳',
    color: '#ff922b',
    gradient: 'linear-gradient(135deg, #ff922b, #f08c00)',
    glow: 'rgba(255, 146, 43, 0.45)',
    description: 'Embarrassing fails, cringeworthy moments & caught red-handed',
    direction: 'LEFT'
  },
  right: {
    id: 'party',
    name: 'Party & Chaos',
    emoji: '🥳',
    color: '#38d9a9',
    gradient: 'linear-gradient(135deg, #20c997, #0ca678)',
    glow: 'rgba(56, 217, 169, 0.45)',
    description: 'Nightlife, drinking games, crazy dares & wild nights out',
    direction: 'RIGHT'
  },
  bottom: {
    id: 'wholesome',
    name: 'Wholesome & Quirky',
    emoji: '😇',
    color: '#748ffc',
    gradient: 'linear-gradient(135deg, #748ffc, #4263eb)',
    glow: 'rgba(116, 143, 252, 0.45)',
    description: 'Everyday habits, childhood memories, travel & funny quirks',
    direction: 'DOWN'
  }
};

const QUESTIONS = {
  spicy: [
    "Never have AI ever flirted with someone just to get free food or drinks.",
    "Never have AI ever kissed an ex after swearing I was completely over them.",
    "Never have AI ever sent a risky text and immediately thrown my phone across the room in panic.",
    "Never have AI ever had a crush on a friend's sibling or parent.",
    "Never have AI ever lied about my 'number' to seem either more innocent or more experienced.",
    "Never have AI ever skinny dipped under the stars.",
    "Never have AI ever practiced kissing on my hand or a pillow.",
    "Never have AI ever stalked an ex's new partner on three different social media platforms.",
    "Never have AI ever ghosted someone because their texting vibe gave me the ick.",
    "Never have AI ever accidentally sent a screenshot of a conversation TO the person I took the screenshot of.",
    "Never have AI ever made out in a cinema during the movie.",
    "Never have AI ever had a romantic dream about someone sitting in this room.",
    "Never have AI ever pretended to like someone's music or hobby just to impress them.",
    "Never have AI ever slid into a verified person or minor celebrity's DMs.",
    "Never have AI ever kissed someone whose name I didn't actually remember.",
    "Never have AI ever had a secret relationship or situationship nobody knew about.",
    "Never have AI ever used a cheesy pick-up line in real life and had it actually work.",
    "Never have AI ever accidentally liked a post from 4 years ago while deep-stalking someone at 2 AM.",
    "Never have AI ever stayed the night with someone just because their apartment was closer than mine.",
    "Never have AI ever made a fake social media profile to spy on someone.",
    "Never have AI ever fallen in love with someone after just one conversation.",
    "Never have AI ever been caught making out somewhere I definitely shouldn't have been.",
    "Never have AI ever lied about having an emergency to escape a dreadful date.",
    "Never have AI ever re-gifted a romantic gift to a different romantic interest.",
    "Never have AI ever swiped right on someone strictly for their pet.",
    "Never have AI ever walked out on a date before the check even arrived.",
    "Never have AI ever accidentally kissed a cheek when going for a hug (or vice versa).",
    "Never have AI ever had a crush on a teacher, professor, or boss.",
    "Never have AI ever stayed in a relationship longer than I should have just for holiday gifts or a planned trip.",
    "Never have AI ever left a romantic partner on 'read' for more than 24 hours on purpose.",
    "Never have AI ever been to a drive-in theater and barely watched the movie.",
    "Never have AI ever had someone write a song or poem about me.",
    "Never have AI ever agreed to a second date purely because the restaurant was fancy.",
    "Never have AI ever had a secret crush on one of my best friend's exes.",
    "Never have AI ever given a fake phone number to someone who asked me out.",
    "Never have AI ever dressed up way too fancy for what was supposed to be a 'casual hangout'."
  ],
  cringe: [
    "Never have AI ever waved back enthusiastically at someone who was waving to the person right behind me.",
    "Never have AI ever pulled a door that clearly said PUSH in front of a crowd.",
    "Never have AI ever called my teacher or boss 'Mom' or 'Dad' by accident.",
    "Never have AI ever tripped on flat ground and tried to turn it into a cool jog.",
    "Never have AI ever said 'You too!' when the waiter said 'Enjoy your meal!'",
    "Never have AI ever walked into a glass door or window that was cleaned too well.",
    "Never have AI ever smiled and nodded through an entire conversation because I had no idea what they said.",
    "Never have AI ever walked into the wrong restroom and only realized after seeing the urinals/stalls.",
    "Never have AI ever had food stuck between my front teeth for hours without anyone telling me.",
    "Never have AI ever spent 10 minutes frantically looking for my sunglasses while they were on my head.",
    "Never have AI ever pretended to be talking on my phone just to avoid acknowledging someone.",
    "Never have AI ever had my stomach make an ungodly loud noise during dead silence in class or an exam.",
    "Never have AI ever sung the completely wrong lyrics at the top of my lungs in front of everyone.",
    "Never have AI ever dropped my phone straight onto my face while scrolling in bed.",
    "Never have AI ever accidentally sent a voice note or selfie of my double chin to a work chat.",
    "Never have AI ever walked in the wrong direction, realized it, pulled out my phone, and pretended I had a notification to turn around.",
    "Never have AI ever sneezed so hard that something flew out and landed on someone else's desk.",
    "Never have AI ever tried to high-five someone who was going for a fist bump and ended up grabbing their fist.",
    "Never have AI ever had my card declined at a grocery checkout for something under $5.",
    "Never have AI ever replied 'Good, how are you?' when the cashier simply said 'Hello.'",
    "Never have AI ever gotten stuck inside a sweater or shirt in a dressing room.",
    "Never have AI ever fallen asleep on a bus, train, or plane and drooled on the stranger next to me.",
    "Never have AI ever accidentally worn two completely different shoes or socks inside out to an event.",
    "Never have AI ever looked in the mirror after hours of socializing and seen something truly horrifying.",
    "Never have AI ever had a wardrobe malfunction on a dance floor or stage.",
    "Never have AI ever farted in an elevator right before three other people got on.",
    "Never have AI ever thought someone was talking to me when they were actually wearing AirPods.",
    "Never have AI ever rehearsed a conversation 50 times in my head only to completely butcher it in reality.",
    "Never have AI ever googled my own name to see what comes up.",
    "Never have AI ever laughed so hard that beverage came out of my nose in public.",
    "Never have AI ever sent an email with an embarrassing typo like 'Best retards' instead of 'Best regards'."
  ],
  party: [
    "Never have AI ever woken up somewhere with no recollection of how I got into bed.",
    "Never have AI ever lost my phone, wallet, or keys during a single night out.",
    "Never have AI ever danced on top of a table, bar, or stage at a club.",
    "Never have AI ever accidentally gatecrashed a wedding, private birthday, or VIP area.",
    "Never have AI ever sung karaoke so terribly that people cheered ironically.",
    "Never have AI ever challenged someone to a drinking or shot competition and lost terribly.",
    "Never have AI ever eaten a 3 AM kebab, pizza, or taco off the floor because of the 5-second rule.",
    "Never have AI ever stolen a traffic cone, street sign, or restaurant pint glass on a dare.",
    "Never have AI ever gone to work or class directly from the club without sleeping.",
    "Never have AI ever spent my entire weekend budget in the first two hours of Friday night.",
    "Never have AI ever fallen asleep in the middle of a loud, roaring house party.",
    "Never have AI ever played beer pong with water cups that had mysterious particles floating in them.",
    "Never have AI ever jumped into a swimming pool with all my clothes on.",
    "Never have AI ever texted an ex at 3:15 AM claiming 'I just wanted to see how your dog is doing'.",
    "Never have AI ever ordered an Uber to the wrong city or 50 miles away by accident.",
    "Never have AI ever pretended it was my birthday at a restaurant just to get free dessert.",
    "Never have AI ever made friends in the club bathroom and promised we would be best friends forever.",
    "Never have AI ever been kicked out of a venue or bar.",
    "Never have AI ever tried to do a cartwheel, backflip, or split at a party and immediately injured myself.",
    "Never have AI ever hidden drinks or snacks in my jacket to smuggle into a festival or venue.",
    "Never have AI ever lost a shoe on a night out and had to walk with one bare foot.",
    "Never have AI ever agreed to a crazy bet and immediately regretted it as soon as everyone started filming.",
    "Never have AI ever danced with a mop, mannequin, or stranger's coat at a party.",
    "Never have AI ever opened a beverage bottle with something ridiculous like my teeth or a belt buckle.",
    "Never have AI ever ordered $80 worth of delivery food at 2 AM and eaten all of it alone.",
    "Never have AI ever crowd-surfed or been lifted up on shoulders at a concert.",
    "Never have AI ever tried to recreate a viral TikTok dance in the middle of a crowded bar.",
    "Never have AI ever gotten separated from my friends on a night out and joined another squad for the night."
  ],
  wholesome: [
    "Never have AI ever talked to a dog or cat with a baby voice like they understood English.",
    "Never have AI ever stepped only on specific floor tiles to avoid the invisible lava.",
    "Never have AI ever stayed up past 4 AM binge-watching a show I told myself I'd watch 'just one episode' of.",
    "Never have AI ever eaten an entire pint of ice cream or packet of cookies in a single sitting.",
    "Never have AI ever pretended to be in a dramatic music video while staring out a rainy car window.",
    "Never have AI ever put something away in a 'safe spot' so well that I couldn't find it for 2 years.",
    "Never have AI ever pushed all the buttons on an elevator as a kid and run away.",
    "Never have AI ever dipped french fries into a milkshake (and secretly loved it).",
    "Never have AI ever cried during an animated cartoon or Disney movie.",
    "Never have AI ever danced in front of my mirror with a hairbrush as a microphone.",
    "Never have AI ever built a massive blanket fort as an adult.",
    "Never have AI ever stayed in my pajamas for an entire 48-hour weekend.",
    "Never have AI ever re-read old texts and cringed at how I used to talk in 2015.",
    "Never have AI ever lied about my age to get the children's discount at a buffet or cinema.",
    "Never have AI ever ordered something online and then felt genuine surprise when the package arrived.",
    "Never have AI ever eaten breakfast cereal for dinner three days in a row.",
    "Never have AI ever spent 30 minutes scrolling Netflix trying to pick a movie and ended up watching nothing.",
    "Never have AI ever sung in the shower so enthusiastically that someone knocked to check on me.",
    "Never have AI ever tried to use Jedi mind tricks on automatic sliding doors at the supermarket.",
    "Never have AI ever watched a DIY or recipe video and genuinely believed I could make it effortlessly.",
    "Never have AI ever saved a post or recipe 'to cook this weekend' and never opened it again.",
    "Never have AI ever named an inanimate object like my car, laptop, or houseplant.",
    "Never have AI ever put my shoes on the wrong feet as an adult in the dark.",
    "Never have AI ever pretended to understand the plot of a movie just so I wouldn't seem lost.",
    "Never have AI ever bought something purely because the packaging was aesthetically pleasing.",
    "Never have AI ever checked behind the shower curtain for monsters or intruders before using the bathroom."
  ]
};


// High-fidelity synthesized sound effects using the Web Audio API
// Zero external audio files required, instant latency, full cross-browser compatibility

class SoundEffects {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Soft tactile click
  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Smooth swipe whoosh
  playSwoosh(direction = 'neutral') {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    filter.type = 'bandpass';
    filter.Q.value = 3;

    // Pitch variation based on direction
    let startFreq = 300;
    let endFreq = 700;
    if (direction === 'top') { startFreq = 400; endFreq = 950; }
    else if (direction === 'bottom') { startFreq = 650; endFreq = 280; }
    else if (direction === 'left') { startFreq = 450; endFreq = 350; }
    else if (direction === 'right') { startFreq = 350; endFreq = 750; }

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.16);

    filter.frequency.setValueAtTime(startFreq * 1.5, now);
    filter.frequency.exponentialRampToValueAtTime(endFreq * 2, now + 0.16);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Elastic snap back when card is dropped without swiping
  playSnapBack() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.09);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Category specific sound effects
  playCategorySound(direction) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    switch (direction) {
      case 'top': // 😈 Spicy: fiery sizzle & bass pulse
        this.playSpicySound(now);
        break;
      case 'left': // 😳 Cringe: comical spring wobble / boing
        this.playCringeSound(now);
        break;
      case 'right': // 🥳 Party: cheerful celebratory fanfare
        this.playPartySound(now);
        break;
      case 'bottom': // 😇 Wholesome: sweet crystalline chime
        this.playWholesomeSound(now);
        break;
      default:
        this.playSwoosh();
    }
  }

  playSpicySound(now) {
    // Low sub rumble + harmonic sizzle
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(110, now);
    osc1.frequency.exponentialRampToValueAtTime(220, now + 0.12);
    osc1.frequency.exponentialRampToValueAtTime(55, now + 0.28);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(220, now);
    osc2.frequency.exponentialRampToValueAtTime(440, now + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(110, now + 0.28);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.28);
    osc2.stop(now + 0.28);
  }

  playCringeSound(now) {
    // Comedic "boing" pitch bend
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(420, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.18);
    osc.frequency.linearRampToValueAtTime(320, now + 0.26);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  playPartySound(now) {
    // Energetic synth chord fanfare [C5, E5, G5, C6]
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const delay = idx * 0.04;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.1, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.25);
    });
  }

  playWholesomeSound(now) {
    // Dreamy crystalline bell arpeggio [E5, G#5, B5, E6]
    const notes = [659.25, 830.61, 987.77, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const delay = idx * 0.05;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.12, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.35);
    });
  }

  // Player reaction: "I Have!" (triumphant chime)
  playIHave() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [587.33, 880].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + (i * 0.06));
      gain.gain.setValueAtTime(0.15, now + (i * 0.06));
      gain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.06) + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + (i * 0.06));
      osc.stop(now + (i * 0.06) + 0.2);
    });
  }

  // Player reaction: "Never!" (soft wood tap)
  playNever() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.07);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }
}

const sounds = new SoundEffects();


// Lightweight particle confetti engine for reactions and milestone celebrations
class ConfettiEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.animationId = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(x, y, count = 35, colors = ['#ff2d75', '#ff922b', '#20c997', '#748ffc', '#ffd43b']) {
    if (!this.ctx) return;
    const originX = x ?? window.innerWidth / 2;
    const originY = y ?? window.innerHeight / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        life: 1,
        decay: Math.random() * 0.02 + 0.015
      });
    }

    if (!this.animationId) {
      this.loop();
    }
  }

  loop() {
    if (this.particles.length === 0) {
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      this.animationId = null;
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // gravity
      p.vx *= 0.98; // air drag
      p.rotation += p.rotationSpeed;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      this.ctx.restore();
    }

    this.animationId = requestAnimationFrame(() => this.loop());
  }
}



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

    // Modals
    this.infoModal = document.getElementById('info-modal');
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
    const card1 = this.createCardElement(cardData1, 'current', false); // Face-up on top

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

          <!-- Card Header (Category Tag Only - No copy, No number) -->
          <div class="card-header">
            <div class="category-tag" style="border-color: ${cat.color}66; color: ${cat.color};">
              <span class="cat-tag-emoji">${cat.emoji}</span>
              <span class="cat-tag-name">${cat.name}</span>
            </div>
          </div>

          <!-- Card Body Statement (Centered) -->
          <div class="card-body">
            <div class="prompt-prefix">Never Have I Ever...</div>
            <div class="prompt-text">${cleanQuestion}</div>
          </div>
        </div>

        <!-- Back Face (Vector Texture + Fancy Cursive 2-Line Title - NO DEVIL EMOJI) -->
        <div class="card-face card-back">
          <div class="vector-pattern"></div>
          <div class="card-back-frame">
            <div class="card-back-emblem">
              <div class="crest-diamond">◈</div>
              <div class="emblem-title">
                <span class="cursive-line">Never Have</span>
                <span class="cursive-line">AI Ever</span>
              </div>
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
      text: this.activeCard.dataset.fullText
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
      nextCard.style.pointerEvents = 'auto';
      nextCard.style.transform = 'scale(1) translateY(0px)';

      // 2. Prepare question content on the front face of this card
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
    }, 480);
  }

  undoLastCard() {
    if (this.isAnimating || this.cardHistory.length === 0) {
      this.showToast('No previous card to undo!');
      return;
    }
    this.isAnimating = true;

    const prevCardData = this.cardHistory.pop();
    const restoredCard = this.createCardElement(prevCardData, 'current', false);

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
})();
