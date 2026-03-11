'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, FolderOpen, ExternalLink, ScrollText, GitBranch, Map } from 'lucide-react'
import type { Project } from '@/types'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setProjects(data ?? [])
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-full p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1
            className="text-[26px] font-bold text-[#03045e] dark:text-white leading-tight"
            style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
          >
            Projects
          </h1>
          <p className="text-[#64748b] dark:text-slate-400 text-sm mt-1">Manage your products and their public pages.</p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0077b6] hover:bg-[#023e8a] text-white text-sm font-semibold shadow-sm transition-colors no-underline"
        >
          <Plus className="w-4 h-4" /> New Project
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[88px] rounded-2xl bg-white dark:bg-[#0d1b2e] border border-[#e2e8f0] dark:border-white/8 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 bg-white dark:bg-[#0d1b2e] rounded-2xl border border-dashed border-[#e2e8f0] dark:border-white/10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#e0f7ff] flex items-center justify-center mb-4">
            <FolderOpen className="w-6 h-6 text-[#0077b6]" />
          </div>
          <h2
            className="text-[17px] font-bold text-[#03045e] dark:text-white mb-1"
            style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
          >
            No projects yet
          </h2>
          <p className="text-[#64748b] dark:text-slate-400 text-sm max-w-xs mb-6">
            Create your first project to start shipping changelogs and collecting feature requests.
          </p>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0077b6] hover:bg-[#023e8a] text-white text-sm font-semibold shadow-md transition-colors no-underline"
          >
            <Plus className="w-4 h-4" /> Create Your First Project
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(project => (
            <div
              key={project.id}
              className="group bg-white dark:bg-[#0d1b2e] rounded-2xl border border-[#e2e8f0] dark:border-white/8 px-4 sm:px-5 py-4 hover:shadow-md transition-shadow duration-150"
            >
              {/* Top row: icon + name + badges */}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#eff8ff] flex items-center justify-center flex-shrink-0">
                  <FolderOpen className="w-5 h-5 text-[#0077b6]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3
                    className="font-bold text-[15px] text-[#03045e] dark:text-white truncate"
                    style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
                  >
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[12px] text-[#64748b] dark:text-slate-400 font-mono truncate">/{project.slug}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0 ${
                      project.is_public
                        ? 'bg-[#dcfce7] text-[#16a34a]'
                        : 'bg-[#f1f5f9] dark:bg-white/8 text-[#64748b] dark:text-slate-400'
                    }`}>
                      {project.is_public ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons — wrap on small screens */}
              <div className="flex flex-wrap items-center gap-1 mt-3 ml-0 sm:ml-14">
                <Link
                  href={`/changelog?project_id=${project.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#475569] dark:text-slate-400 hover:bg-[#f1f5f9] dark:hover:bg-white/8 transition-colors no-underline"
                >
                  <ScrollText className="w-3.5 h-3.5" /> Changelog
                </Link>
                <Link
                  href={`/requests?project_id=${project.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#475569] dark:text-slate-400 hover:bg-[#f1f5f9] dark:hover:bg-white/8 transition-colors no-underline"
                >
                  <GitBranch className="w-3.5 h-3.5" /> Requests
                </Link>
                <Link
                  href={`/roadmap?project_id=${project.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#475569] dark:text-slate-400 hover:bg-[#f1f5f9] dark:hover:bg-white/8 transition-colors no-underline"
                >
                  <Map className="w-3.5 h-3.5" /> Roadmap
                </Link>
                {project.is_public && (
                  <Link
                    href={`/${project.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#0077b6] hover:bg-[#eff8ff] transition-colors no-underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Public
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
