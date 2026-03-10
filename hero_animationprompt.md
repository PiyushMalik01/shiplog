# ShipLog Hero — Layered Wave Animation Prompt

> This prompt builds the animated hero illustration component.
> Run this AFTER the global design system is set up.
> Images required in `/public/illustrations/`:
>   - `wave-foreground.png`  → the waves-only illustration (Image 2)
>   - `ship-background.png`  → the ship + waves illustration (Image 1)

---

## THE PROMPT (copy everything below this line)

---

You are building a single React component: `components/landing/HeroIllustration.tsx`

This component creates a **layered, depth-based floating animation** using two Hokusai-style wave illustrations for the ShipLog landing page hero section. The effect makes it look like the viewer is watching a real ocean scene — the ship sails in the distance while the foreground wave crashes closer.

Do not build anything else. Only this component and its integration into the existing `HeroSection.tsx`.

---

## Assets

Place these in `/public/illustrations/`:
- `wave-foreground.png` — the waves-only image (no ship, transparent/black background)
- `ship-background.png` — the full ship + waves image

Both images have dark/black backgrounds. This is intentional — the hero section background must be **dark** (`bg-[#020818]` — near black with a deep blue tint) so the illustrations blend naturally via `mix-blend-mode: screen` or `lighten`, making the black areas invisible and only the illustrated content visible.

---

## Component Spec: `HeroIllustration.tsx`

```tsx
'use client'
```

### Layout Structure

```
<section> ← full hero container, min-h-screen, dark bg, relative overflow-hidden
  │
  ├── <div> BACKGROUND LAYER (ship + waves)
  │     position: absolute, bottom: 0, left: 0, right: 0
  │     z-index: 1
  │     animation: floatSlow (slower, larger amplitude)
  │
  ├── <div> HERO TEXT LAYER
  │     position: relative
  │     z-index: 2
  │     centered vertically and horizontally
  │     contains: headline, sub-headline, CTA buttons
  │
  └── <div> FOREGROUND LAYER (waves only)
        position: absolute, bottom: 0, left: 0, right: 0
        z-index: 3
        animation: floatFast (faster, smaller amplitude, OFFSET phase)
```

The text sits sandwiched between the two illustration layers. The foreground wave partially overlaps the bottom of the text area — this creates the illusion that the text is floating above the ocean surface.

---

## CSS Animations

Define these as Tailwind arbitrary CSS or a `<style>` tag inside the component:

```css
/* Background layer — ship bobs slowly and deeply */
@keyframes floatSlow {
  0%   { transform: translateY(0px) rotate(0deg); }
  25%  { transform: translateY(-12px) rotate(0.4deg); }
  50%  { transform: translateY(-6px) rotate(0deg); }
  75%  { transform: translateY(-16px) rotate(-0.4deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}

/* Foreground layer — wave crests faster, different phase */
@keyframes floatFast {
  0%   { transform: translateY(0px) translateX(0px); }
  20%  { transform: translateY(-8px) translateX(4px); }
  40%  { transform: translateY(-14px) translateX(-2px); }
  60%  { transform: translateY(-6px) translateX(3px); }
  80%  { transform: translateY(-10px) translateX(-4px); }
  100% { transform: translateY(0px) translateX(0px); }
}

/* Horizontal sway for the ship — very subtle */
@keyframes sway {
  0%, 100% { transform: rotate(-0.8deg) translateY(0px); }
  50%       { transform: rotate(0.8deg) translateY(-8px); }
}
```

Apply:
- Background layer (ship): `animation: floatSlow 7s ease-in-out infinite`
- Foreground layer (wave): `animation: floatFast 5s ease-in-out infinite`

The **different durations (7s vs 5s)** and **different keyframe shapes** are what create the natural, non-synchronised ocean feel. They will drift in and out of phase with each other continuously.

---

## Image Blending

Both images have black backgrounds. Use CSS `mix-blend-mode` to make black transparent:

```tsx
// On both image wrapper divs:
style={{ mixBlendMode: 'screen' }}

// This makes pure black (#000000) fully transparent
// and keeps all the blues, whites, and teals visible
// Result: illustrations float seamlessly on the dark background
```

The dark hero background (`#020818`) + `mix-blend-mode: screen` = the black parts of both PNGs disappear, leaving only the wave and ship artwork visible, layered perfectly.

---

## Exact Component Code Structure

```tsx
'use client'

import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export default function HeroIllustration({
  headline,
  subheadline,
  ctaPrimary,
  ctaSecondary,
}: {
  headline: React.ReactNode
  subheadline: string
  ctaPrimary: React.ReactNode
  ctaSecondary: React.ReactNode
}) {
  const ref = useRef<HTMLElement>(null)
  
  // Parallax on scroll — layers move at different rates
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start']
  })
  
  // Background ship moves UP slower on scroll
  const shipY = useTransform(scrollYProgress, [0, 1], ['0%', '15%'])
  // Foreground wave moves UP faster on scroll  
  const waveY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  // Text fades and moves up on scroll
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section
      ref={ref}
      className="relative min-h-screen overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: '#020818' }}
    >
      {/* === BACKGROUND LAYER — Ship + Waves === */}
      <motion.div
        className="absolute inset-x-0 bottom-0 w-full"
        style={{ y: shipY, zIndex: 1 }}
      >
        <div
          className="w-full relative"
          style={{ mixBlendMode: 'screen' }}
        >
          {/* CSS float animation on the image itself */}
          <div style={{ animation: 'floatSlow 7s ease-in-out infinite' }}>
            <Image
              src="/illustrations/ship-background.png"
              alt="ShipLog ship sailing through waves"
              width={1200}
              height={900}
              className="w-full h-auto object-contain object-bottom"
              style={{
                maxHeight: '75vh',
                objectFit: 'contain',
                objectPosition: 'bottom center',
              }}
              priority
            />
          </div>
        </div>
      </motion.div>

      {/* === TEXT LAYER — Hero Content === */}
      <motion.div
        className="relative text-center px-6 md:px-12 max-w-4xl mx-auto"
        style={{ y: textY, opacity: textOpacity, zIndex: 2 }}
      >
        {/* Render passed-in hero content */}
        {headline}
        <p className="font-sans text-lg md:text-xl text-[#90e0ef]/80 max-w-2xl mx-auto mt-6 mb-10">
          {subheadline}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {ctaPrimary}
          {ctaSecondary}
        </div>
      </motion.div>

      {/* === FOREGROUND LAYER — Waves Only === */}
      <motion.div
        className="absolute inset-x-0 bottom-0 w-full pointer-events-none"
        style={{ y: waveY, zIndex: 3 }}
      >
        <div
          style={{
            mixBlendMode: 'screen',
            animation: 'floatFast 5s ease-in-out infinite',
          }}
        >
          <Image
            src="/illustrations/wave-foreground.png"
            alt=""
            aria-hidden="true"
            width={1600}
            height={700}
            className="w-full h-auto object-cover object-bottom"
            style={{
              maxHeight: '55vh',
              objectFit: 'cover',
              objectPosition: 'bottom center',
            }}
            priority
          />
        </div>
      </motion.div>

      {/* === ANIMATION KEYFRAMES === */}
      <style jsx>{`
        @keyframes floatSlow {
          0%   { transform: translateY(0px) rotate(0deg); }
          25%  { transform: translateY(-12px) rotate(0.4deg); }
          50%  { transform: translateY(-6px) rotate(0deg); }
          75%  { transform: translateY(-16px) rotate(-0.4deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes floatFast {
          0%   { transform: translateY(0px) translateX(0px); }
          20%  { transform: translateY(-8px) translateX(4px); }
          40%  { transform: translateY(-14px) translateX(-2px); }
          60%  { transform: translateY(-6px) translateX(3px); }
          80%  { transform: translateY(-10px) translateX(-4px); }
          100% { transform: translateY(0px) translateX(0px); }
        }
      `}</style>
    </section>
  )
}
```

---

## Integration into HeroSection.tsx

Replace the existing hero `<section>` with `<HeroIllustration>`. Pass in:

```tsx
// components/landing/HeroSection.tsx
'use client'

import { motion } from 'framer-motion'
import HeroIllustration from './HeroIllustration'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } }
}

export default function HeroSection() {
  return (
    <HeroIllustration
      subheadline="Turn messy developer notes into polished, user-facing changelogs in seconds with AI. Stop writing updates — start shipping features."
      headline={
        <motion.div variants={stagger} initial="hidden" animate="visible">
          <motion.h1
            variants={fadeInUp}
            className="font-heading text-display-xl text-white leading-tight"
          >
            Ship <span className="wavy-underline text-[#00b4d8]">faster.</span>
            <br />
            Communicate better.
          </motion.h1>
        </motion.div>
      }
      ctaPrimary={
        <a href="/signup" className="btn btn-primary text-base px-8 py-4">
          Create Your Project →
        </a>
      }
      ctaSecondary={
        <a
          href="#demo"
          className="btn btn-secondary text-base px-8 py-4"
          style={{ borderColor: '#90e0ef', color: '#90e0ef' }}
        >
          View Live Demo
        </a>
      }
    />
  )
}
```

---

## Responsiveness Rules

| Screen | Behavior |
|--------|----------|
| Mobile `< 640px` | Ship image hidden (`hidden sm:block`) — only foreground wave shows. Text is full width, font shrinks. Wave covers bottom 40% of screen. |
| Tablet `640–1024px` | Both layers visible but ship scaled down. Text max-width 500px. |
| Desktop `> 1024px` | Full effect. Both layers full width. Text max-width 900px. |

Apply this to the background ship wrapper:
```tsx
className="hidden sm:block absolute inset-x-0 bottom-0 w-full"
```

On mobile the foreground wave alone is striking enough — the ship at small sizes looks cluttered.

---

## next.config.js — Allow local image optimization

Make sure `next.config.js` has:
```js
const nextConfig = {
  images: {
    formats: ['image/webp'],
  },
}
```

Also add to `globals.css` (inside the existing `@layer base`):
```css
/* Ensure dark hero bg doesn't flash white on load */
.hero-dark {
  background-color: #020818;
  color-scheme: dark;
}
```

---

## Tweaking the Feel

After it's built, adjust these values to tune the motion:

| What to change | Where | Effect |
|---|---|---|
| Speed up foreground wave | `floatFast 5s` → `floatFast 4s` | More energetic ocean |
| Slow down ship bob | `floatSlow 7s` → `floatSlow 10s` | More majestic, calm |
| Reduce sway intensity | `rotate(0.4deg)` → `rotate(0.2deg)` | Subtler tilt |
| Increase wave lateral drift | `translateX(4px)` → `translateX(8px)` | More wild ocean feel |
| Foreground overlap on text | Increase foreground `maxHeight` from `55vh` to `65vh` | Wave covers more |
| Parallax intensity on scroll | `'30%'` in `waveY` → `'50%'` | More dramatic depth |

---

## Definition of Done

- [ ] Both illustration layers visible on dark background
- [ ] Black areas of both PNGs are invisible (mix-blend-mode working)
- [ ] Ship layer bobs at a different speed/phase than wave layer
- [ ] Foreground wave is visually "in front of" the ship
- [ ] Text is readable over dark background (white/light colors)
- [ ] On scroll, layers move at visibly different parallax rates
- [ ] Ship layer hidden on mobile (`< 640px`), wave layer still shows
- [ ] No layout shift (CLS) on page load — images use `priority` prop
- [ ] `npm run build` passes with no TypeScript errors

---

*ShipLog Hero Animation — AGIREADY.io Technical Assessment 2026 — Piyush Malik*