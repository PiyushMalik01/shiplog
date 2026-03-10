'use client'

import Link from 'next/link'
import { Settings, ExternalLink, PenLine, Map, Link2, Check, Globe, Lock } from 'lucide-react'
import { useState } from 'react'
import type { Project } from '@/types'

export default function ProjectCard({ project }: { project: Project }) {
  const [copied, setCopied] = useState(false)

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/${project.slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const created = new Date(project.created_at).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="group bg-white rounded-2xl border border-[#e2e8f0] hover:border-[#caf0f8] shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col">
      <div className="p-5 flex-1 flex flex-col">
        {/* Top row: name + settings gear */}
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3
            className="font-bold text-[#03045e] text-[16px] leading-snug truncate"
            style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
          >
            {project.name}
          </h3>
          <Link
            href={`/projects/${project.id}/settings`}
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[#94a3b8] hover:text-[#0077b6] hover:bg-[#f0f9ff] transition-colors"
            title="Project settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Slug + visibility badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-mono text-[#0077b6]">/{project.slug}</span>
          <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md ${
            project.is_public
              ? 'bg-[#dcfce7] text-[#16a34a]'
              : 'bg-[#f1f5f9] text-[#94a3b8]'
          }`}>
            {project.is_public ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
            {project.is_public ? 'Public' : 'Private'}
          </span>
        </div>

        {/* Description */}
        <div className="flex-1 mb-4">
          {project.description ? (
            <p className="text-[13px] text-[#64748b] line-clamp-2 leading-relaxed">{project.description}</p>
          ) : (
            <p className="text-[13px] text-[#cbd5e1] italic">No description</p>
          )}
        </div>

        {/* Meta row */}
        <p className="text-[10px] text-[#94a3b8] mb-4">Created {created}</p>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-[#f1f5f9]">
          <Link
            href={`/changelog/new?project=${project.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 text-[12px] font-bold text-white bg-[#0077b6] hover:bg-[#023e8a] py-2.5 rounded-xl transition-colors duration-150 shadow-sm no-underline"
          >
            <PenLine className="w-3.5 h-3.5" />
            Write Update
          </Link>
          {project.is_public && (
            <Link
              href={`/${project.slug}`}
              target="_blank"
              className="flex items-center justify-center w-10 py-2.5 rounded-xl text-[#64748b] hover:text-[#0077b6] border border-[#e2e8f0] hover:border-[#caf0f8] hover:bg-[#f0f9ff] transition-all duration-150 no-underline"
              title="View public page"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
          <Link
            href={`/roadmap?project_id=${project.id}`}
            className="flex items-center justify-center w-10 py-2.5 rounded-xl text-[#64748b] hover:text-[#0077b6] border border-[#e2e8f0] hover:border-[#caf0f8] hover:bg-[#f0f9ff] transition-all duration-150 no-underline"
            title="Roadmap"
          >
            <Map className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={copyLink}
            className="flex items-center justify-center w-10 py-2.5 rounded-xl text-[#64748b] hover:text-[#0077b6] border border-[#e2e8f0] hover:border-[#caf0f8] hover:bg-[#f0f9ff] transition-all duration-150 cursor-pointer"
            title="Copy link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#16a34a]" /> : <Link2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
