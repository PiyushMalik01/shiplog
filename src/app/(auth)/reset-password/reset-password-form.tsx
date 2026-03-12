'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Loader2, Check, AlertCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [validating, setValidating] = useState(true)
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Validate that this page was reached via the reset link
    const token = searchParams.get('code')
    if (!token) {
      setError('Invalid reset link. Please request a new one.')
      setValidating(false)
    } else {
      setValidating(false)
    }
  }, [searchParams])

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message || 'Failed to reset password. The link may have expired.')
      setLoading(false)
      return
    }

    setSuccess(true)
  }

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#03045e] to-[#084f8a]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#00b4d8] animate-spin" />
          <p className="text-white/70">Validating reset link...</p>
        </div>
      </div>
    )
  }

  if (error && error.includes('Invalid reset link')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#03045e] to-[#084f8a] px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-8">
              <Image src="/logo.svg" alt="ShipLog" width={40} height={40} priority />
            </Link>
          </div>

          <div className="bg-white/[0.08] border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 text-center">Invalid reset link</h1>
            <p className="text-white/70 mb-6 text-center">
              This password reset link has expired or is invalid. Please request a new one.
            </p>
            <Link
              href="/auth/forgot-password"
              className="block w-full btn btn-primary py-3 font-semibold text-center"
            >
              Request new link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#03045e] to-[#084f8a] px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-8">
              <Image src="/logo.svg" alt="ShipLog" width={40} height={40} priority />
            </Link>
          </div>

          <div className="bg-white/[0.08] border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Password reset successful!</h1>
              <p className="text-white/70 mb-8">
                Your password has been updated. You can now sign in with your new password.
              </p>
              <Link
                href="/login"
                className="inline-block w-full btn btn-primary py-3 font-semibold"
              >
                Sign in
              </Link>
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
          <h1 className="text-3xl font-bold text-white mb-2">Reset password</h1>
          <p className="text-white/70 mb-8">Enter your new password below.</p>

          <form onSubmit={handleResetPassword} className="space-y-6">
            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                New password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder:text-white/40 focus:border-[#0077b6] focus:outline-none focus:ring-1 focus:ring-[#0077b6] disabled:opacity-50 disabled:cursor-not-allowed transition-all pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-white/50 mt-2">At least 8 characters</p>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder:text-white/40 focus:border-[#0077b6] focus:outline-none focus:ring-1 focus:ring-[#0077b6] disabled:opacity-50 disabled:cursor-not-allowed transition-all pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="w-full btn btn-primary py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resetting password...
                </>
              ) : (
                'Reset password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
