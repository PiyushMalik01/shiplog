'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export default function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="w-9 h-9" />

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'rounded-xl text-sm font-medium text-[#475569] dark:text-slate-400 hover:bg-[#caf0f8] dark:hover:bg-white/8 hover:text-[#03045e] dark:hover:text-white transition-all duration-150 cursor-pointer',
        collapsed ? 'w-full flex items-center justify-center px-2 py-2.5' : 'w-full flex items-center gap-3 px-3 py-2.5'
      )}
    >
      {isDark ? <Sun className="w-4 h-4 flex-shrink-0" /> : <Moon className="w-4 h-4 flex-shrink-0" />}
      {!collapsed && (isDark ? 'Light Mode' : 'Dark Mode')}
    </button>
  )
}
