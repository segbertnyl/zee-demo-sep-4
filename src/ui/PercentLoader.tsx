import { motion } from 'motion/react'
import { DURATION, EASE } from '@/motion'

export interface PercentLoaderProps {
  value: number
}

export function PercentLoader({ value }: PercentLoaderProps) {
  const r = 6.4
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.max(0, Math.min(100, value)) / 100)
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="inline-block -rotate-90"
      style={{ filter: 'drop-shadow(0 0 5px color-mix(in srgb, var(--action-primary) 40%, transparent))' }}
    >
      <circle
        cx="8"
        cy="8"
        r={r}
        strokeWidth="2"
        style={{ stroke: 'color-mix(in srgb, var(--action-primary) 22%, transparent)' }}
      />
      <motion.circle
        cx="8"
        cy="8"
        r={r}
        strokeWidth="2"
        strokeLinecap="round"
        style={{ stroke: 'var(--action-primary)' }}
        strokeDasharray={circ}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: DURATION.short, ease: EASE.settle }}
      />
    </svg>
  )
}
