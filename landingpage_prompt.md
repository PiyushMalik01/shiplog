# ShipLog Landing Page — Agent Prompt (Focused)

> Paste this entire prompt to your AI agent (Cursor, Claude, Copilot, v0).
> It is self-contained. The agent needs nothing else.

---

## THE PROMPT (copy everything below this line)

---

You are a Senior Frontend Engineer and UI/UX Designer with 10+ years of experience building world-class SaaS landing pages. You have deep expertise in Next.js 14, Tailwind CSS, and Framer Motion. You have an eye for detail that rivals Linear, Vercel, and Stripe's design teams.

Your task is to build a **complete, production-ready landing page** for **ShipLog** — an AI-powered changelog and roadmap SaaS for indie makers.

---

## Product Context

**ShipLog** lets founders paste raw commit messages and get polished, user-facing changelogs in seconds using AI. It also clusters community feature requests into a prioritized Kanban roadmap. Every product gets a public page at `/[slug]`.

**Target user:** Solo indie maker or small SaaS founder (1–5 person team). They are technical, time-poor, and care about shipping fast and looking professional to their users.

---

## Tech Constraints

- **Framework:** Next.js 14 App Router
- **Styling:** Tailwind CSS only (no inline styles, no CSS modules)
- **Animation:** `framer-motion` for entrance animations
- **File structure:** Split into components under `components/landing/`
- **Fonts:** Import from Google Fonts via `next/font/google`. Use **Syne** for headings (bold, geometric, premium feel) and **DM Sans** for body text (clean, readable, modern). Do NOT use Inter, Roboto, or system fonts.
- **Icons:** `lucide-react` only
- **No external UI libraries** (no shadcn, no MUI, no Chakra on this page)

---

## Design System

### Color Palette (use as Tailwind arbitrary values)

```
Primary Dark:    #03045e   — headings, primary text
Secondary Blue:  #0077b6   — buttons, links, primary CTAs
Accent Cyan:     #00b4d8   — highlights, badge backgrounds, hover glows
Light Cyan:      #90e0ef   — borders, subtle backgrounds
Pale Cyan:       #caf0f8   — very light backgrounds, card fills
White:           #ffffff
```

### Design Philosophy

- **Aesthetic direction:** "Premium Developer Tool" — think Linear meets Vercel. Deep navy accents on a near-white background. Surgical precision in spacing. Glassmorphism for floating elements.
- **NOT:** Purple gradients. Generic SaaS blue. Clipart icons. Cookie-cutter layouts.
- **Background:** `#f8fbff` (off-white with a blue tint). Add a subtle dot-grid SVG pattern as a fixed background element using `#caf0f8` at 40% opacity. This makes glassmorphism cards pop.
- **Glassmorphism recipe:** `bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl`
- **Hover states:** All interactive cards scale `1.02` with `transition-all duration-200`. Buttons get a glow shadow using the accent color.
- **Border radius:** `rounded-2xl` for cards, `rounded-xl` for buttons, `rounded-full` for badges.

---

## Sections to Build — In Order

### 1. Navigation (Sticky Glassmorphism)

- **Left:** `🚢` emoji + "ShipLog" in Syne Bold, color `#03045e`
- **Right:** "Login" ghost link + "Get Started →" filled button `bg-[#0077b6]` white text
- **Style:** `sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-[#caf0f8]`
- On scroll add a subtle drop shadow via Framer Motion `useScroll`

---

### 2. Hero Section

Full viewport height, vertically and horizontally centered.

**Headline:** "Ship faster. Communicate better."
- Font: Syne Bold, `text-5xl md:text-7xl`, color `#03045e`
- The word **"faster"** gets a wavy underline decoration in `#00b4d8`

**Sub-headline:** "Turn messy developer notes into polished, user-facing changelogs in seconds with AI. Stop writing updates — start shipping features."
- DM Sans, `text-lg md:text-xl`, color `#0077b6` at 80% opacity, `max-w-2xl` centered

**CTA Row:**
1. Primary: "Create Your Project →" — `bg-[#0077b6] text-white px-8 py-4 rounded-xl font-semibold hover:shadow-[0_0_24px_rgba(0,119,182,0.45)]`
2. Secondary: "View Live Demo" — `border border-[#0077b6] text-[#0077b6] px-8 py-4 rounded-xl hover:bg-[#caf0f8]`

**Background glow:** Large blurred radial circle `w-[700px] h-[700px] rounded-full bg-[#90e0ef]/20 blur-3xl absolute` centered behind text.

**Framer Motion:** Stagger headline → sub-headline → CTAs with `fadeInUp`. Delays: 0s, 0.15s, 0.3s.

---

### 3. The Problem Section

**Title:** "Every indie maker knows this pain"
Layout: 3 pain-point cards in a row (stack on mobile).

Each card has a dark background `bg-[#03045e]` with white text and a subtle red/orange accent. Use an emoji as the visual.

**Card 1 — The Chaos**
- Emoji: 😩
- Title: "Your dev notes are a mess"
- Body: "Commits like `fix auth bug`, `refactor db`, `add dark mode` mean nothing to your users. But rewriting them takes time you don't have."

**Card 2 — The Silence**
- Emoji: 🔇
- Title: "Users don't know what's changing"
- Body: "Your product improves every week but your users have no idea. No changelog = no trust. No trust = no retention."

**Card 3 — The Noise**
- Emoji: 🌊
- Title: "Feature requests everywhere"
- Body: "Twitter DMs, emails, random Slack messages. You have 50 feature requests and no idea which ones actually matter to the most people."

Animate all 3 cards on scroll with stagger.

---

### 4. The Solution — AI Magic Component

**Title:** "Watch the magic happen"
**Sub:** "Paste your raw commits. ShipLog's AI does the rest."

**Two-column layout** (stacks on mobile, `flex-col md:flex-row`):

**Left — "Before" terminal:**
- Dark card: `bg-[#03045e] rounded-2xl p-6 font-mono text-sm`
- Terminal chrome: 3 dots (red `#ff5f57`, yellow `#febc2e`, green `#28c840`) + label `raw-commits.txt`
- Content in `text-[#90e0ef]`:
```
fix login bug #auth
add dark mode toggle
refactor db layer - 3x faster
rate limit api endpoints
fix typo in onboarding email
add csv export feature
update deps
```
- `BEFORE` badge above in `bg-red-100 text-red-600`

**Right — "After" ShipLog card:**
- Glassmorphism: `bg-white/80 backdrop-blur-xl border border-[#caf0f8] rounded-2xl p-6 shadow-2xl`
- Header row: small ship emoji + "v2.4.0" version badge + date in gray
- Three badge sections:
  - 🟢 `NEW` in `bg-[#caf0f8] text-[#0077b6]`: "CSV export now available in your dashboard"
  - 🔵 `IMPROVED` in `bg-[#90e0ef]/40 text-[#03045e]`: "Dark mode in Settings", "App loads 3× faster"
  - 🔴 `FIXED` in `bg-red-50 text-red-500`: "OAuth login issue resolved", "Onboarding typo fixed"
- `AFTER` badge above in `bg-green-100 text-green-600`

**Center divider (desktop only):** Animated `⚡` icon in `#00b4d8` that pulses with `animate-pulse`.

**The Key Animation:** Use `useInView` on the right card. When it enters the viewport, each line item animates in with stagger (`y: 8 → 0, opacity: 0 → 1`, 0.1s apart). This simulates AI generating the entries live.

---

### 5. How It Works — 3 Steps

**Title:** "From chaos to clarity in 3 steps"

3 cards in a row (stack on mobile). Each card is glassmorphism.

Each card has a giant watermark step number (`01`, `02`, `03`) in `#caf0f8` at `text-[120px]` Syne Bold, absolute positioned behind the content.

**Step 1 — Paste**
- Icon: `FileText` (lucide) in `#0077b6`
- Title: "Paste your raw notes"
- Body: "Dump your commits, bullet points, or dev notes. Don't clean them up — that's our job."

**Step 2 — Generate**
- Icon: `Sparkles` (lucide) in `#00b4d8`
- Title: "AI writes it for you"
- Body: "GPT-4o reads your chaos and writes polished, categorized changelog entries your users will actually understand."

**Step 3 — Publish**
- Icon: `Globe` (lucide) in `#03045e`
- Title: "Publish in one click"
- Body: "Your users see a beautiful changelog at yourproduct.shiplog.app — instantly."

Animate on scroll with stagger.

---

### 6. Feature Grid

**Title:** "Everything your users deserve to see"
**Sub:** "One platform for changelogs, feature requests, and roadmaps."

3-column grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`). All glassmorphism cards.

On hover each card shows a colored top border (`border-t-2`) in its accent color. Icon sits in a small `rounded-xl bg-[#caf0f8] p-3` square.

**Card 1 — AI Changelog Writer**
- Icon: `Wand2` accent `#0077b6`
- Title: "AI Changelog Writer"
- Body: "Paste raw commits. Get polished entries split into New, Improved, and Fixed — in under 10 seconds. Your users finally understand what changed."

**Card 2 — Public Changelog Pages**
- Icon: `Globe` accent `#00b4d8`
- Title: "Public Changelog Pages"
- Body: "Every project gets a live public URL like `/your-product`. Your users see your latest updates and roadmap — beautifully formatted, always current."

**Card 3 — Feature Voting Board**
- Icon: `ThumbsUp` accent `#03045e`
- Title: "Feature Voting Board"
- Body: "Let users submit and upvote feature requests directly on your public page. No more guessing what people want."

**Card 4 — AI Feature Clustering**
- Icon: `GitBranch` accent `#0077b6`
- Title: "AI Feature Clustering"
- Body: "AI groups hundreds of similar feature requests into clean themes ranked by demand. Turn user chaos into a clear build list."

**Card 5 — Kanban Roadmap**
- Icon: `LayoutDashboard` accent `#00b4d8`
- Title: "Kanban Roadmap"
- Body: "Drag and drop roadmap items across Planned, In Progress, and Done. Your users see your roadmap in real time."

**Card 6 — AI Priority Ordering**
- Icon: `Sparkles` accent `#03045e`
- Title: "Smart Priority Ordering"
- Body: "AI analyzes vote patterns and suggests which roadmap items to tackle first. Build what matters most, always."

Animate all 6 cards on scroll with stagger.

---

### 7. Final CTA Banner

Full-width section, `bg-[#03045e]`, white text.

**Headline:** "Ready to ship with clarity?"
**Sub:** "Join indie makers who stopped writing updates and started building."
**Button:** "Start for free →" in `bg-[#00b4d8] text-[#03045e] font-bold` (inverted for contrast on dark bg)

Add a slow animated diagonal gradient shimmer on the background:
```css
@keyframes shimmer {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
background: linear-gradient(135deg, #03045e, #0077b6, #03045e);
background-size: 200% 200%;
animation: shimmer 6s ease infinite;
```

---

### 8. Footer

Background `bg-[#03045e]`, all text white or `text-[#90e0ef]`.

**Left:** `🚢 ShipLog` in Syne Bold + tagline "Ship faster. Communicate better." in small DM Sans
**Center:** Nav links — Home, Features, Changelog, Roadmap (all `hover:text-[#00b4d8]`)
**Right:** GitHub icon + Twitter/X icon from lucide, each in a small rounded ghost button

**Bottom bar** (border-top `border-[#0077b6]/30`):
"Built for AGIREADY.io Hiring Drive 2026 · Made with ❤️ by Piyush Malik"

---

## Framer Motion Patterns

```tsx
// Reusable fade-in-up variant
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' }
  }
}

// Stagger container
const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 }
  }
}

// Scroll-triggered — use on every section
const ref = useRef(null)
const isInView = useInView(ref, { once: true, margin: '-80px' })

// Apply like this
<motion.div
  ref={ref}
  variants={staggerContainer}
  initial="hidden"
  animate={isInView ? 'visible' : 'hidden'}
>
  <motion.h2 variants={fadeInUp}>...</motion.h2>
  <motion.p variants={fadeInUp}>...</motion.p>
</motion.div>
```

---

## Responsiveness Rules

- Mobile first. Single column by default, expand at breakpoints.
- `md:` (768px) for 2-column layouts
- `lg:` (1024px) for 3-column grids
- Hero headline: `text-4xl md:text-6xl lg:text-7xl`
- AI Magic section: `flex-col md:flex-row`
- Section padding: `px-6 md:px-16 lg:px-24 py-20 md:py-28`
- Nav: on mobile show only logo + "Get Started", hide "Login"

---

## File Structure

```
app/
└── page.tsx                      # Assembles all sections (server component)

components/
└── landing/
    ├── Navbar.tsx                # 'use client' — scroll shadow
    ├── HeroSection.tsx           # 'use client' — framer motion
    ├── ProblemSection.tsx        # 'use client' — scroll animation
    ├── AIMagicSection.tsx        # 'use client' — scroll + stagger animation
    ├── HowItWorks.tsx            # 'use client' — scroll animation
    ├── FeatureGrid.tsx           # 'use client' — scroll animation
    ├── CTABanner.tsx             # server component
    └── Footer.tsx                # server component
```

---

## Code Quality Rules

1. `'use client'` only on components using Framer Motion or React hooks
2. `page.tsx` stays a server component — just assembles sections
3. All buttons have `cursor-pointer transition-all duration-200`
4. Semantic HTML throughout: `<nav>`, `<main>`, `<section>`, `<footer>`, `<h1>`, `<h2>`, `<h3>`
5. No TypeScript errors — `npm run build` must pass clean
6. No hardcoded hex colors outside Tailwind arbitrary values

---

## Definition of Done

- [ ] All 8 sections render without errors
- [ ] Framer Motion animations fire on scroll (not on load)
- [ ] Fully responsive: 375px mobile, 768px tablet, 1440px desktop
- [ ] AI Magic right card animates line-by-line on scroll
- [ ] All buttons have correct hover glow states
- [ ] Glassmorphism visible and correct on nav + all cards
- [ ] Dot-grid background pattern visible behind sections
- [ ] Syne font on all headings, DM Sans on all body text
- [ ] `npm run build` passes with zero TypeScript errors
- [ ] No console errors in browser dev tools

---

*ShipLog Landing Page — AGIREADY.io Technical Assessment 2026 — Piyush Malik*