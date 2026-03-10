'use client'

import { useEffect, useState } from 'react'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardHeader({ name }: { name: string }) {
  const [greeting, setGreeting] = useState('Welcome back')

  useEffect(() => {
    setGreeting(getGreeting())
  }, [])

  const firstName = name.split(' ')[0]

  return (
    <div className="mb-8">
      <p className="text-[12px] font-semibold text-[#64748b] uppercase tracking-widest mb-2">
        Dashboard / Overview
      </p>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="font-bold text-[#03045e] text-3xl md:text-4xl leading-tight"
            style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
          >
            {greeting}, {firstName}
          </h1>
          <p className="text-[#64748b] mt-1 text-sm">
            Here&apos;s what&apos;s happening across your projects today.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-[#e0f4fb] shadow-sm flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-[12px] font-semibold text-[#64748b]">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
      <div className="mt-6 h-px bg-gradient-to-r from-[#caf0f8] via-[#90e0ef] to-transparent" />
    </div>
  )
}
