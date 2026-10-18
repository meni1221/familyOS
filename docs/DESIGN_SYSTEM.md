# FamilyOS — Design System

## Design Philosophy
"Warm editorial minimalism meets polished modern SaaS."

The interface should feel calm, spacious, tactile, elegant, and genuinely useful.

## Color Tokens

### Semantic Colors
```css
--color-canvas: #F7F5F0;        /* Warm canvas background */
--color-surface: #FFFFFF;       /* Card/panel surface */
--color-ink: #202923;           /* Primary text */
--color-ink-secondary: #737970; /* Secondary text */
--color-forest: #315B46;        /* Primary brand */
--color-forest-deep: #244434;   /* Dark brand */
--color-sage: #E5EDE5;          /* Soft accent bg */
--color-accent: #D9A66B;        /* Warm accent */
--color-sand: #EEE7DB;          /* Soft warm bg */
--color-border: #E6E5DE;        /* Borders */
--color-success: #2E7D32;       /* Success states */
--color-warning: #E65100;       /* Warning states */
--color-error: #C62828;         /* Error states */
```

### Dark Mode (Future)
Not in MVP. Design tokens structured to support future dark mode.

## Typography

### Font Families
- Hebrew: 'Heebo', sans-serif
- English: 'Inter', sans-serif
- Monospace: 'JetBrains Mono', monospace (for numbers)

### Type Scale
| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| display | 32px/40px | 700 | Hero headings |
| h1 | 24px/32px | 700 | Page headings |
| h2 | 20px/28px | 600 | Section headings |
| h3 | 16px/24px | 600 | Card headings |
| body | 14px/22px | 400 | Body text |
| label | 12px/16px | 500 | Labels, captions |
| caption | 11px/14px | 400 | Fine print |

### Numeric
- Use `font-variant-numeric: tabular-nums` for all numeric displays
- Monetary amounts always use tabular numerals

## Spacing System
8px base unit:
- 4px — tight
- 8px — xs
- 12px — sm
- 16px — md
- 24px — lg
- 32px — xl
- 48px — 2xl
- 64px — 3xl

## Corner Radius
- 4px — controls (inputs, buttons)
- 8px — cards, panels
- 12px — modals, dialogs
- 16px — large containers

## Shadows
- None preferred over shadows
- Subtle elevation: `0 1px 2px rgba(0,0,0,0.05)`
- Cards: `0 2px 8px rgba(0,0,0,0.04)`

## Layout

### Desktop (>1024px)
- Persistent sidebar (240px)
- Content max-width: 1200px
- Generous whitespace

### Tablet (768-1024px)
- Collapsible navigation
- Two-column layouts where appropriate

### Mobile (<768px)
- Bottom navigation
- Single-column primary workflows
- Thumb-friendly touch targets (min 44px)
- Sticky primary actions

## Motion
- Duration: 150-200ms
- Easing: ease-out
- Respect `prefers-reduced-motion`
- Subtle transitions only for state changes

## Accessibility
- WCAG 2.2 AA target
- Visible focus states
- Semantic HTML
- Keyboard navigation
- Screen reader support
- Contrast ratio minimum 4.5:1 for text

## Component Guidelines

### Buttons
- Primary: forest background, white text
- Secondary: transparent, forest text, border
- Ghost: no background, forest text
- Destructive: error colors
- Minimum height: 44px (touch), 36px (desktop)

### Inputs
- Clear labels above inputs
- Error states with descriptive messages
- Appropriate input types
- RTL-aware

### Cards
- Subtle border or very light shadow
- Consistent padding
- Clear hierarchy

### Dialogs
- Accessible focus trapping
- Clear action buttons
- Escape to close
- Backdrop click to close
