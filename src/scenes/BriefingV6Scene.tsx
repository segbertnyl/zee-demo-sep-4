import { useCallback, useEffect, useMemo, useRef, useState, type UIEvent, type ReactElement } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { EASE, DURATION, SCROLL, NYLA, prefersReducedMotion } from '@/motion'
import { glideScrollTop } from '@/lib/scrollGlide'
import { useAppStore } from '@/state/useAppStore'
import { BriefingTaskCard, type CardState } from '@/ui/BriefingTaskCard'
import { BriefingHeadline } from '@/ui/BriefingHeadline'
import { BriefingV6Background } from '@/ui/BriefingV6Background'
import { BriefingTour, type TourStep } from '@/ui/BriefingTour'
import { PageSubnav } from '@/ui/PageSubnav'
import { PlanPage } from '@/ui/PlanPage'
import { PlanSummaryBackground } from '@/ui/PlanSummaryBackground'
import { NYLLogo } from '@/ui/NYLLogo'
import {
  NavBriefingIcon, PersonCheckIcon, TagIcon, OrgChartIcon,
  BriefcaseIcon, ListAddIcon, BellIcon, CalendarIcon, CheckIcon, ArrowDropDownIcon, type IconProps,
} from '@/ui/icons'
import {
  HEADLINES, PROGRESS_TEMPLATE, WHILE_AWAY, WHILE_AWAY_2, WHILE_AWAY_3, WHILE_AWAY_4,
  YOUR_DAY, YOUR_DAY_2, YOUR_DAY_3, YOUR_DAY_4, STACK_FOOTER,
  INITIAL_TASKS, DAY2_TASKS, DAY3_TASKS, DAY4_TASKS, SANDRA_FOLLOWUP_SUGGESTED,
  HORIZON_VIEWS, NAV_PLACEHOLDER,
  type TaskCardModel, type DayItem, type HorizonView,
} from '@/data/briefingV6Content'

type Horizon = 'Day' | 'Week' | 'Month' | 'Quarter'

/* ============================================================================
 * Briefing v6 scene (Figma Exploration pt-II · 3.0-Briefing 1102-101355).
 * Full-screen overlay opened from the prototype menu. Implements the flow:
 *   1 default → scroll changes headline · click a card surfaces it
 *   2 mark a task done
 *   3 Nyla suggests a follow-up (purple glow + tracing border + elegant enter)
 *   4 ~2s settle into the regular focus card
 *   5 agent completes it → 3 new follow-ups queue
 * Content is data-driven (briefingV6Content.ts). Motion via @/motion (NYLA set).
 * ========================================================================== */


type Status = 'open' | 'loading' | 'suggesting' | 'settled' | 'done'
interface Entry {
  model: TaskCardModel
  status: Status
  expanded?: boolean
  /** A completed (done) task lingers with the DONE styling, then archives into
   *  the collapsed "Completed" section. */
  archived?: boolean
}

const CLOCKS = { start: '9:03 AM', suggested: '9:58 AM', done: '10:04 AM' }

/* Date carousel — four fixed days (not consecutive). Back nav is disabled for
 * now, so offset only ever runs 0 → 3. */
function formatDay(offset: number) {
  switch (offset) {
    case 1: return { eyebrow: null, weekday: 'FRIDAY', title: 'Friday', label: 'FRIDAY, DEC 16' }
    case 2: return { eyebrow: null, weekday: 'FRIDAY', title: 'Friday', label: 'FRIDAY, DEC 23' }
    case 3: return { eyebrow: null, weekday: 'FRIDAY', title: 'Friday', label: 'FRIDAY, DEC 30' }
    default: return { eyebrow: 'Today', weekday: 'MONDAY', title: 'Monday', label: 'MONDAY, DEC 12' }
  }
}

/* Shared page container (Figma 1102-101355). The 12-col grid is right-anchored:
 * a 34px gap after the 96px rail on the left, a 40px margin on the right, and
 * columns that FLEX with the viewport (each = 1fr) so the grid breathes as the
 * window resizes. TopNav + content share this container so "Briefing", the
 * headline, and the left column align to column 1. Left = 4 cols, right = 8. */
const GRID = 'ml-[34px] mr-10'
const PAGE_TOTAL = 10 // priorities count shown as x/N (becomes 11 when Nyla adds one)
/* Top padding of the scroll stack — the fade band above the first card. Snap &
 * glide subtract this so a scrolled-to card rests at the SAME y as the first
 * card on load (below the fade), not pulled up into it. Keep in sync with the
 * scroll container's pt-[72px]/-mt-[72px]. */
const STACK_TOP_PAD = 72

export function BriefingV6Scene() {
  const open = useAppStore((s) => s.briefingV6Open)
  const close = useAppStore((s) => s.closeBriefingV6)
  const fromDiscovery = useAppStore((s) => s.briefingV6FromDiscovery)
  const clearFromDiscovery = useAppStore((s) => s.clearBriefingV6FromDiscovery)
  /* One-time onboarding tour (only when arriving from Discovery + plan-accept). */
  const [tourOn, setTourOn] = useState(false)
  const tourStarted = useRef(false)
  const tourTimer = useRef<number | undefined>(undefined)
  /* The top heading (title + date carousel) and the subnav fade in 400ms after
   * the briefing opens, so they arrive a beat after the page appears. */
  const [chromeIn, setChromeIn] = useState(false)

  const [reduced, setReduced] = useState(false)
  useEffect(() => setReduced(prefersReducedMotion()), [])

  /* ── content state ──────────────────────────────────────────────────────*/
  const [entries, setEntries] = useState<Entry[]>(
    () => INITIAL_TASKS.map((m) => ({ model: m, status: 'open' as Status, expanded: false })),
  )
  const [doneCount, setDoneCount] = useState(0)
  const [total, setTotal] = useState(PAGE_TOTAL)
  const [clock, setClock] = useState(CLOCKS.start)
  const [showInjectedDay, setShowInjectedDay] = useState(false)
  /* Scroll-focus card + last-completed card drive the state-based headline. */
  const [focusId, setFocusId] = useState<string | null>(null)
  const [showGrid, setShowGrid] = useState(false)
  /* Staged entrance: 0 = chrome only (1s, bg drifting) → 1 = headline types in
   * → 2 = task cards fade up → 3 = while-away + your-day fade in. */
  const [loadPhase, setLoadPhase] = useState(0)
  /* Which rail section is active, and the time horizon (Day = live briefing). */
  const [activeNav, setActiveNav] = useState('Briefing')
  const [horizon, setHorizon] = useState<Horizon>('Day')
  const [horizonLoading, setHorizonLoading] = useState(false)
  /* Date carousel: 0 = today, >0 = future days (forward-staged), <0 = past. */
  const [dayOffset, setDayOffset] = useState(0)
  /* Completed tasks collapse — hidden by default, merged into the closing line. */
  const [showCompleted, setShowCompleted] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const dayOffsetRef = useRef(0) // mirrors dayOffset for correct rapid-click math
  const focusDebounce = useRef<number | undefined>(undefined)
  const glideCancel = useRef<(() => void) | null>(null) // cancels an in-flight glide
  const glidingRef = useRef(false)                       // true while a glide runs (suppress snap)
  const timers = useRef<number[]>([])
  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
    window.clearTimeout(focusDebounce.current)
    glideCancel.current?.()
    glidingRef.current = false
  }, [])

  /* Reset the whole flow (on open / on replay). */
  const reset = useCallback(() => {
    clearTimers()
    setEntries(INITIAL_TASKS.map((m) => ({ model: m, status: 'open', expanded: false })))
    setDoneCount(0)
    setTotal(PAGE_TOTAL)
    setClock(CLOCKS.start)
    setShowInjectedDay(false)
    setFocusId(null)
    setActiveNav('Briefing')
    setHorizon('Day')
    setDayOffset(0)
    dayOffsetRef.current = 0
    setShowCompleted(false)
  }, [clearTimers])

  /* Step the date carousel. The task set is swapped SYNCHRONOUSLY with the date
   * (not in an effect) so the keyed stack never paints the old day's cards for a
   * frame — that stale frame was leaving orphaned exit nodes behind. Day 1 (0)
   * runs the full Nyla flow; days 2–4 are their own pre-staged sets. Back nav
   * is disabled for now, so next never drops below 0. */
  const stepDay = useCallback((delta: number) => {
    const next = Math.max(0, Math.min(3, dayOffsetRef.current + delta))
    dayOffsetRef.current = next
    clearTimers()
    const set = next === 1 ? DAY2_TASKS : next === 2 ? DAY3_TASKS : next === 3 ? DAY4_TASKS : INITIAL_TASKS
    setDayOffset(next)
    setEntries(set.map((m) => ({ model: m, status: 'open', expanded: false })))
    setDoneCount(0)
    setTotal(next === 0 ? PAGE_TOTAL : set.length)
    setShowInjectedDay(false)
    setFocusId(null)
    setShowCompleted(false)
  }, [clearTimers])

  useEffect(() => {
    if (open) reset()
    return clearTimers
  }, [open, reset, clearTimers])

  /* Page-load sequence (chrome is always visible). */
  useEffect(() => {
    if (!open) return
    if (reduced) { setLoadPhase(3); return }
    setLoadPhase(0)
    // Staged entrance, paced +50% slower than the first pass for a calmer load.
    const t1 = window.setTimeout(() => setLoadPhase(1), 1500) // headline types in
    const t2 = window.setTimeout(() => setLoadPhase(2), 3000) // cards fade up
    const t3 = window.setTimeout(() => setLoadPhase(3), 4050) // away + day fade in
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); window.clearTimeout(t3) }
  }, [open, reduced])

  /* Top heading + subnav appear 400ms after the briefing opens. */
  useEffect(() => {
    if (!open) { setChromeIn(false); return }
    if (reduced) { setChromeIn(true); return }
    setChromeIn(false)
    const t = window.setTimeout(() => setChromeIn(true), 400)
    return () => window.clearTimeout(t)
  }, [open, reduced])

  /* Onboarding tour: only when arriving from Discovery + plan-accept. Sequence:
   * accept plan → briefing FULLY loads (loadPhase reaches 3 THIS session) →
   * pause 2s → tooltips. loadPhase is reset to 0 on close (below), so a stale
   * 3 from a previous open can't fire the tour before the briefing re-loads. */
  useEffect(() => {
    if (open && fromDiscovery && loadPhase >= 3 && !tourStarted.current) {
      tourStarted.current = true
      clearFromDiscovery() // consume the flag (this re-runs the effect, so the
      // timer lives in a ref — NOT an effect-cleanup — or it'd be cancelled)
      tourTimer.current = window.setTimeout(() => setTourOn(true), 2000)
    }
  }, [open, fromDiscovery, loadPhase, clearFromDiscovery])

  /* On close, reset the tour guard AND loadPhase so the next open starts fresh
   * (prevents a stale loadPhase 3 from firing the tour before the reload). */
  useEffect(() => {
    if (!open) { tourStarted.current = false; setTourOn(false); window.clearTimeout(tourTimer.current); setLoadPhase(0) }
  }, [open])

  /* Clear a pending tour timer if the scene ever fully unmounts. */
  useEffect(() => () => window.clearTimeout(tourTimer.current), [])

  /* Brief loading state when switching to a longer horizon (simulated fetch). */
  useEffect(() => {
    if (horizon === 'Day') return
    setHorizonLoading(true)
    const t = window.setTimeout(() => setHorizonLoading(false), 450)
    return () => window.clearTimeout(t)
  }, [horizon])

  /* Press G to toggle the page-grid overlay (verifies the Figma grid). */
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      const t = (e.target as HTMLElement).tagName
      if (t === 'INPUT' || t === 'TEXTAREA') return
      if (e.key === 'g' || e.key === 'G') setShowGrid((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  /* ── interactions ───────────────────────────────────────────────────────*/
  /* Clicking a card scrolls it up to the top of the stack (no reorder). The
   * headline does NOT change yet — focus (and the headline) only updates AFTER
   * the card has snapped to the top, via the scroll-settle debounce below, with
   * a fallback timer for the no-movement case (clicking the already-top card). */
  /* JS-driven glide of a card to the top (SCROLL.glide curve). The headline
   * focus updates when the glide lands. reduced-motion → jump instantly. */
  const glideToCard = useCallback((id: string, focus = true) => {
    const cont = scrollRef.current
    const card = cont?.querySelector<HTMLElement>(`[data-card-id="${id}"]`)
    if (!cont || !card) return
    const to = Math.max(0, card.getBoundingClientRect().top - cont.getBoundingClientRect().top + cont.scrollTop - STACK_TOP_PAD)
    glideCancel.current?.()
    if (reduced) {
      cont.scrollTop = to
      if (focus) setFocusId(id)
      return
    }
    glidingRef.current = true
    glideCancel.current = glideScrollTop(cont, to, {
      durationMs: SCROLL.glide.duration * 1000,
      ease: SCROLL.glide.ease,
      onDone: () => { glidingRef.current = false; if (focus) setFocusId(id) },
    })
  }, [reduced])

  const surface = useCallback((id: string) => glideToCard(id), [glideToCard])

  const toggleExpand = useCallback((id: string) => {
    setEntries((prev) => prev.map((e) => (e.model.id === id ? { ...e, expanded: !e.expanded } : e)))
  }, [])

  /* Sandra micro-flow (Figma 1102-102376 / -105706 / -104792 / -106621):
   *   done card → Nyla loads a suggested task (glow + sparkle) → content fills in
   *   (typewriter) → the completed card fades into Completed → 1s later it settles
   *   into a normal card. */
  const FOLLOWUP_ID = SANDRA_FOLLOWUP_SUGGESTED.id
  const runNylaSequence = useCallback(() => {
    setClock(CLOCKS.suggested)
    setShowInjectedDay(true)
    setTotal(PAGE_TOTAL + 1) // a new task is added — progress denominator 9 → 10
    /* Insert the suggested card right after Sandra (she stays on top with the
     * DONE styling for now), starting in the loading state. */
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.model.id === 'sandra-lapse')
      const card: Entry = { model: SANDRA_FOLLOWUP_SUGGESTED, status: reduced ? 'suggesting' : 'loading', expanded: false }
      const next = [...prev]
      next.splice(idx >= 0 ? idx + 1 : 0, 0, card)
      return next
    })

    if (reduced) {
      setEntries((prev) => prev.map((e) =>
        e.model.id === FOLLOWUP_ID ? { ...e, status: 'settled', expanded: true } : e.model.id === 'sandra-lapse' ? { ...e, archived: true } : e))
      return
    }

    const { loadMs, fillMs, expandDwellMs } = NYLA.sequence
    const setStatus = (id: string, status: Status) =>
      setEntries((prev) => prev.map((e) => (e.model.id === id ? { ...e, status } : e)))
    // loading ("thinking") → suggesting: content fills in with the sectioned
    // typewriter reveal (headline → description → tags).
    const t1 = window.setTimeout(() => setStatus(FOLLOWUP_ID, 'suggesting'), loadMs)
    // once the content has typed in, the card auto-expands to reveal the prepped
    // details, and the completed Sandra card fades down into Completed.
    const t2 = window.setTimeout(() =>
      setEntries((prev) => prev.map((e) =>
        e.model.id === FOLLOWUP_ID ? { ...e, expanded: true }
          : e.model.id === 'sandra-lapse' ? { ...e, archived: true } : e)), loadMs + fillMs)
    // after the expanded details settle in, the glow fades and the card settles
    // into a normal card.
    const t3 = window.setTimeout(() => { setClock(CLOCKS.done); setStatus(FOLLOWUP_ID, 'settled') }, loadMs + fillMs + expandDwellMs)
    timers.current.push(t1, t2, t3)
  }, [reduced, FOLLOWUP_ID])

  /* Marking done shows the DONE styling in place, then the card archives into the
   * collapsed Completed section. Sandra also kicks off the Nyla sequence, which
   * owns her archive timing. */
  const markDone = useCallback((id: string) => {
    setEntries((prev) => prev.map((e) => (e.model.id === id ? { ...e, status: 'done' } : e)))
    setDoneCount((c) => c + 1)
    if (id === 'sandra-lapse') {
      const t = window.setTimeout(runNylaSequence, reduced ? 200 : NYLA.sequence.beforeSuggestMs)
      timers.current.push(t)
    } else {
      const t = window.setTimeout(() =>
        setEntries((prev) => prev.map((e) => (e.model.id === id ? { ...e, archived: true } : e))), reduced ? 200 : NYLA.sequence.doneHoldMs)
      timers.current.push(t)
    }
  }, [runNylaSequence, reduced])

  const dismiss = useCallback((id: string) => {
    clearTimers()
    setEntries((prev) => prev.filter((e) => e.model.id !== id))
    setShowInjectedDay(false)
    setTotal(PAGE_TOTAL)
  }, [clearTimers])

  /* Snooze defers a task — removes it from today's stack (no completion). */
  const snooze = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.model.id !== id))
  }, [])

  /* Undo a completion — brings the task back into the active stack. Un-archives
   * it (so it leaves Completed), returns it to the open/collapsed state, cancels
   * any pending archive/settle timers, and rolls the completed count back. */
  const undo = useCallback((id: string) => {
    clearTimers()
    setEntries((prev) => prev.map((e) =>
      e.model.id === id ? { ...e, archived: false, status: 'open', expanded: false } : e))
    setDoneCount((c) => Math.max(0, c - 1))
  }, [clearTimers])

  /* ── scroll → snap-lock to a full card + drive the headline ────────────────
   * Glide mode: after a manual scroll settles, glide the nearest card's top to
   * the top so the rest position is ALWAYS a full card (never a partial one);
   * its top card becomes the headline focus. Suppressed while a glide runs. */
  const onScroll = useCallback((_e: UIEvent<HTMLDivElement>) => {
    if (glidingRef.current) return
    window.clearTimeout(focusDebounce.current)
    focusDebounce.current = window.setTimeout(() => {
      const cont = scrollRef.current
      if (!cont) return
      const topY = cont.getBoundingClientRect().top + STACK_TOP_PAD
      const cards = cont.querySelectorAll<HTMLElement>('[data-card-id]')
      let nearestId: string | null = null
      let best = Infinity
      cards.forEach((c) => {
        const d = c.getBoundingClientRect().top - topY
        if (Math.abs(d) < Math.abs(best)) { best = d; nearestId = c.getAttribute('data-card-id') }
      })
      if (!nearestId) return
      if (Math.abs(best) > 2 && !reduced) glideToCard(nearestId) // snap-lock to a full card
      else setFocusId(nearestId)
    }, 140)
  }, [glideToCard, reduced])

  /* Headline always reflects the task at the top of the stack (the scrolled-to
   * card if it's still live, else the top card). During the Nyla flow the
   * suggested card is present and not yet done → celebrate. (Figma 1102-101355
   * / -101651 / -103002 / -104792.) */
  const headline = useMemo(() => {
    const active = entries.filter((e) => !e.archived)
    const followup = entries.find((e) => e.model.id === SANDRA_FOLLOWUP_SUGGESTED.id)
    if (followup && !followup.archived && followup.status !== 'done') return HEADLINES.newTask
    // the moment the follow-up is completed (done, before it archives): a brief
    // transitional line that hands off to Clementine's review.
    if (followup && !followup.archived && followup.status === 'done') return HEADLINES.sandraHandled
    const focused = focusId ? active.find((e) => e.model.id === focusId) : undefined
    const top = focused ?? active[0]
    return top?.model.focusHeadline ?? HEADLINES.opening
  }, [entries, focusId])

  const progressLine = PROGRESS_TEMPLATE
    .replace('{time}', clock)
    .replace('{done}', String(doneCount))
    .replace('{total}', String(total))
  const pct = Math.round((doneCount / total) * 100)

  const currentYourDay = dayOffset === 1 ? YOUR_DAY_2 : dayOffset === 2 ? YOUR_DAY_3 : dayOffset === 3 ? YOUR_DAY_4 : YOUR_DAY
  const currentWhileAway = dayOffset === 1 ? WHILE_AWAY_2 : dayOffset === 2 ? WHILE_AWAY_3 : dayOffset === 3 ? WHILE_AWAY_4 : WHILE_AWAY

  const dayItems: DayItem[] = useMemo(
    () => (showInjectedDay ? [currentYourDay.injectedItem, ...currentYourDay.items] : currentYourDay.items),
    [showInjectedDay, currentYourDay],
  )

  const statusToCardState = (s: Status): CardState =>
    s === 'open' ? 'default' : (s as CardState)

  /* A done task lingers in the stack (DONE styling), then archives into the
   * collapsed Completed section. */
  const activeEntries = useMemo(() => entries.filter((e) => !e.archived), [entries])
  const completedEntries = useMemo(() => entries.filter((e) => e.archived), [entries])

  const showBriefing = activeNav === 'Briefing'
  const isPlan = activeNav === 'Plan'
  const dayView = horizon === 'Day'
  const horizonView = dayView ? null : HORIZON_VIEWS[horizon as 'Week' | 'Month' | 'Quarter']
  const dayMeta = formatDay(dayOffset)
  const isToday = dayOffset === 0
  const isPast = dayOffset < 0
  const horizonNavMeta: Record<'Week' | 'Month' | 'Quarter', { eyebrow: string; label: string }> = {
    Week:    { eyebrow: 'This Week',    label: 'DEC 9–15' },
    Month:   { eyebrow: 'This Month',   label: 'DECEMBER' },
    Quarter: { eyebrow: 'This Quarter', label: 'Q4 2026' },
  }
  const topNavMeta = dayView
    ? { eyebrow: dayMeta.eyebrow, label: dayMeta.label }
    : horizonNavMeta[horizon as 'Week' | 'Month' | 'Quarter']
  /* Headline: day 1 → live state-driven (headline, below). Days 2–4 → a fixed
   * line for that day's story beat. Horizon views override all. */
  const dayHeadline = dayOffset === 1 ? 'Eric has completed his financial intake. Time to run a needs / risk analysis.'
    : dayOffset === 2 ? 'Prepare for plan presentation with Eric at 10 am.'
    : dayOffset === 3 ? 'You have clients to follow up with. Let’s keep things moving.'
    : headline
  const leftHeadline = horizonView ? horizonView.headline : dayHeadline

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="briefing-v6"
          role="dialog"
          aria-label="Briefing"
          className="overlay-bleed z-[170] flex bg-[var(--bg-canvas)]"
          /* No enter opacity animation — the overlay is opaque from frame 1 (CSS),
             so the app mounted BEHIND it never flashes through. The staged
             loadPhase entrance is the "loading in" feel; only the CLOSE fades. */
          initial={false}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.short }}
        >
          {/* background — Briefing uses the drifting blobs; not-built pages use
              the soft peach/lavender cloud (Figma 1268-29002). */}
          {showBriefing ? <BriefingV6Background reducedMotion={reduced} /> : isPlan ? <PlanBackground /> : <NotBuiltBackground />}

          {/* left rail — hover to expand (Figma 1002-12213) */}
          <Rail active={activeNav} onSelect={setActiveNav} onExit={close} slideIn={fromDiscovery} />

          {/* page */}
          <div className="relative z-10 flex min-w-0 flex-1 flex-col">
            {/* not-built pages drop the top bar (title + date) and bottom subnav */}
            {showBriefing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: chromeIn ? 1 : 0 }}
                transition={{ duration: DURATION.standard * 2, ease: EASE.settle }}
              >
                <TopNav eyebrow={topNavMeta.eyebrow} label={topNavMeta.label} onPrev={() => stepDay(-1)} onNext={() => stepDay(1)} />
              </motion.div>
            )}

            {!showBriefing ? (
              isPlan ? <PlanPage /> : <NavPlaceholder section={activeNav} />
            ) : (
            <div className={[GRID, 'grid min-h-0 flex-1 grid-cols-12 gap-6 pt-6'].join(' ')}>
                {/* LEFT — fixed editorial column (4 cols · does NOT scroll).
                    Headline top-aligns with the top card; away/day bottom-anchored. */}
                <div className="col-span-5 flex h-full flex-col pt-6">
                  {/* phase 1 — headline types in (BriefingHeadline self-animates) */}
                  {/* First reveal types in full; later headline updates (scroll /
                      navigate) auto-switch to the subtle blur-fade. The Nyla
                      "new task" headline is a system reveal → force the typewriter. */}
                  {loadPhase >= 1 && <BriefingHeadline text={leftHeadline} reducedMotion={reduced} subtle={leftHeadline === HEADLINES.newTask ? false : undefined} />}

                  {loadPhase >= 1 && (horizonView ? (
                    <p className="mt-5 text-[14px] text-[var(--text-body-muted)]">
                      Switch back to{' '}
                      <button type="button" onClick={() => setHorizon('Day')} className="font-medium text-[var(--nyl-blue-500)] hover:text-[var(--nyl-blue-600)]">Day</button>
                      {' '}to act on today's priorities.
                    </p>
                  ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: DURATION.standard, delay: 0.2 }} className="mt-5 flex items-center gap-3">
                    <p className="text-[13px] text-[var(--text-body-muted)]">{progressLine}</p>
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[var(--nyl-gray-100)]">
                      <motion.div
                        className="h-full rounded-full bg-[var(--action-primary)]"
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: DURATION.standard, ease: EASE.settle }}
                      />
                    </div>
                  </motion.div>
                  ))}

                  {/* phase 3 — While you were away + Your day fade in (no move).
                      Content swaps per selected day (see currentWhileAway/currentYourDay). */}
                  {dayView && loadPhase >= 3 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: DURATION.deliberate, ease: EASE.settle }} className="mt-auto pt-10 pb-16">
                  <section>
                    <h2 className="flex items-baseline gap-2">
                      <span className="eyebrow">{currentWhileAway.heading}</span>
                      <span className="text-[11px] text-[var(--text-body-faint)]">· {currentWhileAway.savedLabel}</span>
                    </h2>
                    <ul className="mt-3 space-y-2">
                      {currentWhileAway.items.map((it) => (
                        <AwayItem key={it.id} label={it.label} detail={it.detail} cta={it.cta} />
                      ))}
                    </ul>
                  </section>

                  {/* Your day */}
                  <section className="mt-9">
                    <h2 className="eyebrow">{currentYourDay.heading}</h2>
                    <ul className="mt-3 space-y-2.5">
                      <AnimatePresence initial={false}>
                        {dayItems.map((d) => (
                          <motion.li
                            key={d.id}
                            layout
                            initial={d.injected && !reduced ? { opacity: 0, x: -8 } : false}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: DURATION.short, ease: EASE.settle }}
                            className="flex items-center gap-2.5 text-[13.5px] text-[var(--text-body)]"
                          >
                            <span className={[
                              'size-2 shrink-0 rounded-full',
                              d.dot === 'now' ? 'bg-[var(--action-ai)]'
                                : d.dot === 'review' ? 'bg-[var(--nyl-orange-400)]'
                                : d.dot === 'done' || d.dot === 'ready' ? 'bg-[var(--badge-opportunity)]'
                                : 'bg-[var(--nyl-gray-250)]',
                            ].join(' ')} />
                            <span className="text-[var(--text-body-muted)]">{d.time}</span>
                            <span>{d.label}</span>
                            {d.cta && (
                              <button type="button" className="font-medium text-[var(--nyl-blue-500)] hover:text-[var(--nyl-blue-600)]">
                                {d.cta}
                              </button>
                            )}
                            {d.tag && (
                              <span className={[
                                'rounded-full px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.08em]',
                                d.tag === 'New' ? 'bg-[var(--badge-new-soft)] text-[var(--badge-new)]' : 'bg-[var(--nyl-gray-050)] text-[var(--text-body-muted)]',
                              ].join(' ')}>
                                {d.tag}
                              </span>
                            )}
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                    <button type="button" onClick={() => setActiveNav('Calendar')} className="mt-4 text-[13px] font-medium text-[var(--text-accent)] hover:text-[var(--nyl-blue-800)]">
                      {currentYourDay.viewAll}
                    </button>
                  </section>
                  </motion.div>
                  )}
                </div>

                {/* RIGHT — cols 6–12. Only this column scrolls. */}
                <div className="col-span-7 flex min-h-0 flex-col">
                {horizonView ? (
                  <HorizonSummary view={horizonView} horizon={horizon as 'Week' | 'Month' | 'Quarter'} reduced={reduced} loading={horizonLoading} />
                ) : isPast ? (
                  <PastPlaceholder onToday={() => stepDay(-dayOffset)} />
                ) : entries.length === 0 ? (
                  <EmptyState onReplay={reset} />
                ) : (
                <div
                  ref={scrollRef}
                  onScroll={onScroll}
                  className="-mx-4 -mt-[72px] min-h-0 flex-1 overflow-y-auto px-4 pb-[55vh] pt-[72px]"
                  style={{
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, black 72px)',
                    maskImage: 'linear-gradient(to bottom, transparent 0, black 72px)',
                  }}
                >
                  {/* The 72px fade lives in the top padding ABOVE the first card
                      (-mt/pt keep the card aligned with the headline), sitting well
                      clear of the top chrome so the first card is never dimmed at
                      rest and scrolling cards dissolve gradually over a tall band
                      rather than getting cut off. Horizontal -mx/px gives the
                      glowing border room so it isn't cut off on the sides. */}
                  {/* phase 2 — task cards fade up from the bottom (800ms, with a
                      little overshoot/stretch on arrival). Keyed by day so the
                      stack fully remounts on date change (no stale cards). The
                      load gate only applies to today's first paint. */}
                  <motion.div
                    key={`day-${dayOffset}`}
                    className="space-y-4"
                    initial={false}
                    animate={(loadPhase >= 2 || !isToday) ? { opacity: 1, y: 0 } : { opacity: 0, y: 44 }}
                    transition={{ duration: 0.8, ease: [0.34, 1.32, 0.64, 1] }}
                  >
                  <AnimatePresence initial={false}>
                    {activeEntries.map((e) => (
                      <motion.div
                        key={e.model.id}
                        data-card-id={e.model.id}
                        layout
                        initial={false}
                        exit={{ opacity: 0, scale: 0.98, transition: { duration: DURATION.dramatic, ease: EASE.lift } }}
                        whileHover={reduced ? undefined : { y: -2 }}
                        transition={{ duration: DURATION.micro, ease: EASE.settle, layout: { duration: DURATION.deliberate, ease: EASE.settle } }}
                        className="cursor-default"
                        onClick={(ev) => {
                          if ((ev.target as HTMLElement).closest('button,a,input,textarea')) return
                          surface(e.model.id)
                        }}
                      >
                        <BriefingTaskCard
                          model={e.model}
                          state={statusToCardState(e.status)}
                          expanded={e.expanded}
                          reducedMotion={reduced}
                          onToggleExpand={() => toggleExpand(e.model.id)}
                          onMarkDone={() => markDone(e.model.id)}
                          onSnooze={() => snooze(e.model.id)}
                          onDismiss={() => dismiss(e.model.id)}
                          onAddToQueue={() => {/* queued — settle proceeds via timer */}}
                          onPrimary={() => surface(e.model.id)}
                          onUndo={() => undo(e.model.id)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* closing line — priorities end here; Nyla keeps watch. When
                      tasks are completed, a show/hide of them merges in here. */}
                  <motion.div
                    initial={false}
                    animate={loadPhase >= 2 ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: DURATION.deliberate, ease: EASE.settle }}
                    className="px-1 pt-6 text-center"
                  >
                    <p className="text-[12.5px] leading-[1.5] text-[var(--text-body-faint)]">{STACK_FOOTER}</p>
                    {completedEntries.length > 0 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setShowCompleted((v) => !v)}
                          aria-expanded={showCompleted}
                          className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-[var(--nyl-blue-500)] transition-colors hover:text-[var(--nyl-blue-600)]"
                        >
                          {showCompleted ? 'Hide' : 'Show'} completed ({completedEntries.length})
                          <ArrowDropDownIcon size={16} className={showCompleted ? 'rotate-180' : ''} />
                        </button>
                        <AnimatePresence initial={false}>
                          {showCompleted && (
                            <motion.div
                              key="completed"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: DURATION.short, ease: EASE.settle }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 space-y-3 text-left">
                                {completedEntries.map((e) => (
                                  <BriefingTaskCard
                                    key={e.model.id}
                                    model={e.model}
                                    state="done"
                                    reducedMotion={reduced}
                                    onToggleExpand={() => {}}
                                    onMarkDone={() => {}}
                                    onSnooze={() => {}}
                                    onDismiss={() => {}}
                                    onAddToQueue={() => {}}
                                    onPrimary={() => {}}
                                    onUndo={() => undo(e.model.id)}
                                  />
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </motion.div>
                  </motion.div>
                </div>
                )}
              </div>
            </div>
            )}
          </div>

          {/* floating horizon switcher + Nyla launcher (Figma bottom pill) */}
          {showBriefing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: chromeIn ? 1 : 0 }}
              transition={{ duration: DURATION.standard * 2, ease: EASE.settle }}
            >
              <HorizonPill horizon={horizon} setHorizon={setHorizon} />
            </motion.div>
          )}

          {/* page-grid overlay (press G) — verifies the Figma grid alignment */}
          {showGrid && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[60] flex">
              <div className="w-[96px] shrink-0" />
              <div className="relative flex-1 overflow-hidden">
                <div className={[GRID, 'flex h-full gap-6'].join(' ')}>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-full flex-1" style={{ background: 'rgba(139, 55, 200, 0.1)' }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* one-time onboarding tour — Discovery + plan-accept entry only */}
          {tourOn && showBriefing && (
            <BriefingTour steps={TOUR_STEPS} reducedMotion={reduced} onClose={() => setTourOn(false)} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── "While you were away" item — Snooze-style dotted link + hover tooltip ──*/
function AwayItem({ label, detail, cta }: { label: string; detail: string; cta?: string }) {
  const [hover, setHover] = useState(false)
  return (
    <li>
      {/* hover target hugs the text only (inline-block), not the full row width */}
      <span
        className="relative inline-block"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
      <button
        type="button"
        className="text-left text-[13.5px] font-medium text-[var(--text-body-muted)] underline decoration-dotted decoration-[var(--text-body-faint)] underline-offset-[3px] transition-colors hover:text-[var(--text-body)] hover:decoration-[var(--text-body)]"
      >
        {label}
      </button>
      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.micro, ease: EASE.settle }}
            className="absolute bottom-[calc(100%+6px)] left-0 z-40 w-[320px] rounded-lg border border-[var(--border-default)] bg-white p-3 shadow-[0_14px_36px_-16px_rgba(23,24,28,0.3)]"
          >
            <p className="text-[12px] leading-[1.5] text-[var(--text-body-muted)]">{detail}</p>
            {cta && (
              <button type="button" className="mt-2 text-[12px] font-medium text-[var(--nyl-blue-500)] hover:text-[var(--nyl-blue-600)]">
                {cta} →
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      </span>
    </li>
  )
}

const HORIZON_PLACEHOLDER_COPY: Record<'Week' | 'Month' | 'Quarter', string> = {
  Week: 'The rhythm that compounds — Nyla tracks your activity targets, surfaces what\'s unscheduled, and helps you fill the week with the right conversations.',
  Month: 'See the whole board, not just the next move — closes, reviews, service, outreach, all organized by what needs to happen so you and Nyla can sequence the month.',
  Quarter: 'The view that separates intentional from reactive — where council stands, where your review cycle is, and what the math says you need to finish strong, with Nyla mapping the path to get there.',
}

/* ── horizon summary (Week / Month / Quarter right-side view) ───────────────*/
function HorizonSummary({ view, horizon, reduced, loading }: { view: HorizonView; horizon: 'Week' | 'Month' | 'Quarter'; reduced: boolean; loading: boolean }) {
  const toneColor = (t?: string) =>
    t === 'good' ? 'text-[var(--badge-opportunity)]' : t === 'warn' ? 'text-[var(--nyl-orange-500)]' : 'text-[var(--text-headline)]'

  if (loading) {
    return (
      <div className="min-w-0 flex-1">
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-[14px] border border-[var(--border-subtle)] bg-white p-5">
              <div className="h-3 w-24 animate-pulse rounded bg-[var(--nyl-gray-100)]" />
              <div className="mt-3 h-7 w-20 animate-pulse rounded bg-[var(--nyl-gray-100)]" />
              <div className="mt-3 h-3 w-32 animate-pulse rounded bg-[var(--nyl-gray-050)]" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const placeholderCopy = HORIZON_PLACEHOLDER_COPY[horizon]

  return (
    <div className="flex min-w-0 flex-1 flex-col pb-[120px]">
      <div className="grid grid-cols-3 gap-4">
        {view.stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.standard, delay: reduced ? 0 : 0.05 * i, ease: EASE.settle }}
            className="rounded-[14px] border border-[var(--border-subtle)] bg-white p-5"
          >
            <p className="text-[12px] uppercase tracking-[0.1em] text-[var(--text-body-muted)]">{s.label}</p>
            <p className={['mt-2 font-serif text-[32px] leading-none', toneColor(s.tone)].join(' ')} style={{ fontWeight: 400 }}>{s.value}</p>
            <p className="mt-2 text-[13px] text-[var(--text-body-muted)]">{s.sub}</p>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.standard, delay: reduced ? 0 : 0.25, ease: EASE.settle }}
        className="mt-4 flex min-h-0 flex-1 flex-col items-center justify-center rounded-[14px] border border-[var(--border-subtle)] bg-white p-8 text-center"
      >
        <p className="max-w-[400px] text-[16px] leading-relaxed text-[var(--text-primary)]">{placeholderCopy}</p>
        <span className="mt-6 rounded-full border bg-[var(--nyl-blue-050)] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]" style={{ borderColor: '#80BAFF' }}>Coming Soon</span>
      </motion.div>
    </div>
  )
}

/* ── Plan page background — the wide purple bokeh (nyla-bkg-planpage) */
function PlanBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <PlanSummaryBackground variant="page" style={{ width: '100%', height: '100%' }} />
    </div>
  )
}

/* ── "not built" page background — soft peach + lavender cloud (Figma 1268-29002) */
function NotBuiltBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-[var(--bg-canvas)]"
      style={{
        backgroundImage:
          'radial-gradient(50% 48% at 44% 40%, var(--bg-notbuilt-warm), transparent 72%), radial-gradient(52% 54% at 60% 74%, var(--bg-notbuilt-lavender), transparent 72%)',
      }}
    />
  )
}

/* ── nav placeholder (non-Briefing sections) ────────────────────────────────
 * Fully center-aligned: section value prop + a Think / Feel / Do framework
 * (the advisor's intended reaction). No CTA — the rail moves between sections. */
function NavPlaceholder({ section }: { section: string }) {
  const meta = NAV_PLACEHOLDER[section]
  const item = [...NAV_ITEMS, ...BOTTOM_ITEMS].find((n) => n.label === section)
  const Icon = item?.Icon
  const iconSize = item?.size ?? 24
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-10 pb-24 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION['scene-in'], ease: EASE.settle }}
        className="flex max-w-[520px] flex-col items-center"
      >
        <span className="flex size-14 items-center justify-center rounded-2xl bg-white/80 text-[var(--nyl-blue-500)]">
          {Icon && <Icon size={iconSize} />}
        </span>
        <h2 className="mt-6 font-serif text-[32px] leading-tight text-[var(--text-headline)]" style={{ fontWeight: 300 }}>{meta?.title ?? section}</h2>
        <p className="mt-3 max-w-[460px] text-[18px] leading-relaxed text-[var(--text-primary)]">{meta?.valueProp}</p>
        {meta?.example && (
          <div className="mt-6 w-full rounded-[14px] border border-[var(--border-subtle)] bg-white p-5 text-center">
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, lineHeight: '26px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-primary)', textAlign: 'center' }}>Advisors Can...</p>
            <p className="mt-2 text-[16px] leading-relaxed text-[var(--text-secondary)]">{meta.example}</p>
          </div>
        )}
        <span className="mt-6 rounded-full border bg-[var(--nyl-blue-050)] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]" style={{ borderColor: '#80BAFF' }}>Coming Soon</span>
      </motion.div>
    </div>
  )
}

/* ── past-day placeholder (layout pending) ──────────────────────────────────*/
function PastPlaceholder({ onToday }: { onToday: () => void }) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION['scene-in'], ease: EASE.settle }}
        className="rounded-[16px] border border-[var(--border-subtle)] bg-white px-10 py-12 text-center"
      >
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[var(--nyl-gray-050)] text-[var(--text-body-muted)]">
          <CalendarIcon size={22} />
        </span>
        <h2 className="mt-5 font-serif text-[24px] text-[var(--text-headline)]" style={{ fontWeight: 400 }}>Looking back is coming soon.</h2>
        <p className="mt-2 max-w-[340px] text-[14px] text-[var(--text-body-muted)]">
          The past-day briefing view is still being designed. For now, jump back to today.
        </p>
        <button type="button" onClick={onToday} className="mt-6 text-[13px] font-medium text-[var(--nyl-blue-500)] hover:text-[var(--nyl-blue-600)]">
          ← Back to today
        </button>
      </motion.div>
    </div>
  )
}

/* ── empty state (all today's tasks cleared) ────────────────────────────────*/
function EmptyState({ onReplay }: { onReplay: () => void }) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION['scene-in'], ease: EASE.settle }}
        className="rounded-[16px] border border-[var(--border-subtle)] bg-white px-10 py-12 text-center"
      >
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[var(--badge-opportunity-soft)] text-[var(--badge-opportunity)]">
          <CheckIcon size={22} />
        </span>
        <h2 className="mt-5 font-serif text-[24px] text-[var(--text-headline)]" style={{ fontWeight: 400 }}>You’re clear for now.</h2>
        <p className="mt-2 max-w-[320px] text-[14px] text-[var(--text-body-muted)]">
          Nothing left in today’s queue. Nyla will surface the next thing the moment it matters.
        </p>
        <button type="button" onClick={onReplay} className="mt-6 text-[13px] font-medium text-[var(--nyl-blue-500)] hover:text-[var(--nyl-blue-600)]">
          ↻ Replay the briefing
        </button>
      </motion.div>
    </div>
  )
}

/* ── floating bottom pill — horizon switcher + Nyla sparkle ─────────────────
 * Floats above the page content (overlaps the card stack), centered across the
 * content area — the container spans from the "Briefing" label (rail 96 + ml-34
 * = 130px) to the right margin (mr-10). pointer-events stay off the gutter so
 * cards stay clickable. The pill itself is the reusable PageSubnav. */
function HorizonPill({ horizon, setHorizon }: { horizon: Horizon; setHorizon: (h: Horizon) => void }) {
  const openCollab = useAppStore((s) => s.openCollab)
  return (
    // Vertically centered on the rail avatar (center 60px from the viewport bottom
    // = py-10 40px + half the 40px avatar). Shared Y with the Plan subnav.
    <div className="pointer-events-none absolute left-[130px] right-10 z-20 flex justify-center" style={{ bottom: 60, transform: 'translateY(50%)' }}>
      <PageSubnav
        active={horizon}
        options={['Day', 'Week', 'Month', 'Quarter']}
        onSelect={(h) => setHorizon(h as Horizon)}
        onAskNyla={() => openCollab()}
      />
    </div>
  )
}

/* ── left rail — collapsed 96px, expands on hover to reveal labels ──────────
 * Mirrors Figma 1002-12213: logo, six nav items (Briefing active), two bottom
 * items (Notifications + Calendar, each with a blue dot), then the avatar. */
type RailItem = { Icon: (p: IconProps) => ReactElement; label: string; size: number; active?: boolean; dot?: boolean }

/* One-time onboarding tour shown after Discovery + plan-accept. Step 1 is the
 * briefing page itself; the rest spotlight nav-rail targets. */
const TOUR_STEPS: TourStep[] = [
  {
    eyebrow: 'Morning briefing',
    title: 'Your morning briefing lives here.',
    body: 'Each morning, Nyla lays out a strategically prioritized set of actions for your day — what to read, what to act on, and what’s running in the background. Open it from the left rail anytime.',
  },
  {
    eyebrow: 'Your plan',
    title: 'Your plan lives here.',
    body: 'This is the plan you just accepted — it lives on your Plan page and keeps evolving over time to fit you, Sarah, with Nyla working in the background to make it happen. Personalize it any time.',
    targets: ['plan'],
  },
  {
    eyebrow: 'Action boards',
    title: 'Opportunities, surfaced for you.',
    body: 'Clients, Actives, and Prospects each have an action board that surfaces the opportunities worth your time — dive into any one to go deeper.',
    targets: ['clients', 'actives', 'prospects'],
  },
  {
    eyebrow: 'Business',
    title: 'Stay on track with your targets.',
    body: 'Business keeps you aligned with New York Life’s targets, and surfaces learning and development opportunities to help you grow.',
    targets: ['business'],
  },
]

const NAV_ITEMS: RailItem[] = [
  { Icon: NavBriefingIcon, label: 'Briefing', size: 22 },
  { Icon: PersonCheckIcon, label: 'Clients', size: 40 },
  { Icon: TagIcon, label: 'Actives', size: 40 },
  { Icon: OrgChartIcon, label: 'Prospects', size: 22 },
  { Icon: BriefcaseIcon, label: 'Business', size: 40 },
  { Icon: ListAddIcon, label: 'Plan', size: 24 },
]
const BOTTOM_ITEMS: RailItem[] = [
  { Icon: BellIcon, label: 'Notifications', size: 40, dot: true },
  { Icon: CalendarIcon, label: 'Calendar', size: 40, dot: true },
]

function RailRow({ item, expanded, onClick }: { item: RailItem; expanded: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={item.label}
      data-tour-target={item.label.toLowerCase()}
      className="group flex w-full items-center gap-3 rounded-[11px]"
    >
      <span
        className={[
          'relative flex size-10 shrink-0 items-center justify-center rounded-[11px] transition-colors',
          item.active ? 'bg-[var(--nyl-blue-050)] text-[var(--nyl-blue-500)]' : 'text-[var(--nyl-gray-700)] group-hover:bg-[var(--nyl-blue-025)] group-hover:text-[var(--nyl-blue-500)]',
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

function Rail({ active, onSelect, onExit, slideIn = false }: { active: string; onSelect: (s: string) => void; onExit: () => void; slideIn?: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const enterTimer = useRef<number | undefined>(undefined)
  /* Expand only after a brief hover so a passing cursor doesn't trigger it. */
  const onEnter = () => {
    window.clearTimeout(enterTimer.current)
    enterTimer.current = window.setTimeout(() => setExpanded(true), 280)
  }
  const onLeave = () => {
    window.clearTimeout(enterTimer.current)
    setExpanded(false)
  }
  return (
    /* When arriving from the plan reveal, the rail slides into place first
       (then the page content loads in behind it via loadPhase). */
    <motion.div
      data-tour-rail
      className="relative z-30 w-[96px] shrink-0"
      initial={slideIn ? { opacity: 0, x: -96 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: DURATION.deliberate, ease: EASE.settle }}
    >
      <motion.nav
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        animate={{ width: expanded ? 248 : 96 }}
        transition={{ duration: 0.28, ease: EASE.settle }}
        className="absolute inset-y-0 left-0 flex flex-col items-start overflow-hidden rounded-br-[8px] bg-white py-10 pl-7 pr-4 shadow-[0_0_40px_rgba(0,0,0,0.08)]"
      >
        {/* logo — doubles as back-to-menu */}
        <button type="button" onClick={onExit} aria-label="Back to menu" className="shrink-0 rounded-[8px]">
          <NYLLogo pixelSize={40} className="rounded-[8px]" />
        </button>

        {/* main nav */}
        <div className="mt-12 flex flex-1 flex-col gap-6">
          {NAV_ITEMS.map((it) => (
            <RailRow key={it.label} item={{ ...it, active: it.label === active }} expanded={expanded} onClick={() => onSelect(it.label)} />
          ))}
        </div>

        {/* bottom utilities */}
        <div className="flex flex-col gap-6">
          {BOTTOM_ITEMS.map((it) => (
            <RailRow key={it.label} item={{ ...it, active: it.label === active }} expanded={expanded} onClick={() => onSelect(it.label)} />
          ))}
        </div>

        {/* avatar */}
        <div className="mt-6 flex w-full items-center gap-3">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-[13px] font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #7fd8c4 0%, #5ec6e0 100%)' }}
          >
            AF
          </span>
          <motion.span
            animate={{ opacity: expanded ? 1 : 0 }}
            transition={{ duration: DURATION.micro }}
            className="whitespace-nowrap text-[14px] font-medium text-[var(--text-headline)]"
          >
            Sarah Ferreira
          </motion.span>
        </div>
      </motion.nav>
    </motion.div>
  )
}

/* ── top nav — "Briefing" · centered date · dev controls ────────────────────
 * Center date matches Figma (TODAY · MONDAY, DEC 12 with prev/next chevrons).
 * The time-of-day toggle + Replay are demo controls (not in the Figma chrome). */
function TopNav({ eyebrow, label, onPrev, onNext, prevDisabled }: { eyebrow: string | null; label: string; onPrev: () => void; onNext: () => void; prevDisabled?: boolean }) {
  /* Fixed 120px band whose center (60px) matches the rail's NYL logo center
     (rail py-10 = 40px + 40px logo / 2), so the page title + date carousel sit
     on the same horizontal line as the logo. */
  return (
    <div className="flex h-[120px] items-center">
      {/* Same 12-col grid as the page content: "Briefing" spans the left 5 cols
          (aligned with the headline); the date toggle spans the right 7 cols —
          the SAME column as the task-card stack — with the chevrons pinned to
          that stack's left/right edges and the date centered between them. */}
      <div className={[GRID, 'grid w-full grid-cols-12 items-center gap-6'].join(' ')}>
        <p className="col-span-5 font-serif text-[18px] text-[var(--text-headline)]" style={{ fontWeight: 400 }}>Briefing</p>

        <div className="col-span-7 grid grid-cols-[auto_1fr_auto] items-center">
          <button type="button" onClick={onPrev} disabled={prevDisabled} aria-label="Previous day" className="justify-self-start text-[18px] leading-none text-[var(--nyl-blue-500)] hover:text-[var(--nyl-blue-600)] disabled:opacity-40 disabled:hover:text-[var(--nyl-blue-500)]">‹</button>
          <span className="text-center text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-headline)]">
            {eyebrow && <>{eyebrow} <span className="text-[var(--text-body-faint)]">·</span> </>}{label}
          </span>
          <button type="button" onClick={onNext} aria-label="Next day" className="justify-self-end text-[18px] leading-none text-[var(--nyl-blue-500)] hover:text-[var(--nyl-blue-600)]">›</button>
        </div>
      </div>
    </div>
  )
}
