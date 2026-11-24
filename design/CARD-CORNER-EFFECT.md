# Card-Corner Effect — "Real-Life Card" Edge

The layered corner treatment from the **classic game card back** ("Never Have AI
Ever"), extracted so it can be applied to any other card-like surface
(INITIAL DECKS tiles today, future cards tomorrow).

Care notes for the doc's word choice: the effect is the *corner*, a *border with
a radius*, an *inner border*, *discontinuous*, ending in a *very small radius*.

## Anatomy (outside → inside)

```
┌─ 1. Outer stroke (+ halo) ─────────────────────────┐
│  ╳ 2. Crosshatch texture band                      │
│  ┌─ 3. Faint solid frame ──────────────────────┐   │
│  ┆ ╌ 4. Discontinuous (dashed) stitch line    ┆   │  ← pinch radius
│  ┆    content sits here                       ┆   │
```

Layers 1+2 alone already read as "real card"; 3+4 are the signature double line.

---

## Layer 1 — Outer stroke + halo

The card's own border. The halo (`0 0 1px 1px` white at low alpha) is what
sharpens the outer edge and makes the stroke end in a *visually smaller* corner
than the radius alone would suggest.

```css
.card {
  border: var(--stroke-card) solid rgba(255, 255, 255, 0.28);
  border-radius: var(--radius-card);
  box-shadow:
    var(--corner-halo); /* 0 0 1px 1px rgba(255, 255, 255, 0.16) */
}
```

Source of truth in game: cards.css → `.game-card.current .card-front/.card-back`.

## Layer 2 — Crosshatch texture band

Dark navy canvas with two ±45° repeating line gradients (the `.vector-pattern`
class). This is the band that shows *between* the borders and blends the layers
into one surface.

```css
background-color: #111420;
background-image:
  radial-gradient(circle at 50% 50%, rgba(255, 45, 117, 0.14) 0%, transparent 68%),
  repeating-linear-gradient(45deg,
    rgba(255, 255, 255, 0.04) 0, rgba(255, 255, 255, 0.04) clamp(1.5px, 0.14vmin, 3px),
    transparent clamp(1.5px, 0.14vmin, 3px), transparent clamp(14px, 1.4vmin, 24px)),
  repeating-linear-gradient(-45deg, /* mirror of the above */);
```

Source of truth: cards.css → `.vector-pattern`.

On the deck tiles the pattern layer carries `opacity: 0.55` — the tile's own
background is the same colour, so only the diagonal lines (and the pink tint)
soften while the base stays solid. Reuse that trick when a texture feels loud.

## Layer 3 — Faint solid frame

A translucent dark "glass" panel inset from the card edge, with a thin faint
border. It dims the texture where content lives, so the band outside it and the
stitch inside it read as two different depths (the "blend effect").

```css
.frame {
  position: absolute;
  inset: clamp(9px, 1.1vmin, 20px);
  border: clamp(1.5px, 0.22vmin, 3.5px) solid rgba(255, 255, 255, 0.16);
  border-radius: calc(var(--radius-card) - clamp(9px, 1.1vmin, 20px));
  background:
    radial-gradient(circle at 50% 50%, rgba(25, 29, 44, 0.65) 0%, rgba(13, 16, 26, 0.88) 100%);
}
```

Source of truth in game: mobile.css → `.card-back-frame`.

## Layer 4 — Discontinuous (dashed) stitch line ╌

The signature. A dashed line drawn just inside layer 3, hugging it. Its corner
radius is **deliberately tighter than concentric** — it subtracts the frame
inset as well, so the corners pinch into a near-square fit, exactly like the
stitched corner of a printed card.

```css
.frame::before {
  content: '';
  position: absolute;
  inset: clamp(4px, 0.6vmin, 11px);                    /* gap inside the solid frame */
  border: clamp(1px, 0.18vmin, 3px) dashed rgba(255, 255, 255, 0.12);
  /* Pinch: not concentric — subtracts the frame inset too, so corners end small */
  border-radius: var(--corner-stitch-radius);
  pointer-events: none;
}
```

Source of truth in game: cards.css → `.card-back-frame::before`
(there it uses `cqi` container units and alpha `0.08`; the shared tokens below
use `vmin` so any element can consume them, and `0.12` so the stitch reads on
smaller cards).

---

## Reusable tokens (base.css `:root`)

| Token | Value | Purpose |
|---|---|---|
| `--corner-halo` | `0 0 1px 1px rgba(255,255,255,0.16)` | crisp outer edge |
| `--corner-stitch-inset` | `clamp(6px, 1vmin, 16px)` | gap between card edge/outer stroke and the stitch |
| `--corner-stitch-stroke` | `clamp(1px, 0.14vmin, 2px)` | dashed stroke width, kept thin |
| `--corner-frame-stroke` | `clamp(1px, 0.15vmin, 2.5px)` | faint solid frame stroke, kept thin |
| `--stroke-deck` | `clamp(1.5px, 0.22vmin, 4px)` | thinner outer stroke for deck-screen cards and their pile layers |
| `--stroke-deck-pile` | `clamp(1px, 0.15vmin, 2.5px)` | even thinner stroke for the pile layers stacked behind the deck cards |
| `--corner-stitch-color` | `rgba(255,255,255,0.05)` | dash colour, almost transparent |
| `--corner-stitch-radius` | `calc(var(--radius-card) - clamp(9px,1.1vmin,20px) - var(--corner-stitch-stroke) - 2 * clamp(4px,0.6vmin,11px))` | the pinched, near-square corner (inset subtracted twice, matching the classic card's pinch) |
| `--corner-frame-radius-square` | `clamp(10px, 0.9vmin, 12px)` | solid frame corners, square variant (10px floor rounds the inner borders on small screens) |
| `--corner-stitch-radius-square` | `clamp(6px, 0.6vmin, 8px)` | dashed stitch corners, near-square variant (6px floor on small screens) |

## Radius tuning: round outside, square inside

The character of the effect comes from the **contrast** between the two:

- **Outer** → less round than `--radius-card`. Cards that need a straighter edge
  scope their own radius (e.g. `.deck-option { --radius-deck: clamp(24px, 2.2vmin, 40px); }` —
  the raised floor keeps phones/tablets round while `2.2vmin` above ~1090px
  smaller side keeps big screens unchanged)
  and re-point `border-radius`, the backing pattern and any border overlay at it —
  every layer of the card must share the same outer corner.
- **Inner** → always very square. Use the `*-square` token variants for both the
  faint frame and the dashed stitch; keep them smaller than their inset so the
  corner reads as a near right angle sitting inside the rounder outer edge.

## Applying to a new card (checklist)

1. Give the card the outer stroke + halo (layer 1) and `border-radius: var(--radius-card)`.
2. Put a `.vector-pattern` layer behind its content (layer 2), or any texture
   that can peek through between the borders.
3. Add a frame element/pseudo with the faint solid border (layer 3).
4. Add a `::before` inside it with the dashed stitch + a square radius variant
   (`--corner-stitch-radius`) (layer 4).
5. Keep dashes subtle (α ≤ 0.12) — the pinch radius does the heavy lifting.

Live example: `piles.css` → "Revisions 62" block applied to
`.deck-option` / `.deck-frame` (the INITIAL DECKS tiles on the deck screen).
