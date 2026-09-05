/* ---------------------------------------------------------------------------
 * NylaFlight — Storybook tuning stage.
 *
 * Replays the welcome → Discovery flight in isolation with live controls for
 * every NYLA_FLIGHT param (src/motion.ts). Change a control, hit Replay.
 * Mirrors the real choreography: the welcome star (160 at 0.85 visual scale)
 * centered on the purple gradient bursts into the constellation at the click
 * (burstMs, ease-out), lifts already bloomed, drifts in a straight line
 * (ease-out — fast start, soft landing) and gathers onto the Discovery intro
 * position while the purple soft-crossfades out beneath her (bgCrossfadeMs).
 *
 * Stories:
 *   Flight        — full travel: welcome star (160) → landing (160)
 *   GatherInPlace — menu quick-link entry: no travel, condenses at the landing
 *   LandedStatic  — deterministic end state (frozen orb) for visual snapshots
 * --------------------------------------------------------------------------- */
import type { Meta, StoryObj } from '@storybook/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { NylaFlight, type FlightRect } from './NylaFlight'
import { Nyla } from './Nyla'
import { LoadingBackground } from './LoadingBackground'
import { NYLA_FLIGHT, EASE, DURATION, prefersReducedMotion } from '@/motion'

/* The welcome background — same token stops as WelcomeSequence's gradient. */
const WELCOME_PURPLE =
  'linear-gradient(145deg, var(--nyl-purple-900) 0%, var(--nyl-purple-600) 39%, var(--nyl-purple-500) 56%, var(--nyl-purple-400) 71%)'

interface StageProps {
  mode: 'flight' | 'gather'
  /** Render the landed orb static — deterministic for visual snapshots. */
  freezeOnLand: boolean
  holdMs: number
  flightMs: number
  bgCrossfadeMs: number
  gatherInPlaceMs: number
  scatterMax: number
  burstMs: number
  hangMs: number
  gatherFraction: number
  cascadeAtFraction: number
}

function FlightStage({
  mode,
  freezeOnLand,
  holdMs,
  flightMs,
  bgCrossfadeMs,
  gatherInPlaceMs,
  scatterMax,
  burstMs,
  hangMs,
  gatherFraction,
  cascadeAtFraction,
}: StageProps) {
  const sourceRef = useRef<HTMLDivElement | null>(null)
  const targetRef = useRef<HTMLDivElement | null>(null)
  const [phase, setPhase] = useState<'idle' | 'flying' | 'landed'>('idle')
  const [revealed, setRevealed] = useState(false)
  const [rects, setRects] = useState<{ from: FlightRect | null; to: FlightRect } | null>(null)
  const [runKey, setRunKey] = useState(0)

  const play = useCallback(() => {
    const s = sourceRef.current?.getBoundingClientRect()
    const t = targetRef.current?.getBoundingClientRect()
    if (!t) return
    setRevealed(false)
    setPhase('flying')
    /* Mirror production: the welcome star is a 160 orb at 0.85 visual scale,
     * so the flight starts at startScale 0.85 and eases to 1. */
    const visual = 160 * 0.85
    setRects({
      from:
        mode === 'flight' && s
          ? {
              left: s.left + s.width / 2 - visual / 2,
              top: s.top + s.height / 2 - visual / 2,
              width: visual,
              height: visual,
            }
          : null,
      to: { left: t.left, top: t.top, width: t.width, height: t.height },
    })
    setRunKey((k) => k + 1)
  }, [mode])

  /* Auto-play once on mount (after layout). Controls need a Replay to apply. */
  useEffect(() => {
    const id = requestAnimationFrame(play)
    return () => cancelAnimationFrame(id)
  }, [play])

  const cascade = (delay: number) => ({
    initial: false as const,
    animate: { opacity: revealed ? 1 : 0, y: revealed ? 0 : 8 },
    transition: { duration: DURATION.quick, ease: EASE.settle, delay },
  })

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <LoadingBackground style={{ position: 'absolute', inset: 0 }} />

      {/* Welcome purple — soft-crossfades out beneath her once the flight
          starts (flight mode only; the menu path never shows it). Hard cut
          under prefers-reduced-motion, matching the flight contract. */}
      {mode === 'flight' && (
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={{ opacity: phase === 'idle' ? 1 : 0 }}
          transition={{ duration: prefersReducedMotion() ? 0 : bgCrossfadeMs / 1000, ease: EASE.standard }}
          style={{ position: 'absolute', inset: 0, background: WELCOME_PURPLE, pointerEvents: 'none' }}
        />
      )}

      {/* Source — the centered welcome star stand-in (160, holds scale) */}
      {mode === 'flight' && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '40%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            ref={sourceRef}
            style={{
              width: 160,
              height: 160,
              borderRadius: '50%',
              /* Outline only while the purple is up — it has no business on
               * the lavender landing background. */
              outline: phase === 'idle' ? '1px dashed var(--nyl-purple-100)' : 'none',
              outlineOffset: 4,
              /* The welcome star renders at 0.85 visual scale. */
              transform: 'scale(0.85)',
            }}
          >
            {phase === 'idle' && <Nyla size={160} animate condense={false} />}
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-[var(--nyl-purple-100)]">
            Welcome star (160)
          </p>
        </div>
      )}

      {/* Landing — the Discovery intro stand-in */}
      <div style={{ position: 'absolute', left: '38%', top: '50%', transform: 'translateY(-50%)', width: 560 }}>
        <div ref={targetRef} style={{ width: 160, height: 160 }}>
          {phase === 'landed' && (
            <div data-testid="nyla-flight-landed">
              <Nyla size={160} variant="on-light" animate={!freezeOnLand} condense={false} />
            </div>
          )}
        </div>
        <motion.h1 {...cascade(0)} className="mt-6 font-serif text-[32px] leading-[1.2] text-[var(--nyl-blue-800)]">
          Hi, Sarah. I'm Nyla.
        </motion.h1>
        <motion.p {...cascade(0.12)} className="mt-4 text-[15px] text-[var(--text-body)]">
          The copy cascade starts as she condenses — headline, then body, then CTA.
        </motion.p>
        <motion.div {...cascade(0.32)}>
          <button
            type="button"
            onClick={play}
            className="mt-6 rounded-md bg-[var(--nyl-blue-600)] px-6 py-2.5 text-[13px] font-semibold text-[var(--action-on-primary)]"
          >
            I'm ready
          </button>
        </motion.div>
      </div>

      {/* Stage controls */}
      <button
        type="button"
        data-testid="replay"
        onClick={play}
        className="absolute right-8 top-8 z-10 rounded-md border border-[var(--text-body-muted)] bg-[var(--bg-surface-elevated)] px-4 py-2 text-[12px] font-semibold text-[var(--text-body)]"
        style={{ cursor: 'pointer' }}
      >
        Replay {mode === 'flight' ? 'flight' : 'gather'}
      </button>
      <p className="absolute bottom-6 left-8 text-[11px] uppercase tracking-[0.14em] text-[var(--text-body-muted)]">
        phase: {phase}
      </p>

      {phase === 'flying' && rects && (
        <NylaFlight
          key={runKey}
          from={rects.from}
          to={rects.to}
          variant="on-light"
          holdMs={holdMs}
          flightMs={flightMs}
          gatherInPlaceMs={gatherInPlaceMs}
          scatterMax={scatterMax}
          burstMs={burstMs}
          hangMs={hangMs}
          gatherFraction={gatherFraction}
          cascadeAtFraction={cascadeAtFraction}
          onCascade={() => setRevealed(true)}
          onLanded={() => {
            setRevealed(true)
            setPhase('landed')
          }}
        />
      )}
    </div>
  )
}

const meta = {
  title: 'UI / NylaFlight 🆕',
  id: 'ui-nylaflight', // pin the story ID so the emoji doesn't change URLs
  component: FlightStage,
  parameters: { layout: 'fullscreen', backgrounds: { disable: true } },
  args: {
    mode: 'flight',
    freezeOnLand: false,
    holdMs: NYLA_FLIGHT.exitMs,
    flightMs: NYLA_FLIGHT.flightMs,
    bgCrossfadeMs: NYLA_FLIGHT.bgCrossfadeMs,
    gatherInPlaceMs: NYLA_FLIGHT.gatherInPlaceMs,
    scatterMax: NYLA_FLIGHT.scatterMax,
    burstMs: NYLA_FLIGHT.burstMs,
    hangMs: NYLA_FLIGHT.hangMs,
    gatherFraction: NYLA_FLIGHT.gatherFraction,
    cascadeAtFraction: NYLA_FLIGHT.cascadeAtFraction,
  },
  argTypes: {
    mode: { control: 'inline-radio', options: ['flight', 'gather'] },
    holdMs: { control: { type: 'range', min: 0, max: 800, step: 20 } },
    flightMs: { control: { type: 'range', min: 200, max: 2000, step: 50 } },
    bgCrossfadeMs: { control: { type: 'range', min: 200, max: 2000, step: 50 } },
    gatherInPlaceMs: { control: { type: 'range', min: 100, max: 1500, step: 50 } },
    scatterMax: { control: { type: 'range', min: 1, max: 4, step: 0.1 } },
    burstMs: { control: { type: 'range', min: 80, max: 800, step: 20 } },
    hangMs: { control: { type: 'range', min: 0, max: 800, step: 25 } },
    gatherFraction: { control: { type: 'range', min: 0.1, max: 0.6, step: 0.05 } },
    cascadeAtFraction: { control: { type: 'range', min: 0.4, max: 1, step: 0.05 } },
  },
} satisfies Meta<typeof FlightStage>

export default meta
type Story = StoryObj<typeof meta>

/** Full travel — the welcome star lifts, scatters, drifts and gathers onto
 *  the landing while the purple crossfades out beneath her. */
export const Flight: Story = {
  args: {
    flightMs: 1100,
    scatterMax: 2.9,
    cascadeAtFraction: 0.6,
  },
}

/** Menu quick-link entry — no travel; she gathers in place at the landing. */
export const GatherInPlace: Story = {
  args: { mode: 'gather' },
}

/** Deterministic end state for visual regression — orb frozen after landing. */
export const LandedStatic: Story = {
  args: { freezeOnLand: true, flightMs: 400, holdMs: 0 },
}
