import type { Meta, StoryObj } from '@storybook/react'
import { motion, useAnimation } from 'motion/react'
import { useEffect, useState } from 'react'
import { EASE, DURATION, SPRING, NYLA } from '@/motion'

export default {
  title: 'Design System / Motion',
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10.5, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-body-muted)', marginBottom: 20 }}>
      {children}
    </p>
  )
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 32, marginTop: 40 }}>
      <Label>{title}</Label>
    </div>
  )
}

function ReplayButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-body-muted)',
        background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 4,
        padding: '2px 8px', cursor: 'pointer', letterSpacing: '0.06em',
      }}
    >
      replay
    </button>
  )
}

// ---------------------------------------------------------------------------
// Easing curve demo
// ---------------------------------------------------------------------------

type EaseCurve = [number, number, number, number] | 'linear'

function EaseDemo({
  name, aliases, curve, duration, description,
}: {
  name: string
  aliases?: string[]
  curve: EaseCurve
  duration: number
  description: string
}) {
  const controls = useAnimation()

  async function replay() {
    await controls.start({ x: 0, transition: { duration: 0 } })
    controls.start({ x: 240, transition: { duration, ease: curve } })
  }

  useEffect(() => { replay() }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '20px 24px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--text-headline)' }}>{name}</span>
          {aliases && aliases.length > 0 && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-body-muted)', marginLeft: 8 }}>
              also: {aliases.join(', ')}
            </span>
          )}
        </div>
        <ReplayButton onClick={replay} />
      </div>

      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-body-muted)', margin: 0 }}>{description}</p>

      {/* Track */}
      <div style={{ position: 'relative', height: 40, borderRadius: 6, background: 'var(--nyl-gray-050)', overflow: 'hidden', marginTop: 4 }}>
        <motion.div
          animate={controls}
          style={{ position: 'absolute', top: 8, left: 0, width: 24, height: 24, borderRadius: 6, background: 'var(--action-primary)' }}
        />
      </div>

      {/* Metadata */}
      <div style={{ display: 'flex', gap: 16 }}>
        <code style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-body-muted)' }}>
          {curve === 'linear' ? 'linear' : `cubic-bezier(${(curve as number[]).join(', ')})`}
        </code>
        <code style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-body-faint)' }}>
          {duration * 1000}ms
        </code>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Duration scale demo
// ---------------------------------------------------------------------------

const DURATIONS = (Object.entries(DURATION) as [string, number][]).map(([label, s]) => ({
  label,
  ms: Math.round(s * 1000),
  use: {
    micro:      'Label fades, icon swaps',
    quick:      'Scene exit, drawer close',
    short:      'Tab swap, list item enter',
    standard:   'Card entry, stagger base',
    'scene-in': 'Scene enter transition',
    deliberate: 'Panel slide, section reveal',
    dramatic:   'Hero panels, Wrapped reveals',
  }[label] ?? '',
}))

function DurationDemo() {
  const [key, setKey] = useState(0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
        <ReplayButton onClick={() => setKey(k => k + 1)} />
      </div>
      {DURATIONS.map(({ label, ms, use }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 72, flexShrink: 0, textAlign: 'right' }}>
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-body)' }}>{ms}ms</code>
          </div>
          <div style={{ flex: 1, height: 24, borderRadius: 4, background: 'var(--nyl-gray-050)', overflow: 'hidden', position: 'relative' }}>
            <motion.div
              key={key}
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: ms / 1000, ease: EASE.settle }}
              style={{ position: 'absolute', inset: 0, background: 'var(--action-primary)', opacity: 0.18 }}
            />
            <motion.div
              key={`dot-${key}`}
              initial={{ left: 0 }}
              animate={{ left: 'calc(100% - 24px)' }}
              transition={{ duration: ms / 1000, ease: EASE.settle }}
              style={{ position: 'absolute', top: 4, width: 16, height: 16, borderRadius: '50%', background: 'var(--action-primary)' }}
            />
          </div>
          <div style={{ width: 64, flexShrink: 0 }}>
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-body-muted)' }}>{label}</code>
          </div>
          <div style={{ width: 180, flexShrink: 0 }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text-body-faint)' }}>{use}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Spring demo
// ---------------------------------------------------------------------------

function SpringDemo({
  name, stiffness, damping, description,
}: {
  name: string
  stiffness: number
  damping: number
  description: string
}) {
  const controls = useAnimation()

  async function replay() {
    await controls.start({ x: 0, transition: { duration: 0 } })
    controls.start({ x: 240, transition: { type: 'spring', stiffness, damping } })
  }

  useEffect(() => { replay() }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '20px 24px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--text-headline)' }}>{name}</span>
        <ReplayButton onClick={replay} />
      </div>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-body-muted)', margin: 0 }}>{description}</p>
      <div style={{ position: 'relative', height: 40, borderRadius: 6, background: 'var(--nyl-gray-050)', overflow: 'hidden', marginTop: 4 }}>
        <motion.div
          animate={controls}
          style={{ position: 'absolute', top: 8, left: 0, width: 24, height: 24, borderRadius: 6, background: 'var(--nyl-purple-600)' }}
        />
      </div>
      <code style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-body-muted)' }}>
        stiffness: {stiffness} · damping: {damping}
      </code>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pattern demos
// ---------------------------------------------------------------------------

function PatternDemo({
  name, description, usage, demo,
}: {
  name: string
  description: string
  usage: string
  demo: (key: number) => React.ReactNode
}) {
  const [key, setKey] = useState(0)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '20px 24px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-elevated)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--text-headline)' }}>{name}</span>
        <ReplayButton onClick={() => setKey(k => k + 1)} />
      </div>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-body-muted)', margin: 0 }}>{description}</p>
      <div style={{ minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, background: 'var(--nyl-gray-050)', padding: 16 }}>
        {demo(key)}
      </div>
      <code style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-body-faint)' }}>{usage}</code>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Story
// ---------------------------------------------------------------------------

export const All: StoryObj = {
  name: 'Motion System',
  render: () => (
    <div style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Easing Curves */}
      <Label>Easing Curves</Label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <EaseDemo
          name="settle"
          aliases={['EASE_SETTLE', 'HOUSE_EASE', 'EASE']}
          curve={EASE.settle}
          duration={0.52}
          description="Primary easing. Fast out, gentle arrival. Used for scene entry, cards, panels, and nearly all enter transitions."
        />
        <EaseDemo
          name="lift"
          aliases={['EASE_LIFT']}
          curve={EASE.lift}
          duration={0.26}
          description="Exit easing. Slow start, accelerates out. Used exclusively for scene exits and element departures."
        />
        <EaseDemo
          name="slide"
          curve={EASE.slide}
          duration={0.6}
          description="Panel easing. Sharp acceleration, clean stop. Used for Business scene content panels sliding in."
        />
        <EaseDemo
          name="standard"
          curve={EASE.standard}
          duration={0.7}
          description="Material-style symmetric ease. Used for deliberate, weighty transitions like the Wrapped overlay."
        />
      </div>

      {/* Note about naming */}
      <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 6, background: 'var(--nyl-orange-100)', border: '1px solid var(--nyl-orange-400)', opacity: 0.9 }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--nyl-gray-800)', margin: 0 }}>
          <strong>Naming note —</strong> <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>EASE_SETTLE</code>, <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>HOUSE_EASE</code>, and <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>EASE</code> are the same curve defined four times across the codebase. Consider extracting to a shared <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>src/motion.ts</code> constants file.
        </p>
      </div>

      {/* Duration Scale */}
      <SectionDivider title="Duration Scale" />
      <DurationDemo />

      {/* Springs */}
      <SectionDivider title="Spring Configs" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <SpringDemo
          name="nav-pill"
          stiffness={SPRING['nav-pill'].stiffness}
          damping={SPRING['nav-pill'].damping}
          description="Active pill and tick in LeftRail nav. Snappy with minimal overshoot — responds to quick navigation."
        />
        <SpringDemo
          name="tab-indicator"
          stiffness={SPRING['tab-indicator'].stiffness}
          damping={SPRING['tab-indicator'].damping}
          description="Underline indicator in BriefingScene time tabs. Slightly softer — follows a slower content rhythm."
        />
      </div>

      {/* Patterns */}
      <SectionDivider title="Common Patterns" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        <PatternDemo
          name="fade-up"
          description="Opacity + small Y lift. The most common enter pattern across cards, labels, and list items."
          usage="initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} · duration: 0.30–0.34 · settle"
          demo={(key) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: EASE.settle }}
              style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-body)' }}
            >
              Content enters
            </motion.div>
          )}
        />

        <PatternDemo
          name="stagger"
          description="List items cascade in with delay: 0.04 × index. Keep base duration short so the last item doesn't feel slow."
          usage="delay: 0.04 * i · duration: 0.32 · settle"
          demo={(key) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
              {[0, 1, 2, 3].map(i => (
                <motion.div
                  key={`${key}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.32, delay: 0.04 * i, ease: EASE.settle }}
                  style={{ height: 16, borderRadius: 4, background: 'var(--action-primary)', opacity: 0.15 + 0.2 * (4 - i) }}
                />
              ))}
            </div>
          )}
        />

        <PatternDemo
          name="modal / overlay"
          description="Scale + Y + blur layered together. Used for coach drill, deep-dive canvas, quick-start tour."
          usage="initial={{ opacity: 0, y: 16, scale: 0.98 }} · duration: 0.32 · settle"
          demo={(key) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.32, ease: EASE.settle }}
              style={{ padding: '14px 24px', borderRadius: 12, background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', boxShadow: '0 24px 60px -20px rgba(0,10,98,0.18)', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-body)' }}
            >
              Modal enters
            </motion.div>
          )}
        />

        <PatternDemo
          name="scene enter"
          description="Full scene transition. Y + scale + blur combine for a physical 'sheet settling onto the ground' feel."
          usage="y: 72→0 · scale: 0.992→1 · blur: 10→0 · duration: 0.52 · settle"
          demo={(key) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 40, scale: 0.97, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.52, ease: EASE.settle }}
              style={{ width: '100%', height: 56, borderRadius: 8, background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-body)' }}
            >
              Scene settles in
            </motion.div>
          )}
        />

      </div>

      {/* Nyla Suggest set (briefing-v6) — pulls from the EASE/DURATION scale above */}
      <SectionDivider title="Nyla Suggest set · briefing-v6" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        <PatternDemo
          name="nyla-card-enter"
          description="Elegant entrance for a Nyla-suggested card — the scene-enter pattern (y + scale + blur)."
          usage={`from ${JSON.stringify(NYLA.cardEnter.from)} · ${NYLA.cardEnter.duration * 1000}ms · settle`}
          demo={(key) => (
            <motion.div
              key={key}
              initial={NYLA.cardEnter.from}
              animate={NYLA.cardEnter.to}
              transition={{ duration: NYLA.cardEnter.duration, ease: NYLA.cardEnter.ease }}
              style={{ width: '100%', height: 56, borderRadius: 12, background: 'var(--bg-surface-elevated)', border: '1px solid var(--nyl-purple-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-body)' }}
            >
              Suggested card enters
            </motion.div>
          )}
        />

        <PatternDemo
          name="nyla-suggest-glow"
          description="Subtle purple glow swells around the suggested card, then ramps back down on settle."
          usage={`rampIn/out ${NYLA.glow.rampIn * 1000}ms · settle`}
          demo={(key) => (
            <motion.div
              key={key}
              initial={{ boxShadow: NYLA.glow.restingShadow }}
              animate={{ boxShadow: [NYLA.glow.restingShadow, NYLA.glow.peakShadow, NYLA.glow.restingShadow] }}
              transition={{ duration: NYLA.glow.rampIn * 2 + NYLA.settle.holdMs / 1000, times: [0, 0.3, 1], ease: EASE.settle }}
              style={{ width: '100%', height: 56, borderRadius: 12, background: 'var(--bg-surface-elevated)', border: '1px solid var(--nyl-purple-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-body)' }}
            >
              Glow swell → settle
            </motion.div>
          )}
        />

        <PatternDemo
          name="nyla-thinking-border"
          description="Rotating purple/blue conic-gradient glows around the card while Nyla 'thinks' (CSS .nyla-suggest-glow). Slowed ~4x with a soft blurred halo. Ambient loop."
          usage="conic-gradient(from --nyla-angle) · spin 12s linear ∞ · blur halo"
          demo={(key) => (
            <div key={key} className="nyla-suggest-glow" style={{ borderRadius: 16, width: '90%' }}>
              <div className="nyla-suggest-card" style={{ height: 56, borderRadius: 14, background: 'var(--bg-surface-elevated)', border: '1px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-body)' }}>
                Nyla is thinking…
              </div>
            </div>
          )}
        />

        <PatternDemo
          name="task-complete"
          description="Mark-as-done / agent-complete. Check scales in; card mutes. Reuses the 'card entry' step."
          usage={`${NYLA.taskComplete.duration * 1000}ms · settle`}
          demo={(key) => (
            <motion.div
              key={key}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              transition={{ duration: NYLA.taskComplete.duration, ease: NYLA.taskComplete.ease }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 10, background: 'var(--nyl-gray-025)', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-body-muted)' }}
            >
              <motion.span
                key={`c-${key}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: NYLA.taskComplete.duration, ease: NYLA.taskComplete.ease }}
                style={{ display: 'flex', width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--badge-opportunity)', color: '#fff', fontSize: 13 }}
              >
                ✓
              </motion.span>
              <span style={{ textDecoration: 'line-through' }}>Task marked done</span>
            </motion.div>
          )}
        />

      </div>
    </div>
  ),
}
