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

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string; general?: string }>({})
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    const fieldErrors: typeof errors = {}
    if (!fullName.trim() || fullName.trim().length < 2) fieldErrors.fullName = 'Full name must be at least 2 characters.'
    if (password.length < 8) fieldErrors.password = 'Password must be at least 8 characters.'
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName.trim() } },
    })
    if (error) {
      if (error.message.toLowerCase().includes('email')) {
        setErrors({ email: error.message })
      } else if (error.message.toLowerCase().includes('password')) {
        setErrors({ password: error.message })
      } else {
        setErrors({ general: error.message })
      }
      setLoading(false)
      return
    }
    router.push(`/verify-email?email=${encodeURIComponent(email)}`)
    router.refresh()
  }

  const pwRules = {
    length:    password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    digit:     /[0-9]/.test(password),
  }
  const pwRulesMet = Object.values(pwRules).filter(Boolean).length
  const pwStrength = password.length === 0 ? 0 : pwRulesMet <= 1 ? 1 : pwRulesMet <= 2 ? 1 : pwRulesMet === 3 ? 2 : 3
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'][pwStrength]
  const strengthColor = ['', '#ef4444', '#d97706', '#16a34a'][pwStrength]

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
                Free forever — no credit card
              </p>
              <h2
                className="text-white text-[36px] font-bold leading-tight mb-5"
                style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
              >
                Build in public. Ship with confidence.
              </h2>
              <p className="text-[#90e0ef] text-base leading-relaxed mb-10">
                Join makers who use ShipLog to turn raw notes into polished changelogs, build trust with a public roadmap, and ship exactly what their users ask for.
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

            <p className="text-xs" style={{ color: 'rgba(72,202,228,0.35)' }}>© 2026 ShipLog</p>
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
              Create your account
            </h1>
            <p className="text-[#64748b] text-sm mb-8">Start shipping for free in minutes</p>

            {errors.general && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-[13px] font-semibold text-[#03045e] mb-1.5">Full name</label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm text-[#03045e] bg-white outline-none transition-all duration-150 placeholder:text-[#94a3b8] focus:ring-2 focus:ring-[#0077b6]/20 ${
                    errors.fullName ? 'border-red-400' : 'border-[#e2e8f0] focus:border-[#0077b6]'
                  }`}
                  placeholder="Jane Smith"
                />
                {errors.fullName && <p className="mt-1.5 text-xs text-red-600">{errors.fullName}</p>}
              </div>

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
                <label htmlFor="password" className="block text-[13px] font-semibold text-[#03045e] mb-1.5">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={`w-full rounded-xl border px-4 py-2.5 pr-11 text-sm text-[#03045e] bg-white outline-none transition-all duration-150 placeholder:text-[#94a3b8] focus:ring-2 focus:ring-[#0077b6]/20 ${
                      errors.password ? 'border-red-400' : 'border-[#e2e8f0] focus:border-[#0077b6]'
                    }`}
                    placeholder="Min. 8 characters"
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
                {/* Requirements checklist — always visible when field has focus or content */}
                <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1">
                  {([
                    { key: 'length',    label: '8+ characters' },
                    { key: 'uppercase', label: 'Uppercase letter' },
                    { key: 'lowercase', label: 'Lowercase letter' },
                    { key: 'digit',     label: 'Number (0–9)' },
                  ] as const).map(r => (
                    <span key={r.key} className="flex items-center gap-1.5 text-[11px] transition-colors"
                      style={{ color: password.length === 0 ? '#94a3b8' : pwRules[r.key] ? '#16a34a' : '#ef4444' }}>
                      <span className="w-3 h-3 flex items-center justify-center shrink-0">
                        {password.length === 0
                          ? <span className="w-1.5 h-1.5 rounded-full bg-[#cbd5e1] inline-block" />
                          : pwRules[r.key]
                            ? <Check className="w-3 h-3" />
                            : <span className="w-3 h-3 flex items-center justify-center font-bold text-[10px] leading-none">&times;</span>
                        }
                      </span>
                      {r.label}
                    </span>
                  ))}
                </div>
                {password.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3].map(n => (
                        <div
                          key={n}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{ background: n <= pwStrength ? strengthColor : '#e2e8f0' }}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold" style={{ color: strengthColor }}>{strengthLabel}</span>
                  </div>
                )}
                {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl text-white font-semibold py-3 text-sm flex items-center justify-center gap-2 mt-1 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                style={{ background: 'linear-gradient(135deg, #03045e 0%, #0077b6 100%)' }}
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Start shipping for free'}
              </button>
            </form>

            <p className="mt-6 text-sm text-[#64748b]">
              Already have an account?{' '}
              <Link href="/login" className="text-[#0077b6] font-semibold hover:underline no-underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
