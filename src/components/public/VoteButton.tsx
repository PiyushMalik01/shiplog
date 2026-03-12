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
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/feature-requests/${requestId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: voted ? 'remove' : 'add' }),
      })
      const data = await res.json().catch(() => ({} as { vote_count?: number; voted?: boolean }))
      if (res.status === 409) {
        if (typeof data.vote_count === 'number') setCount(data.vote_count)
        setVoted(true)
        localStorage.setItem(`voted_${requestId}`, '1')
        return
      }
      if (!res.ok) throw new Error('Vote failed')

      if (typeof data.voted === 'boolean') {
        setVoted(data.voted)
        if (data.voted) localStorage.setItem(`voted_${requestId}`, '1')
        else localStorage.removeItem(`voted_${requestId}`)
      } else {
        const nextVoted = !voted
        setVoted(nextVoted)
        if (nextVoted) localStorage.setItem(`voted_${requestId}`, '1')
        else localStorage.removeItem(`voted_${requestId}`)
      }

      if (typeof data.vote_count === 'number') {
        setCount(data.vote_count)
      } else {
        setCount(c => Math.max(0, c + (voted ? -1 : 1)))
      }
    } catch {
      toast.error('Failed to update vote')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleVote}
      disabled={loading}
      aria-label="Upvote"
      title={voted ? 'Click to remove vote' : 'Upvote this request'}
      className={`flex flex-col items-center px-3 py-2.5 rounded-xl border transition-all duration-150 min-w-[56px] ${
        voted
          ? 'bg-[#eff8ff] border-[#0077b6] text-[#0077b6]'
          : 'bg-white border-[#e2e8f0] text-[#64748b] hover:border-[#0077b6] hover:text-[#0077b6] hover:bg-[#f8fbff] active:scale-95'
      }`}
    >
      {loading
        ? <Loader2 className="w-4 h-4 animate-spin" />
        : <ChevronUp className={`w-4 h-4 transition-transform ${!voted ? 'group-hover:-translate-y-0.5' : ''}`} />
      }
      <span className="text-base font-bold leading-tight">{count}</span>
      <span className="text-[9px] font-semibold uppercase tracking-wide mt-0.5 leading-none">
        {voted ? 'Unvote' : 'Vote'}
      </span>
    </button>
  )
}
