import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const supabase = await createClient()
  const { slug } = await params
  const { data: project } = await supabase
    .from('projects')
    .select('name')
    .eq('slug', slug)
    .eq('is_public', true)
    .single()
  if (!project) return { title: 'Changelog' }
  return { title: `${project.name} — Changelog` }
}

export default async function WidgetPage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient()
  const { slug } = await params

  const { data: project } = await supabase
    .from('projects')
    .select('id, name, description')
    .eq('slug', slug)
    .eq('is_public', true)
    .single()

  if (!project) notFound()

  const { data: entries } = await supabase
    .from('changelog_entries')
    .select('id, title, version, content, published_at, created_at')
    .eq('project_id', project.id)
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(20)

  return (
    <div
      style={{
        fontFamily: 'DM Sans, system-ui, -apple-system, sans-serif',
        backgroundColor: '#ffffff',
        minHeight: '100vh',
        padding: '20px 16px',
        boxSizing: 'border-box',
        color: '#1e293b',
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '14px',
          marginBottom: '20px',
        }}
      >
        <p
          style={{
            fontSize: '17px',
            fontWeight: 700,
            color: '#03045e',
            margin: 0,
            letterSpacing: '-0.01em',
            fontFamily: 'Syne, DM Sans, system-ui, sans-serif',
          }}
        >
          {project.name}
        </p>
        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '3px 0 0', fontWeight: 400 }}>
          Product updates
        </p>
      </div>

      {/* Entries */}
      {!entries?.length ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 16px',
            color: '#94a3b8',
            fontSize: '13px',
          }}
        >
          No updates published yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {entries.map((entry, idx) => {
            const totalItems =
              (entry.content?.new?.length ?? 0) +
              (entry.content?.improved?.length ?? 0) +
              (entry.content?.fixed?.length ?? 0)

            const dateStr = new Date(entry.published_at ?? entry.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })

            return (
              <div
                key={entry.id}
                style={{
                  display: 'flex',
                  gap: '16px',
                  paddingBottom: idx < (entries?.length ?? 0) - 1 ? '20px' : '0',
                  marginBottom: idx < (entries?.length ?? 0) - 1 ? '0' : '0',
                }}
              >
                {/* Timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#0077b6',
                      marginTop: '5px',
                      flexShrink: 0,
                    }}
                  />
                  {idx < (entries?.length ?? 0) - 1 && (
                    <div
                      style={{
                        width: '1px',
                        flex: 1,
                        backgroundColor: '#e2e8f0',
                        marginTop: '6px',
                      }}
                    />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, paddingBottom: idx < (entries?.length ?? 0) - 1 ? '16px' : '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    {entry.version && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontFamily: 'monospace',
                          color: '#64748b',
                          backgroundColor: '#f1f5f9',
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        v{entry.version}
                      </span>
                    )}
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#03045e' }}>
                      {entry.title}
                    </span>
                  </div>

                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 8px' }}>{dateStr}</p>

                  {/* Change pills */}
                  {totalItems > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {entry.content?.new?.map((item: string, i: number) => (
                        <div key={`n-${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <span
                            style={{
                              fontSize: '9px',
                              fontWeight: 700,
                              backgroundColor: '#dcfce7',
                              color: '#16a34a',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              flexShrink: 0,
                              marginTop: '2px',
                              letterSpacing: '0.03em',
                              textTransform: 'uppercase',
                            }}
                          >
                            New
                          </span>
                          <span style={{ fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>{item}</span>
                        </div>
                      ))}
                      {entry.content?.improved?.map((item: string, i: number) => (
                        <div key={`imp-${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <span
                            style={{
                              fontSize: '9px',
                              fontWeight: 700,
                              backgroundColor: '#eff8ff',
                              color: '#0077b6',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              flexShrink: 0,
                              marginTop: '2px',
                              letterSpacing: '0.03em',
                              textTransform: 'uppercase',
                            }}
                          >
                            Improved
                          </span>
                          <span style={{ fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>{item}</span>
                        </div>
                      ))}
                      {entry.content?.fixed?.map((item: string, i: number) => (
                        <div key={`fx-${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <span
                            style={{
                              fontSize: '9px',
                              fontWeight: 700,
                              backgroundColor: '#fef9c3',
                              color: '#a16207',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              flexShrink: 0,
                              marginTop: '2px',
                              letterSpacing: '0.03em',
                              textTransform: 'uppercase',
                            }}
                          >
                            Fixed
                          </span>
                          <span style={{ fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          borderTop: '1px solid #f1f5f9',
          paddingTop: '14px',
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <span style={{ fontSize: '10px', color: '#cbd5e1', letterSpacing: '0.02em' }}>
          Powered by ShipLog
        </span>
      </div>
    </div>
  )
}
