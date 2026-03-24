# Vigil UI Kit — Design System Reference

**Version:** 1.0 | **Author:** ARIA (UX) | **Date:** 2026-03-23 | **Sprint:** 09
**HTML Demo:** [`VIGIL_UI_KIT.html`](VIGIL_UI_KIT.html) — open in browser for visual reference

---

## Brand Identity

**Product register:** Dark theme, developer-focused, bug-hunting aesthetic. IDE meets observability dashboard. Confident, sharp, no-nonsense.

**Tagline:** "Find bugs before your users do."

### Logo

The Vigil eye — always watching, always finding. Elements:
- **Eye shape:** Represents vigilance and observation
- **V-scan line:** The V inside the iris represents bug detection / scanning
- **Corner brackets:** Evoke a viewport, inspector frame, or selection marquee
- **Color:** Electric cyan gradient on dark — high contrast, unmistakable

| Variant | Usage |
|---------|-------|
| Full mark | Landing page, docs, external materials |
| Mark + wordmark | Navigation bar, dashboard header |
| Mark only | App icon, favicon, extension icon, small spaces |
| Monogram (V) | Favicon at 16px, loading spinner center |

Logo SVG source: `docs/ui/VIGIL_UI_KIT.html` section 1

---

## Design Tokens

All tokens are CSS custom properties. Map to `tailwind.config.ts` via `theme.extend`.

### Surfaces

| Token | Hex | Usage |
|-------|-----|-------|
| `--v-bg-void` | `#050507` | Deepest background, input fields |
| `--v-bg-base` | `#0a0a0f` | Page background |
| `--v-bg-raised` | `#111118` | Cards, panels |
| `--v-bg-overlay` | `#16161f` | Table headers, overlays |
| `--v-bg-elevated` | `#1c1c28` | Elevated surfaces, skeleton base |
| `--v-bg-hover` | `#22222f` | Hover states |

### Brand Accent (Cyan)

| Token | Hex | Usage |
|-------|-----|-------|
| `--v-accent-400` | `#22d3ee` | **Primary accent** — CTAs, links, active states, logo |
| `--v-accent-500` | `#06b6d4` | Button backgrounds, focused borders |
| `--v-accent-600` | `#0891b2` | Hover on accent buttons |
| `--v-accent-700` | `#0e7490` | Pressed state |
| `--v-accent-glow` | `rgba(34,211,238,0.15)` | Glow shadow, focus rings, subtle backgrounds |

### Severity Spectrum

| Token | Hex | Severity | Usage |
|-------|-----|----------|-------|
| `--v-p0` | `#ef4444` | P0 Critical | Bug badges, left border on critical cards |
| `--v-p1` | `#f97316` | P1 High | Bug badges, left border |
| `--v-p2` | `#eab308` | P2 Medium | Bug badges, left border |
| `--v-p3` | `#22c55e` | P3 Low | Bug badges, left border |

Each severity has a `-bg` variant at 12% opacity for badge backgrounds.

### Text

| Token | Hex | Usage |
|-------|-----|-------|
| `--v-text-primary` | `#e8eaed` | Headings, body, primary content |
| `--v-text-secondary` | `#9ca3af` | Descriptions, labels, secondary info |
| `--v-text-tertiary` | `#6b7280` | Timestamps, captions, hints |
| `--v-text-ghost` | `#374151` | Placeholders, disabled text |

### Borders

| Token | Hex | Usage |
|-------|-----|-------|
| `--v-border-subtle` | `#1f2937` | Card borders, dividers |
| `--v-border-default` | `#2d3748` | Input borders, hover card borders |
| `--v-border-strong` | `#4b5563` | Focused input borders, active states |

---

## Typography

| Scale | Font | Weight | Size | Tracking | Usage |
|-------|------|--------|------|----------|-------|
| Display | Inter | 800 | 2.5rem | -0.03em | Landing hero headline |
| H1 | Inter | 700 | 2rem | -0.02em | Page titles |
| H2 | Inter | 600 | 1.5rem | -0.01em | Section headings |
| H3 | Inter | 600 | 1.125rem | — | Card titles, subsections |
| Body | Inter | 400 | 0.875rem | — | Paragraphs, descriptions |
| Small | Inter | 500 | 0.8rem | — | Labels, metadata |
| Caption | Inter | 400 | 0.75rem | — | Timestamps, IDs |
| Mono Data | JetBrains Mono | 500 | 0.85rem | — | Bug IDs, session IDs, severity codes |
| Mono Code | JetBrains Mono | 400 | 0.8rem | — | API routes, code snippets, technical data |

**Rule:** UI text = Inter. Technical data = JetBrains Mono. Never mix.

---

## Spacing

4px base grid. All spacing is a multiple of 4.

| Token | Value | Common usage |
|-------|-------|-------------|
| `space-1` | 4px | Tight gaps (badge padding, dot spacing) |
| `space-2` | 8px | Input padding, button padding, small gaps |
| `space-3` | 12px | Table cell padding, list item gaps |
| `space-4` | 16px | Card padding, section gaps |
| `space-6` | 24px | Card inner padding, form groups |
| `space-8` | 32px | Section margin |
| `space-12` | 48px | Large section margin |
| `space-16` | 64px | Section-to-section on landing |
| `space-20` | 80px | Hero padding |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 4px | Small badges, code inline |
| `radius-md` | 6px | Buttons, inputs, alerts |
| `radius-lg` | 8px | Cards, tables, code blocks |
| `radius-xl` | 12px | Large cards, pricing cards, auth forms |
| `radius-full` | 9999px | Pill badges, dots, avatars |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.4)` | Subtle elevation |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.5)` | Cards on hover, dropdowns |
| `shadow-lg` | `0 8px 24px rgba(0,0,0,0.6)` | Modals, popovers |
| `shadow-glow` | `0 0 20px rgba(34,211,238,0.2)` | Featured pricing card, focused elements |

---

## Components

### Buttons
4 variants: Primary (cyan), Secondary (outlined), Ghost (text), Danger (red)
3 sizes: Small, Default, Large
All support icon + text combinations.

### Inputs
States: Default, Focused (cyan glow ring), Error (red border), Disabled (0.5 opacity)
Always paired with label + optional hint/error message.

### Badges
- **Severity:** P0 (red), P1 (orange), P2 (yellow), P3 (green)
- **Status:** Success, Warning, Error, Info, Neutral, Accent (with pulse dot)
- **Plan:** Free (neutral), Pro (cyan), Team (purple), Enterprise (gold)

### Cards
- Default: raised background + subtle border, hover darkens border
- Severity-coded: left border colored by severity (P0-P3)
- Session card: title + badge + stats row

### Alerts
4 types: Success, Warning, Error, Info. Icon + message layout.

### Data Tables
Striped headers, hover rows, monospace for IDs/dates, badges inline.

### Pricing Cards
4 tiers with featured card highlight (cyan border + glow + "POPULAR" badge).

### Auth Forms
Centered card with logo, title, subtitle, form fields, CTA button, footer link.

### Empty States
Centered layout: dashed circle icon, heading, description, optional CTA button.

### Loading/Skeleton
Shimmer animation with `prefers-reduced-motion` fallback (static gray).

### SXC Balance Widget
Plan tokens (large cyan number) + purchased tokens. Progress bar. Renewal date.

### Navigation
Fixed bar: logo left, links center, auth buttons right. Collapses to hamburger on mobile.

### Code Blocks
Void background, subtle border, monospace font, syntax highlighting via CSS classes.

---

## Accessibility

| Rule | Standard |
|------|----------|
| Text contrast | >= 4.5:1 on all backgrounds (WCAG AA) |
| Focus visible | 2px cyan outline, 2px offset on all interactive elements |
| Reduced motion | All animations have `prefers-reduced-motion: reduce` fallback |
| Keyboard nav | Tab order logical, Enter/Space activates, Escape closes |
| Labels | All inputs have associated `<label>` elements |
| ARIA | Badges use `role="status"`, alerts use `role="alert"` |

---

## Responsive Breakpoints

| Breakpoint | Width | Layout behavior |
|-----------|-------|----------------|
| Mobile | 375px+ | Single column, stacked cards, hamburger nav |
| Tablet | 768px+ | 2-column grids, sidebar collapses |
| Desktop | 1024px+ | Full layout, 3-column grids |
| Wide | 1440px+ | Max-width container, centered content |

---

## File Map

| File | Purpose |
|------|---------|
| `docs/ui/UI_KIT.md` | This reference (source of truth for tokens + rules) |
| `docs/ui/VIGIL_UI_KIT.html` | Interactive HTML demo (open in browser) |
| `tailwind.config.ts` | Tokens mapped to Tailwind (implementation) |
| `packages/dashboard/src/shared/styles/` | Global CSS, theme variables |

---

*Vigil UI Kit v1.0 | ARIA | SynaptixLabs | 2026-03-23*
