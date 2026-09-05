import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { NYLLogo } from '@/ui/NYLLogo'
import { DriftingBlobs, HighlightBlob } from '@/ui/OnboardingIntroOverlay'
import { Nyla } from '@/ui/Nyla'
import bgIntroOverlay from '@/assets/bg-intro-overlay.png'
import { DURATION, EASE, NYLA_FLIGHT } from '@/motion'

/* ----------------------------------------------------------------------------
 * WelcomeSequence — cinematic intro redesign (Figma 895-3701).
 * Replaces OnboardingIntroOverlay with a purple gradient tagline loop.
 *
 * Slide index:
 *   0     "You build plans for everyone."   — auto-advance
 *   1     "Let's build one for you."        — auto-advance
 *   2–7   "A plan that [tagline]"           — auto-cycle, Get started visible
 *
 * Exit — the Nyla flight (Figma "transition changes", section 1419-14195):
 *   Get started → taglines + CTA fade fast (NYLA_FLIGHT.exitMs), the star is
 *   measured + hidden (captureNylaFlightSource), and onStart fires
 *   immediately. The flight layer (NylaFlight, mounted by DiscoveryFlow) takes
 *   over the orb at its exact centered position and flies her into the
 *   Discovery intro while the purple crossfades out beneath her. The old
 *   middle beat (purple wipe → create-plan screen → star-to-slot) no longer
 *   plays on this path.
 *
 * Gradient: 145deg dark purple → electric blue → purple-pink
 * (Figma: global/purple-900 → purple-600 → purple-500 → purple-400)
 * -------------------------------------------------------------------------- */

const TAGLINES = [
  'makes the most of your time',
  'simplifies your day',
  'stays current as things change.',
  'bubbles up what matters most.',
  'frees you to focus on clients',
  'powers your growth & ambitions.',
] as const

const OPENING_MS = 2000
const HOLD_MS = 1200 // extra hold for slide 1 ("Let's build one for you.")
const TAGLINE_MS = 2600
/* The star renders as <Nyla size={160}> scaled 0.85 — the flight captures its
 * VISUAL size (so scale eases 0.85→1 en route to the 160px landing), the
 * wrapper's current rotation (unwound during the flight), and its drop-shadow
 * (faded out during the scatter). Together these make the swap seamless. */
const STAR_SIZE = 160
const STAR_SCALE = 0.85
/* Star entrance settle time — DURATION.deliberate, in ms (guards early clicks). */
const STAR_ENTER_MS = DURATION.deliberate * 1000

export interface WelcomeSequenceProps {
  onStart: () => void
  advisorName?: string
}

export function WelcomeSequence({ onStart, advisorName = 'Sarah' }: WelcomeSequenceProps) {
  const [slide, setSlide] = useState(0)
  const [exiting, setExiting] = useState(false)
  /* True once the star's entrance has settled — guards Get started so an
   * early click can't capture a half-scale star mid-entrance. */
  const [starReady, setStarReady] = useState(false)

  // Opening slides 0–1: auto-advance (slide 1 holds longer)
  useEffect(() => {
    if (slide >= 2 || exiting) return
    const delay = slide === 1 ? OPENING_MS + HOLD_MS : OPENING_MS
    const t = setTimeout(() => setSlide((s) => s + 1), delay)
    return () => clearTimeout(t)
  }, [slide, exiting])

  // Tagline slides 2–7: auto-cycle, looping
  useEffect(() => {
    if (slide < 2 || exiting) return
    const t = setTimeout(() => setSlide((s) => (s < 7 ? s + 1 : 2)), TAGLINE_MS)
    return () => clearTimeout(t)
  }, [slide, exiting])

  // Star entrance settles once — after that, Get started can capture safely.
  useEffect(() => {
    if (slide < 2 || starReady) return
    const t = setTimeout(() => setStarReady(true), STAR_ENTER_MS)
    return () => clearTimeout(t)
  }, [slide, starReady])

  /* Get started → hand off to Discovery. The star fades out + scales down in
   * place, the taglines/CTA fade fast, and the onboarding root crossfades out
   * beneath (see OnboardingFlow's flight-path exit variant). Discovery's intro
   * orb then fades + scales in. No wipe, no create-plan beat. */
  const beginExit = () => {
    if (exiting || !starReady) return
    setExiting(true)
    onStart()
  }

  const inTaglines = slide >= 2

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden" style={{ color: 'white' }}>
      {/* Background — static; the whole root crossfades out during the flight */}
      <div className="absolute inset-0" style={{ background: 'var(--bg-overlay-dark)' }}>
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
          <span className="text-[15px] text-white/90" style={{ fontFamily: 'var(--font-sans)', fontWeight: 400 }}>
            Welcome, {advisorName}
          </span>
        </div>
      </div>

      {/* Center stack */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 text-center">
        {/* Star — enters on tagline slides. On Get started it fades out and
            scales down in place, handing the moment to Discovery's intro orb. */}
        <AnimatePresence>
          {inTaglines && (
            <motion.div
              key="star"
              id="welcome-exit-star"
              initial={{ rotate: -120, scale: 0.2, opacity: 0 }}
              animate={
                exiting
                  ? { rotate: 0, opacity: 0, scale: STAR_SCALE * 0.55 }
                  : { rotate: 0, opacity: 1, scale: STAR_SCALE, x: 0, y: 0 }
              }
              transition={{ duration: DURATION.deliberate, ease: EASE.settle }}
              /* Negative margin eats the orb's internal glow inset (~29% of size)
               * so the visible sphere sits ~20px above the headline */
              style={{ marginBottom: -26 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                /* Glow from NYLA_FLIGHT.liftGlow — the flight orb carries this
                 * exact shadow at handoff and fades it out during the scatter. */
                style={{
                  filter: `drop-shadow(0 0 ${NYLA_FLIGHT.liftGlow.blurPx}px rgba(${NYLA_FLIGHT.liftGlow.rgb},${NYLA_FLIGHT.liftGlow.alpha}))`,
                }}
              >
                <Nyla size={STAR_SIZE} variant="on-dark" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text area */}
        <div className="relative flex min-h-[120px] w-full max-w-[860px] flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {slide === 0 && (
              <motion.h1
                key="s0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.5, ease: EASE.settle } }}
                transition={{ duration: 0.75, delay: 0.4, ease: EASE.settle }}
                className="text-center text-white"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 300,
                  fontSize: 42,
                  lineHeight: 1.14,
                  letterSpacing: '-0.3px',
                }}
              >
                You build plans for everyone.
              </motion.h1>
            )}

            {slide === 1 && (
              <motion.h1
                key="s1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.deliberate, ease: EASE.settle }}
                className="text-center text-white"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 300,
                  fontSize: 42,
                  lineHeight: 1.14,
                  letterSpacing: '-0.3px',
                }}
              >
                Let&apos;s build one for you.
              </motion.h1>
            )}

            {inTaglines && !exiting && (
              <motion.div
                key="taglines-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                /* Fast fade at Get started — no text survives into the flight */
                exit={{ opacity: 0, transition: { duration: NYLA_FLIGHT.exitMs / 1000, ease: EASE.lift } }}
                transition={{ duration: 0.6, delay: 0.4, ease: EASE.settle }}
                className="flex flex-col items-center"
              >
                {/* "A plan that" — fades in once, never re-renders */}
                <h1
                  className="text-center text-white"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 300,
                    fontSize: 42,
                    lineHeight: 1.14,
                    letterSpacing: '-0.3px',
                  }}
                >
                  A plan that
                </h1>

                {/* Blue completion — character-stagger wipe-on, then fade out */}
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={`tag-${slide}`}
                    className="text-center"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontWeight: 300,
                      fontSize: 42,
                      lineHeight: 1.14,
                      letterSpacing: '-0.3px',
                      color: 'var(--nyl-blue-250)',
                    }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  >
                    {TAGLINES[slide - 2].split('').map((char, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.12, delay: i * 0.028, ease: 'easeOut' }}
                        style={{ display: char === ' ' ? 'inline' : 'inline' }}
                      >
                        {char}
                      </motion.span>
                    ))}
                  </motion.h2>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Get started CTA — visible throughout tagline slides */}
        <AnimatePresence>
          {inTaglines && !exiting && (
            <motion.button
              key="cta"
              type="button"
              onClick={beginExit}
              /* Disabled until the star entrance settles — an early click
               * would capture a half-scale star and pop at the handoff. */
              disabled={!starReady}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              /* Fast fade at Get started — no clickable CTA mid-flight */
              exit={{ opacity: 0, transition: { duration: NYLA_FLIGHT.exitMs / 1000, ease: EASE.lift } }}
              transition={{ duration: 0.5, delay: slide === 2 ? 0.35 : 0, ease: EASE.settle }}
              className="mt-8 rounded-md bg-white px-8 py-3 text-[13.5px] font-semibold text-[var(--nyl-blue-600)] transition-colors hover:bg-white/90"
            >
              Get started
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
