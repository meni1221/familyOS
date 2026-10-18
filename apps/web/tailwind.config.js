/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        cream: 'var(--color-cream)',
        ink: 'var(--color-ink)',
        'ink-secondary': 'var(--color-ink-secondary)',
        forest: 'var(--color-forest)',
        'forest-deep': 'var(--color-forest-deep)',
        sage: 'var(--color-sage)',
        'sage-light': 'var(--color-sage-light)',
        gold: 'var(--color-gold)',
        'gold-light': 'var(--color-gold-light)',
        sand: 'var(--color-sand)',
        'sand-light': 'var(--color-sand-light)',
        border: 'var(--color-border)',
        success: 'var(--color-success)',
        'success-light': 'var(--color-success-light)',
        warning: 'var(--color-warning)',
        'warning-light': 'var(--color-warning-light)',
        error: 'var(--color-error)',
        'error-light': 'var(--color-error-light)',
      },
      fontFamily: {
        sans: ['Heebo', 'Inter', 'system-ui', 'sans-serif'],
        numeric: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '4': 'var(--space-4)',
        '8': 'var(--space-8)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
        '24': 'var(--space-24)',
        '32': 'var(--space-32)',
        '48': 'var(--space-48)',
        '64': 'var(--space-64)',
      },
      borderRadius: {
        '4': 'var(--radius-4)',
        '8': 'var(--radius-8)',
        '12': 'var(--radius-12)',
        '16': 'var(--radius-16)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        modal: 'var(--shadow-modal)',
      },
      maxWidth: {
        content: '1200px',
      },
    },
  },
  plugins: [],
};
