'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Save, Globe, Lock, Trash2, Copy, Check,
  ExternalLink,
} from 'lucide-react'

interface ProjectData {
  id: string
  name: string
  slug: string
  description: string | null
  is_public: boolean
  created_at: string
}

export default function ProjectSettingsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [project, setProject] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [slugCopied, setSlugCopied] = useState(false)
  const [embedCopied, setEmbedCopied] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        toast.error('Project not found')
        router.push('/projects')
        return
      }

      setProject(data)
      setName(data.name)
      setSlug(data.slug)
      setDescription(data.description ?? '')
      setIsPublic(data.is_public)
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleSave() {
    if (!name.trim()) { toast.error('Name is required'); return }
    if (!slug.trim()) { toast.error('Slug is required'); return }

    const sanitizedSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    if (!sanitizedSlug) { toast.error('Invalid slug'); return }

    setSaving(true)

    const { error } = await supabase
      .from('projects')
      .update({
        name: name.trim(),
        slug: sanitizedSlug,
        description: description.trim() || null,
        is_public: isPublic,
      })
      .eq('id', id)

    setSaving(false)

    if (error) {
      if (error.code === '23505') {
        toast.error('That slug is already taken')
      } else {
        toast.error('Failed to save changes')
      }
      return
    }

    setSlug(sanitizedSlug)
    toast.success('Settings saved')
    router.refresh()
  }

  async function handleDelete() {
    if (deleteInput !== project?.name) return

    setDeleting(true)

    // Delete related data first, then the project
    await Promise.all([
      supabase.from('changelog_entries').delete().eq('project_id', id),
      supabase.from('feature_requests').delete().eq('project_id', id),
      supabase.from('roadmap_items').delete().eq('project_id', id),
    ])

    const { error } = await supabase.from('projects').delete().eq('id', id)

    if (error) {
      toast.error('Failed to delete project')
      setDeleting(false)
      return
    }

    toast.success('Project deleted')
    router.push('/projects')
    router.refresh()
  }

  function copyPublicUrl() {
    if (!project) return
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`)
    setSlugCopied(true)
    setTimeout(() => setSlugCopied(false), 2000)
  }

  function copyEmbedCode() {
    if (!project) return
    const code = `<iframe\n  src="${window.location.origin}/widget/${slug}"\n  width="100%"\n  height="480"\n  style="border: none; border-radius: 12px;"\n  title="${project.name} Changelog"\n></iframe>`
    navigator.clipboard.writeText(code)
    setEmbedCopied(true)
    setTimeout(() => setEmbedCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-full p-6 md:p-8 max-w-2xl mx-auto">
        <div className="h-6 w-32 rounded-lg bg-[#f1f5f9] animate-pulse mb-8" />
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 space-y-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 rounded bg-[#f1f5f9] animate-pulse" />
              <div className="h-10 rounded-xl bg-[#f1f5f9] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!project) return null

  const hasChanges =
    name !== project.name ||
    slug !== project.slug ||
    (description || '') !== (project.description || '') ||
    isPublic !== project.is_public

  return (
    <div className="min-h-full p-6 md:p-8 max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#64748b] hover:text-[#0077b6] transition-colors mb-6 no-underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Projects
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1
            className="text-[24px] font-bold text-[#03045e] leading-tight"
            style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
          >
            Project Settings
          </h1>
          <p className="text-[13px] text-[#64748b] mt-1">
            Manage <span className="font-semibold text-[#03045e]">{project.name}</span>
          </p>
        </div>
        {isPublic && (
          <Link
            href={`/${slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0077b6] hover:text-[#023e8a] transition-colors no-underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Public Page
          </Link>
        )}
      </div>

      {/* General Settings */}
      <section className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6 mb-4">
        <h2
          className="text-[15px] font-bold text-[#03045e] mb-5"
          style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
        >
          General
        </h2>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-[12px] font-semibold text-[#475569] uppercase tracking-wide mb-1.5">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-[14px] text-[#03045e] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0077b6]/20 focus:border-[#0077b6] transition-colors"
              placeholder="My Project"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-[12px] font-semibold text-[#475569] uppercase tracking-wide mb-1.5">
              URL Slug
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] text-[#94a3b8] font-mono">/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-[#e2e8f0] text-[14px] text-[#03045e] font-mono placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0077b6]/20 focus:border-[#0077b6] transition-colors"
                  placeholder="my-project"
                />
              </div>
              <button
                onClick={copyPublicUrl}
                className="px-3 py-2.5 rounded-xl border border-[#e2e8f0] text-[#64748b] hover:text-[#0077b6] hover:bg-[#f0f9ff] hover:border-[#caf0f8] transition-colors cursor-pointer"
                title="Copy public URL"
              >
                {slugCopied ? <Check className="w-4 h-4 text-[#16a34a]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-[#94a3b8] mt-1.5">
              Public URL: {typeof window !== 'undefined' ? window.location.origin : ''}/<span className="font-semibold">{slug}</span>
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] font-semibold text-[#475569] uppercase tracking-wide mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-[14px] text-[#03045e] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0077b6]/20 focus:border-[#0077b6] transition-colors resize-none"
              placeholder="A short description of your project..."
            />
          </div>
        </div>
      </section>

      {/* Visibility */}
      <section className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6 mb-4">
        <h2
          className="text-[15px] font-bold text-[#03045e] mb-4"
          style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
        >
          Visibility
        </h2>

        <div className="flex gap-3">
          <button
            onClick={() => setIsPublic(true)}
            className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
              isPublic
                ? 'border-[#0077b6] bg-[#f0f9ff]'
                : 'border-[#e2e8f0] hover:border-[#cbd5e1]'
            }`}
          >
            <Globe className={`w-5 h-5 flex-shrink-0 ${isPublic ? 'text-[#0077b6]' : 'text-[#94a3b8]'}`} />
            <div className="text-left">
              <p className={`text-[13px] font-bold ${isPublic ? 'text-[#03045e]' : 'text-[#64748b]'}`}>Public</p>
              <p className="text-[11px] text-[#94a3b8]">Anyone with the link can view</p>
            </div>
          </button>
          <button
            onClick={() => setIsPublic(false)}
            className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
              !isPublic
                ? 'border-[#0077b6] bg-[#f0f9ff]'
                : 'border-[#e2e8f0] hover:border-[#cbd5e1]'
            }`}
          >
            <Lock className={`w-5 h-5 flex-shrink-0 ${!isPublic ? 'text-[#0077b6]' : 'text-[#94a3b8]'}`} />
            <div className="text-left">
              <p className={`text-[13px] font-bold ${!isPublic ? 'text-[#03045e]' : 'text-[#64748b]'}`}>Private</p>
              <p className="text-[11px] text-[#94a3b8]">Only you can access</p>
            </div>
          </button>
        </div>
      </section>

      {/* Save button */}
      <div className="flex justify-end mb-8">
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold shadow-sm transition-all cursor-pointer ${
            hasChanges
              ? 'bg-[#0077b6] hover:bg-[#023e8a] text-white'
              : 'bg-[#f1f5f9] text-[#94a3b8] cursor-not-allowed'
          }`}
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Embed Widget */}
      <section className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6 mb-4">
        <h2
          className="text-[15px] font-bold text-[#03045e] mb-1"
          style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
        >
          Embed on Your Website
        </h2>
        <p className="text-[12px] text-[#64748b] mb-5">
          Drop this snippet anywhere on your site to show your live changelog in an inline frame.
        </p>

        {/* Code block */}
        <div className="relative rounded-xl bg-[#0f172a] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
            <span className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wider">HTML</span>
            <button
              onClick={copyEmbedCode}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#94a3b8] hover:text-white transition-colors cursor-pointer"
            >
              {embedCopied ? <Check className="w-3 h-3 text-[#22c55e]" /> : <Copy className="w-3 h-3" />}
              {embedCopied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre
            className="px-5 py-4 text-[12px] text-[#94a3b8] font-mono leading-relaxed overflow-x-auto whitespace-pre"
            style={{ margin: 0 }}
          >{`<iframe
  src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget/${slug}"
  width="100%"
  height="480"
  style="border: none; border-radius: 12px;"
  title="${project.name} Changelog"
></iframe>`}</pre>
        </div>

        <p className="text-[11px] text-[#94a3b8] mt-3">
          The widget loads your published changelog entries and updates automatically when you publish new ones.
        </p>
      </section>

      {/* Danger Zone */}
      <section className="bg-white rounded-2xl border border-red-200 shadow-sm p-6">
        <h2
          className="text-[15px] font-bold text-red-600 mb-1"
          style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
        >
          Danger Zone
        </h2>
        <p className="text-[12px] text-[#64748b] mb-4">
          Deleting a project permanently removes all its changelogs, feature requests, and roadmap items.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold text-red-600 border border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Project
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="text-[12px] text-[#475569] mb-3">
              Type <span className="font-bold text-red-600">{project.name}</span> to confirm deletion:
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-red-200 text-[13px] text-[#03045e] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-colors mb-3"
              placeholder={project.name}
              autoFocus
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                disabled={deleteInput !== project.name || deleting}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-colors cursor-pointer ${
                  deleteInput === project.name
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-[#f1f5f9] text-[#94a3b8] cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                {deleting ? 'Deleting...' : 'Permanently Delete'}
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

      {/* Project info footer */}
      <p className="text-[10px] text-[#94a3b8] text-center mt-6">
        Created {new Date(project.created_at).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric',
        })} &middot; ID: {project.id}
      </p>
    </div>
  )
}
