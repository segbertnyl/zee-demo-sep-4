import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useAppStore } from '@/state/useAppStore'
import { NYLLogo } from '@/ui/NYLLogo'
import { TypewriterText } from '@/ui/TypewriterText'
import { WelcomeSequence } from '@/ui/WelcomeSequence'
import { StageRail } from '@/ui/StageRail'
import { PlanRail } from '@/ui/PlanRail'
import { CreatingBriefing } from '@/ui/CreatingBriefing'
import { PercentLoader } from '@/ui/PercentLoader'
import { Nyla } from '@/ui/Nyla'
import { DURATION, EASE, NYLA_FLIGHT } from '@/motion'

/* v5.5 Onboarding — generative-UI conversation flow.
 *
 * Each step is a "row" in a vertical conversation thread. When the advisor
 * answers, the row collapses to a one-line summary (question label + answer
 * chip) and stacks at the top; the next step's full UI fades in below and the
 * canvas centers it in focus.
 *
 * Visual system pulled directly from the Exploration pt-II Figma deck
 * (file VCjqlGu9kQVy2i5nqDxKqa) — purple "Building your plan" right rail,
 * purple stage rail while in goal-setting, blue rail thereafter, off-white
 * canvas with a peach corner glow.
 */

export type OnboardingMode = 'first-run' | 'reorg' | 'revisit-goals'

type StageId = 'background' | 'goals' | 'practice' | 'brand'

const STAGES: { id: StageId; label: string; sub: string }[] = [
  { id: 'background', label: 'Your background', sub: '' },
  { id: 'goals', label: 'Goals', sub: '' },
  { id: 'practice', label: 'Practice', sub: '' },
  { id: 'brand', label: '', sub: '' },
]

type StepId =
  | 'profile'
  | 'goals-intro'
  | 'advisor-vision'
  | 'direction'
  | 'fyc-target'
  | 'council-level'
  | 'activity-target'
  | 'outside-work'
  | 'growth-intro'
  | 'progress-areas'
  | 'growth-focus'
  | 'time-pulls'
  | 'time-open'
  | 'clients-intro'
  | 'client-signals'
  | 'client-activities'
  | 'client-conversations'
  | 'stay-in-front'
  | 'life-events'
  | 'plan'

const STEP_STAGE: Record<StepId, StageId | null> = {
  profile: 'background',
  'goals-intro': 'goals',
  'advisor-vision': 'goals',
  direction: 'goals',
  'fyc-target': 'goals',
  'council-level': 'goals',
  'activity-target': 'goals',
  'outside-work': 'goals',
  'growth-intro': 'practice',
  'progress-areas': 'practice',
  'growth-focus': 'practice',
  'time-pulls': 'practice',
  'time-open': 'practice',
  'clients-intro': 'practice',
  'client-signals': 'practice',
  'client-activities': 'practice',
  'client-conversations': 'practice',
  'stay-in-front': 'practice',
  'life-events': 'practice',
  plan: 'brand',
}

/* NOTE (2026-07-02): the old 'create-plan' welcome step was removed — the
 * welcome now hands off straight to Discovery via the Nyla flight, so the
 * questionnaire is only entered via revisit-goals (which starts at
 * goals-intro). The data-driven profile review leads, then the rest. */
const STEPS: StepId[] = [
  'profile',
  'goals-intro',
  'direction',
  'fyc-target',
  'council-level',
  'activity-target',
  'advisor-vision',
  'outside-work',
  'growth-intro',
  'progress-areas',
  'growth-focus',
  'time-pulls',
  'time-open',
  'clients-intro',
  'client-signals',
  'client-activities',
  'client-conversations',
  'stay-in-front',
  'life-events',
  'plan',
]

/* Steps that lead a new section — these land anchored at the TOP of the
 * scroller (like the opening Chief-of-Staff slide) rather than centered, so a
 * new section reads as a fresh page. The advisor can still scroll back up. */
const SECTION_LEAD_STEPS = new Set<StepId>(['goals-intro', 'growth-intro', 'clients-intro'])

/* Per-question load-in choreography: after the CTA there's a ~0.5s pause, then
 * the question heading appears, and 300ms later the interactive block (the
 * selection inputs in their white containment) builds in. */
const Q_REVEAL_EASE = [0.22, 0.65, 0.05, 1] as const
const Q_HEAD_DELAY = 0.5
const Q_BODY_DELAY = Q_HEAD_DELAY + 0.3

/* Copy for the top-right "processing" pill — advances one line per Goals input
 * after the first, so the OS reads as actively working through the answers. */
const PROCESSING_COPY = [
  'Processing your inputs',
  'Personalizing',
  'Calibrating',
  'Refining your plan',
  'Mapping your goals',
  'Almost there',
]

export type Goals = {
  longTermTags: string[] /* e.g. "Holistic Advising", "Eagle Status" */
  fycTarget: number | null
  councilLevel: string | null
  approach: string | null
  clientApproach: { existing?: string; new?: string }
  progressAreas: string[] /* picks from "How do you want to grow this year?" — drive the growth-focus follow-up */
}

const EMPTY_GOALS: Goals = {
  longTermTags: [],
  fycTarget: null,
  councilLevel: null,
  approach: null,
  clientApproach: {},
  progressAreas: [],
}

/* Pre-populated answers used when the advisor returns to the flow after having
 * already completed onboarding (e.g. via "Adjust my goals" from the quarterly
 * reflection). Values match the advisor profile shown in the prototype. */
const DEMO_GOALS: Goals = {
  longTermTags: ['Holistic Advising', 'Eagle Status'],
  fycTarget: 55000,
  councilLevel: 'Executive',
  approach: 'Holistic Advising',
  clientApproach: {
    existing: 'Prioritize deepening your existing relationships in the long term',
    new: 'Explore new long term prospects and discover events to broaden your branded reach',
  },
  progressAreas: ['holistic', 'eagle', 'referrals'],
}

export function OnboardingFlow() {
  const open = useAppStore((s) => s.onboardingOpen)
  const close = useAppStore((s) => s.closeOnboarding)
  const openDiscoveryFromOnboarding = useAppStore((s) => s.openDiscoveryFromOnboarding)
  const discoveryFromOnboarding = useAppStore((s) => s.discoveryFromOnboarding)
  const setScene = useAppStore((s) => s.setScene)
  const mode = useAppStore((s) => s.onboardingMode)

  /* The whole thread stays mounted: we render STEPS[0..activeIndex] and only
   * advance the index. Keeping prior steps mounted preserves their answers /
   * selections when the advisor scrolls back — they stay full-size, never
   * collapse to a summary. */
  const [activeIndex, setActiveIndex] = useState(0)
  const [goals, setGoals] = useState<Goals>(EMPTY_GOALS)
  const [introOpen, setIntroOpen] = useState(true)
  /* Steps only mount for revisit-goals (set true in the open effect) — the
   * first-run/reorg welcome now hands off straight to Discovery. */
  const [stepsRevealed, setStepsRevealed] = useState(false)
  const [creating, setCreating] = useState(false)
  /* Section-transition "Processing…" beat — set true when crossing into a new
   * section, held briefly by an effect, then faded to reveal the section lead. */
  const [sectionVeil, setSectionVeil] = useState(false)
  /* Which step is centered in the scroller — that one renders at full opacity,
   * the rest dim. Scrolling back up re-centers (and re-brightens) prior steps. */
  const [focusedIndex, setFocusedIndex] = useState(0)
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const innerRef = useRef<HTMLDivElement | null>(null)
  const activeRef = useRef<HTMLDivElement | null>(null)
  /* Suppresses scroll-driven focus updates while we're programmatically
   * auto-scrolling to a new step (prevents the focus flickering through
   * intermediate steps mid-animation). */
  const autoScrollingRef = useRef(false)
  const scrollTickRef = useRef(false)

  useEffect(() => {
    if (!open) return
    if (mode === 'revisit-goals') {
      const startIdx = STEPS.indexOf('goals-intro')
      setActiveIndex(startIdx)
      setFocusedIndex(startIdx)
      setGoals(DEMO_GOALS)
      setIntroOpen(false)
      setStepsRevealed(true)
      setCreating(false)
      setSectionVeil(false)
    } else {
      setActiveIndex(0)
      setFocusedIndex(0)
      setGoals(EMPTY_GOALS)
      setIntroOpen(true)
      setStepsRevealed(false)
      setCreating(false)
      setSectionVeil(false)
    }
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, close, mode])

  /* Hold the section-transition "Processing…" beat for one beat, then fade it
   * away — it covers the auto-scroll that anchors the new section lead to the
   * top of the page, then clears to reveal it settling into place. */
  useEffect(() => {
    if (!sectionVeil) return
    const t = setTimeout(() => setSectionVeil(false), 900)
    return () => clearTimeout(t)
  }, [sectionVeil])

  /* Smooth-scroll the active step into view — section leads anchor to the top
   * animation is cancellable — any user wheel / touch / pointer interaction
   * with the scroller during the animation aborts it, so the advisor can
   * scroll up to review previous answers without fighting our auto-scroll. */
  useLayoutEffect(() => {
    if (!open) return
    const scroller = scrollerRef.current
    const node = activeRef.current
    if (!scroller || !node) return

    autoScrollingRef.current = true
    let cancelFn: (() => void) | null = null
    const rafId = requestAnimationFrame(() => {
      let target: number
      if (SECTION_LEAD_STEPS.has(STEPS[activeIndex])) {
        /* Section leads anchor to the top of the page (like the opening slide),
         * not centered — the new section reads as a fresh page. Small gap above
         * so the header sits like the first slide rather than jammed to the edge. */
        target = node.offsetTop - 32
      } else {
        const nodeRect = node.getBoundingClientRect()
        const scrollerRect = scroller.getBoundingClientRect()
        const offset = nodeRect.top - scrollerRect.top - (scroller.clientHeight - nodeRect.height) / 2
        target = scroller.scrollTop + offset
      }
      cancelFn = smoothScrollTo(scroller, Math.max(0, target), 820)
    })
    const settle = window.setTimeout(() => {
      autoScrollingRef.current = false
    }, 900)

    /* User interaction aborts the auto-scroll and hands focus tracking back
     * to the scroll position immediately. */
    const abort = () => {
      autoScrollingRef.current = false
      cancelFn?.()
    }
    scroller.addEventListener('wheel', abort, { passive: true })
    scroller.addEventListener('touchstart', abort, { passive: true })
    scroller.addEventListener('pointerdown', abort, { passive: true })
    scroller.addEventListener('keydown', abort)

    return () => {
      cancelAnimationFrame(rafId)
      window.clearTimeout(settle)
      abort()
      scroller.removeEventListener('wheel', abort)
      scroller.removeEventListener('touchstart', abort)
      scroller.removeEventListener('pointerdown', abort)
      scroller.removeEventListener('keydown', abort)
    }
  }, [activeIndex, open])

  /* On manual scroll, brighten whichever step is closest to the scroller's
   * vertical center and dim the others. rAF-throttled. */
  function handleScroll() {
    if (autoScrollingRef.current || scrollTickRef.current) return
    scrollTickRef.current = true
    requestAnimationFrame(() => {
      scrollTickRef.current = false
      const scroller = scrollerRef.current
      const inner = innerRef.current
      if (!scroller || !inner) return
      const mid = scroller.scrollTop + scroller.clientHeight / 2
      let best = 0
      let bestDist = Infinity
      Array.from(inner.children).forEach((child, i) => {
        const el = child as HTMLElement
        const center = el.offsetTop + el.offsetHeight / 2
        const dist = Math.abs(center - mid)
        if (dist < bestDist) {
          bestDist = dist
          best = i
        }
      })
      setFocusedIndex(best)
    })
  }

  function advance(opts: { answer?: string | null; goals?: Partial<Goals>; skipTo?: StepId } = {}) {
    if (opts.goals) setGoals((g) => mergeGoals(g, opts.goals!))
    const next = opts.skipTo ? STEPS.indexOf(opts.skipTo) : Math.min(activeIndex + 1, STEPS.length - 1)
    /* Crossing a section boundary plays the "Processing…" beat that covers the
     * scroll and reveals the next section lead anchored at the top. */
    const nextStage = STEP_STAGE[STEPS[next]]
    if (nextStage && nextStage !== STEP_STAGE[STEPS[activeIndex]]) {
      setSectionVeil(true)
    }
    setActiveIndex(next)
    setFocusedIndex(next)
  }

  /* Stage-rail navigation — jump the thread to the first mounted step of a
   * stage the advisor has already reached. Doesn't touch activeIndex, so every
   * answered step stays mounted; this only re-centers the scroller (back or
   * forward) and hands focus to that step. */
  function jumpToStage(stage: StageId) {
    const idx = STEPS.findIndex((id, i) => i <= activeIndex && STEP_STAGE[id] === stage)
    const scroller = scrollerRef.current
    const node = innerRef.current?.children[idx] as HTMLElement | undefined
    if (idx === -1 || !scroller || !node) return
    autoScrollingRef.current = true
    const target = node.offsetTop - (scroller.clientHeight - node.offsetHeight) / 2
    smoothScrollTo(scroller, Math.max(0, target), 820)
    setFocusedIndex(idx)
    window.setTimeout(() => {
      autoScrollingRef.current = false
    }, 900)
  }

  /* Onboarding wraps up onto the Plan page — the plan they just built is the
   * natural landing, not the briefing. */
  function finish() {
    markOnboardingCompleted()
    setScene('plan')
    close()
  }

  /* "Save and exit" — leave onboarding for the Briefing without finishing. */
  function saveAndExit() {
    setScene('briefing')
    close()
  }

  /* "Create my briefing" plays a short generative beat, then closes the
   * onboarding — the dialog's long exit fade dissolves the purple into the
   * briefing underneath rather than snapping to it. */
  function createBriefing() {
    setCreating(true)
    window.setTimeout(finish, 1850)
  }

  /* The rail highlights the stage of whichever step is centered (focused), so
   * it tracks scroll-back; clickability is keyed off the furthest step reached
   * (activeIndex), so filled-out stages stay navigable in both directions. */
  const focusedStage = STEP_STAGE[STEPS[focusedIndex]]
  const stageIndex = focusedStage ? STAGES.findIndex((s) => s.id === focusedStage) : -1
  const reachedStages = STAGES.map((s) => STEPS.some((id, i) => i <= activeIndex && STEP_STAGE[id] === s.id))
  /* Top-right purple element progresses through three states: a minimized
   * square (before Goals) → a "processing" pill once the first Goals question
   * (direction) is answered, its copy cycling per input → the full "Building
   * your plan" panel once the Goals section completes. */
  const goalsStarted = activeIndex > STEPS.indexOf('direction')
  const goalsComplete = activeIndex >= STEPS.indexOf('growth-intro')
  const businessDone = activeIndex >= STEPS.indexOf('clients-intro')
  const clientsDone = activeIndex >= STEPS.indexOf('plan')
  const processingCopy =
    PROCESSING_COPY[Math.max(0, activeIndex - STEPS.indexOf('direction') - 1) % PROCESSING_COPY.length]

  /* "Save and exit" appears once the advisor has answered the first Goals
   * question (direction) and stays for the rest of the flow. */
  const showSaveExit = goalsStarted

  return (
    /* `custom` (not a plain conditional exit prop) because AnimatePresence
     * freezes an exiting child's props at its last present render — the flight
     * flag flips in the same render that unmounts this dialog, so only
     * `custom` delivers the fresh value to the exit variant. */
    <AnimatePresence custom={discoveryFromOnboarding}>
      {open && (
        <motion.div
          key="onboarding-v55"
          role="dialog"
          aria-label="Onboarding"
          className="overlay-bleed z-[200] flex items-stretch"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          /* Nyla-flight path (→ Discovery): the purple welcome soft-crossfades
           * out beneath her over the flight — opacity only, no wipe, no blur.
           * (WelcomeSequence fades its own taglines/CTA faster, at exitMs.)
           * Every other exit keeps the long blur-dissolve. */
          variants={{
            exit: (toDiscovery: boolean) =>
              toDiscovery
                ? { opacity: 0, transition: { duration: NYLA_FLIGHT.bgCrossfadeMs / 1000, ease: EASE.standard } }
                : { opacity: 0, filter: 'blur(6px)', transition: { duration: DURATION.dramatic, ease: EASE.standard } },
          }}
          exit="exit"
          transition={{ duration: 0.28 }}
        >
          <div
            className="relative flex w-full overflow-hidden"
            style={{
              background:
                'radial-gradient(circle at 100% 100%, rgba(255,232,207,0.55) 0%, rgba(255,232,207,0.18) 28%, transparent 55%), #f6f5f3',
            }}
          >
            {/* Left rail — sits above the section-transition veil (z-50) so the
                nav and its animating stage indicator stay in place while the
                canvas goes blank between sections. */}
            <div className="relative z-[50] hidden flex-shrink-0 flex-col gap-2 px-7 pb-7 pt-7 md:flex md:w-[240px]">
              <NYLLogo pixelSize={40} className="rounded-md" />
              {/* The stage rail builds in (Profile → Goals → Business → …)
                  when the questionnaire thread is revealed (revisit-goals). */}
              {stepsRevealed && <StageRail stageIndex={stageIndex} reached={reachedStages} onSelect={jumpToStage} />}
              {/* Bottom-left nav arrows + save-exit */}
              <div className="mt-auto flex flex-col gap-3">
                <AnimatePresence>
                  {stepsRevealed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 3.2, duration: 0.4 }}
                      className="flex items-center gap-1.5"
                    >
                      <button
                        type="button"
                        aria-label="Previous step"
                        disabled={focusedIndex === 0}
                        onClick={() => {
                          const prev = Math.max(0, focusedIndex - 1)
                          const scroller = scrollerRef.current
                          const node = innerRef.current?.children[prev] as HTMLElement | undefined
                          if (!scroller || !node) return
                          autoScrollingRef.current = true
                          smoothScrollTo(
                            scroller,
                            Math.max(0, node.offsetTop - (scroller.clientHeight - node.offsetHeight) / 2),
                            600,
                          )
                          setFocusedIndex(prev)
                          window.setTimeout(() => {
                            autoScrollingRef.current = false
                          }, 700)
                        }}
                        className="flex size-7 items-center justify-center rounded-md border border-neutral-200 text-neutral-400 transition-colors hover:border-neutral-300 hover:text-neutral-700 disabled:cursor-default disabled:opacity-30"
                      >
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 12 12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M9 8.5 L6 5.5 L3 8.5" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        aria-label="Next step"
                        disabled={focusedIndex >= activeIndex}
                        onClick={() => {
                          const next = Math.min(activeIndex, focusedIndex + 1)
                          const scroller = scrollerRef.current
                          const node = innerRef.current?.children[next] as HTMLElement | undefined
                          if (!scroller || !node) return
                          autoScrollingRef.current = true
                          smoothScrollTo(
                            scroller,
                            Math.max(0, node.offsetTop - (scroller.clientHeight - node.offsetHeight) / 2),
                            600,
                          )
                          setFocusedIndex(next)
                          window.setTimeout(() => {
                            autoScrollingRef.current = false
                          }, 700)
                        }}
                        className="flex size-7 items-center justify-center rounded-md border border-neutral-200 text-neutral-400 transition-colors hover:border-neutral-300 hover:text-neutral-700 disabled:cursor-default disabled:opacity-30"
                      >
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 12 12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M3 4.5 L6 7.5 L9 4.5" />
                        </svg>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {showSaveExit && (
                    <motion.button
                      type="button"
                      onClick={saveAndExit}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.4, ease: [0.22, 0.65, 0.05, 1] }}
                      className="self-start text-[13px] font-medium text-[#0468ff] hover:underline"
                    >
                      Save and exit
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Center: conversation thread — vertical scroller. Every answered
                step stays mounted, full-size, above the active one; the active
                step is smoothly scrolled to center each time it changes, and the
                advisor can scroll back up to review (or revise) any prior step. */}
            <div
              ref={scrollerRef}
              onScroll={handleScroll}
              className="relative flex flex-1 flex-col overflow-y-auto px-6 pb-32 pt-9 [scrollbar-width:none] md:px-12 md:pt-12 [&::-webkit-scrollbar]:hidden"
              style={{ scrollBehavior: 'auto' }}
            >
              <div ref={innerRef} className="mx-auto flex w-full max-w-[820px] flex-col items-stretch">
                {stepsRevealed &&
                  (mode === 'revisit-goals'
                    ? STEPS.slice(STEPS.indexOf('goals-intro'), activeIndex + 1)
                    : STEPS.slice(0, activeIndex + 1)
                  ).map((id, i) => {
                    const renderStart = mode === 'revisit-goals' ? STEPS.indexOf('goals-intro') : 0
                    const isActive = i === activeIndex - renderStart
                    const isFocused = i + renderStart === focusedIndex
                    /* Section leads need a tall active block so the scroller can
                     * actually bring their header to the very top of the page
                     * (the last step has nothing below it to scroll against). */
                    const isSectionLead = SECTION_LEAD_STEPS.has(id)
                    return (
                      <motion.div
                        key={id}
                        ref={isActive ? activeRef : undefined}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: isFocused ? 1 : 0.5, y: 0 }}
                        transition={{ duration: 0.55, ease: [0.22, 0.65, 0.05, 1] }}
                        aria-hidden={!isActive}
                        className={[
                          'flex w-full flex-col items-start py-24',
                          isActive
                            ? isSectionLead
                              ? 'min-h-[92vh]'
                              : 'min-h-[60vh]'
                            : 'pointer-events-none select-none border-t border-neutral-200/60',
                        ].join(' ')}
                      >
                        {isSectionLead ? (
                          <div className="flex w-full flex-col items-stretch text-left">
                            {renderStep(id, {
                              advance,
                              finish,
                              goals,
                              mode,
                              prefilled: mode === 'revisit-goals',
                              buildPlan: createBriefing,
                            })}
                          </div>
                        ) : (
                          /* Question steps: the heading appears after a ~0.5s pause,
                           then the step's interactive block (RevealBody) follows. */
                          <motion.div
                            className="flex w-full flex-col items-stretch text-left"
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: Q_HEAD_DELAY, ease: Q_REVEAL_EASE }}
                          >
                            {renderStep(id, {
                              advance,
                              finish,
                              goals,
                              mode,
                              prefilled: mode === 'revisit-goals',
                              buildPlan: createBriefing,
                            })}
                          </motion.div>
                        )}
                      </motion.div>
                    )
                  })}
              </div>
            </div>

            {/* Right rail — a fixed 237px column reserved the whole time so the
                center content keeps a constant width. Inside: a minimized square
                (pre-Goals) → a processing pill (during Goals) → the full
                "Building your plan" panel (Goals complete). */}
            {!introOpen && (
              <div className="relative z-[50] my-6 mr-6 hidden w-[237px] flex-shrink-0 flex-col md:flex">
                <AnimatePresence mode="wait">
                  {goalsComplete ? (
                    <motion.aside
                      key="plan-rail"
                      initial={{ opacity: 0, scaleY: 0.12 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      exit={{ opacity: 0, scaleY: 0.12 }}
                      transition={{ duration: 0.5, ease: [0.22, 0.65, 0.05, 1] }}
                      className="flex h-full w-full flex-col overflow-y-auto rounded-[16px] border border-[#e3e0dd] px-6 pb-8 pt-10 text-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      style={{
                        transformOrigin: 'top',
                        background:
                          'radial-gradient(circle 380px at 55% 88%, rgba(170,86,212,0.5) 0%, rgba(170,86,212,0) 70%), #4d1773',
                        boxShadow: '0 0 80px rgba(92,76,121,0.10), 0 0 40px #f4e6ff',
                      }}
                    >
                      <PlanRail goals={goals} businessDone={businessDone} clientsDone={clientsDone} />
                    </motion.aside>
                  ) : goalsStarted ? (
                    /* Processing pill — fills the reserved column width, with a
                       copy line that cycles per Goals input + the spinning star. */
                    <motion.div
                      key="processing-pill"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.45, ease: [0.22, 0.65, 0.05, 1] }}
                      className="flex w-full items-center justify-between gap-3 rounded-2xl px-5 py-3.5"
                      style={{ background: '#4d1773', boxShadow: '0 0 80px rgba(92,76,121,0.1), 0 0 40px #f4e6ff' }}
                    >
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={processingCopy}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.32 }}
                          className="truncate text-[14px] font-medium leading-tight tracking-[0.2px]"
                          style={{ color: '#b2d5ff' }}
                        >
                          {processingCopy}
                        </motion.span>
                      </AnimatePresence>
                      <span className="grid size-5 shrink-0 place-items-center">
                        <Nyla size={40} variant="on-dark" />
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="cos-min"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{ duration: 0.4, ease: [0.22, 0.65, 0.05, 1] }}
                      className="flex size-12 items-center justify-center self-end rounded-2xl"
                      style={{ background: '#4d1773', boxShadow: '0 0 80px rgba(92,76,121,0.1), 0 0 40px #f4e6ff' }}
                    >
                      <span className="grid size-6 place-items-center">
                        <Nyla size={40} variant="on-dark" />
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Section-transition "processing" beat — crossing into a new
                section covers the canvas with paper and shows a brief
                "Processing…" indicator while the scroller anchors the next
                section's lead to the top of the page, then fades to reveal it.
                Sits below the calibrating pill (z-50) so that anchor stays put. */}
            <AnimatePresence>
              {sectionVeil && (
                <motion.div
                  key="section-veil"
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-[45] flex items-center justify-center"
                  style={{
                    background:
                      'radial-gradient(circle at 100% 100%, rgba(255,232,207,0.55) 0%, rgba(255,232,207,0.18) 28%, transparent 55%), #f6f5f3',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.32, ease: [0.22, 0.65, 0.05, 1] }}
                >
                  <motion.div
                    className="flex items-center gap-3 rounded-full border border-neutral-200 bg-white/85 px-5 py-2.5 shadow-[0_12px_32px_-18px_rgba(0,10,98,0.28)]"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08, duration: 0.3, ease: [0.22, 0.65, 0.05, 1] }}
                  >
                    <span className="grid size-4 place-items-center">
                      <Nyla size={24} variant="on-dark" />
                    </span>
                    <span className="text-[12px] font-medium uppercase tracking-[0.18em] text-neutral-600">
                      Processing…
                    </span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Intro overlay — full-card purple takeover with cycling
                blue-typewriter taglines. Get started triggers the Nyla flight:
                WelcomeSequence measures + hides its star, then onStart swaps
                overlays and DiscoveryFlow flies her into the intro. The old
                wipe/create-plan reveal no longer plays on this path. */}
            <AnimatePresence>
              {introOpen && (
                <motion.div
                  key="intro-overlay"
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 z-[60] overflow-hidden"
                >
                  <WelcomeSequence
                    onStart={() => {
                      openDiscoveryFromOnboarding()
                      close()
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Building-plan beat — a brief full-bleed purple generative moment.
                The plan itself is never shown on purple; this loader hands off
                (via the dialog's long exit) straight into the main Plan section. */}
            <AnimatePresence>
              {creating && (
                <motion.div
                  key="creating-briefing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, ease: [0.22, 0.65, 0.05, 1] }}
                  className="overlay-bleed z-[210]"
                >
                  <CreatingBriefing />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* Custom RAF easing for the scroll — gives a heavier, slower entrance than
 * the browser default smooth scroll. Returns a cancel function so callers can
 * abort the animation (e.g. when the user starts scrolling manually). */
function smoothScrollTo(el: HTMLElement, target: number, durationMs: number): () => void {
  const startTop = el.scrollTop
  const delta = target - startTop
  if (Math.abs(delta) < 1) return () => {}
  const start = performance.now()
  const ease = (t: number) => 1 - Math.pow(1 - t, 4) /* easeOutQuart */
  let cancelled = false
  let frameId = 0
  function step(now: number) {
    if (cancelled) return
    const p = Math.min(1, (now - start) / durationMs)
    el.scrollTop = startTop + delta * ease(p)
    if (p < 1) frameId = requestAnimationFrame(step)
  }
  frameId = requestAnimationFrame(step)
  return () => {
    cancelled = true
    cancelAnimationFrame(frameId)
  }
}

/* ----------------------------------------------------------------------------
 * Right rail — "Building your plan" purple panel.
 * -------------------------------------------------------------------------- */

/* The plan panel fills in section by section: pills land at the end of Goals,
 * the business summary after the Business section, the clients summary after
 * the Clients section. */

/* ----------------------------------------------------------------------------
 * Step renderer
 * -------------------------------------------------------------------------- */

type StepProps = {
  advance: (opts?: { answer?: string | null; goals?: Partial<Goals>; skipTo?: StepId }) => void
  finish: () => void
  goals: Goals
  mode: OnboardingMode | null
  prefilled: boolean
  /* Plays the brief "Building your plan" beat, then jumps to the main Plan
   * section — the plan is shown there, never on the full-purple drawer. */
  buildPlan: () => void
}

function renderStep(step: StepId, p: StepProps) {
  switch (step) {
    case 'profile':
      return <Profile {...p} />
    case 'goals-intro':
      return <GoalsIntro {...p} />
    case 'advisor-vision':
      return <AdvisorVision {...p} />
    case 'direction':
      return <Direction {...p} />
    case 'fyc-target':
      return <FycTarget {...p} />
    case 'council-level':
      return <CouncilLevel {...p} />
    case 'activity-target':
      return <ActivityTarget {...p} />
    case 'outside-work':
      return <OutsideWork {...p} />
    case 'growth-intro':
      return <GrowthIntro {...p} />
    case 'progress-areas':
      return <ProgressAreas {...p} />
    case 'growth-focus':
      return <GrowthFocus {...p} />
    case 'time-pulls':
      return <TimePulls {...p} />
    case 'time-open':
      return <TimeOpen {...p} />
    case 'clients-intro':
      return <ClientsIntro {...p} />
    case 'client-signals':
      return <ClientSignals {...p} />
    case 'client-activities':
      return <ClientActivities {...p} />
    case 'client-conversations':
      return <ClientConversations {...p} />
    case 'stay-in-front':
      return <StayInFront {...p} />
    case 'life-events':
      return <LifeEvents {...p} />
    case 'plan':
      return <PlanStep {...p} />
  }
}

/* ============================== Steps ============================== */

/* The old 'create-plan' welcome step (star-slot + duplicate greeting) was
 * removed 2026-07-02 — the welcome hands off straight to Discovery via the
 * Nyla flight, and revisit-goals enters the thread at goals-intro. */

/* ----------------------------------------------------------------------------
 * Profile — "What we know." Rows load in sequence from Salesforce + Sales
 * Central, then the two CTAs appear. Table format per Figma 816:25562.
 * -------------------------------------------------------------------------- */
type ProfileCard = {
  k: string
  v: string
  sub?: string
  /* When true, the sub renders as a descriptor stacked below the value
   * (left-aligned) rather than as a right-aligned qualifier beside it. */
  subBelow?: boolean
  source?: { title: string; rows: string[]; src: string }
}

const PROFILE_ROWS: ProfileCard[] = [
  { k: 'Years with NYL', v: '5 years' },
  {
    k: '3-year average FYC',
    v: '$37,000',
    source: {
      title: 'Averaged from 2023–2025 FYC.',
      rows: ['2023 — $35,200', '2024 — $37,800', '2025 — $38,000'],
      src: 'Source: Salesforce',
    },
  },
  {
    k: 'Production pace',
    v: '-18%',
    sub: 'vs. last year',
    source: {
      title: 'Production pace through Q2 2026.',
      rows: ['YTD FYC — $14,200', 'Same period last year — $17,300'],
      src: 'Source: Salesforce',
    },
  },
  {
    k: 'Council standing',
    v: 'Quality Council',
    source: {
      title: 'Most recent council qualification.',
      rows: ['2025 — Quality Council', '2024 — Quality Council'],
      src: 'Source: Salesforce',
    },
  },
  { k: 'Active client book', v: '303 clients' },
  { k: 'Primary product mix', v: 'Protection — transitioning to holistic', subBelow: true },
  { k: 'Licensing and registrations', v: 'Series 6/63 active' },
  { k: 'Practice operations', v: 'Solo practice' },
]

const PROFILE_WAVES: { label: string; rows: number[] }[] = [
  { label: 'Connecting to Salesforce…', rows: [0, 1] },
  { label: 'Reading your production history…', rows: [2, 3] },
  { label: 'Pulling your client book…', rows: [4, 5] },
  { label: 'Checking licensing in Sales Central…', rows: [6, 7] },
]

const PROFILE_LINGER_FIRST = 2000
const PROFILE_LINGER_REST = 1200
const PROFILE_LOAD_TOTAL = PROFILE_LINGER_FIRST + (PROFILE_WAVES.length - 1) * PROFILE_LINGER_REST

function Profile({ advance }: StepProps) {
  const [sourceLabel, setSourceLabel] = useState(PROFILE_WAVES[0].label)
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [loaded, setLoaded] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    let t = 0
    PROFILE_WAVES.forEach((wave, i) => {
      const linger = i === 0 ? PROFILE_LINGER_FIRST : PROFILE_LINGER_REST
      timers.push(setTimeout(() => setSourceLabel(wave.label), t))
      timers.push(
        setTimeout(() => {
          setRevealed((prev) => {
            const next = new Set(prev)
            wave.rows.forEach((r) => next.add(r))
            return next
          })
        }, t + linger),
      )
      t += linger
    })
    timers.push(setTimeout(() => setLoaded(true), t + 300))
    return () => {
      timers.forEach(clearTimeout)
    }
  }, [])

  useEffect(() => {
    let raf = 0
    let start: number | null = null
    const tick = (ts: number) => {
      if (start === null) start = ts
      const p = Math.min(100, Math.round(((ts - start) / PROFILE_LOAD_TOTAL) * 100))
      setProgress(p)
      if (p < 100) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="flex w-full flex-col gap-6 text-left">
      <div>
        <h2
          className="font-serif text-[28px] leading-tight tracking-tight"
          style={{ fontWeight: 400, color: '#17181C' }}
        >
          What we know
        </h2>
        <p className="mt-3 max-w-[64ch] text-[14.5px] leading-[1.55] text-neutral-600">
          We've already gathered some information about your practice. Take a look, confirm what's correct, and update
          anything that needs attention.
        </p>
      </div>

      {/* Loading indicator */}
      <div className="flex items-center gap-3 text-[13px] text-neutral-500">
        <AnimatePresence mode="wait">
          {loaded ? (
            <motion.span
              key="loaded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-flex items-center gap-2"
            >
              <CheckGlyphBlue />
              <span className="text-neutral-600">Profile loaded</span>
            </motion.span>
          ) : (
            <motion.span
              key="loading"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-2"
            >
              <PercentLoader value={progress} />
              <AnimatePresence mode="wait">
                <motion.span
                  key={sourceLabel}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.28 }}
                >
                  {sourceLabel}
                </motion.span>
              </AnimatePresence>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Table — rows reveal in waves */}
      <div className="w-full rounded-xl border border-neutral-200 bg-white overflow-hidden">
        {PROFILE_ROWS.map((row, i) => (
          <ProfileTableRow key={row.k} data={row} revealed={revealed.has(i)} isLast={i === PROFILE_ROWS.length - 1} />
        ))}
      </div>

      <AnimatePresence>
        {loaded && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 0.65, 0.05, 1] }}
            className="flex items-center justify-end gap-3"
          >
            <button
              type="button"
              onClick={() => advance({ answer: 'Something is wrong' })}
              className="rounded-md border border-neutral-300 px-5 py-2 text-[13.5px] font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
            >
              Something is wrong
            </button>
            <PrimaryBtn onClick={() => advance({ answer: 'Looks good' })}>Looks good</PrimaryBtn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ProfileTableRow({ data, revealed, isLast }: { data: ProfileCard; revealed: boolean; isLast: boolean }) {
  const [tipOpen, setTipOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={revealed ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 0.65, 0.05, 1] }}
      className={[
        'relative flex items-center justify-between gap-4 px-5 py-3.5',
        !isLast ? 'border-b border-neutral-100' : '',
      ].join(' ')}
    >
      <p className="text-[14px] leading-snug text-neutral-500">{data.k}</p>
      <div className="flex shrink-0 items-center gap-2">
        <p className="text-right text-[14px] font-medium leading-snug text-neutral-900">
          {data.v}
          {data.sub && <span className="ml-1.5 text-neutral-500">{data.sub}</span>}
        </p>
        {data.source && (
          <button
            type="button"
            onMouseEnter={() => setTipOpen(true)}
            onMouseLeave={() => setTipOpen(false)}
            onFocus={() => setTipOpen(true)}
            onBlur={() => setTipOpen(false)}
            className="inline-flex size-5 shrink-0 items-center justify-center text-neutral-300 hover:text-[#0468ff]"
            aria-label="Source details"
          >
            <Nyla size={24} variant="on-dark" />
          </button>
        )}
      </div>
      <AnimatePresence>
        {tipOpen && data.source && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18 }}
            className="absolute right-3 top-full z-30 mt-1 w-[280px] rounded-lg border border-neutral-200 bg-white p-4 text-left shadow-[0_16px_40px_-12px_rgba(0,10,98,0.2)]"
          >
            <p className="text-[12.5px] font-semibold text-neutral-900">{data.source.title}</p>
            <ul className="mt-2 flex flex-col gap-0.5 text-[12px] text-neutral-600">
              {data.source.rows.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <p className="mt-2.5 text-[11.5px] italic text-neutral-400">{data.source.src}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function CheckGlyphBlue() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="#0468ff"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 8.5 L6.5 12 L13 4.5" />
    </svg>
  )
}

/* Section-lead slides (goals / business / clients) share a clean entrance: the
 * heading, body, and CTA fade up with a short stagger, timed (via delayChildren)
 * to land as the "processing" beat clears and the lead settles at the top. */
const SECTION_LEAD_EASE = [0.22, 0.65, 0.05, 1] as const
const sectionLeadItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: SECTION_LEAD_EASE } },
}

function SectionLead({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={['flex w-full flex-col gap-6', className ?? ''].join(' ')}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { delayChildren: 0.7, staggerChildren: 0.1 } } }}
    >
      {children}
    </motion.div>
  )
}

/* Wraps a question's interactive block (selection inputs + CTA in their white
 * containment) so it builds in just after the heading — the heading rides the
 * step's own reveal (Q_HEAD_DELAY); this lands 300ms later (Q_BODY_DELAY). */
function RevealBody({
  children,
  className,
  delay = Q_BODY_DELAY,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: Q_REVEAL_EASE }}
    >
      {children}
    </motion.div>
  )
}

/* The primary CTA appears only once a selection has been made; skip CTAs (where
 * applicable) are placed outside this so they show with the selection cards. */
function CTAReveal({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.32, ease: Q_REVEAL_EASE }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function GoalsIntro({ advance, mode }: StepProps) {
  const isRevisit = mode === 'revisit-goals'
  return (
    <SectionLead>
      <h2
        className="font-serif text-[34px] leading-[1.12] tracking-tight text-[#4D1773] md:text-[42px]"
        style={{ fontWeight: 400, textWrap: 'balance' }}
      >
        <TypewriterText
          text={isRevisit ? "Let's revisit your goals." : "Let's define your goals for 2026."}
          delayMs={isRevisit ? 300 : 950}
          perWordMs={54}
          duration={0.42}
        />
      </h2>
      <motion.p variants={sectionLeadItem} className="max-w-[60ch] text-[14px] leading-[1.55] text-neutral-700">
        {isRevisit
          ? "Walk through each question and update anything that's changed. Your previous answers are already filled in — just adjust what you want and confirm the rest."
          : "Set the targets that you want to keep track against. We'll help you figure out the pace and the steps to get there. Don't worry, you can adjust this at any time."}
      </motion.p>
      <motion.div variants={sectionLeadItem} className="flex justify-end">
        <PrimaryBtn onClick={() => advance({ answer: 'Continue' })}>Continue</PrimaryBtn>
      </motion.div>
    </SectionLead>
  )
}

function AdvisorVision({ advance, prefilled }: StepProps) {
  const [text, setText] = useState(
    prefilled
      ? 'I want to be a true financial partner to my clients — someone who helps them think about their whole picture, not just their policies.'
      : '',
  )
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2
          className="font-serif text-[24px] leading-tight tracking-tight"
          style={{ fontWeight: 400, color: '#17181C', textWrap: 'balance' }}
        >
          Anything else you want to share about your vision?
        </h2>
        <p className="mt-1.5 text-[13px] text-neutral-500">In your own words — no right answer.</p>
        <div className="relative mt-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Someone who helps people think about their whole financial picture, not just their policies"
            rows={3}
            className="block w-full resize-none rounded-md border border-neutral-300 bg-white px-4 py-3 pr-12 text-[14px] leading-[1.5] text-neutral-800 placeholder:text-neutral-400 focus:border-[#0468ff] focus:outline-none"
          />
          <button
            type="button"
            aria-label="Voice input"
            className="absolute right-2.5 top-2.5 flex size-9 items-center justify-center rounded-full text-white"
            style={{ background: '#0468ff' }}
          >
            <MicGlyph />
          </button>
        </div>
      </div>
      <div className="flex justify-end">
        <PrimaryBtn onClick={() => advance({ answer: text.trim() ? truncate(text, 64) : 'Skipped' })}>
          {text.trim() ? 'Next' : 'Skip'}
        </PrimaryBtn>
      </div>
    </div>
  )
}

function Direction({ advance, goals, prefilled }: StepProps) {
  const opts = [
    {
      id: 'holistic',
      title: 'Become a holistic financial advisor',
      sub: 'Only planning, compliance, & processes',
      tag: 'Holistic Advising',
    },
    {
      id: 'eagle',
      title: 'Build toward Eagle and Investment advisory',
      sub: 'Focus on the NYL, MFA, Eagle Path, or the licensed path',
      tag: 'Eagle Status',
    },
    {
      id: 'referrals',
      title: 'Generate consistent, qualified referrals',
      sub: 'Build a trusted referral network without awkward selling',
      tag: 'Referral engine',
    },
    {
      id: 'referral-practice',
      title: 'Transition to a referral-driven practice',
      sub: 'Protect clients while building for the future',
      tag: 'Referral engine',
    },
    {
      id: 'team',
      title: 'Adopt a team-based model',
      sub: 'Grow through staffing, training, & shared clients',
      tag: 'Team-based',
    },
  ]
  const [picked, setPicked] = useState<string[]>(prefilled ? ['holistic', 'eagle'] : [])
  function toggle(id: string) {
    setPicked((arr) => {
      if (arr.includes(id)) return arr.filter((x) => x !== id)
      if (arr.length >= 3) return arr
      return [...arr, id]
    })
  }
  function submit() {
    const tags = picked.map((id) => opts.find((o) => o.id === id)?.tag).filter(Boolean) as string[]
    const answer =
      picked.length === 0
        ? 'Skipped'
        : picked
            .map((id) => opts.find((o) => o.id === id)?.title)
            .filter(Boolean)
            .join(' · ')
    advance({
      answer: truncate(answer, 80),
      goals: {
        longTermTags: [...new Set([...goals.longTermTags, ...tags])],
        approach: picked.includes('holistic') ? 'Holistic Advising' : goals.approach,
      },
    })
  }
  return (
    <div className="flex gap-8">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2
            className="font-serif text-[24px] leading-tight tracking-tight"
            style={{ fontWeight: 400, color: '#17181C', textWrap: 'balance' }}
          >
            Choose up to 3 ways I can help your business grow in the next 2–3 years.
          </h2>
          <p className="text-[13.5px] leading-snug text-neutral-500">Select up to 3.</p>
        </div>
        <RevealBody className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {opts.map((o) => {
              const active = picked.includes(o.id)
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => toggle(o.id)}
                  className={[
                    'relative rounded-xl border p-4 text-left transition-all',
                    active
                      ? 'border-[#0468ff] bg-[#f0f5ff] text-neutral-900'
                      : 'border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[13.5px] font-semibold leading-tight">{o.title}</p>
                    <span
                      aria-hidden="true"
                      className={[
                        'mt-0.5 inline-flex size-4.5 shrink-0 items-center justify-center rounded-full',
                        active ? 'bg-[#0468ff] text-white' : 'border border-neutral-300',
                      ].join(' ')}
                    >
                      {active && <CheckSmallGlyph />}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[12px] leading-snug text-neutral-500">{o.sub}</p>
                </button>
              )
            })}
          </div>
          <div className="flex justify-end">
            <CTAReveal show={picked.length > 0}>
              <PrimaryBtn onClick={submit}>Next</PrimaryBtn>
            </CTAReveal>
          </div>
        </RevealBody>
      </div>
      <NylaTip text="If you can't decide now, think about what 1 you'd want to do first or are most on your mind." />
    </div>
  )
}

function FycTarget({ advance, goals, prefilled }: StepProps) {
  const [val, setVal] = useState(prefilled ? '$55,000' : '$42,000')
  return (
    <div className="flex gap-8">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <div>
          <h2
            className="font-serif text-[26px] leading-tight tracking-tight text-neutral-900"
            style={{ fontWeight: 400, textWrap: 'balance' }}
          >
            Set your First Year Commission (FYC) target for 2026
          </h2>
          <p className="mt-2 text-[13.5px] leading-snug text-neutral-500">
            Last year you earned $39,000. You can also adjust this at any time.
          </p>
        </div>
        <RevealBody className="flex flex-col gap-5">
          <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3.5 focus-within:border-[#0468ff]">
            <span className="text-[15px] font-medium text-neutral-500">$</span>
            <input
              type="text"
              value={val.replace('$', '')}
              onChange={(e) => setVal(e.target.value)}
              className="flex-1 bg-transparent text-[18px] font-medium tabular-nums text-neutral-900 outline-none"
              inputMode="numeric"
            />
            <button
              type="button"
              aria-label="Voice input"
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-white"
              style={{ background: '#0468ff' }}
            >
              <MicGlyph />
            </button>
          </div>
          <div className="flex justify-end">
            <PrimaryBtn
              onClick={() => {
                const raw = parseInt(val.replace(/[^0-9]/g, ''), 10) || 42000
                advance({
                  answer: `Set my FYC target to $${(raw / 1000).toFixed(0)}K`,
                  goals: {
                    fycTarget: raw,
                    longTermTags: goals.longTermTags.length
                      ? goals.longTermTags
                      : ['Holistic Advising', 'Eagle Status'],
                  },
                })
              }}
            >
              Next
            </PrimaryBtn>
          </div>
        </RevealBody>
      </div>
      <NylaTip text="Going from $39k to $42k is a great baseline goal and matches others agents at your size." />
    </div>
  )
}

function CouncilLevel({ advance }: StepProps) {
  return (
    <div className="flex flex-col gap-5">
      <p className="max-w-[68ch] text-[14px] leading-[1.55] text-neutral-700">
        Is there a council level you're aiming for this year? Your FYC is currently on track for
        <strong> Executive Council</strong>, but there are more factors that secure your qualification.
      </p>
      <div className="rounded-md border border-neutral-200/80 bg-white p-6 shadow-[0_18px_40px_-22px_rgba(0,10,98,0.12)]">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <h3
              className="font-serif text-[22px] leading-tight tracking-tight text-neutral-900"
              style={{ fontWeight: 400 }}
            >
              Executive Council Qualifications
            </h3>
            <p className="mt-0.5 text-[11px] text-neutral-500">Your standing as of 5/31/25</p>
          </div>
          <span className="text-[11px] text-neutral-500">
            Overall attainability:
            <span className="ml-2 rounded-full bg-[rgba(246,142,72,0.18)] px-2 py-0.5 font-medium text-[#c47b1f]">
              Stretch
            </span>
          </span>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <CouncilCard
            label="Council Credits"
            value="46,800"
            tone="warn"
            progress={0.4}
            sub="40% complete of 90,000 target"
            tag="Stretch"
          />
          <CouncilCard
            label="Protection FYC"
            value="$24,600"
            tone="good"
            progress={1}
            sub="100% complete of $21K minimum"
            tag="Complete"
          />
          <CouncilCard
            label="Protection premium"
            value="$56,100"
            tone="warn"
            progress={0.65}
            sub="65% complete of $84K minimum"
            tag="Stretch"
          />
          <CouncilCard
            label="Case rate bonus"
            value="46/50"
            tone="good"
            progress={0.92}
            sub="Level 1 achieved; reaching 50 adds another 2,500 council credits"
            tag="On track"
          />
        </div>
      </div>
      <p className="text-[12.5px] text-neutral-600">
        With 5 months left, you need to increase your pace earning council credits. Closing 4 more life cases will help
        you earn a 5,000 bonus, so we'll focus on that.
      </p>
      <div className="flex flex-wrap justify-end gap-2">
        <PrimaryBtn
          onClick={() => advance({ answer: 'Go for Executive Council', goals: { councilLevel: 'Executive' } })}
        >
          Go for Executive Council
        </PrimaryBtn>
        <SecondaryBtn onClick={() => advance({ answer: 'See other council levels' })}>
          See other council levels
        </SecondaryBtn>
        <SecondaryBtn onClick={() => advance({ answer: "Don't set council goal" })}>
          Don't set council goal
        </SecondaryBtn>
      </div>
    </div>
  )
}

function CouncilCard({
  label,
  value,
  tone,
  progress,
  sub,
  tag,
}: {
  label: string
  value: string
  tone: 'good' | 'warn'
  progress: number
  sub: string
  tag: string
}) {
  const color = tone === 'good' ? '#1ab382' : '#ff9522'
  const tagBg = tone === 'good' ? 'rgba(26,179,130,0.18)' : 'rgba(246,142,72,0.18)'
  const tagFg = tone === 'good' ? '#0f7a4a' : '#c47b1f'
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-medium text-neutral-500">{label}</p>
        <span
          className="rounded-full px-2 py-0.5 text-[10.5px] font-medium"
          style={{ background: tagBg, color: tagFg }}
        >
          {tag}
        </span>
      </div>
      <p
        className="mt-1 font-serif text-[24px] leading-none tracking-tight text-neutral-900"
        style={{ fontWeight: 400 }}
      >
        {value}
      </p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(100, progress * 100)}%`, background: color }}
        />
      </div>
      <p className="mt-1.5 text-[10.5px] text-neutral-500">{sub}</p>
    </div>
  )
}

/* Activity targets — Figma node 289-2671: a white card of slider rows. Each
 * row has the metric label, the current value in serif ("6 per week"), a
 * draggable purple slider, and a single marker on the track showing the
 * advisor's own average over the last 6 months (their baseline, not a range).
 * The "Calibrating…" state now lives in the top-right canvas pill, not here. */
function ActivityTarget({ advance, prefilled }: StepProps) {
  const [prospects, setProspects] = useState(prefilled ? 8 : 6)
  const [appts, setAppts] = useState(prefilled ? 5 : 4)
  const [reviews, setReviews] = useState(prefilled ? 14 : 12)
  return (
    <div className="flex w-full max-w-[820px] flex-col gap-6 text-left">
      <div className="flex flex-col gap-3">
        <h2
          className="font-serif text-[24px] leading-tight tracking-tight"
          style={{ fontWeight: 400, color: '#17181C', textWrap: 'balance' }}
        >
          What are your weekly activity targets?
        </h2>
        <p className="max-w-[64ch] text-[14px] leading-[1.55] text-neutral-700">
          These give your plan leading indicators, beyond outcomes tracking.
        </p>
      </div>

      <div className="rounded-md border border-neutral-200/80 bg-white px-8 py-2 shadow-[0_8px_24px_-20px_rgba(0,10,98,0.18)]">
        <SliderRow
          label="New prospects to contact"
          unit="per week"
          max={15}
          rec={[5, 10]}
          value={prospects}
          onChange={setProspects}
        />
        <SliderRow
          label="Client appointments"
          unit="per week"
          max={10}
          rec={[4, 8]}
          value={appts}
          onChange={setAppts}
        />
        <SliderRow
          label="Client reviews"
          unit="per quarter"
          max={20}
          rec={[9, 16]}
          value={reviews}
          onChange={setReviews}
        />
        <p className="py-5 text-[14px] leading-[1.55] text-neutral-700">
          I've suggested a comfortable starting point based on your historic performance and current goals.
        </p>
      </div>

      <div className="flex justify-end">
        <PrimaryBtn
          onClick={() =>
            advance({
              answer: `Set: ${prospects} prospects · ${appts} appts · ${reviews} reviews`,
            })
          }
        >
          Next
        </PrimaryBtn>
      </div>
    </div>
  )
}

/* One slider row of the activity-targets card. Drag (or arrow-key) the purple
 * handle to set the target. Beneath the track, a lavender pill marks the
 * recommended range and an orange bar marks the stretch zone from the range's
 * top end to the max (Figma 289-2671). */
function SliderRow({
  label,
  unit,
  max,
  rec,
  value,
  onChange,
}: {
  label: string
  unit: string
  max: number
  rec: [number, number]
  value: number
  onChange: (v: number) => void
}) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  function setFromClientX(clientX: number) {
    const r = trackRef.current?.getBoundingClientRect()
    if (!r) return
    const ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width))
    onChange(Math.round(ratio * max))
  }
  const pct = (value / max) * 100
  const recLo = (rec[0] / max) * 100
  const recHi = (rec[1] / max) * 100
  return (
    <div className="border-b border-neutral-200/80 py-6">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[15px] font-semibold tracking-tight text-neutral-900">{label}</p>
        <p
          className="whitespace-nowrap font-serif text-[22px] tracking-tight text-neutral-900 md:text-[24px]"
          style={{ fontWeight: 400 }}
        >
          {value} {unit}
        </p>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <span className="w-5 text-[13px] text-neutral-600">0</span>
        <div
          ref={trackRef}
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`${value} ${unit}`}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            setFromClientX(e.clientX)
          }}
          onPointerMove={(e) => {
            if (e.buttons === 1) setFromClientX(e.clientX)
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
              e.preventDefault()
              onChange(Math.max(0, value - 1))
            }
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
              e.preventDefault()
              onChange(Math.min(max, value + 1))
            }
          }}
          className="relative h-6 flex-1 cursor-pointer touch-none rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0468ff]/40"
        >
          <div className="absolute top-1/2 h-[6px] w-full -translate-y-1/2 rounded-full bg-[#e2e8f0]" />
          <div
            className="absolute top-1/2 h-[6px] -translate-y-1/2 rounded-full bg-[#8b37c8]"
            style={{ width: `${pct}%` }}
          />
          <div
            className="absolute top-1/2 size-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8b37c8] shadow-[0_1px_4px_rgba(0,0,0,0.25)] ring-[3px] ring-white"
            style={{ left: `${pct}%` }}
          />
        </div>
        <span className="w-6 text-right text-[13px] text-neutral-600">{max}</span>
      </div>

      {/* Recommended-range pill + orange stretch zone — mirror the track's flex
          geometry with invisible end labels so the percentages line up. */}
      <div className="mt-2 flex items-center gap-4">
        <span aria-hidden="true" className="invisible w-5 text-[13px]">
          0
        </span>
        <div className="relative h-[21px] flex-1">
          <div
            className="absolute flex h-full items-center justify-center overflow-hidden rounded-full bg-[#eaccff]/70"
            style={{ left: `${recLo}%`, width: `${recHi - recLo}%` }}
          >
            <span className="whitespace-nowrap px-3 text-[12px] leading-none text-neutral-800">Recommended range</span>
          </div>
          <div
            className="absolute h-full rounded-full bg-[#ffb566]/70"
            style={{ left: `calc(${recHi}% + 6px)`, right: 0 }}
          />
        </div>
        <span aria-hidden="true" className="invisible w-6 text-[13px]">
          {max}
        </span>
      </div>
    </div>
  )
}

function OutsideWork({ advance, prefilled }: StepProps) {
  const opts = [
    'Time with family',
    'Travel',
    'A wellness and fitness goal',
    'A passion project',
    'Financial independence',
    'More free time',
  ]
  const [picked, setPicked] = useState<string[]>(prefilled ? ['Time with family', 'Financial independence'] : [])
  const [free, setFree] = useState('')
  function toggle(o: string) {
    setPicked((arr) => (arr.includes(o) ? arr.filter((x) => x !== o) : [...arr, o]))
  }
  function submit() {
    const answer = free.trim() ? truncate(free, 64) : picked.length ? truncate(picked.join(' · '), 64) : 'Skipped'
    advance({ answer })
  }
  return (
    <div className="flex flex-col gap-5">
      <h2
        className="font-serif text-[24px] leading-tight tracking-tight"
        style={{ fontWeight: 400, color: '#17181C', textWrap: 'balance' }}
      >
        What are you making time for outside of work this year?
      </h2>
      <p className="max-w-[60ch] text-[13.5px] leading-snug text-neutral-500">
        Your business should support your life, not the other way around. (Optional)
      </p>
      <RevealBody className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {opts.map((o) => {
            const on = picked.includes(o)
            return (
              <button
                key={o}
                type="button"
                onClick={() => toggle(o)}
                className={[
                  'rounded-xl border px-4 py-3.5 text-left transition-all',
                  on
                    ? 'border-[#0468ff] bg-[#f0f5ff] text-neutral-900'
                    : 'border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[13.5px] font-medium leading-tight">{o}</p>
                  <span
                    aria-hidden="true"
                    className={[
                      'inline-flex size-4 shrink-0 items-center justify-center rounded-full',
                      on ? 'bg-[#0468ff] text-white' : 'border border-neutral-300',
                    ].join(' ')}
                  >
                    {on && <CheckSmallGlyph />}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
        <div>
          <p className="mb-2 text-[13px] text-neutral-600">Have a different goal?</p>
          <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 focus-within:border-[#0468ff]">
            <input
              type="text"
              value={free}
              onChange={(e) => setFree(e.target.value)}
              placeholder="Tell me in your own words..."
              className="flex-1 bg-transparent text-[14px] text-neutral-800 placeholder:text-neutral-400 outline-none"
            />
            <button
              type="button"
              aria-label="Voice input"
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-white"
              style={{ background: '#0468ff' }}
            >
              <MicGlyph />
            </button>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <SecondaryBtn onClick={() => advance({ answer: 'Skipped' })}>Skip</SecondaryBtn>
          <CTAReveal show={picked.length > 0 || free.trim().length > 0}>
            <PrimaryBtn onClick={submit}>Next</PrimaryBtn>
          </CTAReveal>
        </div>
      </RevealBody>
    </div>
  )
}

/* Narrow Nyla annotation panel — right-side tip shown on steps with
 * contextual AI guidance (Direction, FYC). */
function NylaTip({ text }: { text: string }) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.9, ease: [0.22, 0.65, 0.05, 1] }}
      className="hidden w-[188px] shrink-0 flex-col gap-3 border-l border-[#e8e5f0] pl-5 pt-1 md:flex"
    >
      <Nyla size={64} variant="on-dark" align="left" />
      <p className="text-[12.5px] leading-[1.55] text-neutral-500">{text}</p>
    </motion.aside>
  )
}

function GrowthIntro({ advance }: StepProps) {
  return (
    <SectionLead>
      <h2
        className="font-serif text-[34px] leading-[1.12] tracking-tight text-[#4D1773] md:text-[42px]"
        style={{ fontWeight: 400, textWrap: 'balance' }}
      >
        <TypewriterText
          text="You've got goals. Now I'll help you build around how you actually work."
          delayMs={950}
          perWordMs={54}
          duration={0.42}
        />
      </h2>
      <motion.p variants={sectionLeadItem} className="max-w-[60ch] text-[14px] leading-[1.55] text-neutral-700">
        The best plan fits your practice, not a template. A few more questions and we'll shape everything around how you
        run your business — so the right opportunities show up when you need them.
      </motion.p>
      <motion.div variants={sectionLeadItem} className="flex justify-end gap-3">
        <SecondaryBtn onClick={() => advance({ answer: 'Skip' })}>Skip</SecondaryBtn>
        <PrimaryBtn onClick={() => advance({ answer: 'Continue' })}>Continue</PrimaryBtn>
      </motion.div>
    </SectionLead>
  )
}

function ProgressAreas({ advance, prefilled }: StepProps) {
  const opts = [
    { id: 'eagle', title: 'Understanding my path to Eagle or IAR', sub: "Licensing, sequencing, what's next" },
    { id: 'broader', title: 'Starting broader planning conversations', sub: 'Moving clients beyond protection' },
    { id: 'referrals', title: 'Generating qualified referrals consistently', sub: 'Beyond my initial market' },
    { id: 'positioning', title: 'Positioning NYL as a full partner', sub: 'Not just life insurance' },
    { id: 'pipeline', title: 'Keeping pipeline moving despite service burden', sub: 'Finding time to prospect' },
    { id: 'holistic', title: 'Understanding how holistic activity pays me', sub: 'Council, Eagle, fee-based' },
  ]
  const [picked, setPicked] = useState<string[]>(prefilled ? ['holistic', 'eagle', 'referrals'] : [])
  function toggle(id: string) {
    setPicked((arr) => {
      if (arr.includes(id)) return arr.filter((x) => x !== id)
      if (arr.length >= 3) return arr
      return [...arr, id]
    })
  }
  function submit() {
    const first = opts.find((o) => o.id === picked[0])?.title ?? 'Growth priorities set'
    advance({
      answer: truncate(picked.length > 1 ? `${first} · +${picked.length - 1} more` : first, 80),
      goals: { progressAreas: picked },
    })
  }
  return (
    <SelectionGrid
      title="How do you want to grow this year?"
      sub="Choose up to 3 — I'll prioritize the work around these."
      max={3}
      picked={picked}
      opts={opts}
      toggle={toggle}
      onSubmit={submit}
    />
  )
}

/* Growth-focus follow-up — the headline's "that" is the growth area the
 * advisor just picked, and the option set swaps to match it (Figma comment:
 * "New question here, specific to the selection the user made in the previous
 * question"). Keyed by ProgressAreas option id; first pick wins. */
const GROWTH_FOCUS_OPTIONS: Record<string, string[]> = {
  eagle: [
    'A clear picture of where I stand today',
    'Step-by-step guidance on what to do next',
    'Tracking production milestones in one place',
    'Understanding which clients or cases matter most for qualification',
    "Knowing how my pace compares to agents who've already qualified",
  ],
  broader: [
    'Knowing which clients are ready for a planning conversation',
    'Talk tracks that go beyond protection',
    'Meeting prep that covers the full financial picture',
    'Seeing how other advisors made the shift',
    'Tracking which conversations turn into cases',
  ],
  referrals: [
    'Knowing the right moment to ask',
    'Language that makes the ask feel natural',
    'Identifying my most referral-ready clients',
    'Tracking referrals from ask to appointment',
    'Seeing what works for top referral builders',
  ],
  positioning: [
    'Leading with planning instead of product',
    'Materials that show the full NYL picture',
    'Knowing which clients see me as more than insurance',
    'Cross-product case examples for my market',
    'Tracking multi-line adoption across my book',
  ],
  pipeline: [
    'Protecting prospecting time on my calendar',
    'Knowing which service issues can wait',
    'A clear picture of pipeline health at a glance',
    'A next best action when momentum stalls',
    'Tracking follow-ups so nothing slips',
  ],
  holistic: [
    'A clear map from activity to compensation',
    'Seeing how Council and Eagle credit accrue',
    'Understanding fee-based revenue over time',
    'Knowing which products move me forward fastest',
    'Tracking progress toward qualification thresholds',
  ],
}

function GrowthFocus({ advance, goals, prefilled }: StepProps) {
  const primary = goals.progressAreas[0] ?? 'eagle'
  const titles = GROWTH_FOCUS_OPTIONS[primary] ?? GROWTH_FOCUS_OPTIONS.eagle
  const opts = titles.map((t, i) => ({ id: `gf-${i}`, title: t }))
  const [picked, setPicked] = useState<string[]>(prefilled ? ['gf-0', 'gf-3'] : [])
  const [free, setFree] = useState('')
  function toggle(id: string) {
    setPicked((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]))
  }
  function submit() {
    const first = opts.find((o) => o.id === picked[0])?.title
    advance({ answer: truncate(free.trim() ? free : (first ?? 'Noted'), 80) })
  }
  return (
    <div className="flex flex-col gap-5">
      <h2
        className="font-serif text-[24px] leading-tight tracking-tight"
        style={{ fontWeight: 400, color: '#17181C', textWrap: 'balance' }}
      >
        What's most important to helping you achieve that?
      </h2>
      <p className="max-w-[60ch] text-[14px] leading-[1.55] text-neutral-700">Select all that apply</p>
      <RevealBody className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {opts.map((o) => {
            const active = picked.includes(o.id)
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => toggle(o.id)}
                className={[
                  'rounded-md border p-4 text-left transition-all',
                  active
                    ? 'border-transparent text-white'
                    : 'border-neutral-300 bg-white text-neutral-900 hover:border-neutral-400',
                ].join(' ')}
                style={active ? { background: '#0A1640' } : undefined}
              >
                <span
                  aria-hidden="true"
                  className={[
                    'inline-flex size-5 items-center justify-center rounded-full',
                    active ? 'bg-[#0468ff] text-white' : 'border border-neutral-300',
                  ].join(' ')}
                >
                  {active && <CheckSmallGlyph />}
                </span>
                <p className="mt-3 text-[13.5px] font-semibold leading-tight">{o.title}</p>
              </button>
            )
          })}
        </div>
        <div className="relative">
          <input
            type="text"
            value={free}
            onChange={(e) => setFree(e.target.value)}
            placeholder="Or describe in your own words…"
            className="block w-full rounded-md border border-neutral-300 bg-white px-4 py-3.5 pr-12 text-[13.5px] text-neutral-800 placeholder:text-neutral-400 focus:border-[#0468ff] focus:outline-none"
          />
          <button
            type="button"
            aria-label="Voice input"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0468ff]"
          >
            <MicGlyph />
          </button>
        </div>
        <div className="flex justify-end">
          <CTAReveal show={picked.length > 0 || free.trim().length > 0}>
            <PrimaryBtn onClick={submit}>Next</PrimaryBtn>
          </CTAReveal>
        </div>
      </RevealBody>
    </div>
  )
}

function TimePulls({ advance, prefilled }: StepProps) {
  const opts = [
    { id: 'nigo', title: 'Chasing case status and NIGO updates', sub: 'Delays that kill momentum' },
    { id: 'service', title: 'Client service issues pulling me away', sub: 'From prospecting and growth' },
    { id: 'systems', title: 'Finding the right system, form, or answer', sub: 'Too much hunting' },
    {
      id: 'meeting-prep',
      title: 'Preparing for meetings across product lines',
      sub: 'More complex than pure protection',
    },
    { id: 'admin', title: 'Admin after meetings', sub: 'Notes, next steps, follow-up emails' },
    { id: 'workflows', title: 'Managing multi-product workflows', sub: 'Life + investments + planning' },
  ]
  const [picked, setPicked] = useState<string[]>(prefilled ? ['nigo', 'service', 'admin'] : [])
  function toggle(id: string) {
    setPicked((arr) => {
      if (arr.includes(id)) return arr.filter((x) => x !== id)
      if (arr.length >= 3) return arr
      return [...arr, id]
    })
  }
  return (
    <SelectionGrid
      title="What's eating your week right now?"
      sub="Choose up to 3 — I'll start by taking these off your plate."
      max={3}
      opts={opts}
      picked={picked}
      toggle={toggle}
      onSubmit={() => advance({ answer: 'Following up on stalled cases' })}
    />
  )
}

function TimeOpen({ advance, prefilled }: StepProps) {
  const [text, setText] = useState('')
  const [sel, setSel] = useState<string | null>(prefilled ? 'Following up on stalled cases' : null)
  const chips = [
    'Following up on stalled cases',
    'Navigating which system has the answer',
    'Writing post-meeting emails from scratch',
    'Preparing for meetings across multiple product lines',
  ]
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="text-left">
        <h2
          className="font-serif text-[24px] leading-snug tracking-tight"
          style={{ fontWeight: 400, color: '#17181C', textWrap: 'balance' }}
        >
          What's the one thing in your week that consistently pulls you away from the work that actually grows your
          business?
        </h2>
        <p className="mt-1.5 text-[13px] text-neutral-500">Pick a suggestion below — or type your own.</p>
      </div>
      {/* Suggestion tiles — same card style as SelectionGrid, single-select. */}
      <RevealBody className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {chips.map((c) => {
            const active = sel === c
            return (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setSel(active ? null : c)
                  setText('')
                }}
                className={[
                  'flex min-h-[140px] flex-col items-start justify-between rounded-md border p-4 text-left transition-all',
                  active
                    ? 'border-transparent text-white'
                    : 'border-neutral-300 bg-white text-neutral-900 hover:border-neutral-400',
                ].join(' ')}
                style={active ? { background: '#0A1640' } : undefined}
              >
                <span
                  aria-hidden="true"
                  className={[
                    'inline-flex size-5 items-center justify-center rounded-full',
                    active ? 'bg-[#0468ff] text-white' : 'border border-neutral-300',
                  ].join(' ')}
                >
                  {active && <CheckSmallGlyph />}
                </span>
                <p className="mt-3 text-[13.5px] font-semibold leading-tight">{c}</p>
              </button>
            )
          })}
        </div>
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            if (e.target.value.trim()) setSel(null)
          }}
          placeholder="Or describe in your own words…"
          className="block w-full rounded-md border border-neutral-300 bg-white px-4 py-3 text-[14px] text-neutral-800 placeholder:text-neutral-400 focus:border-[#0468ff] focus:outline-none"
        />
        <div className="flex justify-end">
          <CTAReveal show={!!sel || text.trim().length > 0}>
            <PrimaryBtn onClick={() => advance({ answer: text.trim() ? truncate(text, 64) : (sel ?? 'Skipped') })}>
              Next
            </PrimaryBtn>
          </CTAReveal>
        </div>
      </RevealBody>
    </div>
  )
}

/* Clients-stage intro — Figma node 214-56734. Blue serif headline marks the
 * section transition; the breadcrumb flips to "Clients" on this screen. */
function ClientsIntro({ advance }: StepProps) {
  return (
    <SectionLead>
      {/* Clients section lead — 42px purple typewriter heading, typed as the
          processing beat clears (matches Goals/Business). */}
      <h2
        className="font-serif text-[34px] leading-[1.18] tracking-tight md:text-[42px]"
        style={{ fontWeight: 400, color: '#4D1773', textWrap: 'balance' }}
      >
        <TypewriterText
          text="You've told us where you're headed. Now let's understand how you're spending your time with clients."
          delayMs={950}
          perWordMs={54}
          duration={0.42}
        />
      </h2>
      <motion.p variants={sectionLeadItem} className="text-[14px] leading-[1.6] text-neutral-700">
        This is about how you engage clients, where you want support, and what earns your attention. I'll use those
        signals to surface the right opportunities, conversations, and next steps at the right time.
      </motion.p>
      <motion.div variants={sectionLeadItem} className="flex justify-end">
        <PrimaryBtn onClick={() => advance({ answer: "Let's do it" })}>Let's do it</PrimaryBtn>
      </motion.div>
    </SectionLead>
  )
}

function ClientSignals({ advance, prefilled }: StepProps) {
  return (
    <ListPicker
      advance={advance}
      title="Which client signals matter most to you?"
      sub="Select all that apply. I'll prioritize your alerts in this order."
      opts={[
        { id: 'life', title: 'Life events worth a planning conversation', sub: 'The right moment to go deeper' },
        { id: 'lapse', title: 'Lapse & retention risks', sub: 'Clients at risk before they act' },
        { id: 'expansion', title: 'Holistic expansion signals', sub: 'Clients ready for more than protection' },
        { id: 'milestones', title: 'Policy & plan milestones', sub: 'Anniversaries, conversion windows, RMDs' },
        { id: 'referral', title: 'Referral network signals', sub: 'Household connections worth exploring' },
      ]}
      answer="Life events worth a planning conversation"
      defaultPicked={prefilled ? ['life', 'lapse', 'expansion'] : []}
    />
  )
}

function ClientActivities({ advance, prefilled }: StepProps) {
  return (
    <ListPicker
      advance={advance}
      title="Which client activities do you typically prioritize?"
      sub="This is how I'll determine what's most important to show you."
      max={2}
      opts={[
        { id: 'holistic', title: 'Clients ready for a holistic conversation', sub: 'Beyond what they have today' },
        { id: 'life-events', title: 'Life events worth reaching out about', sub: 'Timely, personal moments' },
        { id: 'pipeline', title: 'Pipeline items that need my attention', sub: 'Cases, NIGOs, follow-ups' },
        { id: 'referrals', title: 'Referral opportunities in my book', sub: 'Household and network connections' },
        { id: 'pace', title: 'My production pace vs. goal', sub: 'What I need to do this week' },
      ]}
      answer="Clients ready for a holistic conversation"
      goalsOnSubmit={{
        clientApproach: { existing: 'Prioritize deepening your existing relationships in the long term' },
      }}
      defaultPicked={prefilled ? ['holistic', 'life-events'] : []}
    />
  )
}

function ClientConversations({ advance, prefilled }: StepProps) {
  return (
    <ListPicker
      advance={advance}
      cols={3}
      title="Which client conversations do you want more support with?"
      sub="Select up to three areas where pre-meeting prep would help the most."
      max={3}
      opts={[
        { id: 'protection', title: 'Protection & life insurance' },
        { id: 'retirement', title: 'Retirement income' },
        { id: 'investment', title: 'Investment planning' },
        { id: 'estate', title: 'Estate and legacy' },
        { id: 'business', title: 'Business owner solutions' },
        { id: 'ltc', title: 'LTC & benefits' },
      ]}
      answer="Selected coverage areas"
      defaultPicked={prefilled ? ['protection', 'retirement', 'investment'] : []}
    />
  )
}

function StayInFront({ advance, prefilled }: StepProps) {
  return (
    <ListPicker
      advance={advance}
      title="How do you currently stay connected with clients and prospects between meetings?"
      sub="Select up to three methods you use the most today."
      max={3}
      opts={[
        { id: 'emails', title: 'Personal emails', sub: 'I write them myself' },
        { id: 'linkedin', title: 'LinkedIn and social media', sub: 'Building my broader profile as an advisor' },
        { id: 'referrals', title: 'Referral requests & COI relationships', sub: 'Key to growing beyond warm market' },
        { id: 'events', title: 'Events and community involvement', sub: 'Niche or market-specific' },
        { id: 'content', title: 'Sharing content and market insights', sub: 'Email, social, text' },
        { id: 'system', title: 'I want to do more but lack a system', sub: 'Would like help building one' },
      ]}
      answer="Selected outreach habits"
      goalsOnSubmit={{
        clientApproach: { new: 'Explore new long term prospects and discover events to broaden your branded reach' },
      }}
      defaultPicked={prefilled ? ['emails', 'referrals', 'content'] : []}
    />
  )
}

function LifeEvents({ advance, prefilled }: StepProps) {
  return (
    <ListPicker
      advance={advance}
      cols={3}
      title="When a client has a meaningful life event — a job change, a new baby, a loss — what's your instinct?"
      sub="Select the top two approaches you'd most often take."
      max={2}
      opts={[
        { id: 'reach-out', title: 'I try to reach out — it matters to clients', sub: 'Even if just to acknowledge' },
        { id: 'late', title: "I'd do more if I knew about it sooner", sub: 'I miss too many moments' },
        { id: 'financial', title: "I reach out when there's a financial angle", sub: 'I focus on relevant moments' },
        { id: 'unsure', title: "I'm not sure what's appropriate yet", sub: 'I could use guidance on this' },
        { id: 'content', title: 'Sharing content and market insights', sub: 'Email, social, text' },
        { id: 'system', title: 'I want to do more but lack a system', sub: 'I need help building one' },
      ]}
      answer="I try to reach out — it matters to clients"
      defaultPicked={prefilled ? ['reach-out', 'financial'] : []}
    />
  )
}

/* Bridge step — the last beat on the off-white canvas. "Build my plan" plays a
 * brief "Building your plan" beat and jumps straight into the main Plan
 * section; the plan is shown there, not on a full-purple drawer. */
function PlanStep({ goals, buildPlan }: StepProps) {
  const fyc = goals.fycTarget != null ? `$${Math.round(goals.fycTarget / 1000)}K` : '$42K'
  return (
    <div className="flex flex-col gap-5">
      <h2
        className="font-serif text-[24px] leading-tight tracking-tight"
        style={{ fontWeight: 400, color: '#17181C', textWrap: 'balance' }}
      >
        Here's how your goals become a plan.
      </h2>
      <p className="max-w-[68ch] text-[14px] leading-[1.55] text-neutral-700">
        You set a goal of {fyc}. Let's do the math to figure out a weekly cadence of how many cases and appointments you
        need to take to get you there.
      </p>
      <div className="flex justify-end">
        <PrimaryBtn onClick={buildPlan}>Build my plan</PrimaryBtn>
      </div>
    </div>
  )
}

/* ============================== Shared ============================== */

function SelectionGrid({
  title,
  sub,
  opts,
  picked,
  toggle,
  onSubmit,
  max,
}: {
  title: string
  sub: string
  opts: { id: string; title: string; sub?: string }[]
  picked: string[]
  toggle: (id: string) => void
  onSubmit: () => void
  max?: number
}) {
  return (
    <div className="flex flex-col gap-5">
      <h2
        className="font-serif text-[24px] leading-tight tracking-tight"
        style={{ fontWeight: 400, color: '#17181C', textWrap: 'balance' }}
      >
        {title}
      </h2>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="max-w-[60ch] text-[14px] leading-[1.55] text-neutral-700">{sub}</p>
        {max && (
          <span className="text-[11.5px] font-medium uppercase tracking-[0.18em] text-neutral-500">
            {picked.length} of {max} selected
          </span>
        )}
      </div>
      <RevealBody className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {opts.map((o) => {
            const active = picked.includes(o.id)
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => toggle(o.id)}
                className={[
                  'rounded-md border p-4 text-left transition-all',
                  active
                    ? 'border-transparent text-white'
                    : 'border-neutral-300 bg-white text-neutral-900 hover:border-neutral-400',
                ].join(' ')}
                style={active ? { background: '#0A1640' } : undefined}
              >
                <span
                  aria-hidden="true"
                  className={[
                    'inline-flex size-5 items-center justify-center rounded-full',
                    active ? 'bg-[#0468ff] text-white' : 'border border-neutral-300',
                  ].join(' ')}
                >
                  {active && <CheckSmallGlyph />}
                </span>
                <p className="mt-3 text-[13.5px] font-semibold leading-tight">{o.title}</p>
                {o.sub && (
                  <p className={['mt-1 text-[11.5px]', active ? 'text-white/70' : 'text-neutral-500'].join(' ')}>
                    {o.sub}
                  </p>
                )}
              </button>
            )
          })}
        </div>
        <div className="flex justify-end">
          <CTAReveal show={picked.length > 0}>
            <PrimaryBtn onClick={onSubmit}>Next</PrimaryBtn>
          </CTAReveal>
        </div>
      </RevealBody>
    </div>
  )
}

function ListPicker({
  advance,
  title,
  sub,
  opts,
  answer,
  cols = 2,
  max,
  goalsOnSubmit,
  defaultPicked = [],
}: {
  advance: StepProps['advance']
  title: string
  sub: string
  opts: { id: string; title: string; sub?: string }[]
  answer: string
  cols?: 2 | 3
  max?: number
  goalsOnSubmit?: Partial<Goals>
  defaultPicked?: string[]
}) {
  const [picked, setPicked] = useState<string[]>(defaultPicked)
  function toggle(id: string) {
    setPicked((arr) => {
      if (arr.includes(id)) return arr.filter((x) => x !== id)
      if (max && arr.length >= max) return arr
      return [...arr, id]
    })
  }
  return (
    <div className="flex flex-col gap-5">
      <h2
        className="font-serif text-[24px] leading-tight tracking-tight"
        style={{ fontWeight: 400, color: '#17181C', textWrap: 'balance' }}
      >
        {title}
      </h2>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="max-w-[60ch] text-[14px] leading-[1.55] text-neutral-700">{sub}</p>
        {max && (
          <span className="text-[11.5px] font-medium uppercase tracking-[0.18em] text-neutral-500">
            {picked.length} of {max} selected
          </span>
        )}
      </div>
      {/* Card grid — same dark-navy selected style as the goal-direction step
       * so the "How we'll get there" stages read as one visual system. */}
      <RevealBody className="flex flex-col gap-5">
        <div className={cols === 3 ? 'grid grid-cols-1 gap-3 md:grid-cols-3' : 'grid grid-cols-1 gap-3 md:grid-cols-2'}>
          {opts.map((o) => {
            const on = picked.includes(o.id)
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => toggle(o.id)}
                className={[
                  'min-h-[140px] rounded-md border p-5 text-left transition-all',
                  on
                    ? 'border-transparent text-white'
                    : 'border-neutral-300 bg-white text-neutral-900 hover:border-neutral-400',
                ].join(' ')}
                style={on ? { background: '#0A1640' } : undefined}
              >
                <span
                  aria-hidden="true"
                  className={[
                    'inline-flex size-5 items-center justify-center rounded-full',
                    on ? 'bg-[#0468ff] text-white' : 'border border-neutral-300',
                  ].join(' ')}
                >
                  {on && <CheckSmallGlyph />}
                </span>
                <p className="mt-5 text-[14px] font-semibold leading-tight">{o.title}</p>
                {o.sub && (
                  <p
                    className={['mt-1.5 text-[12px] leading-snug', on ? 'text-white/75' : 'text-neutral-500'].join(' ')}
                  >
                    {o.sub}
                  </p>
                )}
              </button>
            )
          })}
        </div>
        <div className="flex justify-end">
          <CTAReveal show={picked.length > 0}>
            <PrimaryBtn onClick={() => advance({ answer, goals: goalsOnSubmit })}>Save and continue</PrimaryBtn>
          </CTAReveal>
        </div>
      </RevealBody>
    </div>
  )
}

/* ============================== Buttons ============================== */

/* Action button rule (Brand Implementation Plan §"AI action signaling"):
 *   PrimaryBtn (blue)  — user navigation / commits a choice. Disabled = warm gray.
 *   SecondaryBtn       — alternate destination / dismissal, blue keyline.
 *   AiBtn (purple)     — autonomous Chief-of-Staff work (drafting, scanning).
 */
function PrimaryBtn({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'rounded-md px-5 py-2.5 text-[13.5px] font-semibold transition-colors',
        disabled ? 'bg-neutral-200 text-neutral-400' : 'bg-[#0468ff] text-white hover:bg-[#0044cc]',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function SecondaryBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-[#0468ff] bg-transparent px-5 py-2.5 text-[13.5px] font-semibold text-[#0468ff] hover:bg-[#eef4ff]"
    >
      {children}
    </button>
  )
}

export function AiBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-[13.5px] font-semibold text-white"
      style={{ background: '#4D1773', boxShadow: '0 10px 24px -14px rgba(77,23,115,0.5)' }}
    >
      <span aria-hidden="true" className="grid size-3.5 place-items-center">
        <Nyla size={24} variant="on-dark" />
      </span>
      {children}
    </button>
  )
}

/* ============================== Glyphs ============================== */

function CheckSmallGlyph() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 8.5 L6.5 12 L13 4.5" />
    </svg>
  )
}
export function MicGlyph() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="6" y="2.5" width="4" height="7" rx="2" />
      <path d="M4 9 a4 4 0 0 0 8 0" />
      <path d="M8 13 V14.5" />
    </svg>
  )
}

/* ----------------------------------------------------------------------------
 * Creating-briefing beat — full-bleed purple generative moment shown after
 * "Create my briefing", before the dialog dissolves into the briefing scene.
 * -------------------------------------------------------------------------- */

/* ============================== Persistence ============================== */

const COMPLETED_KEY = 'agent-os-v55.onboarding-completed'

export function hasCompletedOnboarding(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(COMPLETED_KEY) === '1'
  } catch {
    return false
  }
}
function markOnboardingCompleted() {
  try {
    window.localStorage.setItem(COMPLETED_KEY, '1')
  } catch {
    /* no-op */
  }
}

/* ============================== Helpers ============================== */

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}
function mergeGoals(g: Goals, patch: Partial<Goals>): Goals {
  return {
    ...g,
    ...patch,
    longTermTags: patch.longTermTags ?? g.longTermTags,
    clientApproach: { ...g.clientApproach, ...(patch.clientApproach ?? {}) },
    progressAreas: patch.progressAreas ?? g.progressAreas,
  }
}
