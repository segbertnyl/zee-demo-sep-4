import React from 'react'
import { motion } from 'motion/react'
import { EASE, DURATION } from '@/motion'
import { Nyla } from './Nyla'

export type SectionHeaderVariant = 'primary' | 'secondary'

export interface SectionHeaderProps {
  variant?: SectionHeaderVariant
  heading: string
  body?: React.ReactNode
  showNyla?: boolean
  className?: string
  animated?: boolean
  /** Sequence the orb first (fade in + scale up while it forms), then reveal the
   *  heading/body after a beat. Primary variant only. */
  nylaSequence?: boolean
}

export function SectionHeader({
  variant = 'secondary',
  heading,
  body,
  showNyla = true,
  className,
  animated = false,
  nylaSequence = false,
}: SectionHeaderProps) {
  const cls = ['flex flex-col gap-6 items-start w-full', className]
    .filter(Boolean)
    .join(' ')

  // Sequenced entrance: the orb waits for the previous screen to clear, then fades/
  // scales in; the copy follows once the orb is in.
  const orbDelay = nylaSequence ? 0.5 : 0
  const headingDelay = nylaSequence ? 1.2 : 0
  const bodyDelay = nylaSequence ? 1.35 : 0
  const orbSize = nylaSequence ? 96 : 160

  if (variant === 'primary') {
    return (
      <div className={cls} style={nylaSequence ? { position: 'relative' } : undefined}>
        {showNyla && (
          nylaSequence ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: DURATION.deliberate, ease: EASE.settle as [number, number, number, number], delay: orbDelay }}
              style={{ transformOrigin: 'left center', position: 'absolute', bottom: '100%', left: 0, marginBottom: 24 }}
            >
              <Nyla size={orbSize} variant="on-light" align="left" />
            </motion.div>
          ) : (
            <Nyla size={orbSize} variant="on-light" align="left" />
          )
        )}
        {animated ? (
          <motion.div
            style={{ margin: 0 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.quick, ease: EASE.settle as [number, number, number, number], delay: headingDelay }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 42,
                lineHeight: 'var(--line-display-03)',
                letterSpacing: '-0.3px',
                color: 'var(--nyl-blue-800)',
                margin: 0,
              }}
            >
              {heading}
            </h2>
          </motion.div>
        ) : (
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 42,
              lineHeight: 'var(--line-display-03)',
              letterSpacing: '-0.3px',
              color: 'var(--nyl-blue-800)',
              margin: 0,
            }}
          >
            {heading}
          </h2>
        )}
        {body && (
          animated ? (
            <motion.div
              style={{ margin: 0 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.quick, ease: EASE.settle as [number, number, number, number], delay: bodyDelay }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--size-md-01)',
                  lineHeight: 'var(--line-md-01)',
                  color: 'var(--text-headline)',
                  letterSpacing: '0.3px',
                  margin: 0,
                }}
              >
                {body}
              </p>
            </motion.div>
          ) : (
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--size-md-01)',
                lineHeight: 'var(--line-md-01)',
                color: 'var(--text-headline)',
                letterSpacing: '0.3px',
                margin: 0,
              }}
            >
              {body}
            </p>
          )
        )}
      </div>
    )
  }

  return (
    <div className={cls}>
      {animated ? (
        <motion.div
          style={{ margin: 0 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.quick, ease: EASE.settle as [number, number, number, number] }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'var(--size-lg-01)',
              lineHeight: 1.2,
              color: 'var(--text-headline)',
              margin: 0,
            }}
          >
            {heading}
          </h2>
        </motion.div>
      ) : (
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'var(--size-lg-01)',
            lineHeight: 1.2,
            color: 'var(--text-headline)',
            margin: 0,
          }}
        >
          {heading}
        </h2>
      )}
      {body && (
        animated ? (
          <motion.div
            style={{ margin: 0 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.quick, ease: EASE.settle as [number, number, number, number] }}
          >
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 16,
                lineHeight: '24px',
                color: 'var(--text-body)',
                letterSpacing: '0.2px',
                margin: 0,
              }}
            >
              {body}
            </p>
          </motion.div>
        ) : (
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 16,
              lineHeight: '24px',
              color: 'var(--text-body)',
              letterSpacing: '0.2px',
              margin: 0,
            }}
          >
            {body}
          </p>
        )
      )}
    </div>
  )
}
