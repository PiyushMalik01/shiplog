'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import {
  Save, User, Mail, Lock, KeyRound, Eye, EyeOff, LogOut, Trash2,
} from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Profile
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [originalName, setOriginalName] = useState('')
  const [memberSince, setMemberSince] = useState('')

  // Password
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      setUserId(user.id)
      setEmail(user.email ?? '')
      setMemberSince(
        new Date(user.created_at).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric',
        })
      )

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      const name = profile?.full_name ?? ''
      setFullName(name)
      setOriginalName(name)
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSaveProfile() {
    if (!fullName.trim()) { toast.error('Name cannot be empty'); return }
    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', userId)

    setSaving(false)
    if (error) { toast.error('Failed to update profile'); return }

    setOriginalName(fullName.trim())
    toast.success('Profile updated')
    router.refresh()
  }

  async function handleChangePassword() {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setChangingPassword(true)

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    setChangingPassword(false)
    if (error) { toast.error(error.message); return }

    setNewPassword('')
    setConfirmPassword('')
    toast.success('Password updated')
  }

  async function handleDeleteAccount() {
    if (deleteInput !== 'DELETE') return
    setDeleting(true)

    // Delete all user data
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId)

    if (projects && projects.length > 0) {
      const ids = projects.map(p => p.id)
      await Promise.all([
        supabase.from('changelog_entries').delete().in('project_id', ids),
        supabase.from('feature_requests').delete().in('project_id', ids),
        supabase.from('roadmap_items').delete().in('project_id', ids),
      ])
      await supabase.from('projects').delete().eq('user_id', userId)
    }

    await supabase.from('profiles').delete().eq('id', userId)

    // Sign out — actual user record deletion would require a server-side admin call
    await supabase.auth.signOut()
    toast.success('Account data deleted')
    router.push('/login')
  }

  async function handleLogoutAll() {
    await supabase.auth.signOut({ scope: 'global' })
    toast.success('Signed out of all devices')
    router.push('/login')
  }

  const profileChanged = fullName.trim() !== originalName

  if (loading) {
    return (
      <div className="min-h-full p-6 md:p-8 max-w-2xl mx-auto">
        <div className="h-7 w-40 rounded-lg bg-[#f1f5f9] dark:bg-white/8 animate-pulse mb-2" />
        <div className="h-4 w-64 rounded bg-[#f1f5f9] dark:bg-white/6 animate-pulse mb-8" />
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white dark:bg-[#0d1b2e] rounded-2xl border border-[#e2e8f0] dark:border-white/8 p-6 mb-4">
            <div className="h-4 w-24 rounded bg-[#f1f5f9] dark:bg-white/8 animate-pulse mb-5" />
            <div className="space-y-4">
              <div className="h-10 rounded-xl bg-[#f1f5f9] dark:bg-white/6 animate-pulse" />
              <div className="h-10 rounded-xl bg-[#f1f5f9] dark:bg-white/6 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-full p-6 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <h1
        className="text-[24px] font-bold text-[#03045e] dark:text-white leading-tight"
        style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
      >
        Settings
      </h1>
      <p className="text-[13px] text-[#64748b] dark:text-slate-400 mt-1 mb-8">Manage your account and preferences.</p>

      {/* ── Profile Section ── */}
      <section className="bg-white dark:bg-[#0d1b2e] rounded-2xl border border-[#e2e8f0] dark:border-white/8 shadow-sm p-6 mb-4">
        <h2
          className="text-[15px] font-bold text-[#03045e] dark:text-white mb-5 flex items-center gap-2"
          style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
        >
          <User className="w-4 h-4 text-[#0077b6]" />
          Profile
        </h2>

        <div className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-[12px] font-semibold text-[#475569] dark:text-slate-400 uppercase tracking-wide mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] dark:border-white/10 bg-white dark:bg-[#080f1e] text-[14px] text-[#03045e] dark:text-slate-100 placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0077b6]/20 focus:border-[#0077b6] transition-colors"
              placeholder="Your name"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-[12px] font-semibold text-[#475569] dark:text-slate-400 uppercase tracking-wide mb-1.5">
              Email
            </label>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#e2e8f0] dark:border-white/10 bg-[#f8fafc] dark:bg-white/4">
              <Mail className="w-4 h-4 text-[#94a3b8] flex-shrink-0" />
              <span className="text-[14px] text-[#64748b] dark:text-slate-400">{email}</span>
            </div>
            <p className="text-[10px] text-[#94a3b8] mt-1">Email cannot be changed here.</p>
          </div>

          {/* Member since */}
          <div className="flex items-center gap-2 text-[11px] text-[#94a3b8] dark:text-slate-500">
            <span>Member since {memberSince}</span>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end mt-5">
          <button
            onClick={handleSaveProfile}
            disabled={saving || !profileChanged}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold shadow-sm transition-all cursor-pointer ${
              profileChanged
                ? 'bg-[#0077b6] hover:bg-[#023e8a] text-white'
                : 'bg-[#f1f5f9] dark:bg-white/8 text-[#94a3b8] cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </section>

      {/* ── Security Section ── */}
      <section className="bg-white dark:bg-[#0d1b2e] rounded-2xl border border-[#e2e8f0] dark:border-white/8 shadow-sm p-6 mb-4">
        <h2
          className="text-[15px] font-bold text-[#03045e] dark:text-white mb-5 flex items-center gap-2"
          style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
        >
          <KeyRound className="w-4 h-4 text-[#0077b6]" />
          Security
        </h2>

        <div className="space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-[12px] font-semibold text-[#475569] dark:text-slate-400 uppercase tracking-wide mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#e2e8f0] dark:border-white/10 bg-white dark:bg-[#080f1e] text-[14px] text-[#03045e] dark:text-slate-100 placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0077b6]/20 focus:border-[#0077b6] transition-colors"
                placeholder="Min. 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-[12px] font-semibold text-[#475569] dark:text-slate-400 uppercase tracking-wide mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e2e8f0] dark:border-white/10 bg-white dark:bg-[#080f1e] text-[14px] text-[#03045e] dark:text-slate-100 placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0077b6]/20 focus:border-[#0077b6] transition-colors"
                placeholder="Re-enter password"
              />
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-[11px] text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-5 flex-wrap gap-3">
          <button
            onClick={handleChangePassword}
            disabled={changingPassword || !newPassword || newPassword !== confirmPassword}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold shadow-sm transition-all cursor-pointer ${
              newPassword && newPassword === confirmPassword
                ? 'bg-[#0077b6] hover:bg-[#023e8a] text-white'
                : 'bg-[#f1f5f9] dark:bg-white/8 text-[#94a3b8] cursor-not-allowed'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            {changingPassword ? 'Updating...' : 'Update Password'}
          </button>

          <button
            onClick={handleLogoutAll}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold text-[#64748b] dark:text-slate-400 border border-[#e2e8f0] dark:border-white/10 hover:bg-[#f1f5f9] dark:hover:bg-white/8 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out All Devices
          </button>
        </div>
      </section>

      {/* ── Danger Zone ── */}
      <section className="bg-white dark:bg-[#0d1b2e] rounded-2xl border border-red-200 dark:border-red-900/40 shadow-sm p-6">
        <h2
          className="text-[15px] font-bold text-red-600 mb-1 flex items-center gap-2"
          style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
        >
          <Trash2 className="w-4 h-4" />
          Danger Zone
        </h2>
        <p className="text-[12px] text-[#64748b] dark:text-slate-400 mb-4">
          Permanently delete your account and all associated projects, changelogs, requests, and roadmap data. This action cannot be undone.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold text-red-600 border border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Account
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="text-[12px] text-[#475569] mb-3">
              Type <span className="font-bold text-red-600">DELETE</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-[#080f1e] text-[13px] text-[#03045e] dark:text-slate-100 placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-colors mb-3"
              placeholder="DELETE"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput !== 'DELETE' || deleting}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-colors cursor-pointer ${
                  deleteInput === 'DELETE'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-[#f1f5f9] dark:bg-white/8 text-[#94a3b8] cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                {deleting ? 'Deleting...' : 'Permanently Delete Account'}
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput('') }}
                className="px-4 py-2 rounded-xl text-[12px] font-semibold text-[#64748b] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
