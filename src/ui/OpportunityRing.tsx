import { motion } from 'motion/react'
import { EASE, DURATION } from '@/motion'

export type OpportunityRingProps = {
  percentToGoal: number
  fycInPlayLabel: string
  fycToDateLabel: string
  ringNudge: string
  streak?: string
}

export function OpportunityRing({
  percentToGoal,
  fycInPlayLabel,
  fycToDateLabel,
  ringNudge,
  streak,
}: OpportunityRingProps) {
  const pct = Math.max(0, Math.min(100, percentToGoal))
  const r = 30
  const C = 2 * Math.PI * r
  const dash = (pct / 100) * C

  return (
    <div className="mt-6 flex flex-wrap items-center gap-5 rounded-2xl border border-[var(--nyl-blue-600)]/15 bg-white/80 px-5 py-4 backdrop-blur-sm">
      <div className="relative flex shrink-0 items-center justify-center" style={{ width: 80, height: 80 }}>
        <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r={r} stroke="rgba(0,10,98,0.08)" strokeWidth="8" fill="none" />
          <motion.circle
            cx="40"
            cy="40"
            r={r}
            stroke="var(--nyl-blue-500)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={{ strokeDashoffset: C - dash }}
            transition={{ duration: DURATION.dramatic, ease: EASE.slide }}
            transform="rotate(-90 40 40)"
          />
        </svg>
        <p
          className="absolute font-serif text-[20px] tracking-tight text-[var(--text-headline)]"
          style={{ fontWeight: 400 }}
        >
          {pct}%
        </p>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[14.5px] font-medium leading-snug text-[var(--text-headline)]">{fycInPlayLabel}</p>
        <p className="mt-1 text-[12.5px] leading-snug text-[var(--text-body)]">{ringNudge}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11.5px] uppercase tracking-[0.16em] text-[var(--text-body-muted)]">
          <span>YTD {fycToDateLabel}</span>
          {streak && (
            <>
              <span aria-hidden="true" className="text-[var(--text-body-faint)]">
                ·
              </span>
              <span className="text-[var(--nyl-green-800)]">{streak}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
