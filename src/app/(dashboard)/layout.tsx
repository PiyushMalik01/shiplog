'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import MobileNav from '@/components/dashboard/MobileNav'
import Image from 'next/image'
import { ThemeProvider } from '@/components/ThemeProvider'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ThemeProvider>
    <div className="flex h-screen overflow-hidden bg-[#f0f9ff] dark:bg-[#080f1e]">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Drawer */}
      <MobileNav open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile Top Bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white/70 dark:bg-[#0d1b2e]/80 backdrop-blur-md border-b border-[#caf0f8] dark:border-white/8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-[#caf0f8] dark:hover:bg-white/8 transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-[#03045e] dark:text-white" />
          </button>
          <Image
            src="/shiplog_logo1.png"
            alt="ShipLog"
            width={100}
            height={32}
            quality={100}
            className="object-contain"
            style={{ height: '28px', width: 'auto' }}
          />
          <div className="w-9" />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
    </ThemeProvider>
  )
}
