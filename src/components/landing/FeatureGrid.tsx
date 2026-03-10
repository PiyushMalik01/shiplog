'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Wand2, Globe, ThumbsUp, GitBranch, LayoutDashboard, Sparkles } from 'lucide-react'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
}
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const features = [
  {
    icon: Wand2,
    accent: '#0077b6',
    title: 'AI Changelog Writer',
    body: 'Paste raw commits. Get polished entries split into New, Improved, and Fixed — in under 10 seconds. Your users finally understand what changed.',
  },
  {
    icon: Globe,
    accent: '#00b4d8',
    title: 'Public Changelog Pages',
    body: 'Every project gets a live public URL like /your-product. Your users see your latest updates and roadmap — beautifully formatted, always current.',
  },
  {
    icon: ThumbsUp,
    accent: '#03045e',
    title: 'Feature Voting Board',
    body: 'Let users submit and upvote feature requests directly on your public page. No more guessing what people want.',
  },
  {
    icon: GitBranch,
    accent: '#0077b6',
    title: 'AI Feature Clustering',
    body: 'AI groups hundreds of similar feature requests into clean themes ranked by demand. Turn user chaos into a clear build list.',
  },
  {
    icon: LayoutDashboard,
    accent: '#00b4d8',
    title: 'Kanban Roadmap',
    body: 'Drag and drop roadmap items across Planned, In Progress, and Done. Your users see your roadmap in real time.',
  },
  {
    icon: Sparkles,
    accent: '#03045e',
    title: 'Smart Priority Ordering',
    body: 'AI analyzes vote patterns and suggests which roadmap items to tackle first. Build what matters most, always.',
  },
]

export default function FeatureGrid() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="section" id="features">
      <div className="container">
        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <motion.div variants={fadeInUp} className="text-center mb-14">
            <span className="badge badge-in-progress mb-4">Features</span>
            <h2 className="section-title mt-2">Built for makers who care about users</h2>
            <p className="section-sub mx-auto mt-4">One platform for changelogs, feature requests, and roadmaps.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeInUp}
                className="card-glass p-6 group transition-all duration-200"
                style={{ borderTop: `2px solid ${f.accent}30` }}
                onMouseEnter={e => (e.currentTarget.style.borderTopColor = f.accent)}
                onMouseLeave={e => (e.currentTarget.style.borderTopColor = `${f.accent}30`)}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${f.accent}18` }}
                >
                  <f.icon size={20} style={{ color: f.accent }} />
                </div>
                <h3
                  className="text-lg font-bold text-[#03045e] mb-2"
                  style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
                >
                  {f.title}
                </h3>
                <p className="text-sm text-[#64748b] leading-relaxed">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
