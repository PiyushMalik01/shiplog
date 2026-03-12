'use client'

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

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()
    if (error) { toast.error('Failed to log out'); return }
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="w-[260px] h-screen flex flex-col bg-white/70 dark:bg-[#05101e]/90 backdrop-blur-md border-r border-[#caf0f8] dark:border-white/6">

      {/* Logo */}
      <div className="px-5 py-4 border-b border-[#caf0f8] dark:border-white/6">
        <Link href="/dashboard" className="flex items-center gap-3 group no-underline">
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
          <div>
            <p className="font-bold text-[#03045e] dark:text-white text-base leading-none" style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}>ShipLog</p>
            <p className="text-[11px] text-[#64748b] dark:text-slate-500 mt-0.5">Workspace</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[11px] font-semibold text-[#64748b] dark:text-slate-500 uppercase tracking-widest">Main</p>
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 no-underline',
                isActive
                  ? 'bg-[#0077b6] text-white shadow-md'
                  : 'text-[#475569] dark:text-slate-400 hover:bg-[#caf0f8] dark:hover:bg-white/8 hover:text-[#03045e] dark:hover:text-white'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
            </Link>
          )
        })}

        <div className="pt-4 mt-2 border-t border-[#caf0f8] dark:border-white/6">
          <p className="px-3 mb-2 text-[11px] font-semibold text-[#64748b] dark:text-slate-500 uppercase tracking-widest">Settings</p>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#475569] dark:text-slate-400 hover:bg-[#caf0f8] dark:hover:bg-white/8 hover:text-[#03045e] dark:hover:text-white transition-all duration-150 no-underline"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-[#caf0f8] dark:border-white/6 pt-3">
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#475569] dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 transition-all duration-150 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </div>
  )
}
