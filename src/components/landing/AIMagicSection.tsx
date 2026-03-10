'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Zap } from 'lucide-react'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
}
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}
const lineVariant = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

const beforeLines = [
  'fix login bug #auth',
  'add dark mode toggle',
  'refactor db layer - 3x faster',
  'rate limit api endpoints',
  'fix typo in onboarding email',
  'add csv export feature',
  'update deps',
]

const afterEntries = [
  { type: 'new', label: 'NEW', color: 'bg-[#caf0f8] text-[#0077b6]', item: 'CSV export now available in your dashboard' },
  { type: 'improved', label: 'IMPROVED', color: 'bg-[#90e0ef]/40 text-[#03045e]', item: 'Dark mode available in Settings' },
  { type: 'improved', label: 'IMPROVED', color: 'bg-[#90e0ef]/40 text-[#03045e]', item: 'App loads 3× faster with new DB layer' },
  { type: 'fixed', label: 'FIXED', color: 'bg-red-50 text-red-500', item: 'OAuth login issue resolved' },
  { type: 'fixed', label: 'FIXED', color: 'bg-red-50 text-red-500', item: 'Onboarding typo fixed' },
]

export default function AIMagicSection() {
  const ref = useRef(null)
  const cardRef = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const cardInView = useInView(cardRef, { once: true, margin: '-80px' })

  return (
    <section className="section bg-[#e0f7ff]" id="ai-magic">
      <div className="container">
        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-14"
        >
          <motion.span variants={fadeInUp} className="badge badge-new mb-4">AI Magic</motion.span>
          <motion.h2 variants={fadeInUp} className="section-title mt-2">Raw notes in. Polished updates out.</motion.h2>
          <motion.p variants={fadeInUp} className="section-sub mx-auto mt-4">
            Paste your raw commits. ShipLog&apos;s AI does the rest.
          </motion.p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          {/* Before terminal */}
          <div className="flex-1">
            <span className="badge badge-fixed mb-3 inline-block">BEFORE</span>
            <div className="bg-[#03045e] rounded-2xl p-6 font-mono text-sm h-full">
              {/* Terminal chrome */}
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                <span className="ml-3 text-[#90e0ef] text-xs opacity-70">raw-commits.txt</span>
              </div>
              <div className="space-y-2">
                {beforeLines.map((line) => (
                  <div key={line} className="text-[#90e0ef] flex gap-2">
                    <span className="text-[#0077b6] select-none">$</span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Divider with lightning bolt */}
          <div className="hidden md:flex flex-col items-center justify-center gap-3 px-2">
            <div className="w-px h-full bg-[#caf0f8]" />
            <span className="pulse-glow rounded-full bg-white border border-[#caf0f8] p-2 shadow-md flex items-center justify-center">
              <Zap size={20} className="text-[#0077b6]" fill="#0077b6" />
            </span>
            <div className="w-px h-full bg-[#caf0f8]" />
          </div>

          {/* After card */}
          <div className="flex-1">
            <span className="badge badge-done mb-3 inline-block">AFTER</span>
            <motion.div
              ref={cardRef}
              variants={staggerContainer}
              initial="hidden"
              animate={cardInView ? 'visible' : 'hidden'}
              className="bg-white/80 backdrop-blur-xl border border-[#caf0f8] rounded-2xl p-6 shadow-2xl h-full"
            >
              {/* Header */}
              <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-5 pb-4 border-b border-[#caf0f8]">
                <span className="w-2 h-2 rounded-full bg-[#0077b6] inline-block" />
                <span className="badge badge-new text-xs">v2.4.0</span>
                <span className="text-xs text-[#64748b] ml-auto">March 10, 2026</span>
              </motion.div>

              {/* Entries */}
              <div className="space-y-3">
                {afterEntries.map((entry) => (
                  <motion.div key={entry.item} variants={lineVariant} className="flex items-start gap-3">
                    <span className={`badge text-[10px] shrink-0 mt-0.5 ${entry.color}`}>{entry.label}</span>
                    <span className="text-sm text-[#03045e] leading-snug">{entry.item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
