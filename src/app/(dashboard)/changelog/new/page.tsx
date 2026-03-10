'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Sparkles, Loader2, AlertCircle, RotateCcw, Plus, Trash2 } from 'lucide-react'
import type { Project, AIChangelogResponse } from '@/types'

const CATEGORY_CONFIG = {
  new: {
    label: 'New',
    accent: '#16a34a',
    bg: 'bg-[#f0fdf4]',
    text: 'text-[#16a34a]',
    border: 'border-l-[#16a34a]',
  },
  improved: {
    label: 'Improved',
    accent: '#0077b6',
    bg: 'bg-[#eff8ff]',
    text: 'text-[#0077b6]',
    border: 'border-l-[#0077b6]',
  },
  fixed: {
    label: 'Fixed',
    accent: '#dc2626',
    bg: 'bg-[#fff1f2]',
    text: 'text-[#dc2626]',
    border: 'border-l-[#dc2626]',
  },
} as const

type Category = keyof typeof CATEGORY_CONFIG

function NewChangelogContent() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [rawInput, setRawInput] = useState('')
  const [version, setVersion] = useState('')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [result, setResult] = useState<AIChangelogResponse | null>(null)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedItems, setEditedItems] = useState<Record<Category, string[]>>({ new: [], improved: [], fixed: [] })
  const [generateError, setGenerateError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loadingEdit, setLoadingEdit] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
      setProjects(data ?? [])
      const pid = searchParams.get('project_id') || searchParams.get('project')
      const eid = searchParams.get('edit')
      if (pid && data) {
        setSelectedProject(pid)
      } else if (data?.length) {
        setSelectedProject(data[0].id)
      }
      if (eid) {
        setEditingId(eid)
        setLoadingEdit(true)
        try {
          const res = await fetch(`/api/changelogs/${eid}`)
          if (res.ok) {
            const entry = await res.json()
            setSelectedProject(entry.project_id)
            setRawInput(entry.raw_input ?? '')
            setVersion(entry.version ?? '')
            setEditedTitle(entry.title ?? '')
            const c = entry.content ?? { new: [], improved: [], fixed: [] }
            setEditedItems({ new: c.new ?? [], improved: c.improved ?? [], fixed: c.fixed ?? [] })
            // Mark result as present so the right panel shows
            setResult({ title: entry.title, new: c.new ?? [], improved: c.improved ?? [], fixed: c.fixed ?? [] })
          }
        } finally {
          setLoadingEdit(false)
        }
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleGenerate() {
    if (!rawInput.trim()) { toast.error('Paste some raw commits or notes first'); return }
    setGenerating(true)
    setResult(null)
    setGenerateError('')
    const project = projects.find(p => p.id === selectedProject)
    try {
      const res = await fetch('/api/ai/generate-changelog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_input: rawInput, project_name: project?.name ?? 'Project' }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'AI generation failed')
      }
      const data: AIChangelogResponse = await res.json()
      setResult(data)
      setEditedTitle(data.title)
      setEditedItems({ new: [...data.new], improved: [...data.improved], fixed: [...data.fixed] })
    } catch (err: unknown) {
      setGenerateError(err instanceof Error ? err.message : 'Generation failed. Check your input and try again.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSave(publish: boolean) {
    if (!result) return
    publish ? setPublishing(true) : setSaving(true)
    try {
      const body = {
        ...(!editingId ? { project_id: selectedProject } : {}),
        title: editedTitle,
        version: version || null,
        raw_input: rawInput,
        content: editedItems,
        ...(publish ? { is_published: true, published_at: new Date().toISOString() } : {}),
      }
      const url = editingId ? `/api/changelogs/${editingId}` : '/api/changelogs'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }
      toast.success(publish ? 'Published!' : (editingId ? 'Draft updated' : 'Saved as draft'))
      router.push(`/changelog?project_id=${selectedProject}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
      setPublishing(false)
    }
  }

  function updateItem(cat: Category, index: number, value: string) {
    setEditedItems(prev => ({
      ...prev,
      [cat]: prev[cat].map((item, i) => i === index ? value : item),
    }))
  }

  function removeItem(cat: Category, index: number) {
    setEditedItems(prev => ({ ...prev, [cat]: prev[cat].filter((_, i) => i !== index) }))
  }

  function addItem(cat: Category) {
    setEditedItems(prev => ({ ...prev, [cat]: [...prev[cat], ''] }))
  }

  const charCount = rawInput.length

  return (
    <div className="min-h-full p-6 md:p-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-semibold text-[#64748b] uppercase tracking-widest mb-1">Changelog / New Entry</p>
          <h1
            className="text-2xl font-bold text-[#03045e]"
            style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
          >
            AI Changelog Writer
          </h1>
        </div>
        {projects.length > 1 && (
          <select
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            className="rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#03045e] outline-none focus:ring-2 focus:ring-[#0077b6]/20 focus:border-[#0077b6]"
          >
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
      </div>

      {loadingEdit && (
        <div className="flex items-center gap-2 py-4 text-[#64748b] text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading entry...
        </div>
      )}
      {editingId && !loadingEdit && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-[#eff8ff] border border-[#bae6fd] text-xs font-semibold text-[#0077b6]">
          Editing existing draft — saving will update this entry, not create a new one.
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left column: Input ── */}
        <div className="flex flex-col gap-4">
          <p className="text-[11px] font-semibold text-[#64748b] uppercase tracking-widest">Raw Input</p>

          <div className="relative">
            <textarea
              ref={textareaRef}
              value={rawInput}
              onChange={e => setRawInput(e.target.value)}
              maxLength={2000}
              rows={12}
              className="w-full rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-sm font-mono text-[#03045e] placeholder:text-[#94a3b8] outline-none focus:ring-2 focus:ring-[#0077b6]/20 focus:border-[#0077b6] transition-all resize-none"
              placeholder={`fix login bug for OAuth users\nadd dark mode to settings\nrefactor database layer — 3x performance\nrate limit the public API\nfix typo in onboarding email\nadd CSV export to dashboard`}
            />
            <span className="absolute bottom-3 right-3 text-[11px] text-[#94a3b8] font-mono select-none">
              {charCount}/2000
            </span>
          </div>

          <div className="flex items-end gap-3">
            <div>
              <label className="block text-[13px] font-semibold text-[#03045e] mb-1.5">Version <span className="font-normal text-[#94a3b8]">(optional)</span></label>
              <input
                type="text"
                value={version}
                onChange={e => setVersion(e.target.value)}
                className="w-40 rounded-xl border border-[#e2e8f0] bg-white px-3 py-2.5 text-sm text-[#03045e] font-mono outline-none focus:ring-2 focus:ring-[#0077b6]/20 focus:border-[#0077b6] transition-all placeholder:text-[#94a3b8]"
                placeholder="v1.2.0"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating || !rawInput.trim()}
            className="w-full rounded-xl bg-[#03045e] hover:bg-[#0077b6] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 text-sm transition-colors duration-150 flex items-center justify-center gap-2"
          >
            {generating
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
              : <><Sparkles className="w-4 h-4" /> Generate Changelog</>
            }
          </button>

          {generateError && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-red-700">{generateError}</p>
                <button
                  onClick={handleGenerate}
                  className="mt-2 flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Retry
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right column: Output ── */}
        <div className="flex flex-col gap-4">
          <p className="text-[11px] font-semibold text-[#64748b] uppercase tracking-widest">AI Output</p>

          {!result ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] rounded-xl border-2 border-dashed border-[#e2e8f0] text-center p-8">
              <Sparkles className="w-8 h-8 text-[#cbd5e1] mb-3" />
              <p className="text-sm text-[#94a3b8]">Your polished changelog will appear here</p>
              <p className="text-xs text-[#cbd5e1] mt-1">Paste raw notes and click Generate</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Output card */}
              <div className="bg-white rounded-xl border border-[#e2e8f0] p-5">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={e => setEditedTitle(e.target.value)}
                  className="w-full bg-transparent text-[18px] font-bold text-[#03045e] outline-none border-b border-transparent focus:border-[#0077b6] pb-1 mb-4 transition-colors placeholder:text-[#94a3b8]"
                  style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
                  placeholder="Changelog title"
                />

                {(Object.keys(CATEGORY_CONFIG) as Category[]).map(cat => {
                  const cfg = CATEGORY_CONFIG[cat]
                  const items = editedItems[cat]
                  if (items.length === 0 && result[cat].length === 0) return null
                  return (
                    <div key={cat} className={`mb-4 pl-3 border-l-2 ${cfg.border}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[11px] font-bold uppercase tracking-widest ${cfg.text}`}>{cfg.label}</span>
                        <span className="text-[11px] text-[#94a3b8] font-mono">{items.length}</span>
                      </div>
                      <div className="space-y-1.5">
                        {items.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 group/item">
                            <input
                              type="text"
                              value={item}
                              onChange={e => updateItem(cat, i, e.target.value)}
                              className="flex-1 text-sm text-[#03045e] bg-transparent py-0.5 outline-none border-b border-transparent focus:border-[#0077b6] transition-colors placeholder:text-[#94a3b8]"
                              placeholder="Enter item..."
                            />
                            <button
                              onClick={() => removeItem(cat, i)}
                              className="opacity-0 group-hover/item:opacity-100 transition-opacity mt-0.5 text-[#94a3b8] hover:text-red-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => addItem(cat)}
                        className={`mt-2 flex items-center gap-1 text-xs font-medium ${cfg.text} hover:opacity-70 transition-opacity`}
                      >
                        <Plus className="w-3.5 h-3.5" /> Add item
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Save actions */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving || publishing}
                  className="flex-1 rounded-xl border border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc] font-semibold py-2.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save as Draft'}
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving || publishing}
                  className="flex-1 rounded-xl bg-[#0077b6] hover:bg-[#023e8a] text-white font-semibold py-2.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {publishing ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</> : 'Save & Publish'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function NewChangelogPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#64748b]">Loading...</div>}>
      <NewChangelogContent />
    </Suspense>
  )
}

