import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  body?: string
  cta?: ReactNode
}

export function EmptyState({ icon, title, body, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-dashed border-[#e2e8f0] bg-white">
      {icon && (
        <div className="mb-4 text-[#cbd5e1]">
          {icon}
        </div>
      )}
      <p
        className="text-[15px] font-semibold text-[#03045e] mb-1"
        style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
      >
        {title}
      </p>
      {body && (
        <p className="text-[13px] text-[#64748b] max-w-[320px]">{body}</p>
      )}
      {cta && <div className="mt-5">{cta}</div>}
    </div>
  )
}
