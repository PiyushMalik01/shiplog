'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const inputCls = 'w-full rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 text-sm text-[#03045e] outline-none focus:ring-2 focus:ring-[#0077b6]/20 focus:border-[#0077b6] transition-all placeholder:text-[#94a3b8]'

export function FeatureRequestForm({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/feature-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, title, description, submitter_email: email || null }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Submission failed')
      }
      setSubmitted(true)
      router.refresh() // re-run server component so the new request appears in the list
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
      toast.error('Submission failed')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-8 bg-[#f0fdf4] rounded-xl border border-[#bbf7d0] text-center">
        <div className="w-10 h-10 rounded-full bg-[#16a34a] flex items-center justify-center mb-3">
          <Check className="w-5 h-5 text-white" />
        </div>
        <p className="text-[#16a34a] font-semibold text-sm">Request submitted — thanks!</p>
        <button
          onClick={() => { setSubmitted(false); setTitle(''); setDescription(''); setEmail('') }}
          className="mt-2 text-xs text-[#16a34a] hover:underline"
        >
          Submit another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
      )}
      <input
        type="text"
        required
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="What feature would help you most?"
        className={inputCls}
      />
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Tell us more... (optional)"
        rows={2}
        className={`${inputCls} resize-none`}
      />
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Notify me when this ships (optional)"
        className={inputCls}
      />
      <button
        type="submit"
        disabled={loading || !title.trim()}
        className="w-full sm:w-auto rounded-xl bg-[#0077b6] hover:bg-[#023e8a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 text-sm transition-colors flex items-center justify-center gap-2"
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Request'}
      </button>
    </form>
  )
}
