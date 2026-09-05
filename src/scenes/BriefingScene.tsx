import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useAppStore } from '@/state/useAppStore'
import { BadgePill } from '@/ui/BadgePill'
import { SectionEyebrow } from '@/ui/SectionEyebrow'
import { Chevron } from '@/ui/Chevron'
import { OpportunityRing } from '@/ui/OpportunityRing'
/* (SEGMENTS no longer needed inline — segment data flows through briefingContent.) */
import {
  DAILY_BRIEFING_BY_SEGMENT,
  PRE_MEETING_BY_ID,
  type AutonomousItem,
  type CardDetails,
  type ClientSignal,
  type DailyBriefing,
  type PreMeetingBrief,
  type ScheduleItem,
  type UrgentItem,
} from '@/data/briefingContent'

/* BriefingScene — "presidential bottom-line" daily briefing.
 *
 * Mirrors Zee's NYL360_AdvisorBriefing_v2.html structure with our own
 * design system applied:
 *   - Top bar: "Daily briefing · Nyla · date" + advisor pill
 *   - Mode chips: Daily · Pre-meeting · Weekly · Annual
 *   - "Good morning, [Name]." + summary line + date stack on the right
 *   - BOTTOM LINE narrative card (the imperative read)
 *   - REQUIRES ACTION BEFORE 10AM — urgent cards
 *   - TODAY'S SCHEDULE — timeline, click a meeting opens the pre-meeting brief
 *   - CLIENT SIGNALS — pip-coded feed
 *   - PACE TO PLAN — 4 stat tiles
 *
 * Content is driven by the active onboarding segment so Marcus / Priya /
 * Jordan each see a coherent personalized briefing that reflects their
 * onboarding answers. */

type Mode = 'daily' | 'pre-meeting' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
type Horizon = 'day' | 'week' | 'month' | 'quarter' | 'year'

const HORIZONS: { id: Horizon; label: string; mode: Mode }[] = [
  { id: 'day', label: 'Day', mode: 'daily' },
  { id: 'week', label: 'Week', mode: 'weekly' },
  { id: 'month', label: 'Month', mode: 'monthly' },
  { id: 'quarter', label: 'Quarter', mode: 'quarterly' },
  { id: 'year', label: 'Year', mode: 'yearly' },
]

const EASE = [0.22, 0.65, 0.05, 1] as const

export function BriefingScene() {
  const activeSegment = useAppStore((s) => s.activeSegment)
  const briefing = DAILY_BRIEFING_BY_SEGMENT[activeSegment]

  const [horizon, setHorizon] = useState<Horizon>('day')
  const [openMeetingId, setOpenMeetingId] = useState<string | null>(null)

  function openMeeting(id?: string) {
    if (!id) return
    setOpenMeetingId(id)
  }

  /* Pre-meeting brief takes over the body when a meeting is selected; the
   * horizon strip stays put. The top-bar "next meeting" link also opens it. */
  const showingPreMeeting = !!openMeetingId

  /* Reset the inner scroll position whenever the visible content changes —
   * fixes the case where the briefing opens partway down because the scroll
   * container retained a previous position across mounts or horizon swaps. */
  const scrollRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'auto' })
    /* Also reset the window scroll in case the page itself has drifted. */
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'auto' })
  }, [horizon, showingPreMeeting, activeSegment])

  return (
    <motion.section
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-1 flex-col"
      style={{
        background: 'linear-gradient(165deg, #e9efff 0%, #d5e2fd 45%, #bccff9 100%)',
      }}
    >
      <HorizonTopBar
        nextMeeting={briefing.schedule.find((s) => s.meetingId)}
        onOpenNextMeeting={(id) => openMeeting(id)}
      />

      <div ref={scrollRef} className="flex flex-1 flex-col overflow-y-auto px-6 pb-24 pt-8 md:px-8 md:pt-10">
        <div className="w-full">
          <BriefingControls
            horizon={horizon}
            onHorizon={(h) => {
              setHorizon(h)
              if (showingPreMeeting) setOpenMeetingId(null)
            }}
            showingPreMeeting={showingPreMeeting}
            onPickPreMeeting={() => {
              const first = briefing.schedule.find((s) => s.meetingId)
              if (first?.meetingId) openMeeting(first.meetingId)
            }}
          />
          <AnimatePresence mode="wait">
            {showingPreMeeting && (
              <motion.div
                key="pre"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <PreMeetingView
                  meetingId={openMeetingId!}
                  fallbackTitle={briefing.schedule.find((s) => s.id === openMeetingId)?.title ?? 'Meeting'}
                  onBack={() => setOpenMeetingId(null)}
                />
              </motion.div>
            )}
            {!showingPreMeeting && horizon === 'day' && (
              <motion.div
                key="day"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <DateRibbon
                  weekday={briefing.date.weekday}
                  dateLabel={`Today  ·  ${briefing.date.weekday}, ${briefing.date.monthDay}`}
                />
                <DailyBriefingView briefing={briefing} onMeetingClick={openMeeting} />
              </motion.div>
            )}
            {!showingPreMeeting && horizon === 'week' && (
              <motion.div
                key="week"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <DateRibbon weekday="Wk 22" dateLabel="Week of May 25 – 29" />
                <WeeklyOpsView briefing={briefing} />
              </motion.div>
            )}
            {!showingPreMeeting && horizon === 'month' && (
              <motion.div
                key="month"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <DateRibbon weekday="May" dateLabel="May 2026 · monthly pace" />
                <MonthlyStrategistView briefing={briefing} />
              </motion.div>
            )}
            {!showingPreMeeting && horizon === 'quarter' && (
              <motion.div
                key="quarter"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <DateRibbon weekday="Q2" dateLabel="Q2 2026 · direction & council pace" />
                <QuarterlyDirectionView briefing={briefing} />
              </motion.div>
            )}
            {!showingPreMeeting && horizon === 'year' && (
              <motion.div
                key="year"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <DateRibbon weekday="2026" dateLabel="2026 · practice trajectory" />
                <AnnualCoachView briefing={briefing} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  )
}

/* Tight horizon date ribbon shown above the body once you've picked a horizon. */
function DateRibbon({ weekday, dateLabel }: { weekday: string; dateLabel: string }) {
  return (
    <div className="mb-6 flex items-center gap-3 text-[11.5px] uppercase tracking-[0.22em] text-neutral-500">
      <button type="button" aria-label="Previous" className="text-neutral-400 hover:text-neutral-900">
        ‹
      </button>
      <span>{dateLabel}</span>
      <button type="button" aria-label="Next" className="text-neutral-400 hover:text-neutral-900">
        ›
      </button>
      <span aria-hidden="true" className="ml-2 text-neutral-300">
        ·
      </span>
      <span className="font-medium tracking-[0.18em] text-neutral-700">{weekday}</span>
    </div>
  )
}

/* ----------------------------------------------------------------------------
 * Top bar
 * -------------------------------------------------------------------------- */

function HorizonTopBar({
  nextMeeting,
  onOpenNextMeeting,
}: {
  nextMeeting: ScheduleItem | undefined
  onOpenNextMeeting: (id: string) => void
}) {
  return (
    <div className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 px-6 py-3 backdrop-blur-sm md:px-8">
      <div className="flex w-full items-center justify-between gap-6">
        <p className="text-[11.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">In brief</p>

        <div className="flex items-center gap-4">
          {nextMeeting && (
            <button
              type="button"
              onClick={() => nextMeeting.meetingId && onOpenNextMeeting(nextMeeting.meetingId)}
              className="hidden items-center gap-3 text-[13px] font-medium text-neutral-900 transition-opacity hover:opacity-70 md:flex"
            >
              <CalendarGlyph />
              <span>{nextMeeting.time}</span>
              <span className="text-neutral-300">|</span>
              <span className="truncate">{shortMeetingTitle(nextMeeting.title)}</span>
            </button>
          )}
          <CollabLauncher />
        </div>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------------------
 * BriefingControls — Briefing Mode cards + horizon pills, sits on the blue
 * gradient above the body. Mode cards mirror Zee's iconic selector; the pills
 * are the time-scope picker the user can use within Daily or Weekly.
 * -------------------------------------------------------------------------- */

type BriefingModeId = 'daily' | 'pre-meeting' | 'weekly' | 'annual'

const BRIEFING_MODES: {
  id: BriefingModeId
  label: string
  persona: string
  /* Mapped horizon when the mode is picked, when applicable. */
  horizon?: Horizon
  /* Soft pastel tint per mode. */
  tint: string
  iconTint: string
  Icon: React.ComponentType
}[] = [
  {
    id: 'daily',
    label: 'Daily briefing',
    persona: 'Nyla',
    horizon: 'day',
    tint: 'bg-[var(--nyl-blue-100)]/55',
    iconTint: 'text-[var(--nyl-blue-600)]',
    Icon: SunIcon,
  },
  {
    id: 'pre-meeting',
    label: 'Pre-meeting brief',
    persona: 'Intelligence Analyst',
    tint: 'bg-[var(--nyl-blue-100)]/35',
    iconTint: 'text-[var(--nyl-blue-600)]',
    Icon: TargetIcon,
  },
  {
    id: 'weekly',
    label: 'Weekly ops',
    persona: 'Concierge',
    horizon: 'week',
    tint: 'bg-[var(--nyl-orange-100)]/60',
    iconTint: 'text-[var(--nyl-orange-500)]',
    Icon: BarsIcon,
  },
  {
    id: 'annual',
    label: 'Annual / strategic',
    persona: 'Strategist + Coach',
    horizon: 'year',
    tint: 'bg-[var(--nyl-green-200)]/45',
    iconTint: 'text-[var(--nyl-green-800)]',
    Icon: DiamondIcon,
  },
]

function BriefingControls({
  horizon,
  onHorizon,
  showingPreMeeting,
  onPickPreMeeting,
}: {
  horizon: Horizon
  onHorizon: (h: Horizon) => void
  showingPreMeeting: boolean
  onPickPreMeeting: () => void
}) {
  const activeMode: BriefingModeId = showingPreMeeting
    ? 'pre-meeting'
    : horizon === 'day'
      ? 'daily'
      : horizon === 'week'
        ? 'weekly'
        : 'annual'

  return (
    <div className="mb-8">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-[var(--nyl-blue-800)]/70">
        Briefing mode
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        {BRIEFING_MODES.map((m) => {
          const on = m.id === activeMode
          const Icon = m.Icon
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                if (m.id === 'pre-meeting') onPickPreMeeting()
                else if (m.horizon) onHorizon(m.horizon)
              }}
              aria-pressed={on}
              className={[
                'group relative flex items-start gap-3 rounded-2xl border bg-white/70 px-4 py-3.5 text-left backdrop-blur-sm transition-all',
                on
                  ? 'border-[var(--nyl-blue-500)] bg-white shadow-[0_8px_24px_-16px_rgba(0,10,98,0.35)]'
                  : 'border-white/50 hover:border-[var(--nyl-blue-500)]/40 hover:bg-white/85',
              ].join(' ')}
            >
              <span
                aria-hidden="true"
                className={[
                  'inline-flex size-10 shrink-0 items-center justify-center rounded-xl',
                  m.tint,
                  m.iconTint,
                ].join(' ')}
              >
                <Icon />
              </span>
              <div className="min-w-0">
                <p
                  className={[
                    'text-[14px] font-medium leading-tight',
                    on ? 'text-[var(--nyl-blue-500)]' : 'text-neutral-900',
                  ].join(' ')}
                >
                  {m.label}
                </p>
                <p className="mt-1 text-[11.5px] leading-snug text-neutral-500">{m.persona}</p>
              </div>
            </button>
          )
        })}
      </div>

      {!showingPreMeeting && (
        <nav
          aria-label="Time scope"
          className="mt-4 inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/60 p-1 backdrop-blur-sm"
        >
          {HORIZONS.map((h) => {
            const on = h.id === horizon
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => onHorizon(h.id)}
                aria-pressed={on}
                className={[
                  'relative rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors',
                  on ? 'text-white' : 'text-neutral-600 hover:text-neutral-900',
                ].join(' ')}
              >
                {on && (
                  <motion.span
                    layoutId="horizon-pill"
                    className="absolute inset-0 -z-[1] rounded-full bg-[var(--nyl-blue-500)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                {h.label}
              </button>
            )
          })}
        </nav>
      )}
    </div>
  )
}

function SunIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M4.93 19.07l1.41-1.41" />
      <path d="M17.66 6.34l1.41-1.41" />
    </svg>
  )
}
function TargetIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  )
}
function BarsIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M5 7h14" />
      <path d="M5 12h14" />
      <path d="M5 17h14" />
    </svg>
  )
}
function DiamondIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="6" y="6" width="12" height="12" transform="rotate(45 12 12)" />
      <rect x="9.5" y="9.5" width="5" height="5" transform="rotate(45 12 12)" />
    </svg>
  )
}

function CalendarGlyph() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-neutral-700"
    >
      <rect x="3" y="5" width="16" height="14" rx="2" />
      <path d="M3 9 H19" />
      <path d="M7 3 V6" />
      <path d="M15 3 V6" />
    </svg>
  )
}

function shortMeetingTitle(t: string): string {
  /* "Emma Clarke — Annual Review" → "Emma Clarke annual…" */
  const parts = t.split(/—|·|-/).map((s) => s.trim())
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1].split(' ')[0].toLowerCase()}…`
  }
  return t.length > 22 ? `${t.slice(0, 21)}…` : t
}

/* ----------------------------------------------------------------------------
 * Daily briefing body
 * -------------------------------------------------------------------------- */

function DailyBriefingView({
  briefing,
  onMeetingClick,
}: {
  briefing: DailyBriefing
  onMeetingClick: (id?: string) => void
}) {
  /* Track which cards (urgent + signal) are expanded. Seeded from defaultOpen. */
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const init = new Set<string>()
    briefing.urgent.forEach((u) => {
      if (u.defaultOpen) init.add(u.id)
    })
    briefing.signals.forEach((s) => {
      if (s.defaultOpen) init.add(s.id)
    })
    return init
  })
  function toggleCard(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  return (
    <div className="grid grid-cols-12 gap-8 lg:gap-10">
      {/* LEFT — narrative column (9/12 so tiles span the full frame) */}
      <div className="col-span-12 lg:col-span-9">
        <span className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-700">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-[var(--nyl-blue-500)]" />
          Nyla mode
        </span>

        {/* Greeting eyebrow + strategic hero */}
        <p className="mt-6 text-[12px] uppercase tracking-[0.22em] text-neutral-500">
          Good morning, {briefing.firstName}
        </p>
        <h1
          className="mt-2 font-serif text-[40px] leading-[1.04] tracking-tight text-neutral-900 md:text-[56px]"
          style={{ fontWeight: 400, textWrap: 'balance' }}
        >
          {renderWithHighlight(briefing.headline, briefing.headlineHighlight)}
        </h1>
        <p className="mt-3 text-[13.5px] leading-snug text-neutral-600">{briefing.summary}</p>

        {/* Opportunity ring — fitness-tracker style advisor-centric motivator */}
        <OpportunityRing
          percentToGoal={briefing.opportunityToday.percentToGoal}
          fycInPlayLabel={briefing.opportunityToday.fycInPlayLabel}
          fycToDateLabel={briefing.opportunityToday.fycToDateLabel}
          ringNudge={briefing.opportunityToday.ringNudge}
          streak={briefing.opportunityToday.streak}
        />

        {/* BOTTOM LINE */}
        <div className="mt-8 rounded-xl border-l-[4px] border-[var(--nyl-blue-500)] bg-white px-6 py-5 shadow-[0_8px_24px_-18px_rgba(0,10,98,0.18)]">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[var(--nyl-blue-600)]">
            Bottom line
          </p>
          <p className="mt-3 text-[14.5px] leading-[1.6] text-neutral-900" style={{ textWrap: 'balance' }}>
            {briefing.bottomLine}
          </p>
        </div>

        {/* REQUIRES ACTION BEFORE 10AM */}
        <SectionEyebrow eyebrow="Requires action before 10am" />
        <div className="flex flex-col gap-3">
          {briefing.urgent.map((u) => (
            <UrgentCard key={u.id} item={u} expanded={expandedIds.has(u.id)} onToggle={() => toggleCard(u.id)} />
          ))}
        </div>

        {/* CLIENT SIGNALS — TODAY */}
        <SectionEyebrow eyebrow="Client signals — today" />
        <div className="flex flex-col gap-3">
          {briefing.signals.map((s) => (
            <SignalCard key={s.id} signal={s} expanded={expandedIds.has(s.id)} onToggle={() => toggleCard(s.id)} />
          ))}
        </div>
        <p className="mt-6 text-[12px] italic text-neutral-500">{briefing.whyThisOrder}</p>
      </div>

      {/* RIGHT — date stack + today's schedule + autonomous activity */}
      <aside className="col-span-12 lg:col-span-3">
        <div className="flex flex-col gap-6 lg:sticky lg:top-[88px]">
          {/* Date stack */}
          <div className="flex items-start justify-between gap-3">
            <p className="text-[10.5px] uppercase tracking-[0.22em] text-neutral-400">{briefing.generatedAt}</p>
            <div className="text-right">
              <p
                className="font-serif text-[15px] leading-none tracking-tight text-neutral-700"
                style={{ fontWeight: 400 }}
              >
                {briefing.date.weekday}
              </p>
              <p
                className="font-serif text-[30px] leading-none tracking-tight text-neutral-900"
                style={{ fontWeight: 400 }}
              >
                {briefing.date.monthDay}
              </p>
            </div>
          </div>

          {/* Today's schedule */}
          <div>
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">Today's schedule</p>
            <div className="mt-1.5 h-px w-full bg-neutral-200" />
            <ol className="mt-4 flex flex-col">
              {briefing.schedule.map((s, i) => (
                <CompactScheduleRow
                  key={s.id}
                  item={s}
                  isLast={i === briefing.schedule.length - 1}
                  onClick={() => onMeetingClick(s.meetingId)}
                />
              ))}
            </ol>
          </div>

          {/* The OS handled overnight */}
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">
                The OS handled overnight
              </p>
              <span aria-hidden="true" className="inline-flex size-1.5 rounded-full bg-[var(--nyl-green-600)]" />
            </div>
            <ul className="mt-3 flex flex-col gap-2.5">
              {briefing.autonomous.map((a) => (
                <AutonomousRowCompact key={a.id} item={a} />
              ))}
            </ul>
            <p className="mt-3 text-[11px] italic leading-snug text-neutral-500">
              Background work runs continuously. Tap any item to see what the OS did.
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}

/* REQUIRES ACTION card — Figma 943:25992. Badge pill top-left, Snooze
 * top-right, white background, priority tags + outreach row at bottom. */
function UrgentCard({ item, expanded, onToggle }: { item: UrgentItem; expanded: boolean; onToggle: () => void }) {
  const openCollab = useAppStore((s) => s.openCollab)
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      {/* Header row: badge + snooze */}
      <div className="flex items-center justify-between gap-3 px-5 pt-4">
        <div className="flex items-center gap-2">
          {item.badge && <BadgePill tone={item.badge.tone} label={item.badge.label} />}
        </div>
        <button
          type="button"
          className="shrink-0 text-[12px] font-medium text-neutral-400 hover:text-neutral-600"
          onClick={(e) => e.stopPropagation()}
        >
          Snooze
        </button>
      </div>

      {/* Main content — clickable to expand */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-col items-start gap-0 px-5 pb-4 pt-3 text-left"
      >
        <p
          className="font-serif text-[20px] leading-[1.25] tracking-tight text-neutral-900 md:text-[22px]"
          style={{ fontWeight: 400, textWrap: 'balance' }}
        >
          {item.title}
        </p>
        <p className="mt-2 text-[13.5px] leading-snug text-neutral-700">{item.body}</p>

        {/* Priority tags */}
        {item.priorityTags && item.priorityTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {item.priorityTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-2.5 py-1 text-[11.5px] text-neutral-600"
              >
                <span aria-hidden="true" className="size-1.5 rounded-full bg-[var(--nyl-blue-400)]" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Expand indicator */}
        {item.details && (
          <div className="mt-3 flex w-full items-center justify-between gap-2 border-t border-neutral-100 pt-3">
            <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-neutral-500">
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M2 8 L14 8M10 4 L14 8 L10 12" />
              </svg>
              Outreach approach
            </span>
            <div className="flex items-center gap-3">
              {item.phone && <span className="text-[12.5px] text-neutral-500">{item.phone}</span>}
              {item.outreachCta && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (item.actionPrompt) openCollab(item.actionPrompt)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation()
                      if (item.actionPrompt) openCollab(item.actionPrompt)
                    }
                  }}
                  className="rounded-md bg-[#0468ff] px-3 py-1.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-[#0044cc]"
                >
                  {item.outreachCta}
                </span>
              )}
              <Chevron expanded={expanded} />
            </div>
          </div>
        )}
      </button>

      <CoSExpandedBody expanded={expanded} details={item.details} />
    </div>
  )
}

/* CLIENT SIGNALS — full-width tile with pip dot + action callout. */
function SignalCard({ signal, expanded, onToggle }: { signal: ClientSignal; expanded: boolean; onToggle: () => void }) {
  const openCollab = useAppStore((s) => s.openCollab)
  const pip =
    signal.pip === 'red'
      ? 'bg-[#dc2626]'
      : signal.pip === 'amber'
        ? 'bg-[var(--nyl-orange-400)]'
        : 'bg-[var(--nyl-green-600)]'
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <button type="button" onClick={onToggle} className="group flex w-full items-start gap-4 p-5 text-left">
        <div className="min-w-0 flex-1">
          <p
            className="flex items-center gap-2 font-serif text-[19px] leading-[1.25] tracking-tight text-neutral-900 md:text-[20px]"
            style={{ fontWeight: 400, textWrap: 'balance' }}
          >
            <span aria-hidden="true" className={['inline-block size-2 shrink-0 rounded-full', pip].join(' ')} />
            {signal.title}
          </p>
          <p className="mt-1.5 text-[13.5px] leading-snug text-neutral-700">{signal.body}</p>
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation()
              if (signal.actionPrompt) openCollab(signal.actionPrompt)
            }}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && signal.actionPrompt) {
                e.stopPropagation()
                openCollab(signal.actionPrompt)
              }
            }}
            className={[
              'mt-2 inline-flex text-[12.5px] font-medium',
              signal.actionPrompt
                ? 'cursor-pointer text-[var(--nyl-blue-500)] hover:text-[var(--nyl-blue-800)]'
                : 'text-[var(--nyl-blue-500)]',
            ].join(' ')}
          >
            → {signal.action}
          </span>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <BadgePill tone={signal.badge.tone} label={signal.badge.label} />
          {signal.details && <Chevron expanded={expanded} />}
        </div>
      </button>
      <CoSExpandedBody expanded={expanded} details={signal.details} />
    </div>
  )
}

/* Expanded body — Analysis / Insight / Recommendation + follow-up strip +
 * Nyla suggested action chips. Shared by urgent + signal cards. */
function CoSExpandedBody({ expanded, details }: { expanded: boolean; details: CardDetails | undefined }) {
  const openCollab = useAppStore((s) => s.openCollab)
  const openDeepDive = useAppStore((s) => s.openDeepDive)
  return (
    <AnimatePresence initial={false}>
      {expanded && details && (
        <motion.div
          key="body"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-1 gap-7 border-t border-neutral-200/60 px-7 pb-6 pt-5 md:grid-cols-3">
            <div>
              <p className="text-[12.5px] text-neutral-500">Analysis</p>
              <p className="mt-2 text-[13.5px] leading-[1.55] text-neutral-700">{details.analysis}</p>
            </div>
            <div>
              <p className="text-[12.5px] text-neutral-500">Insight</p>
              <p className="mt-2 text-[13.5px] leading-[1.55] text-neutral-700">{details.insight}</p>
            </div>
            <div>
              <p className="text-[12.5px] text-neutral-500">Recommendation</p>
              <p className="mt-2 text-[13.5px] leading-[1.55] text-neutral-700">{details.recommendation}</p>
            </div>
          </div>
          {details.followup && (
            <p className="bg-[#dbe7ff]/65 px-7 py-3 text-center text-[13.5px] text-neutral-700">{details.followup}</p>
          )}
          {details.suggestedActions && details.suggestedActions.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 px-7 py-5">
              <span
                aria-hidden="true"
                className="flex size-11 shrink-0 items-center justify-center rounded-full text-[var(--nyl-blue-500)]"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, #1a2a6b 0%, #060f3f 65%, #02071f 100%)',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 28 28" fill="currentColor">
                  <path d="M12.5759 1.06709C12.992 -0.355698 15.0074 -0.355698 15.4235 1.06709L17.0505 6.63252L22.1374 3.84834C23.4377 3.13651 24.8629 4.56172 24.1511 5.86202L21.3669 10.948L26.9323 12.5759C28.3551 12.992 28.3551 15.0074 26.9323 15.4235L21.3659 17.0505L24.1511 22.1384C24.8628 23.4386 23.4377 24.8639 22.1374 24.1521L17.0505 21.3669L15.4235 26.9323C15.0074 28.3551 12.992 28.3551 12.5759 26.9323L10.948 21.3669L5.86202 24.1521C4.56177 24.8639 3.13668 23.4386 3.84834 22.1384L6.63252 17.0505L1.06709 15.4235C-0.355698 15.0074 -0.355698 12.992 1.06709 12.5759L6.63252 10.948L3.84834 5.86202C3.13651 4.56172 4.56172 3.13651 5.86202 3.84834L10.948 6.63252L12.5759 1.06709Z" />
                </svg>
              </span>
              {details.suggestedActions.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (a.canvasId) {
                      openDeepDive(a.canvasId)
                    } else {
                      openCollab(a.prompt)
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[13.5px] text-white transition-shadow hover:shadow-[0_10px_24px_-12px_rgba(2,7,31,0.55)]"
                  style={{
                    background: 'linear-gradient(180deg, #0b1740 0%, #050b29 100%)',
                    boxShadow: '0 6px 14px -10px rgba(2, 7, 31, 0.6), 0 0 0 1px rgba(255,255,255,0.04) inset',
                  }}
                >
                  {a.freeform && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="text-white/80"
                    >
                      <path d="M11.3 2.2 L13.8 4.7 L5 13.5 L2 14 L2.5 11 Z" />
                      <path d="M10.3 3.2 L12.8 5.7" />
                    </svg>
                  )}
                  <span className={a.freeform ? 'italic text-[var(--nyl-blue-250)]' : ''}>{a.label}</span>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* Compact schedule row tuned for the right rail. */
function CompactScheduleRow({ item, isLast, onClick }: { item: ScheduleItem; isLast: boolean; onClick: () => void }) {
  const dot =
    item.status === 'ready'
      ? 'bg-[var(--nyl-blue-500)]'
      : item.status === 'needsPrep'
        ? 'bg-[var(--nyl-orange-400)]'
        : item.status === 'wrap'
          ? 'bg-neutral-300'
          : 'bg-neutral-400'
  const clickable = !!item.meetingId
  return (
    <li className="relative">
      {!isLast && (
        <span aria-hidden="true" className="absolute left-[5px] top-3 h-[calc(100%-4px)] w-px bg-neutral-200" />
      )}
      <button
        type="button"
        onClick={clickable ? onClick : undefined}
        disabled={!clickable}
        className={[
          'group flex w-full items-start gap-3 py-2.5 pr-1 text-left',
          clickable ? 'cursor-pointer rounded-lg transition-colors hover:bg-white/60' : 'cursor-default',
        ].join(' ')}
      >
        <span
          aria-hidden="true"
          className={[
            'mt-1 inline-block size-[11px] shrink-0 rounded-full ring-4 ring-[#eef2fb] group-hover:ring-white/60',
            dot,
          ].join(' ')}
        />
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-neutral-500">
            {item.time}
            {item.duration && <> · {item.duration}</>}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <p className="text-[13px] font-semibold text-neutral-900">{item.title}</p>
            {item.status === 'ready' && <CompactPrepBadge tone="ready">Prep ready</CompactPrepBadge>}
            {item.status === 'needsPrep' && <CompactPrepBadge tone="needsPrep">Prep needed</CompactPrepBadge>}
          </div>
          <p className="mt-1 text-[11.5px] leading-snug text-neutral-600">{item.body}</p>
        </div>
      </button>
    </li>
  )
}

function CompactPrepBadge({ tone, children }: { tone: 'ready' | 'needsPrep'; children: React.ReactNode }) {
  return (
    <span
      className={[
        'shrink-0 rounded px-1.5 py-0.5 text-[9.5px] font-medium uppercase tracking-[0.16em]',
        tone === 'ready'
          ? 'bg-[var(--nyl-blue-100)]/70 text-[var(--nyl-blue-800)]'
          : 'bg-[var(--nyl-orange-100)] text-[var(--nyl-orange-500)]',
      ].join(' ')}
    >
      {children}
    </span>
  )
}

function AutonomousRowCompact({ item }: { item: AutonomousItem }) {
  const openCollab = useAppStore((s) => s.openCollab)
  const [open, setOpen] = useState(false)
  const fallbackSummary = `${item.label}. ${item.meta}.`
  const expand = item.expand ?? { summary: fallbackSummary }
  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group -mx-1.5 flex w-full items-start gap-2.5 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-[var(--nyl-blue-100)]/40 focus:outline-none focus-visible:bg-[var(--nyl-blue-100)]/55"
      >
        <span
          aria-hidden="true"
          className="mt-[5px] flex size-3 shrink-0 items-center justify-center rounded-full bg-[var(--nyl-green-200)]/60 text-[var(--nyl-green-800)]"
        >
          <svg
            width="7"
            height="7"
            viewBox="0 0 6 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 3 L2.5 4.5 L5 1.5" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-medium leading-snug text-neutral-900 group-hover:text-[var(--nyl-blue-800)]">
            {item.label}
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-neutral-500">{item.meta}</p>
        </div>
        <span
          aria-hidden="true"
          className={[
            'mt-[3px] text-[10px] text-neutral-400 transition-transform',
            open ? 'rotate-90 text-[var(--nyl-blue-500)]' : 'group-hover:text-[var(--nyl-blue-500)]',
          ].join(' ')}
        >
          ›
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="exp"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 0.65, 0.05, 1] }}
            className="overflow-hidden"
          >
            <div className="ml-[22px] mt-2 rounded-lg border border-neutral-200 bg-[var(--nyl-blue-100)]/25 p-3">
              <p className="text-[12px] leading-snug text-neutral-800">{expand.summary}</p>
              {expand.bullets && expand.bullets.length > 0 && (
                <ul className="mt-2 flex flex-col gap-1.5">
                  {expand.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11.5px] leading-snug text-neutral-700">
                      <span
                        aria-hidden="true"
                        className="mt-[6px] inline-block size-[3px] shrink-0 rounded-full bg-[var(--nyl-blue-500)]"
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              {expand.chips && expand.chips.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {expand.chips.map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => openCollab(c.prompt)}
                      className="rounded-full border border-[var(--nyl-blue-500)]/30 bg-white px-2.5 py-1 text-[10.5px] font-medium text-[var(--nyl-blue-600)] hover:bg-[var(--nyl-blue-500)] hover:text-white"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

/* Splits `text` so the substring `highlight` renders in red. Case-insensitive. */
function renderWithHighlight(text: string, highlight?: string): React.ReactNode {
  if (!highlight) return text
  const idx = text.toLowerCase().indexOf(highlight.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-[#B82A1F]">{text.slice(idx, idx + highlight.length)}</span>
      {text.slice(idx + highlight.length)}
    </>
  )
}

/* (BADGE_TONE + magazine-style PriorityCard removed — the BOTTOM LINE +
 * REQUIRES ACTION + CLIENT SIGNALS sections replaced them with UrgentCard +
 * SignalCard. priorities[] on the briefing data is kept for a possible future
 * surface but not rendered in this view.) */

/* (Old PriorityCard / AutonomousRow / YourDayRow removed — superseded by
 * UrgentCard, SignalCard, CompactScheduleRow, and AutonomousRowCompact in the
 * BOTTOM LINE + sections layout above.) */

/* (Old daily-view helpers removed — superseded by PriorityCard + YourDayRow
 * + the magazine-style AutonomousRow declared above. Section is retained
 * because the pre-meeting brief still uses its eyebrow + divider treatment.) */

function Section({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">{eyebrow}</p>
      <div className="mt-1.5 h-px w-full bg-neutral-200" />
      <div className="mt-4">{children}</div>
    </section>
  )
}

/* ----------------------------------------------------------------------------
 * Pre-meeting brief — Emma Clarke deep dive (fallback for others)
 * -------------------------------------------------------------------------- */

function PreMeetingView({
  meetingId,
  fallbackTitle,
  onBack,
}: {
  meetingId: string
  fallbackTitle: string
  onBack: () => void
}) {
  const brief = PRE_MEETING_BY_ID[meetingId]
  if (!brief) {
    return (
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[12.5px] text-neutral-500 hover:text-neutral-900"
        >
          <span aria-hidden="true">←</span> Back to daily briefing
        </button>
        <h1
          className="mt-6 font-serif text-[36px] leading-tight tracking-tight text-neutral-900 md:text-[42px]"
          style={{ fontWeight: 400 }}
        >
          {fallbackTitle}
        </h1>
        <p className="mt-3 max-w-[60ch] text-[14px] leading-snug text-neutral-600">
          The full Intelligence-Analyst-grade brief for this meeting is being assembled. Try the Emma Clarke meeting in
          the morning schedule for the full pack.
        </p>
      </div>
    )
  }
  return <PreMeetingBriefBody brief={brief} onBack={onBack} />
}

function PreMeetingBriefBody({ brief, onBack }: { brief: PreMeetingBrief; onBack: () => void }) {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[12.5px] text-neutral-500 hover:text-neutral-900"
      >
        <span aria-hidden="true">←</span> Back to daily briefing
      </button>

      <div className="mt-4 flex items-start justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-2 rounded-md border border-[var(--nyl-blue-500)]/35 bg-[var(--nyl-blue-100)]/55 px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.22em] text-[var(--nyl-blue-800)]">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-[var(--nyl-blue-500)]" />
            Intelligence Analyst + Concierge
          </span>
          <h1
            className="mt-4 font-serif text-[40px] leading-tight tracking-tight text-neutral-900 md:text-[48px]"
            style={{ fontWeight: 400, textWrap: 'balance' }}
          >
            {brief.title}
          </h1>
          <p className="mt-2 text-[12.5px] text-neutral-500">{brief.scheduledLabel}</p>
        </div>
        <div className="hidden text-right md:block">
          <p
            className="font-serif text-[36px] leading-none tracking-tight text-neutral-900"
            style={{ fontWeight: 400 }}
          >
            {brief.durationMin}
          </p>
          <p className="mt-1 text-[10.5px] uppercase tracking-[0.18em] text-neutral-400">min</p>
          <p className="mt-2 text-[10.5px] uppercase tracking-[0.18em] text-neutral-500">{brief.meetingType}</p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border-l-[4px] border-[var(--nyl-blue-500)] bg-white px-6 py-5 shadow-[0_8px_24px_-18px_rgba(0,10,98,0.18)]">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[var(--nyl-blue-600)]">
          Bottom line
        </p>
        <p className="mt-3 text-[14.5px] leading-[1.6] text-neutral-900" style={{ textWrap: 'balance' }}>
          {brief.bottomLine}
        </p>
      </div>

      <Section eyebrow="Client snapshot">
        <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--nyl-blue-100)] text-[13px] font-semibold text-[var(--nyl-blue-800)]">
            {brief.client.initials}
          </span>
          <div>
            <p
              className="font-serif text-[22px] leading-tight tracking-tight text-neutral-900"
              style={{ fontWeight: 400 }}
            >
              {brief.client.name}, {brief.client.age}
            </p>
            <p className="mt-1 text-[12.5px] text-neutral-500">{brief.client.facts.join('  ·  ')}</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <SnapshotPanel
            title="Products held"
            rows={brief.productsHeld.map((r) => ({ label: r.label, value: r.value, warn: r.warn }))}
          />
          <SnapshotPanel
            title="Household snapshot"
            rows={brief.household.map((r) => ({ label: r.label, value: r.value }))}
          />
        </div>
      </Section>

      <Section eyebrow="What needs attention — flagged by system">
        <div className="flex flex-col gap-3">
          {brief.needsAttention.map((n) => (
            <AttentionCard key={n.id} item={n} />
          ))}
        </div>
      </Section>

      <Section eyebrow="Talking points — what to lead with">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">
            Open with what you already know
          </p>
          <ol className="mt-3 flex flex-col gap-3">
            {brief.talkingPoints.map((t, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-[var(--nyl-blue-500)]"
                />
                <div>
                  <p
                    className="font-serif text-[17px] leading-snug tracking-tight text-neutral-900"
                    style={{ fontWeight: 400 }}
                  >
                    {t.heading}
                  </p>
                  <p className="mt-1.5 text-[13px] leading-snug text-neutral-700">{t.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section eyebrow="Handle carefully">
        <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b82a1f]">⚠ Landmines</p>
          <ul className="mt-3 flex flex-col gap-2 text-[13px] leading-snug text-neutral-700">
            {brief.landmines.map((l, i) => (
              <li key={i} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-[#b82a1f]" />
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section eyebrow="One decision to close on">
        <div className="rounded-xl border border-[var(--nyl-green-200)]/70 bg-[var(--nyl-green-200)]/30 p-5">
          <p
            className="flex items-start gap-3 font-serif text-[18px] leading-snug tracking-tight text-neutral-900"
            style={{ fontWeight: 400, textWrap: 'balance' }}
          >
            <span aria-hidden="true" className="mt-1 text-[var(--nyl-green-800)]">
              ✓
            </span>
            <span>{brief.decisionToClose}</span>
          </p>
        </div>
      </Section>
    </div>
  )
}

function SnapshotPanel({ title, rows }: { title: string; rows: { label: string; value: string; warn?: boolean }[] }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">{title}</p>
      <ul className="mt-3 flex flex-col gap-2.5">
        {rows.map((r) => (
          <li key={r.label} className="flex items-baseline justify-between gap-4">
            <span className="text-[13px] text-neutral-700">{r.label}</span>
            <span
              className={[
                'text-right text-[13.5px] font-semibold',
                r.warn ? 'text-[#b82a1f]' : 'text-neutral-900',
              ].join(' ')}
            >
              {r.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function AttentionCard({ item }: { item: PreMeetingBrief['needsAttention'][number] }) {
  const iconBg =
    item.icon === 'fix'
      ? 'bg-[#fee2e2] text-[#b82a1f]'
      : item.icon === 'opp'
        ? 'bg-[var(--nyl-orange-100)] text-[var(--nyl-orange-500)]'
        : 'bg-[var(--nyl-blue-100)] text-[var(--nyl-blue-800)]'
  const iconChar = item.icon === 'fix' ? '!' : item.icon === 'opp' ? '$' : '🎓'
  const badgeBg =
    item.badge.tone === 'urgent'
      ? 'bg-[#fee2e2] text-[#b82a1f]'
      : item.badge.tone === 'opportunity'
        ? 'bg-[var(--nyl-orange-100)] text-[var(--nyl-orange-500)]'
        : 'bg-[var(--nyl-blue-100)] text-[var(--nyl-blue-800)]'
  return (
    <div className="flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-5">
      <span
        aria-hidden="true"
        className={[
          'flex size-9 shrink-0 items-center justify-center rounded-md text-[14px] font-semibold',
          iconBg,
        ].join(' ')}
      >
        {iconChar}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="font-serif text-[19px] leading-snug tracking-tight text-neutral-900"
          style={{ fontWeight: 400, textWrap: 'balance' }}
        >
          {item.title}
        </p>
        <p className="mt-2 text-[13.5px] leading-snug text-neutral-700">{item.body}</p>
      </div>
      <span
        className={[
          'shrink-0 rounded-md px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.18em]',
          badgeBg,
        ].join(' ')}
      >
        {item.badge.label}
      </span>
    </div>
  )
}

/* ============================================================
 * WEEKLY OPS — Concierge persona
 * ============================================================ */

function WeeklyOpsView({ briefing }: { briefing: DailyBriefing }) {
  const openCollab = useAppStore((s) => s.openCollab)
  const stuck = [
    {
      id: 's1',
      name: 'Tom Anderson',
      age: '11 days',
      stage: 'Underwriting · APS missing',
      tone: 'red' as const,
      prompt: "Walk me through Tom Anderson's stall and what's blocking the APS resend.",
    },
    {
      id: 's2',
      name: 'Patricia Lau',
      age: '28 days',
      stage: 'Premium unpaid · UL',
      tone: 'red' as const,
      prompt: 'Help me decide whether to call Patricia Lau or queue an automated payment reminder.',
    },
    {
      id: 's3',
      name: 'Marco Russo',
      age: '6 days',
      stage: 'Beneficiary update queued',
      tone: 'amber' as const,
      prompt: 'Draft a beneficiary-review outreach to Marco Russo about Frances Carter.',
    },
    {
      id: 's4',
      name: 'Derek Okafor',
      age: '4 days',
      stage: 'Discovery — only verbal confirm',
      tone: 'amber' as const,
      prompt: "Get Derek Okafor's discovery meeting confirmed in writing and prep the agenda.",
    },
    {
      id: 's5',
      name: 'Helena Garcia',
      age: '2 days',
      stage: 'Retirement content engagement',
      tone: 'green' as const,
      prompt: 'Open the Helena Garcia holistic chapter — draft the call.',
    },
  ]
  const followUps = [
    { id: 'f1', name: 'Emma Clarke', owed: 'Beneficiary update + 529 follow-through (post annual review)' },
    { id: 'f2', name: 'Julia Park', owed: 'Term expiration outreach · 110 days out' },
    { id: 'f3', name: 'Sam Bennett', owed: 'First-policy fact-find — 7 days since referral' },
    { id: 'f4', name: 'James Holloway', owed: 'Age-band check-in queued for next week' },
  ]
  const upcoming = [
    { day: 'Mon', label: '1 client meeting · admin block · pipeline review' },
    { day: 'Tue', label: '2 client meetings · 1 prospect discovery' },
    { day: 'Wed', label: '1 annual review · 30-min Coach block' },
    { day: 'Thu', label: 'Today — see Daily briefing' },
    { day: 'Fri', label: '2 meetings · newsletter send · EOW wrap' },
  ]
  return (
    <div className="grid grid-cols-12 gap-8 lg:gap-10">
      <div className="col-span-12 lg:col-span-9">
        <span className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-700">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-[var(--nyl-orange-500)]" />
          Concierge mode
        </span>
        <p className="mt-6 text-[12px] uppercase tracking-[0.22em] text-neutral-500">
          Good morning, {briefing.firstName}
        </p>
        <h1
          className="mt-2 font-serif text-[40px] leading-[1.04] tracking-tight text-neutral-900 md:text-[52px]"
          style={{ fontWeight: 400, textWrap: 'balance' }}
        >
          5 things owe you a touch this week. The OS handled 23.
        </h1>
        <p className="mt-3 text-[13.5px] leading-snug text-neutral-600">
          Pipeline health · stuck cases · activity targets · what's queued for the week
        </p>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <StatTile label="Pipeline value · this week" value="$11.4K" sub="FYC in motion" tone="blue" />
          <StatTile label="Activities logged" value="38 / 45" sub="84% of weekly target" tone="green" />
          <StatTile label="Cases stuck >5 days" value="3" sub="2 red · 1 amber" tone="red" />
        </div>

        <SectionEyebrow eyebrow="Stuck — needs your call" />
        <ul className="flex flex-col gap-3">
          {stuck.map((s) => (
            <li
              key={s.id}
              className={[
                'flex items-center justify-between gap-4 rounded-xl border bg-white p-4',
                s.tone === 'red'
                  ? 'border-[#fecaca]'
                  : s.tone === 'amber'
                    ? 'border-[var(--nyl-orange-400)]/50'
                    : 'border-[var(--nyl-green-600)]/40',
              ].join(' ')}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden="true"
                  className={[
                    'inline-block size-2 shrink-0 rounded-full',
                    s.tone === 'red'
                      ? 'bg-[#dc2626]'
                      : s.tone === 'amber'
                        ? 'bg-[var(--nyl-orange-400)]'
                        : 'bg-[var(--nyl-green-600)]',
                  ].join(' ')}
                />
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-neutral-900">{s.name}</p>
                  <p className="text-[12px] text-neutral-500">
                    {s.stage} · {s.age}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => openCollab(s.prompt)}
                className="shrink-0 rounded-md bg-[var(--nyl-blue-500)] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[var(--nyl-blue-600)]"
              >
                Work this
              </button>
            </li>
          ))}
        </ul>

        <SectionEyebrow eyebrow="Follow-ups owed" />
        <ul className="flex flex-col divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {followUps.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-[13.5px] font-medium text-neutral-900">{f.name}</p>
                <p className="mt-0.5 text-[12px] text-neutral-500">{f.owed}</p>
              </div>
              <button
                type="button"
                onClick={() => openCollab(`Draft a follow-up for ${f.name}: ${f.owed}`)}
                className="shrink-0 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-[11px] font-medium text-neutral-800 hover:bg-neutral-50"
              >
                Draft touch
              </button>
            </li>
          ))}
        </ul>
      </div>

      <aside className="col-span-12 lg:col-span-3">
        <div className="flex flex-col gap-6 lg:sticky lg:top-[88px]">
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">
              This week at a glance
            </p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {upcoming.map((u) => (
                <li key={u.day} className="flex gap-3">
                  <span className="w-7 shrink-0 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                    {u.day}
                  </span>
                  <span className="text-[12.5px] leading-snug text-neutral-800">{u.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">
                OS handled this week
              </p>
              <span aria-hidden="true" className="inline-flex size-1.5 rounded-full bg-[var(--nyl-green-600)]" />
            </div>
            <ul className="mt-3 flex flex-col gap-2 text-[12.5px] text-neutral-800">
              <li>• 14 client touches sent (birthdays, anniversaries, policy notes)</li>
              <li>• 6 calendar holds prevented from collisions</li>
              <li>• 3 expiring-license alerts caught early</li>
              <li>• 23 inbox triages routed or auto-replied</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() =>
              openCollab(
                'Give me a Concierge weekly summary I can review in 2 minutes — highlight what slipped and what to prioritize.',
              )
            }
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-[12px] font-medium text-neutral-800 hover:bg-neutral-50"
          >
            Get my 2-minute weekly read
          </button>
        </div>
      </aside>
    </div>
  )
}

/* ============================================================
 * MONTHLY — Strategist persona
 * ============================================================ */

function MonthlyStrategistView({ briefing: _briefing }: { briefing: DailyBriefing }) {
  const openCollab = useAppStore((s) => s.openCollab)
  const compound = [
    { source: 'Existing-household multi-policy', value: '$4,800', share: 38, tone: 'blue' as const },
    { source: 'Annual review conversions', value: '$3,200', share: 25, tone: 'green' as const },
    { source: 'Beneficiary-review opens', value: '$2,400', share: 19, tone: 'purple' as const },
    { source: 'New prospects', value: '$1,800', share: 14, tone: 'orange' as const },
    { source: 'Other', value: '$500', share: 4, tone: 'gray' as const },
  ]
  const movers = [
    { label: 'Permanent life', delta: '+22%', dir: 'up' as const, note: 'Largest single mover' },
    { label: 'Disability income', delta: '+9%', dir: 'up' as const, note: 'New focus this quarter' },
    { label: 'Term', delta: '−4%', dir: 'down' as const, note: 'Expected — book aging into perm' },
    { label: 'Annuities', delta: '+14%', dir: 'up' as const, note: 'Two large cases pulled this in' },
  ]
  return (
    <div className="grid grid-cols-12 gap-8 lg:gap-10">
      <div className="col-span-12 lg:col-span-9">
        <span className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-700">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-[var(--nyl-green-600)]" />
          Strategist mode
        </span>
        <p className="mt-6 text-[12px] uppercase tracking-[0.22em] text-neutral-500">May 2026 · monthly read</p>
        <h1
          className="mt-2 font-serif text-[40px] leading-[1.04] tracking-tight text-neutral-900 md:text-[52px]"
          style={{ fontWeight: 400, textWrap: 'balance' }}
        >
          You're pacing ahead of plan — three weeks left to lock the month.
        </h1>
        <p className="mt-3 text-[13.5px] leading-snug text-neutral-600">
          FYC pacing · cases closed vs. plan · what's compounding · what's sliding
        </p>

        <div className="mt-8 grid grid-cols-4 gap-3">
          <StatTile label="May FYC" value="$11.2K" sub="vs. $10.2K plan" tone="green" />
          <StatTile label="Cases closed" value="7 / 6" sub="117% of plan" tone="green" />
          <StatTile label="Activities" value="142 / 168" sub="85% — recoverable" tone="amber" />
          <StatTile label="Pipeline → close" value="62%" sub="+8 pts vs Apr" tone="blue" />
        </div>

        <SectionEyebrow eyebrow="Where the month is compounding" />
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <ul className="flex flex-col gap-4">
            {compound.map((c) => (
              <li key={c.source}>
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-[13px] text-neutral-900">{c.source}</p>
                  <p className="text-[12.5px] font-medium text-neutral-900">
                    {c.value}
                    <span className="ml-2 text-[11px] text-neutral-500">{c.share}%</span>
                  </p>
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-neutral-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.share}%` }}
                    transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                    className={[
                      'h-full rounded-full',
                      c.tone === 'blue'
                        ? 'bg-[var(--nyl-blue-500)]'
                        : c.tone === 'green'
                          ? 'bg-[var(--nyl-green-600)]'
                          : c.tone === 'purple'
                            ? 'bg-[var(--nyl-purple-700)]'
                            : c.tone === 'orange'
                              ? 'bg-[var(--nyl-orange-500)]'
                              : 'bg-neutral-400',
                    ].join(' ')}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <SectionEyebrow eyebrow="Product-mix movers" />
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {movers.map((m) => (
            <li
              key={m.label}
              className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white p-4"
            >
              <div>
                <p className="text-[13.5px] font-medium text-neutral-900">{m.label}</p>
                <p className="mt-0.5 text-[12px] text-neutral-500">{m.note}</p>
              </div>
              <span
                className={[
                  'shrink-0 rounded-md px-2 py-1 text-[11.5px] font-medium',
                  m.dir === 'up'
                    ? 'bg-[var(--nyl-green-200)]/60 text-[var(--nyl-green-800)]'
                    : 'bg-[var(--nyl-orange-100)]/70 text-[var(--nyl-orange-500)]',
                ].join(' ')}
              >
                {m.delta}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <aside className="col-span-12 lg:col-span-3">
        <div className="flex flex-col gap-6 lg:sticky lg:top-[88px]">
          <div className="rounded-xl bg-[var(--nyl-blue-100)]/45 p-4">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-[var(--nyl-blue-600)]">
              Strategist note
            </p>
            <p className="mt-2 text-[13px] leading-snug text-neutral-800">
              Your strongest month since November. The compounding pattern (multi-policy + annual reviews) is exactly
              the book-shape you set in onboarding. Stay on it.
            </p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">Compare</p>
            <ul className="mt-3 flex flex-col gap-2 text-[12.5px] text-neutral-800">
              <li className="flex justify-between">
                <span>vs. April</span>
                <span className="font-medium">+18% FYC</span>
              </li>
              <li className="flex justify-between">
                <span>vs. May 2025</span>
                <span className="font-medium">+34% FYC</span>
              </li>
              <li className="flex justify-between">
                <span>YTD pace</span>
                <span className="font-medium">76% of $122K</span>
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() =>
              openCollab("Give me the Strategist's month-end memo — what to keep, what to change for June.")
            }
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-[12px] font-medium text-neutral-800 hover:bg-neutral-50"
          >
            Generate month-end memo
          </button>
        </div>
      </aside>
    </div>
  )
}

/* ============================================================
 * QUARTERLY — Strategist + Coach
 * ============================================================ */

function QuarterlyDirectionView({ briefing }: { briefing: DailyBriefing }) {
  const openCollab = useAppStore((s) => s.openCollab)
  const directions = [
    {
      id: 'd1',
      title: 'Hold the line on Holistic openings',
      body: 'Q2 produced 6 holistic conversations — double Q1. This is the practice shape you committed to in onboarding. Keep one as the weekly minimum.',
      tone: 'green' as const,
    },
    {
      id: 'd2',
      title: 'Re-balance toward multi-policy households',
      body: 'You sit at 11 multi-policy households — cohort top quartile is 22. Three referrals from existing households would move your Practice Score by ~6 points.',
      tone: 'blue' as const,
    },
    {
      id: 'd3',
      title: 'Start a center-of-influence',
      body: 'Zero estate-attorney relationships — cohort average is 2. One coffee a month for 90 days closes that gap.',
      tone: 'purple' as const,
    },
  ]
  return (
    <div className="grid grid-cols-12 gap-8 lg:gap-10">
      <div className="col-span-12 lg:col-span-9">
        <span className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-700">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-[var(--nyl-purple-700)]" />
          Strategist + Coach
        </span>
        <p className="mt-6 text-[12px] uppercase tracking-[0.22em] text-neutral-500">
          Q2 2026 · direction read · {briefing.firstName}
        </p>
        <h1
          className="mt-2 font-serif text-[40px] leading-[1.04] tracking-tight text-neutral-900 md:text-[52px]"
          style={{ fontWeight: 400, textWrap: 'balance' }}
        >
          Your practice is shaping the way you said you wanted it to.
        </h1>
        <p className="mt-3 text-[13.5px] leading-snug text-neutral-600">
          Direction · council pace · book composition · the two or three calls that change the year
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <StatTile label="Council pace" value="68%" sub="On track for Q3 lock" tone="blue" />
          <StatTile label="Book composition" value="34% perm" sub="+5 pts vs Q1" tone="green" />
          <StatTile label="Centers of influence" value="0" sub="Cohort avg: 2" tone="amber" />
        </div>

        <SectionEyebrow eyebrow="Direction for next quarter" />
        <div className="flex flex-col gap-3">
          {directions.map((d) => (
            <div
              key={d.id}
              className={[
                'rounded-xl border p-5',
                d.tone === 'green'
                  ? 'border-[var(--nyl-green-600)]/40 bg-[var(--nyl-green-200)]/25'
                  : d.tone === 'blue'
                    ? 'border-[var(--nyl-blue-500)]/30 bg-[var(--nyl-blue-100)]/40'
                    : 'border-[var(--nyl-purple-700)]/30 bg-[rgba(112,40,164,0.06)]',
              ].join(' ')}
            >
              <p
                className="font-serif text-[20px] leading-tight tracking-tight text-neutral-900"
                style={{ fontWeight: 400 }}
              >
                {d.title}
              </p>
              <p className="mt-2 text-[13.5px] leading-snug text-neutral-700">{d.body}</p>
              <button
                type="button"
                onClick={() =>
                  openCollab(
                    `Build a Q3 plan for: ${d.title}. Show me the weekly cadence, prompts I'll get from the OS, and how to measure.`,
                  )
                }
                className="mt-3 rounded-md bg-[var(--nyl-blue-500)] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[var(--nyl-blue-600)]"
              >
                Build the Q3 plan
              </button>
            </div>
          ))}
        </div>
      </div>

      <aside className="col-span-12 lg:col-span-3">
        <div className="flex flex-col gap-6 lg:sticky lg:top-[88px]">
          <div className="rounded-xl bg-[var(--nyl-blue-100)]/45 p-4">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-[var(--nyl-blue-600)]">
              Council pace
            </p>
            <p
              className="mt-2 font-serif text-[34px] leading-none tracking-tight text-neutral-900"
              style={{ fontWeight: 400 }}
            >
              68%
            </p>
            <p className="mt-2 text-[12px] leading-snug text-neutral-700">
              At current pace you lock Council mid-October. Four big cases would pull that into late August.
            </p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">Coach check-in</p>
            <p className="mt-2 text-[12.5px] leading-snug text-neutral-800">
              In onboarding you said: "I want to be the trusted advisor for full households." Q2 actions are consistent
              with that. Don't drift into transactional in Q3.
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}

/* ============================================================
 * ANNUAL / STRATEGIC — Coach persona
 * ============================================================ */

function AnnualCoachView({ briefing }: { briefing: DailyBriefing }) {
  const openCollab = useAppStore((s) => s.openCollab)
  const trajectory = [
    { year: 'Jan', val: 28 },
    { year: 'Feb', val: 34 },
    { year: 'Mar', val: 42 },
    { year: 'Apr', val: 58 },
    { year: 'May', val: 76 },
    { year: 'Jun', val: 82, projected: true },
    { year: 'Jul', val: 90, projected: true },
    { year: 'Aug', val: 100, projected: true },
  ]
  const max = Math.max(...trajectory.map((t) => t.val))
  const changes = [
    { label: 'Avg case size', from: '$1,420', to: '$1,650', tone: 'green' as const },
    { label: 'Close rate (existing)', from: '49%', to: '56%', tone: 'green' as const },
    { label: 'Holistic conversations', from: '2 / qtr', to: '6 / qtr', tone: 'green' as const },
    { label: 'Concierge time saved', from: '—', to: '~7 hrs / wk', tone: 'blue' as const },
  ]
  const levers = [
    {
      title: 'Lock a center of influence by year-end',
      body: 'One estate attorney, one CPA. The math says this is your biggest unlock for 2027.',
      prompt: 'Help me identify and start the conversation with one CPA and one estate attorney this quarter.',
    },
    {
      title: 'Get to 18 multi-policy households',
      body: "You're at 11. 7 more in 18 months is on-pace if you treat every annual review as the trigger.",
      prompt: 'Build me a 12-month plan to get from 11 to 18 multi-policy households.',
    },
    {
      title: 'Re-onboard in Q4',
      body: 'Your practice will look different by then. A fresh onboarding sets the next year on the right shape.',
      prompt: 'Schedule a Q4 re-onboarding for me. What should I think about before I start?',
    },
  ]
  return (
    <div className="grid grid-cols-12 gap-8 lg:gap-10">
      <div className="col-span-12 lg:col-span-9">
        <span className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-700">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-[var(--nyl-green-600)]" />
          Coach mode
        </span>
        <p className="mt-6 text-[12px] uppercase tracking-[0.22em] text-neutral-500">
          2026 · trajectory · {briefing.firstName}
        </p>
        <h1
          className="mt-2 font-serif text-[40px] leading-[1.04] tracking-tight text-neutral-900 md:text-[52px]"
          style={{ fontWeight: 400, textWrap: 'balance' }}
        >
          You're on the curve to your strongest year yet.
        </h1>
        <p className="mt-3 text-[13.5px] leading-snug text-neutral-600">
          Year-to-date trajectory · what's changed since onboarding · levers for next year
        </p>

        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">
                YTD pace to $122K goal
              </p>
              <p
                className="mt-2 font-serif text-[44px] leading-none tracking-tight text-[var(--nyl-blue-500)]"
                style={{ fontWeight: 400 }}
              >
                76%
              </p>
              <p className="mt-1 text-[12px] text-neutral-500">On pace · Aug close projected</p>
            </div>
            <span className="rounded-md bg-[var(--nyl-green-200)]/60 px-2 py-1 text-[11px] font-medium text-[var(--nyl-green-800)]">
              +34% vs. 2025
            </span>
          </div>
          <div className="mt-5 flex items-end gap-2">
            {trajectory.map((t) => (
              <div key={t.year} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={[
                    'w-full rounded-t-md transition-[height]',
                    t.projected ? 'bg-[var(--nyl-blue-500)]/30' : 'bg-[var(--nyl-blue-500)]',
                  ].join(' ')}
                  style={{ height: `${(t.val / max) * 140}px` }}
                />
                <p
                  className={[
                    'text-[10.5px] uppercase tracking-[0.18em]',
                    t.projected ? 'text-neutral-400' : 'text-neutral-600',
                  ].join(' ')}
                >
                  {t.year}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11.5px] italic text-neutral-500">
            Lighter bars projected from current pace and pipeline.
          </p>
        </div>

        <SectionEyebrow eyebrow="What changed since you onboarded" />
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {changes.map((c) => (
            <li key={c.label} className="rounded-xl border border-neutral-200 bg-white p-4">
              <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">{c.label}</p>
              <div className="mt-2 flex items-baseline gap-3">
                <p className="text-[13px] text-neutral-500 line-through decoration-1">{c.from}</p>
                <p className="text-[13px] text-neutral-400">→</p>
                <p
                  className={[
                    'text-[15px] font-medium',
                    c.tone === 'green' ? 'text-[var(--nyl-green-800)]' : 'text-[var(--nyl-blue-600)]',
                  ].join(' ')}
                >
                  {c.to}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <SectionEyebrow eyebrow="Levers for next year" />
        <div className="flex flex-col gap-3">
          {levers.map((l) => (
            <div key={l.title} className="rounded-xl border border-neutral-200 bg-white p-5">
              <p
                className="font-serif text-[20px] leading-tight tracking-tight text-neutral-900"
                style={{ fontWeight: 400 }}
              >
                {l.title}
              </p>
              <p className="mt-2 text-[13.5px] leading-snug text-neutral-700">{l.body}</p>
              <button
                type="button"
                onClick={() => openCollab(l.prompt)}
                className="mt-3 rounded-md bg-[var(--nyl-blue-500)] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[var(--nyl-blue-600)]"
              >
                Work this with the Coach
              </button>
            </div>
          ))}
        </div>
      </div>

      <aside className="col-span-12 lg:col-span-3">
        <div className="flex flex-col gap-6 lg:sticky lg:top-[88px]">
          <div className="rounded-xl bg-[var(--nyl-green-200)]/40 p-4">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-[var(--nyl-green-800)]">
              OS time saved · YTD
            </p>
            <p
              className="mt-2 font-serif text-[34px] leading-none tracking-tight text-neutral-900"
              style={{ fontWeight: 400 }}
            >
              147 hrs
            </p>
            <p className="mt-2 text-[12px] leading-snug text-neutral-700">
              Equivalent to almost four full work weeks back in your year. Used mostly on client touches and prep.
            </p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">Coach note</p>
            <p className="mt-2 text-[12.5px] leading-snug text-neutral-800">
              The shape of your year now matches what you said in onboarding. That's rare — most advisors drift. Hold
              this.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              openCollab(
                'Write me a 1-page year-in-review I can share — the trajectory, the wins, what changed, and the plan for next year.',
              )
            }
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-[12px] font-medium text-neutral-800 hover:bg-neutral-50"
          >
            Generate year-in-review
          </button>
        </div>
      </aside>
    </div>
  )
}

function StatTile({
  label,
  value,
  sub,
  tone,
}: {
  label: string
  value: string
  sub: string
  tone: 'blue' | 'green' | 'red' | 'amber'
}) {
  const sw =
    tone === 'green'
      ? 'bg-[var(--nyl-green-200)]/45 text-[var(--nyl-green-800)]'
      : tone === 'red'
        ? 'bg-[#fee2e2] text-[#b82a1f]'
        : tone === 'amber'
          ? 'bg-[var(--nyl-orange-100)]/70 text-[var(--nyl-orange-500)]'
          : 'bg-[var(--nyl-blue-100)]/55 text-[var(--nyl-blue-600)]'
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">{label}</p>
      <p
        className="mt-2 font-serif text-[28px] leading-none tracking-tight text-neutral-900"
        style={{ fontWeight: 400 }}
      >
        {value}
      </p>
      <span className={['mt-2 inline-block rounded-md px-2 py-0.5 text-[10.5px] font-medium', sw].join(' ')}>
        {sub}
      </span>
    </div>
  )
}

/* Scene-aware launcher suggestions surfaced inside the CollabSpace landing. */

type LauncherSuggestion = {
  id: string
  label: string
  prompt?: string
  canvasId?: string
  freeform?: boolean
}

const COMMON_SUGGESTIONS: LauncherSuggestion[] = [
  {
    id: 'tour',
    label: 'Show me the tour',
    prompt: 'Walk me through the OS — the briefing, the plan, calendar, and how to drag things around.',
  },
]

export function suggestionsFor(scene: string, deepDive: string | null): LauncherSuggestion[] {
  /* Per-client deep dive context — most specific wins. */
  if (deepDive === 'helena-1' || deepDive === 'helena-2') {
    return [
      {
        id: 'a',
        label: 'Draft a warmer version',
        prompt: 'Rewrite the Helena Garcia reconnection draft a touch warmer — still my voice.',
      },
      {
        id: 'b',
        label: 'Run the 90-sec holistic open',
        prompt: 'Give me a 90-second holistic-open script for the Helena call — no rate, no product.',
      },
      {
        id: 'c',
        label: 'Pull household context',
        prompt:
          "Pull Helena Garcia's household profile, last 3 touches, and any open items so I can review before 10:30.",
      },
      ...COMMON_SUGGESTIONS,
    ]
  }
  if (deepDive === 'janet') {
    return [
      {
        id: 'a',
        label: 'Draft the warm outreach',
        prompt:
          'Draft a warm outreach to Janet Henderson about the new coastal household. Coverage conversation, not a flood pitch.',
      },
      {
        id: 'b',
        label: 'Schedule a 20-min review',
        prompt: 'Find a 20-minute slot for Janet Henderson this week — block it and send the invite.',
      },
      {
        id: 'c',
        label: 'Compare old vs new household',
        prompt: "Show me side-by-side: Janet's current coverage modeled against the new coastal household.",
      },
      ...COMMON_SUGGESTIONS,
    ]
  }
  if (deepDive === 'tom-anderson') {
    return [
      {
        id: 'a',
        label: 'Draft the 10-minute call',
        prompt: 'Draft a 10-minute call script for Tom Anderson — empathetic, own the delay, ask for the APS resend.',
      },
      {
        id: 'b',
        label: 'Resend the APS form',
        prompt: 'Re-route the APS form request to Tom Anderson via Sales Central and notify the underwriter.',
      },
      {
        id: 'c',
        label: 'What other cases are at risk?',
        prompt: 'Audit my pipeline for any cases at risk of going NIGO or stalling like Anderson did.',
      },
      ...COMMON_SUGGESTIONS,
    ]
  }
  if (deepDive) {
    /* Generic per-client suggestions. */
    return [
      { id: 'a', label: 'Draft an outreach', prompt: 'Draft a warm outreach for the client whose canvas I have open.' },
      {
        id: 'b',
        label: 'Surface gaps',
        prompt: 'What are the coverage and planning gaps for the client whose canvas I have open?',
      },
      {
        id: 'c',
        label: 'Prep a 15-min agenda',
        prompt: 'Build a 15-minute meeting agenda for the client whose canvas I have open.',
      },
      ...COMMON_SUGGESTIONS,
    ]
  }

  /* Scene context */
  if (scene === 'briefing') {
    return [
      {
        id: 'a',
        label: "What's the one thing today?",
        prompt: 'Tell me the one thing I should not miss today, and why.',
      },
      {
        id: 'b',
        label: 'Rerank my priorities',
        prompt: "Re-rank today's priorities for me based on what changed overnight.",
      },
      {
        id: 'c',
        label: 'Draft my morning outreach',
        prompt: 'Draft the warmest outreach I can send before 10 AM — pick the right client.',
      },
      {
        id: 'd',
        label: 'What changed overnight?',
        prompt: 'Show me only what changed in my book overnight — deltas only.',
      },
      ...COMMON_SUGGESTIONS,
    ]
  }
  if (scene === 'canvas') {
    return [
      {
        id: 'a',
        label: 'Reorganize for today',
        prompt: 'Reorganize my Practice canvas to highlight what I should hit first today.',
      },
      {
        id: 'b',
        label: 'Which tile is the win?',
        prompt: 'Which tile on the Practice canvas has the highest-leverage move right now? Explain.',
      },
      {
        id: 'c',
        label: 'Surface the next 3 opportunities',
        prompt: 'Find me 3 client opportunities that match my plan and stage me into the right canvas.',
      },
      ...COMMON_SUGGESTIONS,
    ]
  }
  if (scene === 'actives' || scene === 'actionboard') {
    return [
      {
        id: 'a',
        label: 'Draft 3 outreach options',
        prompt: 'Pick the 3 warmest clients in my actives and draft an outreach for each — my voice.',
      },
      {
        id: 'b',
        label: 'Who needs me this week?',
        prompt: 'Show me the actives who need a personal touch this week. Why each one.',
      },
      {
        id: 'c',
        label: 'Find a cross-sell',
        prompt: 'Surface the strongest cross-sell opportunity in my actives — show me the math.',
      },
      ...COMMON_SUGGESTIONS,
    ]
  }
  if (scene === 'prospects') {
    return [
      {
        id: 'a',
        label: 'Suggest 3 new prospects',
        prompt: 'Find 3 net-new prospects that match my book shape — and where they came from.',
      },
      {
        id: 'b',
        label: 'Re-engage cold ones',
        prompt: 'Pick 5 prospects who went cold and draft a re-engagement note for each.',
      },
      {
        id: 'c',
        label: 'Build me a 1-week prospect plan',
        prompt: 'Build a 1-week prospecting plan: 5 contacts a day, warmest first, openers included.',
      },
      ...COMMON_SUGGESTIONS,
    ]
  }
  if (scene === 'business') {
    return [
      {
        id: 'a',
        label: 'Rebuild my plan math',
        prompt: 'Walk me through my plan math — show me how to hit my FYC target faster.',
      },
      {
        id: 'b',
        label: 'Tune my brand voice',
        prompt: 'Tune my brand voice — walk me through what to change about how the agent writes for me.',
      },
      {
        id: 'c',
        label: 'Check compliance windows',
        prompt: 'Look across my licenses and CE — what should I act on this month?',
      },
      ...COMMON_SUGGESTIONS,
    ]
  }
  if (scene === 'calendar') {
    return [
      {
        id: 'a',
        label: 'Prep my next meeting',
        prompt: 'Pull up the pre-meeting brief for my next scheduled meeting.',
      },
      {
        id: 'b',
        label: 'Find 3 open slots this week',
        prompt: 'Find me 3 open 30-minute slots this week for a client review.',
      },
      {
        id: 'c',
        label: 'Audit the week',
        prompt: 'Audit my calendar — am I spending time on the right clients vs. my plan?',
      },
      ...COMMON_SUGGESTIONS,
    ]
  }
  /* Default fallback */
  return [
    {
      id: 'a',
      label: 'Pull my biggest opportunity',
      prompt: 'What is the single biggest opportunity in my book right now? Show me.',
    },
    { id: 'b', label: 'Draft an outreach', prompt: 'Pick the right client and draft an outreach to them.' },
    {
      id: 'c',
      label: 'Audit my plan',
      prompt: 'Audit my plan — what is on track, what is slipping, what I should change.',
    },
    ...COMMON_SUGGESTIONS,
  ]
}

export function CollabLauncher() {
  const openCollab = useAppStore((s) => s.openCollab)
  return (
    <button
      type="button"
      onClick={() => openCollab()}
      aria-label="Ask the agent"
      title="Ask the agent · suggestions for this screen"
      className="relative flex size-10 items-center justify-center rounded-full text-white transition-shadow"
      style={{
        background: 'linear-gradient(150deg, #4a7bff 0%, #0468ff 55%, #0044cc 100%)',
        boxShadow:
          '0 0 0 4px rgba(4,104,255,0.12), 0 0 16px 2px rgba(4,104,255,0.35), 0 8px 22px -8px rgba(4,104,255,0.5)',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 28 28" fill="currentColor" aria-hidden="true" className="relative">
        <path d="M12.5759 1.06709C12.992 -0.355698 15.0074 -0.355698 15.4235 1.06709L17.0505 6.63252L22.1374 3.84834C23.4377 3.13651 24.8629 4.56172 24.1511 5.86202L21.3669 10.948L26.9323 12.5759C28.3551 12.992 28.3551 15.0074 26.9323 15.4235L21.3659 17.0505L24.1511 22.1384C24.8628 23.4386 23.4377 24.8639 22.1374 24.1521L17.0505 21.3669L15.4235 26.9323C15.0074 28.3551 12.992 28.3551 12.5759 26.9323L10.948 21.3669L5.86202 24.1521C4.56177 24.8639 3.13668 23.4386 3.84834 22.1384L6.63252 17.0505L1.06709 15.4235C-0.355698 15.0074 -0.355698 12.992 1.06709 12.5759L6.63252 10.948L3.84834 5.86202C3.13651 4.56172 4.56172 3.13651 5.86202 3.84834L10.948 6.63252L12.5759 1.06709Z" />
      </svg>
    </button>
  )
}
