# Never Have AI ever

A swipe-based party game for choosing the next kind of “Never Have I Ever” prompt. Play with a group, pick a topic with a swipe or tap, and react with **Done It!** when a prompt applies to you.

## How to play

1. Open the game and answer the 18+ question on the first card. The first time you play, a **Yes** shuffles the deck and shows the intro card; the answer is remembered on the device.
2. Swipe the card toward a category, tap one of the emoji buttons, or use an arrow key to choose the topic for the next prompt.
3. Tap **Done It!** if you have done what the card describes. Each card only counts once, even if you undo it.
4. Keep playing: a level-up card appears after **15 card swipes or 7 Done It! responses**, whichever happens first. After accepting a level-up, both counters reset and progression starts again toward the next intensity.
5. On the level-up card, swipe right or choose **Yes** to advance the intensity; the next prompt comes from the newly selected spicy level. Swipe left or choose **No** to keep the current intensity.

The three spicy intensities are **Cheeky**, **Spicy**, and **Unhinged**. Leveling up is offered at each stage until Unhinged. Undo can restore the level-up card after accepting a change; **Restart** starts a fresh round at Cheeky.

Every visit starts on **Cheeky**. The intensity isn't saved between visits, so changes last only for the current session.

## Age confirmation

The game contains sexual, drug, and violence themes written for adults. On the first visit, the first card asks **Are you 18 or older?**

- **Yes** saves a flag in the browser's local storage, so the question isn't asked again on that device.
- **No** shows a message and locks the game until the page is reloaded.

Clearing the site's data, using a private window, or switching browsers asks the question again.

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
- **Restart** resets the round and intensity to Cheeky.

The **Customize** screen lets you choose an intensity and select audience options or describe your group. Audience selections and the group description are preview-only. The selected intensity changes the spicy question pool for the current session only.

## Run locally

The game is a static web app with JavaScript modules. Serve the project directory locally, for example:

```bash
python3 -m http.server 3000
```

Then open <http://localhost:3000> in a browser.
