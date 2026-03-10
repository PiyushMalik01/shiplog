'use client'

import { useState } from 'react'
import { ChevronUp, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function VoteButton({ requestId, initialCount }: { requestId: string; initialCount: number }) {
  const [count, setCount] = useState(initialCount)
  const [voted, setVoted] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(`voted_${requestId}`) === '1'
  })
  const [loading, setLoading] = useState(false)

  async function handleVote() {
    if (voted || loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/feature-requests/${requestId}/vote`, { method: 'POST' })
      if (res.status === 409) { setVoted(true); localStorage.setItem(`voted_${requestId}`, '1'); return }
      if (!res.ok) throw new Error('Vote failed')
      setCount(c => c + 1)
      setVoted(true)
      localStorage.setItem(`voted_${requestId}`, '1')
    } catch {
      toast.error('Failed to vote')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleVote}
      disabled={voted || loading}
      aria-label="Upvote"
      title={voted ? 'Already voted' : 'Upvote this request'}
      className={`flex flex-col items-center px-3 py-2.5 rounded-xl border transition-all duration-150 min-w-[56px] ${
        voted
          ? 'bg-[#eff8ff] border-[#0077b6] text-[#0077b6] cursor-default'
          : 'bg-white border-[#e2e8f0] text-[#64748b] hover:border-[#0077b6] hover:text-[#0077b6] hover:bg-[#f8fbff] active:scale-95'
      }`}
    >
      {loading
        ? <Loader2 className="w-4 h-4 animate-spin" />
        : <ChevronUp className={`w-4 h-4 transition-transform ${!voted ? 'group-hover:-translate-y-0.5' : ''}`} />
      }
      <span className="text-base font-bold leading-tight">{count}</span>
      <span className="text-[9px] font-semibold uppercase tracking-wide mt-0.5 leading-none">
        {voted ? 'Voted' : 'Vote'}
      </span>
    </button>
  )
}
