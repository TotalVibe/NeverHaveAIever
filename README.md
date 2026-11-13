# Never Have AI ever • Tinder Swipe Edition 🔥

A modern, tactile **Never Have AI ever** party web application featuring Tinder-style card sliding mechanics to choose the topic of the next question.

## ✨ Features

- **Tinder-Style Sliding Physics**: Drag cards using mouse or touch gestures with realistic tilt, inertia, spring snaps, and fly-out animations.
- **4-Directional Emoji Topic Selectors**:
  - ⬆️ **TOP — 😈 Spicy & Wild**: Dating secrets, romantic fails, guilty pleasures & intimate truths.
  - ⬅️ **LEFT — 😳 Awkward & Cringe**: Hilarious fails, embarrassing moments & caught red-handed memories.
  - ➡️ **RIGHT — 🥳 Party & Chaos**: Nightlife adventures, drinking dares, wild stunts & festival stories.
  - ⬇️ **DOWN — 😇 Wholesome & Quirky**: Childhood memories, funny daily habits, food quirks & relatable life.
- **Tap-to-Select**: Tap any of the 4 directional emoji icons to instantly choose that category.
- **Dynamic Stamps & Target Proximity**: Real-time visual stamps appear on the card as you drag towards each emoji, while the target emoji illuminates with its signature neon glow.
- **Built-in Web Audio API Effects**: Completely offline synthesized sound effects for swipe whooshes, spicy sizzles, party fanfares, wholesome chimes, cringe boings, and taps.

- **Reshuffle**: Reset the deck to its face-down opening card with a short shuffle animation.
- **➕ Custom Card Creator**: Add your own inside jokes or party questions to any category (persisted in `localStorage`).
- **↺ Undo**: Revisit accidentally swiped cards from the header or with the `Z` shortcut.
- **⌨️ Keyboard Shortcuts**:
  - `↑` (Arrow Up): Spicy
  - `←` (Arrow Left): Cringe
  - `→` (Arrow Right): Party
  - `↓` (Arrow Down): Wholesome
  - `Space`: Choose a random topic
  - `Z`: Undo previous card
  - `H`: React "I Have!"
  - `N`: React "Never!"
  - `M`: Toggle Sound (Mute/Unmute)
- **Idle Hint**: "Drag card or tap emoji" fades in after 7 seconds without interaction.

## 🚀 How to Run

Simply open [index.html](file:///Users/mollevi/Downloads/AI%20test/index.html) in any web browser!

Or serve locally with Python:
```bash
python3 -m http.server 3000
```
Then visit `http://localhost:3000`.
