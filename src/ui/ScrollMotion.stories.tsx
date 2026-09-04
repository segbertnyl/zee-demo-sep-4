import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { SCROLL, type EaseCurve } from '@/motion'

/* 🆕 PREVIEW (briefing-v6) — JS-driven smooth scroll for the task-card stack.
 *
 * Native CSS `scroll-snap` snaps instantly and can't take a custom easing curve.
 * A script-driven scroll animates `scrollTop` to a card's snap point so the glide
 * has a real curve — and "stretch" overshoots the target, then eases back over a
 * longer settle. A scroll-end snap "locks" the rest position to a full card at
 * the top (no partial cards). This is a sandbox; it is NOT wired into the
 * Briefing scene yet. Toggle the curve, then scroll / click / use the controls.
 *
 * Tokens: src/motion.ts → SCROLL (glide / stretch). */

export default {
  title: 'Design System / Scroll Motion  🆕',
  parameters: { layout: 'centered', controls: { disable: true } },
} satisfies Meta

type Story = StoryObj

const CARDS = [
  { id: 'sandra', label: 'Lapse risk', title: 'Call Sandra Kim before 10AM', tone: 'var(--badge-lapse)' },
  { id: 'laura', label: 'Qualified appt prep', title: 'Contact Laura Mendez', tone: 'var(--nyl-orange-700)' },
  { id: 'sunshine', label: 'Event nearby', title: 'Sunshine Country Club', tone: 'var(--nyl-blue-600)' },
  { id: 'thomas', label: 'Closing window', title: 'Reach Thomas Reyes', tone: 'var(--nyl-orange-700)' },
  { id: 'leads', label: 'New conversions', title: 'Two new leads', tone: 'var(--nyl-blue-600)' },
  { id: 'gloria', label: 'Book transfer', title: 'Introduce yourself to Gloria', tone: 'var(--nyl-blue-600)' },
]

/* Evaluate a cubic-bézier easing curve at progress x (Newton-Raphson on X).
 * Returns y, which may exceed 1 for overshoot curves. */
function cubicBezier([x1, y1, x2, y2]: EaseCurve) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by
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

function ScrollMotionDemo() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | undefined>(undefined)
  const glidingRef = useRef(false)               // true while a programmatic glide runs
  const snapTimer = useRef<number | undefined>(undefined)
  const stretchRef = useRef(false)               // current curve, read inside rAF/handlers
  const [stretch, setStretch] = useState(false)
  const [index, setIndex] = useState(0)

  const cardTop = (el: HTMLDivElement, id: string) => {
    const card = el.querySelector<HTMLElement>(`[data-demo-card="${id}"]`)
    if (!card) return null
    return card.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop
  }

  /* Animate scrollTop a → b over durMs along an eased curve, then onDone. */
  const runPhase = (el: HTMLDivElement, a: number, b: number, durMs: number, ease: (x: number) => number, onDone?: () => void) => {
    const delta = b - a
    let start: number | null = null
    const frame = (ts: number) => {
      if (start === null) start = ts
      const p = Math.min(1, (ts - start) / durMs)
      el.scrollTop = a + delta * ease(p)           // ease(p) may exceed 1 → overshoot
      if (p < 1) rafRef.current = requestAnimationFrame(frame)
      else onDone?.()
    }
    rafRef.current = requestAnimationFrame(frame)
  }

  /* Glide a card to the top using the active curve. */
  const glideTo = (i: number) => {
    const el = scrollRef.current
    if (!el) return
    const clamped = Math.max(0, Math.min(i, CARDS.length - 1))
    setIndex(clamped)
    const to = cardTop(el, CARDS[clamped].id)
    if (to === null) return
    const from = el.scrollTop
    if (Math.abs(to - from) < 1) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    glidingRef.current = true
    const done = () => { glidingRef.current = false }
    if (stretchRef.current) {
      const peak = to + (to - from) * SCROLL.stretch.overshoot
      runPhase(el, from, peak, SCROLL.stretch.riseMs, cubicBezier(SCROLL.stretch.riseEase), () =>
        runPhase(el, peak, to, SCROLL.stretch.settleMs, cubicBezier(SCROLL.stretch.settleEase), done),
      )
    } else {
      runPhase(el, from, to, SCROLL.glide.duration * 1000, cubicBezier(SCROLL.glide.ease), done)
    }
  }

  /* Snap-lock — after a manual scroll settles, glide the nearest card to the top
   * so the rest position is ALWAYS a full card (never a partial one). */
  const onScroll = () => {
    if (glidingRef.current) return
    window.clearTimeout(snapTimer.current)
    snapTimer.current = window.setTimeout(() => {
      const el = scrollRef.current
      if (!el) return
      let nearest = 0, best = Infinity
      CARDS.forEach((c, i) => {
        const t = cardTop(el, c.id)
        if (t === null) return
        const d = Math.abs(t - el.scrollTop)
        if (d < best) { best = d; nearest = i }
      })
      if (best > 2) glideTo(nearest)
      else setIndex(nearest)
    }, 130)
  }

  const setMode = (s: boolean) => { stretchRef.current = s; setStretch(s) }

  return (
    <div className="w-[440px] font-sans">
      {/* curve toggle */}
      <div className="mb-3 flex items-center gap-2">
        {(['glide', 'stretch'] as const).map((mode) => {
          const active = (mode === 'stretch') === stretch
          return (
            <button
              key={mode}
              type="button"
              onClick={() => setMode(mode === 'stretch')}
              className={[
                'rounded-full border px-3 py-1 text-[12px] font-medium capitalize transition-colors',
                active
                  ? 'border-[var(--nyl-blue-500)] bg-[var(--nyl-blue-050)] text-[var(--nyl-blue-600)]'
                  : 'border-[var(--border-default)] text-[var(--text-body-muted)] hover:bg-[var(--bg-surface)]',
              ].join(' ')}
            >
              {mode}
            </button>
          )
        })}
        <span className="ml-auto text-[11px] text-[var(--text-body-faint)]">
          {stretch ? `${SCROLL.stretch.riseMs}ms rise · ${SCROLL.stretch.settleMs}ms eased settle` : `${Math.round(SCROLL.glide.duration * 1000)}ms · ease-out · snap-locked`}
        </span>
      </div>

      {/* scroll stage — free scroll, but snaps to a full card when it settles */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="h-[360px] overflow-y-auto rounded-[14px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3"
      >
        <div className="space-y-3 pb-[280px]">
          {CARDS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              data-demo-card={c.id}
              onClick={() => glideTo(i)}
              className={[
                'block w-full rounded-[12px] border bg-white p-4 text-left transition-shadow',
                i === index ? 'border-[var(--nyl-blue-200)] shadow-[0_8px_28px_-14px_rgba(23,24,28,0.25)]' : 'border-[var(--border-subtle)]',
              ].join(' ')}
            >
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.1em]"
                style={{ color: c.tone, background: 'color-mix(in srgb, currentColor 10%, transparent)' }}
              >
                <span className="size-1.5 rounded-full bg-current" />
                {c.label}
              </span>
              <p className="mt-2 font-serif text-[18px] text-[var(--text-headline)]">{c.title}</p>
              <p className="mt-1 text-[12.5px] text-[var(--text-body-muted)]">Scroll freely — it snaps a full card to the top.</p>
            </button>
          ))}
        </div>
      </div>

      {/* controls */}
      <div className="mt-3 flex items-center gap-2">
        <button type="button" onClick={() => glideTo(index - 1)} className="rounded-lg border border-[var(--border-default)] px-3 py-1.5 text-[13px] font-medium text-[var(--text-body)] hover:bg-[var(--bg-surface)]">↑ Prev</button>
        <button type="button" onClick={() => glideTo(index + 1)} className="rounded-lg border border-[var(--border-default)] px-3 py-1.5 text-[13px] font-medium text-[var(--text-body)] hover:bg-[var(--bg-surface)]">↓ Next</button>
        <button type="button" onClick={() => glideTo(0)} className="ml-auto text-[13px] font-medium text-[var(--nyl-blue-500)] hover:text-[var(--nyl-blue-600)]">Back to top</button>
      </div>

      <p className="mt-3 text-[11.5px] leading-[1.5] text-[var(--text-body-faint)]">
        Preview only — not wired into the Briefing yet. <strong>Glide</strong> snap-locks to a full card on scroll-end; <strong>stretch</strong> overshoots then eases back (~2× settle). Curves: <code>SCROLL</code> in <code>@/motion</code>.
      </p>
    </div>
  )
}

export const Playground: Story = {
  render: () => <ScrollMotionDemo />,
}
