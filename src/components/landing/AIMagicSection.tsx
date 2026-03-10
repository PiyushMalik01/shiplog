'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Zap, Loader2, MousePointerClick, X, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
}
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}
const lineVariant = {
  hidden: { opacity: 0, x: 12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

const DEFAULT_NOTES = `fix login bug #auth
add dark mode toggle
refactor db layer - 3x faster
rate limit api endpoints
fix typo in onboarding email
add csv export feature
update deps`

type DemoResult = { title: string; new: string[]; improved: string[]; fixed: string[] }

const DEFAULT_RESULT: DemoResult = {
  title: 'v2.4.0 – Quality & Features',
  new: ['CSV export now available in your dashboard'],
  improved: ['Dark mode available in Settings', 'App loads 3× faster with new database layer'],
  fixed: ['OAuth login issue resolved', 'Onboarding email typo corrected'],
}

export default function AIMagicSection() {
  const titleRef = useRef(null)
  const sectionRef = useRef<HTMLElement>(null)
  const isTitleInView = useInView(titleRef, { once: true, margin: '-80px' })
  const isSectionInView = useInView(sectionRef, { once: true, margin: '-120px' })

  const router = useRouter()
  const supabase = createClient()

  const [notes, setNotes] = useState(DEFAULT_NOTES)
  const [result, setResult] = useState<DemoResult>(DEFAULT_RESULT)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showGuide, setShowGuide] = useState(false)
  const [demoUsed, setDemoUsed] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Check auth state once on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Show the guide the first time the section enters viewport
  useEffect(() => {
    if (isSectionInView) {
      const t = setTimeout(() => setShowGuide(true), 400)
      return () => clearTimeout(t)
    }
  }, [isSectionInView])

  async function handleGenerate() {
    if (!notes.trim() || loading) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai/demo-changelog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_input: notes }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to generate')
      setResult(data)
      setDemoUsed(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleBoltClick() {
    if (demoUsed) {
      router.push(isLoggedIn ? '/dashboard' : '/signup')
    } else {
      handleGenerate()
    }
  }

  const entries = [
    ...(result.new     || []).map(item => ({ key: `new-${item}`,      label: 'NEW',      color: 'bg-[#caf0f8] text-[#0077b6]',       item })),
    ...(result.improved|| []).map(item => ({ key: `imp-${item}`,      label: 'IMPROVED', color: 'bg-[#90e0ef]/40 text-[#03045e]',    item })),
    ...(result.fixed   || []).map(item => ({ key: `fix-${item}`,      label: 'FIXED',    color: 'bg-red-50 text-red-500',             item })),
  ]

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <section ref={sectionRef} className="section bg-[#e0f7ff] relative" id="ai-magic">
      <div className="container">
        <motion.div
          ref={titleRef}
          variants={staggerContainer}
          initial="hidden"
          animate={isTitleInView ? 'visible' : 'hidden'}
          className="text-center mb-14"
        >
          <motion.span variants={fadeInUp} className="badge badge-new mb-4">AI Magic — Try It Live</motion.span>
          <motion.h2 variants={fadeInUp} className="section-title mt-2">Raw notes in. Polished updates out.</motion.h2>
          <motion.p variants={fadeInUp} className="section-sub mx-auto mt-4">
            Edit the notes on the left, hit the bolt button, and watch ShipLog&apos;s AI turn them into a real changelog.
          </motion.p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6 items-stretch">

          {/* Left — editable terminal */}
          <div className="flex-1 flex flex-col">
            <span className="badge badge-fixed mb-3 inline-block">YOUR NOTES</span>
            <div className="bg-[#03045e] rounded-2xl p-6 font-mono text-sm flex-1 flex flex-col">
              {/* Terminal chrome */}
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                <span className="ml-3 text-[#90e0ef] text-xs opacity-70">raw-commits.txt — editable</span>
              </div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                spellCheck={false}
                rows={9}
                maxLength={1000}
                className="flex-1 bg-transparent text-[#90e0ef] font-mono text-sm resize-none outline-none w-full placeholder:text-[#90e0ef]/40 leading-relaxed"
                placeholder="Paste your raw commits or notes here…"
              />
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-[#0077b6]/50 text-xs shrink-0">{notes.length}/1000</span>
                <div className="flex items-center gap-2">
                  {!demoUsed && (
                    <button
                      onClick={() => { setNotes(DEFAULT_NOTES); setResult(DEFAULT_RESULT); setError('') }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#0077b6]/30 text-[#90e0ef]/70 hover:text-[#90e0ef] hover:border-[#0077b6]/60 text-xs font-medium transition-colors"
                    >
                      Reset
                    </button>
                  )}
                  {/* Mobile generate / CTA button */}
                  <button
                    onClick={handleBoltClick}
                    disabled={loading || (!demoUsed && !notes.trim())}
                    className="md:hidden inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-white text-xs font-semibold disabled:opacity-50 transition-all"
                    style={{ background: demoUsed ? 'linear-gradient(135deg,#03045e,#0077b6)' : '#0077b6' }}
                  >
                    {loading
                      ? <><Loader2 size={13} className="animate-spin" /> Generating…</>
                      : demoUsed
                        ? <><Lock size={13} /> {isLoggedIn ? 'Go to Dashboard →' : 'Sign up free →'}</>
                        : <><Zap size={13} fill="currentColor" /> Generate</>
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Divider — clickable bolt on desktop */}
          <div className="hidden md:flex flex-col items-center justify-center gap-3 px-2">
            <div className="w-px flex-1 bg-[#caf0f8]" />
            <button
              onClick={handleBoltClick}
              disabled={loading || (!demoUsed && !notes.trim())}
              title={demoUsed ? (isLoggedIn ? 'Go to Dashboard' : 'Sign up free') : 'Generate changelog'}
              className={`rounded-full p-3 shadow-md flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${
                demoUsed
                  ? 'bg-[#03045e] border border-[#0077b6] hover:bg-[#0077b6] hover:scale-110'
                  : 'pulse-glow bg-white border border-[#caf0f8] hover:bg-[#e0f7ff] hover:border-[#0077b6] hover:scale-110'
              }`}
            >
              {loading
                ? <Loader2 size={20} className="text-[#0077b6] animate-spin" />
                : demoUsed
                  ? <Lock size={20} className="text-white" />
                  : <Zap size={20} className="text-[#0077b6]" fill="#0077b6" />
              }
            </button>
            {demoUsed && (
              <span className="text-[9px] text-[#0077b6] font-semibold text-center leading-tight max-w-[48px]">
                {isLoggedIn ? 'Dashboard' : 'Sign up'}
              </span>
            )}
            <div className="w-px flex-1 bg-[#caf0f8]" />
          </div>

          {/* Right — changelog result */}
          <div className="flex-1 flex flex-col">
            <span className="badge badge-done mb-3 inline-block">CHANGELOG</span>
            <div className="bg-white/80 backdrop-blur-xl border border-[#caf0f8] rounded-2xl p-6 shadow-2xl flex-1">
              {/* Header */}
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#caf0f8]">
                <span className="w-2 h-2 rounded-full bg-[#0077b6] inline-block" />
                <span className="badge badge-new text-xs truncate max-w-[180px]">{result.title}</span>
                <span className="text-xs text-[#64748b] ml-auto whitespace-nowrap">{today}</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={JSON.stringify(entries)}
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  {entries.map(entry => (
                    <motion.div key={entry.key} variants={lineVariant} className="flex items-start gap-3">
                      <span className={`badge text-[10px] shrink-0 mt-0.5 ${entry.color}`}>{entry.label}</span>
                      <span className="text-sm text-[#03045e] leading-snug select-none">{entry.item}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {error && <p className="mt-4 text-xs text-red-500">{error}</p>}

              {/* Post-demo CTA */}
              <AnimatePresence>
                {demoUsed && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="mt-5 pt-5 border-t border-[#caf0f8] flex flex-col gap-2"
                  >
                    <p className="text-xs text-[#64748b] text-center">Want to generate real changelogs for your project?</p>
                    <button
                      onClick={() => router.push(isLoggedIn ? '/dashboard' : '/signup')}
                      className="w-full rounded-xl py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                      style={{ background: 'linear-gradient(135deg, #03045e 0%, #0077b6 100%)' }}
                    >
                      {isLoggedIn ? 'Go to Dashboard →' : 'Start for free →'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>

      {/* Cute guide tip — floats above the card row */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 bg-[#03045e] text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg border border-[#0077b6]/40 whitespace-nowrap"
          >
            <MousePointerClick size={13} className="text-[#48cae4] shrink-0" />
            <span>Edit the notes &amp; hit <Zap size={11} className="inline text-[#48cae4]" fill="currentColor" /> to generate your changelog</span>
            <button onClick={() => setShowGuide(false)} className="ml-1 text-white/50 hover:text-white transition-colors">
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
