# ShipLog

AI-powered changelog and roadmap management for indie makers and product teams. Paste raw commit messages, get polished user-facing changelogs in seconds. Collect feature requests, cluster them with AI, and manage a prioritized roadmap — all with a beautiful public page per product.

**Built for:** AGIREADY.io Technical Assessment 2026  
**Candidate:** Piyush Malik

---

## Live Demo

> Deploy URL will be listed here after Vercel deployment.

---

## Features

### Core Features

- **AI Changelog Writer** — Paste raw commit messages or developer notes; GPT-4o transforms them into structured, user-facing changelogs categorized as New, Improved, and Fixed.
- **Public Changelog Page** — Every project gets a public SSR page at `/<slug>` with full SEO metadata, changelog timeline, and feature request submission.
- **Feature Voting** — Visitors submit and upvote feature requests anonymously. Votes are deduplicated by IP + user-agent fingerprint.
- **AI Request Clustering** — One click groups semantically similar feature requests into prioritized roadmap themes using GPT-4o.
- **Kanban Roadmap Board** — Drag-and-drop board with Planned, In Progress, and Done columns. Position and status persist to the database on every drop.
- **AI Priority Suggestion** — AI analyzes roadmap items by vote totals and descriptions and reorders them by strategic priority.
- **Project Workspaces** — Multiple projects per account, each with a unique slug, public toggle, and independent changelog history.
- **Authentication** — Email/password auth via Supabase with RLS-enforced data isolation.

### Bonus Features

- **AI Weekly Update Email Draft** — Generate a polished, ready-to-send product update email from the last 5 published changelog entries. GPT-4o writes the subject line and body in plain text. Copy to clipboard in one click or regenerate. Accessible from the Changelog dashboard via the "Weekly Update" button.
- **Embeddable Changelog Widget** — Every project has a minimal `/widget/<slug>` page designed for use inside an `<iframe>`. Renders published entries in a timeline layout with New / Improved / Fixed category pills and no dashboard chrome. The project Settings page shows the ready-to-paste `<iframe>` snippet with a one-click copy button.

### Moderation and Admin Controls

- **Public comment threads on feature requests** — Any visitor can expand a feature request on the public page and participate in the discussion. Comments are named or anonymous.
- **Admin replies with team badge** — When the project owner replies from the dashboard, the comment is automatically tagged as admin. On the public page it displays a "Team" badge and a distinct navy avatar, making the conversation clearly two-sided.
- **Delete comments** — Admins can delete any comment (their own or user-submitted) from the requests dashboard. The delete button appears on hover.
- **Delete feature requests** — Each request row in the dashboard has a delete button with a two-step inline confirmation to prevent accidental removal.
- **Inline status changes** — A colour-coded dropdown on every feature request row lets admins change status (Open / Planned / In Progress / Done) without opening a separate page.
- **Delete roadmap items** — Each roadmap card has a delete button that appears on hover with a confirm/cancel step before removal.

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
      dashboard/         # Overview with stats
      projects/          # Project list and creation
      changelog/         # Changelog list, AI writer, email draft generator
      roadmap/           # Kanban board with drag-drop + AI priority + delete
      requests/          # Feature request inbox with admin replies + moderation
      settings/          # Account settings
    [slug]/              # Public changelog + voting + comment threads (SSR)
    widget/[slug]/       # Embeddable changelog iframe widget (SSR, no chrome)
    api/
      changelogs/        # CRUD for changelog entries
      projects/          # CRUD for projects
      roadmap/           # CRUD for roadmap items (includes DELETE)
      feature-requests/  # CRUD + status update + delete for requests
        [id]/comment     # Comment thread (GET, POST, DELETE)
        [id]/vote        # Anonymous voting
      ai/
        generate-changelog   # GPT-4o: raw notes → structured changelog
        generate-email       # GPT-4o: published entries → email draft
        cluster-requests     # GPT-4o: cluster feature requests by theme
        roadmap-priority     # GPT-4o: reorder roadmap items by priority
  components/
    dashboard/           # Sidebar, nav, stat components
    changelog/           # ChangelogCard
    public/              # PublicHeader, FeatureRequestForm, VoteButton, PublicRequestItem
    ui/                  # Shared UI primitives
  lib/
    supabase/            # Browser and server Supabase clients
    openai.ts            # Singleton OpenAI client
    prompts.ts           # All AI system + user prompts (changelog, cluster, priority, email)
  types/index.ts         # TypeScript interfaces for all entities
  proxy.ts               # Auth route protection middleware (Next.js 16 convention)
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
| `comments` | Threaded comments on feature requests; `is_admin` flag distinguishes team replies |

Row Level Security is enabled on every table. Users can only read and modify their own projects and related data. Owners can delete comments on their own project's feature requests.

---

## Architecture Notes

- **OpenAI calls are server-side only.** The `OPENAI_API_KEY` is never exposed to the browser. All AI logic lives inside `app/api/ai/` route handlers.
- **All AI routes use `response_format: { type: "json_object" }`** to guarantee structured outputs and prevent broken JSON responses.
- **The public `[slug]` page is a Server Component** with `generateMetadata` for per-project SEO. Feature request cards are client-interactive (voting, comment threads) via embedded client components.
- **The `/widget/[slug]` page is a minimal SSR Server Component** with no dashboard layout, designed to be embedded as an `<iframe>` on external websites.
- **Supabase SSR (`@supabase/ssr`)** is used instead of the deprecated `auth-helpers-nextjs`. The middleware at `src/proxy.ts` (Next.js 16 convention) refreshes session cookies on every request and protects all dashboard routes.
- **Vote deduplication** uses a SHA-256 hash of `IP + User-Agent` as a fingerprint, enforced by a unique constraint at the database level.
- **Admin comment detection** is automatic: when a POST to `/api/feature-requests/[id]/comment` is made by an authenticated session (dashboard), `is_admin` is set to `true`. Public visitors are always unauthenticated.

---

## Database Migration (Existing Installations)

If you are upgrading an existing database, run the following in the Supabase SQL editor:

```sql
-- Add admin flag to comments
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Allow owners to delete comments on their projects' requests
CREATE POLICY "owners can delete comments" ON comments FOR DELETE
  USING (
    feature_request_id IN (
      SELECT fr.id FROM feature_requests fr
      JOIN projects p ON fr.project_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );
```

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
