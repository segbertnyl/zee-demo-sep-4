/* Centralised motion constants — single source of truth.
 * Replaces the four inline duplicates (EASE_SETTLE, HOUSE_EASE, EASE,
 * EASE_LIFT, etc.) scattered across the codebase.
 * Import what you need:
 *   import { EASE, DURATION, type EaseName, type DurationName } from '@/motion'
 */

export type EaseCurve = [number, number, number, number]

/* Named easing curves ─────────────────────────────────────────────────────── */
export const EASE = {
  /** Primary enter easing. Fast out, gentle arrival. Default for nearly all reveals. */
  settle:   [0.22, 0.65, 0.05, 1] as EaseCurve,
  /** Exit easing. Slow start, accelerates out. Scene exits and departures only. */
  lift:     [0.55, 0.06, 0.68, 0.19] as EaseCurve,
  /** Panel easing. Sharp acceleration, clean stop. Business scene panels. */
  slide:    [0.32, 0.72, 0, 1] as EaseCurve,
  /** Material-style symmetric ease. Deliberate, weighty transitions. */
  standard: [0.4, 0, 0.2, 1] as EaseCurve,
} as const

export type EaseName = keyof typeof EASE

/* Duration scale (seconds) ────────────────────────────────────────────────── */
export const DURATION = {
  micro:      0.18,  // 180ms — label fades, icon swaps
  quick:      0.26,  // 260ms — scene exit, drawer close
  short:      0.32,  // 320ms — tab swap, list item enter
  standard:   0.42,  // 420ms — card entry, stagger base
  'scene-in': 0.52,  // 520ms — scene enter transition
  deliberate: 0.60,  // 600ms — panel slide, section reveal
  dramatic:   0.90,  // 900ms — hero panels, Wrapped reveals
  cinematic:  1.40,  // 1400ms — slow dissolves (e.g. intro fade/blur build-out)
} as const

export type DurationName = keyof typeof DURATION

/* Spring configs ──────────────────────────────────────────────────────────── */
export const SPRING = {
  /** LeftRail active pill. Snappy, minimal overshoot. */
  'nav-pill':      { stiffness: 420, damping: 38 },
  /** BriefingScene time-tab indicator. Slightly softer. */
  'tab-indicator': { stiffness: 380, damping: 32 },
} as const

export type SpringName = keyof typeof SPRING

/* ────────────────────────────────────────────────────────────────────────────
 * NYLA SUGGEST MOTION SET  (briefing-v6)
 *
 * The "complete a task → Nyla suggests a new task" sequence. These are NEW,
 * named, reusable tokens — do not inline these numbers in components. The feel
 * is: an elegant card entrance, a subtle purple glow, a border that traces the
 * perimeter while Nyla "thinks", then a ~2s hold that settles into the regular
 * focus-state card.
 *
 * Values are pulled from the documented motion system (EASE.* / DURATION.*,
 * Storybook "Design System / Motion") rather than invented — the one-shot
 * transitions reuse the existing scale. The only values OUTSIDE that scale are
 * the ambient `thinkingBorder.loopDuration` (a continuous loop, not a one-shot
 * transition) and `settle.holdMs` (a dwell, not an animation) — both are dwell/
 * loop timings the DURATION scale intentionally doesn't cover, and are flagged
 * for tuning in briefing-v6-notes.md.
 * All consumers must provide a prefers-reduced-motion fallback (see REDUCED). */
export const NYLA = {
  /** Elegant card appearance — the documented "scene enter" pattern (y + scale
   *  + blur), at the scene-in duration. */
  cardEnter: {
    duration: DURATION['scene-in'],   // 520ms — matches the scene-enter pattern
    ease: EASE.settle,
    from: { opacity: 0, y: 16, scale: 0.98, filter: 'blur(8px)' },
    to:   { opacity: 1, y: 0,  scale: 1,    filter: 'blur(0px)' },
  },
  /** Subtle purple glow ramp around the suggested card (box-shadow spread).
   *  Ramps in/out on the `deliberate` step so the glow reads as a soft swell. */
  glow: {
    rampIn:  DURATION.deliberate,     // 600ms ramp to full glow
    rampOut: DURATION.deliberate,     // 600ms ramp back down on settle
    /* Peak shadow + resting (post-settle) shadow — purple, low intensity. */
    peakShadow:    '0 0 0 1px rgba(139,55,200,0.45), 0 8px 40px -8px rgba(139,55,200,0.40)',
    restingShadow: '0 0 0 1px rgba(139,55,200,0.00), 0 8px 28px -14px rgba(23,24,28,0.16)',
  },
  /** Rotating purple/blue glow border while Nyla "thinks". Implemented in CSS
   *  (`.nyla-suggest-glow` in globals.css, conic-gradient + @property angle,
   *  technique from codepen.io/Quakeee/pen/EaxRKjp). This value mirrors that
   *  keyframe's duration — ~4x slower than the reference for a softer feel.
   *  Ambient loop: intentionally OUTSIDE the one-shot DURATION scale. */
  thinkingBorder: {
    loopDuration: 5.2,                // 5.2s per rotation — slow, eased sparkle sweep; keep in sync with globals.css
    ease: 'ease-in-out' as const,
  },
  /** Hold the suggested state, then fade the animated border into focus card. */
  settle: {
    holdMs: 2000,                     // ~2s dwell (per §4 / step 4) — not on the scale
    borderFade: DURATION.deliberate,  // 600ms fade of the thinking border + glow
  },
  /** Mark-as-done / agent-complete transition for a task card. Slowed from the
   *  420ms card-entry step to a deliberate beat so completion reads clearly and
   *  doesn't feel abrupt. Also used for the card's layout collapse into the
   *  compact DONE bar. */
  taskComplete: {
    duration: DURATION.dramatic,      // 900ms — a clear, unhurried completion
    ease: EASE.settle,
  },
  /** Completed-task → Nyla-suggests sequence dwell timings (ms). These are
   *  dwells/delays, not one-shot transitions, so they live here (like
   *  settle.holdMs) rather than on the DURATION scale. Tuned for an unhurried,
   *  "Nyla is thinking" cadence. `doneHoldMs` applies to ALL completed tasks. */
  sequence: {
    doneHoldMs: 2200,       // a completed card holds its DONE state before archiving into Completed
    beforeSuggestMs: 1500,  // pause after a card is marked done, before the suggested card appears
    loadMs: 1800,           // loading / "thinking" dwell before the suggested card appears
    fillMs: 3600,           // suggesting window (glow lead + typewriter) before the card auto-expands
    expandDwellMs: 1100,    // dwell after auto-expand before the glow settles off
  },
  /** Per-block "typewriter" fill of a suggested card's content (headline →
   *  description → tags). The card mounts already wrapped in the rotating glow
   *  border (.nyla-suggest-glow), so `startDelay` holds that border-glow for ~1s
   *  BEFORE any content types in. Blocks are then spaced and slowed so each
   *  section lands separately — like Nyla thinking it through, one line at a time. */
  fill: {
    startDelay: 1.15,   // s of glowing-border "thinking" before the first block reveals (~1s lead)
    perBlock: 0.75,     // s between successive blocks — the "sectioned out" pause
    duration: 0.7,      // s each block takes to blur/settle in (slowed to emphasize the reveal)
  },
} as const

/* ────────────────────────────────────────────────────────────────────────────
 * SCROLL MOTION  (briefing-v6 — PREVIEW / not yet wired into the scene)
 *
 * Tokens for a JS-driven smooth scroll of the task-card stack: a script animates
 * scrollTop to a card's snap point so the glide has a custom curve (which native
 * CSS scroll-snap can't express). Two curves:
 *   · glide   — clean ease-out, no overshoot (the safe default)
 *   · stretch — slight overshoot then settle, the "stretch" feel requested
 * Honor prefers-reduced-motion by jumping to the target instantly (duration 0).
 * Demoed in Storybook "Design System / Scroll Motion 🆕"; do NOT inline these. */
export const SCROLL = {
  /** Glide — a clean ease-out to a card's snap point, no overshoot (default). */
  glide: { duration: 0.62, ease: [0.22, 1, 0.30, 1] as EaseCurve },
  /** Stretch — overshoot the target, then ease back over a LONGER (~2x) settle.
   *  Two-phase: rise to the peak (riseMs), then a slow eased return (settleMs). */
  stretch: {
    overshoot: 0.045,                                // peak = target + 4.5% of the travel distance
    riseMs: 360,                                     // time to reach the overshoot peak
    settleMs: 720,                                   // ~2x the rise — the slow, eased return
    riseEase:   [0.22, 1, 0.30, 1] as EaseCurve,     // ease-out up to the peak
    settleEase: [0.45, 0, 0.25, 1] as EaseCurve,     // eased return from peak → target
  },
} as const

/* ────────────────────────────────────────────────────────────────────────────
 * NYLA FLIGHT MOTION SET  (welcome → discovery handoff)
 *
 * The shared-element flight of the Nyla orb from the WELCOME screen's centered
 * star straight into the Discovery intro's 160px position (see
 * src/ui/NylaFlight.tsx). The old middle beat (purple wipe → create-plan
 * screen → star-to-slot) does not play on this path — one continuous move,
 * one greeting. She holds shape; scale eases 0.85 → 1 (the star's 136px
 * visual size → the 160px landing) so the handoff is seamless. Scatter →
 * drift → gather is the story, in three distinct beats — explode, breathe,
 * glide home — so it reads as guided, not computed. Choreography, ~1.3s from
 * the "Get started" click:
 *   t=0      the click IS the explosion — the point cloud bursts into the
 *            constellation over burstMs, easing OUT into peak scatter
 *            (violent start, soft settle) while the taglines + CTA fade out
 *            fast (exitMs)
 *   t=0..900 the purple welcome bg soft-crossfades out beneath her
 *            (bgCrossfadeMs), revealing the lavender Discovery background —
 *            the world changes around her while she hangs
 *   t≈450    peak scatter — she HANGS for hangMs (the pause in the middle;
 *            only the ambient rotation/pulse moves)
 *   t=700    lift-off: she drifts as one organism in a straight line, easing
 *            out into the landing position, condensing over the final
 *            gatherFraction (a second ease-out, into her resting spot)
 *   t≈1180   intro copy cascade begins as she condenses (cascadeAtFraction)
 *   t=1300   landed — the intro's 160px orb takes over
 * Menu quick-link entry has no travel: she "gathers in place" at the landing
 * position over gatherInPlaceMs using the same scatter→gather vocabulary.
 * Feel-critical tunables — tune in Storybook "UI / NylaFlight" before editing.
 * All consumers must honor prefers-reduced-motion by skipping the flight and
 * hard-cutting to the settled intro (see prefersReducedMotion below). */
export const NYLA_FLIGHT = {
  /** Welcome exit window — taglines/CTA fade + the orb's pre-flight dwell at
   *  the star position. A dwell/exit beat, near DURATION.micro but spec'd at
   *  200ms in the design session. */
  exitMs: 200,
  /** Lift-off → landing travel time. Matches DURATION.deliberate (600ms). */
  flightMs: DURATION.deliberate * 1000,
  /** The purple welcome background's soft crossfade out beneath her — spans
   *  the burst + hang + early travel, so the scene changes while she pauses. */
  bgCrossfadeMs: 900,
  /** Menu quick-link entry — gather-in-place duration (no travel). */
  gatherInPlaceMs: 400,
  /** Point-cloud radius multiplier at peak scatter (1 = crisp resolved orb).
   *  ~2–3× reads as an airy constellation without losing the silhouette. */
  scatterMax: 2.5,
  /** The click-triggered explosion — how long the point cloud takes to bloom
   *  from the crisp star to peak scatter, anchored at t=0 (the click), easing
   *  OUT into the peak (pathEase — violent start, soft settle). */
  burstMs: 450,
  /** The breath at peak scatter — she hangs, fully bloomed and stationary
   *  (ambient rotation/pulse only), between the burst settling and lift-off.
   *  This pause is what separates the two ease-outs into distinct beats. */
  hangMs: 250,
  /** Final fraction of the flight spent condensing back to the crisp orb
   *  (ease-out — condenses fast, settles gently). */
  gatherFraction: 0.35,
  /** Flight-progress fraction at which the intro copy cascade begins —
   *  she's ~80% of the way home and visibly condensing. */
  cascadeAtFraction: 0.8,
  /** Position easing along the straight-line path — ease-out (EASE.settle):
   *  fast start, soft landing. Per the motion reference (Claude Wiki, "When
   *  to use springs vs easing curves for motion"): ease-out suits entrances
   *  and system-announced changes — respond immediately, land gently. */
  pathEase: EASE.settle,
  /** The welcome star's ambient drop-shadow, carried onto the flight orb at
   *  the handoff and faded out during the scatter so the glow doesn't cut.
   *  Single source of truth — WelcomeSequence builds the star's filter from
   *  these same values. (Component form, not a CSS string, because the flight
   *  animates the alpha per frame.) */
  liftGlow: { blurPx: 22, rgb: '128,186,255', alpha: 0.55 },
} as const

/* prefers-reduced-motion fallbacks. When true, consumers should skip the glow
 * ramp, the border trace, and the typing/blur — and jump to end state. */
export const REDUCED = {
  /** Static soft purple ring shown instead of the tracing border. */
  staticSuggestRing: '0 0 0 1px rgba(139,55,200,0.45)',
} as const

/* Convenience ─────────────────────────────────────────────────────────────── */
export const DEFAULT_EASE: EaseName = 'settle'
export const DEFAULT_DURATION: DurationName = 'standard'

/* Small hook-free helper so components don't each re-implement the media query.
 * Returns true when the user has requested reduced motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
