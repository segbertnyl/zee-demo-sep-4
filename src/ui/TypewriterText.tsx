import { Fragment } from 'react'
import { motion } from 'motion/react'
import { DURATION, EASE } from '@/motion'

export interface TypewriterTextProps {
  text: string
  perWordMs?: number
  delayMs?: number
  duration?: number
  blur?: boolean
}

export function TypewriterText({
  text,
  perWordMs = 110,
  delayMs = 0,
  duration = DURATION.short,
  blur = false,
}: TypewriterTextProps) {
  const words = text.split(' ')
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={`${text}-${i}`}>
          <motion.span
            initial={{ opacity: 0, y: 6, filter: blur ? 'blur(6px)' : 'blur(0px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration, delay: (delayMs + i * perWordMs) / 1000, ease: EASE.settle }}
            className="inline-block"
          >
            {w}
          </motion.span>
          {i < words.length - 1 && ' '}
        </Fragment>
      ))}
    </>
  )
}
