'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ScrollText, Search, PenLine, Loader2, Mail, X, Copy, Check } from 'lucide-react'
import type { ChangelogEntry, Project } from '@/types'

type Tab = 'all' | 'published' | 'drafts'

function ChangelogContent() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [selectedProjectName, setSelectedProjectName] = useState('')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [generatingEmail, setGeneratingEmail] = useState(false)
  const [showEmailPanel, setShowEmailPanel] = useState(false)
  const [emailDraft, setEmailDraft] = useState<{ subject: string; body: string } | null>(null)
  const [emailCopied, setEmailCopied] = useState(false)
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    async function loadProjects() {
      const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
      setProjects(data ?? [])
      const pid = searchParams.get('project_id')
      if (pid) {
        setSelectedProject(pid)
        setSelectedProjectName(data?.find(p => p.id === pid)?.name ?? '')
      } else if (data?.length) {
        setSelectedProject(data[0].id)
        setSelectedProjectName(data[0].name)
      }
    }
    loadProjects()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedProject) return
    async function loadEntries() {
      setLoading(true)
      const { data } = await supabase
        .from('changelog_entries')
        .select('*')
        .eq('project_id', selectedProject)
        .order('created_at', { ascending: false })
      setEntries(data ?? [])
      setLoading(false)
    }
    loadEntries()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject])

  async function togglePublish(entry: ChangelogEntry) {
    setTogglingId(entry.id)
    const newPublished = !entry.is_published
    const res = await fetch(`/api/changelogs/${entry.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        is_published: newPublished,
        published_at: newPublished ? new Date().toISOString() : null,
      }),
    })
    if (res.ok) {
      setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, is_published: newPublished } : e))
      toast.success(newPublished ? 'Published' : 'Unpublished')
    } else {
      toast.error('Failed to update')
    }
    setTogglingId(null)
  }

  async function deleteEntry(id: string) {
    setDeletingId(id)
    const res = await fetch(`/api/changelogs/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setEntries(prev => prev.filter(e => e.id !== id))
      toast.success('Deleted')
    } else {
      toast.error('Failed to delete')
    }
    setDeletingId(null)
    setConfirmDeleteId(null)
  }

  async function handleGenerateEmail() {
    if (!selectedProject) { toast.error('Select a project first'); return }
    setGeneratingEmail(true)
    setShowEmailPanel(true)
    setEmailDraft(null)
    try {
      const res = await fetch('/api/ai/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: selectedProject, project_name: selectedProjectName }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to generate email draft')
        setShowEmailPanel(false)
      } else {
        setEmailDraft(data)
      }
    } catch {
      toast.error('Failed to generate email draft')
      setShowEmailPanel(false)
    }
    setGeneratingEmail(false)
  }

  function copyEmailToClipboard() {
    if (!emailDraft) return
    const text = `Subject: ${emailDraft.subject}\n\n${emailDraft.body}`
    navigator.clipboard.writeText(text)
    setEmailCopied(true)
    setTimeout(() => setEmailCopied(false), 2000)
  }

  const filtered = entries.filter(e => {
    const matchesTab = tab === 'all' ? true : tab === 'published' ? e.is_published : !e.is_published
    const matchesSearch = !search || e.title.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'published', label: 'Published' },
    { id: 'drafts', label: 'Drafts' },
  ]

  return (
    <div className="min-h-full p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h1
            className="text-2xl font-bold text-[#03045e]"
            style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
          >
            Changelog
          </h1>
          {selectedProjectName && (
            <span className="text-xs font-semibold text-[#64748b] bg-[#e0f4fb] px-2.5 py-1 rounded-lg">
              {selectedProjectName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {projects.length > 1 && (
            <select
              value={selectedProject}
              onChange={e => {
                setSelectedProject(e.target.value)
                setSelectedProjectName(projects.find(p => p.id === e.target.value)?.name ?? '')
              }}
              className="rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#03045e] outline-none focus:ring-2 focus:ring-[#0077b6]/20 focus:border-[#0077b6]"
            >
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          <button
            onClick={handleGenerateEmail}
            disabled={generatingEmail || !selectedProject}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#e2e8f0] bg-white hover:bg-[#f0f9ff] hover:border-[#caf0f8] text-[#475569] hover:text-[#0077b6] text-sm font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {generatingEmail
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Mail className="w-4 h-4" />
            }
            Weekly Update
          </button>
          <Link
            href={`/changelog/new${selectedProject ? `?project_id=${selectedProject}` : ''}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0077b6] hover:bg-[#023e8a] text-white text-sm font-semibold transition-colors duration-150 no-underline"
          >
            <PenLine className="w-4 h-4" />
            Write Update
          </Link>
        </div>
      </div>

      {/* Email draft panel */}
      {showEmailPanel && (
        <div className="mb-6 bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f1f5f9]">
            <div>
              <h2
                className="text-[15px] font-bold text-[#03045e]"
                style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
              >
                Weekly Update Email Draft
              </h2>
              <p className="text-[12px] text-[#94a3b8] mt-0.5">
                Generated from your {emailDraft ? 'recent published entries' : 'changelog'}
              </p>
            </div>
            <button
              onClick={() => setShowEmailPanel(false)}
              className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#475569] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {generatingEmail ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3 text-[#64748b]">
              <Loader2 className="w-6 h-6 animate-spin text-[#0077b6]" />
              <p className="text-[13px]">Writing your update email...</p>
            </div>
          ) : emailDraft ? (
            <div className="p-6 space-y-4">
              {/* Subject */}
              <div>
                <p className="text-[11px] font-semibold text-[#475569] uppercase tracking-wide mb-2">Subject</p>
                <div className="px-4 py-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[14px] font-semibold text-[#03045e]">
                  {emailDraft.subject}
                </div>
              </div>

              {/* Body */}
              <div>
                <p className="text-[11px] font-semibold text-[#475569] uppercase tracking-wide mb-2">Body</p>
                <div className="px-4 py-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[13px] text-[#334155] whitespace-pre-wrap leading-relaxed font-[DM_Sans,sans-serif] min-h-[120px]">
                  {emailDraft.body}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={copyEmailToClipboard}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0077b6] hover:bg-[#023e8a] text-white text-[13px] font-semibold transition-colors cursor-pointer"
                >
                  {emailCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {emailCopied ? 'Copied' : 'Copy to clipboard'}
                </button>
                <button
                  onClick={handleGenerateEmail}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e2e8f0] text-[13px] font-semibold text-[#475569] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
                >
                  Regenerate
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div className="flex gap-0 border-b border-[#e2e8f0]">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium transition-all duration-150 border-b-2 -mb-px ${
                tab === t.id
                  ? 'border-[#0077b6] text-[#0077b6]'
                  : 'border-transparent text-[#64748b] hover:text-[#03045e]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search entries..."
            className="pl-9 pr-4 py-2 text-sm rounded-xl border border-[#e2e8f0] bg-white text-[#03045e] outline-none focus:ring-2 focus:ring-[#0077b6]/20 focus:border-[#0077b6] placeholder:text-[#94a3b8] w-56 transition-all"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center gap-2 py-12 justify-center text-[#64748b]">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading entries...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-[#e2e8f0] text-center">
          <ScrollText className="w-12 h-12 text-[#94a3b8] mb-4" />
          <h3 className="text-lg font-bold text-[#03045e] mb-1" style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}>
            {entries.length === 0 ? 'No changelog entries yet' : 'No entries match your filters'}
          </h3>
          <p className="text-sm text-[#64748b] max-w-xs mb-6">
            {entries.length === 0
              ? 'Write your first update to let users know what you\'ve been building.'
              : 'Try changing your search or filter.'}
          </p>
          {entries.length === 0 && (
            <Link
              href={`/changelog/new${selectedProject ? `?project_id=${selectedProject}` : ''}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0077b6] hover:bg-[#023e8a] text-white text-sm font-semibold transition-colors no-underline"
            >
              <PenLine className="w-4 h-4" /> Write Update
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(entry => {
            const isConfirming = confirmDeleteId === entry.id
            const totalItems = (entry.content.new?.length ?? 0) + (entry.content.improved?.length ?? 0) + (entry.content.fixed?.length ?? 0)
            return (
              <div
                key={entry.id}
                className="group relative bg-white rounded-xl border border-[#e2e8f0] overflow-hidden hover:shadow-sm transition-all duration-150"
              >
                {/* Left status bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px]"
                  style={{ backgroundColor: entry.is_published ? '#16a34a' : '#e2e8f0' }}
                />
                <div className="pl-5 pr-4 py-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {entry.version && (
                        <span className="font-mono text-[11px] text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded">
                          v{entry.version}
                        </span>
                      )}
                      <h3 className="font-semibold text-[#03045e] text-[15px]">{entry.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-xs text-[#94a3b8]">
                        {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        entry.is_published ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[#fef9c3] text-[#a16207]'
                      }`}>
                        {entry.is_published ? 'Published' : 'Draft'}
                      </span>
                      {totalItems > 0 && (
                        <span className="text-[11px] text-[#94a3b8]">
                          {entry.content.new?.length > 0 && `${entry.content.new.length} New`}
                          {entry.content.new?.length > 0 && entry.content.improved?.length > 0 && ' · '}
                          {entry.content.improved?.length > 0 && `${entry.content.improved.length} Improved`}
                          {(entry.content.new?.length > 0 || entry.content.improved?.length > 0) && entry.content.fixed?.length > 0 && ' · '}
                          {entry.content.fixed?.length > 0 && `${entry.content.fixed.length} Fixed`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action row — visible on hover */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    {isConfirming ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#64748b]">Are you sure?</span>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          disabled={deletingId === entry.id}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          {deletingId === entry.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <Link
                          href={`/changelog/new?edit=${entry.id}`}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0] transition-colors no-underline"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => togglePublish(entry)}
                          disabled={togglingId === entry.id}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                            entry.is_published
                              ? 'bg-[#fef9c3] text-[#a16207] hover:bg-yellow-100'
                              : 'bg-[#dcfce7] text-[#16a34a] hover:bg-green-100'
                          }`}
                        >
                          {togglingId === entry.id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : entry.is_published ? 'Unpublish' : 'Publish'
                          }
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(entry.id)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function ChangelogPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#64748b]">Loading...</div>}>
      <ChangelogContent />
    </Suspense>
  )
}


