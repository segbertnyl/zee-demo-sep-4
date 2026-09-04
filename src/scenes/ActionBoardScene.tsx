import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useAppStore } from '@/state/useAppStore'
import { PlanDot } from '@/ui/PlanDot'
import { ProgressBar } from '@/ui/ProgressBar'
import { Nyla } from '@/ui/Nyla'
import { CollabLauncher } from './BriefingScene'
import { MyBookCanvas } from './MyBookCanvas'

/* Action Board — opportunity tiles workspace, pulled from Figma 1294:13073.
 *
 * Top tab strip: Priorities / Cross-sell / Retention / Reactivation / Referral / My book.
 * Hero: editorial headline + two tip lines.
 * Body: stacked opportunity cards with confidence/monitor badges, propensity/engagement/FYC
 *       progress bars, a checklist Plan, and a Prepare outreach CTA. */

type Tab = 'priorities' | 'crosssell' | 'retention' | 'reactivation' | 'referral' | 'mybook'

const TABS: { id: Tab; label: string }[] = [
  { id: 'mybook', label: 'My book' },
  { id: 'priorities', label: 'Priorities' },
  { id: 'crosssell', label: 'Cross-sell' },
  { id: 'retention', label: 'Retention' },
  { id: 'reactivation', label: 'Reactivation' },
  { id: 'referral', label: 'Referral' },
]

type PlanStep = {
  label: string
  sub?: string
  /* CTA label shown when this step is active, e.g. "Draft a message". */
  cta: string
  /* Freeform prompt to fire when the CTA is pressed. */
  promptId?: string
  /* If set, route through CollabSpace with this seed prompt instead of jumping
   * to FreeformScene. Used for client-specific drafts where the global Chief of
   * Staff context isn't a fit. */
  collabPrompt?: string
}

type Opportunity = {
  id: string
  badges: { label: string; tone: 'opportunity' | 'monitor' }[]
  confidence: number
  headline: string
  body: string
  metrics: { label: string; value: number; tone: 'good' | 'neutral' | 'warn' }[]
  fycEstimate: string
  plan: PlanStep[]
  tip?: string
  /* Where the client name link pushes to in Nyla freeform. */
  clientPromptId?: string
}

const CROSSSELL: Opportunity[] = [
  {
    id: 'janet',
    badges: [{ label: 'Opportunity', tone: 'opportunity' }],
    confidence: 92,
    headline: 'Janet Henderson has recently had a change of address to a high flood-risk coastal location.',
    body:
      "Similar life-event cases with this propensity score convert at a high rate when contacted within the first 30 days of a move. You're in that window now, but don't limit the conversation to flood. Instead, ask what else has changed. Showing up as a proactive agent is most valuable.",
    metrics: [
      { label: 'Propensity', value: 0.95, tone: 'good' },
      { label: 'Engagement', value: 0.45, tone: 'warn' },
      { label: 'FYC opp.', value: 0.62, tone: 'warn' },
    ],
    fycEstimate: 'Avg +$1,200',
    clientPromptId: 'henderson',
    plan: [
      {
        label: 'Reestablish contact',
        sub: 'Meaningful outreach',
        cta: 'Draft a message',
        collabPrompt:
          "Draft a warm reconnection message to Janet Henderson. She just moved to a coastal home in a high flood-risk zone. Acknowledge the move, ask how the household is settling, and propose a 15-min check-in to review coverage — don't lead with flood.",
      },
      { label: 'Close the flood coverage gap', sub: 'Avg +$1,200 FYC', cta: 'Prepare flood coverage quotes', promptId: 'draft-outreach' },
      { label: 'Full coverage review', sub: 'Broaden wallet share', cta: 'Open coverage analysis', promptId: 'henderson' },
    ],
    tip:
      'Tip — Top-performing agents use major life changes, like a move, as opportunities to proactively review protection needs before clients encounter unexpected gaps in coverage.',
  },
  {
    id: 'helena-1',
    badges: [
      { label: 'Opportunity', tone: 'opportunity' },
      { label: 'Monitor', tone: 'monitor' },
    ],
    confidence: 72,
    headline: 'Helena Garcia recently turned 58 and is showing a spike in retirement-related content engagement.',
    body:
      "Similar life-event cases with this propensity score convert at a high rate when contacted within the first 30 days of a move. Instead, ask what else has changed. Showing up as a proactive agent is most valuable.",
    metrics: [
      { label: 'Propensity', value: 0.71, tone: 'good' },
      { label: 'Engagement', value: 0.66, tone: 'good' },
      { label: 'FYC opp.', value: 0.55, tone: 'warn' },
    ],
    fycEstimate: 'Avg +$2,800',
    clientPromptId: 'clarke',
    plan: [
      { label: 'Open the retirement-readiness frame', sub: 'Pre-call prep', cta: 'Build the prep card', promptId: 'open-prep-card' },
      {
        label: 'Draft the warm outreach',
        sub: 'Time the milestone right',
        cta: 'Draft a message',
        collabPrompt:
          "Draft a warm outreach to Helena Garcia. She just turned 58 and is engaging with retirement-readiness content. Don't pitch — frame as a milestone check-in and offer a 20-min conversation about what she's been thinking about for retirement.",
      },
      { label: 'Run the conversation drill', sub: 'Synthetic Helena loaded', cta: 'Start the 4-min drill', promptId: 'start-drill' },
    ],
  },
]

const HERO: Record<Tab, { headline: string; tips: { stat: string; copy: string }[] }> = {
  priorities: {
    headline: 'Three priorities lead your day.',
    tips: [
      { stat: '65%', copy: 'Of your week\'s closes come from the first three priorities of each day.' },
      { stat: '2.5×', copy: 'Earlier action on the right priority over a triggered priority.' },
    ],
  },
  crosssell: {
    headline: 'Protect, expand, and prepare:\nThree opportunities stand out today.',
    tips: [
      { stat: '65%', copy: 'of financial planning decisions are triggered by a major life event' },
      { stat: '2.5×', copy: 'The chance she more likely to engage when outreach is sent to a relevant life event' },
    ],
  },
  retention: {
    headline: 'Two households are at lapse risk this week.',
    tips: [
      { stat: '84d', copy: 'Average no-touch window before a household begins to drift.' },
      { stat: '3×', copy: 'Higher save rate when the first outreach is from you, not the system.' },
    ],
  },
  reactivation: {
    headline: 'Five dormant households are warming back up.',
    tips: [
      { stat: '21d', copy: 'Conversion is highest within 21 days of a re-engagement signal.' },
      { stat: '6/14', copy: 'Of your no-touch-90 households opened the last sequence.' },
    ],
  },
  referral: {
    headline: 'Four mutuals are warm through Marcus Rosenthal.',
    tips: [
      { stat: '92%', copy: 'Of mentor-sourced referrals make it past the first meeting.' },
      { stat: '$8.4K', copy: 'Average FYC on referrals from your existing book this quarter.' },
    ],
  },
  mybook: {
    headline: 'Your book at a glance.',
    tips: [
      { stat: '142', copy: 'Households · 4 added this quarter.' },
      { stat: '0.42', copy: 'Cross-sell rate · 0.09 below peer median.' },
    ],
  },
}

export function ActionBoardScene() {
  const openChiefOfStaff = useAppStore((s) => s.openChiefOfStaff)
  const setScene = useAppStore((s) => s.setScene)
  const [tab, setTab] = useState<Tab>('mybook')
  const hero = HERO[tab]

  return (
    <section className="flex flex-1 flex-col">
      {/* Top tab strip */}
      <div className="sticky top-0 z-30 flex items-center justify-between gap-6 border-b border-neutral-200 bg-white/85 px-8 py-3 backdrop-blur-sm md:px-12">
        <p className="text-[11.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">
          Client
        </p>

        <nav aria-label="Workspace" className="flex items-center gap-1">
          {TABS.map((t) => {
            const active = t.id === tab
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-pressed={active}
                className={[
                  'relative px-3 py-2 text-[12.5px] font-medium transition-colors',
                  active ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-700',
                ].join(' ')}
              >
                {t.label}
                {active && (
                  <motion.span
                    layoutId="actionboard-underline"
                    className="absolute -bottom-[1px] left-2 right-2 h-[2px] rounded-full bg-[var(--nyl-blue-500)]"
                  />
                )}
              </button>
            )
          })}
        </nav>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setScene('calendar')}
            className="hidden items-center gap-3 text-[13.5px] font-medium text-neutral-900 transition-opacity hover:opacity-70 md:flex"
          >
            <CalendarGlyph />
            <span>9:30 AM</span>
            <span className="text-neutral-300">|</span>
            <span>Emma Clarke annual…</span>
          </button>
          <CollabLauncher />
        </div>
      </div>

      {/* Hero — hidden on My book tab so the canvas owns the full surface */}
      {tab !== 'mybook' && (
        <div className="px-8 pt-10 md:px-12 md:pt-14">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab + '-hero'}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.32 }}
            >
              <h1
                className="font-serif text-[40px] leading-[1.04] tracking-tight text-neutral-900 md:text-[52px]"
                style={{ fontWeight: 400, textWrap: 'balance', whiteSpace: 'pre-line' }}
              >
                {hero.headline}
              </h1>

              <div className="mt-6 flex flex-wrap gap-x-12 gap-y-3">
                {hero.tips.map((t) => (
                  <div key={t.stat} className="flex items-baseline gap-3">
                    <p className="font-serif text-[40px] tracking-tight text-[var(--nyl-blue-500)]">
                      {t.stat}
                    </p>
                    <p className="max-w-[40ch] text-[13px] leading-snug text-neutral-600">
                      {t.copy}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-col gap-4 px-8 pb-20 pt-10 md:px-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab + '-body'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            {tab === 'crosssell' ? (
              CROSSSELL.map((o, i) =>
                i === 0 ? (
                  <FeaturedOpportunity key={o.id} opp={o} index={i} />
                ) : (
                  <OpportunityCard key={o.id} opp={o} index={i} />
                )
              )
            ) : tab === 'mybook' ? (
              <div className="relative -mx-8 -mt-10 h-[calc(100vh-160px)] overflow-hidden md:-mx-12">
                <MyBookCanvas />
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-10 text-center shadow-[0_24px_60px_-30px_rgba(0,10,98,0.18)]">
                <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-400">
                  {TABS.find((t) => t.id === tab)?.label}
                </p>
                <p className="mt-3 max-w-[58ch] mx-auto text-[14.5px] leading-[1.55] text-neutral-600">
                  Opportunity tiles for this tab ship in the next iteration. Ask Nyla for any of it.
                </p>
                <button
                  type="button"
                  onClick={openChiefOfStaff}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--nyl-blue-800)] px-5 py-2.5 text-[12.5px] font-medium uppercase tracking-[0.18em] text-white hover:bg-[var(--nyl-blue-600)]"
                >
                  Ask Nyla
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

function OpportunityCard({ opp, index }: { opp: Opportunity; index: number }) {
  const jumpToFreeform = useAppStore((s) => s.jumpToFreeform)
  const openDeepDive = useAppStore((s) => s.openDeepDive)
  const openCollab = useAppStore((s) => s.openCollab)
  /* Index of the current active step. Steps before it are "done", after are "pending". */
  const [activeStep, setActiveStep] = useState(0)
  const [snoozed, setSnoozed] = useState(false)

  const current = opp.plan[activeStep]
  /* Helper: fire the active step's action + advance the plan. Steps with
   * `collabPrompt` open CollabSpace with a client-specific seed; otherwise we
   * push to Nyla freeform with the legacy promptId. */
  function runStep(stepIndex: number) {
    const step = opp.plan[stepIndex]
    if (!step) return
    if (stepIndex === activeStep) {
      setActiveStep((n) => Math.min(n + 1, opp.plan.length - 1))
    }
    if (step.collabPrompt) {
      /* Map the opportunity id to the client whose draft template should render. */
      const client: 'janet' | 'helena' | 'tom' | undefined = opp.id === 'janet'
        ? 'janet'
        : opp.id.startsWith('helena')
          ? 'helena'
          : undefined
      openCollab(step.collabPrompt, client)
    } else if (step.promptId) {
      jumpToFreeform(step.promptId)
    }
  }

  if (snoozed) {
    return (
      <motion.div
        initial={{ height: 'auto', opacity: 1 }}
        animate={{ height: 56, opacity: 0.6 }}
        className="overflow-hidden rounded-2xl border border-dashed border-neutral-200 bg-white/50 px-6 py-3 text-[12.5px] text-neutral-500"
      >
        Snoozed · I'll surface this again tomorrow.{' '}
        <button
          type="button"
          onClick={() => setSnoozed(false)}
          className="text-[var(--nyl-blue-500)] underline-offset-4 hover:underline"
        >
          Undo
        </button>
      </motion.div>
    )
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.06 * index, ease: [0.22, 0.65, 0.05, 1] }}
      className="overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-30px_rgba(0,10,98,0.18)]"
    >
      <div className="grid grid-cols-12 gap-6 p-6 md:p-8">
        {/* Left — narrative */}
        <div className="col-span-12 lg:col-span-7">
          {/* Header badges + Snooze */}
          <div className="flex flex-wrap items-center gap-2">
            {opp.badges.map((b) => (
              <span
                key={b.label}
                className={[
                  'rounded-full px-2.5 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.18em]',
                  b.tone === 'opportunity'
                    ? 'bg-[var(--nyl-blue-100)] text-[var(--nyl-blue-800)]'
                    : 'bg-[var(--nyl-orange-100)] text-[var(--nyl-orange-500)]',
                ].join(' ')}
              >
                {b.label}
              </span>
            ))}
            <span className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-neutral-400">
              {opp.confidence}% confidence
            </span>
            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                onClick={() => openDeepDive(opp.id)}
                className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--nyl-blue-500)] hover:text-[var(--nyl-blue-800)]"
              >
                Open canvas
                <span aria-hidden="true">↗</span>
              </button>
              <button
                type="button"
                onClick={() => setSnoozed(true)}
                className="text-[12px] font-medium text-neutral-400 hover:text-neutral-700"
              >
                Snooze
              </button>
            </div>
          </div>

          {/* Headline — client name is a link */}
          <h2
            className="mt-4 font-serif text-[22px] leading-[1.22] tracking-tight text-neutral-900 md:text-[24px]"
            style={{ fontWeight: 400, textWrap: 'balance' }}
          >
            <button
              type="button"
              onClick={() => opp.clientPromptId && jumpToFreeform(opp.clientPromptId)}
              className="text-[var(--nyl-blue-500)] hover:underline"
            >
              {opp.headline.split(' ').slice(0, 2).join(' ')}
            </button>{' '}
            {opp.headline.split(' ').slice(2).join(' ')}
          </h2>

          {/* Body */}
          <p className="mt-3 max-w-[58ch] text-[13.5px] leading-[1.55] text-neutral-700">
            {opp.body}
          </p>

          {/* Metrics */}
          <div className="mt-6 grid grid-cols-3 gap-6 border-t border-neutral-100 pt-5">
            {opp.metrics.map((m) => (
              <div key={m.label}>
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-400">
                  {m.label}
                </p>
                <ProgressBar value={m.value} tone={m.tone} />
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10.5px] font-medium uppercase tracking-[0.18em] text-[var(--nyl-blue-500)]">
            {opp.fycEstimate}
          </p>
        </div>

        {/* Right — sequenced plan + dynamic CTA */}
        <div className="col-span-12 lg:col-span-5">
          <div className="rounded-2xl bg-[var(--nyl-blue-100)]/35 p-5">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-[var(--nyl-blue-800)]">
              Plan
            </p>
            <ol className="mt-4 flex flex-col gap-3.5">
              {opp.plan.map((p, i) => {
                const done = i < activeStep
                const active = i === activeStep
                return (
                  <li key={p.label}>
                    <button
                      type="button"
                      onClick={() => runStep(i)}
                      className="flex w-full items-start gap-3 text-left"
                    >
                      <PlanDot state={done ? 'done' : active ? 'active' : 'pending'} />
                      <span className="min-w-0">
                        <span
                          className={[
                            'block text-[13.5px] leading-snug',
                            done ? 'text-neutral-400 line-through decoration-1' : active ? 'font-medium text-neutral-900' : 'text-neutral-700',
                          ].join(' ')}
                        >
                          {p.label}
                        </span>
                        {p.sub && (
                          <span className={['mt-0.5 block text-[11.5px]', done ? 'text-neutral-300' : 'text-neutral-500'].join(' ')}>
                            {p.sub}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>

            <button
              type="button"
              onClick={() => runStep(activeStep)}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--nyl-blue-500)] px-4 py-3 text-[13px] font-semibold text-white hover:bg-[var(--nyl-blue-600)] disabled:opacity-60"
              disabled={!current}
            >
              {current?.cta ?? 'All steps complete'}
            </button>
          </div>
        </div>
      </div>

      {opp.tip && (
        <p className="border-t border-neutral-100 bg-neutral-50/60 px-6 py-3 text-[12px] italic text-neutral-500 md:px-8">
          {opp.tip}
        </p>
      )}
    </motion.article>
  )
}


function CalendarGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-neutral-700">
      <rect x="3" y="5" width="16" height="14" rx="2" />
      <path d="M3 9 H19" />
      <path d="M7 3 V6" />
      <path d="M15 3 V6" />
    </svg>
  )
}

/* Quick agent move chip — navy pill with azure text, per Figma 1314:21748. */
function QuickMoveChip({
  children,
  onClick,
  freeform,
}: {
  children: ReactNode
  onClick: () => void
  freeform?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex max-w-[280px] items-center gap-2 rounded-[22px] border px-4 py-2.5 text-left text-[15px] leading-snug backdrop-blur-[2px] transition-[filter] hover:brightness-125"
      style={{ background: '#15315d', borderColor: '#66a8ff', color: 'var(--nyl-blue-250)' }}
    >
      {freeform && <PencilGlyph />}
      <span className={freeform ? 'italic' : ''}>{children}</span>
    </button>
  )
}

function PencilGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      <path d="M11.3 2.2 L13.8 4.7 L5 13.5 L2 14 L2.5 11 Z" />
      <path d="M10.3 3.2 L12.8 5.7" />
    </svg>
  )
}


/* ----------------------------------------------------------------------------
 * Featured opportunity — first tile with hover-glow AI + push-out chip panel
 * -------------------------------------------------------------------------- */

function FeaturedOpportunity({ opp, index }: { opp: Opportunity; index: number }) {
  const [hover, setHover] = useState(false)
  const [open, setOpen] = useState(false)
  const openDeepDive = useAppStore((s) => s.openDeepDive)
  const jumpToFreeform = useAppStore((s) => s.jumpToFreeform)

  const showSparkle = hover || open

  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <motion.div
        animate={{ x: open ? -380 : 0 }}
        transition={{ duration: 0.42, ease: [0.22, 0.65, 0.05, 1] }}
      >
        <OpportunityCard opp={opp} index={index} />
      </motion.div>

      {/* Glowing AI sparkle — sits to the right of the card */}
      <AnimatePresence>
        {showSparkle && !open && (
          <motion.button
            key="sparkle"
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open agent quick actions"
            initial={{ opacity: 0, x: -6, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -6, scale: 0.85 }}
            transition={{ duration: 0.25 }}
            className="absolute right-[-26px] top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full text-white"
            style={{
              background:
                'linear-gradient(150deg, #4a7bff 0%, #0468ff 55%, #0044cc 100%)',
              boxShadow:
                '0 0 0 6px rgba(4,104,255,0.18), 0 0 24px 4px rgba(4,104,255,0.45), 0 12px 30px -10px rgba(4,104,255,0.55)',
            }}
          >
            <span aria-hidden="true" className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--nyl-blue-500)] opacity-40" />
            <Nyla size={24} variant="on-dark" className="relative" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Quick agent moves — navy sparkle + chips beside the card (Figma 1294:21667) */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="moves"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.32, ease: [0.22, 0.65, 0.05, 1] }}
            className="absolute right-0 top-1/2 z-20 flex -translate-y-1/2 items-center gap-4"
          >
            {/* Navy sparkle — toggles the panel closed */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close agent quick actions"
              className="flex size-12 shrink-0 items-center justify-center rounded-full text-[var(--nyl-blue-500)]"
              style={{
                background:
                  'radial-gradient(circle at 30% 30%, #1a2a6b 0%, #0a1640 70%, #05103a 100%)',
                boxShadow: '0 8px 20px -8px rgba(2,7,31,0.55)',
              }}
            >
              <Nyla size={24} variant="on-dark" />
            </button>

            {/* Chips */}
            <div className="flex flex-col items-start gap-2">
              <QuickMoveChip
                onClick={() => {
                  setOpen(false)
                  jumpToFreeform('draft-outreach')
                }}
              >
                Compose an outreach message
              </QuickMoveChip>
              <QuickMoveChip
                onClick={() => {
                  setOpen(false)
                  openDeepDive(opp.id)
                }}
              >
                Identify more opportunities for engagement
              </QuickMoveChip>
              <QuickMoveChip
                freeform
                onClick={() => {
                  setOpen(false)
                  openDeepDive(opp.id)
                }}
              >
                Something else…
              </QuickMoveChip>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

