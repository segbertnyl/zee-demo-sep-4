import { motion } from 'motion/react'
import { DURATION } from '@/motion'

export type StatusPillStatus = 'on-track' | 'stretch' | 'off-track'

export interface StatusPillProps {
  status: StatusPillStatus
}

const STATUS = {
  'on-track': {
    label: 'On track',
    bg: 'var(--nyl-green-050, #e9fbf0)',
    border: 'var(--nyl-green-200)',
    dot: 'var(--nyl-green-600)',
  },
  'stretch': {
    label: 'Stretch',
    bg: 'var(--nyl-orange-100)',
    border: 'var(--nyl-orange-400)',
    dot: 'var(--nyl-orange-500)',
  },
  'off-track': {
    label: 'Off track',
    bg: 'var(--nyl-orange-100)',
    border: 'var(--nyl-orange-400)',
    dot: 'var(--nyl-orange-500)',
  },
} as const

/** Small status pill: a colored dot + uppercase label. Green when on track,
 *  purple when stretching past the recommended range, orange when off track.
 *  Animates between states. */
export function StatusPill({ status }: StatusPillProps) {
  const s = STATUS[status]

  return (
    <motion.div
      animate={{ background: s.bg, borderColor: s.border }}
      transition={{ duration: DURATION.deliberate }}
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        // 16px left / 20px right padding.
        padding: '8px 20px 8px 16px',
        borderRadius: 40,
        border: '1px solid',
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ background: s.dot }}
        transition={{ duration: DURATION.deliberate }}
        style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0 }}
      />
      <span style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 12,
        fontWeight: 500,
        lineHeight: '16.5px',
        letterSpacing: '1.76px',
        textTransform: 'uppercase',
        color: 'var(--text-body-secondary)',
        whiteSpace: 'nowrap',
      }}>
        {s.label}
      </span>
    </motion.div>
  )
}
