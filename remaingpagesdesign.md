# ShipLog — Complete Remaining Pages Refactor

> This prompt covers every page not yet built or styled:
> Auth, Projects, Changelog Writer, Public Page, Feature Requests, Roadmap/Kanban
> Run AFTER global design system and dashboard are complete.

---

## PROMPT (copy everything below)

---

You are a Senior Frontend Engineer building the remaining pages of ShipLog — a production SaaS for indie makers. The global design system, dashboard, and landing page are already done. Your job is to build every remaining page to the same quality standard.

**Non-negotiable design rules before you write a single line:**
- No emojis anywhere in the UI
- No glow effects, no neon, no blur-heavy glassmorphism in content areas
- No gradient text
- No floating orbs or decorative blobs
- Clean, flat-ish surfaces with precise borders and shadows only where they add depth
- Typography does the heavy lifting — not color or decoration
- Think: Linear, Vercel dashboard, Stripe — premium utility tools
- Every page must be fully responsive: 375px mobile → 1440px desktop
- All data is real — fetched from Supabase, no mock data in production code

---

## Design System Reminder

```
Background:        #f0f9ff
Surface (cards):   #ffffff  border: #e2e8f0
Sidebar:           already built — do not touch
Primary:           #03045e  (headings, strong text)
Secondary:         #0077b6  (links, primary buttons)
Muted text:        #64748b
Border:            #e2e8f0
Danger:            #dc2626
Success:           #16a34a
Warning:           #d97706

Fonts:
  Headings → font-heading (Syne)
  Body     → font-sans (DM Sans)
  Code     → font-mono (JetBrains Mono)

Spacing rhythm: 4 / 8 / 12 / 16 / 24 / 32 / 48px
Border radius: sm=6px  md=10px  lg=14px  xl=18px

Button sizes:
  sm  → px-3 py-1.5 text-xs rounded-lg
  md  → px-4 py-2   text-sm rounded-xl    ← default
  lg  → px-6 py-3   text-base rounded-xl

Shadow tokens (use sparingly):
  card  → 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)
  modal → 0 20px 60px rgba(0,0,0,0.15)
  focus → 0 0 0 3px rgba(0,119,182,0.15)
```

---

## Pages to Build

---

## PAGE 1 — Login & Signup

**Files:** `app/(auth)/login/page.tsx` and `app/(auth)/signup/page.tsx`

**Layout:** Two-column on desktop. Left: brand panel. Right: form. Single column on mobile (form only).

### Left Panel (hidden on mobile, `lg:flex`)
- Background: `#03045e`
- Top-left: ShipLog wordmark in white, Syne bold
- Center: Large quote or product statement in white
  - Login: *"Your users deserve to know what you're building."*
  - Signup: *"The fastest way to keep your users in the loop."*
- Below quote: 3 bullet points with a thin left border in `#0077b6`
  - "AI-generated changelogs from raw commit messages"
  - "Public roadmap pages that build user trust"
  - "Feature voting that tells you exactly what to build next"
- Bottom: fine print — "Used by indie makers worldwide"

### Right Panel (form area)
- Background: `#f0f9ff`
- Centered vertically and horizontally
- Max width: `440px`
- Top: "Welcome back" (login) or "Create your account" (signup) in Syne bold, `#03045e`, 28px
- Subtext: muted, 14px
- Form fields use the `.input` class from globals
- Labels: 13px semibold `#03045e`, `mb-1.5`
- Error states: red border + small red message below field
- Primary CTA button: full width, `bg-[#0077b6]`, white text, `rounded-xl`, `py-3`
- Below CTA: "Already have an account? Sign in" or vice versa — muted text with `#0077b6` link
- Divider with "or" for OAuth (optional, style as `flex items-center gap-3` with `hr` lines)

**Signup fields:** Full name, Email, Password (with show/hide toggle)
**Login fields:** Email, Password (with show/hide toggle + "Forgot password?" right-aligned link)

**Behavior:**
- Use Supabase `signInWithPassword` and `signUp`
- On success: redirect to `/dashboard`
- Show inline field-level errors from Supabase (not toast — inline, under the field)
- Loading state: button shows spinner + "Signing in..." text, disabled

---

## PAGE 2 — New Project

**File:** `app/(dashboard)/projects/new/page.tsx`

**Layout:** Single centered column, max-width `560px`, padded top `py-12`

**Header:**
- Breadcrumb: `Dashboard / Projects / New` — 12px muted uppercase
- Title: "Create a new project" — Syne bold 28px
- Subtext: "Your project gets a public changelog page at shiplog.app/your-slug" — 14px muted

**Form fields (in order):**

1. **Project Name**
   - Label: "Project name"
   - Placeholder: "My SaaS App"
   - Validation: required, min 2 chars

2. **Slug** (auto-generated from name, editable)
   - Label: "Public URL slug"
   - Prefix display: show `shiplog.app/` as a non-editable prefix inside the input visually
   - Right side of input: availability indicator — loading spinner → green check "Available" or red x "Taken"
   - Auto-generate slug from name: lowercase, replace spaces with hyphens, strip special chars
   - Debounce availability check: 400ms after typing stops
   - Check against Supabase `projects` table

3. **Description**
   - Label: "Description" + "(optional)" in muted
   - Textarea, 3 rows
   - Placeholder: "What does your product do in one sentence?"

4. **Visibility toggle**
   - Label: "Public changelog page"
   - Description: "Anyone with the link can view your changelog and submit feature requests"
   - Style: custom toggle switch — pill shape, `bg-[#0077b6]` when on, `bg-[#e2e8f0]` when off
   - Default: on

**Submit button:** "Create Project" — full width, primary style
**Cancel link:** text link below button, routes back to `/dashboard`

**On submit:**
- Insert into `projects` table
- Redirect to `/dashboard` on success
- Show inline error if slug is taken (race condition — check again on submit)

---

## PAGE 3 — Changelog List

**File:** `app/(dashboard)/changelog/page.tsx`

**Header row:**
- Left: "Changelog" title (Syne bold 24px) + project name in a muted badge
- Right: "Write Update" button → `/dashboard/changelog/new`

**Filter bar** (below header, above list):
- Tabs: All / Published / Drafts — styled as underline tabs, not pill buttons
- Search input: icon-left search icon, placeholder "Search entries..."

**Entry list (not a grid — a clean vertical list):**

Each entry row:
- Left: thin colored left border (`#0077b6` if published, `#e2e8f0` if draft)
- Version badge: `v1.2.0` in monospace, muted background, small
- Title: Syne semibold, `#03045e`, 16px
- Date: muted 13px, right side
- Status badge: "Published" in green bg/text or "Draft" in yellow bg/text
- Category counts: small pills — "3 New · 2 Improved · 1 Fixed" in muted
- On row hover: show action row — "Edit" / "Publish" or "Unpublish" / "Delete"
- Delete shows a confirmation inline (not modal) — "Are you sure? Confirm / Cancel"

**Empty state:**
- Centered, no entries icon (use `ScrollText` from lucide, 48px, muted color)
- "No changelog entries yet"
- "Write your first update to let users know what you've been building"
- CTA button: "Write Update"

---

## PAGE 4 — AI Changelog Writer

**File:** `app/(dashboard)/changelog/new/page.tsx`

This is the most important dashboard page. It must feel fast and satisfying to use.

**Layout:** Two-column on desktop (`lg:grid lg:grid-cols-2 gap-6`). Single column on mobile (input first, output below).

### Left Column — Input

**Section label:** "RAW INPUT" — 11px uppercase tracked muted

**Textarea:**
- Large, no visible border radius on corners (square-ish, `rounded-lg`)
- Subtle inner border: `border border-[#e2e8f0]`
- Background: white
- Font: `font-mono text-sm`
- Min height: `280px`
- Placeholder (multiline):
```
fix login bug for OAuth users
add dark mode to settings
refactor database layer — 3x performance
rate limit the public API
fix typo in onboarding email
add CSV export to dashboard
```
- Character count: bottom-right of textarea, `14/2000` style, muted 12px

**Below textarea:**
- Version field: small inline input, label "Version (optional)", placeholder "v1.2.0", max-width 160px
- Generate button: full width below version field
  - Text: "Generate Changelog"
  - Left icon: `Sparkles` from lucide, 16px
  - Style: `bg-[#03045e] text-white hover:bg-[#0077b6]` — dark primary to feel like a powerful action
  - Loading state: spinner + "Generating..." — disable button

### Right Column — Output

**Section label:** "AI OUTPUT" — 11px uppercase tracked muted

**Before generation:**
- Placeholder card with dashed border `border-dashed border-[#e2e8f0]`
- Centered muted text: "Your polished changelog will appear here"
- Min height matches input area

**After generation — the result card:**
- White card, solid border, `rounded-xl`
- Editable title at top: `input` styled as plain text (no border until focus), Syne bold 18px
- Three sections, each collapsible:

  **New** section:
  - Header: thin left border `#16a34a` + "New" label in green, count badge
  - Each item: text that is directly editable (contenteditable div or input)
  - Hover on item: show drag handle (left) and delete icon (right)
  - "Add item" link at bottom of section

  **Improved** section:
  - Same pattern, left border `#0077b6`, blue

  **Fixed** section:
  - Same pattern, left border `#dc2626`, red

**Action bar below output card:**
- Left: "Save as Draft" — ghost button
- Right: "Save & Publish" — primary button
- Both call `POST /api/changelogs` then `PATCH` if publishing

**Error state:** If OpenAI fails, show an inline error banner (not toast):
- `bg-red-50 border border-red-200 rounded-xl p-4`
- Message: "Generation failed. Check your input and try again."
- Retry button

---

## PAGE 5 — Feature Requests Inbox

**File:** `app/(dashboard)/requests/page.tsx`

**Header:**
- Title: "Feature Requests"
- Right: "Cluster with AI" button — `bg-[#03045e] text-white` with `GitBranch` icon
  - On click: calls `POST /api/ai/cluster-requests`, shows loading overlay on button
  - On success: show success banner "X roadmap items created from your requests"

**Stats row** (3 small inline stats, not full stat cards):
- "Total Requests: 24 · Open: 18 · Clustered: 6" — inline, muted, separated by `·`

**Filter/Sort bar:**
- Filter tabs: All / Open / Planned / Done
- Sort dropdown: "Most Votes" / "Newest" / "Oldest"

**Request list:**

Each request row (clean table-like rows, alternating subtle bg):
- Vote count: large number left side, bold, `#03045e` — like a vote counter. Up arrow button above it
- Title: semibold 15px, `#03045e`
- Description: muted 13px, truncated 1 line
- Status badge: Open / Planned / In Progress / Done
- Comment count: `MessageSquare` icon + count, muted small
- Date: muted right side
- Expand on click: shows full description + comment thread inline (not modal)

**Comment thread (expanded):**
- Each comment: author name + body + date, simple stacked list
- Text input at bottom + "Post" button

**Empty state:**
- Icon: `Inbox` from lucide, 48px muted
- "No feature requests yet"
- "Share your public page link to start collecting feedback from users"

---

## PAGE 6 — Kanban Roadmap Board

**File:** `app/(dashboard)/roadmap/page.tsx`

**Header:**
- Title: "Roadmap"
- Right: "Add Item" button (secondary style) + "AI Prioritize" button (primary dark style with `Sparkles` icon)
  - AI Prioritize: calls `POST /api/ai/roadmap-priority`, then re-renders board with new order
  - Show loading state on button during call

**Board layout:**
- 3 columns: `Planned` / `In Progress` / `Done`
- `grid-cols-3` on desktop, horizontal scroll `flex` on mobile (snap scrolling)
- Each column has a header with column name + item count badge

**Column header design:**
- `Planned`: left border accent `#d97706` (amber)
- `In Progress`: left border accent `#0077b6` (blue)
- `Done`: left border accent `#16a34a` (green)

**Kanban card design:**
- White card, border `#e2e8f0`, `rounded-xl`, `p-4`
- Title: semibold 14px `#03045e`
- AI summary: muted 13px, 2 lines max
- Footer: vote total badge (muted) + priority number
- Drag handle: `GripVertical` icon left side, shows on hover
- On drag: card gets subtle shadow + slight scale `1.02`, column highlights on hover

**Drag and drop:** Use `@hello-pangea/dnd`
- `DragDropContext` wraps the whole board
- Each column is a `Droppable`
- Each card is a `Draggable`
- On `onDragEnd`: call `PATCH /api/roadmap/:id` with new `status` and `position`

**Add Item modal (inline, not a separate page):**
- Slide down from top of column or show as a modal
- Fields: Title (required), Description (optional)
- "Add to Planned" → inserts with `status: 'planned'`

**Empty column state:**
- Dashed border rectangle inside column
- Muted text: "No items yet"
- Not clickable — just visual

---

## PAGE 7 — Public Changelog Page

**File:** `app/[slug]/page.tsx`

This is what the founder's users see. It must look polished, trustworthy, and clean — like a real product page.

**This is a Server Component with `generateMetadata`.**

```tsx
export async function generateMetadata({ params }) {
  // fetch project by slug, return title + description
}
```

**Layout:** Single column, max-width `720px`, centered, generous padding

### Public Page Header
- Project name: Syne bold 28px, `#03045e`
- Description: muted 15px, max 2 lines
- "Powered by ShipLog" — very small, muted, bottom right — links to landing page
- Thin divider below header

### Changelog Feed

Each entry card:
- Version badge: `v1.2.0` monospace, small muted pill
- Title: Syne semibold 20px, `#03045e`
- Published date: muted 13px
- Three category sections:

  **New items:**
  - Small filled circle `#16a34a` + item text, 14px
  - Label: "New" in green uppercase 11px tracked

  **Improved items:**
  - Small filled circle `#0077b6` + item text
  - Label: "Improved" in blue

  **Fixed items:**
  - Small filled circle `#dc2626` + item text
  - Label: "Fixed" in red

- Divider between entries: single `1px #e2e8f0` line with entry date on it (like GitHub's timeline)

**Empty state:** "No updates published yet. Check back soon."

### Feature Request Section (below changelog)

Thin divider + section header: "Feature Requests"
Subtext: "Vote on what you want to see next, or suggest something new."

**Request submission form:**
- Title input: placeholder "What feature would help you most?"
- Description textarea: optional, 2 rows
- Email input: optional, "Notify me when this ships"
- Submit button: "Submit Request" — full width on mobile, auto on desktop

**Existing requests list:**
- Each row: vote count (bold, left) + title + status badge
- Upvote button: outline arrow-up button, turns filled `#0077b6` if already voted (check localStorage for vote state)
- Sorted by vote count descending

---

## SHARED COMPONENTS TO CREATE

### `components/ui/PageHeader.tsx`
```tsx
// Reusable page header — breadcrumb + title + subtitle + optional right slot
interface PageHeaderProps {
  breadcrumb?: string
  title: string
  subtitle?: string
  right?: React.ReactNode
}
```

### `components/ui/EmptyState.tsx`
```tsx
// Reusable empty state — icon + title + body + optional CTA
interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  body: string
  cta?: React.ReactNode
}
```

### `components/ui/StatusBadge.tsx`
```tsx
// Maps status string to styled badge
// 'published' | 'draft' | 'open' | 'planned' | 'in_progress' | 'done'
// Uses .badge classes from globals.css
```

### `components/ui/ConfirmInline.tsx`
```tsx
// Inline "Are you sure?" — replaces confirm() dialogs
// Shows "Confirm / Cancel" inline where the action was triggered
// Used for delete actions throughout
```

---

## INTERACTION STANDARDS — Apply These Everywhere

**Loading buttons:**
```tsx
<button disabled={loading} className="btn btn-primary">
  {loading
    ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
    : 'Submit'
  }
</button>
```

**Toast notifications** (use `react-hot-toast`):
- Success: `toast.success('Changelog published')` — default styling override to match palette
- Error: `toast.error('Something went wrong')` — only for non-recoverable errors
- For form errors: always inline under the field, never toast

**Toast style override in layout:**
```tsx
<Toaster
  position="bottom-right"
  toastOptions={{
    style: {
      background: '#03045e',
      color: '#fff',
      fontSize: '14px',
      borderRadius: '12px',
      padding: '12px 16px',
    },
    success: { iconTheme: { primary: '#00b4d8', secondary: '#fff' } },
  }}
/>
```

**Focus states:** Every interactive element must show `box-shadow: 0 0 0 3px rgba(0,119,182,0.15)` on focus-visible — already in globals as `*:focus-visible` rule.

**Transitions:** All hover/active states use `transition-all duration-150` — fast and crisp, not slow and floaty.

---

## FILE STRUCTURE SUMMARY

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (dashboard)/
│   ├── changelog/
│   │   ├── page.tsx              ← list
│   │   └── new/page.tsx          ← AI writer
│   ├── projects/
│   │   └── new/page.tsx
│   ├── requests/page.tsx
│   └── roadmap/page.tsx
└── [slug]/page.tsx               ← public page

components/
├── dashboard/
│   ├── changelog/
│   │   ├── ChangelogList.tsx
│   │   ├── ChangelogRow.tsx
│   │   ├── AIWriter.tsx          ← the two-column writer UI
│   │   └── OutputCard.tsx        ← editable AI result
│   ├── roadmap/
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   └── KanbanCard.tsx
│   └── requests/
│       ├── RequestList.tsx
│       ├── RequestRow.tsx
│       └── CommentThread.tsx
├── public/
│   ├── PublicHeader.tsx
│   ├── ChangelogFeed.tsx
│   ├── ChangelogEntry.tsx
│   └── FeatureRequestPanel.tsx
└── ui/
    ├── PageHeader.tsx
    ├── EmptyState.tsx
    ├── StatusBadge.tsx
    └── ConfirmInline.tsx
```

---

## DEFINITION OF DONE

**Auth:**
- [ ] Login and signup work end-to-end with Supabase
- [ ] Inline field errors, no toast for validation
- [ ] Redirect to `/dashboard` on success

**Projects:**
- [ ] Slug auto-generates from name with debounced availability check
- [ ] Availability shown as green check or red x
- [ ] Project saves to Supabase and redirects

**Changelog List:**
- [ ] Shows real entries from Supabase
- [ ] Filter tabs (All/Published/Drafts) work
- [ ] Publish/unpublish works inline
- [ ] Delete with inline confirmation

**AI Writer:**
- [ ] Raw input → OpenAI → structured output renders correctly
- [ ] Each item in output is directly editable before saving
- [ ] Save as Draft and Save & Publish both work
- [ ] Error state shows inline if generation fails

**Feature Requests:**
- [ ] List shows real requests sorted by votes
- [ ] Vote button deduplicates by fingerprint
- [ ] Comment thread expands inline
- [ ] "Cluster with AI" creates roadmap items

**Kanban:**
- [ ] Drag and drop works across all 3 columns
- [ ] Status updates persist to Supabase on drop
- [ ] AI Prioritize reorders cards
- [ ] Add Item creates a new roadmap item

**Public Page:**
- [ ] SSR — no client-side fetching
- [ ] `generateMetadata` returns correct title/description
- [ ] Feature request form submits to Supabase
- [ ] Vote button works anonymously

**All Pages:**
- [ ] Fully responsive at 375px, 768px, 1440px
- [ ] No emojis in UI
- [ ] No decorative blobs, glows, or gradient text
- [ ] All loading states implemented
- [ ] `npm run build` passes with zero TypeScript errors

---

*ShipLog — Full Remaining Pages — AGIREADY.io Technical Assessment 2026 — Piyush Malik*