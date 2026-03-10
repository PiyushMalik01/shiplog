# ShipLog

AI-powered changelog and roadmap management for indie makers and product teams. Paste raw commit messages, get polished user-facing changelogs in seconds. Collect feature requests, cluster them with AI, and manage a prioritized roadmap — all with a beautiful public page per product.

**Built for:** AGIREADY.io Technical Assessment 2026  
**Candidate:** Piyush Malik

---

## Live Demo

> Deploy URL will be listed here after Vercel deployment.

---

## Features

- **AI Changelog Writer** — Paste raw commit messages or developer notes; GPT-4o transforms them into structured, user-facing changelogs categorized as New, Improved, and Fixed.
- **Public Changelog Page** — Every project gets a public SSR page at `/<slug>` with full SEO metadata.
- **Feature Voting** — Visitors submit and upvote feature requests anonymously. Votes are deduplicated by IP + user-agent fingerprint.
- **AI Request Clustering** — One click groups semantically similar feature requests into prioritized roadmap themes using GPT-4o.
- **Kanban Roadmap Board** — Drag-and-drop board with Planned, In Progress, and Done columns. Position and status persist to the database on every drop.
- **AI Priority Suggestion** — AI analyzes roadmap items by vote totals and descriptions and reorders them by strategic priority.
- **Project Workspaces** — Multiple projects per account, each with a unique slug, public toggle, and independent changelog history.
- **Authentication** — Email/password auth via Supabase with RLS-enforced data isolation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Database + Auth | Supabase (PostgreSQL + RLS) |
| AI | OpenAI GPT-4o (server-side only) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Drag and Drop | @hello-pangea/dnd |
| Toasts | react-hot-toast |
| Deployment | Vercel |

---

## Project Structure

```
src/
  app/
    (auth)/login         # Login page
    (auth)/signup        # Signup page
    (dashboard)/         # Auth-guarded dashboard layout
      dashboard/         # Overview
      projects/          # Project list and creation
      changelog/         # Changelog list and AI writer
      roadmap/           # Kanban board
      requests/          # Feature request inbox
      settings/          # Account settings
    [slug]/              # Public changelog + voting page (SSR)
    api/                 # API routes (changelogs, projects, roadmap, feature-requests, AI)
  components/
    dashboard/           # Sidebar, nav, stat components
    changelog/           # ChangelogCard
    public/              # PublicHeader, FeatureRequestForm, VoteButton
    ui/                  # Shared UI primitives
  lib/
    supabase/            # Browser and server Supabase clients
    openai.ts            # Singleton OpenAI client
    prompts.ts           # All AI system + user prompts
  types/index.ts         # TypeScript interfaces for all entities
  middleware.ts          # Auth route protection (Supabase SSR)
```

---

## Local Development

### Prerequisites

- Node.js 18+
- A Supabase project (https://supabase.com)
- An OpenAI API key with GPT-4o access

### Setup

1. Clone the repository

   ```bash
   git clone <repo-url>
   cd shiplog
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Configure environment variables

   Create a `.env.local` file in the project root:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   OPENAI_API_KEY=sk-...
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Initialize the database

   Open the Supabase SQL editor and run the full contents of `schema.sql`. This creates all tables, RLS policies, and the profile auto-creation trigger.

5. Start the development server

   ```bash
   npm run dev
   ```

   Open http://localhost:3000

---

## Database Schema

All tables are defined in `schema.sql`:

| Table | Purpose |
|---|---|
| `profiles` | Auto-created on signup via trigger |
| `projects` | User-owned product workspaces with unique slugs |
| `changelog_entries` | Versioned changelog entries with structured JSON content |
| `roadmap_items` | AI-clustered roadmap themes with priority and position |
| `feature_requests` | User-submitted requests linked to roadmap clusters |
| `votes` | Anonymous votes with deduplication via unique constraint |
| `comments` | Public comments on feature requests |

Row Level Security is enabled on every table. Users can only read and modify their own projects and related data.

---

## Architecture Notes

- **OpenAI calls are server-side only.** The `OPENAI_API_KEY` is never exposed to the browser. All AI logic lives inside `app/api/ai/` route handlers.
- **All AI routes use `response_format: { type: "json_object" }`** to guarantee structured outputs and prevent broken JSON responses.
- **The public `[slug]` page is a Server Component** with `generateMetadata` for per-project SEO.
- **Supabase SSR (`@supabase/ssr`)** is used instead of the deprecated `auth-helpers-nextjs`. The middleware at `src/middleware.ts` refreshes session cookies on every request and protects all dashboard routes.
- **Vote deduplication** uses a SHA-256 hash of `IP + User-Agent` as a fingerprint, enforced by a unique constraint at the database level.

---

## Deployment

The application is configured for one-click deployment to Vercel.

1. Push the repository to GitHub.
2. Import the project in the Vercel dashboard (https://vercel.com/new).
3. Add the four environment variables listed above under Project Settings > Environment Variables.
4. Deploy. Vercel will detect Next.js automatically.

---

## Security

- `.env.local` is excluded from version control via `.gitignore`.
- RLS policies ensure strict data isolation between users.
- No service role key is used in client-side code.
- All user input passed to OpenAI is sent as user-role messages, separated from system prompts.
