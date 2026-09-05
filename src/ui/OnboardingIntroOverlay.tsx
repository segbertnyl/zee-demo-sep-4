import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { NYLLogo } from '@/ui/NYLLogo'
import { Nyla } from '@/ui/Nyla'
import { TypewriterText } from '@/ui/TypewriterText'
import { EASE } from '@/motion'
import bgIntroOverlay from '@/assets/bg-intro-overlay.png'

/* ----------------------------------------------------------------------------
 * OnboardingIntroOverlay — full-bleed purple takeover shown at the start of
 * onboarding. Plays a 5-phase choreography:
 *
 *   Phase 0  (0–1.8s)    Opening line 1 typewriters in: "You build plans for everyone."
 *   Phase 1  (1.8–3.6s)  Opening line 2 typewriters in: "Let's build one for you."
 *   Phase 2  (3.6s+)     Sparkle + "A plan that…" tagline cycle; "Get started" CTA fades in.
 *                         Taglines rotate every 2.9s through the 6-item palette.
 *   Phase 3  (+0ms)      Get started clicked → taglines + CTA fade; sparkle scales up alone.
 *   Phase 4  (+850ms)    Purple drawer wipes RIGHT (onReveal mounts the canvas underneath);
 *                         minimized CoS panel fades in top-right; star holds center.
 *   Phase 5  (+1900ms)   Star flies into create-plan's measured slot above the headline.
 *                         (+2950ms) onStart unmounts the now-transparent overlay.
 *
 * Timing constants:
 *   PHASE_1_MS   = 1800   — opening line 1 screen time
 *   PHASE_2_MS   = 3600   — opening line 2 screen time (cumulative)
 *   TAGLINE_MS   = 2900   — time each tagline holds before cycling
 *   EXIT_WIPE_MS = 850    — delay before purple wipe begins
 *   EXIT_FLY_MS  = 1900   — delay before star starts flying to slot
 *   EXIT_DONE_MS = 2950   — delay before overlay unmounts
 *
 * Easing:
 *   Content transitions  — [0.4, 0, 0.2, 1]
 *   Reveal/spring moves  — [0.22, 0.65, 0.05, 1]
 *   Purple wipe          — [0.7, 0, 0.2, 1]  duration: 0.95s
 * -------------------------------------------------------------------------- */

export const INTRO_TAGLINES = [
  'makes the most of your time.',
  'simplifies your day.',
  'stays current as things change.',
  'bubbles up what matters most.',
  'frees you to focus on clients.',
  'powers your growth & ambitions.',
]

const OPENING_LINE_1 = 'You build plans for everyone.'
const OPENING_LINE_2 = "Let's build one for you."

export interface OnboardingIntroOverlayProps {
  onReveal: () => void
  onStart: () => void
  advisorName?: string
}

export function OnboardingIntroOverlay({ onReveal, onStart, advisorName = 'Sarah' }: OnboardingIntroOverlayProps) {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4 | 5>(0)
  const [tagIndex, setTagIndex] = useState(0)
  const starRef = useRef<HTMLDivElement | null>(null)
  const [travel, setTravel] = useState<{ dx: number; dy: number; scale: number } | null>(null)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1800)
    const t2 = setTimeout(() => setPhase(2), 3600)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  const beginExit = () => {
    setPhase(3)
    setTimeout(() => {
      setPhase(4)
      onReveal()
    }, 850)
    setTimeout(() => {
      const star = starRef.current?.getBoundingClientRect()
      const slot = document.getElementById('create-plan-star-slot')?.getBoundingClientRect()
      if (star && slot) {
        setTravel({
          dx: slot.left + slot.width / 2 - (star.left + star.width / 2),
          dy: slot.top + slot.height / 2 - (star.top + star.height / 2),
          scale: slot.width / star.width,
        })
      }
      setPhase(5)
    }, 1900)
    setTimeout(onStart, 2950)
  }

  useEffect(() => {
    if (phase !== 2) return
    const t = setTimeout(() => setTagIndex((i) => (i + 1) % INTRO_TAGLINES.length), 2900)
    return () => clearTimeout(t)
  }, [phase, tagIndex])

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden" style={{ color: 'white' }}>
      {/* Purple drawer — wipes RIGHT in phase 4 */}
      <motion.div
        className="absolute inset-0"
        animate={phase >= 4 ? { x: '100%' } : { x: 0 }}
        transition={{ duration: 0.95, ease: [0.7, 0, 0.2, 1] /* no token equivalent */ }}
        style={{ background: 'var(--bg-overlay-dark)' }}
      >
        <img
          src={bgIntroOverlay}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
        <HighlightBlob />
        <DriftingBlobs />

        <div className="absolute left-7 top-7 z-10 flex items-center gap-3">
          <NYLLogo pixelSize={40} className="rounded-md" />
          <span
            className="font-serif text-[15px] text-white/90"
            style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}
          >
            Welcome, {advisorName}
          </span>
        </div>
      </motion.div>

      {/* Minimized CoS panel — fades in top-right as drawer clears (phase 4) */}
      {phase >= 4 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.55, ease: EASE.settle }}
          className="absolute right-6 top-6 z-20 hidden size-12 items-center justify-center rounded-2xl md:flex"
          style={{ background: 'var(--nyl-purple-700)', boxShadow: '0 0 80px rgba(92,76,121,0.1), 0 0 40px #f4e6ff' }}
        >
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="inline-block size-6"
          >
            <Nyla size={40} variant="on-dark" />
          </motion.span>
        </motion.div>
      )}

      {/* Center stack */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 text-center">
        {/* Sparkle — enters with the tagline cycle (phase 2), then flies to slot (phase 5) */}
        {phase >= 2 && (
          <motion.div
            ref={starRef}
            initial={{ rotate: -180, scale: 0.2, opacity: 0 }}
            animate={
              phase === 5 && travel
                ? { rotate: 0, opacity: 1, x: travel.dx, y: travel.dy, scale: travel.scale }
                : { rotate: 0, opacity: 1, x: 0, y: 0, scale: phase === 2 ? 0.72 : 1 }
            }
            transition={{ duration: phase === 5 ? 0.9 : phase === 3 ? 0.7 : 1.1, ease: EASE.settle }}
            className="mb-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              style={{ filter: 'drop-shadow(0 0 24px rgba(128,186,255,0.6))' }}
            >
              <Nyla size={40} variant="on-dark" />
            </motion.div>
          </motion.div>
        )}

        <div className="relative flex min-h-[220px] w-full max-w-[820px] flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {phase < 2 && (
              <motion.h1
                key={phase === 0 ? 'opening-1' : 'opening-2'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.85, ease: EASE.standard }}
                className="text-center font-serif text-[36px] leading-[1.2] tracking-tight md:text-[44px]"
                style={{
                  fontWeight: 400,
                  fontFamily: 'var(--font-serif)',
                  textWrap: 'balance',
                  willChange: 'opacity, transform',
                }}
              >
                <TypewriterText
                  text={phase === 0 ? OPENING_LINE_1 : OPENING_LINE_2}
                  delayMs={120}
                  perWordMs={130}
                  duration={0.6}
                  blur
                />
              </motion.h1>
            )}

            {phase === 2 && (
              <motion.div
                key="taglines"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, ease: EASE.standard }}
                className="flex flex-col items-center"
                style={{ willChange: 'opacity, transform' }}
              >
                <h1
                  className="font-serif text-[36px] leading-[1.12] tracking-tight text-white md:text-[44px]"
                  style={{ fontWeight: 400, fontFamily: 'var(--font-serif)' }}
                >
                  A plan that
                </h1>
                <div className="relative mt-1 h-[58px] md:h-[62px]">
                  <AnimatePresence mode="wait">
                    <motion.h2
                      key={tagIndex}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -22 }}
                      transition={{ duration: 0.7, ease: EASE.standard }}
                      className="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap font-serif text-[36px] leading-[1.12] tracking-tight md:text-[44px]"
                      style={{
                        fontWeight: 400,
                        fontFamily: 'var(--font-serif)',
                        color: 'var(--nyl-blue-250)',
                        willChange: 'opacity, transform',
                      }}
                    >
                      <TypewriterText text={INTRO_TAGLINES[tagIndex]} perWordMs={110} />
                    </motion.h2>
                  </AnimatePresence>
                </div>

                <motion.button
                  type="button"
                  onClick={beginExit}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.3, ease: EASE.standard }}
                  className="mt-8 rounded-md bg-white px-6 py-2.5 text-[13.5px] font-semibold text-[var(--nyl-purple-900)] transition-colors hover:bg-white/90"
                >
                  Get started
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/* Slowly drifting radial-gradient blobs — keep the purple canvas feeling alive.
 * Each blob has independent loop / phase / amplitude so they never align.
 * theme='dark'  — saturated colors for the dark purple background (default)
 * theme='light' — soft, low-opacity colors for white/near-white backgrounds */
export function DriftingBlobs({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const colors =
    theme === 'light'
      ? [
          'rgba(165,82,224,0.12)', // soft purple
          'rgba(200,100,220,0.09)', // soft violet
          'rgba(255,160,100,0.10)', // warm peach
          'rgba(180,140,255,0.10)', // lavender
        ]
      : ['rgba(143,86,179,0.55)', 'rgba(99,79,150,0.55)', 'rgba(255,176,120,0.50)', 'rgba(180,120,220,0.42)']
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <motion.div
        className="absolute"
        style={{
          left: '-10%',
          top: '15%',
          width: '70%',
          height: '70%',
          borderRadius: '50%',
          background: `radial-gradient(circle at 50% 50%, ${colors[0]} 0%, ${colors[0].replace(/[\d.]+\)$/, '0)')} 100%)`,
          filter: 'blur(80px)',
        }}
        animate={{ x: ['0%', '8%', '-4%', '0%'], y: ['0%', '-6%', '4%', '0%'], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute"
        style={{
          right: '-8%',
          top: '-10%',
          width: '60%',
          height: '60%',
          borderRadius: '50%',
          background: `radial-gradient(circle at 50% 50%, ${colors[1]} 0%, ${colors[1].replace(/[\d.]+\)$/, '0)')} 100%)`,
          filter: 'blur(90px)',
        }}
        animate={{ x: ['0%', '-6%', '6%', '0%'], y: ['0%', '8%', '-4%', '0%'], scale: [1, 0.92, 1.12, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute"
        style={{
          right: '-5%',
          bottom: '-12%',
          width: '55%',
          height: '55%',
          borderRadius: '50%',
          background: `radial-gradient(circle at 50% 50%, ${colors[2]} 0%, ${colors[2].replace(/[\d.]+\)$/, '0)')} 100%)`,
          filter: 'blur(100px)',
        }}
        animate={{ x: ['0%', '5%', '-5%', '0%'], y: ['0%', '-4%', '6%', '0%'], scale: [1, 1.18, 0.95, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute"
        style={{
          left: '20%',
          bottom: '-10%',
          width: '45%',
          height: '45%',
          borderRadius: '50%',
          background: `radial-gradient(circle at 50% 50%, ${colors[3]} 0%, ${colors[3].replace(/[\d.]+\)$/, '0)')} 100%)`,
          filter: 'blur(110px)',
        }}
        animate={{ x: ['0%', '12%', '-8%', '0%'], y: ['0%', '6%', '-6%', '0%'], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

/* Single soft highlight blob — matches the bright blue/indigo accent in the
 * Intro-Overlay background image. Drifts very slowly so the background feels
 * alive without competing with foreground content. */
export function HighlightBlob() {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={{
        right: '-5%',
        top: '5%',
        width: '55%',
        height: '65%',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 50% 50%, rgba(110,130,255,0.38) 0%, transparent 65%)',
        filter: 'blur(60px)',
        mixBlendMode: 'screen',
      }}
      animate={{
        x: ['0%', '6%', '-4%', '3%', '0%'],
        y: ['0%', '5%', '-3%', '6%', '0%'],
        scale: [1, 1.08, 0.96, 1.04, 1],
      }}
      transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

/* IntroSparkle removed — the Nyla Collective orb (src/ui/Nyla.tsx) replaced
 * all sparkle marks. Import { Nyla } instead. */
