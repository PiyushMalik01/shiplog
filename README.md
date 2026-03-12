# ShipLog

> AI-powered changelog and roadmap management for indie makers and product teams.

Paste raw commit messages, get polished user-facing changelogs in seconds. Collect feature requests, cluster them with AI, and manage a prioritized roadmap -- all with a beautiful public page per product.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Postgres_+_Auth-3ECF8E?logo=supabase)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?logo=openai)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?logo=tailwindcss)

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Architecture Overview](#architecture-overview)
4. [Implementation Details](#implementation-details)
   - [Authentication & Session Management](#authentication--session-management)
   - [AI Pipeline](#ai-pipeline)
   - [Vote System](#vote-system)
   - [Public Changelog Page](#public-changelog-page)
   - [Kanban Roadmap Board](#kanban-roadmap-board)
   - [Sidebar & Theme](#sidebar--theme)
5. [Project Structure](#project-structure)
6. [Database](#database)
7. [Environment Variables](#environment-variables)
8. [Local Development](#local-development)
9. [Deployment](#deployment)
10. [Security](#security)

---

## Features

### Core

| Feature | Description |
|---|---|
| **AI Changelog Writer** | Paste raw commit messages or dev notes; GPT-4o generates structured New / Improved / Fixed changelog entries |
| **Public Changelog Page** | SSR page at `/<slug>` with full SEO metadata, changelog timeline, and feature request form |
| **Feature Voting** | Visitors submit and upvote requests anonymously. Votes deduplicated server-side by IP + UA fingerprint with a unique DB constraint. Toggle support -- vote again to unvote |
| **AI Request Clustering** | One click groups semantically related feature requests into roadmap themes using GPT-4o |
| **Kanban Roadmap Board** | Drag-and-drop board (Planned / In Progress / Done). Position and status persist on every drop via optimistic update + server sync |
| **AI Priority Suggestion** | GPT-4o analyzes vote counts and descriptions, reorders roadmap items by strategic priority |
| **Project Workspaces** | Multiple projects per account, each with a unique slug, public toggle, and independent data |
| **Authentication** | Email + password with email OTP verification via Supabase Auth; full password reset flow |
| **Dark Mode** | Full dark/light theme across all pages with a Sun/Moon toggle; system preference respected on first load |

### Extra Features

| Feature | Description |
|---|---|
| **AI Weekly Update Email** | Generate a polished product update email from the last 5 published changelogs; copy to clipboard |
| **AI Social Posts** | "Ship It" drawer generates LinkedIn and X posts for a finished roadmap item |
| **Embeddable Widget** | Minimal `/widget/<slug>` page for embedding as an `<iframe>` -- no chrome, just the changelog timeline |
| **Comment Threads** | Public comment threads on feature requests; owner replies get an automatic "Team" badge |
| **Admin Moderation** | Delete feature requests, delete comments, change request status inline -- all with inline confirm steps |
| **Contribution Graph** | GitHub-style heatmap on the dashboard showing changelog activity over 10 weeks |
| **Activity Stats** | Streak, active days, changelog count, and request count as stat cards |

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | **Next.js 16** (App Router, TypeScript) | Server Components, Route Handlers, Streaming |
| Database + Auth | **Supabase** (PostgreSQL + RLS + Auth) | Row Level Security on every table |
| AI | **OpenAI GPT-4o / GPT-4o-mini** | Server-side only; structured JSON output |
| Styling | **Tailwind CSS v4** + shadcn/ui | CSS variables for theming |
| Theme | **next-themes** | System-aware dark/light; SSR-safe |
| Animations | **Framer Motion** | Landing page and UI transitions |
| Drag and Drop | **@hello-pangea/dnd** | Kanban roadmap board |
| Toasts | **react-hot-toast** | Success / error feedback |
| Icons | **lucide-react** | Consistent icon set throughout |

---

## Architecture Overview

```
Browser
  |
  +-- Public pages (SSR)          /<slug>     -- Next.js Server Components
  +-- Dashboard (protected CSR)   /dashboard  -- Client Components + API calls
  +-- Auth pages                  /login etc. -- Supabase Auth helpers
          |
          v
  Next.js Route Handlers  (src/app/api/**)
          |
          +-- Supabase server client  -- user-scoped DB queries (RLS via JWT cookie)
          +-- Supabase service client -- privileged ops (vote deletion, RLS bypass)
          +-- OpenAI API              -- server-side only, never exposed to browser
                  |
                  v
          Supabase (PostgreSQL)
            - profiles / projects / changelog_entries
            - roadmap_items / feature_requests / votes / comments
            - increment_vote_count() RPC (SECURITY DEFINER)
            - Row Level Security policies on every table
```

All AI calls go through dedicated Route Handlers. The `OPENAI_API_KEY` is never sent to the browser. Supabase Auth JWTs are stored as HTTP-only cookies and forwarded by `@supabase/ssr` on every server client creation, so RLS automatically scopes every query to the authenticated user.

---

## Implementation Details

### Authentication & Session Management

**Flow:**
1. Signup -> email OTP verification -> profile auto-created by a Postgres trigger
2. Login -> Supabase issues a JWT stored in HTTP-only cookies via `@supabase/ssr`
3. Middleware (`src/middleware.ts`) runs on every request: calls `supabase.auth.getUser()` to refresh the session token and redirects unauthenticated users away from `/dashboard/**` routes

**Password reset:**
- `forgot-password` page calls `supabase.auth.resetPasswordForEmail()` with `redirectTo: ${origin}/reset-password`
- Supabase emails a magic link; the user lands on `/reset-password` which calls `supabase.auth.updateUser({ password })`
- Route group `(auth)` is transparent in URLs -- the `(auth)` prefix never appears in the browser address bar

**Server client creation** (`src/lib/supabase/server.ts`):
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        ),
      },
    }
  )
}
```

---

### AI Pipeline

All prompts live in `src/lib/prompts.ts`. Every AI route handler follows the same pattern: validate input -> build typed prompt -> call OpenAI with `response_format: { type: 'json_object' }` -> parse -> persist or return.

#### Changelog Generation (`/api/ai/generate-changelog`)

```
Raw developer notes (commit messages, bullet points)
        |
        v  GPT-4o with CHANGELOG_SYSTEM_PROMPT
        |
        v
{
  "title": "Release title",
  "new":      ["User-facing new feature description"],
  "improved": ["User-facing improvement description"],
  "fixed":    ["User-facing bug fix description"]
}
        |
        v  Saved to changelog_entries.content (JSONB)
```

The system prompt instructs GPT-4o to: write from the user's perspective, avoid technical jargon, merge similar items, generate a catchy release title, and return only valid JSON (no markdown wrappers).

#### Feature Request Clustering (`/api/ai/cluster-requests`)

```
Array of { id, title, description, vote_count }
        |
        v  GPT-4o with CLUSTER_SYSTEM_PROMPT
        |
        v
{
  "clusters": [
    {
      "label": "Theme name",
      "summary": "What users are asking for and why it matters",
      "request_ids": ["uuid1", "uuid2"],
      "total_votes": 45,
      "priority_score": 82
    }
  ]
}
        |
        v  Upserted into roadmap_items
           feature_requests.cluster_id FK set for each grouped request
           roadmap_items.vote_total synced from cluster total_votes
```

#### AI Priority Suggestion (`/api/ai/roadmap-priority`)

Sends current roadmap items (title, description, vote_total, status) to GPT-4o and receives back an ordered array of item IDs. Positions are recalculated and persisted in a single batch `upsert`.

#### AI Social Posts (`/api/ai/social-posts`)

Sends a single finished roadmap item to GPT-4o and receives `{ linkedin_post, x_post }`. Displayed in the "Ship It" drawer on the roadmap board column.

---

### Vote System

Designed for anonymous public voters with server-side deduplication and atomic counters.

#### Fingerprinting

```ts
const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
const ua = req.headers.get('user-agent') ?? ''
const fingerprint = createHash('sha256').update(ip + ua).digest('hex')
```

The fingerprint is a one-way SHA-256 hash of IP + User-Agent. It is never stored in plaintext and cannot be reversed to identify a user.

#### Database Deduplication

The `votes` table has a unique constraint:
```sql
UNIQUE(feature_request_id, voter_fingerprint)
```
Even under concurrent requests, the database rejects a duplicate insert with `error.code === '23505'` (unique violation). The API handles this gracefully and returns the current count.

#### Atomic Counter

Vote count increments use a `SECURITY DEFINER` Postgres function to avoid the read-then-write race condition:

```sql
CREATE OR REPLACE FUNCTION increment_vote_count(request_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE feature_requests SET vote_count = vote_count + 1 WHERE id = request_id;
$$;
```

A direct `.update({ vote_count: count + 1 })` fallback is used if the RPC is unavailable (e.g., running a dev environment before applying migrations).

#### Toggle / Unvote

The API endpoint (`POST /api/feature-requests/[id]/vote`) accepts an `action` field in the JSON body:

| `action` | Behaviour |
|---|---|
| `"add"` | Insert vote row + increment `vote_count` |
| `"remove"` | Delete vote row + decrement `vote_count` |
| `"toggle"` *(default)* | Check if vote row exists: if yes remove, if no add |

`VoteButton` sends `action: "add"` on first click and `action: "remove"` on second click. The API always returns `{ voted: boolean, vote_count: number }` and the UI state is fully driven by the canonical server response.

#### RLS & Service Role

The `votes` table intentionally has no DELETE RLS policy (inserts are fully public but deletion is privileged). To bypass this for unvotes, the API creates a privileged Supabase client using the service role key:

```ts
function createPrivilegedClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) return null
  return createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
```

If `SUPABASE_SERVICE_ROLE_KEY` is absent, the endpoint falls back to the anon client -- votes can still be cast but unvotes may be blocked by RLS.

#### Client-Side Hydration Safety

`VoteButton` persists voted state in `localStorage` keyed by request ID. To avoid a React hydration mismatch (SSR renders `false`, client reads a different value from storage), `voted` always initialises as `false` and is loaded from storage in a `useEffect` after mount:

```ts
const [voted, setVoted] = useState(false) // SSR-safe: never reads localStorage during render

useEffect(() => {
  setVoted(localStorage.getItem(`voted_${requestId}`) === '1')
}, [requestId])
```

---

### Public Changelog Page

`src/app/[slug]/page.tsx` is a **Next.js Server Component** -- no client JS required to render the initial page.

1. Resolves the project by `slug` from Supabase (public read via RLS `is_public = true`)
2. Fetches all published changelog entries ordered by `published_at DESC`
3. Fetches open feature requests ordered by `vote_count DESC`
4. Generates `generateMetadata()` for full Open Graph + Twitter card support
5. Renders `<PublicHeader>`, changelog timeline, and `<FeatureRequestForm>`

Uses `export const revalidate = 60` so content refreshes every 60 seconds via ISR without a full SSR hit on every request.

---

### Kanban Roadmap Board

Built with `@hello-pangea/dnd`. Each status column (Planned / In Progress / Done) is a `<Droppable>` and each card is a `<Draggable>`.

On `onDragEnd`:
1. **Optimistic update** -- local React state is updated immediately so the drag result is instant with no flicker
2. **API sync** -- `PATCH /api/roadmap/[id]` sends `{ status, position }` to persist the new state
3. All items in affected columns have their `position` values recalculated (0-indexed) and written in a batch upsert

---

### Sidebar & Theme

The dashboard sidebar (`Sidebar.tsx`) uses a hover-expand pattern:

- **Desktop:** Collapses to 78 px (icons + tooltips only) by default. On `onMouseEnter` it expands to 260 px. Width transitions with `transition-[width] duration-300 ease-out`.
- **Mobile:** The `<MobileNav>` drawer passes `collapsible={false}` so the sidebar always renders fully expanded inside the slide-out drawer.
- **ThemeToggle** accepts a `collapsed` prop -- when `true` the text label is hidden so only the icon is visible in the narrow collapsed state.

Theme persistence uses `next-themes` with `storageKey="shiplog-theme"`. `<ThemeProvider attribute="class">` is mounted in the root layout so Tailwind `dark:` classes activate automatically based on the stored preference or system setting.

---

## Project Structure

```
src/
  middleware.ts                    # Session refresh + auth redirect guards
  proxy.ts                         # Edge proxy helpers
  app/
    globals.css                    # Tailwind base + CSS custom properties
    layout.tsx                     # Root layout: ThemeProvider, Toaster
    page.tsx                       # Landing page
    (auth)/                        # Auth route group (transparent in URLs)
      login/page.tsx               # Email + password login
      signup/page.tsx              # Signup form
    (dashboard)/                   # Protected route group
      layout.tsx                   # Sidebar + MobileNav shell
      dashboard/page.tsx           # Stats heatmap + recent activity
      projects/
        page.tsx                   # Project list grid
        new/page.tsx               # Create project form
        [id]/settings/page.tsx     # Edit project settings
      changelog/
        page.tsx                   # Entry list + AI writer panel
        new/page.tsx               # New entry + AI generation
      roadmap/page.tsx             # Kanban board + AI priority + Ship It
      requests/page.tsx            # Feature request inbox + moderation
      settings/page.tsx            # Account settings
    [slug]/page.tsx                # Public changelog page (SSR + ISR)
    api/
      projects/route.ts            # GET list, POST create
        [id]/route.ts              # GET one, PATCH, DELETE
      changelogs/route.ts          # GET list, POST create
        [id]/route.ts              # GET one, PATCH, DELETE
      roadmap/route.ts             # GET list, POST create
        [id]/route.ts              # GET one, PATCH, DELETE
      feature-requests/route.ts    # GET list, POST create
        [id]/vote/route.ts         # POST -- toggle vote (add / remove / toggle)
        [id]/comment/route.ts      # GET / POST / DELETE comments
      ai/
        generate-changelog/        # GPT-4o: raw notes -> structured changelog JSON
        cluster-requests/          # GPT-4o: requests -> roadmap cluster themes
        roadmap-priority/          # GPT-4o: reorder roadmap items by priority
  components/
    landing/                       # HeroSection, FeatureGrid, HowItWorks, etc.
    dashboard/
      Sidebar.tsx                  # Hover-expand navigation + project switcher
      ThemeToggle.tsx              # Sun/Moon icon button (collapsed-aware label)
      MobileNav.tsx                # Slide-out drawer wrapper (always expanded)
      ActivityCalendar.tsx         # 10-week GitHub-style contribution heatmap
      StatBar.tsx                  # Streak / count stat cards
      ProjectCard.tsx              # Project tile with quick-action links
      DashboardHeader.tsx          # Page title + optional action slot
    changelog/
      ChangelogCard.tsx            # Entry card: version, title, new/improved/fixed lists
    public/
      PublicHeader.tsx             # Project logo, name, tagline
      FeatureRequestForm.tsx       # Title + description public submission form
      VoteButton.tsx               # Toggle vote button (hydration-safe localStorage state)
    ui/
      button.tsx                   # Variant button (default / ghost / destructive)
      EmptyState.tsx               # Centered icon + message + optional CTA link
      PageHeader.tsx               # Section title + subtitle layout
      StatusBadge.tsx              # Coloured pill: open / planned / in_progress / done
      ConfirmInline.tsx            # Inline confirm step (replaces modal for destructive actions)
  lib/
    supabase/
      client.ts                    # Browser Supabase client (singleton)
      server.ts                    # Server Supabase client (reads cookie JWT for RLS)
    openai.ts                      # OpenAI singleton client
    prompts.ts                     # All AI system prompts + user prompt builder functions
    utils.ts                       # cn() = clsx + tailwind-merge
    constants.ts                   # Nav links, badge label maps, column label constants
  types/
    index.ts                       # TypeScript interfaces for all DB entities
```

---

## Database

All tables, RLS policies, functions, and triggers are in [`schema.sql`](schema.sql). Run the entire file once in your Supabase SQL Editor for a fresh setup.

### Tables

| Table | Primary Key | Purpose |
|---|---|---|
| `profiles` | `id` (FK -> `auth.users`) | User display name; auto-created on signup by DB trigger |
| `projects` | `id` (UUID) | Product workspaces; `slug` is globally unique |
| `changelog_entries` | `id` (UUID) | Versioned entries; `content` is `JSONB {new, improved, fixed}` |
| `roadmap_items` | `id` (UUID) | AI-clustered themes; `priority`, `position`, `vote_total` |
| `feature_requests` | `id` (UUID) | Public submissions; `vote_count` updated via atomic RPC |
| `votes` | `id` (UUID) | Dedup: `UNIQUE(feature_request_id, voter_fingerprint)` |
| `comments` | `id` (UUID) | Thread replies; `is_admin=true` for project owner replies |

### Row Level Security

RLS is enabled on every table. Policy matrix:

| Table | Public Read | Public Write | Authenticated Owner |
|---|---|---|---|
| `projects` | Public projects only (`is_public=true`) | -- | Full CRUD |
| `changelog_entries` | Published only (`is_published=true`) | -- | Full CRUD |
| `roadmap_items` | All rows | -- | Full CRUD |
| `feature_requests` | All rows | INSERT (anyone) | Full CRUD |
| `votes` | All rows | INSERT (anyone) | -- |
| `comments` | All rows | INSERT (anyone) | DELETE own project's comments |

### Postgres Function

```sql
-- Atomic vote increment -- avoids read-then-write race condition
CREATE OR REPLACE FUNCTION increment_vote_count(request_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE feature_requests SET vote_count = vote_count + 1 WHERE id = request_id;
$$;
```

### User Auto-Provision Trigger

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
```

### Migrations (existing installs)

If upgrading an older instance rather than running `schema.sql` from scratch:

```sql
-- Admin comment badge
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Atomic vote increment function
CREATE OR REPLACE FUNCTION increment_vote_count(request_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE feature_requests SET vote_count = vote_count + 1 WHERE id = request_id;
$$;
```

---

## Environment Variables

Create `.env.local` in the project root:

```env
# Supabase -- Project Settings -> API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase service role -- Project Settings -> API (secret, server-only)
# Required for vote deletion (unvote). Without it, unvotes are blocked by RLS.
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI -- needs GPT-4o access
OPENAI_API_KEY=sk-...

# App URL -- used for metadataBase and password-reset redirectTo
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> `SUPABASE_SERVICE_ROLE_KEY` is a **server-only** secret. It is never sent to the browser or included in client bundles. The `votes` table has no DELETE RLS policy by design; without this key the unvote path falls back to the anon client and decrements may be blocked.

---

## Local Development

### Prerequisites

- Node.js 18+
- A Supabase project (free tier works)
- An OpenAI API key with GPT-4o access

### Setup

```bash
# 1. Clone
git clone <repo-url>
cd shiplog

# 2. Install dependencies
npm install

# 3. Create environment file and fill in values (see above)
cp .env.example .env.local

# 4. Initialize the database
# Open your Supabase project -> SQL Editor -> paste and run schema.sql

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Production build (type-check + compile) |
| `npm run start` | Serve a production build locally |
| `npm run lint` | ESLint across the project |

---

## Deployment

### Vercel (recommended)

1. Push the repository to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add all five environment variables in **Project Settings -> Environment Variables**
4. Deploy -- Vercel auto-deploys on every push to `master`

Set `NEXT_PUBLIC_APP_URL` to your production domain (e.g. `https://shiplog.app`) so password-reset emails contain the correct redirect URL and Open Graph metadata resolves correctly.

### Supabase Auth Redirect URL

In Supabase dashboard under **Authentication -> URL Configuration**, add your production domain to **Redirect URLs**:

```
https://your-domain.com/**
```

This allows the magic-link and password-reset flows to redirect back to your app in production.

---

## Security

| Concern | Mitigation |
|---|---|
| API key exposure | `OPENAI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are server-only; never sent to the browser or included in client bundles |
| Unauthorized data access | RLS on every table; the server Supabase client forwards the user JWT cookie so all queries are automatically scoped to the authenticated user |
| Session hijacking | Auth tokens in HTTP-only cookies via `@supabase/ssr`; middleware refreshes tokens on every request |
| Vote manipulation | SHA-256 fingerprint of IP + UA; unique DB constraint prevents duplicate rows even under concurrent requests |
| Race conditions on votes | Atomic SQL function (`increment_vote_count`) for counter updates; no application-level read-modify-write |
| SQL injection | Supabase query builder uses parameterised queries; no raw SQL string interpolation |
| AI prompt injection | User input is passed as a literal value inside a structured prompt builder function, isolated from the system prompt |
| HTTP security headers | `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` set globally via `next.config.ts` |
| Demo endpoint abuse | `/api/ai/demo-changelog` rate-limited to 5 requests / IP / hour with `Retry-After` response headers |