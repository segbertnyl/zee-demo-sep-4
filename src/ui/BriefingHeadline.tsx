import { Fragment, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { EASE, DURATION } from '@/motion'

/* Briefing-v6 main headline — COACH voice (see briefingV6Content.HEADLINES).
 * Changes on scroll position and time of day. Reuses the page's typing reveal
 * but SOFTER: small per-word stagger, a gentle blur-to-sharp on entry, minimal
 * vertical travel. Re-keys on `text` so a new headline re-types. Reduced-motion
 * users get the final string instantly, no typing/blur. */

export interface BriefingHeadlineProps {
  text: string
  reducedMotion?: boolean
  /** ms between word reveals. Subtle by default. */
  perWordMs?: number
  /** Force subtle mode — a single blur-fade for the whole line, NO per-word
   *  typing. Leave undefined for the default: the FIRST reveal types in full,
   *  every later update (scroll / navigate) uses the subtle blur-fade. */
  subtle?: boolean
  className?: string
}

/* Per-word reveal timing. Slowed ~50% from the original (42ms / 0.6s) and given
 * a softer, more gradual blur build so the headline eases in rather than snaps. */
const PER_WORD_MS = 63
const WORD_DURATION = 0.9
/* Update reveal (scroll / navigate): the old line blurs OUT, then the new line
 * blurs IN — sequenced via AnimatePresence mode="wait". Slowed past the prior
 * pass for a calm, unhurried feel. */
const UPDATE_IN = DURATION.deliberate * 3.5 // ~2.1s blur-in
const UPDATE_OUT = DURATION.standard // ~0.42s blur-out first
const EXIT = { opacity: 0, filter: 'blur(8px)', transition: { duration: UPDATE_OUT, ease: EASE.lift } }

export function BriefingHeadline({
  text,
  reducedMotion = false,
  perWordMs = PER_WORD_MS,
  subtle,
  className,
}: BriefingHeadlineProps) {
  const base = 'font-serif text-[clamp(34px,3.4vw,46px)] leading-[1.08] tracking-[-0.012em] text-[var(--text-headline)]'
  const cls = [base, className].filter(Boolean).join(' ')

  /* First reveal types in full; every later update uses the subtle blur-fade.
   * `changed` flips only when `text` differs from the text this instance mounted
   * with — so it stays false through unrelated re-renders (loadPhase, scroll),
   * keeping the first-load typewriter, and StrictMode's double-invoked mount
   * effect can't flip it (text === mount text). An explicit `subtle` overrides. */
  const firstText = useRef(text)
  const [changed, setChanged] = useState(false)
  const isSubtle = subtle ?? changed
  useEffect(() => {
    if (text !== firstText.current) setChanged(true)
  }, [text])

  if (reducedMotion) {
    return (
      <h1 className={cls} style={{ fontWeight: 300 }}>
        {text}
      </h1>
    )
  }

  const words = text.split(' ')
  return (
    <AnimatePresence mode="wait">
      {isSubtle ? (
        /* Update reveal — the previous line blurs out (mode="wait"), then the
         * whole new line eases from blur to sharp. No per-word stagger. */
        <motion.h1
          key={text}
          className={cls}
          style={{ fontWeight: 300 }}
          initial={{ opacity: 0, filter: 'blur(8px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={EXIT}
          transition={{ duration: UPDATE_IN, ease: EASE.settle }}
        >
          {text}
        </motion.h1>
      ) : (
        /* First reveal — per-word blur-to-sharp type-in. Blurs out as a whole
         * line when it's later replaced. */
        <motion.h1 key={text} className={cls} style={{ fontWeight: 300 }} aria-label={text} exit={EXIT}>
          {words.map((w, i) => (
            <Fragment key={`${text}-${i}`}>
              <motion.span
                aria-hidden="true"
                initial={{ opacity: 0, y: 3, filter: 'blur(7px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: WORD_DURATION, delay: (i * perWordMs) / 1000, ease: EASE.settle }}
                className="inline-block"
              >
                {w}
              </motion.span>
              {i < words.length - 1 && ' '}
            </Fragment>
          ))}
        </motion.h1>
      )}
    </AnimatePresence>
  )
}
