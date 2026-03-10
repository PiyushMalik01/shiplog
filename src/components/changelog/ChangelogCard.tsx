import type { ChangelogContent } from '@/types'

const categoryConfig = {
  new:      { label: 'New',      dot: 'bg-[#16a34a]', text: 'text-[#16a34a]',  textColor: '#16a34a' },
  improved: { label: 'Improved', dot: 'bg-[#0077b6]', text: 'text-[#0077b6]',  textColor: '#0077b6' },
  fixed:    { label: 'Fixed',    dot: 'bg-[#dc2626]', text: 'text-[#dc2626]',  textColor: '#dc2626' },
}

export function ChangelogCard({ title, version, content, publishedAt }: {
  title: string
  version?: string | null
  content: ChangelogContent
  publishedAt?: string | null
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          {version && (
            <span className="inline-block font-mono text-[11px] text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded mb-2">
              v{version}
            </span>
          )}
          <h3
            className="text-[18px] font-bold text-[#03045e] leading-snug"
            style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
          >
            {title}
          </h3>
        </div>
        {publishedAt && (
          <span className="flex-shrink-0 text-[12px] text-[#94a3b8] mt-1">
            {new Date(publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {(['new', 'improved', 'fixed'] as const).map(cat => {
          const items = content[cat]
          if (!items?.length) return null
          const cfg = categoryConfig[cat]
          return (
            <div key={cat} className="pl-3 border-l-2" style={{ borderLeftColor: cfg.textColor }}>
              <p className={`text-[11px] font-bold uppercase tracking-widest mb-1.5 ${cfg.text}`}>{cfg.label}</p>
              <ul className="space-y-1.5">
                {items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#475569]">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
