import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { EASE, DURATION, NYLA } from '@/motion'
import { Nyla } from './Nyla'

export interface NylaGuidanceProps {
  text?: string
  children?: ReactNode
  className?: string
}

const LINE_DELAY = NYLA.cardEnter.duration * 0.8

export function NylaGuidance({ text, children, className }: NylaGuidanceProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-start',
        paddingLeft: '16px',
        width: '100%',
      }}
    >
      {/* Left column: Nyla above the gradient line */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          alignSelf: 'stretch',
          flexShrink: 0,
        }}
      >
        {/* Nyla animates in first */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: NYLA.cardEnter.duration, ease: EASE.settle }}
        >
          <Nyla size={40} variant="on-light" />
        </motion.div>
        {/* Line draws downward after Nyla */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: DURATION.deliberate, delay: LINE_DELAY, ease: EASE.settle }}
          style={{
            flex: '1 0 0',
            width: '2px',
            transformOrigin: 'top',
            background:
              'linear-gradient(180deg, rgba(112, 40, 164, 0.00) 0%, #7028A4 16.35%, #0468FF 84.13%, rgba(4, 104, 255, 0.00) 100%)',
          }}
        />
      </div>
      {/* Right column: text blurs in simultaneously with line */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '13px',
          flex: 1,
          paddingTop: '56px',
        }}
      >
          {children ?? (
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '16px',
                lineHeight: '24px',
                letterSpacing: '0.2px',
                color: 'var(--text-headline)',
              }}
            >
              {text && (
                <p style={{ margin: 0, fontWeight: 400 }}>
                  {text.split('').map((ch, i, arr) => (
                    <motion.span
                      key={i}
                      style={{ display: 'inline', whiteSpace: 'pre-wrap' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: 0.25,
                        delay: LINE_DELAY + 0.15 + (i / Math.max(arr.length - 1, 1)) * 0.7,
                        ease: 'easeOut',
                      }}
                    >
                      {ch}
                    </motion.span>
                  ))}
                </p>
              )}
            </div>
          )}
      </div>
    </div>
  )
}
