import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PublicHeader } from '@/components/public/PublicHeader'
import { ChangelogCard } from '@/components/changelog/ChangelogCard'
import { FeatureRequestForm } from '@/components/public/FeatureRequestForm'
import { PublicRequestItem } from '@/components/public/PublicRequestItem'
import type { FeatureRequest } from '@/types'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const supabase = await createClient()
  const { slug } = await params
  const { data: project } = await supabase.from('projects').select('name, description').eq('slug', slug).single()
  if (!project) return { title: 'Not Found' }
  return {
    title: `${project.name} — Changelog`,
    description: project.description ?? `What's new in ${project.name}`,
  }
}

export default async function PublicChangelogPage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient()
  const { slug } = await params

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('is_public', true)
    .single()

  if (!project) notFound()

  const [{ data: entries }, { data: requests }] = await Promise.all([
    supabase
      .from('changelog_entries')
      .select('*')
      .eq('project_id', project.id)
      .eq('is_published', true)
      .order('published_at', { ascending: false }),
    supabase
      .from('feature_requests')
      .select('*')
      .eq('project_id', project.id)
      .order('vote_count', { ascending: false })
      .limit(20),
  ])

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <PublicHeader name={project.name} description={project.description} />

      <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-10 space-y-16">

        {/* ── Changelog section ── */}
        <section>
          <h2
            className="text-[20px] font-bold text-[#03045e] mb-6"
            style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
          >
            Changelog
          </h2>

          {!entries?.length ? (
            <div className="text-center py-12 rounded-2xl border border-[#e2e8f0] bg-white">
              <p className="text-[#64748b] text-sm">No updates published yet. Check back soon.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {entries.map((entry, idx) => (
                <div key={entry.id}>
                  {/* Timeline separator */}
                  {idx > 0 && (
                    <div className="flex items-center gap-4 my-6">
                      <div className="flex-1 h-px bg-[#e2e8f0]" />
                      <span className="text-[11px] text-[#94a3b8] font-mono flex-shrink-0">
                        {new Date(entry.published_at ?? entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <div className="flex-1 h-px bg-[#e2e8f0]" />
                    </div>
                  )}
                  <ChangelogCard
                    title={entry.title}
                    version={entry.version}
                    content={entry.content}
                    publishedAt={idx === 0 ? (entry.published_at ?? entry.created_at) : null}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Feature Requests section ── */}
        <section>
          <div className="mb-6">
            <h2
              className="text-[20px] font-bold text-[#03045e] mb-1"
              style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
            >
              Feature Requests
            </h2>
            <p className="text-[#64748b] text-sm">Vote on what you want to see next, or suggest something new.</p>
          </div>

          {/* Existing requests */}
          {requests && requests.length > 0 && (
            <div className="space-y-2 mb-8">
              {(requests as FeatureRequest[]).map(req => (
                <PublicRequestItem key={req.id} req={req} />
              ))}
            </div>
          )}

          {/* Submission form */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
            <h3
              className="font-bold text-[#03045e] text-[15px] mb-4"
              style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
            >
              Request a feature
            </h3>
            <FeatureRequestForm projectId={project.id} />
          </div>
        </section>
      </div>
    </div>
  )
}


