'use client'

import { Suspense } from 'react'
import ResetPasswordForm from './reset-password-form'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  )
}

function ResetPasswordLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#03045e] to-[#084f8a]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
        <p className="text-white/70">Loading...</p>
      </div>
    </div>
  )
}
