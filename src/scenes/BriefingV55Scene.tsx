import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useAppStore } from '@/state/useAppStore'
import { Nyla } from '@/ui/Nyla'

/* v5.5 Briefing — Exploration pt-II Figma.
 *
 * Day view (node 289-19608): light lavender-washed canvas, "Today's top
 * priorities" serif headline, a featured "Needs attention" card with a
 * "Something else…" AI action stack, priority cards with FYC estimates, a
 * right rail (week's progress bars + goal pills + while-you-were-away + at a
 * glance), and a 3-up "Stay on track" grid.
 *
 * My plan view (node 230-63473) keeps its dark-purple gradient hero. */

type Horizon = 'plan' | 'day' | 'week' | 'month' | 'year'

const HORIZONS: { id: Horizon; label: string }[] = [
  { id: 'plan', label: 'My plan' },
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'year', label: 'Year' },
]

const HERO_METRICS_PLAN = [
  { k: 'YTD FYC · 6 MO', v: '$47,200', sub: '56% to EC · On track' },
  { k: 'Projected year-end', v: '$94,400', sub: 'EC to be secured · $9.4K buffer' },
  { k: 'EC secures in', v: 'November', sub: 'at $7,867/mo pace' },
  { k: 'PC gap', v: '−$45,600', sub: 'needs +$4.5K/mo · stretch' },
]

const HERO_COPY = {
  day: {
    eyebrow: "Today's top priorities",
    headline:
      'A couple of quick actions that will set you up for the week — clear the lapse risk, lock two appointments, and close two conversions.',
  },
  plan: {
    eyebrow: 'Your 2026 trajectory',
    headline:
      "You're hitting your Executive Council and FYC targets. Stay on track by maintaining WL policy persistence.",
  },
}

/* My plan body content — per the Exploration pt-II "Plan / My plan" frame
 * (node 230-63473). */
const PLAN_INTRO =
  "This is what your year projected pace is looking like and I'm seeing several gaps to fill. Would you like to see how we can adjust your current pace?"

const PLAN_STATUS_CARDS = [
  { k: 'FYC goal', v: '$32,400', sub: '< $42K minimum', dot: '#1ab382' },
  { k: 'Council credits for EC', v: '$52,400', sub: '< $32K min', dot: '#f68e48', valueColor: '#d97b1f' },
  { k: 'Case rate bonus', v: '35 cases', sub: 'Level 1 · 30', dot: '#1ab382' },
]

const PLAN_STAYING_INTRO =
  "I've looked through your book and found a few opportunities from existing clients for you to get started with. If you close a large case, your monthly target relaxes. If you fall behind, your OS identifies the fastest path to recover."

const PLAN_CONTRIBUTION = [
  { label: 'Contribution to date', value: '$52.4K', amount: 52.4, bg: '#efe3fb', fg: '#3b2360' },
  { label: 'Existing client opportunities', value: '+$10K', amount: 10, bg: '#a76bd9', fg: '#2a1145' },
  { label: 'Unaccounted pipeline', value: '$27.6K', amount: 27.6, bg: '#e08524', fg: '#3d2103' },
]

const PLAN_CALIBRATE_CARDS = [
  { k: 'FYC per month', v: '$4K', sub: 'avg to hit $42K' },
  { k: 'Cases to close', v: '1–2 /mo', sub: 'based on your avg case size' },
  { k: 'Client appointments', v: '7', sub: 'to generate your close rate' },
  { k: 'Prospect contacts', v: '4 /week', sub: 'to fill your appointment pipeline' },
  { k: 'Client reviews', v: '5', sub: 'to protect and deepen the book' },
  { k: 'Referral asks', v: '4', sub: 'your highest-conversion source' },
]

const PLAN_EC_CARDS = [
  { k: 'Gap to close', v: '$37,000', sub: '6 months · 2 cases/mo' },
  { k: 'Expected premium', v: 'avg. $3,200', sub: 'per new case' },
  { k: 'Cases needed', v: '+12 cases', sub: '6 months · 2 cases per mo' },
]

const PLAN_CLOSING =
  "I recommend you focus on new premium protection cases, with each one adding an average of $3,200 in-force premium. You'll need to reach 12 more protection cases across 6 months."

const PLAN_TAGS: { label: string; status?: string; tone?: 'on-track' | 'stretch' }[] = [
  { label: 'FYC Target  $42K', status: 'On target', tone: 'on-track' },
  { label: 'Executive Council', status: 'On target', tone: 'on-track' },
  { label: 'Eagle Status', status: 'Stretch', tone: 'stretch' },
  { label: 'Holistic Advising' },
]

/* ------------------------------- Day data ------------------------------- */

const FEATURED = {
  eyebrow: 'Needs attention before 10AM',
  title: 'Call Sandra Kim today to reactivate her WL policy that is 62 days past due.',
  meta: "Outreach draft ready for review · Don't let this slip to tomorrow",
  cta: 'Draft a message',
}

const MORE_ACTIONS = [
  { label: 'Compose an outreach message', seed: "Compose an outreach message to Sandra Kim about her WL policy that is 62 days past due." },
  { label: 'Identify more opportunities for engagement', seed: 'Identify more opportunities for engagement across my book.' },
  { label: 'Open collaboration space' },
]

type PriorityCard = {
  id: string
  badge: string
  title: string
  metric: { label: string; value: string }
  meta: string[]
}

const PRIORITIES: PriorityCard[] = [
  {
    id: 'thomas',
    badge: 'Book this afternoon',
    title: 'Schedule time to meet with Thomas Reyes this week',
    metric: { label: 'Product showcase', value: 'Est. + $2,400 FYC' },
    meta: ['Discuss a WL conversion for an est. +$3,400 FYC'],
  },
  {
    id: 'laura',
    badge: 'Book this afternoon',
    title: 'Contact Laura Mendez for a new home / uninsured spouse',
    metric: { label: 'Holistic sale', value: 'Est. + $4,800 FYC' },
    meta: ['close #2 · est. $2,800 FYC', 'Home purchase life event', 'Spouse has no coverage', '22 days in window'],
  },
  {
    id: 'marcus',
    badge: 'Carried over from yesterday',
    title: 'NIGO: Marcus Chen needs a corrected form',
    metric: { label: 'Pending sale', value: 'Est. + $1,200 FYC' },
    meta: ['WL app submitted May 28', 'NIGO returned Jun 4', 'Paramedical authorization rejected', '$2,100 FYC at placement risk'],
  },
]

const WEEK_PROGRESS: { label: string; value: string; total: string; pct: number }[] = [
  { label: 'Avg FYC', value: '$2,900', total: '/ $4,000', pct: 72 },
  { label: 'Cases', value: '1', total: '/ 2', pct: 50 },
  { label: 'Client appts', value: '2', total: '/ 2', pct: 100 },
  { label: 'New contacts', value: '1', total: '/ 2', pct: 50 },
]

const GOAL_BADGES: { label: string; status: string; dot: string }[] = [
  { label: 'FYC Target', status: 'On track', dot: '#1ab382' },
  { label: 'Executive Council', status: 'Stretch', dot: '#ff9522' },
  { label: 'Eagle Status', status: 'Stretch', dot: '#ff9522' },
]

const WHILE_AWAY = [
  'Pulled 47 days of activity from your book',
  'Surfaced 3 stalled cases and 2 renewal windows',
  'Prepared 2 annual review packets',
  'Composed 5 outreach emails',
]

const AT_A_GLANCE: {
  time: string
  dur: string
  label: string
  tag: { label: string; tone: 'ready' | 'needsPrep' }
  link: string
}[] = [
  { time: '9:30 AM', dur: '30 MIN', label: 'Emma C. Annual Review', tag: { label: 'Prep ready', tone: 'ready' }, link: 'Open meeting pack' },
  { time: '3:30 PM', dur: '30 MIN', label: 'Emmeline P. Annual Review', tag: { label: 'Need to prep', tone: 'needsPrep' }, link: 'Create meeting pack' },
]

const STAY_ON_TRACK = [
  { eyebrow: 'Protection', title: '1 of 3 cases must be protected' },
  { eyebrow: 'Breadth', title: 'Need 1 new product line for Nautilus' },
  { eyebrow: 'Persistency', title: 'Contact all 3 at-risk clients before June 20' },
]

/* Day-view canvas: lavender bloom from the top-right ellipse in the comp,
 * settling to white before the card stack begins. */
const DAY_CANVAS = [
  'radial-gradient(110% 80% at 82% -28%, rgba(143,103,224,0.30) 0%, rgba(143,103,224,0) 62%)',
  'linear-gradient(180deg, #f4f0fb 0%, #ffffff 460px)',
].join(', ')

export function BriefingV55Scene() {
  const setScene = useAppStore((s) => s.setScene)
  const [horizon, setHorizon] = useState<Horizon>('day')
  const isPlan = horizon === 'plan'

  if (isPlan) {
    return (
      <section className="flex flex-1 flex-col bg-white">
        {/* Nav + hero share one continuous violet gradient (per the Plan comp). */}
        <div style={{ background: 'linear-gradient(135deg, #3f1468 0%, #56207f 48%, #6f2f97 100%)' }}>
          <TopNav dark horizon={horizon} setHorizon={setHorizon} onCalendar={() => setScene('calendar')} />
          <PlanHero />
        </div>
        <main className="grid w-full grid-cols-12 gap-6 px-8 py-10 md:px-12 md:py-12">
          <div className="col-span-12 flex flex-col gap-7 lg:col-span-8">
            <MyPlanBody />
          </div>
          <aside className="col-span-12 flex flex-col gap-9 lg:col-span-4">
            <WhileAway />
            <AtAGlance />
          </aside>
        </main>
      </section>
    )
  }

  return (
    <section className="flex flex-1 flex-col" style={{ background: DAY_CANVAS }}>
      <TopNav horizon={horizon} setHorizon={setHorizon} onCalendar={() => setScene('calendar')} />
      <header className="px-10 pt-14 md:px-16 md:pt-20">
        <Eyebrow>{HERO_COPY.day.eyebrow}</Eyebrow>
        <h1
          className="mt-6 max-w-[1020px] font-serif text-[34px] leading-[1.18] tracking-tight text-[#17181c] md:text-[46px]"
          style={{ fontWeight: 400, textWrap: 'balance' }}
        >
          {HERO_COPY.day.headline}
        </h1>
      </header>
      <main className="grid w-full grid-cols-12 gap-y-10 px-10 pb-16 pt-12 md:px-16 md:pt-14 lg:gap-x-14">
        <div className="col-span-12 flex flex-col gap-4 lg:col-span-8">
          <FeaturedCard />
          <ul className="flex flex-col gap-4">
            {PRIORITIES.map((p) => (
              <PriorityRow key={p.id} data={p} />
            ))}
          </ul>
          <StayOnTrack />
        </div>
        <aside className="col-span-12 flex flex-col gap-10 lg:col-span-4">
          <WeekProgress />
          <WhileAway />
          <AtAGlance />
        </aside>
      </main>
    </section>
  )
}

function Eyebrow({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <p
      className={[
        'text-[11.5px] font-semibold uppercase tracking-[0.2em]',
        muted ? 'text-neutral-500' : 'text-neutral-900',
      ].join(' ')}
    >
      {children}
    </p>
  )
}

/* ----------------------------------------------------------------------------
 * Top nav — light over the day canvas, white-on-violet for My plan
 * -------------------------------------------------------------------------- */
function TopNav({
  horizon,
  setHorizon,
  onCalendar,
  dark,
}: {
  horizon: Horizon
  setHorizon: (h: Horizon) => void
  onCalendar: () => void
  dark?: boolean
}) {
  const inactive = dark ? 'text-white/55 hover:text-white' : 'text-neutral-400 hover:text-neutral-900'
  const active = dark ? 'text-white' : 'text-neutral-900'
  return (
    <div
      className={[
        'relative z-30 flex items-center justify-between gap-6 px-8 py-4 md:px-12',
        dark ? 'text-white' : 'text-neutral-900',
      ].join(' ')}
    >
      <p className="font-serif text-[17px] tracking-tight" style={{ fontWeight: 400 }}>
        {horizon === 'plan' ? 'Plan' : 'Briefing'}
      </p>
      <nav aria-label="Horizon" className="flex items-center gap-1">
        {HORIZONS.map((h, i) => {
          const isActive = h.id === horizon
          return (
            <span key={h.id} className="flex items-center">
              <button
                type="button"
                onClick={() => setHorizon(h.id)}
                className={[
                  'relative px-3 py-2 text-[13px] font-medium transition-colors',
                  isActive ? active : inactive,
                ].join(' ')}
              >
                {h.label}
                {isActive && (
                  <motion.span
                    layoutId="briefing-v55-underline"
                    className={[
                      'absolute -bottom-[1px] left-2 right-2 h-[2px] rounded-full',
                      dark ? 'bg-white' : 'bg-neutral-900',
                    ].join(' ')}
                  />
                )}
              </button>
              {i === 0 && (
                <span aria-hidden="true" className={['mx-2 h-4 w-px', dark ? 'bg-white/25' : 'bg-neutral-300'].join(' ')} />
              )}
            </span>
          )
        })}
        <span aria-hidden="true" className={['mx-2 h-4 w-px', dark ? 'bg-white/25' : 'bg-neutral-300'].join(' ')} />
        <button type="button" onClick={onCalendar} className={['px-3 py-2 text-[13px] font-medium transition-colors', inactive].join(' ')}>
          Calendar
        </button>
      </nav>
      <div className="flex items-center gap-5">
        <button
          type="button"
          className={['hidden text-[12.5px] md:block', dark ? 'text-white/85' : 'text-neutral-800'].join(' ')}
        >
          Rob C: submitted application #3424210
        </button>
        <button type="button" aria-label="Notifications" className="relative">
          <BellGlyph />
          <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[#0468ff]" />
        </button>
        <button
          type="button"
          aria-label="Nyla"
          className={dark ? 'text-white' : 'text-[#0468ff]'}
        >
          <Nyla size={24} variant={dark ? 'on-dark' : 'on-light'} />
        </button>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------------------
 * Featured card — Sandra Kim lapse risk, with the "Something else…" stack
 * -------------------------------------------------------------------------- */
function FeaturedCard() {
  const openCollab = useAppStore((s) => s.openCollab)
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <div className="relative rounded-md border border-neutral-200 bg-white p-6 shadow-[0_18px_40px_-26px_rgba(0,10,98,0.18)] md:p-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c0362c]">
        {FEATURED.eyebrow}
      </p>
      <h2
        className="mt-4 max-w-[26ch] font-serif text-[23px] leading-[1.3] tracking-tight text-neutral-900 md:text-[26px]"
        style={{ fontWeight: 400 }}
      >
        {FEATURED.title}
      </h2>
      <p className="mt-5 text-[13px] text-neutral-600">{FEATURED.meta}</p>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <button
          type="button"
          onClick={() => openCollab(MORE_ACTIONS[0].seed)}
          className="inline-flex items-center gap-2.5 rounded-[4px] bg-[#0468ff] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#0044cc]"
        >
          {FEATURED.cta}
          <ArrowGlyph />
        </button>

        {/* "Something else…" — hovering reveals Nyla action stack
         * (mock shows a multiplayer-style "Y" cursor pinned to the affordance). */}
        <div
          className="relative"
          onMouseEnter={() => setMoreOpen(true)}
          onMouseLeave={() => setMoreOpen(false)}
        >
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className="inline-flex items-center gap-2 text-[14px] font-medium text-[#0468ff]"
          >
            Something else…
            <Nyla size={24} variant="on-light" />
          </button>
          <span
            aria-hidden="true"
            className="absolute -top-5 right-[-14px] grid size-7 place-items-center rounded-full border-2 border-white bg-[#3e6be0] text-[11px] font-semibold text-white shadow-md"
          >
            Y
          </span>

          <AnimatePresence>
            {moreOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute right-0 top-full z-40 mt-2 flex w-max max-w-[320px] flex-col items-start gap-2"
              >
                {MORE_ACTIONS.map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    onClick={() => {
                      setMoreOpen(false)
                      openCollab(a.seed)
                    }}
                    className="rounded-[6px] bg-[#3e6be0] px-5 py-3 text-left text-[14px] font-medium leading-snug text-white shadow-[0_10px_24px_-12px_rgba(20,50,160,0.55)] transition-colors hover:bg-[#3258c4]"
                  >
                    {a.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------------------
 * Priority rows
 * -------------------------------------------------------------------------- */
function PriorityRow({ data }: { data: PriorityCard }) {
  return (
    <li className="rounded-md border border-neutral-200 bg-white px-6 py-5 transition-shadow hover:shadow-[0_12px_30px_-20px_rgba(0,10,98,0.25)]">
      <div className="flex items-start justify-between gap-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#cf7911]">
          {data.badge}
        </p>
        <p className="shrink-0 text-[13px] text-neutral-700">
          {data.metric.label}{' '}
          <span className="font-semibold text-neutral-900">{data.metric.value}</span>
        </p>
      </div>
      <h3
        className="mt-3 font-serif text-[19px] leading-snug tracking-tight text-neutral-900 md:text-[21px]"
        style={{ fontWeight: 400 }}
      >
        {data.title}
      </h3>
      <p className="mt-3.5 text-[12.5px] text-neutral-500">{data.meta.join('  ·  ')}</p>
    </li>
  )
}

/* ----------------------------------------------------------------------------
 * Stay on track
 * -------------------------------------------------------------------------- */
function StayOnTrack() {
  return (
    <section className="mt-6">
      <Eyebrow>Stay on track</Eyebrow>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {STAY_ON_TRACK.map((c) => (
          <div key={c.title} className="rounded-md bg-[#e7f0fa] p-5">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#1566ad]">{c.eyebrow}</p>
            <p className="mt-3 text-[15px] font-medium leading-snug text-[#1d2c4f]">{c.title}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------------------
 * Right rail
 * -------------------------------------------------------------------------- */
function WeekProgress() {
  return (
    <section>
      <Eyebrow>Your week's progress</Eyebrow>
      <div className="mt-6 flex flex-col gap-5">
        {WEEK_PROGRESS.map((row) => (
          <div key={row.label}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-neutral-600">{row.label}</p>
              <p className="text-[13px]">
                <span className="font-semibold text-[#7028a4]">{row.value}</span>{' '}
                <span className="text-neutral-400">{row.total}</span>
              </p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#ece4f5]">
              <div
                className="h-full rounded-full"
                style={{ width: `${row.pct}%`, background: 'linear-gradient(90deg, #5f1d96 0%, #a06ae0 100%)' }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-7 flex flex-col items-start gap-2.5">
        {GOAL_BADGES.map((b) => (
          <span
            key={b.label}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white/60 px-3.5 py-1.5 text-[12px]"
          >
            <span className="font-medium text-[#5b3da8]">{b.label}</span>
            <span aria-hidden="true" className="text-neutral-400">·</span>
            <span className="text-neutral-600">{b.status}</span>
            <span aria-hidden="true" className="inline-block size-2 rounded-full" style={{ background: b.dot }} />
          </span>
        ))}
      </div>
    </section>
  )
}

function WhileAway() {
  return (
    <section>
      <Eyebrow>While you were away</Eyebrow>
      <ul className="mt-5 flex flex-col gap-4">
        {WHILE_AWAY.map((w) => (
          <li key={w}>
            <button type="button" className="text-left text-[14px] leading-[1.6] text-neutral-900">
              {w}{' '}
              <span aria-hidden="true" className="font-medium text-[#0468ff]">›</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function AtAGlance() {
  return (
    <section>
      <Eyebrow>At a glance</Eyebrow>
      <ul className="mt-5 flex flex-col gap-7">
        {AT_A_GLANCE.map((e) => (
          <li key={e.label}>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              {e.time} <span aria-hidden="true" className="text-neutral-400">•</span> {e.dur}
            </p>
            <p className="mt-1.5 text-[15px] text-neutral-900">{e.label}</p>
            <p className="mt-2.5 flex flex-wrap items-center gap-3">
              <span
                className={[
                  'rounded-md border px-2 py-0.5 text-[11.5px] font-medium',
                  e.tag.tone === 'ready'
                    ? 'border-[#bfe8cf] bg-[#eafaf0] text-[#0f7a4a]'
                    : 'border-[#f3cf9e] bg-[#fdf3e3] text-[#b06a10]',
                ].join(' ')}
              >
                {e.tag.label}
              </span>
              <button type="button" className="text-[12.5px] font-medium text-[#0468ff]">
                {e.link} <span aria-hidden="true">›</span>
              </button>
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ----------------------------------------------------------------------------
 * My plan — purple hero (unchanged from the Plan comp)
 * -------------------------------------------------------------------------- */
function PlanHero() {
  return (
    <header
      className="relative overflow-hidden px-10 pb-16 pt-12 text-white md:px-16 md:pb-20 md:pt-14"
    >
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8">
          <p className="text-[11.5px] font-medium uppercase tracking-[0.26em] text-white/70">
            {HERO_COPY.plan.eyebrow}
          </p>
          <h1
            className="mt-5 max-w-[28ch] font-serif text-[36px] leading-[1.14] tracking-tight md:text-[48px]"
            style={{ fontWeight: 400, fontFamily: 'var(--font-serif)', textWrap: 'balance', color: '#a8c5f2' }}
          >
            {HERO_COPY.plan.headline}
          </h1>
        </div>
        <div className="col-span-12 flex flex-wrap items-start justify-end gap-2 lg:col-span-4">
          {PLAN_TAGS.map((t) => (
            <TagPill key={t.label} tone={t.tone} status={t.status}>{t.label}</TagPill>
          ))}
        </div>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4 md:mt-14 md:grid-cols-4 md:gap-6">
        {HERO_METRICS_PLAN.map((m) => (
          <div key={m.k} className="rounded-md border border-white/15 px-5 py-5 md:px-6 md:py-6" style={{ background: 'rgba(255,255,255,0.14)' }}>
            <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-white/65">{m.k}</p>
            <p className="mt-3 font-serif text-[32px] leading-none tracking-tight md:text-[36px]" style={{ fontWeight: 400 }}>{m.v}</p>
            <p className="mt-2 text-[11px] text-white/55">{m.sub}</p>
          </div>
        ))}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-12"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, #fff 100%)' }}
      />
    </header>
  )
}

function TagPill({ children, tone, status }: { children: React.ReactNode; tone?: 'on-track' | 'stretch'; status?: string }) {
  const dot =
    tone === 'on-track' ? '#42de8a' :
    tone === 'stretch' ? '#5aa9ff' :
    'rgba(255,255,255,0.45)'
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-medium text-white"
      style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.55)' }}
    >
      {children}
      {status && <span className="text-white/65">· {status}</span>}
      {tone && <span aria-hidden="true" className="inline-block size-1.5 rounded-full" style={{ background: dot }} />}
    </span>
  )
}

/* ----------------------------------------------------------------------------
 * My Plan — projected pace chart, goal status cards, contribution bar, and the
 * milestone / EC calibration grids (Exploration pt-II node 230-63473).
 * -------------------------------------------------------------------------- */
function MyPlanBody() {
  return (
    <>
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-600">
          Overall average
        </p>
        <p className="mt-5 max-w-[64ch] text-[16px] leading-[1.6] text-neutral-800">{PLAN_INTRO}</p>
        <PaceChart />
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {PLAN_STATUS_CARDS.map((c) => (
            <div key={c.k} className="rounded-md border border-neutral-200 bg-white p-5">
              <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">{c.k}</p>
              <p
                className="mt-3 font-serif text-[28px] leading-none tracking-tight"
                style={{ fontWeight: 400, color: c.valueColor ?? '#17181c' }}
              >
                {c.v}
              </p>
              <p className="mt-2.5 flex items-center justify-between gap-3 text-[12px] text-neutral-500">
                {c.sub}
                <span aria-hidden="true" className="inline-block size-2 shrink-0 rounded-full" style={{ background: c.dot }} />
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-600">
          Staying on track
        </p>
        <p className="mt-5 max-w-[64ch] text-[16px] leading-[1.6] text-neutral-800">{PLAN_STAYING_INTRO}</p>
        <ContributionBar />

        <h3 className="mt-12 text-[16px] font-medium text-neutral-900">Calibrating your milestones and pipeline</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {PLAN_CALIBRATE_CARDS.map((c) => (
            <PlanMetricCard key={c.k} data={c} />
          ))}
        </div>

        <h3 className="mt-10 text-[16px] font-medium text-neutral-900">Get on track to reach Executive Council</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {PLAN_EC_CARDS.map((c) => (
            <PlanMetricCard key={c.k} data={c} />
          ))}
        </div>

        <p className="mt-10 max-w-[64ch] text-[16px] leading-[1.6] text-neutral-800">{PLAN_CLOSING}</p>
      </section>
    </>
  )
}

function PlanMetricCard({ data }: { data: { k: string; v: string; sub: string } }) {
  return (
    <div className="rounded-md border border-neutral-200 bg-white p-5 shadow-[0_10px_28px_-22px_rgba(0,10,98,0.18)]">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">{data.k}</p>
      <p className="mt-3 font-serif text-[28px] leading-none tracking-tight text-[#6d28aa]" style={{ fontWeight: 400 }}>
        {data.v}
      </p>
      <p className="mt-2.5 text-[12px] text-neutral-500">{data.sub}</p>
    </div>
  )
}

function ContributionBar() {
  const total = PLAN_CONTRIBUTION.reduce((s, seg) => s + seg.amount, 0)
  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-5 text-[12px] text-neutral-700">
        {PLAN_CONTRIBUTION.map((seg) => (
          <span key={seg.label} className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="inline-block size-3 rounded-[3px]" style={{ background: seg.bg }} />
            {seg.label}
          </span>
        ))}
      </div>
      <div className="mt-3 flex h-[60px] w-full overflow-hidden">
        {PLAN_CONTRIBUTION.map((seg) => (
          <div
            key={seg.label}
            className="flex items-center justify-end px-4 text-[13.5px] font-medium"
            style={{ width: `${(seg.amount / total) * 100}%`, background: seg.bg, color: seg.fg }}
          >
            {seg.value}
          </div>
        ))}
      </div>
    </div>
  )
}

function PaceChart() {
  /* Fiscal-year pace chart (July → June, today = Dec 16 at x≈330).
   * Y scale: $0 → y 240, $100K → y 40 ($1K = 2px). */
  const y = (v: number) => 240 - v * 2
  const LEGEND = [
    { label: 'Actual · $52.4K', color: '#9ca3af' },
    { label: 'Current pace', color: '#9a6ee8' },
    { label: 'FYC goal · $42K', color: '#b79df0', dotted: true },
    { label: 'Needed pace for EC · $37.6K gap', color: '#4a7dff' },
    { label: 'FYC goal · $90K', color: '#9db9ff', dotted: true },
  ]
  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-neutral-600">
        {LEGEND.map((l) => (
          <span key={l.label} className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block h-0 w-5"
              style={{ borderTop: l.dotted ? `2.5px dotted ${l.color}` : `2.5px solid ${l.color}` }}
            />
            {l.label}
          </span>
        ))}
      </div>
      <svg viewBox="0 0 720 264" className="mt-4 w-full" aria-hidden="true">
        {/* month gridlines */}
        {Array.from({ length: 13 }, (_, i) => (
          <line key={i} x1={i * 60} y1="32" x2={i * 60} y2="240" stroke="#eceef1" strokeWidth="1" />
        ))}
        {/* $100K / $50K reference lines */}
        <line x1="0" y1={y(100)} x2="720" y2={y(100)} stroke="#d7dadf" strokeDasharray="2 4" strokeWidth="1" />
        <line x1="0" y1={y(50)} x2="720" y2={y(50)} stroke="#d7dadf" strokeDasharray="2 4" strokeWidth="1" />
        <text x="714" y={y(100) - 6} textAnchor="end" fill="#64748b" fontSize="11">$100K</text>
        <text x="6" y={y(50) - 6} textAnchor="start" fill="#64748b" fontSize="11">$50K</text>
        {/* FYC goal dotted lines — $90K (blue) and $42K (purple) */}
        <line x1="0" y1={y(90)} x2="720" y2={y(90)} stroke="#9db9ff" strokeDasharray="2 5" strokeWidth="2" />
        <line x1="0" y1={y(42)} x2="720" y2={y(42)} stroke="#b79df0" strokeDasharray="2 5" strokeWidth="2" />
        {/* today marker */}
        <line x1="330" y1="20" x2="330" y2="240" stroke="#17181c" strokeWidth="1.2" />
        <text x="330" y="12" textAnchor="middle" fill="#17181c" fontSize="11.5" fontWeight="600">Today, Dec 16</text>
        {/* actual — July through today */}
        <path
          d={`M 0 ${y(40)} L 60 ${y(42)} L 120 ${y(41)} L 180 ${y(45)} L 240 ${y(44)} L 300 ${y(49)} L 330 ${y(52.4)}`}
          fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
        />
        {/* current pace — projects gently */}
        <path
          d={`M 330 ${y(52.4)} L 450 ${y(54)} L 570 ${y(55.5)} L 720 ${y(56.5)}`}
          fill="none" stroke="#9a6ee8" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
        />
        {/* needed pace for EC — climbs to the $90K goal */}
        <path
          d={`M 330 ${y(52.4)} L 420 ${y(60)} L 480 ${y(72)} L 560 ${y(82)} L 640 ${y(87)} L 720 ${y(90)}`}
          fill="none" stroke="#4a7dff" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
        />
        {/* today dot */}
        <circle cx="330" cy={y(52.4)} r="8" fill="#9a6ee8" opacity="0.35" />
        <circle cx="330" cy={y(52.4)} r="4.5" fill="#7b3aaa" />
        {/* x-axis labels */}
        <text x="4" y="258" textAnchor="start" fill="#64748b" fontSize="11">July</text>
        <text x="240" y="258" textAnchor="middle" fill="#64748b" fontSize="11">Nov</text>
        <text x="480" y="258" textAnchor="middle" fill="#64748b" fontSize="11">Mar</text>
        <text x="716" y="258" textAnchor="end" fill="#64748b" fontSize="11">Jun</text>
      </svg>
    </div>
  )
}

/* ============================== Glyphs ============================== */
function ArrowGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 8 H13" />
      <path d="M9 4 L13 8 L9 12" />
    </svg>
  )
}
function BellGlyph() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 9 a6 6 0 1 0 -12 0 c0 6 -2 7 -2 7 h16 s-2 -1 -2 -7" />
      <path d="M10.3 20 a2 2 0 0 0 3.4 0" />
    </svg>
  )
}
