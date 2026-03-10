'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, MessageSquare, Send, Loader2, Trash2 } from 'lucide-react'
import { VoteButton } from './VoteButton'
import toast from 'react-hot-toast'
import type { FeatureRequest, Comment } from '@/types'

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  open:        { bg: 'bg-[#f1f5f9]', text: 'text-[#475569]',  label: 'Open' },
  planned:     { bg: 'bg-[#eff8ff]', text: 'text-[#0077b6]',  label: 'Planned' },
  in_progress: { bg: 'bg-[#fef9c3]', text: 'text-[#a16207]',  label: 'In Progress' },
  done:        { bg: 'bg-[#dcfce7]', text: 'text-[#16a34a]',  label: 'Done' },
}

function PublicCommentThread({ requestId }: { requestId: string }) {
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
    try {
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
    } catch {
      toast.error('Failed to post comment')
    }
    setPosting(false)
  }

  if (loading) {
    return <div className="py-4 text-xs text-[#94a3b8]">Loading comments...</div>
  }

  return (
    <div className="mt-4 pt-4 border-t border-[#f1f5f9]">
      {/* Comment list */}
      {comments.length > 0 ? (
        <div className="space-y-4 mb-5">
          {comments.map(c => (
            <div key={c.id} className="flex gap-3">
              <div
                className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold ${
                  c.is_admin
                    ? 'bg-[#03045e] text-white'
                    : 'bg-[#e0f4fb] text-[#0077b6]'
                }`}
              >
                {c.is_admin ? 'A' : (c.author_name ?? 'A')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-semibold text-[#03045e]">
                    {c.is_admin ? 'Admin' : (c.author_name ?? 'Anonymous')}
                  </span>
                  {c.is_admin && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#03045e] text-white uppercase tracking-wider">
                      Team
                    </span>
                  )}
                  <span className="text-[11px] text-[#94a3b8]">
                    {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <p className={`text-[13px] mt-1 leading-relaxed ${c.is_admin ? 'text-[#0f172a] font-medium' : 'text-[#475569]'}`}>
                  {c.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[12px] text-[#94a3b8] mb-4">No comments yet. Start the conversation.</p>
      )}

      {/* Post comment form */}
      <div className="rounded-xl border border-[#e2e8f0] bg-[#fafbfc] p-3 space-y-2">
        <input
          type="text"
          value={authorName}
          onChange={e => setAuthorName(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-[13px] text-[#03045e] outline-none focus:ring-2 focus:ring-[#0077b6]/20 focus:border-[#0077b6] placeholder:text-[#94a3b8] transition-all"
        />
        <div className="flex gap-2">
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={2}
            placeholder="Write a comment..."
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) postComment() }}
            className="flex-1 rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-[13px] text-[#03045e] outline-none focus:ring-2 focus:ring-[#0077b6]/20 focus:border-[#0077b6] placeholder:text-[#94a3b8] transition-all resize-none"
          />
          <button
            onClick={postComment}
            disabled={posting || !body.trim()}
            className="self-end p-2.5 rounded-lg bg-[#0077b6] hover:bg-[#023e8a] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            title="Post comment (Cmd+Enter)"
          >
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}

export function PublicRequestItem({ req }: { req: FeatureRequest }) {
  const [expanded, setExpanded] = useState(false)
  const statusStyle = STATUS_STYLES[req.status] ?? STATUS_STYLES.open

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] hover:shadow-sm transition-shadow overflow-hidden">
      {/* Main row */}
      <div className="flex items-start gap-4 px-4 py-3.5">
        <VoteButton requestId={req.id} initialCount={req.vote_count} />
        <div className="flex-1 min-w-0 py-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-[14px] text-[#03045e]">{req.title}</h3>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${statusStyle.bg} ${statusStyle.text}`}>
              {statusStyle.label}
            </span>
          </div>
          {req.description && (
            <p className="text-[12px] text-[#64748b] mt-0.5 line-clamp-2">{req.description}</p>
          )}
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1.5 flex-shrink-0 mt-1 px-2.5 py-1.5 rounded-lg text-[#94a3b8] hover:text-[#64748b] hover:bg-[#f1f5f9] transition-colors text-[12px] font-medium"
          aria-label={expanded ? 'Collapse discussion' : 'View discussion'}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          {!expanded && <ChevronDown className="w-3.5 h-3.5" />}
          {expanded && <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expandable thread */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-[#f8fafc]">
          <PublicCommentThread requestId={req.id} />
        </div>
      )}
    </div>
  )
}
