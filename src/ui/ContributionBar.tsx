import { motion } from 'motion/react'
import { EASE, DURATION } from '@/motion'

export interface ContributionSegment {
  label: string
  value: string
  width: number
  bg: string
}

export interface ContributionBarProps {
  segments: ContributionSegment[]
  height?: number
}

export function ContributionBar({ segments, height = 57 }: ContributionBarProps) {
  const total = segments.reduce((s, seg) => s + seg.width, 0)

  return (
    <div>
      <div className="flex flex-wrap items-center gap-6">
        {segments.map((seg) => (
          <span
            key={seg.label}
            className="inline-flex items-center gap-2 text-[12px] leading-[16px] tracking-[0.2px] text-[var(--text-body)]"
          >
            <span aria-hidden="true" className="inline-block size-4 rounded-[1px]" style={{ background: seg.bg }} />
            {seg.label}
          </span>
        ))}
      </div>

      <div className="mt-6 flex w-full overflow-hidden" style={{ height }}>
        {segments.map((seg, i) => (
          <motion.div
            key={seg.label}
            initial={{ width: 0 }}
            whileInView={{ width: `${(seg.width / total) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: DURATION.deliberate, delay: 0.15 + i * 0.12, ease: EASE.settle }}
            className="flex items-center justify-end overflow-hidden"
            style={{ background: seg.bg }}
          >
            <span className="whitespace-nowrap pr-3.5 text-[16px] leading-none tracking-[0.3px] text-[var(--nyl-blue-800)]">
              {seg.value}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
