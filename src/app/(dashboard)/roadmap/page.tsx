'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import toast from 'react-hot-toast'
import { Sparkles, Loader2, Plus, GripVertical, X } from 'lucide-react'
import type { RoadmapItem, Project } from '@/types'

const COLUMNS = [
  { id: 'planned',     label: 'Planned',     accent: '#d97706' },
  { id: 'in_progress', label: 'In Progress',  accent: '#0077b6' },
  { id: 'done',        label: 'Done',         accent: '#16a34a' },
] as const

type ColumnId = typeof COLUMNS[number]['id']

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
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#e2e8f0] p-3 mt-2 shadow-sm">
      <input
        type="text"
        autoFocus
        required
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Item title"
        className="w-full text-sm text-[#03045e] border border-[#e2e8f0] rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#0077b6]/20 focus:border-[#0077b6] mb-2 placeholder:text-[#94a3b8]"
      />
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={2}
        className="w-full text-sm text-[#03045e] border border-[#e2e8f0] rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#0077b6]/20 focus:border-[#0077b6] mb-3 resize-none placeholder:text-[#94a3b8]"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="flex-1 rounded-lg bg-[#0077b6] hover:bg-[#023e8a] text-white text-xs font-semibold py-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : `Add to ${COLUMNS.find(c => c.id === columnId)?.label}`}
        </button>
        <button type="button" onClick={onClose} className="px-3 py-2 rounded-lg bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#64748b] text-xs font-semibold transition-colors">
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
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    async function loadProjects() {
      const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
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

  function getColumnItems(status: string) {
    return items.filter(i => i.status === status).sort((a, b) => a.position - b.position)
  }

  return (
    <div className="min-h-full p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-[#03045e]" style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}>
          Roadmap
        </h1>
        <div className="flex items-center gap-3">
          {projects.length > 1 && (
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              className="rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#03045e] outline-none focus:ring-2 focus:ring-[#0077b6]/20 focus:border-[#0077b6]"
            >
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          <button
            onClick={() => setAddingToColumn('planned')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc] text-sm font-semibold transition-colors"
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
                    className="flex items-center gap-2 px-3 py-2 mb-3 rounded-xl border-l-4 bg-white border border-[#e2e8f0]"
                    style={{ borderLeftColor: col.accent }}
                  >
                    <span className="font-semibold text-[13px] text-[#03045e] flex-1" style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}>
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
                          snapshot.isDraggingOver ? 'bg-[#f0f9ff]' : 'bg-transparent'
                        }`}
                      >
                        {colItems.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex items-center justify-center h-20 rounded-xl border-2 border-dashed border-[#e2e8f0]">
                            <p className="text-xs text-[#94a3b8]">No items yet</p>
                          </div>
                        )}

                        {colItems.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`group bg-white rounded-xl border border-[#e2e8f0] p-3.5 transition-all duration-150 ${
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
                                    <h3 className="font-semibold text-sm text-[#03045e] leading-snug">{item.title}</h3>
                                    {item.ai_summary && (
                                      <p className="text-xs text-[#64748b] mt-1 line-clamp-2">{item.ai_summary}</p>
                                    )}
                                    {!item.ai_summary && item.description && (
                                      <p className="text-xs text-[#64748b] mt-1 line-clamp-2">{item.description}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                      {item.vote_total > 0 && (
                                        <span className="text-[10px] font-semibold text-[#64748b] bg-[#f1f5f9] px-1.5 py-0.5 rounded">
                                          {item.vote_total} votes
                                        </span>
                                      )}
                                      <span className="text-[10px] text-[#94a3b8] font-mono">P{item.priority}</span>
                                    </div>
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


