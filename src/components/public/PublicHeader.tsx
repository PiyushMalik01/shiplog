import Link from 'next/link'

export function PublicHeader({ name, description }: { name: string; description?: string | null }) {
  return (
    <header className="bg-white border-b border-[#e2e8f0] px-6 py-10">
      <div className="max-w-[720px] mx-auto flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-[28px] font-bold text-[#03045e] leading-tight"
            style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
          >
            {name}
          </h1>
          {description && (
            <p className="mt-1.5 text-[15px] text-[#64748b] max-w-lg line-clamp-2">{description}</p>
          )}
        </div>
        <Link
          href="/"
          className="text-[11px] text-[#94a3b8] hover:text-[#64748b] transition-colors no-underline flex-shrink-0"
        >
          Powered by ShipLog
        </Link>
      </div>
    </header>
  )
}
