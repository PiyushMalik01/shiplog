'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Inbox, GitBranch, Loader2, ChevronDown, ChevronUp, MessageSquare, Send, Trash2, BarChart2 } from 'lucide-react'
import type { FeatureRequest, Project, Comment } from '@/types'

const VOTE_COLORS = [
  '#0077b6', '#16a34a', '#d97706', '#7c3aed', '#dc2626', '#0891b2',
  '#65a30d', '#ea580c', '#9333ea', '#0284c7',
]

function DonutChart({ requests }: { requests: FeatureRequest[] }) {
  const withVotes = [...requests].filter(r => r.vote_count > 0).sort((a, b) => b.vote_count - a.vote_count)
  if (withVotes.length < 2) return null

  const top = withVotes.slice(0, 6)
  const restVotes = withVotes.slice(6).reduce((s, r) => s + r.vote_count, 0)
  const segments = restVotes > 0 ? [...top, { id: '__rest', title: 'Others', vote_count: restVotes } as FeatureRequest] : top
  const total = segments.reduce((s, r) => s + r.vote_count, 0)

  const r = 40, cx = 60, cy = 60
  const circ = 2 * Math.PI * r
  let offset = 0
  const arcs = segments.map((seg, i) => {
    const pct = seg.vote_count / total
    const dash = pct * circ
    const arc = { seg, dash, gap: circ - dash, offset, color: VOTE_COLORS[i % VOTE_COLORS.length], pct }
    offset += dash
    return arc
  })

  return (
    <div className="rounded-2xl border border-[#e2e8f0] dark:border-white/8 bg-white dark:bg-[#0d1b2e] p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="w-4 h-4 text-[#0077b6]" />
        <h3 className="text-sm font-bold text-[#03045e] dark:text-white" style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}>Vote Distribution</h3>
        <span className="ml-auto text-xs text-[#94a3b8] dark:text-slate-500">{total} total votes</span>
      </div>
      <div className="flex items-center gap-6 flex-wrap">
        {/* Donut */}
        <div className="flex-shrink-0">
          <svg width="120" height="120" viewBox="0 0 120 120">
            {arcs.map((arc, i) => (
              <circle
                key={i}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={arc.color}
                strokeWidth="18"
                strokeDasharray={`${arc.dash} ${arc.gap}`}
                strokeDashoffset={-arc.offset}
                style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
              />
            ))}
            <circle cx={cx} cy={cy} r="26" className="fill-white dark:fill-[#0d1b2e]" />
            <text x={cx} y={cy - 5} textAnchor="middle" className="text-[11px]" fill="#03045e" fontWeight="bold" fontSize="14" fontFamily="Syne,sans-serif">{total}</text>
            <text x={cx} y={cy + 11} textAnchor="middle" fill="#94a3b8" fontSize="9">votes</text>
          </svg>
        </div>
        {/* Legend */}
        <div className="flex-1 min-w-[180px] space-y-1.5">
          {arcs.map((arc, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: arc.color }} />
              <span className="text-xs text-[#334155] dark:text-slate-300 flex-1 truncate max-w-[160px]" title={arc.seg.title}>{arc.seg.title}</span>
              <span className="text-xs font-bold text-[#03045e] dark:text-white ml-auto">{arc.seg.vote_count}</span>
              <span className="text-[10px] text-[#94a3b8] w-8 text-right">{Math.round(arc.pct * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

type StatusFilter = 'all' | 'open' | 'planned' | 'done'
type SortOrder = 'votes' | 'newest' | 'oldest'

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  open:        { bg: 'bg-[#f1f5f9]',   text: 'text-[#475569]',  label: 'Open' },
  planned:     { bg: 'bg-[#eff8ff]',   text: 'text-[#0077b6]',  label: 'Planned' },
  in_progress: { bg: 'bg-[#fef9c3]',   text: 'text-[#a16207]',  label: 'In Progress' },
  done:        { bg: 'bg-[#dcfce7]',   text: 'text-[#16a34a]',  label: 'Done' },
}

function AdminCommentThread({ requestId }: { requestId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [posting, setPosting] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/feature-requests/${requestId}/comment`)
      .then(r => r.json())
      .then(d => { setComments(d ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [requestId])

  async function postComment() {
    if (!body.trim()) return
    setPosting(true)
    const res = await fetch(`/api/feature-requests/${requestId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: body.trim() }),
    })
    if (res.ok) {
      const data = await res.json()
      setComments(prev => [...prev, data])
      setBody('')
      toast.success('Reply posted')
    } else {
      toast.error('Failed to post reply')
    }
    setPosting(false)
  }

  async function deleteComment(commentId: string) {
    setDeletingCommentId(commentId)
    const res = await fetch(
      `/api/feature-requests/${requestId}/comment?comment_id=${commentId}`,
      { method: 'DELETE' }
    )
    if (res.ok) {
      setComments(prev => prev.filter(c => c.id !== commentId))
    } else {
      toast.error('Failed to delete comment')
    }
    setDeletingCommentId(null)
  }

  if (loading) return <div className="py-3 text-xs text-[#94a3b8] dark:text-slate-500">Loading comments...</div>

  return (
      <div className="mt-4 pt-4 border-t border-[#e2e8f0] dark:border-white/8">
      {comments.length > 0 ? (
        <div className="space-y-3 mb-4">
          {comments.map(c => (
            <div key={c.id} className="group flex gap-3">
              <div
                className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
                  c.is_admin ? 'bg-[#03045e] text-white' : 'bg-[#e0f4fb] text-[#0077b6]'
                }`}
              >
                {c.is_admin ? 'A' : (c.author_name ?? 'A')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-[#03045e] dark:text-white">
                    {c.is_admin ? 'Admin (You)' : (c.author_name ?? 'Anonymous')}
                  </span>
                  {c.is_admin && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#03045e] text-white uppercase tracking-wider">
                      Admin
                    </span>
                  )}
                  <span className="text-[11px] text-[#94a3b8] dark:text-slate-500">{new Date(c.created_at).toLocaleDateString()}</span>
                  <button
                    onClick={() => deleteComment(c.id)}
                    disabled={deletingCommentId === c.id}
                    className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 text-[#94a3b8] hover:text-red-500 disabled:opacity-50"
                    title="Delete comment"
                  >
                    {deletingCommentId === c.id
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <Trash2 className="w-3 h-3" />}
                  </button>
                </div>
                <p className={`text-sm mt-0.5 ${c.is_admin ? 'text-[#0f172a] dark:text-slate-100 font-medium' : 'text-[#475569] dark:text-slate-300'}`}>{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[#94a3b8] dark:text-slate-500 mb-4">No comments yet. Reply to start a conversation.</p>
      )}

      {/* Admin reply box */}
      <div className="flex items-start gap-2 bg-[#f8fafc] dark:bg-white/4 rounded-xl p-3 border border-[#e2e8f0] dark:border-white/8">
        <div className="w-6 h-6 rounded-full bg-[#03045e] flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-white mt-0.5">
          A
        </div>
        <div className="flex-1 flex gap-2">
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={2}
            placeholder="Reply as Admin..."
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) postComment() }}
            className="flex-1 rounded-lg border border-[#e2e8f0] dark:border-white/10 bg-white dark:bg-[#080f1e] px-3 py-2 text-sm text-[#03045e] dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#0077b6]/20 focus:border-[#0077b6] placeholder:text-[#94a3b8] transition-all resize-none"
          />
          <button
            onClick={postComment}
            disabled={posting || !body.trim()}
            className="self-end p-2.5 rounded-lg bg-[#0077b6] hover:bg-[#023e8a] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            title="Send reply (Cmd+Enter)"
          >
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}

function RequestsContent() {
  const [requests, setRequests] = useState<FeatureRequest[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [clustering, setClustering] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('votes')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null)
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

  useEffect(() => {
    if (!selectedProject) return
    async function loadRequests() {
      setLoading(true)
      const { data } = await supabase
        .from('feature_requests')
        .select('*')
        .eq('project_id', selectedProject)
        .order('vote_count', { ascending: false })
      setRequests(data ?? [])
      setLoading(false)
    }
    loadRequests()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject])

  async function handleDeleteRequest(id: string) {
    setDeletingId(id)
    const res = await fetch(`/api/feature-requests/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setRequests(prev => prev.filter(r => r.id !== id))
      if (expandedId === id) setExpandedId(null)
      toast.success('Request deleted')
    } else {
      toast.error('Failed to delete request')
    }
    setDeletingId(null)
    setConfirmDeleteId(null)
  }

  async function handleUpdateStatus(id: string, status: FeatureRequest['status']) {
    setUpdatingStatusId(id)
    const res = await fetch(`/api/feature-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    } else {
      toast.error('Failed to update status')
    }
    setUpdatingStatusId(null)
  }

  async function handleCluster() {
    // Only cluster requests that haven't been processed yet
    const unclustered = requests.filter(r => r.cluster_id === null && r.status === 'open')
    if (unclustered.length === 0) {
      toast.error('All requests are already clustered')
      return
    }
    const project = projects.find(p => p.id === selectedProject)
    setClustering(true)
    try {
      const res = await fetch('/api/ai/cluster-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: selectedProject,
          project_name: project?.name ?? 'Project',
          requests: unclustered.map(r => ({ id: r.id, title: r.title, description: r.description, vote_count: r.vote_count })),
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Clustering failed') }
      const data = await res.json()
      toast.success(data.message || 'Clusters created!')
      const { data: updated } = await supabase.from('feature_requests').select('*').eq('project_id', selectedProject).order('vote_count', { ascending: false })
      setRequests(updated ?? [])
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Clustering failed')
    } finally {
      setClustering(false)
    }
  }

  const filtered = requests
    .filter(r => statusFilter === 'all' || r.status === statusFilter)
    .sort((a, b) => {
      if (sortOrder === 'votes') return b.vote_count - a.vote_count
      if (sortOrder === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })

  const totalOpen = requests.filter(r => r.status === 'open').length
  const totalClustered = requests.filter(r => r.status !== 'open').length
  const maxVotes = requests.length > 0 ? Math.max(...requests.map(r => r.vote_count), 1) : 1

  const filterTabs: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'open', label: 'Open' },
    { id: 'planned', label: 'Planned' },
    { id: 'done', label: 'Done' },
  ]

  return (
    <div className="min-h-full p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#03045e] dark:text-white" style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}>
            Feature Requests
          </h1>
          {requests.length > 0 && (
            <p className="text-sm text-[#64748b] dark:text-slate-400 mt-1">
              Total: {requests.length} &middot; Open: {totalOpen} &middot; Clustered: {totalClustered}
            </p>
          )}
        </div>
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
            onClick={handleCluster}
            disabled={clustering || requests.filter(r => r.cluster_id === null && r.status === 'open').length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#03045e] hover:bg-[#0077b6] text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={requests.filter(r => r.cluster_id === null && r.status === 'open').length === 0 ? 'No new requests to cluster' : undefined}
          >
            {clustering ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitBranch className="w-4 h-4" />}
            {clustering ? 'Clustering...' : 'Cluster with AI'}
          </button>
        </div>
      </div>

      {/* Vote distribution chart */}
      {!loading && requests.length >= 2 && <DonutChart requests={requests} />}

      {/* Filter / sort bar */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div className="flex gap-0 border-b border-[#e2e8f0] dark:border-white/10">
          {filterTabs.map(t => (
            <button
              key={t.id}
              onClick={() => setStatusFilter(t.id)}
              className={`px-4 py-2 text-sm font-medium transition-all duration-150 border-b-2 -mb-px ${
                statusFilter === t.id ? 'border-[#0077b6] text-[#0077b6]' : 'border-transparent text-[#64748b] dark:text-slate-400 hover:text-[#03045e] dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <select
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value as SortOrder)}
          className="rounded-xl border border-[#e2e8f0] dark:border-white/10 bg-white dark:bg-[#0d1b2e] px-3 py-2 text-sm text-[#03045e] dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#0077b6]/20 focus:border-[#0077b6]"
        >
          <option value="votes">Most Votes</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center gap-2 py-12 justify-center text-[#64748b]">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading requests...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[#0d1b2e] rounded-2xl border border-[#e2e8f0] dark:border-white/8 text-center">
          <Inbox className="w-12 h-12 text-[#94a3b8] mb-4" />
          <h3 className="text-lg font-bold text-[#03045e] dark:text-white mb-1" style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}>
            {requests.length === 0 ? 'No feature requests yet' : 'No matches'}
          </h3>
          <p className="text-sm text-[#64748b] dark:text-slate-400 max-w-xs">
            {requests.length === 0
              ? 'Share your public page link to start collecting feedback from users.'
              : 'Try a different filter.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0d1b2e] rounded-2xl border border-[#e2e8f0] dark:border-white/8 overflow-hidden divide-y divide-[#f1f5f9] dark:divide-white/6">
          {filtered.map((req, idx) => {
            const isExpanded = expandedId === req.id
            return (
              <div key={req.id} className={idx % 2 === 1 ? 'bg-[#fafbfc] dark:bg-white/3' : 'bg-white dark:bg-transparent'}>
                <div className="flex items-start gap-4 px-5 py-4">
                  {/* Vote count */}
                  <div className="flex flex-col items-center flex-shrink-0 min-w-[36px] text-center pt-1">
                    <ChevronUp className="w-4 h-4 text-[#94a3b8]" />
                    <span className="text-lg font-bold text-[#03045e] dark:text-white leading-tight">{req.vote_count}</span>
                  </div>

                  {/* Main content */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : req.id)}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-[15px] text-[#03045e] dark:text-white">{req.title}</h3>
                    </div>
                    {req.description && (
                      <p className="text-sm text-[#64748b] dark:text-slate-400 mt-0.5 truncate">{req.description}</p>
                    )}
                    {/* vote bar */}
                    {req.vote_count > 0 && (
                      <div className="mt-1.5 h-1 rounded-full bg-[#f1f5f9] dark:bg-white/8 overflow-hidden w-full max-w-xs">
                        <div
                          className="h-full rounded-full bg-[#0077b6] transition-all duration-500"
                          style={{ width: `${Math.round((req.vote_count / maxVotes) * 100)}%` }}
                        />
                      </div>
                    )}
                    <span className="text-[11px] text-[#94a3b8] dark:text-slate-500">
                      {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Admin controls */}
                  <div className="flex-shrink-0 flex items-center gap-1.5">
                    {/* Status selector */}
                    <select
                      value={req.status}
                      onChange={e => handleUpdateStatus(req.id, e.target.value as FeatureRequest['status'])}
                      disabled={updatingStatusId === req.id}
                      onClick={e => e.stopPropagation()}
                      className={`rounded-lg border text-[11px] font-semibold px-2 py-1 outline-none focus:ring-2 focus:ring-[#0077b6]/20 transition-all cursor-pointer disabled:opacity-50 ${
                        req.status === 'done'        ? 'bg-[#dcfce7] border-[#bbf7d0] text-[#16a34a]' :
                        req.status === 'planned'     ? 'bg-[#eff8ff] border-[#bae6fd] text-[#0077b6]' :
                        req.status === 'in_progress' ? 'bg-[#fef9c3] border-[#fde68a] text-[#a16207]' :
                        'bg-[#f1f5f9] border-[#e2e8f0] text-[#475569]'
                      }`}
                    >
                      <option value="open">Open</option>
                      <option value="planned">Planned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>

                    {/* Discussion toggle */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : req.id)}
                      className="flex items-center gap-1 p-1.5 rounded-lg text-[#94a3b8] hover:text-[#64748b] hover:bg-[#f1f5f9] dark:hover:bg-white/8 transition-colors"
                      title="View discussion"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {/* Delete */}
                    {confirmDeleteId === req.id ? (
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleDeleteRequest(req.id)}
                          disabled={deletingId === req.id}
                          className="text-[11px] font-bold px-2 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {deletingId === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes, delete'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-[#f1f5f9] dark:bg-white/8 text-[#64748b] dark:text-slate-400 hover:bg-[#e2e8f0] dark:hover:bg-white/15 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={e => { e.stopPropagation(); setConfirmDeleteId(req.id) }}
                        className="p-1.5 rounded-lg text-[#94a3b8] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete request"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded comment thread */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-[#f1f5f9] dark:border-white/6">
                    {req.description && (
                      <p className="text-sm text-[#475569] dark:text-slate-300 mt-3 mb-0 p-3 bg-[#f8faff] dark:bg-white/4 rounded-xl border border-[#e2e8f0] dark:border-white/8">{req.description}</p>
                    )}
                    <AdminCommentThread requestId={req.id} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function RequestsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#64748b]">Loading...</div>}>
      <RequestsContent />
    </Suspense>
  )
}

