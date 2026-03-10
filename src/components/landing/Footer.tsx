import Link from 'next/link'
import Image from 'next/image'
import { Github, Twitter } from 'lucide-react'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Roadmap', href: '#roadmap' },
]

export default function Footer() {
  return (
    <footer className="bg-[#03045e] text-white">
      {/* Main footer row */}
      <div className="max-w-6xl mx-auto px-6 md:px-16 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Left — brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Image src="/shiplog_logo1.png" alt="ShipLog" width={140} height={84} quality={100} className="object-contain" style={{ height: '72px', width: 'auto' }} />
            <span
              className="text-xl font-bold text-white"
              style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
            >
              ShipLog
            </span>
          </div>
          <p className="text-[#90e0ef] text-sm leading-relaxed">
            Ship faster. Communicate better.
          </p>
        </div>

        {/* Center — nav links */}
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-widest text-[#0077b6] font-semibold mb-1">Navigation</p>
          {navLinks.map(l => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm text-[#90e0ef] hover:text-[#00b4d8] transition-colors duration-200 no-underline"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Right — social */}
        <div>
          <p className="text-xs uppercase tracking-widest text-[#0077b6] font-semibold mb-4">Connect</p>
          <div className="flex gap-3">
            <a
              href="https://github.com/piyushmalik"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg border border-[#0077b6]/40 flex items-center justify-center text-[#90e0ef] hover:text-[#00b4d8] hover:border-[#00b4d8] transition-all duration-200"
              aria-label="GitHub"
            >
              <Github size={16} />
            </a>
            <a
              href="https://twitter.com/piyushmalik"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg border border-[#0077b6]/40 flex items-center justify-center text-[#90e0ef] hover:text-[#00b4d8] hover:border-[#00b4d8] transition-all duration-200"
              aria-label="Twitter"
            >
              <Twitter size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#0077b6]/30">
        <div className="max-w-6xl mx-auto px-6 md:px-16 py-5 text-center text-[#90e0ef] text-xs">
          Built for AGIREADY.io Hiring Drive 2026 · Made with ❤️ by{' '}
          <span className="text-[#00b4d8]">Piyush Malik</span>
        </div>
      </div>
    </footer>
  )
}
