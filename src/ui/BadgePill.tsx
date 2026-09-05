export interface BadgePillProps {
  tone: 'urgent' | 'monitor' | 'opportunity'
  label: string
}

export function BadgePill({ tone, label }: BadgePillProps) {
  const cls =
    tone === 'urgent'
      ? 'bg-[var(--status-off-course-soft)] text-[var(--status-off-course)]'
      : tone === 'opportunity'
        ? 'bg-[var(--nyl-green-200)]/70 text-[var(--nyl-green-800)]'
        : 'bg-[var(--nyl-orange-100)] text-[var(--nyl-orange-500)]'
  return (
    <span
      className={['shrink-0 rounded-md px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.18em]', cls].join(
        ' ',
      )}
    >
      {label}
    </span>
  )
}
