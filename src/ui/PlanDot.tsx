export type PlanDotState = 'done' | 'active' | 'pending'

export interface PlanDotProps {
  state: PlanDotState
}

export function PlanDot({ state }: PlanDotProps) {
  if (state === 'done') {
    return (
      <span aria-hidden="true" className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-body-muted)]">
          <path d="M3 7.5 L6 10.5 L11 4.5" />
        </svg>
      </span>
    )
  }
  if (state === 'active') {
    return (
      <span aria-hidden="true" className="relative mt-1 inline-flex size-3 shrink-0 items-center justify-center">
        <span className="absolute inline-flex size-3 animate-ping rounded-full bg-[var(--nyl-blue-500)] opacity-50" />
        <span className="relative inline-flex size-2.5 rounded-full bg-[var(--nyl-blue-500)] ring-4 ring-[var(--nyl-blue-100)]" />
      </span>
    )
  }
  return <span aria-hidden="true" className="mt-1.5 inline-flex size-1.5 shrink-0 rounded-full bg-neutral-300" />
}
