'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Check, X, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewProjectPage() {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [checkingSlug, setCheckingSlug] = useState(false)
  const [slugError, setSlugError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  function handleNameChange(value: string) {
    setName(value)
    const generated = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    setSlug(generated)
  }

  const checkSlug = useCallback(async (s: string) => {
    if (!s || s.length < 2) { setSlugAvailable(null); return }
    setCheckingSlug(true)
    const { data } = await supabase.from('projects').select('id').eq('slug', s).maybeSingle()
    setSlugAvailable(!data)
    setCheckingSlug(false)
  }, [supabase])

  useEffect(() => {
    const timer = setTimeout(() => checkSlug(slug), 400)
    return () => clearTimeout(timer)
  }, [slug, checkSlug])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (slugAvailable === false) { setSlugError('This slug is already taken.'); return }
    setSlugError('')
    setLoading(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, description, is_public: isPublic }),
      })
      if (!res.ok) {
        const data = await res.json()
        if (data.error?.includes('slug')) { setSlugError(data.error); return }
        throw new Error(data.error || 'Failed to create project')
      }
      toast.success('Project created!')
      router.push('/dashboard')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (hasError?: boolean) =>
    `w-full rounded-xl border px-4 py-2.5 text-sm text-[#03045e] dark:text-slate-100 bg-white dark:bg-[#080f1e] outline-none transition-all duration-150 placeholder:text-[#94a3b8] focus:ring-2 focus:ring-[#0077b6]/20 ${
      hasError ? 'border-red-400' : 'border-[#e2e8f0] dark:border-white/10 focus:border-[#0077b6]'
    }`

  return (
    <div className="min-h-full p-6 md:p-8">
      {/* Breadcrumb */}
      <p className="text-[11px] font-semibold text-[#64748b] dark:text-slate-400 uppercase tracking-widest mb-6">
        Dashboard / Projects / New
      </p>

      <div className="max-w-[560px]">
        <h1
          className="text-[28px] font-bold text-[#03045e] dark:text-white leading-tight mb-1"
          style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
        >
          Create a new project
        </h1>
        <p className="text-[#64748b] dark:text-slate-400 text-sm mb-8">
          Your project gets a public changelog page at{' '}
          <span className="font-mono text-[#0077b6]">shiplog.app/your-slug</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div>
            <label htmlFor="name" className="block text-[13px] font-semibold text-[#03045e] dark:text-slate-200 mb-1.5">
              Project name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              className={inputClass()}
              placeholder="My SaaS App"
              minLength={2}
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-[13px] font-semibold text-[#03045e] dark:text-slate-200 mb-1.5">
              Public URL slug
            </label>
            <div className="flex items-stretch rounded-xl border border-[#e2e8f0] dark:border-white/10 bg-white dark:bg-[#080f1e] overflow-hidden focus-within:border-[#0077b6] focus-within:ring-2 focus-within:ring-[#0077b6]/20 transition-all duration-150">
              <span className="flex items-center px-3 text-sm text-[#94a3b8] bg-[#f8fafc] dark:bg-white/4 border-r border-[#e2e8f0] dark:border-white/10 select-none whitespace-nowrap">
                shiplog.app/
              </span>
              <input
                id="slug"
                type="text"
                required
                value={slug}
                onChange={e => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setSlugError('') }}
                className="flex-1 px-3 py-2.5 text-sm text-[#03045e] dark:text-slate-100 bg-white dark:bg-[#080f1e] outline-none placeholder:text-[#94a3b8]"
                placeholder="my-saas-app"
                minLength={2}
              />
              <div className="flex items-center pr-3">
                {checkingSlug && <Loader className="w-4 h-4 text-[#94a3b8] animate-spin" />}
                {!checkingSlug && slugAvailable === true && slug.length >= 2 && (
                  <span className="flex items-center gap-1 text-[#16a34a] text-xs font-semibold">
                    <Check className="w-4 h-4" /> Available
                  </span>
                )}
                {!checkingSlug && (slugAvailable === false || slugError) && (
                  <span className="flex items-center gap-1 text-red-500 text-xs font-semibold">
                    <X className="w-4 h-4" /> Taken
                  </span>
                )}
              </div>
            </div>
            {slugError && <p className="mt-1.5 text-xs text-red-600">{slugError}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-[13px] font-semibold text-[#03045e] dark:text-slate-200 mb-1.5">
              Description{' '}
              <span className="text-[#94a3b8] font-normal">(optional)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className={inputClass()}
              placeholder="What does your product do in one sentence?"
            />
          </div>

          {/* Visibility toggle */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-[#e2e8f0] dark:border-white/10 bg-white dark:bg-[#0d1b2e]">
            <div>
              <p className="text-[13px] font-semibold text-[#03045e] dark:text-white">Public changelog page</p>
              <p className="text-xs text-[#64748b] dark:text-slate-400 mt-0.5">
                Anyone with the link can view your changelog and submit feature requests.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isPublic}
              onClick={() => setIsPublic(v => !v)}
              className={`relative flex-shrink-0 mt-0.5 w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0077b6]/40 ${
                isPublic ? 'bg-[#0077b6]' : 'bg-[#e2e8f0] dark:bg-white/15'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  isPublic ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={loading || slugAvailable === false}
              className="w-full rounded-xl bg-[#0077b6] hover:bg-[#023e8a] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 text-sm transition-colors duration-150 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Project'}
            </button>
            <div className="text-center">
              <Link href="/dashboard" className="text-sm text-[#64748b] hover:text-[#03045e] transition-colors no-underline">
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
