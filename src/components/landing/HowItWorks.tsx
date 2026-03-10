'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FileText, Sparkles, Globe } from 'lucide-react'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
}
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const steps = [
  {
    num: '01',
    icon: FileText,
    iconColor: '#0077b6',
    title: 'Paste your raw notes',
    body: "Dump your commits, bullet points, or dev notes. Don't clean them up — that's our job.",
  },
  {
    num: '02',
    icon: Sparkles,
    iconColor: '#00b4d8',
    title: 'AI writes it for you',
    body: 'GPT-4o reads your chaos and writes polished, categorized changelog entries your users will actually understand.',
  },
  {
    num: '03',
    icon: Globe,
    iconColor: '#03045e',
    title: 'Publish in one click',
    body: 'Your users see a beautiful changelog at yourproduct.shiplog.app — instantly.',
  },
]

export default function HowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="section" id="how-it-works">
      <div className="container">
        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <motion.div variants={fadeInUp} className="text-center mb-14">
            <span className="badge badge-improved mb-4">How It Works</span>
            <h2 className="section-title mt-2">Three steps, zero confusion</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <motion.div
                key={step.num}
                variants={fadeInUp}
                className="card-glass relative p-8 overflow-hidden group"
              >
                {/* Giant watermark number */}
                <span
                  className="absolute -top-4 -right-2 text-[120px] font-bold text-[#caf0f8] leading-none select-none pointer-events-none"
                  style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
                >
                  {step.num}
                </span>

                <div className="relative z-10">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: `${step.iconColor}18` }}
                  >
                    <step.icon size={22} style={{ color: step.iconColor }} />
                  </div>
                  <h3
                    className="text-xl font-bold text-[#03045e] mb-3"
                    style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#64748b] leading-relaxed">{step.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
