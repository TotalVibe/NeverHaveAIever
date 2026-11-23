# Agent Rules

## Responsive scaling (Mobile to Large Monitors & TVs)

Always design layouts and components to scale generously across all viewports, from small mobile screens (390px) up to large desktop monitors (1920px+) and Smart TVs (3840px).

## Sizing units

Use fluid viewport sizing (`vh`, `vmin`, `clamp()`) so cards, piles, and typography fill the screen comfortably and stay large on big displays without overflowing or scrolling on mobile.

- `%` — inner elements, so they stay locked to their parent container
- `rem` — spacing
- `em` — proportional button/text glows and shadows
- `px` — only for thin borders and subtle surface elevation
- Card corners & strokes: Scale border-radius and prominent card/button border-width with `clamp()` or `vmin` (never `%` on rectangles) so cards keep the same rounded corner proportion and stroke weight on large monitors and TVs.

## CSS architecture

Keep styles organized inside the split CSS files (`base.css`, `cards.css`, `piles.css`, `mobile.css`) — never dump everything back into one giant stylesheet.
