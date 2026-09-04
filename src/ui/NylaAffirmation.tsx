import { useEffect } from 'react'
import { motion } from 'motion/react'
import { EASE, DURATION } from '@/motion'
import { Nyla } from './Nyla'
import { LoadingBackground } from './LoadingBackground'

export interface NylaAffirmationProps {
  headline?: string
  description?: string
  headlineAccent?: string  // reserved for future design pass
  duration?: number        // ms before onComplete fires, default 2500
  onComplete: () => void
  className?: string
}

export function NylaAffirmation({
  headline,
  description,
  duration = 2500,
  onComplete,
  className,
}: NylaAffirmationProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, duration)
    return () => clearTimeout(timer)
  }, [onComplete, duration])

  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <LoadingBackground style={{ position: 'absolute', inset: 0 }} />

      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
      }}>
        {/* Orb + caption centered together as a group */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 18, ease: 'linear', repeat: Infinity }}
        >
          <Nyla size={160} variant="on-light" />
        </motion.div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          textAlign: 'center',
        }}>
          {/* Headline — each character blurs + fades in (organic typewriter, one line) */}
          {headline && (
            <p
              style={{
                margin: 0,
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-serif)',
                fontSize: 24,
                lineHeight: '32px',
                fontWeight: 400,
                color: 'var(--nyl-purple-700)',
              }}
            >
              {headline.split('').map((ch, i) => (
                <motion.span
                  key={i}
                  style={{ display: 'inline-block', whiteSpace: 'pre' }}
                  initial={{ opacity: 0, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.03, ease: EASE.settle as [number, number, number, number] }}
                >
                  {ch}
                </motion.span>
              ))}
            </p>
          )}

          {/* Description — body copy, fades up at 700ms (optional) */}
          {description && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: DURATION['scene-in'], ease: EASE.settle as [number, number, number, number] }}
              style={{
                margin: 0,
                fontFamily: 'var(--font-sans)',
                fontSize: 16,
                lineHeight: '24px',
                letterSpacing: '0.2px',
                color: 'var(--nyl-blue-900)',
              }}
            >
              {description}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  )
}
