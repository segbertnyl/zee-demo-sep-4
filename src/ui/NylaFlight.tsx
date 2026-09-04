/* ---------------------------------------------------------------------------
 * NylaFlight — shared-element flight of the Nyla orb.
 *
 * Welcome → Discovery handoff, in three beats — explode, breathe, glide home:
 * the click IS the explosion (the star bursts into an airy constellation over
 * burstMs, easing OUT into peak scatter), she HANGS at the peak for hangMs
 * (the pause that separates the beats — ambient rotation/pulse only), then
 * lifts and drifts as one organism in a straight line — ease-out, fast start
 * / soft landing — condensing into the crisp 160px orb at the Discovery
 * intro's landing position (gather, a second ease-out into rest). She holds
 * shape; scale eases 0.85 → 1 (the star's visual size → the 160 landing)
 * along the travel curve.
 *
 * FLIP-style: rects are measured with getBoundingClientRect at trigger time
 * (captureNylaFlightSource) and at landing-layout time (the consumer measures
 * its own intro orb). The layer is portaled to document.body at z-[220] so it
 * sits above both the onboarding root (z-200) and the Discovery root (z-190).
 *
 * Modes:
 *   from != null  — full travel (welcome "Get started" path)
 *   from == null  — "gather in place": starts as a loose cloud at the landing
 *                   position and condenses (menu quick-link path)
 *
 * prefers-reduced-motion: renders nothing and fires onCascade/onLanded
 * immediately — consumers hard-cut to the settled intro.
 *
 * All timing/feel defaults come from the NYLA_FLIGHT set in src/motion.ts and
 * are tunable via Storybook "UI / NylaFlight".
 * ------------------------------------------------------------------------- */
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cubicBezier } from 'motion/react'
import { Nyla } from './Nyla'
import { NYLA_FLIGHT, prefersReducedMotion } from '@/motion'

export interface FlightRect {
  left: number
  top: number
  width: number
  height: number
  /** The source orb's wrapper rotation at capture time (deg, normalized to
   *  ±180). The flight starts at this angle and unwinds to 0 en route so the
   *  handoff doesn't visibly re-seed the constellation. */
  rotationDeg?: number
}

/* --------------------------------------------------------------------------
 * Source handoff — WelcomeSequence measures its star at trigger time (before
 * the onboarding root unmounts); DiscoveryFlow consumes the rect when the
 * flight layer mounts. Module-level because the two overlays never co-render
 * the same tree. Path discrimination itself lives in the store
 * (discoveryFromOnboarding) — this is only the transient measurement.
 * ------------------------------------------------------------------------ */
let pendingSource: FlightRect | null = null

/** Measure the orb inside `slotId` (falls back to the slot itself) and stash
 *  it as the flight source. Also hides the slot orb + any `hideIds` elements
 *  instantly so two Nylas are never visible once the flight layer owns her —
 *  via `visibility`, which framer-motion never animates, so a queued transform
 *  animation on the element can't clobber the hide. `snapToSize` recenters the
 *  rect to a square of that size — the source orb may be mid-rotation at
 *  capture, which inflates its bounding rect. */
export function captureNylaFlightSource(slotId: string, hideIds: string[] = [], snapToSize?: number): void {
  const slot = document.getElementById(slotId)
  if (!slot) {
    pendingSource = null
    return
  }
  const aura = slot.querySelector('[data-aura]') ?? slot
  const r = aura.getBoundingClientRect()
  /* Accumulate any wrapper rotation between the orb and the slot (the welcome
   * star idles inside a slow-spinning wrapper) so the flight orb can start at
   * the same angle — otherwise the swap visibly re-seeds the dot pattern. */
  let rotationDeg = 0
  let el: HTMLElement | null = aura instanceof HTMLElement ? aura : null
  while (el && el !== slot.parentElement) {
    const t = getComputedStyle(el).transform
    if (t && t !== 'none') {
      const m = new DOMMatrixReadOnly(t)
      rotationDeg += Math.atan2(m.b, m.a) * (180 / Math.PI)
    }
    el = el.parentElement
  }
  rotationDeg = ((rotationDeg % 360) + 540) % 360 - 180 // normalize to ±180
  if (snapToSize) {
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    pendingSource = { left: cx - snapToSize / 2, top: cy - snapToSize / 2, width: snapToSize, height: snapToSize, rotationDeg }
  } else {
    pendingSource = { left: r.left, top: r.top, width: r.width, height: r.height, rotationDeg }
  }
  slot.style.visibility = 'hidden'
  for (const id of hideIds) {
    const el = document.getElementById(id)
    if (el) el.style.visibility = 'hidden'
  }
}

export function consumeNylaFlightSource(): FlightRect | null {
  const r = pendingSource
  pendingSource = null
  return r
}

/* -------------------------------------------------------------------------- */

const clamp01 = (t: number) => Math.max(0, Math.min(1, t))

export interface NylaFlightProps {
  /** Source rect (the welcome star). null → gather-in-place at `to`. */
  from: FlightRect | null
  /** Landing rect — the intro orb's own box (measure its [data-aura]). */
  to: FlightRect
  /** Landing render size — a ramp endpoint (160 for the Discovery intro). */
  size?: number
  /** Saved orb view — match the DESTINATION orb's variant so the landing
   *  handoff doesn't swap configs mid-frame (e.g. "on-light" for Discovery). */
  variant?: string
  /** The welcome-text exit window — one input to the pre-flight dwell,
   *  which is max(holdMs, burstMs) + hangMs. */
  holdMs?: number
  flightMs?: number
  gatherInPlaceMs?: number
  scatterMax?: number
  /** Click-anchored explosion duration — crisp star → peak scatter from t=0. */
  burstMs?: number
  /** The breath at peak scatter — hang time between the burst settling
   *  (max(holdMs, burstMs)) and lift-off. */
  hangMs?: number
  gatherFraction?: number
  cascadeAtFraction?: number
  /** Fires once as she condenses — start the intro copy cascade. */
  onCascade?: () => void
  /** Fires once on landing — swap in the destination's own orb, unmount this. */
  onLanded?: () => void
}

export function NylaFlight({
  from,
  to,
  size = 160,
  variant,
  holdMs = NYLA_FLIGHT.exitMs,
  flightMs = NYLA_FLIGHT.flightMs,
  gatherInPlaceMs = NYLA_FLIGHT.gatherInPlaceMs,
  scatterMax = NYLA_FLIGHT.scatterMax,
  burstMs = NYLA_FLIGHT.burstMs,
  hangMs = NYLA_FLIGHT.hangMs,
  gatherFraction = NYLA_FLIGHT.gatherFraction,
  cascadeAtFraction = NYLA_FLIGHT.cascadeAtFraction,
  onCascade,
  onLanded,
}: NylaFlightProps) {
  const reduce = prefersReducedMotion()
  const orbRef = useRef<HTMLDivElement | null>(null)
  /* Travel mode starts crisp at the slot; gather-in-place starts as a loose
   * cloud at the landing position. */
  const spreadRef = useRef(from ? 1 : scatterMax)
  /* Latest-callback refs so the RAF loop never sees stale closures. */
  const cascadeRef = useRef(onCascade)
  const landedRef = useRef(onLanded)
  useEffect(() => {
    cascadeRef.current = onCascade
    landedRef.current = onLanded
  })

  /* Reduced motion — skip the flight entirely, hard-cut to the settled state. */
  useEffect(() => {
    if (!reduce) return
    cascadeRef.current?.()
    landedRef.current?.()
  }, [reduce])

  useEffect(() => {
    if (reduce) return
    const el = orbRef.current
    if (!el) return

    const toCx = to.left + to.width / 2
    const toCy = to.top + to.height / 2
    const traveling = from != null
    const fromCx = traveling ? from.left + from.width / 2 : toCx
    const fromCy = traveling ? from.top + from.height / 2 : toCy
    const startScale = traveling ? from.width / size : 1
    const durationMs = traveling ? flightMs : gatherInPlaceMs
    /* Lift-off waits for the bloom to settle (whichever of the text-exit
     * window or the burst runs longer) plus the hang — the mid-journey pause
     * that separates the explosion ease-out from the travel ease-out. */
    const dwellMs = traveling ? Math.max(holdMs, burstMs) + hangMs : 0

    /* Drift path — a straight line across the stage, eased with the ease-out
     * pathEase (fast start, soft landing). No bow, no bézier. */
    const dx = toCx - fromCx
    const dy = toCy - fromCy
    /* Handoff continuity: start at the star wrapper's captured rotation and
     * unwind to 0 en route; carry the star's drop-shadow and fade it out
     * across the scatter so the glow never cuts. */
    const startRot = traveling ? (from.rotationDeg ?? 0) : 0
    const glow = NYLA_FLIGHT.liftGlow

    const pathEase = cubicBezier(...NYLA_FLIGHT.pathEase)

    const apply = (elapsedMs: number) => {
      /* p — flight progress 0..1 (post-dwell). The burst runs on raw elapsed
       * instead so the explosion is anchored at the click, not at lift-off. */
      const p = clamp01((elapsedMs - dwellMs) / durationMs)
      const e = pathEase(p)
      const cx = fromCx + dx * e
      const cy = fromCy + dy * e
      /* She holds shape; scale eases along the same curve (0.85 → 1 on the
       * main path — the star's visual size to the 160 landing). */
      const s = startScale + (1 - startScale) * e
      /* Scatter envelope: burst on click → drift bloomed → gather. Both ends
       * ease out (pathEase) — violent start, soft settle. */
      let spread: number
      const burst = burstMs > 0 ? pathEase(clamp01(elapsedMs / burstMs)) : 1
      if (!traveling) {
        spread = scatterMax + (1 - scatterMax) * pathEase(p)
      } else {
        /* Burst × gather composed multiplicatively — the dwell guarantees the
         * burst settles before lift-off, but composing keeps the envelope
         * continuous under any prop combination. */
        const gather = p < 1 - gatherFraction ? 0 : pathEase((p - (1 - gatherFraction)) / gatherFraction)
        spread = 1 + (scatterMax - 1) * burst * (1 - gather)
      }
      spreadRef.current = spread
      el.style.transform = `translate3d(${(cx - size / 2).toFixed(2)}px, ${(cy - size / 2).toFixed(2)}px, 0) scale(${s.toFixed(4)}) rotate(${(startRot * (1 - e)).toFixed(2)}deg)`
      if (traveling) {
        /* Glow dissolves as she blooms — tied to the same burst envelope. */
        const a = glow.alpha * (1 - burst)
        el.style.filter = a > 0.01 ? `drop-shadow(0 0 ${glow.blurPx}px rgba(${glow.rgb},${a.toFixed(3)}))` : 'none'
      }
      return p
    }

    apply(0)

    let raf = 0
    let cascaded = false
    let landed = false
    const start = performance.now()
    const loop = (now: number) => {
      const elapsed = now - start
      const p = apply(elapsed)
      if (!cascaded && p >= cascadeAtFraction) {
        cascaded = true
        cascadeRef.current?.()
      }
      if (p >= 1) {
        if (!landed) {
          landed = true
          landedRef.current?.()
        }
        return
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [reduce, from, to, size, holdMs, flightMs, gatherInPlaceMs, scatterMax, burstMs, hangMs, gatherFraction, cascadeAtFraction])

  if (reduce) return null

  /* Initial transform/filter match frame 0 so there's no flash at (0,0) and
   * no glow cut before the RAF loop takes over. */
  const initCx = from ? from.left + from.width / 2 : to.left + to.width / 2
  const initCy = from ? from.top + from.height / 2 : to.top + to.height / 2
  const initScale = from ? from.width / size : 1
  const initRot = from?.rotationDeg ?? 0
  const initGlow = from
    ? `drop-shadow(0 0 ${NYLA_FLIGHT.liftGlow.blurPx}px rgba(${NYLA_FLIGHT.liftGlow.rgb},${NYLA_FLIGHT.liftGlow.alpha}))`
    : 'none'

  return createPortal(
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[220]">
      <div
        ref={orbRef}
        data-testid="nyla-flight-orb"
        data-flight-mode={from ? 'travel' : 'gather'}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: size,
          height: size,
          transformOrigin: 'center',
          willChange: 'transform, filter',
          transform: `translate3d(${initCx - size / 2}px, ${initCy - size / 2}px, 0) scale(${initScale}) rotate(${initRot}deg)`,
          filter: initGlow,
        }}
      >
        <Nyla size={size} variant={variant} animate condense={false} spreadRef={spreadRef} />
      </div>
    </div>,
    document.body,
  )
}
