import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { EASE, DURATION } from '@/motion'
import { Nyla } from '@/ui/Nyla'
import { LoadingBackground } from '@/ui/LoadingBackground'

const SETTLE = EASE.settle as [number, number, number, number]

const MESSAGES = [
  { label: 'Identifying clients due for yearly review...', result: '15 found' },
  { label: 'Identifying term policies approaching conversion...', result: '8 found' },
  { label: 'Identifying clients likely to refer you...', result: '9 found' },
]

const PHASE_DURATION = 1800

interface PlanAcceptLoaderProps {
  onComplete: () => void
}

export function PlanAcceptLoader({ onComplete }: PlanAcceptLoaderProps) {
  const [phase, setPhase] = useState(0)
  /* Entrance sequence: the orb first appears centered on the page, then (entered)
   * bumps up as the first line blur-types in; the lines cycle from there. */
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 700)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!entered) return
    const timers = MESSAGES.map((_, i) =>
      setTimeout(() => {
        if (i < MESSAGES.length - 1) {
          setPhase(i + 1)
        } else {
          setTimeout(onComplete, PHASE_DURATION)
        }
      }, (i + 1) * PHASE_DURATION)
    )
    return () => timers.forEach(clearTimeout)
  }, [entered, onComplete])

  const msg = MESSAGES[phase]

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <LoadingBackground style={{ position: 'absolute', inset: 0 }} />

      {/* Nyla orb — 160px. Appears centered on the page, then bumps up 150px as
          the lines begin (entered). Absolute + centered so the text below stays
          viewport-centered. Layers: bump (y) → slow spin (rotate) → soft
          continuous "breathing" scale. */}
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
        <motion.div
          animate={{ y: entered ? -150 : 0 }}
          transition={{ duration: 1.1, ease: SETTLE }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 18, ease: 'linear', repeat: Infinity }}
          >
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
            >
              <Nyla size={160} variant="on-light" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Cycling message — vertically centered; appears once the orb bumps up */}
      {entered && (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', height: 80, width: 668, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={false}
              exit={{ opacity: 0, y: -10, filter: 'blur(8px)', transition: { duration: DURATION.quick, ease: SETTLE } }}
              style={{
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                textAlign: 'center',
                width: '100%',
              }}
            >
              {/* label — blur + soft roll in */}
              <motion.p
                initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: DURATION.dramatic, ease: SETTLE, delay: 0.2 }}
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-sans)',
                  fontSize: 16,
                  lineHeight: '24px',
                  letterSpacing: '0.2px',
                  color: 'var(--nyl-blue-900)',
                }}
              >
                {msg.label}
              </motion.p>
              {/* result (purple) — per-character typewriter blur-in */}
              <p
                aria-label={msg.result}
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-serif)',
                  fontSize: 32,
                  lineHeight: '40px',
                  fontWeight: 400,
                  color: 'var(--nyl-purple-600)',
                }}
              >
                {msg.result.split('').map((ch, i) => (
                  <motion.span
                    key={i}
                    aria-hidden="true"
                    initial={{ opacity: 0, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 0.45, ease: SETTLE, delay: 0.5 + i * 0.05 }}
                    style={{ display: 'inline-block', whiteSpace: 'pre' }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      )}
    </div>
  )
}
