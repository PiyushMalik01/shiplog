'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import toast from 'react-hot-toast'
import { Sparkles, Loader2, Plus, GripVertical, X, Trash2, Zap, Copy, Check, FileText, Send } from 'lucide-react'
import type { RoadmapItem, Project } from '@/types'

const COLUMNS = [
  { id: 'planned',     label: 'Planned',     accent: '#d97706' },
  { id: 'in_progress', label: 'In Progress',  accent: '#0077b6' },
  { id: 'done',        label: 'Done',         accent: '#16a34a' },
] as const

type ColumnId = typeof COLUMNS[number]['id']

interface ShipItResult {
  title: string
  new: string[]
  improved: string[]
  fixed: string[]
  linkedin: string
  twitter: string
}

function formatChangelogText(result: ShipItResult): string {
  const lines: string[] = [result.title]
  if (result.new.length) { lines.push('', 'NEW'); result.new.forEach(t => lines.push(`- ${t}`)) }
  if (result.improved.length) { lines.push('', 'IMPROVED'); result.improved.forEach(t => lines.push(`- ${t}`)) }
  if (result.fixed.length) { lines.push('', 'FIXED'); result.fixed.forEach(t => lines.push(`- ${t}`)) }
  return lines.join('\n')
}

function shipItKey(id: string) { return `shipit_${id}` }
function loadShipItCache(id: string): { notes: string; result: ShipItResult | null; draftId: string | null } | null {
  if (typeof window === 'undefined') return null
  try { return JSON.parse(localStorage.getItem(shipItKey(id)) ?? 'null') } catch { return null }
}
function saveShipItCache(id: string, state: { notes: string; result: ShipItResult | null; draftId: string | null }) {
  try { localStorage.setItem(shipItKey(id), JSON.stringify(state)) } catch {}
}

interface AddItemFormProps {
  columnId: ColumnId
  onAdd: (title: string, description: string, status: ColumnId) => Promise<void>
  onClose: () => void
}

function AddItemForm({ columnId, onAdd, onClose }: AddItemFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    await onAdd(title.trim(), description.trim(), columnId)
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0d1b2e] rounded-xl border border-[#e2e8f0] dark:border-white/8 p-3 mt-2 shadow-sm">
      <input
        type="text"
        autoFocus
        required
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Item title"
        className="w-full text-sm text-[#03045e] dark:text-slate-200 border border-[#e2e8f0] dark:border-white/10 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#0077b6]/20 focus:border-[#0077b6] mb-2 placeholder:text-[#94a3b8] bg-white dark:bg-[#080f1e]"
      />
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={2}
        className="w-full text-sm text-[#03045e] dark:text-slate-200 border border-[#e2e8f0] dark:border-white/10 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#0077b6]/20 focus:border-[#0077b6] mb-3 resize-none placeholder:text-[#94a3b8] bg-white dark:bg-[#080f1e]"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="flex-1 rounded-lg bg-[#0077b6] hover:bg-[#023e8a] text-white text-xs font-semibold py-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : `Add to ${COLUMNS.find(c => c.id === columnId)?.label}`}
        </button>
        <button type="button" onClick={onClose} className="px-3 py-2 rounded-lg bg-[#f1f5f9] dark:bg-white/8 hover:bg-[#e2e8f0] dark:hover:bg-white/15 text-[#64748b] dark:text-slate-400 text-xs font-semibold transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  )
}

function RoadmapContent() {
  const [items, setItems] = useState<RoadmapItem[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [prioritizing, setPrioritizing] = useState(false)
  const [addingToColumn, setAddingToColumn] = useState<ColumnId | null>(null)
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null)
  const [confirmDeleteItemId, setConfirmDeleteItemId] = useState<string | null>(null)
  const [shipItItem, setShipItItem] = useState<RoadmapItem | null>(null)
  const [shipItNotes, setShipItNotes] = useState('')
  const [shipItResult, setShipItResult] = useState<ShipItResult | null>(null)
  const [shipItDraftId, setShipItDraftId] = useState<string | null>(null)
  const [generatingShipIt, setGeneratingShipIt] = useState(false)
  const [shipItCopied, setShipItCopied] = useState<string | null>(null)
  const [savingChangelog, setSavingChangelog] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadProjects() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setProjects(data ?? [])
      const pid = searchParams.get('project_id')
      if (pid) setSelectedProject(pid)
      else if (data?.length) setSelectedProject(data[0].id)
    }
    loadProjects()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadItems = useCallback(async () => {
    if (!selectedProject) return
    setLoading(true)
    const { data } = await supabase.from('roadmap_items').select('*').eq('project_id', selectedProject).order('priority', { ascending: true })
    setItems(data ?? [])
    setLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject])

  useEffect(() => { loadItems() }, [loadItems])

  async function onDragEnd(result: DropResult) {
    const { draggableId, destination } = result
    if (!destination) return
    const newStatus = destination.droppableId as ColumnId
    setItems(prev => prev.map(item =>
      item.id === draggableId ? { ...item, status: newStatus, position: destination.index } : item
    ))
    const res = await fetch(`/api/roadmap/${draggableId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, position: destination.index }),
    })
    if (!res.ok) { toast.error('Failed to update'); loadItems() }
  }

  async function handlePrioritize() {
    const project = projects.find(p => p.id === selectedProject)
    setPrioritizing(true)
    try {
      const res = await fetch('/api/ai/roadmap-priority', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: project?.name ?? 'Project',
          items: items.map(i => ({ id: i.id, title: i.title, description: i.description, vote_total: i.vote_total, status: i.status })),
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      toast.success(data.reasoning ?? 'Priority updated')
      loadItems()
    } catch {
      toast.error('Failed to prioritize')
    } finally {
      setPrioritizing(false)
    }
  }

  async function handleAddItem(title: string, description: string, status: ColumnId) {
    const res = await fetch('/api/roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: selectedProject, title, description: description || null, status, position: 0, priority: 99 }),
    })
    if (res.ok) {
      const data = await res.json()
      setItems(prev => [data, ...prev])
      setAddingToColumn(null)
      toast.success('Item added')
    } else {
      toast.error('Failed to add item')
    }
  }

  async function handleDeleteItem(id: string) {
    setDeletingItemId(id)
    const res = await fetch(`/api/roadmap/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setItems(prev => prev.filter(i => i.id !== id))
      toast.success('Item removed')
    } else {
      toast.error('Failed to delete item')
    }
    setDeletingItemId(null)
    setConfirmDeleteItemId(null)
  }

  function openShipIt(item: RoadmapItem) {
    const cached = loadShipItCache(item.id)
    setShipItItem(item)
    setShipItNotes(cached?.notes ?? '')
    setShipItResult(cached?.result ?? null)
    setShipItDraftId(cached?.draftId ?? null)
    setShipItCopied(null)
  }

  async function handleShipIt() {
    if (!shipItItem || !shipItNotes.trim()) return
    const project = projects.find(p => p.id === selectedProject)
    setGeneratingShipIt(true)
    try {
      const res = await fetch('/api/ai/ship-it', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: selectedProject,
          project_name: project?.name ?? 'Your Product',
          item_title: shipItItem.title,
          raw_notes: shipItNotes,
        }),
      })
      if (!res.ok) throw new Error('Generation failed')
      const data = await res.json()
      setShipItResult(data)
      saveShipItCache(shipItItem.id, { notes: shipItNotes, result: data, draftId: shipItDraftId })
    } catch {
      toast.error('Failed to generate posts')
    } finally {
      setGeneratingShipIt(false)
    }
  }

  async function handleSaveChangelog() {
    if (!shipItResult || !selectedProject || !shipItItem) return
    setSavingChangelog(true)
    try {
      const res = await fetch('/api/changelogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: selectedProject,
          title: shipItResult.title,
          content: { new: shipItResult.new, improved: shipItResult.improved, fixed: shipItResult.fixed },
          is_published: false,
          raw_input: `Shipped: ${shipItItem.title}\n\n${shipItNotes}`,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      toast.success('Saved as draft — review and publish in Changelog')
      router.push('/changelog')
    } catch {
      toast.error('Failed to save changelog draft')
    } finally {
      setSavingChangelog(false)
    }
  }

  function copyShipIt(key: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setShipItCopied(key)
      setTimeout(() => setShipItCopied(null), 1500)
    })
  }

  function getColumnItems(status: string) {
    return items.filter(i => i.status === status).sort((a, b) => a.position - b.position)
  }

  return (
    <div className="min-h-full p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-[#03045e] dark:text-white" style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}>
          Roadmap
        </h1>
        <div className="flex items-center gap-3">
          {projects.length > 1 && (
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              className="rounded-xl border border-[#e2e8f0] dark:border-white/10 bg-white dark:bg-[#0d1b2e] px-3 py-2 text-sm text-[#03045e] dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#0077b6]/20 focus:border-[#0077b6]"
            >
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          <button
            onClick={() => setAddingToColumn('planned')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#e2e8f0] dark:border-white/10 bg-white dark:bg-[#0d1b2e] text-[#475569] dark:text-slate-400 hover:bg-[#f8fafc] dark:hover:bg-white/8 text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
          <button
            onClick={handlePrioritize}
            disabled={prioritizing || items.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#03045e] hover:bg-[#0077b6] text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {prioritizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {prioritizing ? 'Analyzing...' : 'AI Prioritize'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-12 justify-center text-[#64748b]">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading roadmap...
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          {/* Desktop: 3-column grid | Mobile: horizontal scroll */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:overflow-visible overflow-x-auto flex-nowrap">
            {COLUMNS.map(col => {
              const colItems = getColumnItems(col.id)
              return (
                <div key={col.id} className="flex flex-col min-w-[280px] md:min-w-0">
                  {/* Column header */}
                  <div
                    className="flex items-center gap-2 px-3 py-2 mb-3 rounded-xl border-l-4 bg-white dark:bg-[#0d1b2e] border border-[#e2e8f0] dark:border-white/8"
                    style={{ borderLeftColor: col.accent }}
                  >
                    <span className="font-semibold text-[13px] text-[#03045e] dark:text-white flex-1" style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}>
                      {col.label}
                    </span>
                    <span
                      className="text-[11px] font-bold px-1.5 py-0.5 rounded-md"
                      style={{ backgroundColor: col.accent + '18', color: col.accent }}
                    >
                      {colItems.length}
                    </span>
                    <button
                      onClick={() => setAddingToColumn(addingToColumn === col.id ? null : col.id)}
                      className="text-[#94a3b8] hover:text-[#64748b] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add item form */}
                  {addingToColumn === col.id && (
                    <AddItemForm columnId={col.id} onAdd={handleAddItem} onClose={() => setAddingToColumn(null)} />
                  )}

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 min-h-[120px] space-y-2.5 p-2 rounded-xl transition-colors duration-150 ${
                          snapshot.isDraggingOver ? 'bg-[#f0f9ff] dark:bg-white/5' : 'bg-transparent'
                        }`}
                      >
                        {colItems.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex items-center justify-center h-20 rounded-xl border-2 border-dashed border-[#e2e8f0] dark:border-white/10">
                            <p className="text-xs text-[#94a3b8] dark:text-slate-500">No items yet</p>
                          </div>
                        )}

                        {colItems.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`group bg-white dark:bg-[#0d1b2e] rounded-xl border border-[#e2e8f0] dark:border-white/8 p-3.5 transition-all duration-150 ${
                                  snapshot.isDragging
                                    ? 'shadow-lg scale-[1.02] border-[#0077b6]/30'
                                    : 'shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-md'
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="mt-0.5 text-[#cbd5e1] hover:text-[#94a3b8] cursor-grab active:cursor-grabbing flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm text-[#03045e] dark:text-white leading-snug">{item.title}</h3>
                                    {item.ai_summary && (
                                      <p className="text-xs text-[#64748b] dark:text-slate-400 mt-1 line-clamp-2">{item.ai_summary}</p>
                                    )}
                                    {!item.ai_summary && item.description && (
                                      <p className="text-xs text-[#64748b] dark:text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                      {item.vote_total > 0 && (
                                        <span className="text-[10px] font-semibold text-[#64748b] dark:text-slate-400 bg-[#f1f5f9] dark:bg-white/8 px-1.5 py-0.5 rounded">
                                          {item.vote_total} votes
                                        </span>
                                      )}
                                      <span className="text-[10px] text-[#94a3b8] dark:text-slate-500 font-mono">P{item.priority}</span>
                                    </div>
                                  </div>
                                  {/* Card actions */}
                                  <div className="flex-shrink-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {item.status === 'done' && confirmDeleteItemId !== item.id && (
                                      <button
                                        onClick={() => openShipIt(item)}
                                          className="relative p-1 rounded-lg text-[#94a3b8] hover:text-[#0077b6] hover:bg-[#f0f9ff] dark:hover:bg-white/8 transition-colors"
                                        title="Ship it — generate posts"
                                      >
                                        <Zap className="w-3.5 h-3.5" />
                                        {!loadShipItCache(item.id)?.draftId && (
                                          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
                                        )}
                                      </button>
                                    )}
                                    {confirmDeleteItemId === item.id ? (
                                      <div className="flex flex-col gap-1">
                                        <button
                                          onClick={() => handleDeleteItem(item.id)}
                                          disabled={deletingItemId === item.id}
                                          className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                                        >
                                          {deletingItemId === item.id ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : 'Delete'}
                                        </button>
                                        <button
                                          onClick={() => setConfirmDeleteItemId(null)}
                                          className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#f1f5f9] dark:bg-white/8 text-[#64748b] dark:text-slate-400 hover:bg-[#e2e8f0] dark:hover:bg-white/15 transition-colors"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setConfirmDeleteItemId(item.id)}
                                        className="p-1 rounded-lg text-[#cbd5e1] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        title="Delete item"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      )}

      {/* Ship It drawer */}
      {shipItItem && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setShipItItem(null)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-[460px] bg-white dark:bg-[#0d1b2e] shadow-2xl z-50 flex flex-col border-l border-[#e2e8f0] dark:border-white/8">
            {/* Header */}
            <div className="flex items-start gap-3 p-5 border-b border-[#e2e8f0] dark:border-white/8">
              <div className="w-8 h-8 rounded-xl bg-[#03045e] flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-[#caf0f8]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-[#0077b6] uppercase tracking-wider mb-0.5">Ship It</p>
                <h2 className="font-bold text-[#03045e] dark:text-white text-[14px] leading-snug" style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}>{shipItItem.title}</h2>
              </div>
              <button onClick={() => setShipItItem(null)} className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#64748b] hover:bg-[#f1f5f9] dark:hover:bg-white/8 transition-colors flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#03045e] dark:text-white mb-1">Implementation notes</label>
                <p className="text-xs text-[#64748b] dark:text-slate-400 mb-2">Paste commit messages, bullet points, or rough notes about what you built. AI will generate polished posts from them.</p>
                <textarea
                  value={shipItNotes}
                  onChange={e => {
                    setShipItNotes(e.target.value)
                    if (shipItItem) saveShipItCache(shipItItem.id, { notes: e.target.value, result: shipItResult, draftId: shipItDraftId })
                  }}
                  rows={5}
                  placeholder="e.g. rewrote search with trigram index, added dark mode toggle, fixed nav dropdown on mobile..."
                  className="w-full text-sm text-[#03045e] dark:text-slate-200 border border-[#e2e8f0] dark:border-white/10 rounded-xl px-3.5 py-3 outline-none focus:ring-2 focus:ring-[#0077b6]/20 focus:border-[#0077b6] resize-none placeholder:text-[#94a3b8] bg-white dark:bg-[#080f1e]"
                />
                <button
                  onClick={handleShipIt}
                  disabled={generatingShipIt || !shipItNotes.trim()}
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#03045e] hover:bg-[#0077b6] text-white text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingShipIt
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                    : <><Sparkles className="w-4 h-4" /> Generate posts</>}
                </button>
              </div>

              {shipItResult && (
                <>
                  {/* Changelog entry */}
                  <div className="rounded-xl border border-[#e2e8f0] dark:border-white/8 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-[#f8fafc] dark:bg-white/4 border-b border-[#e2e8f0] dark:border-white/8">
                      <FileText className="w-3.5 h-3.5 text-[#64748b] dark:text-slate-400" />
                      <span className="text-xs font-bold text-[#03045e] dark:text-white flex-1">Changelog entry</span>
                      <button onClick={() => copyShipIt('changelog', formatChangelogText(shipItResult))} className="inline-flex items-center gap-1 text-xs text-[#64748b] hover:text-[#03045e] transition-colors">
                        {shipItCopied === 'changelog' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{shipItCopied === 'changelog' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="p-4 space-y-2.5">
                      <p className="text-sm font-bold text-[#03045e] dark:text-white">{shipItResult.title}</p>
                      {shipItResult.new.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-[#0077b6] uppercase tracking-wide mb-1.5">New</p>
                          <ul className="space-y-1">{shipItResult.new.map((t, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-[#334155] dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0077b6] mt-1.5 flex-shrink-0" />{t}
                            </li>
                          ))}</ul>
                        </div>
                      )}
                      {shipItResult.improved.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-[#d97706] uppercase tracking-wide mb-1.5">Improved</p>
                          <ul className="space-y-1">{shipItResult.improved.map((t, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-[#334155] dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] mt-1.5 flex-shrink-0" />{t}
                            </li>
                          ))}</ul>
                        </div>
                      )}
                      {shipItResult.fixed.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-[#16a34a] uppercase tracking-wide mb-1.5">Fixed</p>
                          <ul className="space-y-1">{shipItResult.fixed.map((t, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-[#334155] dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] mt-1.5 flex-shrink-0" />{t}
                            </li>
                          ))}</ul>
                        </div>
                      )}
                      <button
                        onClick={handleSaveChangelog}
                        disabled={savingChangelog}
                        className="mt-1 w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#03045e] hover:bg-[#0077b6] text-white text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        {savingChangelog ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                        {savingChangelog ? 'Saving...' : (shipItDraftId ? 'Update existing draft' : 'Save as draft in Changelog')}
                      </button>
                    </div>
                  </div>

                  {/* LinkedIn post */}
                  <div className="rounded-xl border border-[#e2e8f0] dark:border-white/8 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-[#f8fafc] dark:bg-white/4 border-b border-[#e2e8f0] dark:border-white/8">
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 flex-shrink-0" fill="#0077b5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      <span className="text-xs font-bold text-[#03045e] dark:text-white flex-1">LinkedIn post</span>
                      <button onClick={() => copyShipIt('linkedin', shipItResult.linkedin)} className="inline-flex items-center gap-1 text-xs text-[#64748b] hover:text-[#03045e] transition-colors">
                        {shipItCopied === 'linkedin' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{shipItCopied === 'linkedin' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="p-4">
                      <pre className="text-xs text-[#334155] dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">{shipItResult.linkedin}</pre>
                    </div>
                  </div>

                  {/* X / Twitter post */}
                  <div className="rounded-xl border border-[#e2e8f0] dark:border-white/8 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-[#f8fafc] dark:bg-white/4 border-b border-[#e2e8f0] dark:border-white/8">
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
                      <span className="text-xs font-bold text-[#03045e] dark:text-white flex-1">X (Twitter)</span>
                      <span className={`text-[10px] font-mono ${shipItResult.twitter.length > 260 ? 'text-red-500 font-bold' : 'text-[#94a3b8]'}`}>
                        {shipItResult.twitter.length}/280
                      </span>
                      <button onClick={() => copyShipIt('twitter', shipItResult.twitter)} className="ml-2 inline-flex items-center gap-1 text-xs text-[#64748b] hover:text-[#03045e] transition-colors">
                        {shipItCopied === 'twitter' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{shipItCopied === 'twitter' ? 'Copied' : 'Copy'}</span>
                      </button>
                      <a
                        href={`https://x.com/intent/tweet?text=${encodeURIComponent(shipItResult.twitter)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1.5 inline-flex items-center gap-1 text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded-md hover:bg-[#333] transition-colors"
                      >
                        <Send className="w-2.5 h-2.5" /> Share
                      </a>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-[#334155] dark:text-slate-300 leading-relaxed">{shipItResult.twitter}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleShipIt}
                    disabled={generatingShipIt}
                    className="w-full py-2 text-xs font-semibold text-[#64748b] dark:text-slate-400 hover:text-[#03045e] dark:hover:text-white border border-[#e2e8f0] dark:border-white/10 rounded-xl hover:bg-[#f8fafc] dark:hover:bg-white/6 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generatingShipIt ? 'Regenerating...' : 'Regenerate all posts'}
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function RoadmapPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#64748b]">Loading...</div>}>
      <RoadmapContent />
    </Suspense>
  )
}


