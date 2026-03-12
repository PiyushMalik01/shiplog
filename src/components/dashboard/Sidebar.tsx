'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, FolderOpen, ScrollText,
  MessageSquare, Map, Settings, LogOut,
} from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const navItems = [
  { label: 'Overview',  href: '/dashboard',   icon: LayoutDashboard },
  { label: 'Projects',  href: '/projects',    icon: FolderOpen },
  { label: 'Changelog', href: '/changelog',   icon: ScrollText },
  { label: 'Requests',  href: '/requests',    icon: MessageSquare },
  { label: 'Roadmap',   href: '/roadmap',     icon: Map },
]

export default function Sidebar({ collapsible = true }: { collapsible?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isHovered, setIsHovered] = useState(false)
  const expanded = !collapsible || isHovered

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()
    if (error) { toast.error('Failed to log out'); return }
    router.push('/login')
    router.refresh()
  }

  return (
    <div
      className={cn(
        'h-screen flex flex-col bg-white/70 dark:bg-[#05101e]/90 backdrop-blur-md border-r border-[#caf0f8] dark:border-white/6 transition-[width] duration-300 ease-out',
        expanded ? 'w-[260px]' : 'w-[78px]'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >

      {/* Logo */}
      <div className={cn('py-4 border-b border-[#caf0f8] dark:border-white/6', expanded ? 'px-5' : 'px-3')}>
        <Link href="/dashboard" className={cn('group no-underline flex items-center', expanded ? 'gap-3' : 'justify-center')}>
          <div className="relative">
            <Image
              src="/shiplog_logodark.png"
              alt="ShipLog"
              width={100}
              height={40}
              quality={100}
              className="object-contain dark:hidden"
              style={{ height: '36px', width: 'auto' }}
            />
            <Image
              src="/shiplog_logo1.png"
              alt="ShipLog"
              width={100}
              height={40}
              quality={100}
              className="hidden object-contain dark:block"
              style={{ height: '36px', width: 'auto' }}
            />
          </div>
          <div className={cn('overflow-hidden transition-all duration-200', expanded ? 'max-w-[140px] opacity-100' : 'max-w-0 opacity-0')}>
            <p className="font-bold text-[#03045e] dark:text-white text-base leading-none" style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}>ShipLog</p>
            <p className="text-[11px] text-[#64748b] dark:text-slate-500 mt-0.5">Workspace</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className={cn('flex-1 py-4 space-y-0.5 overflow-y-auto', expanded ? 'px-3' : 'px-2')}>
        {expanded && <p className="px-3 mb-2 text-[11px] font-semibold text-[#64748b] dark:text-slate-500 uppercase tracking-widest">Main</p>}
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              title={!expanded ? label : undefined}
              className={cn(
                'flex items-center rounded-xl text-sm font-medium transition-all duration-150 no-underline',
                expanded ? 'gap-3 px-3 py-2.5 justify-start' : 'justify-center px-2 py-2.5',
                isActive
                  ? 'bg-[#0077b6] text-white shadow-md'
                  : 'text-[#475569] dark:text-slate-400 hover:bg-[#caf0f8] dark:hover:bg-white/8 hover:text-[#03045e] dark:hover:text-white'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {expanded && label}
              {expanded && isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
            </Link>
          )
        })}

        <div className="pt-4 mt-2 border-t border-[#caf0f8] dark:border-white/6">
          {expanded && <p className="px-3 mb-2 text-[11px] font-semibold text-[#64748b] dark:text-slate-500 uppercase tracking-widest">Settings</p>}
          <Link
            href="/settings"
            title={!expanded ? 'Settings' : undefined}
            className={cn(
              'flex items-center rounded-xl text-sm font-medium text-[#475569] dark:text-slate-400 hover:bg-[#caf0f8] dark:hover:bg-white/8 hover:text-[#03045e] dark:hover:text-white transition-all duration-150 no-underline',
              expanded ? 'gap-3 px-3 py-2.5 justify-start' : 'justify-center px-2 py-2.5'
            )}
          >
            <Settings className="w-4 h-4" />
            {expanded && 'Settings'}
          </Link>
        </div>
      </nav>

      {/* Logout */}
      <div className={cn('pb-4 border-t border-[#caf0f8] dark:border-white/6 pt-3', expanded ? 'px-3' : 'px-2')}>
        <ThemeToggle collapsed={!expanded} />
        <button
          onClick={handleLogout}
          title={!expanded ? 'Log Out' : undefined}
          className={cn(
            'w-full flex items-center rounded-xl text-sm font-medium text-[#475569] dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 transition-all duration-150 cursor-pointer',
            expanded ? 'gap-3 px-3 py-2.5 justify-start' : 'justify-center px-2 py-2.5'
          )}
        >
          <LogOut className="w-4 h-4" />
          {expanded && 'Log Out'}
        </button>
      </div>
    </div>
  )
}
