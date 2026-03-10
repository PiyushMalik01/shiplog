'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
}
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

export default function HeroSection() {
  const textRef = useRef(null)
  const isInView = useInView(textRef, { once: true, margin: '-80px' })

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-x-hidden px-4 sm:px-6 md:px-16 bg-[#03045e]">
      {/* Background radial glow */}
      <div className="absolute w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] md:w-[700px] md:h-[700px] rounded-full bg-[#0077b6]/25 blur-3xl left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* === CONTENT COLUMN — both illustrations above, text below === */}
      <motion.div
        ref={textRef}
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="relative flex flex-col items-center text-center max-w-4xl mx-auto pt-20 sm:pt-16 md:pt-12 pb-40 sm:pb-36 md:pb-28 w-full"
        style={{ zIndex: 10 }}
      >
        {/* === ILLUSTRATION WRAPPER — oval dispersed border glow === */}
        <div
          className="pointer-events-none mx-auto"
          style={{
            display: 'inline-block',
            backgroundColor: 'white',
            opacity:0.8,
            width: 'min(600px, 80vw)',
            borderRadius: '60% / 100%',
            boxShadow: '0 0 0 8px rgb(255, 255, 255), 0 0 20px 12px rgba(255, 255, 255, 0.29), 0 0 100px 40px rgba(255, 255, 255, 0.34)',
          }}
        >
          {/* === SHIP ILLUSTRATION — in flow, above headline === */}
          <motion.div
            variants={fadeInUp}
            className="w-full pointer-events-none"
            style={{ animation: 'floatSlow 7s ease-in-out infinite' }}
          >
            <div style={{ mixBlendMode: 'screen' }}>
              <Image
                src="/illustrations/wavesandship.png"
                alt="ShipLog ship sailing through waves"
                width={1600}
                height={900}
                className="w-full h-auto block"
                style={{ maxHeight: 'clamp(180px, 35vh, 480px)', objectFit: 'contain' }}
                priority
              />
            </div>
          </motion.div>

          {/* === FOREGROUND WAVES — in flow, overlapping ship bottom === */}
          <motion.div
            variants={fadeInUp}
            className="w-full pointer-events-none mb-0"
            style={{
              animation: 'floatFast 5s ease-in-out infinite',
              marginTop: 'clamp(-170px, -14vh, -50px)',
            }}
          >
            <div>
              <Image
                src="/illustrations/waves.png"
                alt=""
                aria-hidden="true"
                width={1600}
                height={700}
                className="w-full h-auto block"
                style={{ maxHeight: 'clamp(75px, 17vh, 220px)', objectFit: 'contain', objectPosition: 'top center', mixBlendMode: 'screen' }}
                priority
              />
            </div>
          </motion.div>
        </div>

        {/* Headline */}
        <motion.h1
          variants={fadeInUp}
          className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-4 sm:mb-6"
          style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
        >
          Ship{' '}
          <span style={{ textDecoration: 'underline', textDecorationStyle: 'wavy', textDecorationColor: '#00b4d8', textUnderlineOffset: '6px' }}>faster</span>.{' '}
          <br className="hidden md:block" />
          Communicate better.
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          variants={fadeInUp}
          className="text-sm sm:text-base md:text-lg lg:text-xl text-[#caf0f8]/90 max-w-xl sm:max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2 sm:px-0"
        >
          Turn messy developer notes into polished, user-facing changelogs in seconds with AI.
          Stop writing updates — start shipping features.
        </motion.p>

        {/* CTA Row */}
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full sm:w-auto">
          <Link
            href="/signup"
            className="btn btn-primary px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base hover:shadow-[0_0_24px_rgba(0,119,182,0.45)]"
          >
            Create Your Project →
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-semibold border border-white/30 text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
          >
            View Live Demo
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.p variants={fadeInUp} className="mt-8 sm:mt-10 text-xs sm:text-sm text-[#90e0ef]/70 px-4 sm:px-0">
          No credit card required · Setup in 2 minutes · Public page instantly live
        </motion.p>
      </motion.div>

      {/* Bottom fade — navy melts into pale blue */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 sm:h-48 md:h-52 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, #03045e 15%, #084f8a 50%, #4ab8d8 80%, #e0f7ff 100%)',
          zIndex: 4,
        }}
      />

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes floatSlow {
          0%   { transform: translateY(0px) rotate(-0.3deg); }
          15%  { transform: translateY(-10px) rotate(0.2deg); }
          30%  { transform: translateY(-18px) rotate(0.5deg); }
          45%  { transform: translateY(-12px) rotate(0.2deg); }
          60%  { transform: translateY(-20px) rotate(-0.3deg); }
          75%  { transform: translateY(-8px) rotate(-0.5deg); }
          100% { transform: translateY(0px) rotate(-0.3deg); }
        }
        @keyframes floatFast {
          0%   { transform: translateY(0px) translateX(0px); }
          25%  { transform: translateY(-3px) translateX(2px); }
          50%  { transform: translateY(-5px) translateX(-1px); }
          75%  { transform: translateY(-2px) translateX(1px); }
          100% { transform: translateY(0px) translateX(0px); }
        }
      `}</style>
    </section>
  )
}
