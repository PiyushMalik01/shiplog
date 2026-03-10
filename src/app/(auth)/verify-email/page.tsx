'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, Check, Mail, RotateCcw } from 'lucide-react'

const POINTS = [
  'AI-generated changelogs from your raw notes',
  'Public roadmap your users can actually follow',
  'Feature voting — build what matters most',
  'Comment threads that keep users engaged',
]

const STYLE = `
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
`

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const router = useRouter()
  const supabase = createClient()

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [resendSent, setResendSent] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Auto-focus first box
  useEffect(() => { inputRefs.current[0]?.focus() }, [])

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setInterval(() => setResendCooldown(c => c - 1), 1000)
    return () => clearInterval(t)
  }, [resendCooldown])

  function handleDigitChange(index: number, value: string) {
    // Support paste of full OTP
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6)
      const next = [...digits]
      for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
      setDigits(next)
      const focusIdx = Math.min(pasted.length, 5)
      inputRefs.current[focusIdx]?.focus()
      return
    }
    const char = value.replace(/\D/g, '')
    const next = [...digits]
    next[index] = char
    setDigits(next)
    if (char && index < 5) inputRefs.current[index + 1]?.focus()
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    const token = digits.join('')
    if (token.length < 6) { setError('Please enter the full 6-digit code.'); return }
    if (!email) { setError('Email missing. Please sign up again.'); return }
    setLoading(true)
    setError('')
    const { error: verifyError } = await supabase.auth.verifyOtp({ email, token, type: 'signup' })
    if (verifyError) {
      setError(verifyError.message.includes('expired') || verifyError.message.includes('invalid')
        ? 'Invalid or expired code. Please check your email or request a new one.'
        : verifyError.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  async function handleResend() {
    if (!email || resendCooldown > 0) return
    setResending(true)
    setError('')
    setResendSent(false)
    const { error: resendError } = await supabase.auth.resend({ email, type: 'signup' })
    if (resendError) {
      setError(resendError.message)
    } else {
      setResendSent(true)
      setResendCooldown(60)
      setDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    }
    setResending(false)
  }

  const isComplete = digits.every(d => d !== '')

  return (
    <>
      <style>{STYLE}</style>
      <div className="min-h-screen flex relative overflow-hidden">

        {/* Crossing glow dots */}
        <span className="absolute rounded-full pointer-events-none z-[3] hidden lg:block"
          style={{ width: '9px', height: '9px', animation: 'dc1 14s ease-in-out 0s infinite alternate both' }} />
        <span className="absolute rounded-full pointer-events-none z-[3] hidden lg:block"
          style={{ width: '8px', height: '8px', animation: 'dc2 18s ease-in-out 2.5s infinite alternate both' }} />
        <span className="absolute rounded-full pointer-events-none z-[3] hidden lg:block"
          style={{ width: '10px', height: '10px', animation: 'dc3 11s ease-in-out 4s infinite alternate both' }} />
        <span className="absolute rounded-full pointer-events-none z-[3] hidden lg:block"
          style={{ width: '8px', height: '8px', animation: 'dc4 16s ease-in-out 1s infinite alternate both' }} />
        <span className="absolute rounded-full pointer-events-none z-[3] hidden lg:block"
          style={{ width: '9px', height: '9px', animation: 'dc5 13s ease-in-out 5.5s infinite alternate both' }} />

        {/* LEFT — dark panel */}
        <div className="hidden lg:flex flex-col lg:w-1/2 p-12" style={{ background: '#03045e' }}>
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
                Almost there!
              </p>
              <h2
                className="text-white text-[36px] font-bold leading-tight mb-5"
                style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
              >
                One step away from shipping.
              </h2>
              <p className="text-[#90e0ef] text-base leading-relaxed mb-10">
                We&apos;ve sent a 6-digit code to your inbox. Enter it to confirm your account and start building your public changelog.
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
                  src="/shiplog_logo1.png"
                  alt="ShipLog"
                  width={150}
                  height={48}
                  style={{ height: '42px', width: 'auto' }}
                />
              </Link>
            </div>

            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-[#e0f7ff] border border-[#caf0f8] flex items-center justify-center mb-6">
              <Mail className="w-5 h-5 text-[#0077b6]" />
            </div>

            <h1
              className="text-[26px] font-bold text-[#03045e] mb-1"
              style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
            >
              Check your email
            </h1>
            <p className="text-[#64748b] text-sm mb-2">
              We sent a 6-digit code to
            </p>
            {email && (
              <p className="text-sm font-semibold text-[#03045e] mb-8 truncate">{email}</p>
            )}

            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}
            {resendSent && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-sm text-[#16a34a]">
                New code sent! Check your inbox.
              </div>
            )}

            <form onSubmit={handleVerify}>
              {/* 6-digit OTP boxes */}
              <div className="flex gap-2.5 justify-between mb-6">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={d}
                    onChange={e => handleDigitChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 text-[#03045e] bg-white outline-none transition-all duration-150 ${
                      d ? 'border-[#0077b6]' : 'border-[#e2e8f0]'
                    } focus:border-[#0077b6] focus:ring-2 focus:ring-[#0077b6]/20`}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || !isComplete}
                className="w-full rounded-xl text-white font-semibold py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                style={{ background: 'linear-gradient(135deg, #03045e 0%, #0077b6 100%)' }}
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : 'Confirm & Continue →'}
              </button>
            </form>

            <p className="mt-6 text-sm text-[#64748b] text-center">
              Didn&apos;t receive it?{' '}
              {resendCooldown > 0 ? (
                <span className="text-[#94a3b8]">Resend in {resendCooldown}s</span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-[#0077b6] font-semibold hover:underline disabled:opacity-50 inline-flex items-center gap-1"
                >
                  {resending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                  Resend code
                </button>
              )}
            </p>

            <p className="mt-3 text-sm text-[#64748b] text-center">
              Wrong email?{' '}
              <Link href="/signup" className="text-[#0077b6] font-semibold hover:underline no-underline">
                Sign up again
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-[#64748b]"><Loader2 className="w-5 h-5 animate-spin" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
