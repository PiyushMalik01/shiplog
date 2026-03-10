'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Loader2, Check } from 'lucide-react'

const POINTS = [
  'AI-generated changelogs from your raw notes',
  'Public roadmap your users can actually follow',
  'Feature voting — build what matters most',
  'Comment threads that keep users engaged',
]

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
    <>
      <style>{`
        @keyframes logoWave {
          0%   { transform: translateY(0px); }
          18%  { transform: translateY(-14px); }
          36%  { transform: translateY(7px); }
          54%  { transform: translateY(-5px); }
          72%  { transform: translateY(2px); }
          86%  { transform: translateY(-1px); }
          100% { transform: translateY(0px); }
        }
        .logo-wave { animation: logoWave 1.4s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
        @keyframes dc1 {
          0%   { left:5%;  top:20%; background:#ffffff; box-shadow:0 0 4px 2px #ffffff, 0 0 14px 5px #ffffff; }
          47%  {            background:#ffffff; box-shadow:0 0 4px 2px #ffffff, 0 0 14px 5px #ffffff; }
          53%  {            background:#00b4d8; box-shadow:0 0 4px 2px #00b4d8, 0 0 14px 5px #00b4d8; }
          100% { left:90%; top:72%; background:#00b4d8; box-shadow:0 0 4px 2px #00b4d8, 0 0 14px 5px #00b4d8; }
        }
        @keyframes dc2 {
          0%   { left:10%; top:72%; background:#ffffff; box-shadow:0 0 4px 2px #ffffff, 0 0 12px 4px #ffffff; }
          47%  {            background:#ffffff; box-shadow:0 0 4px 2px #ffffff, 0 0 12px 4px #ffffff; }
          53%  {            background:#0096c7; box-shadow:0 0 4px 2px #0096c7, 0 0 12px 4px #0096c7; }
          100% { left:85%; top:22%; background:#0096c7; box-shadow:0 0 4px 2px #0096c7, 0 0 12px 4px #0096c7; }
        }
        @keyframes dc3 {
          0%   { left:18%; top:88%; background:#ffffff; box-shadow:0 0 5px 2px #ffffff, 0 0 16px 5px #ffffff; }
          47%  {            background:#ffffff; box-shadow:0 0 5px 2px #ffffff, 0 0 16px 5px #ffffff; }
          53%  {            background:#0077b6; box-shadow:0 0 5px 2px #0077b6, 0 0 16px 5px #0077b6; }
          100% { left:92%; top:42%; background:#0077b6; box-shadow:0 0 5px 2px #0077b6, 0 0 16px 5px #0077b6; }
        }
        @keyframes dc4 {
          0%   { left:3%;  top:48%; background:#caf0f8; box-shadow:0 0 4px 2px #caf0f8, 0 0 13px 4px #caf0f8; }
          47%  {            background:#caf0f8; box-shadow:0 0 4px 2px #caf0f8, 0 0 13px 4px #caf0f8; }
          53%  {            background:#48cae4; box-shadow:0 0 4px 2px #48cae4, 0 0 13px 4px #48cae4; }
          100% { left:88%; top:85%; background:#48cae4; box-shadow:0 0 4px 2px #48cae4, 0 0 13px 4px #48cae4; }
        }
        @keyframes dc5 {
          0%   { left:8%;  top:8%;  background:#ffffff; box-shadow:0 0 4px 2px #ffffff, 0 0 14px 4px #ffffff; }
          47%  {            background:#ffffff; box-shadow:0 0 4px 2px #ffffff, 0 0 14px 4px #ffffff; }
          53%  {            background:#00b4d8; box-shadow:0 0 4px 2px #00b4d8, 0 0 14px 4px #00b4d8; }
          100% { left:82%; top:58%; background:#00b4d8; box-shadow:0 0 4px 2px #00b4d8, 0 0 14px 4px #00b4d8; }
        }
      `}</style>
      <div className="min-h-screen flex relative overflow-hidden">

        {/* Crossing glow dots — hidden on mobile */}
        <span className="absolute rounded-full pointer-events-none z-[3] hidden lg:block"
          style={{ width:'9px', height:'9px', animation:'dc1 14s ease-in-out 0s infinite alternate both' }} />
        <span className="absolute rounded-full pointer-events-none z-[3] hidden lg:block"
          style={{ width:'8px', height:'8px', animation:'dc2 18s ease-in-out 2.5s infinite alternate both' }} />
        <span className="absolute rounded-full pointer-events-none z-[3] hidden lg:block"
          style={{ width:'10px', height:'10px', animation:'dc3 11s ease-in-out 4s infinite alternate both' }} />
        <span className="absolute rounded-full pointer-events-none z-[3] hidden lg:block"
          style={{ width:'8px', height:'8px', animation:'dc4 16s ease-in-out 1s infinite alternate both' }} />
        <span className="absolute rounded-full pointer-events-none z-[3] hidden lg:block"
          style={{ width:'9px', height:'9px', animation:'dc5 13s ease-in-out 5.5s infinite alternate both' }} />

        {/* LEFT — dark panel */}
        <div
          className="hidden lg:flex flex-col lg:w-1/2 p-12"
          style={{ background: '#03045e' }}
        >
          <div className="relative z-[10] flex flex-col h-full">
            <Link href="/" className="no-underline">
              <Image
                src="/shiplog_logo1.png"
                alt="ShipLog"
                width={120}
                height={38}
                style={{ height: '32px', width: 'auto', filter: 'brightness(0) invert(1)' }}
              />
            </Link>

            <div className="flex-1 flex flex-col justify-center items-center text-center mx-auto w-full max-w-md">
              <p className="text-[#48cae4] text-xs font-semibold uppercase tracking-widest mb-4">
                For indie makers &amp; product teams
              </p>
              <h2
                className="text-white text-[36px] font-bold leading-tight mb-5"
                style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
              >
                Keep your users in the loop.
              </h2>
              <p className="text-[#90e0ef] text-base leading-relaxed mb-10">
                Stop shipping in silence. ShipLog brings changelogs, roadmaps, and feature voting into one clean public page your users will actually read.
              </p>
              <ul className="space-y-4 w-full">
                {POINTS.map((p, i) => (
                  <li key={i} className="flex items-center justify-center gap-3">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#48cae4' }} />
                    <span className="text-[#caf0f8] text-[15px]">{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs" style={{ color: 'rgba(72,202,228,0.35)' }}>&copy; 2026 ShipLog</p>
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="flex-1 flex items-center justify-center bg-white px-8 py-12">
          <div className="w-full max-w-[380px] relative z-[10]">

            <div className="logo-wave mb-8">
              <Link href="/" className="no-underline block">
                <Image
                  src="/shiplog_logodark.png"
                  alt="ShipLog"
                  width={150}
                  height={48}
                  style={{ height: '72px', width: 'auto' }}
                />
              </Link>
            </div>

            <h1
              className="text-[26px] font-bold text-[#03045e] mb-1"
              style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
            >
              Welcome back
            </h1>
            <p className="text-[#64748b] text-sm mb-8">Sign in to your ShipLog account</p>

            {errors.general && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-[13px] font-semibold text-[#03045e] mb-1.5">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm text-[#03045e] bg-white outline-none transition-all duration-150 placeholder:text-[#94a3b8] focus:ring-2 focus:ring-[#0077b6]/20 ${errors.email ? 'border-red-400' : 'border-[#e2e8f0] focus:border-[#0077b6]'}`}
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="text-[13px] font-semibold text-[#03045e]">Password</label>
                  <Link href="/forgot-password" className="text-xs text-[#0077b6] hover:underline no-underline">Forgot?</Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={`w-full rounded-xl border px-4 py-2.5 pr-11 text-sm text-[#03045e] bg-white outline-none transition-all duration-150 placeholder:text-[#94a3b8] focus:ring-2 focus:ring-[#0077b6]/20 ${errors.password ? 'border-red-400' : 'border-[#e2e8f0] focus:border-[#0077b6]'}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl text-white font-semibold py-3 text-sm flex items-center justify-center gap-2 mt-1 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                style={{ background: 'linear-gradient(135deg, #03045e 0%, #0077b6 100%)' }}
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign in to ShipLog'}
              </button>
            </form>

            <p className="mt-6 text-sm text-[#64748b]">
              No account yet?{' '}
              <Link href="/signup" className="text-[#0077b6] font-semibold hover:underline no-underline">Create one free</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
