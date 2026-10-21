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
        sans: ['Heebo', 'system-ui', 'sans-serif'],
        numeric: ['Heebo', 'system-ui', 'sans-serif'],
      },
      /*
       * No spacing override on purpose. The numeric utilities (p-4, gap-6,
       * h-16, py-24) must keep Tailwind's 0.25rem scale. A previous override
       * mapped `4` to 4px and `16` to 16px, which silently collapsed the
       * header to sixteen pixels and every section's vertical padding.
       */
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
