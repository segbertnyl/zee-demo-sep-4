import { motion } from 'motion/react'
import { DURATION, EASE } from '@/motion'

export type ProgressBarTone = 'good' | 'warn' | 'neutral'

export interface ProgressBarProps {
  value: number
  tone: ProgressBarTone
  label?: string
}

export function ProgressBar({ value, tone, label }: ProgressBarProps) {
  const color = tone === 'good' ? 'var(--nyl-green-600)' : tone === 'warn' ? 'var(--nyl-orange-400)' : 'var(--nyl-gray-300)'
  const trackColor =
    tone === 'good' ? 'rgba(26,179,130,0.14)' : tone === 'warn' ? 'rgba(246,142,72,0.16)' : 'rgba(148,163,184,0.18)'
  const valueColor =
    tone === 'good' ? 'var(--nyl-green-800)' : tone === 'warn' ? '#c47b1f' : 'var(--nyl-gray-700)'
  const pct = Math.round(value * 100)
  return (
    <div className="mt-2.5">
      {label && (
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-body-muted)]">{label}</p>
      )}
      <div className="relative h-2 w-full overflow-hidden rounded-full" style={{ background: trackColor }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: DURATION.dramatic, ease: EASE.settle }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
            boxShadow: `0 0 0 1px ${color}33`,
          }}
        />
      </div>
      <p className="mt-2 font-serif text-[var(--size-md-01)] leading-none tracking-tight" style={{ color: valueColor, fontWeight: 500 }}>
        {pct}<span className="ml-0.5 text-[11px] font-sans font-medium tracking-normal" style={{ color: valueColor, opacity: 0.7 }}>%</span>
      </p>
    </div>
  )
}
