# Design System — BookChaowalit Portfolio

> Monochrome, expressive, notebook-inspired. White and black lead; grayscale notebook elements add texture and hierarchy.

## Design Philosophy

- **Neutral, not sterile**: Achromatic tokens keep the interface calm while spacing, typography and hand-drawn details carry personality.
- **Notebook aesthetic**: White paper, grayscale ruled lines, tonal margins, sticky notes and highlighters.
- **Sharp corners**: `--radius: 0rem` — no rounded UI. Borders define structure, not curves.
- **Grid language**: `gap-px bg-border` creates hairline grid separators between cards/sections.
- **Hand-drawn accents**: Kalam font + notebook SVG elements add personality through shape, rotation and tonal contrast.
- **Motion with purpose**: Framer Motion for page transitions, stagger reveals, and micro-interactions.

---

## Color Tokens

Base tokens use achromatic OKLCH values. Light and dark mode supported; semantic destructive status may retain red.

### Light Mode (`:root`)

| Token | OKLCH | Usage |
|---|---|---|
| `--background` | `oklch(0.995 0 0)` | White page background |
| `--foreground` | `oklch(0.20 0 0)` | Near-black body text |
| `--primary` | `oklch(0.20 0 0)` | Black primary actions |
| `--primary-foreground` | `oklch(0.995 0 0)` | White text on black |
| `--secondary` | `oklch(0.96 0 0)` | Very light gray |
| `--muted` | `oklch(0.965 0 0)` | Light gray background |
| `--muted-foreground` | `oklch(0.50 0 0)` | Medium gray text |
| `--accent` | `oklch(0.96 0 0)` | Light gray accent |
| `--border` | `oklch(0.90 0 0)` | Subtle grid borders |
| `--ring` | `oklch(0.20 0 0)` | Black focus ring |
| `--destructive` | `oklch(0.55 0.22 25)` | Red for destructive actions |

### Dark Mode (`.dark`)

| Token | OKLCH | Usage |
|---|---|---|
| `--background` | `oklch(0.16 0 0)` | Very dark gray |
| `--foreground` | `oklch(0.94 0 0)` | Off-white text |
| `--primary` | `oklch(0.94 0 0)` | White/light primary |
| `--card` | `oklch(0.19 0 0)` | Slightly lighter dark cards |
| `--muted` | `oklch(0.23 0 0)` | Muted dark background |
| `--muted-foreground` | `oklch(0.70 0 0)` | Medium gray text (4.95:1 contrast) |
| `--border` | `oklch(0.31 0 0)` | Subtle dark grid borders |

### Chart Scale (5-step achromatic)

Light: `0.30 → 0.45 → 0.60 → 0.75 → 0.85` (chroma: 0)
Dark: `0.85 → 0.75 → 0.60 → 0.45 → 0.30` (chroma: 0)

---

## Typography

4 fonts loaded via `next/font/google`. CSS custom properties for semantic aliasing.

| Role | Font | Variable | Weight | Preload |
|---|---|---|---|---|
| **Body/UI** | Geist Sans | `--font-geist-sans` / `--font-sans` | 400 (default) | Yes |
| **Mono/Code** | Geist Mono | `--font-geist-mono` / `--font-mono` | 400 (default) | Yes |
| **Doodle/Hand** | Kalam | `--font-kalam` / `--font-doodle` / `--font-script` | 300, 400, 700 | No |
| **Thai** | Sarabun | `--font-sarabun` | 300–700 | Yes |

### Font Aliases (CSS)

```css
--font-doodle: var(--font-kalam);    /* Hand-drawn labels, badges */
--font-script: var(--font-kalam);    /* Script-style headings */
--font-comic: var(--font-geist-sans); /* Outlined/filled display text */
```

### Thai Override (`.font-thai`)

All font aliases remap to `--font-sarabun` for Thai locale. Applied via `className` on `<body>` when `locale === 'th'`.

### Type Scale

| Element | Size | Weight | Tracking |
|---|---|---|---|
| Page heading (H1) | `text-3xl` / 30px | 700 | `-0.02em` |
| Section heading (H2) | `text-2xl` / 24px | 600 | `-0.01em` |
| Card title (H3) | `text-lg` / 18px | 600 | normal |
| Body text | `text-sm` / 14px | 400 | normal |
| Label/metadata | `text-xs` / 12px | 400–500 | `tracking-wider` |
| Minimum text size | `text-xs` / 12px | — | WCAG minimum enforced |

---

## Spacing & Layout

### Grid System

- **Hairline grids**: `gap-px bg-border` — 1px gaps filled by border color
- **Card padding**: `p-6` (24px) for content cards
- **Section spacing**: `py-20` (80px) between page sections
- **Max content width**: `max-w-6xl` (1152px) centered with `mx-auto`

### Component Spacing

| Pattern | Classes |
|---|---|
| Card grid | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border` |
| Card inner | `bg-background p-6` |
| Section gap | `space-y-12` or `space-y-16` |
| Inline items | `flex items-center gap-2` |

---

## Borders & Radius

- **Global radius**: `--radius: 0rem` — all elements are sharp-cornered
- **Border style**: `border border-border` for card outlines
- **Grid borders**: `gap-px bg-border` pattern replaces individual border declarations
- **Dividers**: `border-b border-border` for horizontal rules
- **No double borders**: Grid pattern eliminates border-collapse issues

---

## Motion & Animation

### Framer Motion Patterns

| Pattern | Config | Usage |
|---|---|---|
| Fade up | `y: 20 → 0, opacity: 0 → 1` | Section reveals |
| Stagger | `staggerChildren: 0.1` | Card grids |
| Spring | `type: "spring", stiffness: 100` | Interactive elements |
| Page transition | `AnimatePresence` + `opacity/scale` | Route changes |

### Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## Component Patterns

### Notebook Elements

Tonal grayscale components using achromatic OKLCH:

- `NotebookPaper` — White/gray paper variants, grayscale ruled lines and margin line
- `StickyNote` — Four tonal variants (`yellow`, `pink`, `green`, `blue` names remain as stable semantic API)
- `HandDrawnHighlight` — Four tonal marker variants with decreasing grayscale intensity
- `SketchArrow`, `SketchyFrame`, `HandDrawnBracket` — Use `text-primary` opacity variants
- `StudyGuideBox` — Bordered note box with type variants (tip/note/important)

### Mixed Typography

Display text styles via CSS custom properties:
- `block` — Bold outlined (Kalam, large, stroke effect)
- `cursive` — Script-style (Kalam, italic lean)
- `outlined` — Stroke-only text (Geist Sans, `-webkit-text-stroke`)
- `filled` — Solid bold (Kalam, oversized)
- `shaded` — Drop-shadow effect (Geist Sans)
- `bubble` — Inflated stroke (Geist Sans, thick stroke + white fill)

### Badge Pattern

```
font-doodle + rotation class + border-border + bg-background
```

Small tilted labels with hand-drawn feel. Used in skills/about sections.

---

## Accessibility

- **Skip to content**: Hidden link, visible on focus (`focus:not-sr-only`)
- **Focus visible**: `outline-ring/50` on all interactive elements via `@layer base`
- **Minimum text size**: `text-xs` (12px) — no sub-10px text
- **Contrast**: `muted-foreground` at `oklch(0.50 0.005 60)` = ~4.68:1 on warm white (AA pass)
- **Semantic HTML**: `<main>`, `<nav>`, `<footer>`, `<article>` via prose
- **Error boundary**: `<ErrorBoundary>` wraps all page content
- **Reduced motion**: CSS media query kills all animations/transitions

---

## Internationalization (i18n)

- **Framework**: `next-intl` with `[locale]` dynamic segment
- **Locales**: `en` (default), `th` (Thai)
- **Thai font override**: `.font-thai` class on `<body>` remaps all font aliases to Sarabun
- **RTL**: Not supported (LTR only)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 (CSS-only config via `@theme inline`) |
| Animation | Framer Motion |
| Fonts | `next/font/google` (4 families) |
| i18n | `next-intl` |
| UI primitives | shadcn/ui (achromatic base) |
| Analytics | Vercel Web Analytics + PostHog (EU, consent banner, off by default) |
| Deployment | Vercel |

---

## File Map

```
src/
├── app/
│   ├── globals.css              ← Design tokens + prose + base styles
│   └── [locale]/
│       └── layout.tsx           ← Font loading + locale layout
├── components/
│   ├── ui/
│   │   ├── mixed-typography.tsx ← Display text styles
│   │   └── notebook-elements.tsx ← Hand-drawn SVG decorations
│   ├── about/
│   │   └── tech-journey-client.tsx
│   ├── lazy/
│   │   ├── skills-section.tsx
│   │   └── featured-projects.tsx
│   ├── projects-client.tsx
│   ├── blog-client-wrapper.tsx
│   ├── contact-client.tsx
│   ├── footer.tsx
│   ├── navigation.tsx
│   ├── page-transition.tsx
│   └── error-boundary.tsx
```
