import { useCallback, useLayoutEffect, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { EASE, DURATION } from '@/motion'

/* Briefing v6 onboarding tour — a stepped coachmark shown once, right after the
 * user finishes Discovery and accepts their plan. Step 1 is a centered card
 * about the briefing page itself; later steps spotlight a nav-rail target
 * (Plan, the Client/Actives/Prospects action boards, Business) with the card
 * anchored beside it. Reduced-motion users get instant, un-animated steps. */

export interface TourStep {
  /** Short label after "N of M ·". */
  eyebrow: string
  title: string
  body: string
  /** data-tour-target value(s) to spotlight. Omitted → centered, page-level. */
  targets?: string[]
}

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

const VPAD = 6 // vertical padding around the spotlighted icon(s)
const CARD_W = 356
const GAP = 22 // gap between the spotlight and the card
const SCRIM = 'rgba(12, 18, 48, 0.42)'

/* Spotlight rect for nav-anchored steps: vertical extent from the target
 * icon(s), but the HORIZONTAL bounds come from the nav rail itself — so the
 * spotlight is exactly the rail's width with the icons centered in it. */
function spotlightRect(targets: string[]): Rect | null {
  const els = targets
    .map((t) => document.querySelector<HTMLElement>(`[data-tour-target="${t}"]`))
    .filter((el): el is HTMLElement => !!el)
  if (!els.length) return null
  let top = Infinity,
    bottom = -Infinity
  els.forEach((el) => {
    const r = el.getBoundingClientRect()
    top = Math.min(top, r.top)
    bottom = Math.max(bottom, r.bottom)
  })
  const rail = document.querySelector<HTMLElement>('[data-tour-rail]')?.getBoundingClientRect()
  const left = rail ? rail.left : Math.min(...els.map((e) => e.getBoundingClientRect().left))
  const width = rail ? rail.width : 56
  return { top, left, width, height: bottom - top }
}

export function BriefingTour({
  steps,
  onClose,
  reducedMotion = false,
}: {
  steps: TourStep[]
  onClose: () => void
  reducedMotion?: boolean
}) {
  const [idx, setIdx] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)
  const step = steps[idx]
  const isLast = idx === steps.length - 1
  const stepKey = step.targets?.join(',') ?? ''

  const measure = useCallback(() => {
    setRect(step.targets?.length ? spotlightRect(step.targets) : null)
  }, [step])

  useLayoutEffect(() => {
    measure()
    // re-measure after any layout settle (e.g. a rail hover/animation)
    const t1 = window.setTimeout(measure, 80)
    const t2 = window.setTimeout(measure, 360)
    window.addEventListener('resize', measure)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.removeEventListener('resize', measure)
    }
  }, [measure])

  const next = () => (isLast ? onClose() : setIdx((i) => i + 1))

  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
  let cardStyle: CSSProperties
  if (rect) {
    const top = Math.max(16, Math.min(rect.top + rect.height / 2 - 150, vh - 320))
    cardStyle = { left: rect.left + rect.width + GAP, top, width: CARD_W }
  } else {
    // centered — numeric (no CSS transform, which Framer's y animation clobbers)
    cardStyle = { left: Math.round((vw - CARD_W) / 2), top: Math.max(24, Math.round(vh * 0.5 - 175)), width: CARD_W }
  }

  return (
    <div className="absolute inset-0 z-[120]">
      {/* click-blocker — transparent when spotlighting (dim comes from the cutout
          box-shadow), dimmed when centered. Swallows clicks so the tour drives. */}
      <div className="absolute inset-0" style={{ background: rect ? 'transparent' : SCRIM }} />

      {/* spotlight cutout — a ring + a 9999px box-shadow dims everything else */}
      {rect && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-[14px]"
          initial={false}
          animate={{ top: rect.top - VPAD, left: rect.left, width: rect.width, height: rect.height + VPAD * 2 }}
          transition={reducedMotion ? { duration: 0 } : { duration: DURATION.standard, ease: EASE.settle }}
          style={{ boxShadow: `0 0 0 2px var(--nyl-blue-500), 0 0 0 9999px ${SCRIM}` }}
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          className="absolute rounded-[20px] bg-white p-6 shadow-[0_24px_70px_-24px_rgba(12,18,48,0.5)]"
          style={cardStyle}
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: DURATION.deliberate, ease: EASE.settle }}
        >
          {/* pointer toward the spotlighted nav item */}
          {rect && (
            <span
              aria-hidden="true"
              className="absolute -left-1.5 top-1/2 size-3.5 -translate-y-1/2 rotate-45 rounded-[3px] bg-white"
            />
          )}

          <div className="flex items-start justify-between gap-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--nyl-blue-500)]">
              {idx + 1} of {steps.length} · {step.eyebrow}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-body-faint)] transition-colors hover:text-[var(--text-body-muted)]"
            >
              Skip
            </button>
          </div>

          <h2
            className="mt-3 font-serif text-[26px] leading-[1.12] tracking-[-0.01em] text-[var(--text-headline)]"
            style={{ fontWeight: 400 }}
          >
            {step.title}
          </h2>
          <p className="mt-2.5 text-[14px] leading-[1.55] text-[var(--text-body-muted)]">{step.body}</p>

          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={[
                    'h-1.5 rounded-full transition-all',
                    i === idx ? 'w-5 bg-[var(--nyl-blue-500)]' : 'w-1.5 bg-[var(--nyl-gray-100)]',
                  ].join(' ')}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--nyl-blue-600)] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[var(--nyl-blue-500)]"
            >
              {isLast ? 'Done' : 'Next'} <span aria-hidden="true">→</span>
            </button>
          </div>

          <p className="mt-4 border-t border-[var(--border-subtle)] pt-3 text-[12px] italic text-[var(--text-body-faint)]">
            Replay anytime — ask Nyla{' '}
            <span className="font-medium not-italic text-[var(--text-body-muted)]">“show me the tour.”</span>
          </p>
          {/* stepKey keeps re-measure keyed to the target set */}
          <span hidden data-step-key={stepKey} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
