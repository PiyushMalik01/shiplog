'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Changelog', href: '#ai-magic' },
]

export default function Navbar() {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [pastHero, setPastHero] = useState(false)

  useEffect(() => {
    return scrollY.on('change', v => {
      setScrolled(v > 20)
      // Switch to light scheme once user scrolls past the hero (viewport height)
      setPastHero(v > window.innerHeight - 80)
    })
  }, [scrollY])

  const light = pastHero

  const linkColor = light ? 'rgba(3,4,94,0.65)' : 'rgba(255,255,255,0.8)'
  const linkHover = light ? '#0077b6' : '#ffffff'

  return (
    <motion.nav
      className="sticky top-0 z-50"
      style={{
        background: light
          ? 'rgba(220,244,255,0.97)'
          : 'rgba(3,4,94,0.97)',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: light
          ? '1px solid #b8e8f5'
          : scrolled
            ? '1px solid rgba(0,119,182,0.35)'
            : '1px solid transparent',
        boxShadow: light
          ? '0 2px 20px rgba(3,4,94,0.08)'
          : scrolled
            ? '0 4px 32px rgba(3,4,94,0.45)'
            : 'none',
        transition: 'background 0.45s ease, border-color 0.45s ease, box-shadow 0.45s ease',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-16 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <Image src={light ? '/shiplog_logodark.png' : '/shiplog_logo1.png'} alt="ShipLog" width={140} height={56} quality={100} className="object-contain" style={{ height: '52px', width: 'auto', transition: 'opacity 0.45s ease' }} />
          <span
            className="text-xl font-bold"
            style={{
              fontFamily: 'var(--font-syne), Syne, sans-serif',
              color: light ? '#03045e' : '#ffffff',
              transition: 'color 0.45s ease',
            }}
          >
            ShipLog
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="text-sm font-medium"
              style={{ color: linkColor, transition: 'color 0.2s ease' }}
              onMouseEnter={e => (e.currentTarget.style.color = linkHover)}
              onMouseLeave={e => (e.currentTarget.style.color = linkColor)}
            >
              {label}
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden md:inline-flex text-sm font-medium px-4 py-2"
            style={{ color: linkColor, transition: 'color 0.2s ease' }}
            onMouseEnter={e => (e.currentTarget.style.color = linkHover)}
            onMouseLeave={e => (e.currentTarget.style.color = linkColor)}
          >
            Login
          </Link>
          <Link href="/signup" className="btn btn-primary text-xs sm:text-sm px-3 sm:px-5 py-1.5 sm:py-2.5">
            Get Started →
          </Link>
        </div>
      </div>
    </motion.nav>
  )
}
