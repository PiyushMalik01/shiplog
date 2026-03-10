const STATUS_MAP: Record<string, { bg: string; text: string; label: string }> = {
  // Feature request statuses
  open:        { bg: 'bg-[#f1f5f9] dark:bg-white/8',   text: 'text-[#475569] dark:text-slate-300', label: 'Open' },
  planned:     { bg: 'bg-[#eff8ff] dark:bg-[#0077b6]/15', text: 'text-[#0077b6]', label: 'Planned' },
  in_progress: { bg: 'bg-[#fef9c3] dark:bg-yellow-900/30', text: 'text-[#a16207] dark:text-yellow-400', label: 'In Progress' },
  done:        { bg: 'bg-[#dcfce7] dark:bg-green-900/30', text: 'text-[#16a34a] dark:text-green-400', label: 'Done' },
  // Changelog statuses
  published:   { bg: 'bg-[#dcfce7] dark:bg-green-900/30', text: 'text-[#16a34a] dark:text-green-400', label: 'Published' },
  draft:       { bg: 'bg-[#f1f5f9] dark:bg-white/8',   text: 'text-[#64748b] dark:text-slate-400', label: 'Draft' },
  // Generic
  active:      { bg: 'bg-[#eff8ff] dark:bg-[#0077b6]/15', text: 'text-[#0077b6]', label: 'Active' },
  archived:    { bg: 'bg-[#f1f5f9] dark:bg-white/8',   text: 'text-[#94a3b8]', label: 'Archived' },
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
