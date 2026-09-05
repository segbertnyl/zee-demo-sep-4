import { useEffect, useRef, useState, type ReactElement } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useAppStore } from '@/state/useAppStore'
import { EASE, DURATION, prefersReducedMotion } from '@/motion'
import { NYLLogo } from '@/ui/NYLLogo'
import { BriefingHeadline } from '@/ui/BriefingHeadline'
import { BriefingTaskCard } from '@/ui/BriefingTaskCard'
import type { TaskCardModel } from '@/data/briefingV6Content'
import {
  NavBriefingIcon,
  PersonCheckIcon,
  TagIcon,
  OrgChartIcon,
  BriefcaseIcon,
  ListAddIcon,
  BellIcon,
  CalendarIcon,
  type IconProps,
} from '@/ui/icons'
import sarahIcon from '../components/sarah-icon.png'
import { Button } from '@/ui/Button'
import clientQuiz from '../components/client quiz.png'
import { Nyla } from '@/ui/Nyla'
import guidanceBox from '../components/guidance.png'
import adB from '../components/assets-debts-brief.png'
import sarah from '../components/Frame 2134540829.png'
import { SectionHeader } from '@/ui/SectionHeader'
import { TextInput } from '@/ui/TextInput'
import { ButtonContainer } from '@/ui/ButtonContainer'
import guideRetire from '../components/guide-retire.png'
import guideRetire2 from '../components/guide-retire-2.png'
import { Textarea } from '@/ui/Textarea'
import { WhatIHeardClient } from '../scenes/WhatIHeardClient'
import potentialRisks from '../components/potential-risks.png'
import nylaRisks from '../components/nyla-risks.png'
import financial2 from '../components/financial-2.png'
import nylaFin2 from '../components/nyla-fin-risk-2.png'
import collabBoard from '../components/collab-board.png'
import financial3 from '../components/fin-plan-3.png'
import nylaApply from '../components/nyla-apply.png'
import pref2 from '../components/preference-2.png'
import pref2nyla from '../components/preference-2-nyla.png'

/* ============================================================================
 * Client Briefing scene — the client's own version of the briefing screen.
 * Same chrome shape as BriefingV6Scene (rail + header), duplicated here on
 * purpose so this flow stays 100% separate — no shared nav state, no shared
 * body content. Skeleton only: body content per rail section is a simple
 * placeholder, to be filled in next pass.
 * ========================================================================== */

const GRID = 'ml-[34px] mr-10'

type RailItem = { Icon: (p: IconProps) => ReactElement; label: string; size: number; active?: boolean; dot?: boolean }

const NAV_ITEMS: RailItem[] = [
  { Icon: NavBriefingIcon, label: 'Dashboard', size: 22 },
  { Icon: PersonCheckIcon, label: 'Preference Center', size: 40 },
  { Icon: TagIcon, label: 'Legacy Vault', size: 40 },
  { Icon: OrgChartIcon, label: 'Collab Board', size: 22 },
  { Icon: BriefcaseIcon, label: 'Financial Plan', size: 40 },
  { Icon: ListAddIcon, label: 'Resources', size: 24 },
]
const BOTTOM_ITEMS: RailItem[] = [
  { Icon: BellIcon, label: 'Notifications', size: 40, dot: true },
  { Icon: CalendarIcon, label: 'Calendar', size: 40, dot: true },
]

const ERIC_PREVIEW = {
  nickname: '"Sarah Chen"',
  clientSince: '10+ years experience',
  lastTouch: '1 day ago',
  grade: 'A',
  blurb: 'Sarah Chen is your NYL agent',
  tags: ['Registered Financial Advisor'],
  files: ['Bank Accounts', 'Website Articles', 'Chat Themes'],
  email: 'sarah_chen@ft.newyorklife.com',
  phone: '(917) 625-4843',
}

const SANDRA_TASK: TaskCardModel = {
  id: 'sandra-lapse',
  kind: 'task',
  badge: { label: 'NEXT STEPS', tone: 'prep' },
  headlinePrefix: 'Complete your discover questions so that',
  clientName: 'Sarah Chen',
  clientPreview: ERIC_PREVIEW,
  headlineSuffix: 'can analyze your needs and risks.',
  doneSummary: 'Call Sandra Kim to reactivate WL policy',
  description:
    'By having a comprehensive understanding of your accounts we can build a plan that helps you accomplish your goals',
  tags: [],
  footerLabel: 'Missing information',
  primaryCta: 'Get started',
  email: 'sarah_chen@ft.newyorklife.com',
  doneHeadline: 'Sandra’s handled. Next up, review Laura’s coverage gaps before you write.',
  defaultDraft: 'call',
  drafts: {
    call: {
      context:
        'Sandy is direct — lead with the policy, skip the warmup, and address the WL lapse (16d left in grace period).',
      body: 'Hi Sandy, it’s Sarah. Your WL policy has a payment past due and I want to make sure we get this resolved before it affects your coverage. Can we connect today?',
      meta: 'Draft generated · Last updated 9:56 AM',
    },
    text: {
      context: 'Short SMS — clear about the deadline, easy to reply to.',
      body: 'Hi Sandy, it’s Sarah from New York Life. Your WL policy payment is past due — 16 days left in the grace period. Can we hop on a quick call today to sort it before it affects your coverage?',
      meta: 'Draft generated · Last updated 9:56 AM',
    },
    email: {
      context: 'A short, warm email — policy first, with the payment link ready.',
      body: 'Subject: A quick fix on your WL policy\n\nHi Sandy,\n\nYour whole life policy has a payment past due, and I’d like to help you clear it before it affects your coverage — there are 16 days left in the grace period. It’s a quick fix; I can send a secure payment link or walk you through it on a short call.\n\nWhat works best for you this week?\n\nBest,\nSarah Ferreira\nNew York Life',
      meta: 'Draft generated · Last updated 9:56 AM',
    },
  },
}

const TWO_TASK: TaskCardModel = {
  id: 'sandra-lapse',
  kind: 'task',
  badge: { label: 'REVIEW YOUR ASSESSMENT', tone: 'prep' },
  headlinePrefix: 'Once you review your assessment, you call',
  clientName: 'Sarah Chen',
  clientPreview: ERIC_PREVIEW,
  headlineSuffix: 'to discuss or approve it to have Sarah start building your plan.',
  doneSummary: 'Call Sandra Kim to reactivate WL policy',
  description:
    'Our Risk & Needs assessment ensures that you and Sarah are aligned on where there are gaps in your plan based upon your goals. It’s important we get this right so that you feel good about your plan.',
  tags: [],
  footerLabel: 'Why is this important',
  primaryCta: 'Get started',
  email: 'sarah_chen@ft.newyorklife.com',
  doneHeadline: 'Sandra’s handled. Next up, review Laura’s coverage gaps before you write.',
  defaultDraft: 'call',
  drafts: {
    call: {
      context:
        'Sandy is direct — lead with the policy, skip the warmup, and address the WL lapse (16d left in grace period).',
      body: 'Hi Sandy, it’s Sarah. Your WL policy has a payment past due and I want to make sure we get this resolved before it affects your coverage. Can we connect today?',
      meta: 'Draft generated · Last updated 9:56 AM',
    },
    text: {
      context: 'Short SMS — clear about the deadline, easy to reply to.',
      body: 'Hi Sandy, it’s Sarah from New York Life. Your WL policy payment is past due — 16 days left in the grace period. Can we hop on a quick call today to sort it before it affects your coverage?',
      meta: 'Draft generated · Last updated 9:56 AM',
    },
    email: {
      context: 'A short, warm email — policy first, with the payment link ready.',
      body: 'Subject: A quick fix on your WL policy\n\nHi Sandy,\n\nYour whole life policy has a payment past due, and I’d like to help you clear it before it affects your coverage — there are 16 days left in the grace period. It’s a quick fix; I can send a secure payment link or walk you through it on a short call.\n\nWhat works best for you this week?\n\nBest,\nSarah Ferreira\nNew York Life',
      meta: 'Draft generated · Last updated 9:56 AM',
    },
  },
}

const THREE_TASK: TaskCardModel = {
  id: 'sandra-lapse',
  kind: 'task',
  badge: { label: 'REVIEW YOUR ASSESSMENT', tone: 'prep' },
  headlinePrefix: '',
  clientName: 'Sarah Chen',
  clientPreview: ERIC_PREVIEW,
  headlineSuffix: 'has shared a preview of your plan.  Start your review.',
  doneSummary: 'Call Sandra Kim to reactivate WL policy',
  description:
    'Take a look at a preview of your plan to ensure you’re aligned with the approach or draft questions prior to the meeting. Any questions before your meeting, feel free to send Sarah an email.',
  tags: [],
  footerLabel: 'Why is this important',
  primaryCta: 'Get started',
  email: 'sarah_chen@ft.newyorklife.com',
  doneHeadline: 'Sandra’s handled. Next up, review Laura’s coverage gaps before you write.',
  defaultDraft: 'call',
  drafts: {
    call: {
      context:
        'Sandy is direct — lead with the policy, skip the warmup, and address the WL lapse (16d left in grace period).',
      body: 'Hi Sandy, it’s Sarah. Your WL policy has a payment past due and I want to make sure we get this resolved before it affects your coverage. Can we connect today?',
      meta: 'Draft generated · Last updated 9:56 AM',
    },
    text: {
      context: 'Short SMS — clear about the deadline, easy to reply to.',
      body: 'Hi Sandy, it’s Sarah from New York Life. Your WL policy payment is past due — 16 days left in the grace period. Can we hop on a quick call today to sort it before it affects your coverage?',
      meta: 'Draft generated · Last updated 9:56 AM',
    },
    email: {
      context: 'A short, warm email — policy first, with the payment link ready.',
      body: 'Subject: A quick fix on your WL policy\n\nHi Sandy,\n\nYour whole life policy has a payment past due, and I’d like to help you clear it before it affects your coverage — there are 16 days left in the grace period. It’s a quick fix; I can send a secure payment link or walk you through it on a short call.\n\nWhat works best for you this week?\n\nBest,\nSarah Ferreira\nNew York Life',
      meta: 'Draft generated · Last updated 9:56 AM',
    },
  },
}

const FOUR_TASK: TaskCardModel = {
  id: 'sandra-lapse',
  kind: 'task',
  badge: { label: 'MEETING WITH SARAH', tone: 'prep' },
  headlinePrefix: '',
  clientName: 'Sarah Chen',
  clientPreview: ERIC_PREVIEW,
  headlineSuffix: 'is ready to discuss your full plan in details',
  doneSummary: 'Call Sandra Kim to reactivate WL policy',
  description: 'Join the meeting and Sarah will open up your collaboration board so that you can work together.',
  tags: [],
  footerLabel: 'Why is this important',
  primaryCta: 'Join now',
  email: 'sarah_chen@ft.newyorklife.com',
  doneHeadline: 'Sandra’s handled. Next up, review Laura’s coverage gaps before you write.',
  defaultDraft: 'call',
  drafts: {
    call: {
      context:
        'Sandy is direct — lead with the policy, skip the warmup, and address the WL lapse (16d left in grace period).',
      body: 'Hi Sandy, it’s Sarah. Your WL policy has a payment past due and I want to make sure we get this resolved before it affects your coverage. Can we connect today?',
      meta: 'Draft generated · Last updated 9:56 AM',
    },
    text: {
      context: 'Short SMS — clear about the deadline, easy to reply to.',
      body: 'Hi Sandy, it’s Sarah from New York Life. Your WL policy payment is past due — 16 days left in the grace period. Can we hop on a quick call today to sort it before it affects your coverage?',
      meta: 'Draft generated · Last updated 9:56 AM',
    },
    email: {
      context: 'A short, warm email — policy first, with the payment link ready.',
      body: 'Subject: A quick fix on your WL policy\n\nHi Sandy,\n\nYour whole life policy has a payment past due, and I’d like to help you clear it before it affects your coverage — there are 16 days left in the grace period. It’s a quick fix; I can send a secure payment link or walk you through it on a short call.\n\nWhat works best for you this week?\n\nBest,\nSarah Ferreira\nNew York Life',
      meta: 'Draft generated · Last updated 9:56 AM',
    },
  },
}

function RailRow({ item, expanded, onClick }: { item: RailItem; expanded: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={item.label}
      className="group flex w-full items-center gap-3 rounded-[11px]"
    >
      <span
        className={[
          'relative flex size-10 shrink-0 items-center justify-center rounded-[11px] transition-colors',
          item.active
            ? 'bg-[var(--nyl-blue-050)] text-[var(--nyl-blue-500)]'
            : 'text-[var(--nyl-gray-700)] group-hover:bg-[var(--nyl-blue-025)] group-hover:text-[var(--nyl-blue-500)]',
        ].join(' ')}
      >
        <item.Icon size={item.size} />
        {item.dot && <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[var(--nyl-blue-500)]" />}
      </span>
      <motion.span
        animate={{ opacity: expanded ? 1 : 0 }}
        transition={{ duration: DURATION.micro }}
        className={[
          'whitespace-nowrap text-[14px] font-medium',
          item.active ? 'text-[var(--text-headline)]' : 'text-[var(--text-body)]',
        ].join(' ')}
      >
        {item.label}
      </motion.span>
    </button>
  )
}

function Rail({ active, onSelect, onExit }: { active: string; onSelect: (s: string) => void; onExit: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const enterTimer = useRef<number | undefined>(undefined)
  const onEnter = () => {
    window.clearTimeout(enterTimer.current)
    enterTimer.current = window.setTimeout(() => setExpanded(true), 280)
  }
  const onLeave = () => {
    window.clearTimeout(enterTimer.current)
    setExpanded(false)
  }
  return (
    <div className="relative z-30 w-[96px] shrink-0">
      <motion.nav
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        animate={{ width: expanded ? 248 : 96 }}
        transition={{ duration: 0.28, ease: EASE.settle }}
        className="absolute inset-y-0 left-0 flex flex-col items-start overflow-hidden rounded-br-[8px] bg-white py-10 pl-7 pr-4 shadow-[0_0_40px_rgba(0,0,0,0.08)]"
      >
        <button type="button" onClick={onExit} aria-label="Back to menu" className="shrink-0 rounded-[8px]">
          <NYLLogo pixelSize={40} className="rounded-[8px]" />
        </button>

        <div className="mt-12 flex flex-1 flex-col gap-6">
          {NAV_ITEMS.map((it) => (
            <RailRow
              key={it.label}
              item={{ ...it, active: it.label === active }}
              expanded={expanded}
              onClick={() => onSelect(it.label)}
            />
          ))}
        </div>

        <div className="flex flex-col gap-6">
          {BOTTOM_ITEMS.map((it) => (
            <RailRow
              key={it.label}
              item={{ ...it, active: it.label === active }}
              expanded={expanded}
              onClick={() => onSelect(it.label)}
            />
          ))}
        </div>

        <div className="mt-6 flex w-full items-center gap-3">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-[13px] font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #7fd8c4 0%, #5ec6e0 100%)' }}
          >
            EE
          </span>
          <motion.span
            animate={{ opacity: expanded ? 1 : 0 }}
            transition={{ duration: DURATION.micro }}
            className="whitespace-nowrap text-[14px] font-medium text-[var(--text-headline)]"
          >
            Eric Ellis
          </motion.span>
        </div>
      </motion.nav>
    </div>
  )
}
const getTitle = (activeNav: string) => {
  switch (activeNav) {
    case 'Dashboard':
      return 'Welcome Eric'

    case 'Preference Center':
      return 'Your Profile'
    case 'Legacy Vault':
      // Code to run if expression == value2
      break
    case 'Collab Board':
      return 'Collab Board'
    case 'Financial Plan':
      return 'My Plan'
      break
    case 'Resources':
      return 'Resources'
    // Add more cases as needed
    default:
      return 'Welcome Eric'
  }
}

/* Same header shape as BriefingV6Scene's TopNav, but simpler: title on the
 * left ("Welcome Eric"), nothing on the right. */
function TopNav({ activeNav }: { activeNav: string }) {
  return (
    <div className="flex h-[120px] items-center">
      <div className={[GRID, 'grid w-full grid-cols-12 items-center gap-6'].join(' ')}>
        <p className="col-span-5 font-serif text-[18px] text-[var(--text-headline)]" style={{ fontWeight: 400 }}>
          {getTitle(activeNav)}
        </p>
        <div className="col-span-7" />
      </div>
    </div>
  )
}

/* "While you were away" / "Helpful insights" — same shape as BriefingV6's
 * While-you-were-away/Your-day sections (heading [+ optional saved-time
 * meta] · items · optional footer CTA). */
function AwaySection({
  heading,
  savedLabel,
  items,
  itemSpacing = 'space-y-2',
  showDots,
  footerCta,
}: {
  heading: string
  savedLabel?: string
  items: string[]
  itemSpacing?: string
  showDots?: boolean
  footerCta?: string
}) {
  return (
    <section className="mt-9 first:mt-0">
      <h2 className="flex items-baseline gap-2">
        <span className="eyebrow" style={{ color: '#000533' }}>
          {heading}
        </span>
        {savedLabel && (
          <span
            style={{
              color: 'var(--Text-text-primary, #17181C)',
              fontFamily: 'var(--Font-family-font-family-roboto, Roboto)',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '20px',
              letterSpacing: '0.3px',
            }}
          >
            · {savedLabel}
          </span>
        )}
      </h2>
      <ul className={['mt-3', itemSpacing].join(' ')}>
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2.5">
            {showDots && <span className="size-2 shrink-0 rounded-full bg-[var(--nyl-green-600)]" />}
            <span className="text-left text-[13.5px] font-medium text-[var(--text-body-muted)] underline decoration-dotted decoration-[var(--text-body-faint)] underline-offset-[3px] transition-colors hover:text-[var(--text-body)] hover:decoration-[var(--text-body)]">
              {it}
            </span>
          </li>
        ))}
      </ul>
      {footerCta && (
        <button type="button" className="mt-4 text-[13px] font-medium underline" style={{ color: '#0468FF' }}>
          {footerCta}
        </button>
      )}
    </section>
  )
}

export function ClientBriefingScene() {
  const open = useAppStore((s) => s.clientBriefingOpen)
  const closeClientBriefing = useAppStore((s) => s.closeClientBriefing)
  const [activeNav, setActiveNav] = useState('Dashboard')

  /* Top heading fades in 400ms after the briefing opens (mirrors BriefingV6). */
  const [chromeIn, setChromeIn] = useState(false)
  const [reduced, setReduced] = useState(false)
  useEffect(() => setReduced(prefersReducedMotion()), [])

  useEffect(() => {
    if (!open) {
      setChromeIn(false)
      return
    }
    if (reduced) {
      setChromeIn(true)
      return
    }
    setChromeIn(false)
    const t = window.setTimeout(() => setChromeIn(true), 400)
    return () => window.clearTimeout(t)
  }, [open, reduced])

  /* Dashboard staged entrance — same loadPhase pattern as BriefingV6Scene:
   * 0 = nothing yet, 1 = "headline" region (@1500ms), 2 = "cards" region
   * (@3000ms), 3 = reserved for whatever loads last (@4050ms — not wired to
   * a block yet; the bottom band is a static placeholder for now, see below). */
  const [loadPhase, setLoadPhase] = useState(0)
  useEffect(() => {
    if (!open) return
    if (reduced) {
      setLoadPhase(3)
      return
    }
    setLoadPhase(0)
    const t1 = window.setTimeout(() => setLoadPhase(1), 1500)
    const t2 = window.setTimeout(() => setLoadPhase(2), 3000)
    const t3 = window.setTimeout(() => setLoadPhase(3), 4050)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
    }
  }, [open, reduced])

  /* Dashboard's own sub-flow: 0 on initial load; "Learn More About Sarah"
   * sets it to 1 (and navigates the rail to Resources). Only resets to 0 on
   * the scene's initial load — clicking back to the Dashboard icon afterward
   * stays in whatever state it was left in. */
  const [dashboardView, setDashboardView] = useState(0)
  useEffect(() => {
    if (open) setDashboardView(0)
  }, [open])

  /* Preference Center — question flow like ClientFlow: 1, 2 = question
   * screens, 3 = summary. Skeleton only — content per step TBD. */
  const [preferenceStep, setPreferenceStep] = useState(1)
  useEffect(() => {
    if (open) setPreferenceStep(1)
  }, [open])
  useEffect(() => {
    if (open) setActiveNav('Dashboard')
  }, [open])
  const [financialPlanView, setFinancialPlanView] = useState(1)
  useEffect(() => {
    if (open) setFinancialPlanView(1)
  }, [open])
  const [preferenceView, setPreferenceView] = useState(1)
  useEffect(() => {
    if (open) setPreferenceView(1)
  }, [open])
  const [salary, setSalary] = useState('')
  const [retire2, setRetire2] = useState('')
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="client-briefing"
          role="dialog"
          aria-label="Client Briefing"
          className="overlay-bleed z-[170] flex bg-[var(--bg-canvas)]"
          initial={false}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.short }}
        >
          <Rail active={activeNav} onSelect={setActiveNav} onExit={closeClientBriefing} />

          <div className="relative z-10 flex min-w-0 flex-1 flex-col px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: chromeIn ? 1 : 0 }}
              transition={{ duration: DURATION.standard * 2, ease: EASE.settle }}
            >
              <TopNav activeNav={activeNav} />
            </motion.div>
            {activeNav === 'Dashboard' && dashboardView === 3 && (
              <div className={[GRID, 'grid min-h-0 flex-1 grid-cols-12 gap-6 pt-6'].join(' ')}>
                <div className="col-span-5 flex h-full flex-col pt-6">
                  <BriefingHeadline
                    text={'Sarah just posted your risk and needs assessment to your account'}
                    reducedMotion={reduced}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: DURATION.standard, delay: 0.2 }}
                    className="mt-5 flex items-center gap-3"
                  >
                    <p className="text-[13px] text-[var(--text-body-muted)]">
                      As of 12:16 PM · 4/25 questions completed
                    </p>
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[var(--nyl-gray-100)]">
                      <motion.div
                        className="h-full rounded-full bg-[var(--action-primary)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round((4 / 25) * 100)}%` }}
                        transition={{ duration: DURATION.standard, ease: EASE.settle }}
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: DURATION.deliberate, ease: EASE.settle }}
                    className="mt-auto pt-10 pb-16"
                  >
                    <AwaySection
                      heading="While you were away"
                      savedLabel="1h28m saved"
                      items={[
                        'Refreshed your accounts',
                        'Your home value increased by 3%',
                        'Your stocks decreased by 2%',
                      ]}
                    />
                    <AwaySection
                      heading="Helpful insights for you"
                      itemSpacing="space-y-2.5"
                      showDots
                      items={[
                        'Sarah posted a video on the new tax law impacting teachers',
                        'Understand how you can benefit from macro-balancing',
                        'Get to know how the latest rate change impacts you',
                      ]}
                      footerCta="Add to my weekly insights for later"
                    />
                  </motion.div>
                </div>
                <motion.div
                  className="col-span-7 flex flex-col gap-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: DURATION.standard, ease: EASE.settle }}
                >
                  <BriefingTaskCard
                    model={THREE_TASK}
                    state="focus"
                    reducedMotion={reduced}
                    label="Remind me"
                    onPrimary={() => {
                      setActiveNav('Financial Plan')
                      setFinancialPlanView(2)
                    }}
                  />
                  <img src={adB} />
                  <Nyla size={120} className="absolute bottom-0 right-10" />
                </motion.div>
              </div>
            )}
            {activeNav === 'Dashboard' && dashboardView === 4 && (
              <div className={[GRID, 'grid min-h-0 flex-1 grid-cols-12 gap-6 pt-6'].join(' ')}>
                <div className="col-span-5 flex h-full flex-col pt-6">
                  <BriefingHeadline text={'Today you take another step toward your goals'} reducedMotion={reduced} />
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: DURATION.standard, delay: 0.2 }}
                    className="mt-5 flex items-center gap-3"
                  >
                    <p className="text-[13px] text-[var(--text-body-muted)]">
                      As of 12:16 PM · 4/25 questions completed
                    </p>
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[var(--nyl-gray-100)]">
                      <motion.div
                        className="h-full rounded-full bg-[var(--action-primary)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round((4 / 25) * 100)}%` }}
                        transition={{ duration: DURATION.standard, ease: EASE.settle }}
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: DURATION.deliberate, ease: EASE.settle }}
                    className="mt-auto pt-10 pb-16"
                  >
                    <AwaySection
                      heading="While you were away"
                      savedLabel="1h28m saved"
                      items={[
                        'Refreshed your accounts',
                        'Your home value increased by 3%',
                        'Your stocks decreased by 2%',
                      ]}
                    />
                    <AwaySection
                      heading="Helpful insights for you"
                      itemSpacing="space-y-2.5"
                      showDots
                      items={[
                        'Sarah posted a video on the new tax law impacting teachers',
                        'Understand how you can benefit from macro-balancing',
                        'Get to know how the latest rate change impacts you',
                      ]}
                      footerCta="Add to my weekly insights for later"
                    />
                  </motion.div>
                </div>
                <motion.div
                  className="col-span-7 flex flex-col gap-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: DURATION.standard, ease: EASE.settle }}
                >
                  <BriefingTaskCard
                    model={FOUR_TASK}
                    state="focus"
                    reducedMotion={reduced}
                    label="Remind me"
                    onPrimary={() => {
                      setActiveNav('Collab Board')
                      setFinancialPlanView(3)
                    }}
                  />
                  <img src={adB} />
                  <Nyla size={120} className="absolute bottom-0 right-10" />
                </motion.div>
              </div>
            )}
            {activeNav === 'Dashboard' && (dashboardView === 1 || dashboardView === 2) && (
              /* View 1 — Sarah follow-up. Same shape as the original BriefingV6
                 layout: full-height 5/7 columns (no top/bottom split). Left
                 keeps the headline with While-You-Were-Away/Helpful-Insights
                 underneath; right keeps the top/bottom "nuance" but contained
                 in one column — one follow-up task card stacked above the
                 assets/debts image. */
              <div key={dashboardView} className={[GRID, 'grid min-h-0 flex-1 grid-cols-12 gap-6 pt-6'].join(' ')}>
                <div className="col-span-5 flex h-full flex-col pt-6">
                  <BriefingHeadline
                    text={
                      dashboardView === 1
                        ? 'Sarah’s excited to continue working with you. Let’s get your discovery done!'
                        : 'Sarah just posted your risk and needs assessment to your account'
                    }
                    reducedMotion={reduced}
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: DURATION.standard, delay: 0.2 }}
                    className="mt-5 flex items-center gap-3"
                  >
                    <p className="text-[13px] text-[var(--text-body-muted)]">
                      As of 12:16 PM · 4/25 questions completed
                    </p>
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[var(--nyl-gray-100)]">
                      <motion.div
                        className="h-full rounded-full bg-[var(--action-primary)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round((4 / 25) * 100)}%` }}
                        transition={{ duration: DURATION.standard, ease: EASE.settle }}
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: DURATION.deliberate, ease: EASE.settle }}
                    className="mt-auto pt-10 pb-16"
                  >
                    <AwaySection
                      heading="While you were away"
                      savedLabel="1h28m saved"
                      items={[
                        'Refreshed your accounts',
                        'Your home value increased by 3%',
                        'Your stocks decreased by 2%',
                      ]}
                    />
                    <AwaySection
                      heading="Helpful insights for you"
                      itemSpacing="space-y-2.5"
                      showDots
                      items={[
                        'Sarah posted a video on the new tax law impacting teachers',
                        'Understand how you can benefit from macro-balancing',
                        'Get to know how the latest rate change impacts you',
                      ]}
                      footerCta="Add to my weekly insights for later"
                    />
                  </motion.div>
                </div>
                <motion.div
                  className="col-span-7 flex flex-col gap-8"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: DURATION.standard, ease: EASE.settle }}
                >
                  <BriefingTaskCard
                    model={dashboardView === 1 ? SANDRA_TASK : TWO_TASK}
                    state="focus"
                    reducedMotion={reduced}
                    label="Remind me"
                    onPrimary={() => {
                      setActiveNav('Financial Plan')
                    }}
                  />
                  <img src={adB} />
                  <Nyla size={120} className="absolute bottom-0 right-10" />
                </motion.div>
              </div>
            )}
            {activeNav === 'Dashboard' && dashboardView === 0 && (
              <div className="flex min-h-0 flex-1 flex-col ">
                {/* view 0 (default) — top region: 7/12 of the body height.
                    5/7 col split inside, same shape as BriefingV6's left/right
                    columns, minus the scrollable right stack (this one's static). */}
                <div className={[GRID, 'grid grid-cols-12 gap-6 pt-6'].join(' ')} style={{ flex: 7, minHeight: 0 }}>
                  <div className="col-span-5 flex flex-col">
                    {loadPhase >= 1 && (
                      <>
                        <BriefingHeadline
                          text="Great job connecting your accounts. Here is where you stand."
                          reducedMotion={reduced}
                        />
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: DURATION.standard, delay: 0.2 }}
                          className="mt-5 flex items-center gap-3 mb-20"
                        >
                          <p className="text-[13px] text-[var(--text-body-muted)]">As of 12:16 PM · 1/6 completed</p>
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[var(--nyl-gray-100)]">
                            <motion.div
                              className="h-full rounded-full bg-[var(--action-primary)]"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.round((1 / 6) * 100)}%` }}
                              transition={{ duration: DURATION.standard, ease: EASE.settle }}
                            />
                          </div>
                        </motion.div>
                        <div className="flex flex-row gap-[20px] ml-2">
                          <img src={sarahIcon} />
                          <div className="flex flex-col justify-between h-full">
                            <div className="text-[#474952] text-base pt-[16px]">Sarah can help you meet your goals</div>
                            <Button
                              onClick={() => {
                                setActiveNav('Resources')
                                setDashboardView(1)
                              }}
                            >
                              Learn More About Sarah
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <motion.div
                    className="col-span-7"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: loadPhase >= 2 ? 1 : 0 }}
                    transition={{ duration: DURATION.standard, ease: EASE.settle }}
                  >
                    <img src={adB} />
                  </motion.div>
                </div>

                {/* bottom region — 5/12 of the body height. 9/ou 3 col split, both
                    fading in together at loadPhase 3 (@4050ms). */}
                <div className={[GRID, 'grid grid-cols-12  py-6'].join(' ')} style={{ minHeight: 0 }}>
                  <motion.div
                    className="col-span-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: loadPhase >= 3 ? 1 : 0 }}
                    transition={{ duration: DURATION.standard, ease: EASE.settle }}
                  >
                    <img src={clientQuiz} />
                  </motion.div>
                  <motion.div
                    className="col-span-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: loadPhase >= 3 ? 1 : 0 }}
                    transition={{ duration: DURATION.standard, ease: EASE.settle }}
                  >
                    <div className="w-full flex justify-end">
                      <img src={guidanceBox} />
                      <Nyla size={120} className="absolute bottom-0 right-15" />
                    </div>
                  </motion.div>
                </div>
              </div>
            )}
            {activeNav === 'Preference Center' && preferenceView === 1 && (
              <div className={'pt-6 h-full flex flex-col items-center justify-center'}>
                {preferenceStep === 1 && (
                  <>
                    <motion.div
                      key="client-salary"
                      className="relative z-10 mx-auto w-full max-w-[620px] px-6"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: DURATION.deliberate,
                        ease: EASE.settle as [number, number, number, number],
                      }}
                    >
                      <SectionHeader
                        variant="secondary"
                        heading={'How much do you want your yearly salary to be in retirement?'}
                        body={'Last year you earned $200,000'}
                      />
                      <TextInput
                        variant="numeric"
                        value={salary}
                        onChange={setSalary}
                        placeholder={'Enter your salary...'}
                        className="mt-8"
                      />
                      {
                        <ButtonContainer
                          secondaryVariant="secondary"
                          showClientSecondary={true}
                          showSecondary={false}
                          onPrimary={() => setPreferenceStep(2)}
                          onSecondary={() => setPreferenceStep(2)}
                          className="mt-6"
                        />
                      }
                    </motion.div>
                    <img src={guideRetire} className="absolute right-0" />
                    <Nyla size={120} variant="on-light" align="left" className="absolute bottom-0 right-0" />
                  </>
                )}
                {preferenceStep === 2 && (
                  <>
                    <motion.div
                      key="client-salary"
                      className="relative z-10 mx-auto w-full max-w-[770px] px-6"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: DURATION.deliberate,
                        ease: EASE.settle as [number, number, number, number],
                      }}
                    >
                      <SectionHeader
                        variant="secondary"
                        heading={'When you think about retirement, what does it look like for you? '}
                        body={
                          'Feel free to tell me your goals and we can work together to crystalize your vision for Sarah.'
                        }
                      />
                      <Textarea
                        value={retire2}
                        onChange={(value) => {
                          setRetire2(value)
                        }}
                        placeholder="Describe in your own words..."
                        minHeight={209}
                        onMicClick={() => {}}
                        className="mt-8 max-w-[770px]"
                      />
                      {
                        <ButtonContainer
                          secondaryVariant="secondary"
                          showClientSecondary={true}
                          showSecondary={false}
                          onPrimary={() => setPreferenceStep(3)}
                          onSecondary={() => setPreferenceStep(3)}
                          className="mt-6"
                        />
                      }
                    </motion.div>
                    <img src={guideRetire2} className="absolute right-0" />
                    <Nyla size={120} variant="on-light" align="left" className="absolute bottom-0 right-0" />
                  </>
                )}
                {preferenceStep === 3 && (
                  <>
                    <motion.div
                      key="client-salary"
                      className="relative z-10 mx-auto w-full max-w-[770px] px-6 -mt-6 overflow-hidden"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: DURATION.deliberate,
                        ease: EASE.settle as [number, number, number, number],
                      }}
                    >
                      <WhatIHeardClient />
                    </motion.div>
                    <Nyla size={120} variant="on-light" align="left" className="absolute bottom-0 right-0" />
                    {
                      <ButtonContainer
                        secondaryVariant="secondary"
                        primaryLabel="Let Sarah turn this into a plan"
                        showSecondary={false}
                        onPrimary={() => {
                          setPreferenceStep(3)
                          setDashboardView(2)
                          setActiveNav('Dashboard')
                        }}
                        onSecondary={() => {
                          setPreferenceStep(3)
                          setDashboardView(2)
                          setActiveNav('Dashboard')
                        }}
                        className="absolute bottom-5 right-48 z-9999"
                      />
                    }
                  </>
                )}
              </div>
            )}
            {activeNav === 'Preference Center' && preferenceView === 2 && (
              <>
                <BriefingHeadline text="Your policies are in effect!" className={GRID} />

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: DURATION.standard, delay: 0.2 }}
                  className={[GRID, 'mt-5 flex items-center gap-3'].join(' ')}
                >
                  <p className="text-[13px] text-[var(--text-body-muted)] mb-8 ml-2">
                    As of 12:16 PM · 4/25 questions completed
                  </p>
                </motion.div>
                <motion.div
                  className={[GRID, 'flex flex-row items-start gap-4'].join(' ')}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: DURATION.deliberate,
                    ease: EASE.settle as [number, number, number, number],
                  }}
                >
                  <img src={pref2} />
                  <img src={pref2nyla} className="mt-10" />
                </motion.div>
                <motion.div
                  className={GRID}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: DURATION.deliberate, ease: EASE.settle as [number, number, number, number] }}
                >
                  <Nyla size={120} className="absolute bottom-0 right-10" />
                </motion.div>
              </>
            )}
            {activeNav === 'Preference Center' && preferenceView === 3 && <div>hi</div>}
            {activeNav === 'Legacy Vault' && <div>hi</div>}
            {activeNav === 'Resources' && (
              <motion.div
                className="flex flex-row justify-center"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: DURATION.deliberate,
                  ease: EASE.settle as [number, number, number, number],
                }}
              >
                <img src={sarah} />
                <Nyla size={120} className="absolute bottom-0 right-10" />
              </motion.div>
            )}
            {activeNav === 'Financial Plan' && financialPlanView === 1 && (
              <>
                <motion.div
                  className={[GRID, 'flex flex-row justify-center'].join(' ')}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: DURATION.deliberate,
                    ease: EASE.settle as [number, number, number, number],
                  }}
                >
                  <img src={potentialRisks} />
                </motion.div>
                <motion.div
                  className={GRID}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: DURATION.deliberate, ease: EASE.settle as [number, number, number, number] }}
                >
                  <img src={nylaRisks} className="absolute right-0 top-[50%]" />
                  <Nyla size={120} className="absolute bottom-0 right-10" />
                  <ButtonContainer
                    secondaryVariant="secondary"
                    primaryLabel="Accept"
                    secondaryLabel="Make Adjustments"
                    showClientSecondary={true}
                    showSecondary={false}
                    onPrimary={() => {
                      setDashboardView(3)
                      setActiveNav('Dashboard')
                    }}
                    onSecondary={() => {
                      setDashboardView(3)
                      setActiveNav('Dashboard')
                    }}
                    className="mt-6 absolute bottom-10 right-72"
                  />
                </motion.div>
              </>
            )}
            {activeNav === 'Financial Plan' && financialPlanView === 2 && (
              <>
                <motion.div
                  className={[GRID, 'flex flex-row justify-center -mt-6'].join(' ')}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: DURATION.deliberate,
                    ease: EASE.settle as [number, number, number, number],
                  }}
                >
                  <img src={financial2} />
                </motion.div>
                <motion.div
                  className={GRID}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: DURATION.deliberate, ease: EASE.settle as [number, number, number, number] }}
                >
                  <img src={nylaFin2} className="absolute right-0 top-[50%]" />
                  <Nyla size={120} className="absolute bottom-0 right-10" />
                  <ButtonContainer
                    secondaryVariant="secondary"
                    primaryLabel="Prepare for my meeting"
                    secondaryLabel="Download a MD file"
                    showClientSecondary={true}
                    showSecondary={false}
                    onPrimary={() => {
                      setDashboardView(4)
                      setActiveNav('Dashboard')
                    }}
                    onSecondary={() => {
                      setDashboardView(4)
                      setActiveNav('Dashboard')
                    }}
                    className="mt-6 absolute bottom-0 right-72"
                  />
                </motion.div>
              </>
            )}
            {activeNav === 'Financial Plan' && financialPlanView === 3 && (
              <>
                <motion.div
                  className={['ml-6 flex flex-row items-center justify-center w-full'].join(' ')}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: DURATION.deliberate,
                    ease: EASE.settle as [number, number, number, number],
                  }}
                >
                  <img src={financial3} />
                  <img src={nylaApply} className="" />
                </motion.div>
                <motion.div
                  className={GRID}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: DURATION.deliberate, ease: EASE.settle as [number, number, number, number] }}
                >
                  <Nyla size={120} className="absolute bottom-0 right-10" />
                  <ButtonContainer
                    primaryLabel="Start your application"
                    showSecondary={false}
                    onPrimary={() => {
                      setPreferenceView(2)
                      setActiveNav('Preference Center')
                    }}
                    className="absolute bottom-2 right-[20%]"
                  />
                </motion.div>
              </>
            )}
            {activeNav === 'Collab Board' && (
              <motion.div
                className="flex flex-row justify-center"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: DURATION.deliberate,
                  ease: EASE.settle as [number, number, number, number],
                }}
              >
                <img src={collabBoard} />

                <Nyla size={120} className="absolute bottom-0 right-10" />
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
