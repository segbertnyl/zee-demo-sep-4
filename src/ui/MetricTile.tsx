import { motion } from 'motion/react'
import { EASE, DURATION } from '@/motion'

export interface MetricTileProps {
  label: string
  value: string
  sub?: string
  dot?: string
  delay?: number
  valueSize?: number
}

export function MetricTile({ label, value, sub, dot, delay = 0, valueSize = 32 }: MetricTileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: DURATION['scene-in'], delay, ease: EASE.settle }}
      className="flex h-[133px] flex-col rounded-[4px] border border-[var(--nyl-gray-050)] bg-white px-4 pb-4 pt-2 drop-shadow-[0_0_20px_#f8f7f7]"
    >
      <p className="flex-1 text-[12px] font-medium uppercase leading-[26px] tracking-[2px] text-[var(--text-body)]">
        {label}
      </p>
      <p
        className="font-serif tracking-[0.3px] text-[var(--nyl-purple-600)]"
        style={{ fontWeight: 400, fontSize: valueSize, lineHeight: 1 }}
      >
        {value}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        {sub && <p className="text-[12px] leading-[16px] tracking-[0.2px] text-[var(--text-headline)]">{sub}</p>}
        {dot && <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ background: dot }} />}
      </div>
    </motion.div>
  )
}
