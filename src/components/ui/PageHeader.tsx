import type { ReactNode } from 'react'
import Link from 'next/link'

interface BreadcrumbSegment {
  label: string
  href?: string
}

interface PageHeaderProps {
  breadcrumbs?: BreadcrumbSegment[]
  title: string
  subtitle?: string
  right?: ReactNode
}

export function PageHeader({ breadcrumbs, title, subtitle, right }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-[13px] text-[#64748b] mb-2">
          {breadcrumbs.map((seg, idx) => (
            <span key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <span className="text-[#cbd5e1]">›</span>}
              {seg.href ? (
                <Link href={seg.href} className="hover:text-[#0077b6] transition-colors">
                  {seg.label}
                </Link>
              ) : (
                <span className="text-[#03045e] font-medium">{seg.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-[26px] font-bold text-[#03045e] leading-tight"
            style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-[#64748b] text-[14px] mt-1">{subtitle}</p>
          )}
        </div>
        {right && <div className="flex-shrink-0">{right}</div>}
      </div>
    </div>
  )
}
