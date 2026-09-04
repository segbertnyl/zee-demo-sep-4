import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useAppStore } from '@/state/useAppStore'

/* QuickStartTour — shown the first time the advisor lands on the briefing
 * after finishing onboarding. Per Zee: a marketing-style handhold that points
 * at the morning briefing, plan refinement, calendar, and drag-and-drop
 * hierarchy. Replayable at any time by asking the AI assistant. */

type Step = {
  eyebrow: string
  title: string
  body: string
  artHint: string  /* describes the focal area, no DOM-anchored highlight for now */
}

const STEPS: Step[] = [
  {
    eyebrow: '1 of 4 · Morning briefing',
    title: "Your morning briefing lives here.",
    body: "Every day around 8am, Nyla posts what to read, what to act on, and what's running in the background. Open it from the left rail anytime.",
    artHint: 'briefing',
  },
  {
    eyebrow: '2 of 4 · Refine your plan',
    title: "Your plan stays alive.",
    body: "Open the briefcase in the left rail to see your plan. Edit your FYC goal, your case mix, your activity — the OS rebuilds the pace and the math instantly. Re-onboard from the home menu whenever life changes.",
    artHint: 'business',
  },
  {
    eyebrow: '3 of 4 · Calendar + meeting prep',
    title: "Every meeting comes with a brief.",
    body: "The calendar icon shows today and the week. Tap any meeting — the OS already wrote the pre-meeting brief: client context, life events, the question to lead with.",
    artHint: 'calendar',
  },
  {
    eyebrow: '4 of 4 · Make it yours',
    title: "Drag, drop, reorganize.",
    body: "The order of cards in your briefing is yours. Drag what matters to the top. Ask the AI assistant 'show me the tour' anytime to come back here.",
    artHint: 'briefing',
  },
]

export function QuickStartTour() {
  const open = useAppStore((s) => s.quickStartOpen)
  const close = useAppStore((s) => s.closeQuickStart)
  const [idx, setIdx] = useState(0)

  const isLast = idx === STEPS.length - 1
  const isFirst = idx === 0
  const step = STEPS[idx]

  function finish() {
    setIdx(0)
    close()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[180] flex items-end justify-end p-6 md:p-10"
          style={{ background: 'linear-gradient(180deg, rgba(0,10,98,0.10) 0%, rgba(0,10,98,0.32) 100%)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={finish}
        >
          <motion.div
            className="pointer-events-auto w-full max-w-[420px] rounded-2xl border border-white/40 bg-white p-6 shadow-[0_30px_80px_-20px_rgba(0,10,98,0.45)]"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 0.65, 0.05, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--nyl-blue-600)]">
                {step.eyebrow}
              </p>
              <button
                type="button"
                onClick={finish}
                className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400 hover:text-neutral-900"
              >
                Skip
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22 }}
              >
                <h2
                  className="mt-3 font-serif text-[24px] leading-tight tracking-tight text-neutral-900"
                  style={{ fontWeight: 400, textWrap: 'balance' }}
                >
                  {step.title}
                </h2>
                <p className="mt-3 text-[13.5px] leading-[1.55] text-neutral-700">{step.body}</p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5" role="tablist" aria-label="Tour progress">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIdx(i)}
                    aria-label={`Step ${i + 1}`}
                    className={[
                      'h-1.5 rounded-full transition-all',
                      i === idx ? 'w-6 bg-[var(--nyl-blue-500)]' : 'w-1.5 bg-neutral-300 hover:bg-neutral-400',
                    ].join(' ')}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {!isFirst && (
                  <button
                    type="button"
                    onClick={() => setIdx((i) => Math.max(0, i - 1))}
                    className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => (isLast ? finish() : setIdx((i) => i + 1))}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--nyl-blue-500)] px-4 py-1.5 text-[12.5px] font-medium text-white hover:bg-[var(--nyl-blue-600)]"
                >
                  {isLast ? 'Got it' : 'Next'} <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>

            <p className="mt-4 text-[11px] italic leading-snug text-neutral-500">
              Replay anytime — ask the AI assistant <span className="not-italic font-medium text-neutral-700">"show me the tour."</span>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
