import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { MetricTile } from '@/ui/MetricTile'

/* v5.5 Plan — the standalone "Plan" page (Exploration pt-II node 289-7833).
 *
 * Full-bleed purple hero ("Your trajectory" + goal status chips + "Adjust your
 * plan" link), then a white body in two columns:
 *   main  — At a glance (projected-pace line chart + Monthly progress tiles),
 *           Staying on track (contribution bar, EC catch-up cards, and the
 *           "Your progress" Dec→May case grid)
 *   right — "2026 Goals" lavender stat cards
 * Copy, hex values, and proportions follow the Figma design context. */

const HOUSE_EASE = [0.22, 0.65, 0.05, 1] as const

/* Hero gradient per the Figma Bkg — deep #391155 core easing to brand purple
 * #4d1773, with a faint warm rgba(255,194,128,.1) bloom over the headline. */
const HERO_BG = [
  'radial-gradient(55% 75% at 42% 45%, rgba(255,194,128,0.10) 0%, rgba(255,194,128,0) 70%)',
  'radial-gradient(150% 230% at 29% 35%, #391155 14%, #4d1773 100%)',
].join(', ')

const HERO_HEADLINE =
  'You’re hitting your Executive Council and FYC targets. Stay on track by maintaining WL policy persistence.'

const HERO_CHIPS: { label: string; value?: string; status: string; dot?: string }[] = [
  { label: 'FYC target', value: '$42K', status: 'On track', dot: '#42de8a' },
  { label: 'Executive Council', status: 'Stretch', dot: '#ffb054' },
  { label: 'Eagle Status', status: 'Stretch', dot: '#ffb054' },
  { label: 'Holistic Advising', status: 'Active' },
]

const GLANCE_INTRO =
  'This is what your year projected pace is looking like and I’m seeing several gaps to fill. Would you like to see how we can adjust your current pace?'

const MONTHLY_TILES = [
  { k: 'FYC per month', v: '$4K', sub: 'avg to hit $42K' },
  { k: 'Cases to close', v: '1–2 /mo', sub: 'based on your avg case size' },
  { k: 'Client appointments', v: '7', sub: 'to generate your close rate' },
  { k: 'Prospect contacts', v: '16 /mo', sub: 'to fill your appointment pipeline' }, // [sic] per Figma copy
  { k: 'Client reviews', v: '5 /mo', sub: 'to protect and deepen the book' },
  { k: 'Referral asks', v: '4 /mo', sub: 'your highest-conversion source' },
]

const STAYING_INTRO =
  'I’ve looked through your book and found a few opportunities from existing clients for you to get started with. If you close a large case, your monthly target relaxes. If you fall behind, your OS identifies the fastest path to recover.'

/* Segment widths are the Figma pixel splits of the 858px bar. */
const CONTRIBUTION = [
  { label: 'Contribution to date', value: '$52.4K', w: 339, bg: '#f4e6ff' },
  { label: 'Existing client opportunities', value: '+$10K', w: 105, bg: '#bc79ec' },
  { label: 'Unaccounted pipeline', value: '$27.6K', w: 414, bg: '#f2840d' },
]

const EC_INTRO =
  'I recommend you focus on new premium protection cases, which each one adding an average of $3,200 in-force premium. You’ll need to reach 12 more protection cases across 6 months.'

const EC_CARDS = [
  { k: 'Gap to close', v: '$37,000', sub: '6 months  ·  2 cases/mo' },
  { k: 'Expected premium', v: 'avg. $3,200', sub: 'per new case' },
  { k: 'Cases needed', v: '+12 cases', sub: '6 months  ·  2 cases per mo' },
]

const PROGRESS_MONTHS = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']

const PROGRESS_ROWS: ({ name: string; amount: string } | null)[][] = [
  [{ name: 'Thomas Reyes', amount: '$3,400' }, { name: 'Emma Shore', amount: '$2,500' }, null, null, null, null],
  [{ name: 'Julia Mills', amount: '$3,800' }, null, null, null, null, null],
]

const GOALS_2026: { k: string; status?: string; dot?: string; v: string; sub: string }[] = [
  { k: 'FYC target', status: 'On track', dot: '#1ab382', v: '$47,200', sub: '< $42K minimum · 56% to EC' },
  { k: 'Projected year-end', status: 'On track', dot: '#1ab382', v: '$94,400', sub: 'EC to be secured · $9.4K buffer' },
  { k: 'EC credits', status: 'Stretch', dot: '#ff9522', v: '$52,400', sub: '< $32K min' },
  { k: 'PC gap', status: 'Stretch', dot: '#ff9522', v: '−$45,600', sub: 'needs +$4.5K/mo · stretch' },
  { k: 'Secure council level by', v: 'November', sub: 'at $7,867/mo pace' },
  { k: 'Case Rate Bonus', status: 'Stretch', dot: '#ff9522', v: '15 cases', sub: 'Level 1 · 30' },
]

export function PlanScene() {
  return (
    <section className="flex flex-1 flex-col overflow-y-auto bg-white">
      <Hero />
      <main className="mx-auto flex w-full max-w-[1280px] gap-10 px-10 pb-20 pt-12 md:px-14">
        <div className="flex min-w-0 flex-1 flex-col gap-14">
          <AtAGlance />
          <MonthlyProgress />
          <StayingOnTrack />
        </div>
        <aside className="hidden w-[320px] shrink-0 lg:block">
          <GoalsRail />
        </aside>
      </main>
    </section>
  )
}

/* ----------------------------------------------------------------------------
 * Hero
 * -------------------------------------------------------------------------- */

function Hero() {
  return (
    <header className="relative overflow-hidden text-white" style={{ background: HERO_BG }}>
      {/* Decorative Bkg ellipses → static soft radial glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute"
          style={{
            left: '-14%',
            bottom: '-60%',
            width: '72%',
            height: '120%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 50%, rgba(150,92,196,0.38) 0%, rgba(150,92,196,0) 65%)',
            filter: 'blur(52px)',
          }}
        />
        <div
          className="absolute"
          style={{
            right: '-10%',
            top: '-34%',
            width: '54%',
            height: '85%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 50%, rgba(40,14,68,0.55) 0%, rgba(40,14,68,0) 62%)',
            filter: 'blur(46px)',
          }}
        />
      </div>

      <div className="relative px-10 pt-5 md:px-14">
        <p className="font-serif text-[17px] tracking-tight" style={{ fontWeight: 400 }}>
          Plan
        </p>
      </div>

      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-10 pb-14 pt-14 md:flex-row md:items-stretch md:justify-between md:px-14 md:pb-16 md:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: HOUSE_EASE }}
          className="max-w-[741px]"
        >
          <p className="text-[14px] font-medium uppercase leading-[26px] tracking-[2px] text-white">Your trajectory</p>
          <h1
            className="mt-6 font-serif text-[34px] leading-[1.16] tracking-[-0.3px] md:text-[42px] md:leading-[48px]"
            style={{ fontWeight: 400, color: '#99c8ff', textWrap: 'balance' }}
          >
            {HERO_HEADLINE}
          </h1>
        </motion.div>

        <div className="flex flex-col items-end justify-between gap-10 md:pt-8">
          <div className="flex flex-col items-end gap-2">
            {HERO_CHIPS.map((c, i) => (
              <motion.span
                key={c.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: HOUSE_EASE }}
                className="inline-flex items-center gap-2 rounded-[6px] border border-[#deb6fb] py-[7px] pl-[13px] pr-[17px] text-[14px] leading-[16px]"
              >
                <span className="font-medium capitalize text-[#eaccff]">{c.label}</span>
                {c.value && <span className="text-[#eaccff]">{c.value}</span>}
                <span aria-hidden="true" className="size-[2px] rounded-full bg-[#dcd9d5]" />
                <span className="text-[#dcd9d5]">{c.status}</span>
                {c.dot && <span aria-hidden="true" className="size-2 rounded-full" style={{ background: c.dot }} />}
              </motion.span>
            ))}
          </div>

          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.55, ease: HOUSE_EASE }}
            className="inline-flex items-center gap-2.5 text-[14px] italic leading-[20px] tracking-[0.2px] text-white"
          >
            <span>
              Something change? <span className="underline underline-offset-2">Adjust your plan</span>
            </span>
            <PencilGlyph />
          </motion.button>
        </div>
      </div>
    </header>
  )
}

/* ----------------------------------------------------------------------------
 * At a glance — narrative + projected-pace chart
 * -------------------------------------------------------------------------- */

function AtAGlance() {
  return (
    <Reveal>
      <SectionEyebrow>At a glance</SectionEyebrow>
      <p className="mt-7 text-[18px] leading-[26px] tracking-[0.3px] text-[#17181c]">{GLANCE_INTRO}</p>
      <PaceChart />
    </Reveal>
  )
}

/* Chart geometry — fiscal year July → Jun across 858px; $1K = 1.28px,
 * $0 at y=164, $100K at y=36. Today (Dec 16) sits at t≈0.46. */
const CW = 858
const CH = 196
const cy = (v: number) => 164 - v * 1.28
const TODAY_X = 395

const ACTUAL_PTS: [number, number][] = [
  [0, 40],
  [71.5, 42.5],
  [143, 41],
  [214.5, 45.5],
  [286, 44],
  [357.5, 48.5],
  [TODAY_X, 52.4],
]
const CURRENT_PTS: [number, number][] = [
  [TODAY_X, 52.4],
  [500, 53],
  [620, 54.5],
  [740, 55],
  [858, 55.5],
]
const NEEDED_PTS: [number, number][] = [
  [TODAY_X, 52.4],
  [470, 57],
  [540, 67],
  [640, 75],
  [740, 82],
  [858, 88],
]

const toPath = (pts: [number, number][]) => pts.map(([x, v], i) => `${i === 0 ? 'M' : 'L'} ${x} ${cy(v)}`).join(' ')

const CHART_LEGEND = [
  { label: 'Actual · $52.4K', color: '#9b9997' },
  { label: 'Current pace', color: '#bc79ec' },
  { label: 'FYC goal · $42K', color: '#bc79ec', dotted: true },
  { label: 'Needed pace for EC · $37.6K gap', color: '#66a8ff' },
  { label: 'FYC goal · $90K', color: '#66a8ff', dotted: true },
]

function PaceChart() {
  return (
    <div className="mt-7">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {CHART_LEGEND.map((l) => (
          <span
            key={l.label}
            className="inline-flex items-center gap-2 text-[12px] leading-[16px] tracking-[0.2px] text-[#474952]"
          >
            <span
              aria-hidden="true"
              className="inline-block h-0 w-4"
              style={{ borderTop: `3px ${l.dotted ? 'dotted' : 'solid'} ${l.color}` }}
            />
            {l.label}
          </span>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${CW} ${CH}`}
        className="mt-6 w-full"
        role="img"
        aria-label="Projected pace, July through June"
      >
        {/* month gridlines */}
        {Array.from({ length: 13 }, (_, i) => (
          <line key={i} x1={i * 71.5} y1="14" x2={i * 71.5} y2="164" stroke="#efedf2" strokeWidth="1" />
        ))}
        {/* $100K / $50K reference */}
        <line x1="0" y1={cy(100)} x2={CW} y2={cy(100)} stroke="#e8e6e4" strokeWidth="1" />
        <line x1="0" y1={cy(50)} x2={CW} y2={cy(50)} stroke="#e8e6e4" strokeWidth="1" />
        <text x="7" y={cy(100) - 5} fill="#76757a" opacity="0.6" fontSize="12">
          $100K
        </text>
        <text x="7" y={cy(50) - 5} fill="#76757a" opacity="0.6" fontSize="12">
          $50K
        </text>

        {/* FYC goal dotted lines — $90K (blue) / $42K (purple) */}
        <motion.line
          x1="0"
          y1={cy(90)}
          x2={CW}
          y2={cy(90)}
          stroke="#66a8ff"
          strokeWidth="2"
          strokeDasharray="2 5"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.7, ease: HOUSE_EASE }}
        />
        <motion.line
          x1="0"
          y1={cy(42)}
          x2={CW}
          y2={cy(42)}
          stroke="#bc79ec"
          strokeWidth="2"
          strokeDasharray="2 5"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.7, ease: HOUSE_EASE }}
        />

        {/* today marker */}
        <line x1={TODAY_X} y1="18" x2={TODAY_X} y2="164" stroke="#17181c" strokeWidth="1.2" />
        <text x={TODAY_X} y="10" textAnchor="middle" fill="#17181c" fontSize="12" fontWeight="600">
          Today, Dec 16
        </text>

        {/* series — drawn in with pathLength */}
        <motion.path
          d={toPath(ACTUAL_PTS)}
          fill="none"
          stroke="#9b9997"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: HOUSE_EASE }}
        />
        <motion.path
          d={toPath(CURRENT_PTS)}
          fill="none"
          stroke="#bc79ec"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.85, ease: HOUSE_EASE }}
        />
        <motion.path
          d={toPath(NEEDED_PTS)}
          fill="none"
          stroke="#66a8ff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.85, ease: HOUSE_EASE }}
        />

        {/* highlighted point where actual meets today */}
        <motion.g
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.9, ease: HOUSE_EASE }}
          style={{ transformOrigin: `${TODAY_X}px ${cy(52.4)}px` }}
        >
          <circle cx={TODAY_X} cy={cy(52.4)} r="11" fill="#bc79ec" opacity="0.22" />
          <g transform={`translate(${TODAY_X} ${cy(52.4)}) rotate(45)`}>
            <rect x="-4" y="-4" width="8" height="8" fill="#7028a4" />
          </g>
        </motion.g>

        {/* x-axis */}
        <text x="2" y="188" fill="#76757a" opacity="0.6" fontSize="12">
          July
        </text>
        <text x={4 * 71.5} y="188" textAnchor="middle" fill="#76757a" opacity="0.6" fontSize="12">
          Nov
        </text>
        <text x={8 * 71.5} y="188" textAnchor="middle" fill="#76757a" opacity="0.6" fontSize="12">
          Mar
        </text>
        <text x={CW - 2} y="188" textAnchor="end" fill="#76757a" opacity="0.6" fontSize="12">
          Jun
        </text>
      </svg>
    </div>
  )
}

/* ----------------------------------------------------------------------------
 * Monthly progress tiles
 * -------------------------------------------------------------------------- */

function MonthlyProgress() {
  return (
    <Reveal>
      <SerifHeading>Monthly progress</SerifHeading>
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {MONTHLY_TILES.map((t, i) => (
          <MetricTile key={t.k} label={t.k} value={t.v} sub={t.sub} delay={i * 0.06} />
        ))}
      </div>
    </Reveal>
  )
}

/* ----------------------------------------------------------------------------
 * Staying on track — contribution bar, EC catch-up, progress grid
 * -------------------------------------------------------------------------- */

function StayingOnTrack() {
  const total = CONTRIBUTION.reduce((s, seg) => s + seg.w, 0)
  return (
    <div className="flex flex-col gap-8">
      <Reveal>
        <SectionEyebrow>Staying on track</SectionEyebrow>
        <p className="mt-6 text-[18px] leading-[26px] tracking-[0.3px] text-[#17181c]">{STAYING_INTRO}</p>

        <div className="mt-6 flex flex-wrap items-center gap-6">
          {CONTRIBUTION.map((seg) => (
            <span
              key={seg.label}
              className="inline-flex items-center gap-2 text-[12px] leading-[16px] tracking-[0.2px] text-[#474952]"
            >
              <span aria-hidden="true" className="inline-block size-4 rounded-[1px]" style={{ background: seg.bg }} />
              {seg.label}
            </span>
          ))}
        </div>
        <div className="mt-6 flex h-[57px] w-full overflow-hidden">
          {CONTRIBUTION.map((seg, i) => (
            <motion.div
              key={seg.label}
              initial={{ width: 0 }}
              whileInView={{ width: `${(seg.w / total) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: 0.15 + i * 0.12, ease: HOUSE_EASE }}
              className="flex items-center justify-end overflow-hidden"
              style={{ background: seg.bg }}
            >
              <span className="whitespace-nowrap pr-3.5 text-[16px] leading-none tracking-[0.3px] text-[#000a62]">
                {seg.value}
              </span>
            </motion.div>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <SerifHeading>Get on track to reach Executive Council</SerifHeading>
        <p className="mt-6 text-[18px] leading-[26px] tracking-[0.3px] text-[#17181c]">{EC_INTRO}</p>
        <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {EC_CARDS.map((c, i) => (
            <MetricTile key={c.k} label={c.k} value={c.v} sub={c.sub} delay={i * 0.06} valueSize={24} dot="#ff9522" />
          ))}
        </div>
      </Reveal>

      <Reveal>
        <SerifHeading>Your progress</SerifHeading>
        <div className="mt-6 grid grid-cols-6 gap-2.5">
          {PROGRESS_MONTHS.map((m) => (
            <p key={m} className="px-2 py-2 text-[14px] leading-[20px] tracking-[0.2px] text-[#474952]/80">
              {m}
            </p>
          ))}
          {PROGRESS_ROWS.flat().map((cell, i) =>
            cell ? (
              <div
                key={cell.name}
                className="flex h-[133px] flex-col rounded-[4px] border border-[#d3a1f7] bg-white p-2"
              >
                <p className="text-[14px] leading-[20px] tracking-[0.2px] text-[#17181c]">{cell.name}</p>
                <p className="text-[14px] leading-[20px] tracking-[0.2px] text-[#474952]">{cell.amount}</p>
                <span className="mt-auto inline-flex h-6 w-fit items-center rounded-[6px] bg-[#f4e6ff] px-2 text-[12px] text-[#474952]">
                  In progress
                </span>
              </div>
            ) : (
              <button
                key={`add-${i}`}
                type="button"
                className="flex h-[133px] flex-col items-start rounded-[4px] border border-[#cce3ff] bg-white p-2 text-left transition-colors hover:bg-[#f7faff]"
              >
                <p className="text-[14px] leading-[20px] tracking-[0.2px] text-[#474952]/80">Add</p>
                <span className="mt-auto inline-flex h-6 items-center rounded-[6px] bg-[#f8f7f7] px-1 text-[#0468ff]">
                  <PlusGlyph />
                </span>
              </button>
            ),
          )}
        </div>
      </Reveal>
    </div>
  )
}

/* ----------------------------------------------------------------------------
 * Right rail — 2026 Goals
 * -------------------------------------------------------------------------- */

function GoalsRail() {
  return (
    <Reveal>
      <SectionEyebrow>2026 Goals</SectionEyebrow>
      <div className="mt-4 flex flex-col gap-4">
        {GOALS_2026.map((g, i) => (
          <motion.div
            key={g.k}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -6% 0px' }}
            transition={{ duration: 0.5, delay: i * 0.07, ease: HOUSE_EASE }}
            className="flex h-[111px] flex-col rounded-[4px] border border-[#eaccff] bg-[#fbf5ff] px-4 py-2"
          >
            <div className="flex items-center gap-2">
              <p className="min-w-0 flex-1 text-[12px] font-medium uppercase leading-[26px] tracking-[2px] text-[#474952]">
                {g.k}
              </p>
              {g.status && (
                <>
                  <span className="text-[12px] leading-[16px] text-[#474952]">{g.status}</span>
                  <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ background: g.dot }} />
                </>
              )}
            </div>
            <p className="mt-auto text-[24px] leading-none tracking-[0.3px] text-[#17181c]">{g.v}</p>
            <p className="mt-2 text-[12px] leading-[16px] tracking-[0.2px] text-[#17181c]/80">{g.sub}</p>
          </motion.div>
        ))}
      </div>
    </Reveal>
  )
}

/* ============================== Shared bits ============================== */

function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.55, ease: HOUSE_EASE }}
    >
      {children}
    </motion.div>
  )
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[14px] font-medium uppercase leading-[26px] tracking-[2px] text-[#474952]">{children}</p>
}

function SerifHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-serif text-[20px] leading-[26px] text-[#474952]" style={{ fontWeight: 400 }}>
      {children}
    </h3>
  )
}

function PencilGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

function PlusGlyph() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M9 4v10" />
      <path d="M4 9h10" />
    </svg>
  )
}
