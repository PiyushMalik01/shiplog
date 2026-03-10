# ShipLog Dashboard — Full UI Refactor Prompt

> This refactors the existing plain dashboard into a high-productivity workspace.
> Run AFTER the global design system (GLOBAL_DESIGN_SYSTEM.md) is already set up.
> This touches: layout.tsx (dashboard), sidebar, dashboard page, project cards,
> stat cards, and skeleton loaders.

---

## THE PROMPT (copy everything below this line)

---

You are a Senior Frontend Engineer refactoring the ShipLog dashboard. The current dashboard is plain and underdeveloped — a basic sidebar with an unstyled card. Your job is to transform it into a **high-productivity workspace** that feels like a premium tool founders actually want to open every day.

Reference aesthetic: Linear's sidebar precision + Vercel's dashboard clarity + a touch of Notion's calm. Every pixel should feel intentional.

**Do not change any backend logic, API routes, or Supabase queries.** Only touch files inside `app/(dashboard)/` and `components/dashboard/`.

---

## Design Language (inherits from global design system)

```
Background:       #f0f9ff   (slightly cooler than page bg — feels like a workspace)
Sidebar bg:       bg-white/70 backdrop-blur-md  (glassmorphism)
Sidebar border:   border-r border-[#caf0f8]
Sidebar width:    260px desktop, hidden on mobile
Primary text:     #03045e
Secondary text:   #64748b
Primary action:   #0077b6
Accent:           #00b4d8
Card bg:          white with border border-[#e0f4fb]
Card hover:       translateY(-3px) + shadow-lg
Stat card bg:     gradient from pale cyan to white
```

**Fonts:** Keep using `font-heading` (Syne) for page titles and `font-sans` (DM Sans) for body — already set up in globals.

---

## Files to Create / Modify

```
app/(dashboard)/
├── layout.tsx                      ← MODIFY: add sidebar + mobile hamburger
└── dashboard/
    └── page.tsx                    ← MODIFY: full dashboard page

components/dashboard/
├── Sidebar.tsx                     ← CREATE: glassmorphism sidebar
├── MobileNav.tsx                   ← CREATE: hamburger + slide-out drawer
├── StatBar.tsx                     ← CREATE: 3 metric cards
├── ProjectCard.tsx                 ← CREATE: new card design
├── ProjectCardSkeleton.tsx         ← CREATE: shimmer skeleton
└── DashboardHeader.tsx             ← CREATE: page header with greeting
```

---

## 1. Dashboard Layout — `app/(dashboard)/layout.tsx`

```tsx
'use client'
import { useState } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import MobileNav from '@/components/dashboard/MobileNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f0f9ff' }}>

      {/* Desktop Sidebar — visible lg+ */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Drawer */}
      <MobileNav open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile Top Bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3
                        bg-white/70 backdrop-blur-md border-b border-[#caf0f8]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-[#caf0f8] transition-colors"
            aria-label="Open menu"
          >
            {/* Hamburger icon — use lucide Menu */}
            <MenuIcon className="w-5 h-5 text-[#03045e]" />
          </button>
          <span className="font-heading font-bold text-[#03045e] text-lg">🚢 ShipLog</span>
          <div className="w-9" /> {/* spacer */}
        </div>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
```

---

## 2. Sidebar — `components/dashboard/Sidebar.tsx`

**Visual spec:**
- Width: `w-[260px]` fixed
- Background: `bg-white/70 backdrop-blur-md`
- Right border: `border-r border-[#caf0f8]`
- Full height: `h-screen`
- Logo at top, nav links in middle, user profile at bottom

```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'
import {
  LayoutDashboard, FolderOpen, ScrollText,
  MessageSquare, Map, Settings, LogOut, ExternalLink
} from 'lucide-react'

const navItems = [
  { label: 'Overview',  href: '/dashboard',          icon: LayoutDashboard },
  { label: 'Projects',  href: '/dashboard/projects',  icon: FolderOpen },
  { label: 'Changelog', href: '/dashboard/changelog', icon: ScrollText },
  { label: 'Requests',  href: '/dashboard/requests',  icon: MessageSquare },
  { label: 'Roadmap',   href: '/dashboard/roadmap',   icon: Map },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-[260px] h-screen flex flex-col
                    bg-white/70 backdrop-blur-md
                    border-r border-[#caf0f8]">

      {/* ── Logo ── */}
      <div className="px-5 py-5 border-b border-[#caf0f8]">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0077b6] to-[#00b4d8]
                          flex items-center justify-center shadow-md
                          group-hover:shadow-glow transition-all duration-200">
            <span className="text-lg">🚢</span>
          </div>
          <div>
            <p className="font-heading font-bold text-[#03045e] text-base leading-none">ShipLog</p>
            <p className="font-sans text-[11px] text-[#64748b] mt-0.5">Workspace</p>
          </div>
        </Link>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[11px] font-semibold text-[#64748b] uppercase tracking-widest">
          Main
        </p>
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-[#0077b6] text-white shadow-md shadow-[#0077b6]/20'
                  : 'text-[#475569] hover:bg-[#caf0f8] hover:text-[#03045e]'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {/* Active indicator dot */}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
              )}
            </Link>
          )
        })}

        {/* Divider */}
        <div className="pt-4 mt-2 border-t border-[#caf0f8]">
          <p className="px-3 mb-2 text-[11px] font-semibold text-[#64748b] uppercase tracking-widest">
            Quick Links
          </p>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                       font-medium text-[#475569] hover:bg-[#caf0f8] hover:text-[#03045e]
                       transition-all duration-150"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </div>
      </nav>

      {/* ── User Profile Footer ── */}
      <div className="px-3 pb-4 border-t border-[#caf0f8] pt-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                        hover:bg-[#caf0f8] transition-all cursor-pointer group">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0077b6] to-[#00b4d8]
                          flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">PM</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#03045e] truncate">Piyush Malik</p>
            <p className="text-[11px] text-[#64748b] truncate">piyushmalik987@gmail.com</p>
          </div>
          <LogOut className="w-4 h-4 text-[#64748b] opacity-0 group-hover:opacity-100
                             transition-opacity flex-shrink-0" />
        </div>
      </div>
    </div>
  )
}
```

---

## 3. Mobile Nav Drawer — `components/dashboard/MobileNav.tsx`

Slide-in from left with backdrop overlay. Reuses `<Sidebar />` inside the drawer.

```tsx
'use client'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import { X } from 'lucide-react'

export default function MobileNav({
  open, onClose
}: { open: boolean; onClose: () => void }) {

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-[#03045e]/40 backdrop-blur-sm z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed inset-y-0 left-0 z-50 lg:hidden"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          >
            <div className="relative h-full">
              <Sidebar />
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-[-44px] w-9 h-9 rounded-full
                           bg-white flex items-center justify-center shadow-lg"
              >
                <X className="w-4 h-4 text-[#03045e]" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

---

## 4. Stat Bar — `components/dashboard/StatBar.tsx`

Three metric cards in a horizontal row. Fetch real counts from Supabase or accept as props.

**Visual spec per card:**
- Background: gradient from `#f0f9ff` to `white`
- Left accent bar: 3px wide, colored per metric
- Large number in `font-heading` bold
- Icon top-right in a soft rounded square

```tsx
import { TrendingUp, Clock, Zap } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  sub: string
  icon: React.ReactNode
  accentColor: string
}

function StatCard({ label, value, sub, icon, accentColor }: StatCardProps) {
  return (
    <div
      className="flex-1 min-w-0 bg-white rounded-2xl border border-[#e0f4fb]
                 shadow-sm hover:shadow-md transition-all duration-200
                 hover:-translate-y-0.5 p-5 relative overflow-hidden"
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full"
        style={{ backgroundColor: accentColor }}
      />

      {/* Icon */}
      <div
        className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: accentColor + '18' }}
      >
        <div style={{ color: accentColor }}>{icon}</div>
      </div>

      {/* Content */}
      <div className="pl-3">
        <p className="text-[12px] font-semibold text-[#64748b] uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="font-heading text-3xl font-bold text-[#03045e] leading-none mb-1">
          {value}
        </p>
        <p className="text-[12px] text-[#64748b]">{sub}</p>
      </div>
    </div>
  )
}

export default function StatBar({
  publishedUpdates = 0,
  pendingRequests = 0,
  totalProjects = 0,
}: {
  publishedUpdates?: number
  pendingRequests?: number
  totalProjects?: number
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <StatCard
        label="Published Updates"
        value={publishedUpdates}
        sub="changelog entries live"
        icon={<Zap className="w-4 h-4" />}
        accentColor="#0077b6"
      />
      <StatCard
        label="Pending Requests"
        value={pendingRequests}
        sub="awaiting your review"
        icon={<Clock className="w-4 h-4" />}
        accentColor="#f59e0b"
      />
      <StatCard
        label="Total Projects"
        value={totalProjects}
        sub="active workspaces"
        icon={<TrendingUp className="w-4 h-4" />}
        accentColor="#22c55e"
      />
    </div>
  )
}
```

---

## 5. Project Card — `components/dashboard/ProjectCard.tsx`

**Visual spec:**
- White background, `rounded-2xl`, `border border-[#e0f4fb]`
- Subtle top gradient strip in brand color (like a color coding tab)
- Settings cog top-right
- Project initial avatar top-left (large, colored)
- Project name bold in `#03045e`, slug in muted
- Description truncated to 2 lines
- Button group at bottom: "Write Update", "Roadmap", "Copy Link"
- Hover: `translateY(-3px)` + `shadow-lg`

```tsx
'use client'
import Link from 'next/link'
import { Settings, ExternalLink, PenLine, Map, Link2, Check } from 'lucide-react'
import { useState } from 'react'
import type { Project } from '@/types'

// Generate a consistent color per project based on name
function projectColor(name: string) {
  const colors = ['#0077b6', '#00b4d8', '#0096c7', '#023e8a', '#0077b6']
  const i = name.charCodeAt(0) % colors.length
  return colors[i]
}

export default function ProjectCard({ project }: { project: Project }) {
  const [copied, setCopied] = useState(false)
  const color = projectColor(project.name)
  const initial = project.name.charAt(0).toUpperCase()

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/${project.slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="group bg-white rounded-2xl border border-[#e0f4fb]
                 shadow-sm hover:shadow-lg hover:-translate-y-[3px]
                 transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Color tab strip */}
      <div className="h-1.5 w-full" style={{ backgroundColor: color }} />

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col">

        {/* Top row: Avatar + Settings */}
        <div className="flex items-start justify-between mb-4">
          {/* Project Avatar */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center
                       font-heading font-bold text-white text-lg shadow-sm"
            style={{ backgroundColor: color }}
          >
            {initial}
          </div>

          {/* Settings + Public page */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100
                          transition-opacity duration-150">
            <Link
              href={`/${project.slug}`}
              target="_blank"
              className="p-1.5 rounded-lg hover:bg-[#caf0f8] text-[#64748b]
                         hover:text-[#0077b6] transition-colors"
              title="View public page"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              href={`/dashboard/projects/${project.id}/settings`}
              className="p-1.5 rounded-lg hover:bg-[#caf0f8] text-[#64748b]
                         hover:text-[#0077b6] transition-colors"
              title="Project settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Project Info */}
        <div className="flex-1 mb-4">
          <h3 className="font-heading font-bold text-[#03045e] text-lg leading-tight mb-1">
            {project.name}
          </h3>
          <p className="text-[12px] font-mono text-[#0077b6] mb-2">
            /{project.slug}
          </p>
          {project.description && (
            <p className="text-sm text-[#64748b] line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}
        </div>

        {/* Button Group */}
        <div className="flex gap-2 pt-4 border-t border-[#f0f9ff]">
          <Link
            href={`/dashboard/changelog/new?project=${project.id}`}
            className="flex-1 flex items-center justify-center gap-1.5
                       text-[12px] font-semibold text-white bg-[#0077b6]
                       hover:bg-[#00b4d8] hover:text-[#03045e]
                       py-2 rounded-xl transition-all duration-150
                       shadow-sm hover:shadow-md"
          >
            <PenLine className="w-3 h-3" />
            Write Update
          </Link>

          <Link
            href={`/dashboard/roadmap?project=${project.id}`}
            className="flex items-center justify-center gap-1.5
                       text-[12px] font-semibold text-[#0077b6]
                       border border-[#caf0f8] hover:bg-[#caf0f8]
                       px-3 py-2 rounded-xl transition-all duration-150"
            title="View Roadmap"
          >
            <Map className="w-3 h-3" />
          </Link>

          <button
            onClick={copyLink}
            className="flex items-center justify-center gap-1.5
                       text-[12px] font-semibold text-[#0077b6]
                       border border-[#caf0f8] hover:bg-[#caf0f8]
                       px-3 py-2 rounded-xl transition-all duration-150"
            title="Copy public link"
          >
            {copied
              ? <Check className="w-3 h-3 text-green-500" />
              : <Link2 className="w-3 h-3" />
            }
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## 6. Skeleton Loader — `components/dashboard/ProjectCardSkeleton.tsx`

Pure CSS shimmer animation. Shows while projects are loading from Supabase.

```tsx
export default function ProjectCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#e0f4fb] overflow-hidden">
      {/* Color tab */}
      <div className="h-1.5 w-full skeleton-shimmer" />

      <div className="p-5">
        {/* Avatar row */}
        <div className="flex justify-between mb-4">
          <div className="w-11 h-11 rounded-xl skeleton-shimmer" />
          <div className="w-6 h-6 rounded-lg skeleton-shimmer" />
        </div>

        {/* Title */}
        <div className="h-5 w-3/4 rounded-lg skeleton-shimmer mb-2" />
        {/* Slug */}
        <div className="h-3 w-1/3 rounded-lg skeleton-shimmer mb-3" />
        {/* Description lines */}
        <div className="h-3 w-full rounded-lg skeleton-shimmer mb-1.5" />
        <div className="h-3 w-2/3 rounded-lg skeleton-shimmer mb-5" />

        {/* Button group */}
        <div className="pt-4 border-t border-[#f0f9ff] flex gap-2">
          <div className="flex-1 h-9 rounded-xl skeleton-shimmer" />
          <div className="w-10 h-9 rounded-xl skeleton-shimmer" />
          <div className="w-10 h-9 rounded-xl skeleton-shimmer" />
        </div>
      </div>
    </div>
  )
}
```

Add this to `globals.css` inside `@layer components`:

```css
/* Shimmer skeleton animation */
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    #e0f4fb 25%,
    #caf0f8 50%,
    #e0f4fb 75%
  );
  background-size: 200% 100%;
  animation: shimmerSkeleton 1.5s ease-in-out infinite;
}

@keyframes shimmerSkeleton {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 7. Dashboard Page — `app/(dashboard)/dashboard/page.tsx`

Full page assembly. Fetches real data from Supabase.

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Suspense } from 'react'
import StatBar from '@/components/dashboard/StatBar'
import ProjectCard from '@/components/dashboard/ProjectCard'
import ProjectCardSkeleton from '@/components/dashboard/ProjectCardSkeleton'
import DashboardHeader from '@/components/dashboard/DashboardHeader'

async function ProjectsGrid() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch counts for stat bar
  const projectIds = projects?.map(p => p.id) ?? []

  const [{ count: publishedCount }, { count: requestCount }] = await Promise.all([
    supabase.from('changelog_entries')
      .select('*', { count: 'exact', head: true })
      .in('project_id', projectIds)
      .eq('is_published', true),
    supabase.from('feature_requests')
      .select('*', { count: 'exact', head: true })
      .in('project_id', projectIds)
      .eq('status', 'open'),
  ])

  if (!projects?.length) {
    return <EmptyState />
  }

  return (
    <>
      {/* Stat Bar */}
      <StatBar
        publishedUpdates={publishedCount ?? 0}
        pendingRequests={requestCount ?? 0}
        totalProjects={projects.length}
      />

      {/* Section header */}
      <div className="flex items-center justify-between mt-8 mb-4">
        <div>
          <h2 className="font-heading font-bold text-[#03045e] text-xl">
            Your Projects
          </h2>
          <p className="text-sm text-[#64748b] mt-0.5">
            {projects.length} workspace{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#0077b6] text-white
                     rounded-xl text-sm font-semibold hover:bg-[#00b4d8] hover:text-[#03045e]
                     transition-all duration-150 shadow-sm hover:shadow-glow"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
           style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-3xl bg-[#caf0f8] flex items-center
                      justify-center text-4xl mb-6 shadow-inner">
        🚢
      </div>
      <h3 className="font-heading font-bold text-[#03045e] text-2xl mb-2">
        No projects yet
      </h3>
      <p className="text-[#64748b] max-w-sm mb-8 leading-relaxed">
        Create your first project to start generating AI-powered changelogs
        and collecting feature requests from your users.
      </p>
      <Link
        href="/dashboard/projects/new"
        className="flex items-center gap-2 px-6 py-3 bg-[#0077b6] text-white
                   rounded-xl font-semibold hover:bg-[#00b4d8] hover:text-[#03045e]
                   transition-all duration-150 shadow-md hover:shadow-glow"
      >
        <Plus className="w-4 h-4" />
        Create Your First Project
      </Link>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  return (
    <div className="px-6 md:px-8 py-8 max-w-[1400px] mx-auto">

      {/* Page Header */}
      <DashboardHeader
        name={profile?.full_name ?? 'Founder'}
        email={user.email ?? ''}
      />

      {/* Content with Suspense for loading state */}
      <Suspense fallback={<SkeletonFallback />}>
        <ProjectsGrid />
      </Suspense>
    </div>
  )
}

function SkeletonFallback() {
  return (
    <>
      {/* Stat bar skeletons */}
      <div className="flex gap-4 mb-8">
        {[1,2,3].map(i => (
          <div key={i} className="flex-1 h-24 rounded-2xl skeleton-shimmer" />
        ))}
      </div>
      {/* Card skeletons */}
      <div className="grid gap-4"
           style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {[1,2,3].map(i => <ProjectCardSkeleton key={i} />)}
      </div>
    </>
  )
}
```

---

## 8. Dashboard Header — `components/dashboard/DashboardHeader.tsx`

Time-aware greeting + breadcrumb-style header.

```tsx
'use client'
import { useEffect, useState } from 'react'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardHeader({
  name, email
}: { name: string; email: string }) {
  const [greeting, setGreeting] = useState('Welcome back')

  useEffect(() => {
    setGreeting(getGreeting())
  }, [])

  const firstName = name.split(' ')[0]

  return (
    <div className="mb-8">
      {/* Breadcrumb */}
      <p className="text-[12px] font-semibold text-[#64748b] uppercase
                    tracking-widest mb-2">
        Dashboard / Overview
      </p>

      {/* Greeting */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-[#03045e] text-3xl md:text-4xl
                         leading-tight">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-[#64748b] mt-1 text-sm">
            Here&apos;s what&apos;s happening across your projects today.
          </p>
        </div>

        {/* Date badge */}
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white
                        rounded-xl border border-[#e0f4fb] shadow-sm flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-[12px] font-semibold text-[#64748b]">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric'
            })}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-6 h-px bg-gradient-to-r from-[#caf0f8] via-[#90e0ef] to-transparent" />
    </div>
  )
}
```

---

## Responsiveness Summary

| Breakpoint | Sidebar | Grid | Stat Bar |
|---|---|---|---|
| `< 640px` (mobile) | Hidden, hamburger in top bar | 1 column | Stack vertical |
| `640–1024px` (tablet) | Hidden, hamburger in top bar | 2 columns | 3 columns |
| `> 1024px` (desktop) | Fixed 260px visible | Auto-fill 300px | 3 columns |

---

## Definition of Done

- [ ] Sidebar visible on desktop (`lg+`), hidden on mobile with hamburger
- [ ] Mobile drawer slides in from left with backdrop
- [ ] Active nav item highlighted in `#0077b6` with white text
- [ ] 3 stat cards show real counts from Supabase
- [ ] Project cards show color tab, avatar initial, name, slug, description
- [ ] "Write Update" button links to `/dashboard/changelog/new?project=ID`
- [ ] "Copy Link" copies public URL and shows a ✓ check for 2 seconds
- [ ] Settings + ExternalLink icons appear on card hover only
- [ ] Shimmer skeleton shows while Suspense is loading
- [ ] Empty state shows when user has no projects
- [ ] Greeting is time-aware (morning/afternoon/evening)
- [ ] All hover transitions are smooth (`duration-200`)
- [ ] `npm run build` passes with zero TypeScript errors

---

*ShipLog Dashboard Refactor — AGIREADY.io Technical Assessment 2026 — Piyush Malik*