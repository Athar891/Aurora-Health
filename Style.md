---
name: naturalist-specimen-design
description: A consistent UI/UX design language inspired by vintage natural history specimen plates — warm cream paper, muted earthy accents, taxonomic labeling, and organic composition. Apply across all web and mobile screens for visual and behavioral consistency.
---

# Naturalist Specimen Design System

## Source Reference
A 19th-century lithographic specimen plate: dozens of butterflies and moths arranged in a flowing silhouette on aged cream paper, each piece small-numbered like a catalog entry. The feeling is curated, scientific, warm, and tactile — order emerging from variety.

## 1. Design Tokens

**Color palette**
- `--bg-paper`: #F4EFE1 (primary background, warm cream)
- `--bg-paper-alt`: #EDE6D6 (cards, panels, slightly deeper cream)
- `--ink`: #2B241C (primary text, near-black brown)
- `--ink-soft`: #6B5E4F (secondary text, captions)
- `--accent-terracotta`: #B5482F (primary accent — CTAs, highlights)
- `--accent-olive`: #5C6B4A (secondary accent — success, tags)
- `--accent-slate`: #5C7A8A (tertiary accent — links, info)
- `--accent-mustard`: #D9A632 (highlight/warning, sparingly)
- `--line`: #D8CDB8 (hairline borders/dividers)

**Typography**
- Display: a serif with character (e.g. "Fraunces" or "Source Serif 4") — used for headings, titles, large numerals
- Body: a clean humanist sans (e.g. "Inter" or "IBM Plex Sans") — used for body text, UI labels
- Caption/data: a monospace or small-caps utility face (e.g. "IBM Plex Mono") — used for specimen-style labels, metadata, tags

**Spacing & shape**
- Base unit: 8px grid
- Border radius: small and consistent (4–6px) — never fully rounded/pill except for tags
- Borders: 1px hairline (`--line`), used generously instead of heavy shadows
- Shadows: avoid; use paper texture/border separation instead

## 2. Layout Principles

- **Generous negative space.** The specimen plate works because empty cream space frames the content — don't crowd screens edge to edge.
- **Organic grouping over rigid grids.** Related items cluster as "specimen groups" — cards of varying size within a loose grid, not uniform tiles.
- **Numbered/labeled entries.** Every list item, card, or specimen-like element gets a small monospace index (e.g. `01`, `A-12`) in `--ink-soft` — this is the signature device. Only use where order/cataloging is meaningful (settings sections, content lists, steps).
- **Single accent per screen.** Pick one accent (terracotta, olive, or slate) as the dominant interactive color per context; others appear only as small tags/status dots.

## 3. Components

- **Cards**: cream-alt background, 1px hairline border, 4–6px radius, small mono label in top-left corner (like a plate number)
- **Buttons**: solid terracotta primary (cream text), outline/hairline secondary, no gradients, no heavy shadows
- **Tags/status**: pill-shaped, small mono caps, olive/slate/mustard backgrounds at low opacity with matching text
- **Dividers**: 1px `--line`, used liberally between sections instead of large gaps or boxes
- **Icons**: thin-stroke line icons (1.5px), never filled, echoing engraving line work

## 4. Motion

- Subtle, slow (200–300ms ease-out). Fades and gentle position shifts only — no bounce, no springy overshoot. Motion should feel like turning a page, not a modern app pop.

## 5. Cross-Platform Consistency

- **Web**: wider negative-space margins, multi-column specimen-card grids, hairline-divided sidebar navigation
- **Mobile**: single-column specimen cards stacked with consistent vertical rhythm (16–24px gaps), bottom tab bar in `--bg-paper-alt` with hairline top border, same numbered-label convention on list items
- Both platforms share: token values, type scale ratios, the numbered-label signature, hairline borders, and the single-accent-per-screen rule

## 6. Voice & Copy

- Plain, precise, slightly formal — like a museum label: "Saved" not "Saved!", "No items yet" not "Oops, nothing here!"
- Errors state what happened and what to do, without apology or exclamation marks
