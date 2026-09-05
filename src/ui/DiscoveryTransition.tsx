import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { NYLLogo } from '@/ui/NYLLogo'
import { DriftingBlobs } from '@/ui/OnboardingIntroOverlay'
import { Nyla } from '@/ui/Nyla'
import { EASE, DURATION } from '@/motion'

export interface DiscoveryTransitionProps {
  phase: 'intro' | 'reveal' | 'settled'
  advisorName?: string
  onSettled?: () => void
}

const HEADLINE = (name: string) => `Hi, ${name}. I'm Nyla. Let's build a plan for your practice, your way.`

const BG =
  'linear-gradient(145deg, var(--nyl-purple-900) 0%, var(--nyl-purple-600) 39%, var(--nyl-purple-500) 56%, var(--nyl-purple-400) 71%)'

export function DiscoveryTransition({ phase, advisorName = 'Sarah', onSettled }: DiscoveryTransitionProps) {
  useEffect(() => {
    if (phase !== 'settled' || !onSettled) return
    const t = setTimeout(onSettled, (DURATION.dramatic + 0.1) * 1000)
    return () => clearTimeout(t)
  }, [phase, onSettled])

  const showCard = phase === 'reveal' || phase === 'settled'

  return (
    <div className="relative flex h-full w-full overflow-hidden" style={{ color: 'white' }}>
      <div className="absolute inset-0" style={{ background: BG }}>
        <DriftingBlobs />
        <div className="absolute left-7 top-7 z-10 flex items-center gap-3">
          <NYLLogo pixelSize={40} className="rounded-md" />
          <span className="text-[15px] text-white/90" style={{ fontFamily: 'var(--font-sans)', fontWeight: 400 }}>
            Welcome, {advisorName}
          </span>
        </div>
      </div>

      {phase === 'intro' && (
        <div className="relative z-10 flex flex-1 items-center justify-center">
          <motion.div
            initial={{ rotate: -120, scale: 0.2, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ duration: DURATION.dramatic, ease: EASE.settle }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              style={{ filter: 'drop-shadow(0 0 22px rgba(128,186,255,0.55))' }}
            >
              <Nyla size={40} variant="on-dark" />
            </motion.div>
          </motion.div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {showCard && (
          <motion.div
            key="discovery-card"
            initial={{ opacity: 0, scale: 0.97, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 24 }}
            transition={{ duration: DURATION['scene-in'], ease: EASE.settle }}
            className="absolute inset-[15px] z-20 flex flex-col items-center justify-center overflow-hidden"
            style={{ borderRadius: 16, background: 'var(--bg-surface-elevated)' }}
          >
            <div className="flex flex-col items-center gap-6 px-12 text-center">
              <motion.div
                initial={{ rotate: -120, scale: 0.2, opacity: 0 }}
                animate={{ rotate: 0, scale: 0.9, opacity: 1 }}
                transition={{ duration: DURATION.dramatic, ease: EASE.settle }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                  style={{ filter: 'drop-shadow(0 0 22px rgba(128,186,255,0.55))' }}
                >
                  <Nyla size={40} variant="on-dark" />
                </motion.div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: DURATION.deliberate, ease: EASE.settle, delay: 0.1 }}
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 56,
                  lineHeight: 0.9,
                  letterSpacing: '-0.3px',
                  fontWeight: 300,
                  backgroundImage:
                    phase === 'settled'
                      ? 'linear-gradient(to bottom, white 0%, white 100%)'
                      : 'linear-gradient(to bottom, transparent 0%, white 60%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {HEADLINE(advisorName)}
              </motion.h1>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
