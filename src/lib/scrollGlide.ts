/* JS-driven smooth scroll — animates an element's scrollTop along a cubic-bézier
 * curve. Native CSS scroll-snap snaps instantly and can't take a custom easing;
 * this gives the briefing card stack a real glide + snap-to-card (see @/motion
 * SCROLL.glide). Demoed in Storybook "Design System / Scroll Motion". */

export type EaseCurve = [number, number, number, number]

/* Evaluate a cubic-bézier easing at progress x (Newton-Raphson on X). Returns y,
 * which may exceed 1 for overshoot curves. */
export function cubicBezier([x1, y1, x2, y2]: EaseCurve): (x: number) => number {
  const cx = 3 * x1,
    bx = 3 * (x2 - x1) - cx,
    ax = 1 - cx - bx
  const cy = 3 * y1,
    by = 3 * (y2 - y1) - cy,
    ay = 1 - cy - by
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx
  return (x: number) => {
    let t = x
    for (let i = 0; i < 8; i++) {
      const d = sampleX(t) - x
      const s = slopeX(t)
      if (Math.abs(d) < 1e-5 || s === 0) break
      t -= d / s
    }
    return sampleY(t)
  }
}

interface GlideOpts {
  durationMs: number
  ease: EaseCurve
  onDone?: () => void
}

/* Animate el.scrollTop to `to` along the curve. Returns a cancel function. */
export function glideScrollTop(el: HTMLElement, to: number, { durationMs, ease, onDone }: GlideOpts): () => void {
  const from = el.scrollTop
  const delta = to - from
  if (Math.abs(delta) < 1) {
    onDone?.()
    return () => {}
  }
  const curve = cubicBezier(ease)
  let raf = 0
  let start: number | null = null
  let cancelled = false
  const frame = (ts: number) => {
    if (cancelled) return
    if (start === null) start = ts
    const p = Math.min(1, (ts - start) / durationMs)
    el.scrollTop = from + delta * curve(p)
    if (p < 1) raf = requestAnimationFrame(frame)
    else onDone?.()
  }
  raf = requestAnimationFrame(frame)
  return () => {
    cancelled = true
    cancelAnimationFrame(raf)
  }
}
