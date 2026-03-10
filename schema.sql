-- Enable UUID extension
create extension if not exists "pgcrypto";

-- PROFILES (auto-created on signup via trigger)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- PROJECTS
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  is_public boolean default true,
  created_at timestamptz default now()
);

-- CHANGELOG ENTRIES
create table changelog_entries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  version text,
  title text not null,
  raw_input text,
  content jsonb not null default '{"new":[],"improved":[],"fixed":[]}',
  is_published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now()
);

-- ROADMAP ITEMS
create table roadmap_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  description text,
  status text default 'planned' check (status in ('planned','in_progress','done')),
  ai_summary text,
  priority int default 0,
  vote_total int default 0,
  position int default 0,
  created_at timestamptz default now()
);

-- FEATURE REQUESTS
create table feature_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  description text,
  vote_count int default 0,
  status text default 'open' check (status in ('open','planned','in_progress','done')),
  cluster_id uuid references roadmap_items(id) on delete set null,
  submitter_email text,
  created_at timestamptz default now()
);

-- VOTES
create table votes (
  id uuid primary key default gen_random_uuid(),
  feature_request_id uuid not null references feature_requests(id) on delete cascade,
  voter_fingerprint text not null,
  created_at timestamptz default now(),
  unique(feature_request_id, voter_fingerprint)
);

-- COMMENTS
create table comments (
  id uuid primary key default gen_random_uuid(),
  feature_request_id uuid not null references feature_requests(id) on delete cascade,
  author_name text,
  body text not null,
  created_at timestamptz default now()
);

-- TRIGGER: auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ROW LEVEL SECURITY
alter table profiles enable row level security;
alter table projects enable row level security;
alter table changelog_entries enable row level security;
alter table roadmap_items enable row level security;
alter table feature_requests enable row level security;
alter table votes enable row level security;
alter table comments enable row level security;

-- Profiles
create policy "users can view own profile" on profiles for select using (auth.uid() = id);
create policy "users can update own profile" on profiles for update using (auth.uid() = id);

-- Projects
create policy "owners can do everything" on projects for all using (user_id = auth.uid());
create policy "public projects are readable" on projects for select using (is_public = true);

-- Changelog entries
create policy "owners can manage changelogs" on changelog_entries for all
  using (project_id in (select id from projects where user_id = auth.uid()));
create policy "published entries are public" on changelog_entries for select
  using (is_published = true);

-- Roadmap items
create policy "owners can manage roadmap" on roadmap_items for all
  using (project_id in (select id from projects where user_id = auth.uid()));
create policy "roadmap is public" on roadmap_items for select using (true);

-- Feature requests
create policy "owners can manage requests" on feature_requests for all
  using (project_id in (select id from projects where user_id = auth.uid()));
create policy "anyone can submit requests" on feature_requests for insert with check (true);
create policy "requests are public" on feature_requests for select using (true);

-- Votes (fully public — dedup handled by unique constraint)
create policy "anyone can vote" on votes for insert with check (true);
create policy "votes are public" on votes for select using (true);

-- Comments
create policy "anyone can comment" on comments for insert with check (true);
create policy "comments are public" on comments for select using (true);
