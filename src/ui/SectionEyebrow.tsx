export interface SectionEyebrowProps {
  eyebrow: string
  divider?: boolean
}

export function SectionEyebrow({ eyebrow, divider = true }: SectionEyebrowProps) {
  return (
    <div className="mt-10 mb-4">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-[var(--text-body-muted)]">{eyebrow}</p>
      {divider && <div className="mt-1.5 h-px w-full" style={{ background: 'var(--border-subtle)' }} />}
    </div>
  )
}
