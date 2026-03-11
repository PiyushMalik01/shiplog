'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, FolderOpen, CheckCircle2, Circle } from 'lucide-react'
import type { Project } from '@/types'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import StatBar from '@/components/dashboard/StatBar'
import ProjectCard from '@/components/dashboard/ProjectCard'
import ProjectCardSkeleton from '@/components/dashboard/ProjectCardSkeleton'
import ActivityCalendar from '@/components/dashboard/ActivityCalendar'

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('there')
  const [publishedUpdates, setPublishedUpdates] = useState(0)
  const [pendingRequests, setPendingRequests] = useState(0)
  const [lastShipped, setLastShipped] = useState<Record<string, string>>({})

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [
        { data: profile },
        { data: projectsData },
      ] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', user.id).single(),
        supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ])

      const name = profile?.full_name ?? user.email ?? 'there'
      setUserName(name)

      const allProjects = projectsData ?? []
      setProjects(allProjects)

      if (allProjects.length > 0) {
        const ids = allProjects.map((p: Project) => p.id)
        const [
          { count: published },
          { count: pending },
          { data: latestEntries },
        ] = await Promise.all([
          supabase
            .from('changelog_entries')
            .select('*', { count: 'exact', head: true })
            .in('project_id', ids)
            .eq('is_published', true),
          supabase
            .from('feature_requests')
            .select('*', { count: 'exact', head: true })
            .in('project_id', ids)
            .eq('status', 'open'),
          supabase
            .from('changelog_entries')
            .select('project_id, published_at')
            .in('project_id', ids)
            .eq('is_published', true)
            .order('published_at', { ascending: false }),
        ])
        setPublishedUpdates(published ?? 0)
        setPendingRequests(pending ?? 0)
        // Build a map of projectId -> most recent published_at
        const map: Record<string, string> = {}
        for (const e of (latestEntries ?? [])) {
          if (e.project_id && !map[e.project_id]) map[e.project_id] = e.published_at
        }
        setLastShipped(map)
      }

      setLoading(false)
    }

    load()
  }, [])

  const projectIds = projects.map(p => p.id)

  const firstProject = projects[0]
  const showOnboarding = !loading && projects.length > 0 && publishedUpdates === 0

  return (
    <div className="min-h-full p-6 md:p-8">
      <DashboardHeader name={userName} />

      {/* Onboarding checklist — only when setup incomplete */}
      {showOnboarding && (
        <div className="mb-6 rounded-2xl border border-[#bae6fd] dark:border-[#0077b6]/30 bg-gradient-to-r from-[#eff8ff] to-[#f0f9ff] dark:from-[#0a1628] dark:to-[#0d1b2e] p-5">
          <p className="text-[11px] font-bold text-[#0077b6] uppercase tracking-wider mb-2">Get started</p>
          <h3 className="font-bold text-[#03045e] dark:text-white mb-3" style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}>You're almost live — 3 steps to go</h3>
          <div className="space-y-2">
            {[
              { done: true, label: 'Create your first project', href: null },
              {
                done: false,
                label: 'Write and publish your first changelog entry',
                href: firstProject ? `/changelog/new?project=${firstProject.id}` : '/changelog/new',
              },
              {
                done: firstProject?.is_public ?? false,
                label: 'Make your project public so users can submit requests',
                href: firstProject ? `/projects/${firstProject.id}/settings` : '/projects',
              },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                {step.done
                  ? <CheckCircle2 className="w-4 h-4 text-[#16a34a] flex-shrink-0" />
                  : <Circle className="w-4 h-4 text-[#cbd5e1] flex-shrink-0" />
                }
                {step.href && !step.done ? (
                  <Link href={step.href} className="text-sm text-[#0077b6] font-medium hover:underline">{step.label}</Link>
                ) : (
                  <span className={`text-sm ${step.done ? 'line-through text-[#94a3b8]' : 'text-[#334155] dark:text-slate-200 font-medium'}`}>{step.label}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stat bar */}
      <div className="mb-8">
        <StatBar
          publishedUpdates={publishedUpdates}
          pendingRequests={pendingRequests}
          totalProjects={projects.length}
        />
      </div>

      {/* Main content — two-column: projects + sidebar */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left: Projects */}
        <div className="flex-1 min-w-0">
          {/* Projects heading row */}
          <div className="flex items-center justify-between mb-5">
            <h2
              className="text-lg font-bold text-[#03045e] dark:text-white"
              style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
            >
              Your Projects
            </h2>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0077b6] hover:bg-[#023e8a] text-white text-sm font-semibold shadow-sm transition-colors duration-150 no-underline"
            >
              <Plus className="w-4 h-4" />
              New Project
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-6 bg-white dark:bg-[#0d1b2e] rounded-2xl border border-[#e2e8f0] dark:border-white/8 shadow-sm text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#eff8ff] flex items-center justify-center mb-5">
                <FolderOpen className="w-7 h-7 text-[#0077b6]" />
              </div>
              <h3
                className="text-xl font-bold text-[#03045e] dark:text-white mb-2"
                style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
              >
                No projects yet
              </h3>
              <p className="text-[#64748b] dark:text-slate-400 text-sm max-w-xs mb-6">
                Create your first project to start shipping changelogs and collecting feature requests.
              </p>
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0077b6] hover:bg-[#023e8a] text-white text-sm font-semibold shadow-md transition-colors duration-150 no-underline"
              >
                <Plus className="w-4 h-4" />
                Create Your First Project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projects.map(project => (
                <ProjectCard key={project.id} project={project} lastShipped={lastShipped[project.id] ?? null} />
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar: Activity */}
        <div className="w-full xl:w-[300px] flex-shrink-0">
          <ActivityCalendar projectIds={projectIds} />
        </div>
      </div>
    </div>
  )
}
