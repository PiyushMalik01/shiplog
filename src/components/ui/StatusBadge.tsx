const STATUS_MAP: Record<string, { bg: string; text: string; label: string }> = {
  // Feature request statuses
  open:        { bg: 'bg-[#f1f5f9]', text: 'text-[#475569]', label: 'Open' },
  planned:     { bg: 'bg-[#eff8ff]', text: 'text-[#0077b6]', label: 'Planned' },
  in_progress: { bg: 'bg-[#fef9c3]', text: 'text-[#a16207]', label: 'In Progress' },
  done:        { bg: 'bg-[#dcfce7]', text: 'text-[#16a34a]', label: 'Done' },
  // Changelog statuses
  published:   { bg: 'bg-[#dcfce7]', text: 'text-[#16a34a]', label: 'Published' },
  draft:       { bg: 'bg-[#f1f5f9]', text: 'text-[#64748b]', label: 'Draft' },
  // Generic
  active:      { bg: 'bg-[#eff8ff]', text: 'text-[#0077b6]', label: 'Active' },
  archived:    { bg: 'bg-[#f1f5f9]', text: 'text-[#94a3b8]', label: 'Archived' },
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const cfg = STATUS_MAP[status] ?? { bg: 'bg-[#f1f5f9]', text: 'text-[#475569]', label: status }
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.text} ${className}`}>
      {cfg.label}
    </span>
  )
}
