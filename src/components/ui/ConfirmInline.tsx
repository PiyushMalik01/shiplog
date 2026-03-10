'use client'

interface ConfirmInlineProps {
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmInline({
  message = 'Are you sure?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmInlineProps) {
  return (
    <div className="flex items-center gap-2 text-[13px]">
      <span className="text-[#64748b]">{message}</span>
      <button
        onClick={onConfirm}
        disabled={loading}
        className="font-semibold text-[#dc2626] hover:text-[#b91c1c] transition-colors disabled:opacity-50"
      >
        {loading ? 'Please wait…' : confirmLabel}
      </button>
      <span className="text-[#e2e8f0]">·</span>
      <button
        onClick={onCancel}
        disabled={loading}
        className="text-[#64748b] hover:text-[#334155] transition-colors disabled:opacity-50"
      >
        {cancelLabel}
      </button>
    </div>
  )
}
