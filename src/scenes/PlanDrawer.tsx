import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Goals } from './OnboardingFlow'
import { Nyla } from '@/ui/Nyla'

/* v5.5 Plan Drawer — the "Your plan" finale of onboarding.
 *
 * Per the Exploration pt-II deck (file VCjqlGu9kQVy2i5nqDxKqa): after goals are
 * set, the purple "Building your plan" right rail expands leftward and turns
 * into a full-bleed purple drawer. Inside, Nyla walks the advisor
 * through calibrating the plan as a vertical conversation thread — each new beat
 * pushes the previous one up, but everything stays scrollable so you can read
 * back over what you've done.
 *
 * Beats:
 *   1. qualifications — short "let's look at the status" sparkle beat (auto-advances)
 *   2. pace          — projected pace line chart + the three headline gaps
 *   3. adjustments   — stacked contribution bar of where the FYC comes from
 *   4. milestones    — calibrated weekly/monthly cadence + EC catch-up math
 *   5. preferences   — soft working-style preferences + "Create my briefing"
 *
 * The goals summary rides along on the right: full column on the opening beat,
 * then condenses to status chips once calibration starts.
 */

const PURPLE_GRADIENT = 'linear-gradient(135deg, #2a1463 0%, #3f1773 48%, #4d1773 100%)'
const HOUSE_EASE = [0.22, 0.65, 0.05, 1] as const

type PlanStepId = 'qualifications' | 'pace' | 'adjustments' | 'milestones' | 'preferences'
const PLAN_STEPS: PlanStepId[] = ['qualifications', 'pace', 'adjustments', 'milestones', 'preferences']

export function PlanDrawer({ open, goals, onFinish }: { open: boolean; goals: Goals; onFinish: () => void }) {
  /* Mount the stateful inner only while open so its step state resets cleanly
     each time the drawer blooms — no reset-in-effect needed. */
  return (
    <AnimatePresence>
      {open && <PlanDrawerInner goals={goals} onFinish={onFinish} />}
    </AnimatePresence>
  )
}

function PlanDrawerInner({ goals, onFinish }: { goals: Goals; onFinish: () => void }) {
  const [active, setActive] = useState(0)
  const [focused, setFocused] = useState(0)
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const activeRef = useRef<HTMLDivElement | null>(null)
  const innerRef = useRef<HTMLDivElement | null>(null)
  const autoScrollingRef = useRef(false)
  const scrollTickRef = useRef(false)

  /* Smooth-scroll the freshly revealed beat near the top of the scroller,
   * leaving a sliver of the previous beat peeking above (matches the Figma
   * "scrolled-up history" treatment). Custom RAF easing for a softer landing. */
  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    const node = activeRef.current
    if (!scroller || !node) return
    autoScrollingRef.current = true
    const id = requestAnimationFrame(() => {
      const nodeRect = node.getBoundingClientRect()
      const scrollerRect = scroller.getBoundingClientRect()
      const offset = nodeRect.top - scrollerRect.top - 72
      smoothScrollTo(scroller, scroller.scrollTop + offset, 720)
    })
    const settle = window.setTimeout(() => { autoScrollingRef.current = false }, 800)
    return () => { cancelAnimationFrame(id); window.clearTimeout(settle) }
  }, [active])

  /* On manual scroll, brighten whichever beat is closest to the scroller's
   * vertical center so the advisor can read back over earlier beats. */
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
        if (dist < bestDist) { bestDist = dist; best = i }
      })
      setFocused(best)
    })
  }

  function advance() {
    const next = Math.min(active + 1, PLAN_STEPS.length - 1)
    setActive(next)
    setFocused(next)
  }

  const condensed = active >= 1

  return (
    <motion.div
      key="plan-drawer"
      className="absolute inset-0 z-[70] overflow-hidden"
      /* The drawer is full-size; we reveal it from the right rail's footprint
         leftward with a clip-path wipe so it reads as the purple rail blooming
         into a full canvas (animating width % is unreliable in Motion). */
      initial={{ clipPath: 'inset(0% 0% 0% 83%)' }}
      animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      exit={{ clipPath: 'inset(0% 0% 0% 83%)', opacity: 0 }}
      transition={{ duration: 0.66, ease: [0.7, 0, 0.2, 1] }}
      style={{ background: PURPLE_GRADIENT, color: 'white' }}
    >
      <DriftingBlobs />

          {/* Right summary — visible from the very first frame of the wipe so
              the rail content reads as staying put while the purple expands
              leftward around it (per the "End transition to plan" guide).
              Full column on the opening beat, then condenses to status chips
              for the calibration beats. */}
          <div className="absolute right-7 top-9 z-20 hidden w-[210px] md:block">
            <AnimatePresence mode="wait">
              {condensed ? (
                <motion.div
                  key="chips"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.4, ease: HOUSE_EASE }}
                >
                  <ChipRail goals={goals} />
                </motion.div>
              ) : (
                <motion.div
                  key="summary"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.4, ease: HOUSE_EASE }}
                >
                  <PlanSummaryColumn goals={goals} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Inner layout fades in once the drawer has nearly finished opening,
              so the grow reads as the purple rail blooming into a full canvas. */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            {/* Left mini-rail — logo + the single remaining "Your plan" stage. */}
            <div className="absolute left-7 top-7 z-20 hidden flex-col gap-9 md:flex">
              <NYLLogoMark />
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="inline-flex size-3 rounded-full bg-[#80baff]" />
                <span className="text-[12.5px] font-semibold tracking-tight text-white">Your plan</span>
              </div>
            </div>

            {/* Center thread — scrollable conversation. */}
            <div ref={scrollerRef} onScroll={handleScroll} className="absolute inset-0 overflow-y-auto px-6 md:px-[220px]">
              <div ref={innerRef} className="mx-auto flex max-w-[680px] flex-col pb-40 pt-16">
                {PLAN_STEPS.slice(0, active + 1).map((id, i) => {
                  const isActive = i === active
                  /* The current beat always stays lit; earlier beats only
                     brighten when scrolled back to. This keeps the beat the
                     advisor is on from dimming when scroll settles / mouse
                     goes idle and the scroll-center resolves to a neighbor. */
                  const isFocused = i === focused || isActive
                  return (
                    <motion.div
                      key={id}
                      ref={isActive ? activeRef : undefined}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: isFocused ? 1 : 0.4, y: 0 }}
                      transition={{ duration: 0.55, ease: HOUSE_EASE }}
                      className={[
                        'py-10',
                        isActive ? '' : 'pointer-events-none select-none',
                      ].join(' ')}
                    >
                      {renderPlanStep(id, { goals, advance, onFinish })}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
    </motion.div>
  )
}

/* ----------------------------------------------------------------------------
 * Step renderer
 * -------------------------------------------------------------------------- */

type PlanStepProps = { goals: Goals; advance: () => void; onFinish: () => void }

function renderPlanStep(id: PlanStepId, p: PlanStepProps): ReactNode {
  switch (id) {
    case 'qualifications': return <Qualifications advance={p.advance} />
    case 'pace': return <Pace advance={p.advance} />
    case 'adjustments': return <Adjustments advance={p.advance} />
    case 'milestones': return <Milestones advance={p.advance} />
    case 'preferences': return <Preferences onFinish={p.onFinish} />
  }
}

/* ============================== Beats ============================== */

function Qualifications({ advance }: { advance: () => void }) {
  /* A short "thinking" beat. The sparkle pulses while the headline types in,
     then we auto-advance into the pace calibration. */
  useEffect(() => {
    const t = setTimeout(advance, 2600)
    return () => clearTimeout(t)
  }, [advance])

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
        style={{ width: 40, height: 40, filter: 'drop-shadow(0 0 22px rgba(128,186,255,0.55))' }}
      >
        <Nyla size={40} variant="on-dark" />
      </motion.div>
      <h2
        className="max-w-[20ch] font-serif text-[30px] leading-[1.18] tracking-tight text-white md:text-[36px]"
        style={{ fontWeight: 400, fontFamily: 'var(--font-serif)', textWrap: 'balance' }}
      >
        Pulling it all together…
      </h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        className="text-[13px] tracking-tight text-white/70"
      >
        Calibrating your plan…
      </motion.p>
    </div>
  )
}

function Pace({ advance }: { advance: () => void }) {
  const [math, setMath] = useState(false)
  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-start gap-3">
        <span className="mt-1 shrink-0"><Nyla size={24} variant="on-dark" /></span>
        <h2
          className="font-serif text-[26px] leading-[1.22] tracking-tight text-white md:text-[30px]"
          style={{ fontWeight: 400, fontFamily: 'var(--font-serif)', textWrap: 'balance' }}
        >
          You're on track to meet your FYC target, but you had a slower start this year and will need
          to increase your pace to hit the Executive Council goal.
        </h2>
      </div>

      <PaceChart />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard eyebrow="FYC goal" value="$32,400" sub="< $42K minimum" tag="On track" tone="good" />
        <StatCard eyebrow="Council credits for EC" value="$52,400" sub="Projected" tag="On track" tone="good" />
        <StatCard eyebrow="Case Rate Bonus" value="35 cases" sub="Level 1 · 30" tag="On track" tone="good" />
      </div>

      <AnimatePresence>
        {math && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: HOUSE_EASE }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-3 rounded-lg border border-white/12 bg-white/[0.06] p-4 sm:grid-cols-3">
              <MathRow k="Current pace" v="$2,400/mo" />
              <MathRow k="Monthly need" v="$4,681/mo" sub="+$2,281/mo" />
              <MathRow k="Gap to close · 6mo" v="−$37,600" sub="stretch to 90K" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="max-w-[64ch] text-[13.5px] leading-[1.55] text-white/80">
        This is what your year projected pace is looking like and I'm seeing several gaps to fill.
        Would you like to see how we can adjust your current pace?
      </p>

      <div className="flex flex-wrap gap-3">
        <GhostBtn onClick={() => setMath((m) => !m)}>{math ? 'Hide the math' : 'Show me the math'}</GhostBtn>
        <WhiteBtn onClick={advance}>Review adjustments</WhiteBtn>
      </div>
    </div>
  )
}

function Adjustments({ advance }: { advance: () => void }) {
  return (
    <div className="flex flex-col gap-7">
      <h2
        className="font-serif text-[26px] leading-[1.22] tracking-tight text-white md:text-[30px]"
        style={{ fontWeight: 400, fontFamily: 'var(--font-serif)', textWrap: 'balance' }}
      >
        Let's review some adjustments to help you get there by the end of June.
      </h2>

      <ContributionBar
        segments={[
          { label: 'Contribution to date', value: '$52.4K', weight: 52.4, color: '#b794e8' },
          { label: 'Existing client opportunities', value: '+$10K', weight: 10, color: '#8f6fd6' },
          { label: 'Unaccounted pipeline', value: '$27.6K', weight: 27.6, color: '#f6a35c' },
        ]}
      />

      <p className="max-w-[64ch] text-[13.5px] leading-[1.55] text-white/80">
        I've looked through your book and found a few opportunities from existing clients for you to
        get started with. If you close a large case, your monthly target relaxes. If you fall behind,
        your OS identifies the fastest path to recover.
      </p>

      <div className="flex flex-wrap gap-3">
        <WhiteBtn onClick={advance}>Calibrate my plan</WhiteBtn>
      </div>
    </div>
  )
}

function Milestones({ advance }: { advance: () => void }) {
  const [math, setMath] = useState(false)
  return (
    <div className="flex flex-col gap-7">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
          Calibrating your milestones and pipeline
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
          <StatCard eyebrow="FYC per month" value="$4K" sub="avg to hit $42K" tag="On track" tone="good" />
          <StatCard eyebrow="Cases to close" value="1–2 /mo" sub="based on your avg case size" tag="On track" tone="good" />
          <StatCard eyebrow="Client appointments" value="7" sub="to generate your close rate" tag="On track" tone="good" />
          <StatCard eyebrow="Prospect contacts" value="4 /week" sub="to fill your appointment pipeline" tag="On track" tone="good" />
          <StatCard eyebrow="Client reviews" value="5" sub="to protect and deepen the book" tag="On track" tone="good" />
          <StatCard eyebrow="Referral asks" value="4" sub="your highest-conversion source" tag="On track" tone="good" />
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
          Get on track to reach Executive Council
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard eyebrow="Gap to close" value="$37,000" sub="6 months · 2 cases/mo" tag="Stretch" tone="warn" />
          <StatCard eyebrow="Expected premium" value="avg. $3,200" sub="per new case" />
          <StatCard eyebrow="Cases needed" value="+12 cases" sub="6 months · 2 cases per mo" tag="Stretch" tone="warn" />
        </div>
      </div>

      <AnimatePresence>
        {math && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: HOUSE_EASE }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-3 rounded-lg border border-white/12 bg-white/[0.06] p-4 sm:grid-cols-3">
              <MathRow k="Cases needed" v="~12 cases" sub="goal ÷ avg case size" />
              <MathRow k="Qualified appts needed" v="~43 appts" sub="cases ÷ close rate" />
              <MathRow k="Total appts needed" v="~90 appts" sub="on average · 6mo" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-4">
        <p className="max-w-[64ch] text-[13.5px] leading-[1.55] text-white/80">
          I recommend you focus on new premium protection cases, with each one adding an average of
          $3,200 in-force premium. You'll need to reach 12 more protection cases across 6 months.
        </p>
        <p className="max-w-[64ch] text-[13.5px] leading-[1.55] text-white/70">
          If this looks good to you, I'd like to review your personal ways of working before I build
          out your plan.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <GhostBtn onClick={() => setMath((m) => !m)}>{math ? 'Hide the math' : 'Show me the math'}</GhostBtn>
        <WhiteBtn onClick={advance}>Looks good</WhiteBtn>
      </div>
    </div>
  )
}

function Preferences({ onFinish }: { onFinish: () => void }) {
  const [note, setNote] = useState('')
  return (
    <div className="flex flex-col gap-7">
      <h2
        className="font-serif text-[26px] leading-[1.22] tracking-tight text-white md:text-[30px]"
        style={{ fontWeight: 400, fontFamily: 'var(--font-serif)', textWrap: 'balance' }}
      >
        With these goals in mind, I'll also incorporate your personal working style and preferences.
      </h2>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">Your routines</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <PrefCard label="Most active hours" value="Start of the day" />
          <PrefCard label="Hard stops" value="Friday and weekends with family" />
          <PrefCard label="Protected hours" value="Before 8am and after 7pm" />
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">Your approach</p>
        <p className="mt-3 max-w-[68ch] text-[14px] leading-[1.6] text-white/85">
          You prioritize relationship depth over pipeline velocity. You're in it for the long
          conversation, not the next close. Protection is your foundation. Human connection is your
          method. Holistic planning is where you're headed.
        </p>
      </div>

      <div>
        <label htmlFor="plan-note" className="text-[13.5px] font-medium text-white/85">
          Is there anything else you'd like to add?
        </label>
        <textarea
          id="plan-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add anything else"
          rows={2}
          className="mt-3 block w-full resize-none rounded-md border border-white/20 bg-white/[0.06] px-4 py-3 text-[14px] leading-[1.5] text-white placeholder:text-white/40 focus:border-white/50 focus:outline-none"
        />
      </div>

      <div>
        <WhiteBtn onClick={onFinish}>
          <span className="mr-2 inline-flex"><Nyla size={24} variant="on-light" /></span>
          Create my plan
        </WhiteBtn>
      </div>
    </div>
  )
}

/* ============================== Right summary ============================== */

function PlanSummaryColumn({ goals }: { goals: Goals }) {
  const fyc = goals.fycTarget != null ? `$${Math.round(goals.fycTarget / 1000)}K` : '$42K'
  const council = goals.councilLevel ?? 'Executive'
  const longTerm = goals.longTermTags[0] ?? 'Eagle Status'
  const approach = goals.approach ?? 'Holistic Advising'
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/85">Building your plan</h3>
      <SummarySection eyebrow="2026 goals">
        <SummaryField label="FYC target" value={fyc} />
        <SummaryField label="Council level" value={council} />
      </SummarySection>
      <SummarySection eyebrow="Your practice">
        <SummaryField label="Long-term target" value={longTerm} />
        <SummaryField label="Approach" value={approach} />
      </SummarySection>
      {(goals.clientApproach.existing || goals.clientApproach.new) && (
        <SummarySection eyebrow="Your clients">
          {goals.clientApproach.existing && <SummaryField label="Existing" value={goals.clientApproach.existing} />}
          {goals.clientApproach.new && <SummaryField label="New" value={goals.clientApproach.new} />}
        </SummarySection>
      )}
    </div>
  )
}

function SummarySection({ eyebrow, children }: { eyebrow: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-t border-white/15 pt-5 first-of-type:border-t-0 first-of-type:pt-0">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-white/65">{eyebrow}</p>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10.5px] text-white/65">{label}</p>
      <p className="text-[13.5px] font-semibold leading-snug tracking-tight">{value}</p>
    </div>
  )
}

function ChipRail({ goals }: { goals: Goals }) {
  const fyc = goals.fycTarget != null ? `$${Math.round(goals.fycTarget / 1000)}K` : '$42K'
  return (
    <div className="flex flex-col items-end gap-2.5">
      <Chip label="FYC target" value={fyc} tag="On target" tone="good" />
      <Chip value={`${goals.councilLevel ?? 'Executive'} Council`} tag="Stretch" tone="warn" />
      <Chip value={goals.longTermTags[0] ?? 'Eagle Status'} tag="Stretch" tone="warn" />
      <Chip value={goals.approach ?? 'Holistic advising'} />
    </div>
  )
}

function Chip({ label, value, tag, tone }: { label?: string; value: string; tag?: string; tone?: Tone }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.08] px-3 py-1.5 text-[11px]">
      {label && <span className="text-white/55">{label}</span>}
      <span className="font-semibold text-white">{value}</span>
      {tag && <TagDot tag={tag} tone={tone ?? 'good'} />}
    </span>
  )
}

/* ============================== Shared bits ============================== */

type Tone = 'good' | 'warn' | 'deficit'

const TONES: Record<Tone, { bg: string; fg: string }> = {
  good: { bg: 'rgba(94,224,168,0.16)', fg: '#8ff0c4' },
  warn: { bg: 'rgba(246,184,110,0.18)', fg: '#ffcf9e' },
  deficit: { bg: 'rgba(255,138,138,0.18)', fg: '#ffb3b3' },
}

function StatCard({
  eyebrow, value, sub, tag, tone,
}: { eyebrow: string; value: string; sub?: string; tag?: string; tone?: Tone }) {
  return (
    <div className="rounded-lg border border-white/12 bg-white/[0.06] p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/55">{eyebrow}</p>
        {tag && <TagPill tag={tag} tone={tone ?? 'good'} />}
      </div>
      <p className="mt-2 font-serif text-[26px] leading-none tracking-tight text-white" style={{ fontWeight: 400 }}>
        {value}
      </p>
      {sub && <p className="mt-2 text-[11px] text-white/55">{sub}</p>}
    </div>
  )
}

function TagPill({ tag, tone }: { tag: string; tone: Tone }) {
  const cfg = TONES[tone]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: cfg.bg, color: cfg.fg }}>
      <span aria-hidden="true" className="inline-block size-1.5 rounded-full" style={{ background: cfg.fg }} />
      {tag}
    </span>
  )
}

function TagDot({ tag, tone }: { tag: string; tone: Tone }) {
  const cfg = TONES[tone]
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-medium" style={{ background: cfg.bg, color: cfg.fg }}>
      <span aria-hidden="true" className="inline-block size-1 rounded-full" style={{ background: cfg.fg }} />
      {tag}
    </span>
  )
}

function MathRow({ k, v, sub }: { k: string; v: string; sub?: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/50">{k}</p>
      <p className="mt-1 font-mono text-[15px] text-white">{v}</p>
      {sub && <p className="mt-0.5 text-[10.5px] text-white/50">{sub}</p>}
    </div>
  )
}

function PrefCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/12 bg-white/[0.06] p-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/55">{label}</p>
      <p className="mt-2 text-[14px] font-semibold leading-snug tracking-tight text-white">{value}</p>
    </div>
  )
}

/* Stacked horizontal contribution bar (Adjustments beat). */
function ContributionBar({ segments }: { segments: { label: string; value: string; weight: number; color: string }[] }) {
  const total = segments.reduce((s, x) => s + x.weight, 0)
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {segments.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-2 text-[11.5px] text-white/75">
            <span aria-hidden="true" className="inline-block size-2.5 rounded-[3px]" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
      <div className="flex h-12 w-full overflow-hidden rounded-md">
        {segments.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ width: 0 }}
            animate={{ width: `${(s.weight / total) * 100}%` }}
            transition={{ duration: 0.6, delay: 0.15 + i * 0.12, ease: HOUSE_EASE }}
            className="flex items-center justify-center"
            style={{ background: s.color }}
          >
            <span className="px-2 text-[12.5px] font-semibold text-[#2a1463]">{s.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* Projected-pace line chart (Pace beat). Lightweight hand-plotted SVG — actual
 * to date, the shallow current pace, the steeper pace needed for EC, plus the
 * FYC-goal and Council-goal reference lines, with a "Today" marker. */
function PaceChart() {
  const W = 640, H = 230
  const padL = 8, padR = 8, padT = 28, padB = 30
  const x = (t: number) => padL + t * (W - padL - padR)            /* t in [0,1] */
  const y = (v: number) => padT + (1 - v) * (H - padT - padB)      /* v in [0,1] */
  const todayT = 0.52

  /* normalized value series (0 = bottom, 1 = top ~ $100K / 90K council) */
  const actual = [[0, 0.06], [0.16, 0.13], [0.32, 0.2], [todayT, 0.32]].map(([t, v]) => `${x(t)},${y(v)}`).join(' ')
  const current = [[todayT, 0.32], [0.74, 0.42], [1, 0.5]].map(([t, v]) => `${x(t)},${y(v)}`).join(' ')
  const needed = [[todayT, 0.32], [0.74, 0.62], [1, 0.86]].map(([t, v]) => `${x(t)},${y(v)}`).join(' ')
  const fycGoalY = y(0.42)
  const councilGoalY = y(0.9)

  return (
    <div className="rounded-lg border border-white/12 bg-white/[0.05] p-4">
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1.5">
        <Legend swatch="#80baff" label="Actual · $32.4K" />
        <Legend swatch="#cdbff0" dashed label="Current pace" />
        <Legend swatch="#f6a35c" dashed label="Needed pace for EC · $37.6K gap" />
        <Legend swatch="#ffffff" dotted label="FYC goal · $42K" />
        <Legend swatch="#b794e8" dotted label="Council goal · 90K" />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Projected pace chart">
        {/* horizontal gridlines */}
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={padL} y1={y(g)} x2={W - padR} y2={y(g)} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
        ))}
        {/* reference goal lines */}
        <line x1={padL} y1={councilGoalY} x2={W - padR} y2={councilGoalY} stroke="#b794e8" strokeWidth={1.25} strokeDasharray="2 4" />
        <text x={W - padR} y={councilGoalY - 6} fill="#cdbff0" fontSize="10" textAnchor="end">$100K</text>
        <line x1={padL} y1={fycGoalY} x2={W - padR} y2={fycGoalY} stroke="rgba(255,255,255,0.55)" strokeWidth={1.25} strokeDasharray="2 4" />
        <text x={W - padR} y={fycGoalY - 6} fill="rgba(255,255,255,0.7)" fontSize="10" textAnchor="end">$50K</text>

        {/* today marker */}
        <line x1={x(todayT)} y1={padT - 8} x2={x(todayT)} y2={H - padB} stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
        <text x={x(todayT)} y={padT - 12} fill="rgba(255,255,255,0.85)" fontSize="10" textAnchor="middle">Today, Dec 16</text>

        {/* needed pace (steep, orange) */}
        <polyline points={needed} fill="none" stroke="#f6a35c" strokeWidth={2.25} strokeDasharray="5 4" strokeLinecap="round" strokeLinejoin="round" />
        {/* current pace (shallow, lavender) */}
        <polyline points={current} fill="none" stroke="#cdbff0" strokeWidth={2.25} strokeDasharray="5 4" strokeLinecap="round" strokeLinejoin="round" />
        {/* actual to date (solid, blue) */}
        <polyline points={actual} fill="none" stroke="#80baff" strokeWidth={2.75} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={x(todayT)} cy={y(0.32)} r={4.5} fill="#80baff" stroke="#2a1463" strokeWidth={2} />

        {/* x-axis month labels */}
        {[['Jan', 0], ['Mar', 0.28], ['Jun', 0.5], ['Sep', 0.74], ['Dec', 1]].map(([m, t]) => (
          <text key={m as string} x={x(t as number)} y={H - 8} fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor={t === 0 ? 'start' : t === 1 ? 'end' : 'middle'}>
            {m}
          </text>
        ))}
      </svg>
    </div>
  )
}

function Legend({ swatch, label, dashed, dotted }: { swatch: string; label: string; dashed?: boolean; dotted?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10.5px] text-white/70">
      {dashed || dotted ? (
        <svg width="16" height="6" aria-hidden="true">
          <line x1="0" y1="3" x2="16" y2="3" stroke={swatch} strokeWidth={2} strokeDasharray={dotted ? '1.5 2.5' : '4 3'} />
        </svg>
      ) : (
        <span className="inline-block h-[3px] w-4 rounded-full" style={{ background: swatch }} />
      )}
      {label}
    </span>
  )
}

/* ============================== Buttons ============================== */

function WhiteBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center rounded-md bg-white px-5 py-2.5 text-[13.5px] font-semibold text-[#2a1463] transition-colors hover:bg-white/90"
    >
      {children}
    </button>
  )
}

function GhostBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-white/30 bg-white/0 px-5 py-2.5 text-[13.5px] font-semibold text-white/90 transition-colors hover:bg-white/10"
    >
      {children}
    </button>
  )
}

/* ============================== Glyphs / chrome ============================== */

function NYLLogoMark() {
  return (
    <div
      className="flex size-8 items-center justify-center rounded-md text-[8px] font-semibold leading-[1.05] tracking-tight text-white"
      style={{ background: '#0468ff' }}
    >
      NEW<br />YORK<br />LIFE
    </div>
  )
}

/* Slowly drifting radial-gradient blobs + a peach corner glow (bottom-right),
 * matching the deck's living purple canvas. */
function DriftingBlobs() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute"
        style={{
          left: '-8%', top: '10%', width: '60%', height: '60%', borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, rgba(143,86,179,0.45) 0%, rgba(143,86,179,0) 65%)',
          filter: 'blur(46px)',
        }}
        animate={{ x: ['0%', '8%', '-4%', '0%'], y: ['0%', '-6%', '4%', '0%'], scale: [1, 1.12, 0.96, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute"
        style={{
          right: '-10%', bottom: '-14%', width: '62%', height: '62%', borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, rgba(255,176,120,0.5) 0%, rgba(255,176,120,0) 64%)',
          filter: 'blur(58px)',
        }}
        animate={{ x: ['0%', '6%', '-5%', '0%'], y: ['0%', '-4%', '6%', '0%'], scale: [1, 1.16, 0.95, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute"
        style={{
          right: '4%', top: '-12%', width: '46%', height: '46%', borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, rgba(99,79,150,0.5) 0%, rgba(99,79,150,0) 60%)',
          filter: 'blur(50px)',
        }}
        animate={{ x: ['0%', '-6%', '6%', '0%'], y: ['0%', '8%', '-4%', '0%'], scale: [1, 0.92, 1.12, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

/* Custom RAF easing for the thread scroll — softer than native smooth scroll. */
function smoothScrollTo(el: HTMLElement, target: number, durationMs: number) {
  const startTop = el.scrollTop
  const delta = target - startTop
  if (Math.abs(delta) < 1) return
  const start = performance.now()
  const ease = (t: number) => 1 - Math.pow(1 - t, 4)
  function step(now: number) {
    const p = Math.min(1, (now - start) / durationMs)
    el.scrollTop = startTop + delta * ease(p)
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}
