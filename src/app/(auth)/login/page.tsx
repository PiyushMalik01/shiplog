'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.message.toLowerCase().includes('email')) {
        setErrors({ email: error.message })
      } else if (error.message.toLowerCase().includes('password') || error.message.toLowerCase().includes('invalid')) {
        setErrors({ password: 'Incorrect email or password.' })
      } else {
        setErrors({ general: error.message })
      }
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#03045e] flex-col justify-between p-12">
        <Link href="/" className="no-underline">
          <Image src="/shiplog_logo1.png" alt="ShipLog" width={120} height={40} style={{ height: '36px', width: 'auto' }} />
        </Link>
        <div>
          <blockquote
            className="text-white text-3xl font-bold leading-snug mb-8"
            style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
          >
            Your users deserve to know what you&apos;re building.
          </blockquote>
          <ul className="space-y-4">
            {[
              'AI-generated changelogs from raw commit messages',
              'Public roadmap pages that build user trust',
              'Feature voting that tells you exactly what to build next',
            ].map(item => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 w-0.5 h-4 bg-[#0077b6] flex-shrink-0 rounded-full" />
                <span className="text-[#90e0ef] text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[#48cae4] text-xs">Used by indie makers worldwide</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-[#f0f9ff] px-6 py-12">
        <div className="w-full max-w-[440px]">
          <div className="mb-8">
            <h1
              className="text-[28px] font-bold text-[#03045e] leading-tight"
              style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
            >
              Welcome back
            </h1>
            <p className="text-[#64748b] text-sm mt-1.5">Log in to manage your changelogs and projects.</p>
          </div>

          {errors.general && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-[13px] font-semibold text-[#03045e] mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm text-[#03045e] bg-white outline-none transition-all duration-150 placeholder:text-[#94a3b8] focus:ring-2 focus:ring-[#0077b6]/20 ${
                  errors.email ? 'border-red-400' : 'border-[#e2e8f0] focus:border-[#0077b6]'
                }`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-[13px] font-semibold text-[#03045e]">Password</label>
                <Link href="/forgot-password" className="text-xs text-[#0077b6] hover:underline no-underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`w-full rounded-xl border px-4 py-2.5 pr-11 text-sm text-[#03045e] bg-white outline-none transition-all duration-150 placeholder:text-[#94a3b8] focus:ring-2 focus:ring-[#0077b6]/20 ${
                    errors.password ? 'border-red-400' : 'border-[#e2e8f0] focus:border-[#0077b6]'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#0077b6] hover:bg-[#023e8a] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 text-sm transition-colors duration-150 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#64748b]">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#0077b6] font-semibold hover:underline no-underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
