# ShipLog

AI-powered changelog and roadmap management for indie makers and product teams. Paste raw commit messages, get polished user-facing changelogs in seconds. Collect feature requests, cluster them with AI, and manage a prioritized roadmap — all with a beautiful public page per product.

---

## Live Demo

> Deploy URL listed after Vercel deployment.

---

## Features

### Core

| Feature | Description |
|---|---|
| **AI Changelog Writer** | Paste raw commit messages or dev notes; GPT-4o generates structured New / Improved / Fixed changelog entries |
| **Public Changelog Page** | SSR page at `/<slug>` with SEO metadata, changelog timeline, and feature request form |
| **Feature Voting** | Visitors submit and upvote requests anonymously. Votes deduplicated server-side by IP + UA fingerprint with a unique DB constraint |
| **AI Request Clustering** | One click groups semantically related feature requests into roadmap themes using GPT-4o |
| **Kanban Roadmap Board** | Drag-and-drop board (Planned / In Progress / Done). Position and status persist on every drop |
| **AI Priority Suggestion** | GPT-4o analyzes vote counts and descriptions, reorders roadmap items by strategic priority |
| **Project Workspaces** | Multiple projects per account, each with a unique slug, public toggle, and independent data |
| **Authentication** | Email + OTP via Supabase Auth with full Row Level Security enforcement |
| **Dark Mode** | Full dark theme across all pages and components with a Sun/Moon toggle in the sidebar |

### Extra Features

| Feature | Description |
|---|---|
| **AI Weekly Update Email** | Generate a polished product update email from the last 5 published changelogs; copy to clipboard |
| **AI Social Posts** | "Ship It" drawer generates LinkedIn and X posts for a finished roadmap item |
| **Embeddable Widget** | Minimal `/widget/<slug>` page for embedding as an `<iframe>` — no chrome, just the changelog timeline |
| **Comment Threads** | Public comment threads on feature requests; owner replies get an automatic "Team" badge |
| **Admin Moderation** | Delete feature requests, delete comments, change request status inline — all with confirm steps |
| **Contribution Graph** | GitHub-style heatmap on the dashboard showing activity over 10 weeks |
| **Activity Stats** | Streak, active days, changelog count, and request count as stat cards |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Database + Auth | Supabase (PostgreSQL + Row Level Security) |
| AI | OpenAI GPT-4o / GPT-4o-mini (server-side only) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Theme | next-themes (system-aware dark mode) |
| Drag and Drop | @hello-pangea/dnd |
| Toasts | react-hot-toast |

---

## Project Structure

```
src/
  middleware.ts              # Auth protection: session refresh + route guards
  app/
    (auth)/
      login/                 # Email + password login
      signup/                # Signup with email OTP verification
      verify-email/          # 6-digit OTP input (with resend cooldown)
    (dashboard)/
      dashboard/             # Stats, contribution heatmap, recent activity
      projects/              # Project list, creation, settings
      changelog/             # List + AI writer + email draft generator
      roadmap/               # Kanban board + AI priority + Ship It social posts
      requests/              # Feature request inbox + admin replies + moderation
      settings/              # Account settings
    [slug]/                  # Public changelog + voting + comment threads (SSR)
    widget/[slug]/           # Embeddable iframe changelog (SSR, no chrome)
    api/
      projects/              # CRUD — RLS enforces ownership
      changelogs/            # CRUD — drafts hidden from non-owners via RLS
      roadmap/               # CRUD — RLS enforces ownership
      feature-requests/      # Public CRUD + voting + comment threads
        [id]/vote            # Anonymous vote (atomic DB increment, unique constraint dedup)
        [id]/comment         # GET / POST / DELETE with is_admin detection
      ai/
        generate-changelog   # GPT-4o: raw notes ? structured changelog
        generate-email       # GPT-4o: published entries ? email draft
        cluster-requests     # GPT-4o: cluster requests ? roadmap items
        roadmap-priority     # GPT-4o: reorder roadmap by strategic priority
        social-posts         # GPT-4o: Ship It ? LinkedIn + X post copy
        demo-changelog       # GPT-4o-mini: landing page demo (rate-limited, no auth)
  components/
    ThemeProvider.tsx        # next-themes wrapper
    dashboard/
      Sidebar.tsx            # Navigation + theme toggle
      ThemeToggle.tsx        # Sun/Moon toggle button
      ActivityCalendar.tsx
      StatBar.tsx
      ProjectCard.tsx
      DashboardHeader.tsx
      MobileNav.tsx
    changelog/ChangelogCard.tsx
    public/                  # PublicHeader, FeatureRequestForm, VoteButton
    ui/                      # EmptyState, PageHeader, StatusBadge, Button, ConfirmInline
  lib/
    supabase/client.ts       # Browser Supabase client
    supabase/server.ts       # Server Supabase client (reads auth cookies for RLS)
    openai.ts                # Singleton OpenAI client
    prompts.ts               # All AI system + user prompts
    utils.ts                 # cn() helper (clsx + tailwind-merge)
    constants.ts             # Site metadata, nav links, badge/column labels
  types/index.ts             # TypeScript interfaces for all DB entities
```

---

## Local Development

### Prerequisites

- Node.js 18+
- A Supabase project
- An OpenAI API key with GPT-4o access

### Setup

```bash
# 1. Clone
git clone <repo-url>
cd shiplog

# 2. Install
npm install

# 3. Configure environment variables
# Create .env.local in the project root (see below)

# 4. Initialize the database
# Open the Supabase SQL Editor and run the full contents of schema.sql

# 5. Run
npm run dev
```

Open http://localhost:3000

---

## Environment Variables

Create `.env.local` in the project root:

```env
# Supabase — from your project's API settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI — needs GPT-4o access
OPENAI_API_KEY=sk-...

# App URL — used for metadataBase and absolute URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> All four variables are required in production. The middleware will fail-fast and log a fatal error if Supabase credentials are absent.

---

## Database

All tables, RLS policies, and triggers are defined in `schema.sql`. Run the entire file in your Supabase SQL Editor for a fresh setup.

| Table | Purpose |
|---|---|
| `profiles` | Auto-created on signup via DB trigger |
| `projects` | User-owned workspaces; `slug` is globally unique |
| `changelog_entries` | Versioned entries; `content` is JSONB `{new, improved, fixed}` |
| `roadmap_items` | AI-clustered themes; `priority` and `position` for ordering |
| `feature_requests` | User submissions; `vote_count` updated atomically via `increment_vote_count()` RPC |
| `votes` | Dedup via `UNIQUE(feature_request_id, voter_fingerprint)` |
| `comments` | `is_admin=true` when posted by the project owner from the dashboard |

### Row Level Security

RLS is enabled on every table:

- Users can only read/write their own projects and related data
- Published changelog entries and roadmap items are publicly readable
- Feature requests and comments are publicly readable and writable
- Only project owners can delete comments on their projects' requests

### Migrations (existing installs)

```sql
-- 1. Admin comment badge
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- 2. Atomic vote increment (avoids read-then-write race condition)
CREATE OR REPLACE FUNCTION increment_vote_count(request_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE feature_requests SET vote_count = vote_count + 1 WHERE id = request_id;
$$;
```

---

## Security

- **OpenAI calls are server-side only** — `OPENAI_API_KEY` never reaches the browser
- **RLS is the primary authorization layer** — the server Supabase client forwards the user's JWT cookie so every DB query is scoped to the authenticated user
- **Middleware** (`src/middleware.ts`) refreshes session tokens on every request and redirects unauthenticated users from all dashboard routes; authenticated users are redirected away from auth pages
- **Vote counting** uses an atomic SQL function (`increment_vote_count`) — no race condition
- **Demo endpoint** (`/api/ai/demo-changelog`) is rate-limited to 5 requests / IP / hour with `Retry-After` headers
- **HTTP security headers** set globally: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`

---

## Deployment (Vercel)

1. Push to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel Project Settings ? Environment Variables
4. Deploy — Vercel tracks the `master` branch automatically

Set `NEXT_PUBLIC_APP_URL` to your production domain (e.g. `https://shiplog.app`) for correct OG tag URL resolution.
