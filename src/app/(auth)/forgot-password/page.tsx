'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Loader2, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError(error.message || 'Failed to send reset email. Please try again.')
      setLoading(false)
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#03045e] to-[#084f8a] px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-8">
              <Image src="/logo.svg" alt="ShipLog" width={40} height={40} priority />
            </Link>
          </div>

          {/* Success Card */}
          <div className="bg-white/[0.08] border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
              <p className="text-white/70 mb-6">
                We've sent a password reset link to <strong>{email}</strong>. Click the link to reset your password.
              </p>
              <p className="text-sm text-white/50 mb-8">
                The link will expire in 24 hours.
              </p>

              {/* Back to Login */}
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-[#0077b6] hover:text-[#00b4d8] font-medium mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>

              {/* Resend */}
              <p className="text-xs text-white/50">
                Didn't receive the email?{' '}
                <button
                  onClick={() => {
                    setSubmitted(false)
                    setEmail('')
                  }}
                  className="text-[#0077b6] hover:text-[#00b4d8] font-medium"
                >
                  Try again
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#03045e] to-[#084f8a] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-8">
            <Image src="/logo.svg" alt="ShipLog" width={40} height={40} priority />
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-white/[0.08] border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-white mb-2">Forgot password?</h1>
          <p className="text-white/70 mb-8">
            Enter your email and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleReset} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder:text-white/40 focus:border-[#0077b6] focus:outline-none focus:ring-1 focus:ring-[#0077b6] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                required
              />
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full btn btn-primary py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send reset link'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <p className="text-white/70">
              Remember your password?{' '}
              <Link href="/login" className="text-[#0077b6] hover:text-[#00b4d8] font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
