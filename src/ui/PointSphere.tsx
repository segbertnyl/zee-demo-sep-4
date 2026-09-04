/* ---------------------------------------------------------------------------
 * NYLA — The Collective.
 * Rotating point-cloud sphere. Config (dotScale, glowScale, minOpacity)
 * comes from nyla-config.ts defaults, overridden by localStorage (dev), and
 * overridden again by explicit props (Storybook playground).
 *
 * Performance (prototype-grade):
 *   - translate3d() for position — compositor only, no layout reflow
 *   - scale() for dot size — no per-frame width/height writes
 *   - Opacity-only depth cueing — filter:blur() removed
 *   - 30fps cap
 * ------------------------------------------------------------------------- */
import { useEffect, useMemo, useRef } from 'react'
import { NYL, rand } from './nyla-palette'
import { loadOrbConfigForSize } from './nyla-config'

const clampN = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n))

/** Auto point density for a render size — fewer, larger dots read cleaner at
 *  prototype sizes. Used when the resolved config has points: null (auto). */
export function recommendedPoints(size: number): number {
  return Math.round(clampN(20 + Math.pow(size, 0.75) * 0.55, 20, 120))
}

function fibonacciSphere(n: number): [number, number, number][] {
  const pts: [number, number, number][] = []
  const phi = Math.PI * (3 - Math.sqrt(5))
  const J = 0.16
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = phi * i
    let x = Math.cos(theta) * r
    let yy = y
    let z = Math.sin(theta) * r
    x += (rand(i) * 2 - 1) * J
    yy += (rand(i + 7) * 2 - 1) * J
    z += (rand(i + 13) * 2 - 1) * J
    const len = Math.hypot(x, yy, z) || 1
    pts.push([x / len, yy / len, z / len])
  }
  return pts
}

// Full tonal range: light (pops on dark bg) → dark (pops on light bg)
const SPHERE_COLORS = ['#ffffff', '#e8f0ff', '#93c5fd', '#60a5fa', NYL.blueLight, '#3B6CF8', '#2f6bff', '#0044cc']
/* Purple mirror of the blue ramp — same tonal spread. Deliberately stops at
 * #7e22ce: the brand purple (NYL.purple, #4d1773) reads near-black at dot
 * size, so the deep end stays luminous instead. Per-dot blend via purpleMix. */
const SPHERE_COLORS_PURPLE = ['#ffffff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce']

/* Deterministic per-dot color: each dot flips to the purple ramp with
 * probability `purpleMix` (0 = all blue, 1 = all purple) — stable across
 * renders, same tonal index either way. */
function dotColor(i: number, purpleMix: number): string {
  const ramp = rand(i * 2.3 + 5) < purpleMix ? SPHERE_COLORS_PURPLE : SPHERE_COLORS
  return ramp[Math.floor(rand(i * 1.7) * ramp.length)]
}

const mixRgb = (a: [number, number, number], b: [number, number, number], t: number) =>
  a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')

export function PointSphere({
  size,
  count,
  animate = true,
  variant,
  condense = true,
  spreadRef,
  dotScale: dotScaleProp,
  glowScale: glowScaleProp,
  minOpacity: minOpacityProp,
  rotationSpeed: rotationSpeedProp,
  purpleMix: purpleMixProp,
  haloStrength: haloStrengthProp,
}: {
  size: number
  /** Explicit dot count — overrides the saved config; omit for config/auto. */
  count?: number
  animate?: boolean
  variant?: string
  /** When false, skip the 2s exploded-mount intro and render resolved from the
   *  first frame — used when another layer (e.g. NylaFlight) owns the gather. */
  condense?: boolean
  /** Per-frame radius multiplier read inside the render loop (1 = resolved orb,
   *  >1 = loosened constellation). Pass a stable ref; NylaFlight animates it. */
  spreadRef?: { current: number }
  dotScale?: number
  glowScale?: number
  minOpacity?: number
  rotationSpeed?: number
  /** Particle blue↔purple blend override (0 = all blue, 1 = all purple). */
  purpleMix?: number
  /** Ambient background-glow intensity override (0 = off, 1 = base, 2 = max). */
  haloStrength?: number
}) {
  const dots = useRef<(HTMLSpanElement | null)[]>([])

  // Resolve config — props override the saved per-tier-per-view config
  const cfg = useMemo(() => {
    const saved = loadOrbConfigForSize(size, variant)
    return {
      dotScale:      dotScaleProp      ?? saved.dotScale,
      glowScale:     glowScaleProp     ?? saved.glowScale,
      minOpacity:    minOpacityProp    ?? saved.minOpacity,
      rotationSpeed: rotationSpeedProp ?? saved.rotationSpeed,
      purpleMix:     purpleMixProp     ?? saved.purpleMix,
      haloStrength:  haloStrengthProp  ?? saved.haloStrength,
      /* count prop → saved points → auto density for this size. */
      count:         count             ?? saved.points ?? recommendedPoints(size),
    }
  }, [size, variant, count, dotScaleProp, glowScaleProp, minOpacityProp, rotationSpeedProp, purpleMixProp, haloStrengthProp])

  const pts = useMemo(() => fibonacciSphere(cfg.count), [cfg.count])

  const baseDotPx = size * cfg.dotScale

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const { dotScale, minOpacity, rotationSpeed } = cfg
    const R = 21
    const baseD = size * dotScale
    const cx = size / 2
    const cy = size / 2
    let raf = 0
    let lastT = -1
    let t0 = -1 // set on the first animated frame — condense runs per MOUNT, not per page load

    /* t drives rotation (continuous), elapsed drives the condense intro. */
    const render = (t: number, elapsed: number) => {
      const yaw = t * rotationSpeed
      // Pitch wobble scales with rotation speed (0.4 ratio matches the reference feel)
      const pitch = Math.sin(t * rotationSpeed * 0.4) * 0.28
      const cosYaw = Math.cos(yaw), sinYaw = Math.sin(yaw)
      const cosPitch = Math.cos(pitch), sinPitch = Math.sin(pitch)
      // Start exploded, condense over 2s after mount, then stay resolved forever
      const condenseDuration = 2.0
      const u = condense ? Math.max(0, 1 - elapsed / condenseDuration) : 0
      const env = u * u * (3 - 2 * u) // smoothstep — eases into the resolved state
      /* External spread — NylaFlight's scatter→gather. Per-dot variance keeps
       * the loosened cloud reading as an organic constellation, not a zoom. */
      const spread = spreadRef?.current ?? 1
      for (let i = 0; i < pts.length; i++) {
        const el = dots.current[i]
        if (!el) continue
        const [bx, by, bz] = pts[i]
        const ex = env * (0.4 + rand(i + 21) * 1.4)
        const x = bx + (rand(i + 31) * 2 - 1) * ex
        const y = by + (rand(i + 41) * 2 - 1) * ex
        const z = bz + (rand(i + 51) * 2 - 1) * ex
        const X = x * cosYaw - z * sinYaw
        const Zy = x * sinYaw + z * cosYaw
        const Y = y * cosPitch - Zy * sinPitch
        const Z = y * sinPitch + Zy * cosPitch
        const depth = (Z + 1) / 2
        const pulse = 1 + 0.38 * Math.sin(t * (1.3 + rand(i + 2) * 1.8) + rand(i + 9) * 6.283)
        const scale = (0.4 + 0.7 * depth) * (0.5 + rand(i + 5) * 1.1) * pulse
        const d = baseD * scale
        // Position top-left corner so the scaled dot is centered at (X, Y)
        const spreadI = 1 + (spread - 1) * (0.7 + rand(i + 61) * 0.6)
        const px = cx + X * spreadI * R * size / 100 - d / 2
        const py = cy - Y * spreadI * R * size / 100 - d / 2
        el.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0) scale(${scale.toFixed(3)})`
        el.style.opacity = (minOpacity + (1 - minOpacity) * depth).toFixed(2)
      }
    }

    // Static / reduced-motion: paint one fully-resolved frame (past the condense)
    if (!animate || reduce) { render(1.2, 999); return }

    const loop = () => {
      const t = performance.now() / 1000
      if (t0 < 0) t0 = t
      if (t - lastT >= 1 / 30) { lastT = t; render(t, t - t0) }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [size, pts, animate, cfg, condense, spreadRef])

  /* Ambient glow — blue core wrapped in a violet halo; the core/mid stops
   * shift toward purple as purpleMix rises so the glow tracks the particles. */
  const glowCore = mixRgb([59, 130, 246], [168, 85, 247], cfg.purpleMix)
  const glowMid = mixRgb([4, 104, 255], [126, 34, 206], cfg.purpleMix)
  const haloA = (base: number) => Math.min(1, base * cfg.haloStrength).toFixed(3)

  return (
    <div data-aura style={{ position: 'relative', width: size, height: size }}>
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%,-50%)',
        width: '54%', height: '54%', borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${glowCore},${haloA(0.42)}) 0%, rgba(${glowMid},${haloA(0.24)}) 48%, rgba(139,92,246,${haloA(0.19)}) 62%, transparent 78%)`,
        filter: `blur(${size * 0.025}px)`,
      }} />
      {pts.map((_, i) => {
        const c = dotColor(i, cfg.purpleMix)
        return (
          <span
            key={i}
            ref={(el) => { dots.current[i] = el }}
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: `${baseDotPx}px`,
              height: `${baseDotPx}px`,
              transformOrigin: 'top left',
              borderRadius: '50%',
              background: c,
              boxShadow: `0 0 ${size * cfg.glowScale}px ${c}`,
              willChange: 'transform, opacity',
            }}
          />
        )
      })}
    </div>
  )
}
