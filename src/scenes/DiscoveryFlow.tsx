import {
  AnimatePresence,
  motion,
} from 'motion/react'
import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { MicGlyph } from './OnboardingFlow'
import { useAppStore } from '@/state/useAppStore'
import { LoadingBackground } from '@/ui/LoadingBackground'
import { SectionHeader } from '@/ui/SectionHeader'
import { CouncilStatCard } from '@/ui/CouncilStatCard'
const CouncilCreditsChart = lazy(() => import('@/ui/CouncilCreditsChart').then(m => ({ default: m.CouncilCreditsChart })))
import { OptionTileGroup } from '@/ui/OptionTile'
import { ButtonContainer } from '@/ui/ButtonContainer'
import { NylaGuidance } from '@/ui/NylaGuidance'
import { TextInput } from '@/ui/TextInput'
import { Textarea } from '@/ui/Textarea'
import { Nyla } from '@/ui/Nyla'
import { consumeNylaFlightSource } from '@/ui/NylaFlight'
import { EASE, DURATION, prefersReducedMotion } from '@/motion'
import { WhatIHeard } from '@/scenes/WhatIHeard'
import { PacingStep } from '@/scenes/PacingStep'
import { PacingAdjust } from '@/scenes/PacingAdjust'
import { NylaAffirmation } from '@/ui/NylaAffirmation'
import { PlanSummary } from '@/scenes/PlanSummary'
import { PlanAcceptLoader } from '@/scenes/PlanAcceptLoader'
import { PlanSummaryBackground } from '@/ui/PlanSummaryBackground'
import { StageRail, STAGES, type StageId } from '@/ui/StageRail'
import Brand from '@/components/Brand'

function fadeUp(delay: number, opacityOnly = false) {
  return {
    initial: { opacity: 0, ...(opacityOnly ? {} : { y: 8 }) },
    animate: { opacity: 1, ...(opacityOnly ? {} : { y: 0 }) },
    transition: { duration: DURATION.quick, ease: EASE.settle as [number, number, number, number], delay },
  }
}

// Staggered build-in for the History step, matching the "Here's what I heard"
// choreography: the heading settles first, then each row cascades in one after
// another, and the CTA lands last. Variants propagate from the group container
// down through the list, so the whole sequence is driven by the group toggling
// to "visible".
const HISTORY_ROW_STAGGER = 0.1
const historyGroupVariants = {
  hidden: {},
  visible: {},
}
const historyHeadingVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.deliberate, ease: EASE.settle as [number, number, number, number] },
  },
}
const historyListVariants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.35, staggerChildren: HISTORY_ROW_STAGGER } },
}
const historyItemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.deliberate, ease: EASE.settle as [number, number, number, number] },
  },
}
const historyCtaVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.deliberate,
      ease: EASE.settle as [number, number, number, number],
      // Land after the row cascade finishes: rows start at 0.35 and there are 9
      // of them at HISTORY_ROW_STAGGER apart, then a short beat.
      delay: 0.35 + 9 * HISTORY_ROW_STAGGER + 0.1,
    },
  },
}

type Step =
  | 'history'
  | 'goals-intro'
  | 'goals-growth'
  | 'goals-personal-goal'
  | 'goals-fyc-target'
  | 'goals-objectives'
  | 'transition'
  | 'practice-intro'
  | 'practice-activities'
  | 'practice-connections'
  | 'practice-conversations'
  | 'practice-time-drains'
  | 'practice-close-rate'
  | 'brand-intro'
  | 'brand-friends'
  | 'brand-marketing'
  | 'brand-interests'
  | 'brand-other'
  | 'brand-loading'
  | 'brand-content'
  | 'plan'
  | 'plan-reveal'
  | 'plan-pacing'
  | 'plan-pacing-adjust'
  | 'plan-pacing-affirmation'
  | 'plan-summary'

const STEPS: Step[] = [
  'history',
  'goals-intro',
  'goals-growth',
  'goals-personal-goal',
  'goals-fyc-target',
  'goals-objectives',
  'transition',
  'practice-intro',
  'practice-activities',
  'practice-connections',
  'practice-conversations',
  'practice-time-drains',
  'practice-close-rate',
  'brand-intro',
  'brand-friends',
  'brand-marketing',
  'brand-interests',
  'brand-other',
  'brand-loading',
  'brand-content',
  'plan',
  'plan-reveal',
  'plan-pacing',
  'plan-pacing-adjust',
  'plan-pacing-affirmation',
  'plan-summary',
]

const STEP_TO_STAGE: Record<Step, number> = {
  history: 0,
  'goals-intro': 1,
  'goals-growth': 1,
  'goals-personal-goal': 1,
  'goals-fyc-target': 1,
  'goals-objectives': 1,
  transition: 1,
  'practice-intro': 2,
  'practice-activities': 2,
  'practice-connections': 2,
  'practice-conversations': 2,
  'practice-time-drains': 2,
  'practice-close-rate': 2,
  'brand-intro': 3,
  'brand-friends': 3,
  'brand-marketing': 3,
  'brand-interests': 3,
  'brand-other': 3,
  'brand-loading': 3,
  'brand-content': 3,
  plan: 4,
  'plan-reveal': 4,
  'plan-pacing': 4,
  'plan-pacing-adjust': 4,
  'plan-pacing-affirmation': 4,
  'plan-summary': 4,
}

const STAGE_ENTRY: Partial<Record<number, Step>> = {
  0: 'history',
  1: 'goals-intro',
  2: 'practice-intro',
  3: 'brand-intro',
}

const CONTENT_COLUMN_STYLE = {
  position: 'relative',
  zIndex: 1,
  marginLeft: 'calc(336px + (100% - 616px) / 12)',
  width: 'calc(7 * (100% - 616px) / 12 + 144px)',
} satisfies React.CSSProperties

const SIDE_COLUMN_STYLE = {
  position: 'absolute',
  left: 'calc(480px + 8 * (100% - 616px) / 12)',
  right: 40,
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex',
  alignItems: 'stretch',
  zIndex: 2,
} satisfies React.CSSProperties

const HISTORY_ROWS: Array<{
  label: string
  value: string
  dotted: boolean
  tooltip?: React.ReactNode
}> = [
  { label: 'Years with NYL', value: '5 years', dotted: false },
  {
    label: '3-year average FYC',
    value: '$160,000',
    dotted: true,
    tooltip: (
      <div className="text-[16px] leading-6 text-[var(--text-headline)]">
        <p className="m-0">This result is averaged from your recorded FYC from 2023–2025.</p>
        <p className="m-0 mt-4">2024 FYC — $157,000<br />2025 FYC — $160,000<br />2026 FYC — $165,000</p>
        <p className="m-0 mt-4 italic">Data source: Salesforce<br />Not right? <span className="not-italic text-[var(--action-primary)]">Flag this</span></p>
      </div>
    ),
  },
  {
    label: 'Production pace',
    value: '+3% vs. last year',
    dotted: true,
    tooltip: (
      <div className="text-[16px] leading-6 text-[var(--text-headline)]">
        <p className="m-0">Your production pace is higher than 2025 — when setting goals, I'll ask about how we can continue this growth.</p>
        <p className="m-0 mt-4">2024 FYC — $157,000<br />2025 FYC — $160,000<br />2026 FYC — $165,000</p>
        <p className="m-0 mt-4 italic">Data source: Salesforce</p>
      </div>
    ),
  },
  { label: 'Council standing', value: 'PC Agent Presidents Council', dotted: false },
  {
    label: 'Active client book',
    value: '820 clients',
    dotted: true,
    tooltip: (
      <div className="text-[16px] leading-6 text-[var(--text-headline)]">
        <p className="m-0">Clients with at least one in-force policy or open case in the last 24 months.</p>
        <p className="m-0 mt-4 italic">Data source: Salesforce<br />Not right? <span className="not-italic text-[var(--action-primary)]">Flag this</span></p>
      </div>
    ),
  },
  {
    label: 'Primary product mix',
    value: 'Holistic balanced',
    dotted: true,
    tooltip: (
      <div className="text-[16px] leading-6 text-[var(--text-headline)]">
        <p className="m-0">Based on case submissions in 2025–2026. Life protection accounts for 40% annually and annuity for 54%.</p>
        <p className="m-0 mt-4 italic">Data source: Salesforce</p>
      </div>
    ),
  },
  {
    label: 'Licensing and registrations',
    value: 'Active License',
    dotted: true,
    tooltip: (
      <div className="text-[16px] leading-6 text-[var(--text-headline)]">
        <p className="m-0">You are licensed for Life Insurance, Long Term Care, Investments and Annuities</p>
        <p className="m-0 mt-4 italic">Data source: FINRA<br />Not right? <span className="not-italic text-[var(--action-primary)]">Flag this</span></p>
      </div>
    ),
  },
  { label: 'Practice operations', value: 'Solo practice', dotted: false },
]

const GROWTH_OPTIONS = [
  { id: 'holistic', title: 'Become a holistic accumulation advisor advisor', sub: 'Unify planning, investments, & protection.' },
  { id: 'referrals', title: 'Generate consistent, qualified referrals', sub: 'Build a reliable pipeline before expanding further.' },
  { id: 'referral-practice', title: 'Transition to a referral-driven practice', sub: 'Less cold outreach, more warm leads.' },
  { id: 'team', title: 'Adopt a team-based model', sub: 'Grow through staffing, teaming, & shared clients.' },
]

const OBJECTIVES_OPTIONS = [
  { id: 'family', title: 'Time with family' },
  { id: 'travel', title: 'Travel' },
  { id: 'wellness', title: 'A wellness and fitness goal' },
  { id: 'passion', title: 'A passion project' },
  { id: 'financial', title: 'Financial independence' },
  { id: 'time', title: 'More free time' },
]

const ACTIVITIES_OPTIONS = [
  { id: 'holistic', title: 'Clients ready for a holistic conversation', sub: 'Beyond what they have today' },
  { id: 'life-events', title: 'Life events worth reaching out about', sub: 'Timely, personal moments' },
  { id: 'pipeline', title: 'Pipeline items that need my attention', sub: 'Closes, NIGOs, follow-ups' },
  { id: 'referrals', title: 'Referral opportunities in my book', sub: 'Household and network connections' },
  { id: 'pace', title: 'My production pace vs. goal', sub: 'What I need to do this week' },
]

const CONNECTIONS_OPTIONS = [
  { id: 'personal-email', title: 'Personal emails' },
  { id: 'social', title: 'LinkedIn and social media' },
  { id: 'coi', title: 'Referral requests & COI relationships' },
  { id: 'events', title: 'Events and community involvement' },
  { id: 'content', title: 'Sharing content and market insights' },
  { id: 'lacking', title: 'I want to do more but lack a system' },
]

const CONVERSATIONS_OPTIONS = [
  { id: 'protection', title: 'Protection & life insurance' },
  { id: 'retirement', title: 'Retirement income' },
  { id: 'investments', title: 'Investment planning' },
  { id: 'estate', title: 'Estate and legacy' },
  { id: 'business', title: 'Business owner solutions' },
  { id: 'ltc', title: 'LTC & benefits' },
]

const TIME_DRAINS_OPTIONS = [
  { id: 'stalled', title: 'Following up on stalled cases' },
  { id: 'client-service', title: 'Client service issues' },
  { id: 'admin-email', title: 'Admin and follow-up emails after meetings' },
  { id: 'multi-product', title: 'Managing multi-product workflows' },
  { id: 'system', title: 'Navigating which system has the answer' },
  { id: 'admin-after', title: 'Admin after meetings' },
]

const OPTIONS_BRAND_1 = [
  { id: 'warm', title: 'Warm', sub: "I prioritize relationships" },
  { id: 'dep', title: 'Dependable', sub: "You can always count on me to be there" },
  { id: 'approach', title: 'Approachable', sub: "People want to chat with me all the time" },
  { id: 'flex', title: 'Flexible', sub: "I can work with or without a plan" },
  { id: 'outgoing', title: 'Outgoing', sub: "I can talk to anyone" },
]

const OPTIONS_BRAND_2 = [
  { id: 'listings', title: "Local Listings", sub: 'Show my profile within local listing applications' },
  { id: 'web', title: 'Personal Website', sub: "Create a personal online web presence" },
  { id: 'leads', title: 'Lead Generation', sub: "Opt me into NYL.com lead pools" },
  { id: 'dba', title: 'DBA', sub: "Help me establish a DBA" },
]

const OPTIONS_BRAND_3 = [
  { id: 'sports', title: "Live sporting events", sub: 'I love cheering for my favorite team' },
  { id: 'ent', title: 'Entertainment', sub: "I follow the stars on television" },
  { id: 'travel', title: 'Travel', sub: "I love to travel and visit places." },
  { id: 'politics', title: 'Politics', sub: "I like to talk about govt affairs." },
  { id: 'fashion', title: 'Fashion', sub: "I love following the latest styles" },

]

const StepCollapsedContext = createContext(false)
const StepActiveContext = createContext(false)

function useStepActive() {
  return useContext(StepActiveContext)
}

type StepRef = HTMLDivElement | null

export function DiscoveryFlow() {
  const open = useAppStore((s) => s.discoveryOpen)
  const closeDiscovery = useAppStore((s) => s.closeDiscovery)
  const openBriefingV6FromDiscovery = useAppStore((s) => s.openBriefingV6FromDiscovery)
  const discoveryInitialStep = useAppStore((s) => s.discoveryInitialStep)
  const fromOnboarding = useAppStore((s) => s.discoveryFromOnboarding)
  const clearDiscoveryFromOnboarding = useAppStore((s) => s.clearDiscoveryFromOnboarding)

  const initialStepIndex = discoveryInitialStep ? Math.max(0, STEPS.indexOf(discoveryInitialStep as Step)) : 0
  const [introOpen, setIntroOpen] = useState(() => !discoveryInitialStep)
  const [introSubmitted, setIntroSubmitted] = useState(() => !!discoveryInitialStep)
  // Drives the transition screen's exit choreography (orb out, then text) before advancing.
  const [transitionExiting, setTransitionExiting] = useState(false)
  const [activeIndex, setActiveIndex] = useState(() => initialStepIndex)
  const [collapsedUpTo, setCollapsedUpTo] = useState(() => initialStepIndex - 1)
  const [dirtySteps, setDirtySteps] = useState<Partial<Record<Step, boolean>>>({})
  const [submittedSteps, setSubmittedSteps] = useState<Partial<Record<Step, boolean>>>({})
  const [growthSelections, setGrowthSelections] = useState<string[]>([])
  const [objectivesSelections, setObjectivesSelections] = useState<string[]>([])
  const [personalGoalText, setPersonalGoalText] = useState('')
  const [activitiesSelections, setActivitiesSelections] = useState<string[]>([])
  const [connectionsSelections, setConnectionsSelections] = useState<string[]>([])
  const [conversationsSelections, setConversationsSelections] = useState<string[]>([])
  const [timeDrainsSelections, setTimeDrainsSelections] = useState<string[]>([])
  const [optionsBrand1, setOptionsBrand1] = useState<string[]>([])
  const [optionsBrand2, setOptionsBrand2] = useState<string[]>([])
  const [optionsBrand3, setOptionsBrand3] = useState<string[]>([])

  const [timeDrainsText, setTimeDrainsText] = useState('')
  const [brand1Text, setBrand1Text] = useState('')
  const [brand2Text, setBrand2Text] = useState('')
  const [brand3Text, setBrand3Text] = useState('')
  const [brand4Text, setBrand4Text] = useState('')

  const [closeRateText, setCloseRateText] = useState('')
  const [fycTarget, setFycTarget] = useState('175,000')
  const [hoveredHistoryRow, setHoveredHistoryRow] = useState<string | null>(null)
  const [historyTooltipY, setHistoryTooltipY] = useState<number>(0)
  const [planAccepting, setPlanAccepting] = useState(false)

  /* Intro entrance — the orb fades + scales in on its own, then the copy
   * cascades, then the CTA. `introRevealed` gates the whole sequence; it flips
   * true a beat after the Welcome hand-off so the Welcome orb has faded out
   * first. Skipped entirely (hard cut to the settled intro) for deep links and
   * reduced motion. */
  const introHasEntrance = !discoveryInitialStep && !prefersReducedMotion()
  const [introRevealed, setIntroRevealed] = useState(() => !introHasEntrance)

  const stepRefs = useRef<StepRef[]>([])
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const wheelLockedRef = useRef(false)
  const lastIndex = STEPS.length - 1
  const focusedIndex = Math.min(activeIndex, lastIndex)
  const activeStep = STEPS[focusedIndex]
  // History (step 0) build-in: hold until the intro overlay clears, wait a beat
  // (so the intro's fade/blur-out reads first), then cascade in — and replay on
  // every return to the step.
  const historyEligible = open && !introOpen && activeStep === 'history'
  const [historyDelayed, setHistoryDelayed] = useState(false)
  useEffect(() => {
    if (!historyEligible) { setHistoryDelayed(false); return }
    const t = window.setTimeout(() => setHistoryDelayed(true), 500)
    return () => window.clearTimeout(t)
  }, [historyEligible])
  const historyActive = historyEligible && historyDelayed
  const historyReveal = useReplayTrigger(historyActive)
  const stageIndex = STEP_TO_STAGE[activeStep]
  const planSubStep: 0 | 1 | 2 | 3 =
    activeStep === 'plan-summary' ? 3
    : activeStep === 'plan-pacing' || activeStep === 'plan-pacing-adjust' || activeStep === 'plan-pacing-affirmation' ? 2
    : activeStep === 'plan-reveal' ? 1
    : 0
  const maxStageReached = STEPS.reduce((max, currentStep, index) => {
    if (index > Math.max(collapsedUpTo, focusedIndex)) return max
    return Math.max(max, STEP_TO_STAGE[currentStep])
  }, 0)
  const reached = STAGES.map((_, i) => i <= maxStageReached)

  // scrollStep retained as noop — positioning is now CSS/motion-driven
  const scrollStep = useCallback((_index: number) => {}, [])

  const focusIndex = useCallback((index: number) => {
    const futureLimit = Math.min(collapsedUpTo + 1, lastIndex)
    const next = Math.max(0, Math.min(index, futureLimit))
    setActiveIndex(next)
    window.setTimeout(() => scrollStep(next), 0)
  }, [collapsedUpTo, lastIndex, scrollStep])

  const advanceFromIndex = useCallback((stepIndex: number) => {
    const step = STEPS[stepIndex]
    const nextIndex = Math.min(stepIndex + 1, STEPS.length)

    setCollapsedUpTo((prev) => Math.max(prev, stepIndex))
    setDirtySteps((prev) => ({ ...prev, [step]: false }))
    setSubmittedSteps((prev) => ({ ...prev, [step]: true }))
    setActiveIndex(nextIndex)

    window.setTimeout(() => {
      if (nextIndex <= lastIndex) scrollStep(nextIndex)
    }, 0)
  }, [lastIndex, scrollStep])

  function makeAdvance(stepIndex: number) {
    return () => advanceFromIndex(stepIndex)
  }

  function markDirty(stepIndex: number) {
    if (stepIndex > collapsedUpTo) return
    const step = STEPS[stepIndex]
    setDirtySteps((prev) => ({ ...prev, [step]: true }))
  }

  function showCta(stepIndex: number, hasActiveAnswer = true) {
    const step = STEPS[stepIndex]
    const isCollapsed = stepIndex <= collapsedUpTo
    const isActive = stepIndex === activeIndex

    if (isCollapsed) return dirtySteps[step] === true
    if (isActive) return hasActiveAnswer && submittedSteps[step] !== true
    return false
  }

  function ctaLabel(stepIndex: number, fallback = 'Next') {
    return stepIndex <= collapsedUpTo ? 'Save' : fallback
  }

  function handleIntroAdvance() {
    setIntroSubmitted(true)
    setIntroOpen(false)
    setActiveIndex(0)
    window.setTimeout(() => scrollStep(0), 0)
  }

  function handleStageSelect(id: StageId) {
    const stage = STAGES.findIndex((s) => s.id === id)
    const target = STAGE_ENTRY[stage]
    if (!target) return
    focusIndex(STEPS.indexOf(target))
  }

  const focusPrevious = useCallback(() => {
    focusIndex(Math.max(0, focusedIndex - 1))
  }, [focusIndex, focusedIndex])

  const focusNext = useCallback(() => {
    const futureLimit = Math.min(collapsedUpTo + 1, lastIndex)
    focusIndex(Math.min(futureLimit, focusedIndex + 1))
  }, [focusIndex, focusedIndex, collapsedUpTo, lastIndex])

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    // If the wheel event started inside a nested scrollable element (e.g. the
    // Brand image crop) that still has room to move in this direction, let the
    // browser scroll it natively instead of hijacking the gesture as step nav.
    function canScrollWithin(target: EventTarget | null, deltaY: number) {
      let node = target instanceof Element ? target : null
      while (node && node !== el) {
        const style = window.getComputedStyle(node)
        const scrollable = (style.overflowY === 'auto' || style.overflowY === 'scroll') && node.scrollHeight > node.clientHeight + 1
        if (scrollable) {
          const atTop = node.scrollTop <= 0
          const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1
          if (deltaY > 0 && !atBottom) return true
          if (deltaY < 0 && !atTop) return true
        }
        node = node.parentElement
      }
      return false
    }
    function onWheel(e: WheelEvent) {
      if (canScrollWithin(e.target, e.deltaY)) return
      e.preventDefault()
      if (wheelLockedRef.current) return
      if (Math.abs(e.deltaY) < 10) return
      wheelLockedRef.current = true
      if (e.deltaY > 0) focusNext()
      else focusPrevious()
      window.setTimeout(() => { wheelLockedRef.current = false }, 1100)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [focusNext, focusPrevious])

  useEffect(() => {
    if (open) {
      setPlanAccepting(false)
      const entrance = !discoveryInitialStep && !prefersReducedMotion()
      setIntroRevealed(!entrance)
      /* Drain any rect the Welcome captured on the old flight path so it can't
       * leak into a later open. The flight itself is gone — the orb now just
       * fades + scales in. */
      consumeNylaFlightSource()
      if (discoveryInitialStep) {
        const idx = Math.max(0, STEPS.indexOf(discoveryInitialStep as Step))
        setIntroOpen(false)
        setIntroSubmitted(true)
        setActiveIndex(idx)
        setCollapsedUpTo(idx - 1)
      } else {
        setIntroOpen(true)
        setIntroSubmitted(false)
        setActiveIndex(0)
        setCollapsedUpTo(-1)
      }
      return
    }
    if (!open) {
      const t = window.setTimeout(() => {
        setIntroOpen(true)
        setIntroSubmitted(false)
        setActiveIndex(0)
        setCollapsedUpTo(-1)
        setDirtySteps({})
        setSubmittedSteps({})
        setGrowthSelections([])
        setObjectivesSelections([])
        setPersonalGoalText('')
        setHoveredHistoryRow(null)
        setActivitiesSelections([])
        setConnectionsSelections([])
        setConversationsSelections([])
        setTimeDrainsSelections([])
        setTimeDrainsText('')
        setCloseRateText('')
        setPlanAccepting(false)
      }, 400)
      return () => window.clearTimeout(t)
    }
  }, [open])

  /* Trigger the intro entrance once the overlay is up. A 400ms hold lets the
   * intro settle (cross-dissolving in from Welcome) before the build-in
   * sequence begins. */
  useEffect(() => {
    if (!open || !introOpen || !introHasEntrance || introRevealed) return
    const t = window.setTimeout(() => {
      setIntroRevealed(true)
      clearDiscoveryFromOnboarding()
    }, 400)
    return () => window.clearTimeout(t)
  }, [open, introOpen, introHasEntrance, introRevealed, fromOnboarding, clearDiscoveryFromOnboarding])

  useEffect(() => {
    if (!open || introOpen) return
    scrollStep(focusedIndex)
  }, [focusedIndex, introOpen, open, scrollStep])

  useEffect(() => {
    if (!open || introOpen || activeStep !== 'transition') return
    const transitionIndex = STEPS.indexOf('transition')
    setTransitionExiting(false)  // reset on entering (not on leaving — keep orb/text hidden as it slides away)
    // Play the exit sequence (orb out, then text) in place, THEN advance (slide).
    const exitT = window.setTimeout(() => setTransitionExiting(true), 2000)
    const advT = window.setTimeout(() => advanceFromIndex(transitionIndex), 3200)
    return () => { window.clearTimeout(exitT); window.clearTimeout(advT) }
  }, [activeStep, advanceFromIndex, introOpen, open])

  useEffect(() => {
    if (!open || introOpen || activeStep !== 'plan') return
    const planIndex = STEPS.indexOf('plan')
    const t = setTimeout(() => advanceFromIndex(planIndex), 2600)
    return () => clearTimeout(t)
  }, [activeStep, advanceFromIndex, introOpen, open])

  useEffect(() => {
    if (!open || introOpen || activeStep !== 'brand-loading') return
    const brandLoadingIndex = STEPS.indexOf('brand-loading')
    const t = setTimeout(() => advanceFromIndex(brandLoadingIndex), 2600)
    return () => clearTimeout(t)
  }, [activeStep, advanceFromIndex, introOpen, open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { closeDiscovery(); return }
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); focusNext() }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); focusPrevious() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, closeDiscovery, focusNext, focusPrevious])
  const [free, setFree] = useState('')
  if (!open) return null

  return (
    <motion.div
      role="dialog"
      aria-label="Discovery Flow"
      className="overlay-bleed overflow-hidden"
      style={{ zIndex: 190, backgroundColor: 'var(--bg-surface-elevated)' }}
      /* Quick dissolve on entry (menu quick links land here). The menu below
       * holds opaque for this duration, so it reads as a cross-dissolve. */
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DURATION.short, ease: EASE.settle as [number, number, number, number] }}
    >
      {/* Close button — above intro overlay. Hidden while Nyla is in flight so
          no clickable control exists mid-flight (Escape stays live). */}
      <button
        type="button"
        aria-label="Close"
        onClick={closeDiscovery}
        className="absolute right-10 top-10 z-[60] flex h-10 items-center border-0 bg-transparent p-0 text-[18px] leading-none text-[var(--text-body-muted)]"
        style={{
          cursor: 'pointer',
          opacity: introRevealed ? 1 : 0,
          pointerEvents: introRevealed ? 'auto' : 'none',
          transition: `opacity ${DURATION.quick}s cubic-bezier(${EASE.settle.join(',')})`,
        }}
      >
        ✕
      </button>

      {/* Plan summary background — fades in for affirmation + summary steps */}
      <motion.div
        initial={false}
        animate={{ opacity: (activeStep === 'plan-pacing-affirmation' || activeStep === 'plan-summary') ? 1 : 0 }}
        transition={{ duration: DURATION.deliberate, ease: EASE.settle as [number, number, number, number] }}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}
      >
        <PlanSummaryBackground style={{ position: 'absolute', inset: 0 }} />
      </motion.div>

      {/* StageRail — delayed fade-in after intro slides away */}
      <motion.div
        className="fixed left-0 top-0 z-[30] flex h-full w-[272px] flex-col px-2 py-10 pl-10"
        initial={false}
        animate={{ opacity: introOpen ? 0 : 1 }}
        transition={{ duration: DURATION.quick, delay: introOpen ? 0 : DURATION['scene-in'] }}
        style={{ pointerEvents: introOpen ? 'none' : 'auto' }}
      >
        <StageRail
          stageIndex={stageIndex}
          reached={reached}
          onSelect={handleStageSelect}
          onPrev={focusPrevious}
          onNext={focusNext}
          prevDisabled={focusedIndex === 0}
          nextDisabled={focusedIndex >= Math.min(collapsedUpTo + 1, lastIndex)}
          planSubStep={planSubStep}
          dark={activeStep === 'plan-summary'}
          introDelay={0}
        />
      </motion.div>

        <div
          ref={scrollContainerRef}
          className="absolute inset-0 overflow-hidden"
        >
          <ThreadStep
            index={0}
            activeIndex={activeIndex}
            collapsedUpTo={collapsedUpTo}
            setRef={(node) => { stepRefs.current[0] = node }}
          >
          <div style={CONTENT_COLUMN_STYLE}>
            <motion.div
              key={historyReveal.playKey}
              variants={historyGroupVariants}
              initial="hidden"
              animate={historyReveal.played ? 'visible' : 'hidden'}
            >
              <motion.div variants={historyHeadingVariants}>
                <SectionHeader
                  variant="secondary"
                  heading="What we know"
                  body="We've already gathered some information about your practice. Take a look, confirm what's correct, and update anything that needs attention."
                />
              </motion.div>
              <HistoryRows
                className="mt-8"
                hoveredRow={hoveredHistoryRow}
                setHoveredRow={setHoveredHistoryRow}
                scrollContainerRef={scrollContainerRef}
                setTooltipY={setHistoryTooltipY}
              />
              <motion.div variants={historyCtaVariants}>
                <CTAReveal show={showCta(0)}>
                  <ButtonContainer
                    primaryLabel={ctaLabel(0, 'Looks good')}
                    secondaryLabel="Something is wrong"
                    secondaryVariant="text"
                    onPrimary={makeAdvance(0)}
                    className="mt-10"
                  />
                </CTAReveal>
              </motion.div>
            </motion.div>
          </div>
          <ActiveOnly>
            <HistoryTooltip hoveredRow={hoveredHistoryRow} tooltipY={historyTooltipY} />
          </ActiveOnly>
          </ThreadStep>

          <ThreadStep
            index={1}
            activeIndex={activeIndex}
            collapsedUpTo={collapsedUpTo}
            setRef={(node) => { stepRefs.current[1] = node }}
            background="loading"
          >
          <div style={CONTENT_COLUMN_STYLE}>
            {/* Re-mount on arrival so the orb replays its scatter→form, then the copy sequences in */}
            <ActiveOnly>
              <SectionHeader
                animated
                nylaSequence
                variant="primary"
                heading="Define your goals for 2027."
                body="Set the goals that matter to you - your income, your clients, your practice. We'll help you build a path to get there. You can always adjust as your ambitions grow."
                showNyla
              />
            </ActiveOnly>
            <RevealBody>
              <motion.div {...fadeUp(0, true)}>
                <CTAReveal show={showCta(1)} delay={1.5}>
                  <ButtonContainer
                    primaryLabel={ctaLabel(1, 'Continue')}
                    showSecondary={false}
                    onPrimary={makeAdvance(1)}
                    className="mt-10"
                  />
                </CTAReveal>
              </motion.div>
            </RevealBody>
          </div>
          </ThreadStep>

          <ThreadStep
            index={2}
            activeIndex={activeIndex}
            collapsedUpTo={collapsedUpTo}
            setRef={(node) => { stepRefs.current[2] = node }}
          >
          <div style={CONTENT_COLUMN_STYLE}>
            <SectionHeader
              animated
              variant="secondary"
              heading="Where do you want your practice to head in the next two to three years?"
              body="Select up to 3."
            />
            <RevealBody>
              <motion.div {...fadeUp(0)}>
                <OptionTileGroup
                  options={GROWTH_OPTIONS}
                  value={growthSelections}
                  onChange={(value) => {
                    setGrowthSelections(value)
                    markDirty(2)
                  }}
                  max={3}
                  cols={2}
                  className="mt-8"
                />
              <div className="relative">
                <TextInput
                  variant="text"
                  value={personalGoalText}
                  onChange={(value) => {
                    setPersonalGoalText(value)
                    markDirty(5)
                  }}
                  placeholder="Tell me in your own words..."
                  className="mt-3"
                />
        </div>
              </motion.div>
              <motion.div {...fadeUp(0, true)}>
                <CTAReveal show={showCta(2, true)}>
                  <ButtonContainer primaryLabel={ctaLabel(2)} onPrimary={makeAdvance(2)} primaryDisabled={growthSelections.length === 0} showSecondary={false} className="mt-8" />
                </CTAReveal>
              </motion.div>
            </RevealBody>
          </div>
          </ThreadStep>

          <ThreadStep
            index={3}
            activeIndex={activeIndex}
            collapsedUpTo={collapsedUpTo}
            setRef={(node) => { stepRefs.current[3] = node }}
          >
          <div style={CONTENT_COLUMN_STYLE}>
            <SectionHeader
              animated
              variant="secondary"
              heading="Your General Office recommends you run for President's Council this year."
              body="Here's how you stand on the factors that secure your qualification."
            />
            <RevealBody className="mt-8">
              <motion.div {...fadeUp(0)}>
                <CouncilSnapshot />
              </motion.div>
              <motion.div {...fadeUp(0, true)}>
                <CTAReveal show={showCta(3)}>
                  <ButtonContainer primaryLabel={ctaLabel(3, 'Got it')} showSecondary={false} onPrimary={makeAdvance(3)} className="mt-8" />
                </CTAReveal>
              </motion.div>
            </RevealBody>
          </div>
          </ThreadStep>

          <ThreadStep
            index={4}
            activeIndex={activeIndex}
            collapsedUpTo={collapsedUpTo}
            setRef={(node) => { stepRefs.current[4] = node }}
          >
          <div style={CONTENT_COLUMN_STYLE}>
            <SectionHeader
              animated
              variant="secondary"
              heading="Set your First Year Commission (FYC) target for 2027"
              body={<>Last year you earned <strong>$165,000</strong>. You can also adjust this at any time.</>}
            />
            <RevealBody className="mt-9">
              <motion.div {...fadeUp(0)}>
                <TextInput
                  value={`$ ${fycTarget}`}
                  onChange={(value) => {
                    setFycTarget(value.replace(/^\$\s*/, ''))
                    markDirty(4)
                  }}
                  placeholder="$ 175,000"
                />
              </motion.div>
              <motion.div {...fadeUp(0, true)}>
                <CTAReveal show={showCta(4)}>
                  <ButtonContainer primaryLabel={ctaLabel(4)} showSecondary={false} onPrimary={makeAdvance(4)} className="mt-6" />
                </CTAReveal>
              </motion.div>
            </RevealBody>
          </div>
          <ActiveOnly>
            <FycGuidance fycTarget={fycTarget} />
          </ActiveOnly>
          </ThreadStep>

          <ThreadStep
            index={5}
            activeIndex={activeIndex}
            collapsedUpTo={collapsedUpTo}
            setRef={(node) => { stepRefs.current[5] = node }}
          >
          <div style={CONTENT_COLUMN_STYLE}>
            <SectionHeader
              animated
              variant="secondary"
              heading="What are you making time for outside of work this year?"
              body="Your business should support your life, not the other way around. This is optional."
            />
            <RevealBody>
              <motion.div {...fadeUp(0)}>
                <OptionTileGroup
                  options={OBJECTIVES_OPTIONS}
                  value={objectivesSelections}
                  onChange={(value) => {
                    setObjectivesSelections(value)
                    markDirty(5)
                  }}
                  max={2}
                  cols={2}
                  size="compact"
                  className="mt-8"
                />
                <p className="mb-0 mt-8 text-[14px] text-[var(--text-body-muted)]">Have a different goal?</p>
                <TextInput
                  variant="text"
                  value={personalGoalText}
                  onChange={(value) => {
                    setPersonalGoalText(value)
                    markDirty(5)
                  }}
                  placeholder="Tell me in your own words..."
                  className="mt-3"
                />
              </motion.div>
              <motion.div {...fadeUp(0, true)}>
                <CTAReveal show={showCta(5)}>
                  <ButtonContainer primaryLabel={ctaLabel(5)} onPrimary={makeAdvance(5)} onSecondary={makeAdvance(5)} primaryDisabled={objectivesSelections.length === 0 && personalGoalText.trim().length === 0} className="mt-6" />
                </CTAReveal>
              </motion.div>
            </RevealBody>
          </div>
          </ThreadStep>

          <ThreadStep
            index={6}
            activeIndex={activeIndex}
            collapsedUpTo={collapsedUpTo}
            setRef={(node) => { stepRefs.current[6] = node }}
            background="loading"
          >
          {/* Orb + caption centered together as a group */}
          <div className="relative flex flex-col items-center gap-8">
            <TransitionOrb exiting={transitionExiting} />
            <TransitionText exiting={transitionExiting} text="Synthesizing your goals and priorities..." />
          </div>
          </ThreadStep>

          <ThreadStep
            index={7}
            activeIndex={activeIndex}
            collapsedUpTo={collapsedUpTo}
            setRef={(node) => { stepRefs.current[7] = node }}
            background="loading"
          >
          <div style={CONTENT_COLUMN_STYLE}>
            {/* Re-mount on arrival so the orb replays its scatter→form, then the copy sequences in */}
            <ActiveOnly>
              <SectionHeader
                animated
                nylaSequence
                variant="primary"
                heading="You've got goals. Now let's build around how you actually work."
                body="The best plan fits your practice, not a template. A few more questions and we'll shape everything around how you run your business - so the right opportunities show up when you need them."
                showNyla
              />
            </ActiveOnly>
            <RevealBody>
              <motion.div {...fadeUp(0, true)}>
                <CTAReveal show={showCta(7)} delay={1.5}>
                  <ButtonContainer
                    primaryLabel={ctaLabel(7, 'Continue')}
                    showSecondary={false}
                    onPrimary={makeAdvance(7)}
                    className="mt-10"
                  />
                </CTAReveal>
              </motion.div>
            </RevealBody>
          </div>
          </ThreadStep>

          <QuestionStep
            index={8}
            activeIndex={activeIndex}
            collapsedUpTo={collapsedUpTo}
            setRef={(node) => { stepRefs.current[8] = node }}
            heading="Which client activities do you typically prioritize?"
            body="This is how I'll determine what's most important to show you."
          >
          <motion.div {...fadeUp(0)}>
            <OptionTileGroup
              options={ACTIVITIES_OPTIONS}
              value={activitiesSelections}
              onChange={(value) => {
                setActivitiesSelections(value)
                markDirty(8)
              }}
              max={3}
              cols={2}
              className="mt-8"
            />
          </motion.div>
          <motion.div {...fadeUp(0, true)}>
            <CTAReveal show={showCta(8, true)}>
              <ButtonContainer primaryLabel={ctaLabel(8)} onPrimary={makeAdvance(8)} primaryDisabled={activitiesSelections.length === 0} showSecondary={false} className="mt-8" />
            </CTAReveal>
          </motion.div>
          </QuestionStep>

          <QuestionStep
            index={9}
            activeIndex={activeIndex}
            collapsedUpTo={collapsedUpTo}
            setRef={(node) => { stepRefs.current[9] = node }}
            heading="How do you currently stay connected with clients and prospects between meetings?"
            body="Select up to 3 methods you use the most today."
          >
          <motion.div {...fadeUp(0)}>
            <OptionTileGroup
              options={CONNECTIONS_OPTIONS}
              value={connectionsSelections}
              onChange={(value) => {
                setConnectionsSelections(value)
                markDirty(9)
              }}
              max={3}
              cols={2}
              size="compact"
              className="mt-8"
            />
          </motion.div>
          <motion.div {...fadeUp(0, true)}>
            <CTAReveal show={showCta(9, true)}>
              <ButtonContainer primaryLabel={ctaLabel(9)} onPrimary={makeAdvance(9)} primaryDisabled={connectionsSelections.length === 0} showSecondary={false} className="mt-8" />
            </CTAReveal>
          </motion.div>
          </QuestionStep>

          <QuestionStep
            index={10}
            activeIndex={activeIndex}
            collapsedUpTo={collapsedUpTo}
            setRef={(node) => { stepRefs.current[10] = node }}
            heading="Which client conversations do you want more support with?"
            body="Select up to 3."
          >
          <motion.div {...fadeUp(0)}>
            <OptionTileGroup
              options={CONVERSATIONS_OPTIONS}
              value={conversationsSelections}
              onChange={(value) => {
                setConversationsSelections(value)
                markDirty(10)
              }}
              max={3}
              cols={2}
              size="compact"
              className="mt-8"
            />
          </motion.div>
          <motion.div {...fadeUp(0, true)}>
            <CTAReveal show={showCta(10, true)}>
              <ButtonContainer primaryLabel={ctaLabel(10)} onPrimary={makeAdvance(10)} primaryDisabled={conversationsSelections.length === 0} showSecondary={false} className="mt-8" />
            </CTAReveal>
          </motion.div>
          </QuestionStep>

          <QuestionStep
            index={11}
            activeIndex={activeIndex}
            collapsedUpTo={collapsedUpTo}
            setRef={(node) => { stepRefs.current[11] = node }}
            heading="What are the top things that take time away from your highest priorities?"
            body="Select up to 3."
          >
          <motion.div {...fadeUp(0)}>
            <OptionTileGroup
              options={TIME_DRAINS_OPTIONS}
              value={timeDrainsSelections}
              onChange={(value) => {
                setTimeDrainsSelections(value)
                markDirty(11)
              }}
              max={3}
              cols={2}
              size="compact"
              className="mt-8"
            />
            <TextInput
              variant="text"
              value={timeDrainsText}
              onChange={(value) => {
                setTimeDrainsText(value)
                markDirty(11)
              }}
              placeholder="Tell me in your own words..."
              className="mt-6"
            />
          </motion.div>
          <motion.div {...fadeUp(0, true)}>
            <CTAReveal show={showCta(11, true)}>
              <ButtonContainer primaryLabel={ctaLabel(11)} onPrimary={makeAdvance(11)} primaryDisabled={timeDrainsSelections.length === 0 && timeDrainsText.length === 0} showSecondary={false} className="mt-6" />
            </CTAReveal>
          </motion.div>
          </QuestionStep>

          <QuestionStep
            index={12}
            activeIndex={activeIndex}
            collapsedUpTo={collapsedUpTo}
            setRef={(node) => { stepRefs.current[12] = node }}
            heading="Let's talk close rate."
            body="Your close rate has improved in each of the last 3 years.  How can I help you support continued growth?"
          >
          <motion.div {...fadeUp(0)}>
            <Textarea
              value={closeRateText}
              onChange={(value) => {
                setCloseRateText(value)
                markDirty(12)
              }}
              placeholder="Describe in your own words..."
              tags={['Strong lead quality', 'Competitive pricing', 'Setting personal goals']}
              chipSentences={{
                'Poor lead quality lately': "My close rate has been impacted by poor lead quality lately — the prospects I've been working with haven't been as qualified as in previous years.",
                'Uncompetitive pricing': "Uncompetitive pricing has been a factor in some of my lost deals, with clients finding better rates elsewhere.",
                'This is news to me': "This is honestly news to me — I wasn't aware my close rate had dipped and would appreciate any additional context.",
              }}
              onMicClick={() => {}}
              className="mt-8"
            />
          </motion.div>
          <motion.div {...fadeUp(0, true)}>
            <CTAReveal show={showCta(12, true)}>
              <ButtonContainer
                primaryLabel={ctaLabel(12, 'Save and continue')}
                onSecondary={makeAdvance(12)}
                primaryDisabled={closeRateText.length === 0}
                onPrimary={makeAdvance(12)}
                className="mt-6"
              />
            </CTAReveal>
          </motion.div>
          </QuestionStep>

          <ThreadStep
            index={13}
            activeIndex={activeIndex}
            collapsedUpTo={collapsedUpTo}
            setRef={(node) => { stepRefs.current[13] = node }}
            background="loading"
          >
          <div style={CONTENT_COLUMN_STYLE}>
            {/* Re-mount on arrival so the orb replays its scatter→form, then the copy sequences in */}
            <ActiveOnly>
              <SectionHeader
                animated
                nylaSequence
                variant="primary"
                heading="Now let's talk about your brand."
                body="A few quick questions about how you present yourself to clients and prospects."
                showNyla
              />
            </ActiveOnly>
            <RevealBody>
              <motion.div {...fadeUp(0, true)}>
                <CTAReveal show={showCta(13)} delay={1.5}>
                  <ButtonContainer
                    primaryLabel={ctaLabel(13, 'Continue')}
                    showSecondary={false}
                    onPrimary={makeAdvance(13)}
                    className="mt-10"
                  />
                </CTAReveal>
              </motion.div>
            </RevealBody>
          </div>
          </ThreadStep>

          
          <QuestionStep
            index={14}
            activeIndex={activeIndex}
            collapsedUpTo={collapsedUpTo}
            setRef={(node) => { stepRefs.current[14] = node }}
            heading="How would your friends and clients describe you?"
            body="Select up to 3."
          >
          <motion.div {...fadeUp(0)}>
            <OptionTileGroup
              options={OPTIONS_BRAND_1}
              value={optionsBrand1}
              onChange={(value) => {
                setOptionsBrand1(value)
                markDirty(14)
              }}
              max={3}
              cols={2}
              size="compact"
              className="mt-8"
            />
            <TextInput
              variant="text"
              value={brand1Text}
              onChange={(value) => {
                setBrand1Text(value)
                markDirty(14)
              }}
              placeholder="Tell me in your own words..."
              className="mt-6"
            />
          </motion.div>
          <motion.div {...fadeUp(0, true)}>
            <CTAReveal show={showCta(14, true)}>
              <ButtonContainer primaryLabel={ctaLabel(14)} onPrimary={makeAdvance(14)} showSecondary={false} className="mt-6" />
            </CTAReveal>
          </motion.div>
          </QuestionStep>
          <QuestionStep
            index={15}
            activeIndex={activeIndex}
            collapsedUpTo={collapsedUpTo}
            setRef={(node) => { stepRefs.current[15] = node }}
            heading="How can I support your marketing efforts?"
            body="Select all that apply."
          >
          <motion.div {...fadeUp(0)}>
            <OptionTileGroup
              options={OPTIONS_BRAND_2}
              value={optionsBrand2}
              onChange={(value) => {
                setOptionsBrand2(value)
                markDirty(15)
              }}
              max={3}
              cols={2}
              size="compact"
              className="mt-8"
            />
            <TextInput
              variant="text"
              value={brand2Text}
              onChange={(value) => {
                setBrand2Text(value)
                markDirty(15)
              }}
              placeholder="Tell me in your own words..."
              className="mt-6"
            />
          </motion.div>
          <motion.div {...fadeUp(0, true)}>
            <CTAReveal show={showCta(15, true)}>
              <ButtonContainer primaryLabel={ctaLabel(15)} onPrimary={makeAdvance(15)} showSecondary={false} className="mt-6" />
            </CTAReveal>
          </motion.div>
          </QuestionStep>
          <QuestionStep
            index={16}
            activeIndex={activeIndex}
            collapsedUpTo={collapsedUpTo}
            setRef={(node) => { stepRefs.current[16] = node }}
            heading="What are your interests?"
            body="Select all that apply."
          >
          <motion.div {...fadeUp(0)}>
            <OptionTileGroup
              options={OPTIONS_BRAND_3}
              value={optionsBrand3}
              onChange={(value) => {
                setOptionsBrand3(value)
                markDirty(16)
              }}
              max={3}
              cols={2}
              size="compact"
              className="mt-8"
            />
            <TextInput
              variant="text"
              value={brand3Text}
              onChange={(value) => {
                setBrand3Text(value)
                markDirty(16)
              }}
              placeholder="Tell me in your own words..."
              className="mt-6"
            />
          </motion.div>
          <motion.div {...fadeUp(0, true)}>
            <CTAReveal show={showCta(16, true)}>
              <ButtonContainer primaryLabel={ctaLabel(16)} onPrimary={makeAdvance(16)} showSecondary={false} className="mt-6" />
            </CTAReveal>
          </motion.div>
          </QuestionStep>
          <QuestionStep
            index={17}
            activeIndex={activeIndex}
            collapsedUpTo={collapsedUpTo}
            setRef={(node) => { stepRefs.current[17] = node }}
            heading="Anything else you want me to know about you?"
            body="Feel free to tell me anything of interest and i'll use it to draft your profile."
          >
          <motion.div {...fadeUp(0)}>
            <Textarea
              value={brand4Text}
              onChange={(value) => {
                setBrand4Text(value)
                markDirty(17)
              }}
              placeholder="Describe in your own words..."
              minHeight={209}
              onMicClick={() => {}}
              className="mt-8"
            />
          </motion.div>
          <motion.div {...fadeUp(0, true)}>
            <CTAReveal show={showCta(17, true)}>
              <ButtonContainer
                primaryLabel={ctaLabel(17, 'Save and continue')}
                onSecondary={makeAdvance(17)}
                primaryDisabled={brand4Text.length === 0}
                onPrimary={makeAdvance(17)}
                className="mt-6"
              />
            </CTAReveal>
          </motion.div>
          </QuestionStep>

          <ThreadStep
            index={18}
            activeIndex={activeIndex}
            collapsedUpTo={collapsedUpTo}
            setRef={(node) => { stepRefs.current[18] = node }}
            background="loading"
          >
          <div className="relative flex flex-col items-center gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: DURATION.deliberate, ease: EASE.settle as [number, number, number, number] }}
            >
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}>
                <Nyla size={160} variant="on-light" />
              </motion.div>
            </motion.div>
            <TransitionText text="Pulling it all together..." exiting={false} active startDelay={0.5} />
          </div>
          </ThreadStep>

          <ThreadStep
            index={19}
            activeIndex={activeIndex}
            collapsedUpTo={collapsedUpTo}
            setRef={(node) => { stepRefs.current[19] = node }}
            compact
          >
          <div style={CONTENT_COLUMN_STYLE}>
            <RevealBody>
              <motion.div {...fadeUp(0)}>
                <Brand />
              </motion.div>
              <motion.div {...fadeUp(0, true)}>
                <CTAReveal show={showCta(19)}>
                  <ButtonContainer primaryLabel={ctaLabel(19)} onPrimary={makeAdvance(19)} showSecondary={false} className="mt-6" />
                </CTAReveal>
              </motion.div>
            </RevealBody>
          </div>
          </ThreadStep>
        </div>


      {/* Intro overlay — on "I'm ready" it fades out (and its content blurs
          out) rather than sliding up, cross-dissolving into step 0 as History
          builds in behind it. */}
      <motion.div
        className="absolute inset-0 flex flex-col justify-center"
        initial={false}
        animate={{ opacity: introOpen ? 1 : 0 }}
        transition={{ duration: DURATION.cinematic, ease: EASE.settle }}
        style={{ zIndex: 50, pointerEvents: introOpen ? 'auto' : 'none' }}
      >
        <LoadingBackground style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        <div aria-hidden="true" style={{ position: 'absolute', inset: '60% 0 0 0', background: 'linear-gradient(to bottom, transparent, #fff)', zIndex: 1, pointerEvents: 'none' }} />
        {/* Content group — on exit the orb + copy blur + drift out together, on a
            slow cinematic dissolve. */}
        <motion.div
          style={{ position: 'relative', zIndex: 2 }}
          initial={false}
          animate={{ filter: introOpen ? 'blur(0px)' : 'blur(28px)', scale: introOpen ? 1 : 0.98 }}
          transition={{ duration: DURATION.cinematic, ease: EASE.settle }}
        >
          <div style={CONTENT_COLUMN_STYLE}>
            {/* Orb — fades in + scales up to open the sequence. */}
            <motion.div
              initial={introHasEntrance ? { opacity: 0, scale: 0.6 } : false}
              animate={{ opacity: introRevealed ? 1 : 0, scale: introRevealed ? 1 : 0.6 }}
              transition={{ duration: DURATION.deliberate, ease: EASE.settle as [number, number, number, number] }}
              style={{ transformOrigin: 'left center', width: 'fit-content' }}
            >
              <Nyla size={160} variant="on-light" animate align="left" condense={false} />
            </motion.div>
            {/* Copy cascade — headline, then body, once the orb has settled.
                Explicit opacity-0 start so the fade always begins fully clear. */}
            <motion.h1
              initial={introHasEntrance ? { opacity: 0, y: 8 } : false}
              animate={{ opacity: introRevealed ? 1 : 0, y: introRevealed ? 0 : 8 }}
              transition={{ duration: DURATION['scene-in'], ease: EASE.settle, delay: introRevealed ? 0.8 : 0 }}
              className="mt-6 font-serif text-[var(--nyl-blue-800)]"
              style={{
                fontSize: 'var(--size-display-01)',
                lineHeight: 'var(--line-display-01)',
                letterSpacing: 0,
              }}
            >
              Hi, Sarah. I'm Nyla. Together, we'll build a plan for your practice, your way.
            </motion.h1>
            <motion.p
              initial={introHasEntrance ? { opacity: 0, y: 8 } : false}
              animate={{ opacity: introRevealed ? 1 : 0, y: introRevealed ? 0 : 8 }}
              transition={{ duration: DURATION['scene-in'], ease: EASE.settle, delay: introRevealed ? 0.92 : 0 }}
              className="mt-6 text-[16px] text-[var(--text-body)]"
            >
              Every agent is different, and I want to hear what makes your style your own. As we go through this,
              keep in mind: the plan is always changeable.
            </motion.p>
            <motion.p
              initial={introHasEntrance ? { opacity: 0, y: 8 } : false}
              animate={{ opacity: introRevealed ? 1 : 0, y: introRevealed ? 0 : 8 }}
              transition={{ duration: DURATION['scene-in'], ease: EASE.settle, delay: introRevealed ? 1.02 : 0 }}
              className="mt-2 text-[16px] text-[var(--text-headline)]"
            >
              Let's get to know you.
            </motion.p>
            {/* CTA builds in last — after the orb and the full copy cascade.
                Explicit opacity-0 start (like the copy) so it never flashes in
                before its delay elapses. */}
            <motion.div
              initial={introHasEntrance ? { opacity: 0, y: 8 } : false}
              animate={{
                opacity: introRevealed && !introSubmitted ? 1 : 0,
                y: introRevealed ? 0 : 8,
              }}
              transition={{ duration: DURATION['scene-in'], ease: EASE.settle, delay: introSubmitted ? 0 : 1.7 }}
              style={{ pointerEvents: introRevealed && !introSubmitted ? 'auto' : 'none' }}
            >
              <ButtonContainer
                primaryLabel="I'm ready"
                showSecondary={false}
                onPrimary={handleIntroAdvance}
                className="mt-8"
              />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Plan loading — fades in over discovery questions, has its own transition into plan-reveal */}
      <AnimatePresence>
        {activeStep === 'plan' && (
          <motion.div
            key="plan-loading"
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION['scene-in'], ease: EASE.settle as [number, number, number, number] }}
            style={{ zIndex: 20 }}
          >
            <GradientStepBackground />
            {/* Orb + caption centered together: orb fades/scales in, then the text typewrites in */}
            <div className="relative z-10 flex flex-col items-center gap-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: DURATION.deliberate, ease: EASE.settle as [number, number, number, number] }}
              >
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}>
                  <Nyla size={160} variant="on-light" />
                </motion.div>
              </motion.div>
              <TransitionText text="Pulling it all together..." exiting={false} active startDelay={0.5} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plan sub-steps (reveal → pacing → adjust) — slide up/down matching ThreadStep */}
      {((['plan-reveal', 'plan-pacing', 'plan-pacing-adjust'] as const).map((s, i, arr) => {
        const planActiveIndex = arr.indexOf(activeStep as typeof arr[number])
        if (planActiveIndex === -1) return null
        const isActive = i === planActiveIndex
        const yTarget = isActive ? '0%' : i < planActiveIndex ? '-100%' : '100%'
        return (
          <motion.div
            key={s}
            className="absolute inset-0"
            initial={false}
            animate={{ y: yTarget }}
            transition={{ duration: DURATION.dramatic, ease: EASE.settle as [number, number, number, number] }}
            style={{ zIndex: 21, pointerEvents: isActive ? 'auto' : 'none', marginLeft: 272, overflowY: isActive ? 'auto' : 'hidden' }}
          >
            {s === 'plan-reveal' && <WhatIHeard onContinue={() => advanceFromIndex(STEPS.indexOf('plan-reveal'))} />}
            {s === 'plan-pacing' && <PacingStep fyc={fycTarget} onContinue={() => advanceFromIndex(STEPS.indexOf('plan-pacing'))} onAdjust={() => setActiveIndex(STEPS.indexOf('plan-pacing-adjust'))} />}
            {s === 'plan-pacing-adjust' && <PacingAdjust onSkip={() => advanceFromIndex(STEPS.indexOf('plan-pacing-adjust'))} onConfirm={() => advanceFromIndex(STEPS.indexOf('plan-pacing-adjust'))} />}
          </motion.div>
        )
      }))}

      {/* Affirmation + summary — own transitions, not in slide stack (auto-timers must not fire off-screen) */}
      <AnimatePresence>
        {activeStep === 'plan-pacing-affirmation' && (
          <motion.div
            key="plan-pacing-affirmation"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION['scene-in'], ease: EASE.settle as [number, number, number, number] }}
            style={{ zIndex: 21 }}
          >
            <NylaAffirmation headline="Let's put everything together into your plan..." onComplete={() => advanceFromIndex(STEPS.indexOf('plan-pacing-affirmation'))} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeStep === 'plan-summary' && (
          <motion.div
            key="plan-summary"
            className="absolute inset-0"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION['scene-in'], ease: EASE.settle as [number, number, number, number] }}
            style={{ zIndex: 21, overflowY: 'auto' }}
          >
            <PlanSummary
              advisorName="Sarah"
              onClose={closeDiscovery}
              onAccept={() => setPlanAccepting(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plan accept loader — full-screen takeover, above everything */}
      <AnimatePresence>
        {planAccepting && (
          <motion.div
            key="plan-accept-loader"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION['scene-in'], ease: EASE.settle as [number, number, number, number] }}
            style={{ zIndex: 50 }}
          >
            <PlanAcceptLoader
              onComplete={() => {
                closeDiscovery()
                openBriefingV6FromDiscovery()
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ThreadStep({
  index,
  activeIndex,
  collapsedUpTo,
  setRef,
  background,
  compact,
  children,
}: {
  index: number
  activeIndex: number
  collapsedUpTo: number
  setRef: (node: HTMLDivElement | null) => void
  background?: 'loading'
  compact?: boolean
  children: ReactNode
}) {
  const isCollapsed = index <= collapsedUpTo
  const isActive = index === activeIndex

  // Collapsed (answered) steps sit above → y: -100%
  // Active step is centered → y: 0%
  // Upcoming steps sit progressively below so only the next one is in-range during transition
  const yTarget = isActive ? '0%' : index < activeIndex ? '-100%' : `${(index - activeIndex) * 100}%`

  return (
    <StepCollapsedContext.Provider value={isCollapsed}>
      <StepActiveContext.Provider value={isActive}>
        <motion.section
          ref={setRef as React.Ref<HTMLElement>}
          className={`absolute inset-0 flex flex-col justify-center overflow-hidden ${compact ? 'py-4' : 'py-16'}`}
          initial={false}
          animate={{ y: yTarget }}
          transition={{ duration: DURATION.dramatic, ease: EASE.settle }}
          style={{ pointerEvents: isActive ? 'auto' : 'none' }}
          aria-current={isActive ? 'step' : undefined}
        >
          {background === 'loading' && <GradientStepBackground />}
          {children}
        </motion.section>
      </StepActiveContext.Provider>
    </StepCollapsedContext.Provider>
  )
}

function GradientStepBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <LoadingBackground style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      <div
        className="absolute inset-x-0 top-0 h-[30vh]"
        style={{
          background: 'linear-gradient(to bottom, var(--bg-surface-elevated) 0%, transparent 100%)',
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[38vh]"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, var(--bg-surface-elevated) 100%)',
        }}
      />
    </div>
  )
}

function QuestionStep({
  index,
  activeIndex,
  collapsedUpTo,
  setRef,
  heading,
  body,
  children,
}: {
  index: number
  activeIndex: number
  collapsedUpTo: number
  setRef: (node: HTMLDivElement | null) => void
  heading: string
  body: string
  children: ReactNode
}) {
  return (
    <ThreadStep index={index} activeIndex={activeIndex} collapsedUpTo={collapsedUpTo} setRef={setRef}>
      <div style={CONTENT_COLUMN_STYLE}>
        <SectionHeader animated variant="secondary" heading={heading} body={body} />
        <RevealBody>{children}</RevealBody>
      </div>
    </ThreadStep>
  )
}

function RevealBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}

function CTAReveal({ show, children, delay = 0 }: { show: boolean; children: ReactNode; delay?: number }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: DURATION.quick, delay, ease: EASE.settle }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ActiveOnly({ children }: { children: ReactNode }) {
  return useStepActive() ? <>{children}</> : null
}

// Re-arms a build-in each time `active` goes false→true. `playKey` bumps on every
// activation (remount the animated group to replay it); `played` stays true once
// it has fired, so the group animates to "visible" on entry but is never forced
// back to "hidden" on exit — the content stays rendered while its step slides away.
function useReplayTrigger(active: boolean) {
  const [playKey, setPlayKey] = useState(0)
  const [played, setPlayed] = useState(false)
  const wasActive = useRef(false)
  useEffect(() => {
    if (active && !wasActive.current) {
      setPlayed(true)
      setPlayKey((k) => k + 1)
    }
    wasActive.current = active
  }, [active])
  return { playKey, played }
}

/* Transition-screen orb: visible on the transition screen, then fades out and
 * scales down (before the screen advances) as the section hands off. */
function TransitionOrb({ exiting }: { exiting: boolean }) {
  return (
    <motion.div
      animate={exiting ? { opacity: 0, scale: 0.4 } : { opacity: 1, scale: 1 }}
      transition={{ duration: DURATION.dramatic, ease: EASE.settle as [number, number, number, number] }}
    >
      {/* 18s continuous spin — not a DURATION token; ease: 'linear' intentional for uniform rotation */}
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}>
        <Nyla size={160} variant="on-light" />
      </motion.div>
    </motion.div>
  )
}

/* Transition-screen caption: each character blurs + fades in on arrival (organic
 * typewriter, one line); on exit the whole line fades and blurs out (bigger blur)
 * a beat after the orb, as the section hands off. */
function TransitionText({ text, exiting, active: activeProp, startDelay = 0 }: { text: string; exiting: boolean; active?: boolean; startDelay?: number }) {
  const stepActive = useStepActive()
  const active = activeProp ?? stepActive

  return (
    <motion.p
      className="whitespace-nowrap text-center font-serif text-[24px] tracking-normal text-[var(--nyl-purple-700)]"
      initial={{ opacity: 1, filter: 'blur(0px)' }}
      animate={exiting ? { opacity: 0, filter: 'blur(28px)' } : { opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: DURATION.dramatic, ease: EASE.settle as [number, number, number, number], delay: exiting ? 0.15 : 0 }}
    >
      {active && text.split('').map((ch, i) => (
        <motion.span
          key={i}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.5, delay: startDelay + i * 0.03, ease: EASE.settle as [number, number, number, number] }}
        >
          {ch}
        </motion.span>
      ))}
    </motion.p>
  )
}

function HistoryRows({
  hoveredRow,
  setHoveredRow,
  scrollContainerRef,
  setTooltipY,
  className,
}: {
  hoveredRow: string | null
  setHoveredRow: (label: string | null) => void
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  setTooltipY: (y: number) => void
  className?: string
}) {
  function handleMouseEnter(e: React.MouseEvent<HTMLSpanElement>, label: string) {
    setHoveredRow(label)
    const rowRect = e.currentTarget.getBoundingClientRect()
    const containerRect = scrollContainerRef.current?.getBoundingClientRect()
    if (containerRect) {
      setTooltipY(rowRect.top + rowRect.height / 2 - containerRect.top)
    }
  }

  // The list is a variant container so each row cascades in; it inherits its
  // hidden/visible state from the parent History group (no initial/animate here).
  return (
    <motion.div className={className} variants={historyListVariants}>
      {HISTORY_ROWS.map((row, i) => (
        <motion.div key={row.label} variants={historyItemVariants}>
          {i > 0 && <div className="h-px bg-[var(--border-subtle)]" />}
          <div className="flex items-baseline justify-between gap-2 py-3">
            <span className="text-[18px] text-[var(--text-body)]">{row.label}</span>
            {row.dotted ? (
              <span
                className="shrink-0 cursor-default text-right font-serif text-[20px] font-light underline decoration-dotted underline-offset-[3px]"
                style={{
                  color: hoveredRow === row.label ? 'var(--action-primary)' : 'var(--text-headline)',
                  textDecorationColor: hoveredRow === row.label ? 'var(--action-primary)' : 'var(--nyl-blue-500)',
                  transition: `color ${DURATION.micro}s`,
                }}
                onMouseEnter={(e) => handleMouseEnter(e, row.label)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {row.value}
              </span>
            ) : (
              <span className="shrink-0 text-right font-serif text-[20px] font-light text-[var(--text-headline)]">
                {row.value}
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

function HistoryTooltip({ hoveredRow, tooltipY }: { hoveredRow: string | null; tooltipY: number }) {
  const row = hoveredRow ? HISTORY_ROWS.find((r) => r.label === hoveredRow) : null
  return (
    <AnimatePresence mode="wait">
      {row?.tooltip && (
        <motion.div
          key={row.label}
          className="absolute"
          style={{
            ...SIDE_COLUMN_STYLE,
            top: tooltipY,
            transform: 'translateY(-50%)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION['scene-in'], ease: EASE.settle }}
        >
          <NylaGuidance>{row.tooltip}</NylaGuidance>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function CheckBox() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
<g clip-path="url(#clip0_289_4733)">
<path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9.29 16.29L5.7 12.7C5.31 12.31 5.31 11.68 5.7 11.29C6.09 10.9 6.72 10.9 7.11 11.29L10 14.17L16.88 7.29C17.27 6.9 17.9 6.9 18.29 7.29C18.68 7.68 18.68 8.31 18.29 8.7L10.7 16.29C10.32 16.68 9.68 16.68 9.29 16.29Z" fill="#0044CC"/>
</g>
<defs>
<clipPath id="clip0_289_4733">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>
</svg>
  )
}

function CouncilSnapshot() {
  return (
    <div className="flex flex-col border border-[#DCD9D5] p-6 pl-8 pt-0">
    <div className="flex flex-row font-semibold border-b border-[#DcD9d5] gap-8 -ml-8 -mr-6 pl-8 pr-6 cursor-pointer items-center">
        <div className="py-6">Quality Council</div>
        <div className="py-6">Executive Council</div>
        <div className="py-6 -mb-px bg-white text-[#0044CC] flex flex-row gap-2 border-b-2 border-b-[#0044cc] pr-2"><CheckBox/>President's Council</div>
        <div className="py-6">Chairman's council</div>
      </div>
    <div className="flex items-start gap-6 mt-6">

      <div className="shrink-0">
        <div className="mb-1 flex items-baseline justify-between">
          <div>
            <p className="m-0 text-[12px] text-[var(--text-body)]">Council Credits</p>
            <p className="m-0 text-[22px] font-medium text-[var(--text-headline)]">46,800</p>
          </div>
          <span className="rounded-full border border-[var(--nyl-orange-400)] bg-[var(--nyl-orange-100)] px-2 py-0.5 text-[11px] text-[var(--nyl-orange-500)]">
            Stretch
          </span>
        </div>
        <Suspense fallback={<div style={{ width: 300, height: 214 }} />}>
                    <CouncilCreditsChart width={300} height={214} />
                  </Suspense>
        <p className="mt-2 text-[11px] text-[var(--text-body-muted)]">
          40% complete of <strong>90,000 target</strong>
        </p>
      </div>

      <div className="w-px shrink-0 self-stretch bg-[var(--border-subtle)]" />

      <div className="flex flex-1 flex-col">
        <CouncilStatCard
          label="Protection FYC"
          value="$24.6K"
          status="complete"
          progress={1}
          caption="100% complete of $21K minimum"
          captionBold="$21K minimum"
        />
        <CouncilStatCard
          label="Protection premium"
          value="$56,100"
          status="stretch"
          progress={0.65}
          caption="65% complete of 84K minimum"
          captionBold="84K minimum"
          dimmed
        />
        <CouncilStatCard
          label="Case rate bonus"
          value="46"
          valueSuffix="/50"
          status="on-track"
          progress={0.92}
          caption="Level 1 achieved; reaching 50 adds another 2,500 council credits"
          captionBold="50"
          noBorder
        />
        <p className="mt-2 text-right text-[11px] text-[var(--text-body-muted)]">Your standing as of 5/31/25</p>
      </div>
    </div>
    </div>
  )
}

function FycGuidance({ fycTarget }: { fycTarget: string }) {
  const raw = fycTarget.replace(/[^0-9]/g, '')
  const value = parseInt(raw, 10) || 0
  const baseline = 39000

  let text: string

  if (value > 45000) {
    text = `I'd recommend $175K as a baseline goal, based on your past growth and other agents with a similar profile.`
  } else if (value >= baseline) {
    text = `Going from $39k to $${(value / 1000).toFixed(0)}k is a great baseline goal. This matches what other agents at your size typically target and gives us a realistic foundation to plan around.`
  } else if (value > 0) {
    text = `Setting a goal below last year. A target of $${(value / 1000).toFixed(0)}k is below your $39k from 2025. That can make sense if you're restructuring your book or taking on a new territory - I'll factor this in as we build your plan.`
  } else {
    text = "Enter a target to see Nyla's insight."
  }

  return (
    <div style={SIDE_COLUMN_STYLE}>
      <NylaGuidance text={text} />
    </div>
  )
}
