'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
}
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const problems = [
  {
    num: '01',
    accent: '#e55353',
    title: 'Your dev notes are a mess',
    body: 'Commits like `fix auth bug`, `refactor db`, `add dark mode` mean nothing to your users. But rewriting them takes time you don\'t have.',
  },
  {
    num: '02',
    accent: '#e07b00',
    title: 'Users have no idea what changed',
    body: 'Your product improves every week but your users have no idea. No changelog = no trust. No trust = no retention.',
  },
  {
    num: '03',
    accent: '#7b5ea7',
    title: 'Feature requests go nowhere',
    body: 'Twitter DMs, emails, random Slack messages. You have 50 feature requests and no idea which ones actually matter to the most people.',
  },
]

export default function ProblemSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="section relative overflow-hidden bg-[#e0f7ff]" id="problem">
      {/* Top fade continuing from hero */}
      <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none" style={{ background: 'linear-gradient(to bottom, #e0f7ff 0%, transparent 100%)' }} />
      <div className="container relative z-[45]">
        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <span className="badge badge-fixed mb-4">The Problem</span>
            <h2 className="section-title mt-2">You're building in silence.</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {problems.map((p) => (
              <motion.div
                key={p.title}
                variants={fadeInUp}
                className="relative bg-[#03045e] rounded-2xl p-8 text-white overflow-hidden group hover:-translate-y-1 transition-all duration-200"
                style={{ borderLeft: `3px solid ${p.accent}` }}
              >
                {/* subtle glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0077b6]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                <div className="relative z-10">
                  <span
                    className="inline-block text-xs font-bold tracking-widest mb-4 px-2 py-0.5 rounded"
                    style={{ color: p.accent, background: `${p.accent}18` }}
                  >
                    {p.num}
                  </span>
                  <h3
                    className="text-xl font-bold text-white mb-3"
                    style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
                  >
                    {p.title}
                  </h3>
                  <p className="text-[#90e0ef] text-sm leading-relaxed">{p.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
