'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Inbox, GitBranch, Loader2, ChevronDown, ChevronUp, MessageSquare, Send } from 'lucide-react'
import type { FeatureRequest, Project, Comment } from '@/types'

type StatusFilter = 'all' | 'open' | 'planned' | 'done'
type SortOrder = 'votes' | 'newest' | 'oldest'

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  open:        { bg: 'bg-[#f1f5f9]',   text: 'text-[#475569]',  label: 'Open' },
  planned:     { bg: 'bg-[#eff8ff]',   text: 'text-[#0077b6]',  label: 'Planned' },
  in_progress: { bg: 'bg-[#fef9c3]',   text: 'text-[#a16207]',  label: 'In Progress' },
  done:        { bg: 'bg-[#dcfce7]',   text: 'text-[#16a34a]',  label: 'Done' },
}

function CommentThread({ requestId }: { requestId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [posting, setPosting] = useState(false)

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
      body: JSON.stringify({ body: body.trim(), author_name: authorName.trim() || 'Anonymous' }),
    })
    if (res.ok) {
      const data = await res.json()
      setComments(prev => [...prev, data])
      setBody('')
      toast.success('Comment posted')
    } else {
      toast.error('Failed to post comment')
    }
    setPosting(false)
  }

  if (loading) return <div className="py-3 text-xs text-[#94a3b8]">Loading comments...</div>

  return (
    <div className="mt-4 pt-4 border-t border-[#e2e8f0]">
      {comments.length > 0 ? (
        <div className="space-y-3 mb-4">
          {comments.map(c => (
            <div key={c.id} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[#e0f4fb] flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-[#0077b6]">
                {(c.author_name ?? 'A')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-[#03045e]">{c.author_name ?? 'Anonymous'}</span>
                  <span className="text-[11px] text-[#94a3b8]">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-[#475569] mt-0.5">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[#94a3b8] mb-4">No comments yet.</p>
      )}
      <div className="flex items-start gap-2">
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={authorName}
            onChange={e => setAuthorName(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#03045e] outline-none focus:ring-2 focus:ring-[#0077b6]/20 focus:border-[#0077b6] placeholder:text-[#94a3b8] transition-all"
          />
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={2}
            placeholder="Write a comment..."
            className="w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#03045e] outline-none focus:ring-2 focus:ring-[#0077b6]/20 focus:border-[#0077b6] placeholder:text-[#94a3b8] transition-all resize-none"
          />
        </div>
        <button
          onClick={postComment}
          disabled={posting || !body.trim()}
          className="mt-8 p-2.5 rounded-lg bg-[#0077b6] hover:bg-[#023e8a] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
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
          <h1 className="text-2xl font-bold text-[#03045e]" style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}>
            Feature Requests
          </h1>
          {requests.length > 0 && (
            <p className="text-sm text-[#64748b] mt-1">
              Total: {requests.length} &middot; Open: {totalOpen} &middot; Clustered: {totalClustered}
            </p>
          )}
        </div>
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

      {/* Filter / sort bar */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div className="flex gap-0 border-b border-[#e2e8f0]">
          {filterTabs.map(t => (
            <button
              key={t.id}
              onClick={() => setStatusFilter(t.id)}
              className={`px-4 py-2 text-sm font-medium transition-all duration-150 border-b-2 -mb-px ${
                statusFilter === t.id ? 'border-[#0077b6] text-[#0077b6]' : 'border-transparent text-[#64748b] hover:text-[#03045e]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <select
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value as SortOrder)}
          className="rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#03045e] outline-none focus:ring-2 focus:ring-[#0077b6]/20 focus:border-[#0077b6]"
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
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-[#e2e8f0] text-center">
          <Inbox className="w-12 h-12 text-[#94a3b8] mb-4" />
          <h3 className="text-lg font-bold text-[#03045e] mb-1" style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}>
            {requests.length === 0 ? 'No feature requests yet' : 'No matches'}
          </h3>
          <p className="text-sm text-[#64748b] max-w-xs">
            {requests.length === 0
              ? 'Share your public page link to start collecting feedback from users.'
              : 'Try a different filter.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden divide-y divide-[#f1f5f9]">
          {filtered.map((req, idx) => {
            const isExpanded = expandedId === req.id
            const statusStyle = STATUS_STYLES[req.status] ?? STATUS_STYLES.open
            return (
              <div key={req.id} className={idx % 2 === 1 ? 'bg-[#fafbfc]' : 'bg-white'}>
                <div
                  className="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-[#f8fafc] transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : req.id)}
                >
                  {/* Vote count */}
                  <div className="flex flex-col items-center flex-shrink-0 min-w-[36px] text-center">
                    <ChevronUp className="w-4 h-4 text-[#94a3b8]" />
                    <span className="text-lg font-bold text-[#03045e] leading-tight">{req.vote_count}</span>
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-[15px] text-[#03045e]">{req.title}</h3>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${statusStyle.bg} ${statusStyle.text}`}>
                        {statusStyle.label}
                      </span>
                    </div>
                    {req.description && (
                      <p className="text-sm text-[#64748b] mt-0.5 truncate">{req.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] text-[#94a3b8]">
                        {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Expand indicator */}
                  <div className="flex-shrink-0 flex items-center gap-2 text-[#94a3b8]">
                    <MessageSquare className="w-4 h-4" />
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expanded comment thread */}
                {isExpanded && (
                  <div className="px-5 pb-4">
                    {req.description && (
                      <p className="text-sm text-[#475569] mb-3 p-3 bg-[#f8faff] rounded-lg border border-[#e2e8f0]">{req.description}</p>
                    )}
                    <CommentThread requestId={req.id} />
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

