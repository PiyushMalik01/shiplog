# ShipLog — Global Design System Setup

> Run this ONCE before building any UI.
> This sets up the design foundation so every component you build after this
> automatically inherits the right fonts, colors, and spacing.
> Never hardcode colors or fonts anywhere after this is set up.

---

## THE PROMPT (copy everything below this line)

---

You are setting up the **global design system** for ShipLog — a Next.js 14 App Router project. This is infrastructure work, not UI work. Your job is to create a single source of truth for every visual decision in this project so that any UI built after this automatically looks consistent.

Do not build any pages or components. Only create and modify the files listed below.

---

## Files to Create or Modify

### 1. `app/layout.tsx` — Root Layout

Set up Google Fonts, apply global CSS classes, wrap with providers.

```tsx
import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ShipLog — AI-Powered Changelog & Roadmap',
  description: 'Turn messy developer notes into polished, user-facing changelogs in seconds with AI.',
  keywords: ['changelog', 'roadmap', 'AI', 'SaaS', 'indie maker'],
  openGraph: {
    title: 'ShipLog',
    description: 'Ship faster. Communicate better.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="font-sans bg-background text-primary antialiased">
        {children}
      </body>
    </html>
  )
}
```

---

### 2. `app/globals.css` — Design Tokens as CSS Variables

This is the master file. Every color, font, shadow, and radius in the entire project comes from here.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ============================================
   SHIPLOG DESIGN TOKENS
   Change a value here → changes everywhere
   ============================================ */

@layer base {
  :root {
    /* --- Core Palette --- */
    --color-primary:     #03045e;   /* headings, primary text, dark backgrounds */
    --color-secondary:   #0077b6;   /* buttons, links, interactive elements */
    --color-accent:      #00b4d8;   /* highlights, glows, hover accents */
    --color-light:       #90e0ef;   /* borders, subtle dividers */
    --color-pale:        #caf0f8;   /* card fills, light backgrounds, badges */
    --color-white:       #ffffff;
    --color-background:  #f8fbff;   /* page background — off-white with blue tint */

    /* --- Text Colors --- */
    --color-text-primary:   #03045e;
    --color-text-secondary: #0077b6;
    --color-text-muted:     #64748b;
    --color-text-inverse:   #ffffff;

    /* --- Semantic UI Colors --- */
    --color-success:  #22c55e;
    --color-warning:  #f59e0b;
    --color-error:    #ef4444;
    --color-info:     #00b4d8;

    /* --- Glassmorphism --- */
    --glass-bg:      rgba(255, 255, 255, 0.65);
    --glass-border:  rgba(202, 240, 248, 0.6);
    --glass-blur:    20px;
    --glass-shadow:  0 8px 32px rgba(3, 4, 94, 0.08);

    /* --- Typography --- */
    --font-heading: var(--font-syne), 'Syne', sans-serif;
    --font-body:    var(--font-dm-sans), 'DM Sans', sans-serif;
    --font-mono:    'JetBrains Mono', 'Fira Code', 'Courier New', monospace;

    /* --- Spacing Scale (base 4px) --- */
    --space-1:  4px;
    --space-2:  8px;
    --space-3:  12px;
    --space-4:  16px;
    --space-6:  24px;
    --space-8:  32px;
    --space-12: 48px;
    --space-16: 64px;
    --space-20: 80px;
    --space-24: 96px;

    /* --- Border Radius --- */
    --radius-sm:   8px;
    --radius-md:   12px;
    --radius-lg:   16px;
    --radius-xl:   20px;
    --radius-2xl:  24px;
    --radius-full: 9999px;

    /* --- Shadows --- */
    --shadow-sm:   0 1px 3px rgba(3, 4, 94, 0.06);
    --shadow-md:   0 4px 16px rgba(3, 4, 94, 0.08);
    --shadow-lg:   0 8px 32px rgba(3, 4, 94, 0.12);
    --shadow-xl:   0 16px 48px rgba(3, 4, 94, 0.16);
    --shadow-glow: 0 0 24px rgba(0, 119, 182, 0.35);
    --shadow-glow-accent: 0 0 24px rgba(0, 180, 216, 0.4);

    /* --- Transitions --- */
    --transition-fast:   150ms ease;
    --transition-base:   200ms ease;
    --transition-slow:   350ms ease;
    --transition-spring: 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

/* ============================================
   BASE ELEMENT STYLES
   Applied globally — no class needed
   ============================================ */

@layer base {
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    background-color: var(--color-background);
    color: var(--color-text-primary);
    font-family: var(--font-body);
    line-height: 1.6;
  }

  /* Headings always use Syne */
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    color: var(--color-text-primary);
    line-height: 1.15;
    letter-spacing: -0.02em;
  }

  /* Links */
  a {
    color: var(--color-secondary);
    text-decoration: none;
    transition: color var(--transition-base);
  }
  a:hover { color: var(--color-accent); }

  /* Code blocks */
  code, pre, kbd {
    font-family: var(--font-mono);
  }

  /* Focus ring — accessible and branded */
  *:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }

  /* Selection color */
  ::selection {
    background: var(--color-pale);
    color: var(--color-primary);
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: var(--color-background); }
  ::-webkit-scrollbar-thumb {
    background: var(--color-light);
    border-radius: var(--radius-full);
  }
  ::-webkit-scrollbar-thumb:hover { background: var(--color-secondary); }
}

/* ============================================
   REUSABLE UTILITY CLASSES
   Use these instead of repeating Tailwind strings
   ============================================ */

@layer components {

  /* --- Glassmorphism --- */
  .glass {
    background: var(--glass-bg);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border: 1px solid var(--glass-border);
    box-shadow: var(--glass-shadow);
  }

  .glass-dark {
    background: rgba(3, 4, 94, 0.75);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border: 1px solid rgba(0, 119, 182, 0.3);
    box-shadow: var(--shadow-lg);
  }

  /* --- Buttons --- */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 28px;
    border-radius: var(--radius-xl);
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: all var(--transition-base);
    white-space: nowrap;
    border: none;
    text-decoration: none;
  }

  .btn-primary {
    background: var(--color-secondary);
    color: var(--color-white);
  }
  .btn-primary:hover {
    background: var(--color-accent);
    color: var(--color-primary);
    box-shadow: var(--shadow-glow);
    transform: translateY(-1px);
  }

  .btn-secondary {
    background: transparent;
    color: var(--color-secondary);
    border: 1.5px solid var(--color-secondary);
  }
  .btn-secondary:hover {
    background: var(--color-pale);
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }

  .btn-ghost {
    background: transparent;
    color: var(--color-text-muted);
  }
  .btn-ghost:hover {
    color: var(--color-secondary);
    background: var(--color-pale);
  }

  .btn-dark {
    background: var(--color-accent);
    color: var(--color-primary);
    font-weight: 700;
  }
  .btn-dark:hover {
    background: var(--color-pale);
    box-shadow: var(--shadow-glow-accent);
    transform: translateY(-1px);
  }

  /* --- Cards --- */
  .card {
    background: white;
    border-radius: var(--radius-2xl);
    border: 1px solid var(--color-pale);
    box-shadow: var(--shadow-md);
    transition: all var(--transition-base);
  }
  .card:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }

  .card-glass {
    background: var(--glass-bg);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border-radius: var(--radius-2xl);
    border: 1px solid var(--glass-border);
    box-shadow: var(--glass-shadow);
    transition: all var(--transition-base);
  }
  .card-glass:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-3px) scale(1.01);
  }

  /* --- Badges --- */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: var(--radius-full);
    font-size: 12px;
    font-weight: 600;
    font-family: var(--font-body);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .badge-new {
    background: var(--color-pale);
    color: var(--color-secondary);
  }
  .badge-improved {
    background: rgba(144, 224, 239, 0.3);
    color: var(--color-primary);
  }
  .badge-fixed {
    background: #fef2f2;
    color: #dc2626;
  }
  .badge-planned {
    background: #fefce8;
    color: #ca8a04;
  }
  .badge-in-progress {
    background: rgba(0, 180, 216, 0.15);
    color: var(--color-accent);
  }
  .badge-done {
    background: #f0fdf4;
    color: #16a34a;
  }

  /* --- Section Layout --- */
  .section {
    padding: var(--space-20) var(--space-6);
  }
  @media (min-width: 768px) {
    .section { padding: var(--space-24) var(--space-16); }
  }
  @media (min-width: 1024px) {
    .section { padding: var(--space-24) var(--space-24); }
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .section-title {
    font-family: var(--font-heading);
    font-size: clamp(28px, 4vw, 48px);
    font-weight: 700;
    color: var(--color-primary);
    letter-spacing: -0.03em;
    line-height: 1.1;
  }

  .section-sub {
    font-family: var(--font-body);
    font-size: clamp(16px, 2vw, 20px);
    color: var(--color-text-muted);
    max-width: 600px;
    line-height: 1.65;
  }

  /* --- Dot Grid Background --- */
  .dot-grid {
    background-image: radial-gradient(circle, var(--color-pale) 1.5px, transparent 1.5px);
    background-size: 28px 28px;
  }

  /* --- Gradient Text --- */
  .gradient-text {
    background: linear-gradient(135deg, var(--color-secondary), var(--color-accent));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* --- Wavy Underline (for hero "faster") --- */
  .wavy-underline {
    text-decoration: underline;
    text-decoration-style: wavy;
    text-decoration-color: var(--color-accent);
    text-underline-offset: 6px;
  }

  /* --- Input Fields --- */
  .input {
    width: 100%;
    padding: 10px 16px;
    border: 1.5px solid var(--color-pale);
    border-radius: var(--radius-lg);
    font-family: var(--font-body);
    font-size: 15px;
    color: var(--color-primary);
    background: white;
    transition: all var(--transition-base);
    outline: none;
  }
  .input:focus {
    border-color: var(--color-secondary);
    box-shadow: 0 0 0 3px rgba(0, 119, 182, 0.12);
  }
  .input::placeholder { color: var(--color-text-muted); }

  /* --- Textarea --- */
  .textarea {
    resize: vertical;
    min-height: 120px;
  }

  /* --- Divider --- */
  .divider {
    border: none;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--color-pale), transparent);
  }

  /* --- Nav Link --- */
  .nav-link {
    font-family: var(--font-body);
    font-size: 15px;
    font-weight: 500;
    color: var(--color-text-muted);
    transition: color var(--transition-base);
    cursor: pointer;
  }
  .nav-link:hover { color: var(--color-secondary); }
  .nav-link.active { color: var(--color-secondary); font-weight: 600; }

  /* --- Shimmer Animation (for CTA Banner) --- */
  .shimmer-bg {
    background: linear-gradient(135deg, #03045e, #0077b6, #00b4d8, #03045e);
    background-size: 300% 300%;
    animation: shimmer 8s ease infinite;
  }

  @keyframes shimmer {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  /* --- Pulse Glow (for accent elements) --- */
  .pulse-glow {
    animation: pulseGlow 2.5s ease-in-out infinite;
  }

  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 8px rgba(0, 180, 216, 0.3); }
    50%       { box-shadow: 0 0 24px rgba(0, 180, 216, 0.7); }
  }
}
```

---

### 3. `tailwind.config.ts` — Extend Tailwind with Design Tokens

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── Colors ──────────────────────────────────────
      colors: {
        primary:    '#03045e',
        secondary:  '#0077b6',
        accent:     '#00b4d8',
        light:      '#90e0ef',
        pale:       '#caf0f8',
        background: '#f8fbff',
      },

      // ── Fonts ───────────────────────────────────────
      fontFamily: {
        heading: ['var(--font-syne)', 'Syne', 'sans-serif'],
        sans:    ['var(--font-dm-sans)', 'DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },

      // ── Font Sizes ──────────────────────────────────
      fontSize: {
        'display-2xl': ['clamp(48px, 7vw, 96px)', { lineHeight: '1.05', letterSpacing: '-0.04em' }],
        'display-xl':  ['clamp(40px, 6vw, 72px)', { lineHeight: '1.08', letterSpacing: '-0.03em' }],
        'display-lg':  ['clamp(32px, 5vw, 56px)', { lineHeight: '1.1',  letterSpacing: '-0.03em' }],
        'display-md':  ['clamp(26px, 4vw, 40px)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-sm':  ['clamp(22px, 3vw, 30px)', { lineHeight: '1.2',  letterSpacing: '-0.02em' }],
      },

      // ── Border Radius ───────────────────────────────
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },

      // ── Box Shadows ─────────────────────────────────
      boxShadow: {
        'sm':          '0 1px 3px rgba(3, 4, 94, 0.06)',
        'md':          '0 4px 16px rgba(3, 4, 94, 0.08)',
        'lg':          '0 8px 32px rgba(3, 4, 94, 0.12)',
        'xl':          '0 16px 48px rgba(3, 4, 94, 0.16)',
        'glow':        '0 0 24px rgba(0, 119, 182, 0.35)',
        'glow-accent': '0 0 24px rgba(0, 180, 216, 0.4)',
        'glow-sm':     '0 0 12px rgba(0, 119, 182, 0.25)',
        'inner-pale':  'inset 0 0 0 1px rgba(202, 240, 248, 0.8)',
        'glass':       '0 8px 32px rgba(3, 4, 94, 0.08)',
      },

      // ── Background Images ───────────────────────────
      backgroundImage: {
        'gradient-brand':    'linear-gradient(135deg, #03045e, #0077b6)',
        'gradient-accent':   'linear-gradient(135deg, #0077b6, #00b4d8)',
        'gradient-pale':     'linear-gradient(135deg, #caf0f8, #90e0ef)',
        'gradient-hero':     'radial-gradient(ellipse at center, rgba(144,224,239,0.2) 0%, transparent 70%)',
      },

      // ── Spacing ─────────────────────────────────────
      spacing: {
        '18': '72px',
        '22': '88px',
        '26': '104px',
        '30': '120px',
      },

      // ── Animation ───────────────────────────────────
      animation: {
        'fade-in':      'fadeIn 0.5s ease forwards',
        'fade-in-up':   'fadeInUp 0.55s ease forwards',
        'shimmer':      'shimmer 8s ease infinite',
        'pulse-glow':   'pulseGlow 2.5s ease-in-out infinite',
        'float':        'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':       { backgroundPosition: '100% 50%' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(0,180,216,0.3)' },
          '50%':       { boxShadow: '0 0 24px rgba(0,180,216,0.7)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
      },

      // ── Transitions ─────────────────────────────────
      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
      },
    },
  },
  plugins: [],
}

export default config
```

---

### 4. `lib/constants.ts` — Site-Wide Constants

All text content, navigation links, and configuration in one place. Change here → changes everywhere.

```ts
export const SITE = {
  name:        'ShipLog',
  tagline:     'Ship faster. Communicate better.',
  description: 'Turn messy developer notes into polished, user-facing changelogs in seconds with AI.',
  url:         process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  emoji:       '🚢',
  author:      'Piyush Malik',
  builtFor:    'AGIREADY.io Hiring Drive 2026',
  github:      'https://github.com/piyushmalik',
  twitter:     'https://twitter.com/piyushmalik',
}

export const NAV_LINKS = [
  { label: 'Features',  href: '/#features' },
  { label: 'Changelog', href: '/#changelog' },
  { label: 'Roadmap',   href: '/#roadmap' },
]

export const BADGE_LABELS = {
  new:         '✦ New',
  improved:    '↑ Improved',
  fixed:       '✓ Fixed',
  planned:     'Planned',
  in_progress: 'In Progress',
  done:        'Done',
}

export const KANBAN_COLUMNS = [
  { id: 'planned',     label: 'Planned',     color: '#f59e0b' },
  { id: 'in_progress', label: 'In Progress', color: '#00b4d8' },
  { id: 'done',        label: 'Done',        color: '#22c55e' },
] as const

export const AI_CATEGORIES = ['new', 'improved', 'fixed'] as const
export type AICategory = typeof AI_CATEGORIES[number]
```

---

### 5. `lib/cn.ts` — Class Merge Utility

Used for conditional class merging without external libraries.

```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Run: `npm install clsx tailwind-merge`

---

## How to Use This System

After this setup, every file in the project should follow these rules:

### Colors — use Tailwind tokens, never arbitrary hex
```tsx
// ✅ Correct
<div className="bg-primary text-white">
<button className="bg-secondary hover:bg-accent">
<span className="text-primary border-pale">

// ❌ Wrong — never do this
<div style={{ color: '#03045e' }}>
<div className="bg-[#0077b6]">   // only OK in the landing page one-offs
```

### Typography — use font classes, never inline
```tsx
// ✅ Correct
<h1 className="font-heading text-display-xl text-primary">
<p className="font-sans text-lg text-muted">

// ❌ Wrong
<h1 style={{ fontFamily: 'Syne' }}>
```

### Buttons — use utility classes
```tsx
// ✅ Correct
<button className="btn btn-primary">Get Started</button>
<button className="btn btn-secondary">Learn More</button>
<a className="btn btn-ghost nav-link">Login</a>

// ❌ Wrong — do not write button styles from scratch every time
<button className="px-8 py-4 bg-[#0077b6] text-white rounded-xl font-semibold ...">
```

### Cards
```tsx
// ✅ Correct
<div className="card-glass p-6">...</div>
<div className="card p-6">...</div>
```

### Badges
```tsx
<span className="badge badge-new">New</span>
<span className="badge badge-improved">Improved</span>
<span className="badge badge-fixed">Fixed</span>
<span className="badge badge-planned">Planned</span>
```

### Sections
```tsx
<section className="section dot-grid">
  <div className="container">
    <h2 className="section-title">...</h2>
    <p className="section-sub">...</p>
  </div>
</section>
```

---

## Verification Checklist

Before moving on to building UI, confirm:

- [ ] `npm run dev` starts without errors
- [ ] Syne font is loading — headings should look geometric and bold
- [ ] DM Sans is loading — body text should look clean and rounded
- [ ] Background is `#f8fbff` (slightly blue-tinted white, not pure white)
- [ ] `.btn-primary` renders as `#0077b6` with white text and glows on hover
- [ ] `.card-glass` renders with visible blur + pale border
- [ ] `.badge-new` renders as pale cyan with blue text
- [ ] Color tokens (`bg-primary`, `text-secondary`, `border-pale`) all resolve correctly
- [ ] `lib/constants.ts` is importable without TypeScript errors

---

*This file configures the global design system for ShipLog.*
*Do not build any pages until this checklist is complete.*
*— AGIREADY.io Technical Assessment 2026 — Piyush Malik*
```