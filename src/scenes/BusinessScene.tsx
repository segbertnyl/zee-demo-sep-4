import { useState } from 'react'
import { motion } from 'motion/react'
import { useAppStore } from '@/state/useAppStore'
import { DestinationTopBar } from '@/scenes/DestinationScene'

const BUSINESS_TABS = [
  { id: 'journey', label: 'My journey' },
  { id: 'goals', label: 'Goals' },
  { id: 'learn', label: 'Learn' },
  { id: 'licenses', label: 'Licenses' },
  { id: 'brand', label: 'Brand' },
]

/* Business — "Your $122K plan." Practice score + opportunity + plans on the left;
 * qualified-appointments + metric strip + client appointments on the right.
 * Ported from agent-os-v3/src/pages/BusinessPage.tsx and adapted to v4's
 * (Tailwind-neutral, openCollab-driven) conventions. */

const SUGGESTED_PLANS = [
  {
    key: 'russo-beneficiary',
    name: 'Marco Russo',
    title: 'Uninsured Beneficiary Outreach',
    body: 'The spouse, Frances Carter, is a listed beneficiary but has no NYL policy. Reach out as a beneficiary review, not a sales call.',
    quote:
      '"As part of your annual review, I noticed Frances isn\'t currently covered. I\'d like to make sure your whole household is protected the way you are."',
    prompt:
      "Draft a beneficiary-review outreach to Marco Russo about Frances Carter — gentle, framed as a household protection check rather than a sales call.",
  },
  {
    key: 'park-adult-children',
    name: 'Julia Park',
    title: 'Adult Child Activation',
    body: "An untapped segment in your book. Julia Park's two children, Aly (23) and Jordan (26), are warm prospects with established trust by proxy. Frame it as a gift the parent is giving, not a referral ask.",
    quote:
      '"Do your kids have coverage yet? I\'d be happy to have a quick conversation with them — they can get covered now while rates are low."',
    prompt:
      "Draft an outreach to Julia Park about getting coverage in place for Aly (23) and Jordan (26) — framed as a gift the parent is giving, not a referral ask.",
  },
]

const CLIENT_APPOINTMENTS: { name: string; reason: string; action: string; prompt: string }[] = [
  {
    name: 'Marco Russo',
    reason: 'Life Watch detected a recent divorce',
    action: 'View outreach draft',
    prompt: "Draft a sensitive, post-divorce check-in to Marco Russo. Beneficiary review, not a sales call.",
  },
  {
    name: 'Julia Park',
    reason: 'Term expiring on September 14',
    action: 'Follow up topics',
    prompt: "Surface the right follow-up topics for Julia Park before her September 14 term expiration.",
  },
  {
    name: 'Chris Cooper',
    reason: 'Annual meeting not scheduled',
    action: 'Schedule a meeting',
    prompt: "Get Chris Cooper's annual meeting scheduled — pull two strong time options and draft the outreach.",
  },
]

export function BusinessScene() {
  const [fyc, setFyc] = useState(122000)
  const [breakdownOpen, setBreakdownOpen] = useState(false)
  const [plansOpen, setPlansOpen] = useState(true)
  const [tab, setTab] = useState('goals')
  const openCollab = useAppStore((s) => s.openCollab)
  const setScene = useAppStore((s) => s.setScene)

  return (
    <motion.section
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-1 flex-col"
    >
      <DestinationTopBar
        eyebrow="Client"
        tabs={BUSINESS_TABS}
        activeTabId={tab}
        onSelectTab={setTab}
        underlineLayoutId="business-tab-underline"
        onCalendarClick={() => setScene('calendar')}
      />
      <main className="w-full px-8 py-10 md:px-12 md:py-12">
        {tab === 'goals' && (
        <>
        {/* Headline */}
        <header className="mb-10 max-w-[820px]">
          <h1
            className="font-serif text-[44px] leading-[1.04] tracking-tight text-neutral-900 md:text-[56px]"
            style={{ fontWeight: 400, textWrap: 'balance' }}
          >
            Your ${formatK(fyc)}K plan.
          </h1>
          <p className="mt-3 text-[14px] leading-[1.55] text-neutral-600">
            Every number is from your history. Change anything and the plan updates.
          </p>
        </header>

        <div className="grid grid-cols-12 gap-5 md:gap-7">
          {/* LEFT — practice score + opportunity + plans */}
          <div className="col-span-12 lg:col-span-6">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              {/* Practice score */}
              <section>
                <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">
                  Practice Score
                </p>
                <div className="mt-3 flex items-baseline gap-2">
                  <p
                    className="font-serif text-[64px] leading-none tracking-tight text-[var(--nyl-blue-500)]"
                    style={{ fontWeight: 400 }}
                  >
                    68
                  </p>
                  <p className="text-[12px] uppercase tracking-[0.18em] text-neutral-500">
                    / 100 · Peer Avg 64
                  </p>
                </div>
                <p className="mt-4 text-[13.5px] leading-[1.55] text-neutral-900">
                  You're 2 above the peer average for an Established practice in NYC.
                </p>
                <p className="mt-2 text-[13.5px] leading-[1.55] text-neutral-600">
                  The biggest lever right now: household penetration. Three referrals from existing
                  households would move the score by ~6 points.
                </p>
              </section>

              <div className="my-6 h-px bg-neutral-200" />

              {/* Opportunity: household penetration */}
              <section>
                <h2 className="font-serif text-[24px] leading-tight tracking-tight text-neutral-900">
                  Opportunity: Household Penetration
                </h2>
                <div className="mt-4 grid grid-cols-12 items-center gap-3">
                  <div className="col-span-6">
                    <p className="font-serif text-[40px] leading-none tracking-tight text-neutral-900">
                      11
                      <span className="ml-2 font-sans text-[12px] uppercase tracking-[0.18em] text-neutral-500">
                        target: 18
                      </span>
                    </p>
                    <p className="mt-2 text-[11.5px] uppercase tracking-[0.18em] text-neutral-500">
                      Multi-policy compounding · 19% impact
                    </p>
                  </div>
                  <div className="col-span-6 flex flex-col items-end gap-1">
                    <Sparkline />
                    <div className="flex items-center gap-2">
                      <span className="text-[10.5px] uppercase tracking-[0.18em] text-neutral-500">
                        12 wks
                      </span>
                      <span className="text-[10.5px] font-medium text-[var(--nyl-orange-500)]">
                        ↓ 28%
                      </span>
                    </div>
                    <div className="mt-1 flex gap-1.5">
                      <Pill tone="orange">61% of target</Pill>
                      <Pill tone="orange">Below median</Pill>
                    </div>
                  </div>
                </div>
              </section>

              {/* Suggested plans */}
              <section className="mt-6">
                <button
                  type="button"
                  onClick={() => setPlansOpen((o) => !o)}
                  className="flex w-full items-center justify-between gap-2 text-left"
                  aria-expanded={plansOpen}
                >
                  <p className="text-[12.5px] font-medium text-neutral-900">Suggested plans</p>
                  <span
                    aria-hidden="true"
                    className={[
                      'text-[12px] text-neutral-500 transition-transform',
                      plansOpen ? 'rotate-180' : '',
                    ].join(' ')}
                  >
                    ▴
                  </span>
                </button>
                {plansOpen && (
                  <ul className="mt-3 flex flex-col gap-3">
                    {SUGGESTED_PLANS.map((p) => (
                      <li key={p.key} className="rounded-xl bg-[var(--nyl-blue-100)]/35 p-4">
                        <div className="flex items-baseline justify-between gap-4">
                          <p className="text-[13px] font-medium text-neutral-900">
                            <span className="font-semibold">{p.name}</span>
                            <span className="ml-2 text-neutral-500">{p.title}</span>
                          </p>
                          <button
                            type="button"
                            onClick={() => openCollab(p.prompt)}
                            className="shrink-0 rounded-md bg-[var(--nyl-blue-500)] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[var(--nyl-blue-600)]"
                          >
                            View outreach draft
                          </button>
                        </div>
                        <p className="mt-2 text-[12.5px] leading-[1.55] text-neutral-700">
                          {p.body}
                        </p>
                        <p className="mt-2 text-[12.5px] italic leading-[1.55] text-neutral-600">
                          {p.quote}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>

          {/* RIGHT — qualified appts + metric strip + client appts + small cards */}
          <div className="col-span-12 flex flex-col gap-5 lg:col-span-6">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">
                    Qualified Appointments Needed
                  </p>
                  <p
                    className="mt-3 font-serif text-[64px] leading-none tracking-tight text-[var(--nyl-blue-500)]"
                    style={{ fontWeight: 400 }}
                  >
                    74
                  </p>
                </div>
                <TrendLine />
              </div>
              <p className="mt-4 text-[13.5px] leading-[1.55] text-neutral-900">
                This means 6 to 7 appointments per month on average.
              </p>
              <p className="mt-1 text-[13.5px] leading-[1.55] text-neutral-600">
                This is an achievable target without new prospecting.
              </p>

              <div className="mt-5 border-t border-neutral-200 pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[13px] font-medium text-neutral-900">Your FYC goal</p>
                    <p className="text-[11.5px] text-neutral-500">You set this</p>
                  </div>
                  <label className="relative">
                    <input
                      type="number"
                      value={fyc}
                      onChange={(e) => setFyc(Number(e.target.value) || 0)}
                      className="w-[140px] rounded-md bg-[var(--nyl-blue-100)]/55 px-3 py-2 text-right font-mono text-[14px] text-neutral-900 outline-none focus:bg-[var(--nyl-blue-100)]"
                      aria-label="FYC goal"
                    />
                  </label>
                </div>
              </div>

              <div className="mt-4 border-t border-neutral-200 pt-3">
                <button
                  type="button"
                  onClick={() => setBreakdownOpen((o) => !o)}
                  className="flex w-full items-center justify-between text-[13px] text-neutral-900"
                  aria-expanded={breakdownOpen}
                >
                  Full breakdown
                  <span
                    aria-hidden="true"
                    className={[
                      'text-[12px] text-neutral-500 transition-transform',
                      breakdownOpen ? 'rotate-180' : '',
                    ].join(' ')}
                  >
                    ▾
                  </span>
                </button>
                {breakdownOpen && (
                  <ul className="mt-3 flex flex-col gap-1.5 text-[12.5px] text-neutral-600">
                    <BreakdownRow k="Avg case value" v="$1,650" />
                    <BreakdownRow k="Close rate · existing" v="56%" />
                    <BreakdownRow k="Cases needed" v="74" />
                    <BreakdownRow k="Months remaining" v="11" />
                    <BreakdownRow k="Implied appointments / mo" v="6.7" />
                  </ul>
                )}
              </div>
            </div>

            {/* 3 metric strip */}
            <div className="grid grid-cols-3 gap-4">
              <MetricCol k="Total AUM" v="$15" pct="75% of goal" />
              <MetricCol k="Monthly Commission" v="$30,125" pct="108% of goal" highlight />
              <MetricCol k="Ledger Balance" v="$840" pct="96% of goal" />
            </div>

            {/* Client appointments + small cards row */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 rounded-2xl bg-[var(--nyl-blue-100)]/45 p-5 lg:col-span-8">
                <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-[var(--nyl-blue-600)]">
                  Client Appointments
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p
                    className="font-serif text-[40px] leading-none tracking-tight text-neutral-900"
                    style={{ fontWeight: 400 }}
                  >
                    6
                  </p>
                  <p className="text-[11.5px] text-neutral-500">/month</p>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <p className="text-[11.5px] text-neutral-700">
                    Qualified only signals-ready clients
                  </p>
                  <p className="text-[11.5px] font-medium text-neutral-900">On target</p>
                  <div className="ml-1 h-1.5 max-w-[160px] flex-1 rounded-full bg-white">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '74%' }}
                      transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                      className="h-full rounded-full bg-[var(--nyl-blue-500)]"
                    />
                  </div>
                </div>

                <ul className="mt-5 flex flex-col gap-2">
                  {CLIENT_APPOINTMENTS.map((c) => (
                    <li
                      key={c.name}
                      className="flex items-center justify-between gap-3 border-t border-white/70 pt-3"
                    >
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-medium text-neutral-900">{c.name}</p>
                        <p className="text-[11.5px] text-neutral-500">{c.reason}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openCollab(c.prompt)}
                        className="shrink-0 rounded-md bg-[var(--nyl-blue-500)] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[var(--nyl-blue-600)]"
                      >
                        {c.action}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* FYC/MONTH + REFERRAL ASKS */}
              <div className="col-span-12 flex flex-col gap-4 lg:col-span-4">
                <div className="rounded-2xl bg-[rgba(112,40,164,0.08)] p-5">
                  <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-[var(--nyl-purple-700)]">
                    FYC / Month
                  </p>
                  <p
                    className="mt-2 font-serif text-[34px] leading-none tracking-tight text-neutral-900"
                    style={{ fontWeight: 400 }}
                  >
                    $10.2K
                    <span className="ml-2 font-sans text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      target
                    </span>
                  </p>
                  <p className="mt-2 text-[11.5px] leading-snug text-neutral-700">
                    Based on 12-month distribution from prior years
                  </p>
                  <p className="mt-3 text-[10.5px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                    Complete
                  </p>
                  <div className="mt-1 h-1 w-full rounded-full bg-white/60">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '64%' }}
                      transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                      className="h-full rounded-full bg-[var(--nyl-purple-700)]"
                    />
                  </div>
                </div>

                <div className="rounded-2xl bg-[var(--nyl-green-200)]/40 p-5">
                  <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-[var(--nyl-green-800)]">
                    Referral Asks
                  </p>
                  <p
                    className="mt-2 font-serif text-[34px] leading-none tracking-tight text-neutral-900"
                    style={{ fontWeight: 400 }}
                  >
                    3
                    <span className="ml-2 font-sans text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      /month
                    </span>
                  </p>
                  <p className="mt-2 text-[11.5px] leading-snug text-neutral-700">
                    Post-close or annual review touchpoints
                  </p>
                  <p className="mt-3 text-[10.5px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                    Complete
                  </p>
                  <div className="mt-1 h-1 w-full rounded-full bg-white/60">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '88%' }}
                      transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                      className="h-full rounded-full bg-[var(--nyl-green-800)]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </>
        )}

        {tab === 'journey' && <JourneyTab openCollab={openCollab} />}
        {tab === 'learn' && <LearnTab openCollab={openCollab} />}
        {tab === 'licenses' && <LicensesTab openCollab={openCollab} />}
        {tab === 'brand' && <BrandTab openCollab={openCollab} />}
      </main>
    </motion.section>
  )
}

/* ----------------------------------- helpers ----------------------------------- */

function formatK(n: number): string {
  return (n / 1000).toFixed(0)
}

function Pill({
  children,
  tone,
}: {
  children: React.ReactNode
  tone: 'orange' | 'green' | 'gray'
}) {
  const cls =
    tone === 'orange'
      ? 'bg-[var(--nyl-orange-100)]/80 text-[var(--nyl-orange-500)]'
      : tone === 'green'
        ? 'bg-[var(--nyl-green-200)]/60 text-[var(--nyl-green-800)]'
        : 'bg-neutral-100 text-neutral-500'
  return (
    <span className={['rounded-md px-2 py-0.5 text-[10px] font-medium', cls].join(' ')}>
      {children}
    </span>
  )
}

function MetricCol({
  k,
  v,
  pct,
  highlight,
}: {
  k: string
  v: string
  pct: string
  highlight?: boolean
}) {
  return (
    <div>
      <p className="text-[12.5px] text-neutral-900">
        {k} <span className="font-medium">{v}</span>
      </p>
      <p
        className={[
          'mt-0.5 text-[11.5px]',
          highlight ? 'text-[var(--nyl-green-800)]' : 'text-[var(--nyl-green-800)]',
        ].join(' ')}
      >
        {pct}
      </p>
    </div>
  )
}

function BreakdownRow({ k, v }: { k: string; v: string }) {
  return (
    <li className="flex items-baseline justify-between">
      <span className="text-[12px] text-neutral-500">{k}</span>
      <span className="font-mono text-[12px] text-neutral-900">{v}</span>
    </li>
  )
}

function Sparkline() {
  return (
    <svg viewBox="0 0 120 36" width="120" height="36" aria-hidden="true">
      <polyline
        points="0,22 10,18 20,24 30,12 40,20 50,10 60,22 70,14 80,28 90,18 100,30 110,16 120,22"
        fill="none"
        stroke="var(--nyl-blue-500)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

function TrendLine() {
  return (
    <svg viewBox="0 0 160 64" width="160" height="64" aria-hidden="true">
      <polyline
        points="0,42 30,46 60,40 90,38 120,32 160,18"
        fill="none"
        stroke="#17181c"
        strokeWidth="1.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="120" cy="32" r="3" fill="#17181c" />
    </svg>
  )
}

/* ============================================================
 * MY JOURNEY — tenure, milestones, the long arc of the practice
 * ============================================================ */

function JourneyTab({ openCollab }: { openCollab: (p?: string) => void }) {
  return (
    <>
      <header className="mb-10 max-w-[820px]">
        <h1
          className="font-serif text-[44px] leading-[1.04] tracking-tight text-neutral-900 md:text-[56px]"
          style={{ fontWeight: 400, textWrap: 'balance' }}
        >
          Six years in. The next two are when it compounds.
        </h1>
        <p className="mt-3 text-[14px] leading-[1.55] text-neutral-600">
          Established practices in your tenure band see their book grow fastest between year 6 and year 8.
          Here is where you stand and what tends to move first.
        </p>
      </header>

      <div className="grid grid-cols-12 gap-5 md:gap-7">
        <div className="col-span-12 lg:col-span-8">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="grid grid-cols-3 gap-6 border-b border-neutral-100 pb-6">
              <BigStat label="Years in business" value="6" sublabel="Established" />
              <BigStat label="Households served" value="118" sublabel="+9 YTD" tone="blue" />
              <BigStat label="Lifetime FYC" value="$612K" sublabel="vs. cohort $480K" tone="green" />
            </div>

            <section className="mt-6">
              <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">
                Milestones
              </p>
              <ol className="mt-4 flex flex-col gap-4">
                <MilestoneRow year="2020" title="Joined New York Life" body="Brooklyn office. First six months: foundational training, NY Life & Health license." />
                <MilestoneRow year="2021" title="Series 6 + 63" body="Opened up mutual funds and 529s — first variable case six weeks later." />
                <MilestoneRow year="2022" title="Council Qualified" body="$72K FYC. First full year above the office median." />
                <MilestoneRow year="2023" title="Series 7" body="Began advisory case work. Average case value rose 38% within the year." />
                <MilestoneRow year="2024" title="Executive Council" body="Top 12% by FYC. Started taking on family-office referrals." active />
                <MilestoneRow year="2025" title="Chairman's Cabinet — on pace" body="$92K FYC YTD. 4 cases away from Cabinet — fully achievable in current Q4." next />
              </ol>
            </section>
          </div>
        </div>

        <div className="col-span-12 flex flex-col gap-4 lg:col-span-4">
          <div className="rounded-2xl bg-[var(--nyl-blue-100)]/45 p-5">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-[var(--nyl-blue-600)]">
              Where you sit in the curve
            </p>
            <p
              className="mt-2 font-serif text-[34px] leading-none tracking-tight text-neutral-900"
              style={{ fontWeight: 400 }}
            >
              Top 12%
            </p>
            <p className="mt-2 text-[12px] leading-snug text-neutral-700">
              By FYC among advisors at year 6 in NYC zone. Cohort growth rate is fastest at year 7 —
              your next 12 months are mathematically your highest-leverage window.
            </p>
          </div>

          <div className="rounded-2xl bg-[rgba(112,40,164,0.08)] p-5">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-[var(--nyl-purple-700)]">
              What compounds next
            </p>
            <ul className="mt-2 flex flex-col gap-2 text-[12.5px] leading-snug text-neutral-800">
              <li>• Multi-policy households (you sit at 11; cohort top quartile is 22).</li>
              <li>• Second-generation conversion — adult children of Cabinet households.</li>
              <li>• Centers of influence — one new estate attorney relationship is worth ~$18K FYC/yr.</li>
            </ul>
            <button
              type="button"
              onClick={() => openCollab('Build a 12-month compounding plan from my journey — focus on multi-policy, gen-2 conversion, and one new center of influence.')}
              className="mt-4 rounded-md bg-[var(--nyl-blue-500)] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[var(--nyl-blue-600)]"
            >
              Draft my 12-month compounding plan
            </button>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">
              Recognition log
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-[12.5px] text-neutral-800">
              <li className="flex justify-between"><span>Council</span><span className="text-neutral-500">2022, '23, '24</span></li>
              <li className="flex justify-between"><span>Executive Council</span><span className="text-neutral-500">2024</span></li>
              <li className="flex justify-between"><span>Centurion</span><span className="text-neutral-500">2023</span></li>
              <li className="flex justify-between"><span>President's Round Table</span><span className="text-neutral-500">2024</span></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

/* ============================================================
 * LEARN — recommended modules, in-flight courses, events
 * ============================================================ */

function LearnTab({ openCollab }: { openCollab: (p?: string) => void }) {
  const recommended = [
    {
      title: 'Beneficiary reviews that find new policies',
      gap: 'Multi-policy penetration (your gap: 7 households)',
      duration: '22 min',
      prompt: "Walk me through a beneficiary-review conversation that opens a multi-policy door without feeling like a pitch.",
    },
    {
      title: 'Estate cases — when to bring in an attorney',
      gap: 'Centers of influence (you have 0; cohort avg: 2)',
      duration: '38 min',
      prompt: "Teach me how to bring an estate attorney into a household conversation — script + when to do it.",
    },
    {
      title: 'Second-generation conversion',
      gap: 'Adult-child activation (12 known children in book)',
      duration: '28 min',
      prompt: "Build me a playbook for second-generation conversion — how to approach adult children of existing clients.",
    },
  ]

  const inFlight = [
    { title: 'Advanced LIRP positioning', progress: 0.65, next: 'Module 4 of 6 · Case study: dual-purpose retirement' },
    { title: 'NY estate planning fundamentals', progress: 0.3, next: 'Module 2 of 8 · Trust structures NY-specific' },
  ]

  const events = [
    { title: 'GO Conference 2026', when: 'May 14–16 · Las Vegas', tag: 'Registered', tone: 'green' as const },
    { title: 'NYC Estate Planning Forum', when: 'March 22 · in person', tag: 'Suggested · 4 CE', tone: 'blue' as const },
    { title: 'Mastering Discovery — live cohort', when: 'Starts April 7 · 5 weeks', tag: 'Suggested', tone: 'purple' as const },
  ]

  return (
    <>
      <header className="mb-10 max-w-[820px]">
        <h1
          className="font-serif text-[44px] leading-[1.04] tracking-tight text-neutral-900 md:text-[56px]"
          style={{ fontWeight: 400, textWrap: 'balance' }}
        >
          Sharpen the practice.
        </h1>
        <p className="mt-3 text-[14px] leading-[1.55] text-neutral-600">
          Modules picked from your gaps — not a generic catalog. Each one maps to a specific
          opportunity in your book.
        </p>
      </header>

      <div className="grid grid-cols-12 gap-5 md:gap-7">
        <div className="col-span-12 lg:col-span-8">
          <section className="rounded-2xl border border-neutral-200 bg-white p-6">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">
              Recommended for you
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {recommended.map((m) => (
                <li key={m.title} className="rounded-xl bg-[var(--nyl-blue-100)]/35 p-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-[14px] font-medium text-neutral-900">{m.title}</p>
                    <span className="shrink-0 text-[11px] text-neutral-500">{m.duration}</span>
                  </div>
                  <p className="mt-1 text-[12.5px] leading-snug text-neutral-700">{m.gap}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => openCollab(m.prompt)}
                      className="rounded-md bg-[var(--nyl-blue-500)] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[var(--nyl-blue-600)]"
                    >
                      Coach me through it
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-[11px] font-medium text-neutral-800 hover:bg-neutral-50"
                    >
                      Start module
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-5 rounded-2xl border border-neutral-200 bg-white p-6">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">
              In flight
            </p>
            <ul className="mt-4 flex flex-col gap-4">
              {inFlight.map((c) => (
                <li key={c.title}>
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-[14px] font-medium text-neutral-900">{c.title}</p>
                    <span className="shrink-0 text-[11px] text-neutral-500">{Math.round(c.progress * 100)}%</span>
                  </div>
                  <p className="mt-1 text-[12px] text-neutral-500">{c.next}</p>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(c.progress * 100)}%` }}
                      transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                      className="h-full rounded-full bg-[var(--nyl-blue-500)]"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="col-span-12 flex flex-col gap-4 lg:col-span-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">
              Upcoming events
            </p>
            <ul className="mt-3 flex flex-col gap-3">
              {events.map((e) => (
                <li key={e.title} className="rounded-lg border border-neutral-100 p-3">
                  <p className="text-[13px] font-medium text-neutral-900">{e.title}</p>
                  <p className="mt-0.5 text-[11.5px] text-neutral-500">{e.when}</p>
                  <span
                    className={[
                      'mt-2 inline-block rounded-md px-2 py-0.5 text-[10px] font-medium',
                      e.tone === 'green'
                        ? 'bg-[var(--nyl-green-200)]/60 text-[var(--nyl-green-800)]'
                        : e.tone === 'purple'
                          ? 'bg-[rgba(112,40,164,0.12)] text-[var(--nyl-purple-700)]'
                          : 'bg-[var(--nyl-blue-100)]/70 text-[var(--nyl-blue-600)]',
                    ].join(' ')}
                  >
                    {e.tag}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-[rgba(112,40,164,0.08)] p-5">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-[var(--nyl-purple-700)]">
              Teach me something
            </p>
            <p className="mt-2 text-[12.5px] leading-snug text-neutral-800">
              Tell the agent what you want to get better at. It will pull the right module, prep a
              roleplay, or build a one-pager from the curriculum.
            </p>
            <button
              type="button"
              onClick={() => openCollab('Teach me something I should know to grow my book this quarter — pick the most useful thing for my situation.')}
              className="mt-4 rounded-md bg-[var(--nyl-blue-500)] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[var(--nyl-blue-600)]"
            >
              Ask the agent
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

/* ============================================================
 * LICENSES — credentials, CE credits, renewals, state coverage
 * ============================================================ */

function LicensesTab({ openCollab }: { openCollab: (p?: string) => void }) {
  const licenses = [
    { name: 'NY Life, Accident & Health', status: 'Active', expires: '2027-04-30', tone: 'green' as const },
    { name: 'FINRA Series 6', status: 'Active', expires: 'Maintained', tone: 'green' as const },
    { name: 'FINRA Series 63', status: 'Active', expires: 'Maintained', tone: 'green' as const },
    { name: 'FINRA Series 7', status: 'Active', expires: 'Maintained', tone: 'green' as const },
    { name: 'FINRA Series 65', status: 'In progress', expires: 'Exam scheduled — June 14', tone: 'blue' as const },
    { name: 'NJ Life, Accident & Health', status: 'Active', expires: '2027-04-30', tone: 'green' as const },
    { name: 'CT Life, Accident & Health', status: 'Pending', expires: 'Application submitted', tone: 'orange' as const },
  ]

  return (
    <>
      <header className="mb-10 max-w-[820px]">
        <h1
          className="font-serif text-[44px] leading-[1.04] tracking-tight text-neutral-900 md:text-[56px]"
          style={{ fontWeight: 400, textWrap: 'balance' }}
        >
          Compliance, current.
        </h1>
        <p className="mt-3 text-[14px] leading-[1.55] text-neutral-600">
          Everything that lets you sell, serve, and travel. The agent watches renewal windows and CE
          credits so nothing surprises you.
        </p>
      </header>

      <div className="grid grid-cols-12 gap-5 md:gap-7">
        <div className="col-span-12 lg:col-span-8">
          <section className="rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="flex items-baseline justify-between">
              <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">
                Active credentials
              </p>
              <p className="text-[11px] text-neutral-500">All good · next renewal Apr 2027</p>
            </div>
            <ul className="mt-4 flex flex-col">
              {licenses.map((l) => (
                <li key={l.name} className="flex items-center justify-between gap-4 border-t border-neutral-100 py-3 first:border-t-0">
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-medium text-neutral-900">{l.name}</p>
                    <p className="text-[11.5px] text-neutral-500">{l.expires}</p>
                  </div>
                  <span
                    className={[
                      'shrink-0 rounded-md px-2 py-0.5 text-[10.5px] font-medium',
                      l.tone === 'green'
                        ? 'bg-[var(--nyl-green-200)]/60 text-[var(--nyl-green-800)]'
                        : l.tone === 'blue'
                          ? 'bg-[var(--nyl-blue-100)]/70 text-[var(--nyl-blue-600)]'
                          : 'bg-[var(--nyl-orange-100)]/80 text-[var(--nyl-orange-500)]',
                    ].join(' ')}
                  >
                    {l.status}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="col-span-12 flex flex-col gap-4 lg:col-span-4">
          <div className="rounded-2xl bg-[var(--nyl-blue-100)]/45 p-5">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-[var(--nyl-blue-600)]">
              CE credits · 2026
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <p
                className="font-serif text-[40px] leading-none tracking-tight text-neutral-900"
                style={{ fontWeight: 400 }}
              >
                14
              </p>
              <p className="text-[12px] text-neutral-500">/ 24 by Dec 31</p>
            </div>
            <div className="mt-3 h-1.5 w-full rounded-full bg-white">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '58%' }}
                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                className="h-full rounded-full bg-[var(--nyl-blue-500)]"
              />
            </div>
            <p className="mt-3 text-[12px] leading-snug text-neutral-700">
              You are on pace. The NYC Estate Planning Forum (March 22) covers 4 more CEs in one
              evening if you want to bank them early.
            </p>
          </div>

          <div className="rounded-2xl bg-[var(--nyl-orange-100)]/60 p-5">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-[var(--nyl-orange-500)]">
              Series 65 — June 14
            </p>
            <p className="mt-2 text-[12.5px] leading-snug text-neutral-800">
              Exam in 11 days. You have 6 prep modules left. Want the agent to schedule a 30-minute
              study block per day until exam day?
            </p>
            <button
              type="button"
              onClick={() => openCollab('Block 30 minutes per day until June 14 for Series 65 study — pull the remaining prep modules into a sequence.')}
              className="mt-3 rounded-md bg-[var(--nyl-blue-500)] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[var(--nyl-blue-600)]"
            >
              Build my study schedule
            </button>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">
              State coverage
            </p>
            <p className="mt-2 text-[12.5px] leading-snug text-neutral-700">
              You are licensed in <span className="font-medium text-neutral-900">NY</span> and{' '}
              <span className="font-medium text-neutral-900">NJ</span>. CT is in flight. 4 households
              in your book have second residences in <span className="font-medium text-neutral-900">FL</span>{' '}
              — a license there would unlock $11K of FYC currently sitting outside your reach.
            </p>
            <button
              type="button"
              onClick={() => openCollab('Start a FL non-resident producer license application — list the steps, costs, and what the agent can prefill for me.')}
              className="mt-3 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-[11px] font-medium text-neutral-800 hover:bg-neutral-50"
            >
              Start FL application
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

/* ============================================================
 * BRAND — voice, channels, content suggestions
 * ============================================================ */

function BrandTab({ openCollab }: { openCollab: (p?: string) => void }) {
  const channels = [
    { name: 'LinkedIn', meta: '847 connections · last post 3 weeks ago', cta: 'Draft my next post', tone: 'blue' as const, prompt: "Draft a LinkedIn post in my voice — thoughtful, conservative, story-first. Pick a recent case study I can talk about without naming the client." },
    { name: 'Newsletter', meta: '342 subscribers · +12 this month · next send Friday', cta: 'Draft this Friday\'s send', tone: 'purple' as const, prompt: "Draft this Friday's newsletter. Topic: what to do in the 30 days after a beneficiary event. 250 words. My voice." },
    { name: 'Referral page', meta: 'nyl.com/marcus-tran · 22 visits this month', cta: 'Refresh the page copy', tone: 'green' as const, prompt: "Refresh my advisor referral page copy. Lean into Established practice, 6 years in, Brooklyn. Keep it short and human." },
  ]

  const ideas = [
    { title: 'A short story about a beneficiary review', hook: 'You closed a multi-policy household last month doing exactly this. The arc writes itself.' },
    { title: 'Two myths about life insurance in your 30s', hook: 'Sam Bennett, Aanya Patel, and Jordan are all in this band. Educate without selling.' },
    { title: 'What a "household plan" actually means', hook: 'Demystify the language. Pull from your onboarding answers about how you describe your work.' },
  ]

  return (
    <>
      <header className="mb-10 max-w-[820px]">
        <h1
          className="font-serif text-[44px] leading-[1.04] tracking-tight text-neutral-900 md:text-[56px]"
          style={{ fontWeight: 400, textWrap: 'balance' }}
        >
          Show up like you mean it.
        </h1>
        <p className="mt-3 text-[14px] leading-[1.55] text-neutral-600">
          Your voice is on file from onboarding. Anything the agent writes — posts, emails, page
          copy — sounds like you, not a template.
        </p>
      </header>

      <div className="grid grid-cols-12 gap-5 md:gap-7">
        <div className="col-span-12 lg:col-span-8">
          <section className="rounded-2xl border border-neutral-200 bg-white p-6">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">
              Channels
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {channels.map((c) => (
                <li key={c.name} className="flex items-center justify-between gap-4 rounded-xl bg-[var(--nyl-blue-100)]/35 p-4">
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-neutral-900">{c.name}</p>
                    <p className="mt-0.5 text-[12px] text-neutral-600">{c.meta}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openCollab(c.prompt)}
                    className="shrink-0 rounded-md bg-[var(--nyl-blue-500)] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[var(--nyl-blue-600)]"
                  >
                    {c.cta}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-5 rounded-2xl border border-neutral-200 bg-white p-6">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">
              Story ideas pulled from your book
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {ideas.map((i) => (
                <li key={i.title} className="rounded-xl border border-neutral-100 p-4">
                  <p className="text-[14px] font-medium text-neutral-900">{i.title}</p>
                  <p className="mt-1 text-[12.5px] leading-snug text-neutral-700">{i.hook}</p>
                  <button
                    type="button"
                    onClick={() => openCollab(`Write a draft of: "${i.title}". My voice. 200 words. No client names.`)}
                    className="mt-3 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-[11px] font-medium text-neutral-800 hover:bg-neutral-50"
                  >
                    Draft this
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="col-span-12 flex flex-col gap-4 lg:col-span-4">
          <div className="rounded-2xl bg-[rgba(112,40,164,0.08)] p-5">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-[var(--nyl-purple-700)]">
              Your voice
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {['Thoughtful', 'Curious', 'Conservative', 'Story-first', 'No jargon'].map((t) => (
                <span key={t} className="rounded-md bg-white px-2 py-1 text-[11px] font-medium text-neutral-800">{t}</span>
              ))}
            </div>
            <p className="mt-3 text-[12px] leading-snug text-neutral-700">
              Pulled from your onboarding answers. Adjust anytime — the agent re-tunes everything it
              writes for you.
            </p>
            <button
              type="button"
              onClick={() => openCollab('Tune my brand voice — walk me through what to change about how the agent writes for me.')}
              className="mt-3 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-[11px] font-medium text-neutral-800 hover:bg-neutral-50"
            >
              Re-tune voice
            </button>
          </div>

          <div className="rounded-2xl bg-[var(--nyl-green-200)]/40 p-5">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-[var(--nyl-green-800)]">
              Visibility this month
            </p>
            <p
              className="mt-2 font-serif text-[34px] leading-none tracking-tight text-neutral-900"
              style={{ fontWeight: 400 }}
            >
              1,284
              <span className="ml-2 font-sans text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                impressions
              </span>
            </p>
            <p className="mt-2 text-[12px] leading-snug text-neutral-700">
              Across LinkedIn + newsletter. Up 41% vs. last month. Two clients mentioned a recent
              post when they walked in.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

function BigStat({ label, value, sublabel, tone }: { label: string; value: string; sublabel: string; tone?: 'blue' | 'green' }) {
  const sub =
    tone === 'blue'
      ? 'text-[var(--nyl-blue-600)]'
      : tone === 'green'
        ? 'text-[var(--nyl-green-800)]'
        : 'text-neutral-500'
  return (
    <div>
      <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">{label}</p>
      <p
        className="mt-2 font-serif text-[40px] leading-none tracking-tight text-neutral-900"
        style={{ fontWeight: 400 }}
      >
        {value}
      </p>
      <p className={['mt-2 text-[11.5px]', sub].join(' ')}>{sublabel}</p>
    </div>
  )
}

function MilestoneRow({ year, title, body, active, next }: { year: string; title: string; body: string; active?: boolean; next?: boolean }) {
  return (
    <li className="grid grid-cols-12 gap-4">
      <div className="col-span-2">
        <p className="text-[11.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">{year}</p>
      </div>
      <div className="col-span-10">
        <div className="flex items-baseline gap-2">
          <p className="text-[14px] font-medium text-neutral-900">{title}</p>
          {active && (
            <span className="rounded-md bg-[var(--nyl-blue-100)]/70 px-1.5 py-0.5 text-[10px] font-medium text-[var(--nyl-blue-600)]">Current</span>
          )}
          {next && (
            <span className="rounded-md bg-[var(--nyl-green-200)]/60 px-1.5 py-0.5 text-[10px] font-medium text-[var(--nyl-green-800)]">In reach</span>
          )}
        </div>
        <p className="mt-0.5 text-[12.5px] leading-snug text-neutral-600">{body}</p>
      </div>
    </li>
  )
}
