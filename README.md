# Never Have AI ever

A swipe-based party game for choosing the next kind of “Never Have I Ever” prompt. Play with a group, pick a topic with a swipe or tap, and react with **Done It!** when a prompt applies to you.

## How to play

1. Open the game and reveal the first card.
2. Swipe the card toward a category, tap one of the emoji buttons, or use an arrow key to choose the topic for the next prompt.
3. Tap **Done It!** if you have done what the card describes. Each card only counts once, even if you undo it.
4. Keep playing: a level-up card appears after **15 card swipes or 7 Done It! responses**, whichever happens first. It appears once per round when a higher intensity is available.
5. On the level-up card, swipe right or choose **Yes** to advance the intensity; the next prompt comes from the newly selected spicy level. Swipe left or choose **No** to keep the current intensity.

The three spicy intensities are **Cheeky**, **Spicy**, and **Unhinged**. Leveling up is only offered below Unhinged. Undo can restore the level-up card after accepting a change; **Restart** starts a fresh round at Spicy.

## Categories

| Direction | Category | Prompts |
| --- | --- | --- |
| Up | Spicy | Dating secrets, romantic fails, guilty pleasures, and intimate truths |
| Left | Cringe | Awkward moments, embarrassing stories, and funny fails |
| Right | Party | Nightlife, drinking, wild nights out, and adventures |
| Down | Wholesome | Childhood memories, daily habits, food quirks, and relatable moments |

## Controls

- **Swipe or drag** the card toward one of the four category buttons.
- **Tap** an emoji button to choose that category immediately.
- **Arrow keys** select Up/Spicy, Left/Cringe, Right/Party, or Down/Wholesome.
- **Spacebar** chooses a random category.
- **Z** undoes the previous card.
- **M** toggles sound.
- **Restart** resets the round and intensity to Spicy.

The **Customize** screen lets you choose an intensity and select audience options or describe your group. Audience selections and the group description are preview-only; the selected intensity changes the spicy question pool and is saved in the browser.

## Run locally

The game is a static web app with JavaScript modules. Serve the project directory locally, for example:

```bash
python3 -m http.server 3000
```

Then open <http://localhost:3000> in a browser.
