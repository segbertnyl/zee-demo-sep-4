/* ---------------------------------------------------------------------------
 * Nyla · The Collective — Storybook stories
 * Three stories: interactive Playground, static Size Ramp, and In Context.
 * --------------------------------------------------------------------------- */
import type { Meta, StoryObj } from '@storybook/react'
import { useEffect, useState } from 'react'
import { Nyla, recommendedPoints } from './Nyla'
import { PointSphere } from './PointSphere'
import { NYL } from './nyla-palette'
import {
  NYLA_SIZE_TIERS,
  DEFAULT_VIEW,
  loadOrbConfigForTier,
  saveOrbConfigForTier,
  clearOrbConfigForTier,
  listViewsForTier,
  type NylaSizeTier,
} from './nyla-config'

// ── Shared constants ──────────────────────────────────────────────────────────

const DEEP =
  'radial-gradient(100% 85% at 52% 110%, #b87be2 0%, #6f4fd6 26%, rgba(111,79,214,0) 62%), linear-gradient(120deg, #2a0f57 0%, #3a2491 42%, #4a52e0 74%, #6a44c8 100%)'

const BGS = [
  { id: 'deep', label: 'Deep Aura', css: DEEP },
  { id: 'navy', label: 'Brand Blue', css: '#000a62' },
  { id: 'white', label: 'White', css: '#ffffff' },
] as const

const RAMP: { size: number; use: string }[] = [
  { size: 24, use: 'Favicon' },
  { size: 40, use: 'UI icon' },
  { size: 64, use: 'Avatar' },
  { size: 96, use: 'Card' },
  { size: 160, use: 'Feature' },
  { size: 256, use: 'Hero' },
]

const IN_CONTEXT: { size: number; label: string; bg: 'dark' | 'light' }[] = [
  { size: 24, label: 'Button / inline icon', bg: 'light' },
  { size: 40, label: 'Contextual badge', bg: 'dark' },
  { size: 64, label: 'Guidance panel', bg: 'light' },
  { size: 160, label: 'Section intro / Discovery', bg: 'light' },
  { size: 256, label: 'Welcome hero', bg: 'dark' },
]

// ── Meta ──────────────────────────────────────────────────────────────────────

export default {
  title: 'UI / Nyla ✨ 🆕',
  id: 'ui-nyla', // pin the story ID so the emoji doesn't change URLs
  component: Nyla,
  tags: [],
  parameters: { layout: 'fullscreen', backgrounds: { disable: true } },
} satisfies Meta<typeof Nyla>

type Story = StoryObj<typeof Nyla>

// ── Story 1: Playground ───────────────────────────────────────────────────────

function PlaygroundPanel() {
  /* Saving writes nyla-views.json, which this module imports — so HMR
   * remounts the story. Restore the last tier/view/bg from sessionStorage
   * so the save doesn't bounce the UI back to the initial tab. */
  const persisted = (() => {
    try {
      return JSON.parse(sessionStorage.getItem('nyla-playground') ?? 'null')
    } catch {
      return null
    }
  })() as { tier?: NylaSizeTier; view?: string; bgIdx?: number } | null
  const startTier: NylaSizeTier =
    persisted?.tier != null && (NYLA_SIZE_TIERS as readonly number[]).includes(persisted.tier) ? persisted.tier : 160
  /* A restored view may have been deleted/renamed since — fall back to
   * default rather than silently showing default values under a stale name. */
  const startView =
    persisted?.view && listViewsForTier(startTier).includes(persisted.view) ? persisted.view : DEFAULT_VIEW

  const [tier, setTier] = useState<NylaSizeTier>(startTier)
  const [view, setView] = useState<string>(startView)
  const [views, setViews] = useState<string[]>(() => listViewsForTier(startTier))
  const initial = loadOrbConfigForTier(startTier, startView)
  const [points, setPoints] = useState(() => initial.points ?? recommendedPoints(startTier))
  const [auto, setAuto] = useState(() => initial.points == null)
  const [bgIdx, setBgIdx] = useState(persisted?.bgIdx ?? 0)

  useEffect(() => {
    sessionStorage.setItem('nyla-playground', JSON.stringify({ tier, view, bgIdx }))
  }, [tier, view, bgIdx])
  const [dotScale, setDotScale] = useState(initial.dotScale)
  const [glowScale, setGlowScale] = useState(initial.glowScale)
  const [minOpacity, setMinOpacity] = useState(initial.minOpacity)
  const [rotationSpeed, setRotationSpeed] = useState(initial.rotationSpeed)
  const [purpleMix, setPurpleMix] = useState(initial.purpleMix)
  const [haloStrength, setHaloStrength] = useState(initial.haloStrength)
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'cleared'>('idle')
  const bg = BGS[bgIdx]
  const size = tier

  const loadIntoSliders = (t: NylaSizeTier, v: string) => {
    const cfg = loadOrbConfigForTier(t, v)
    setPoints(cfg.points ?? recommendedPoints(t))
    setAuto(cfg.points == null)
    setDotScale(cfg.dotScale)
    setGlowScale(cfg.glowScale)
    setMinOpacity(cfg.minOpacity)
    setRotationSpeed(cfg.rotationSpeed)
    setPurpleMix(cfg.purpleMix)
    setHaloStrength(cfg.haloStrength)
    setSaveState('idle')
  }

  // Switching tiers keeps the view name if it exists there, else falls to default
  const onTier = (t: NylaSizeTier) => {
    setTier(t)
    const tierViews = listViewsForTier(t)
    setViews(tierViews)
    const nextView = tierViews.includes(view) ? view : DEFAULT_VIEW
    setView(nextView)
    loadIntoSliders(t, nextView)
  }

  const onView = (v: string) => {
    setView(v)
    loadIntoSliders(tier, v)
  }

  const onNewView = () => {
    const name = window.prompt('Name this view (e.g. "on-dark", "subtle"):')?.trim()
    if (!name || name === view) return
    // Seed the new view from the current sliders and persist immediately
    saveOrbConfigForTier(tier, name, {
      dotScale,
      glowScale,
      minOpacity,
      rotationSpeed,
      purpleMix,
      haloStrength,
      points: auto ? null : points,
    })
    setViews(listViewsForTier(tier))
    setView(name)
    setSaveState('saved')
    setTimeout(() => setSaveState('idle'), 2000)
  }

  const onPoints = (v: number) => {
    setPoints(v)
    setAuto(false)
  }
  const onAuto = (checked: boolean) => {
    setAuto(checked)
    if (checked) setPoints(recommendedPoints(size))
  }

  const handleSave = () => {
    saveOrbConfigForTier(tier, view, {
      dotScale,
      glowScale,
      minOpacity,
      rotationSpeed,
      purpleMix,
      haloStrength,
      points: auto ? null : points,
    })
    setSaveState('saved')
    setTimeout(() => setSaveState('idle'), 2000)
  }

  const handleReset = () => {
    clearOrbConfigForTier(tier, view)
    setViews(listViewsForTier(tier))
    // A deleted custom view falls back to default
    const nextView = listViewsForTier(tier).includes(view) ? view : DEFAULT_VIEW
    setView(nextView)
    loadIntoSliders(tier, nextView)
    setSaveState('cleared')
    setTimeout(() => setSaveState('idle'), 2000)
  }

  const isDark = bg.id !== 'white'
  const textColor = isDark ? 'rgba(255,255,255,0.85)' : NYL.navy
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,10,98,0.45)'
  const labelColor = isDark ? 'rgba(255,255,255,0.7)' : NYL.blue
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : `${NYL.navy}14`
  const inputBg = isDark ? 'rgba(255,255,255,0.08)' : `${NYL.navy}06`

  const sliderRow = (
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    display: string,
    onChange: (v: number) => void,
  ) => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.12em',
            color: labelColor,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 13,
            fontVariantNumeric: 'tabular-nums',
            color: textMuted,
            background: inputBg,
            padding: '2px 8px',
            borderRadius: 4,
            fontFamily: 'var(--font-mono, monospace)',
          }}
        >
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        style={{ width: '100%', accentColor: NYL.blue, cursor: 'pointer' }}
      />
    </div>
  )

  return (
    <div
      style={{
        minHeight: '100vh',
        background: bg.css,
        color: textColor,
        fontFamily: 'var(--font-sans)',
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        alignItems: 'stretch',
        transition: 'background 0.35s ease',
      }}
    >
      {/* Stage */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <div
          style={{
            width: 'min(46vw, 560px)',
            aspectRatio: '1 / 1',
            borderRadius: 24,
            background: isDark ? 'rgba(255,255,255,0.06)' : `${NYL.navy}08`,
            display: 'grid',
            placeItems: 'center',
            boxShadow: isDark
              ? '0 24px 70px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)'
              : '0 24px 70px rgba(0,10,98,0.16)',
            overflow: 'hidden',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : `${NYL.navy}12`}`,
          }}
        >
          <PointSphere
            size={size}
            count={points}
            animate
            dotScale={dotScale}
            glowScale={glowScale}
            minOpacity={minOpacity}
            rotationSpeed={rotationSpeed}
            purpleMix={purpleMix}
            haloStrength={haloStrength}
          />
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 24,
          padding: '48px 64px 48px 24px',
          maxWidth: 560,
          borderLeft: `1px solid ${borderColor}`,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 400,
              fontSize: 40,
              lineHeight: 1.05,
              margin: 0,
              color: textColor,
            }}
          >
            The Collective
          </h1>
          <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.55, color: textMuted }}>
            Dial in the look. Hit Save to apply across the prototype immediately.
          </p>
        </div>

        {/* Divider — Size tier */}
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: textMuted,
            borderBottom: `1px solid ${borderColor}`,
            paddingBottom: 8,
          }}
        >
          Size tier — each saves its own view
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {NYLA_SIZE_TIERS.map((t) => (
            <button
              key={t}
              onClick={() => onTier(t)}
              style={{
                cursor: 'pointer',
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                background: tier === t ? NYL.blue : 'transparent',
                color: tier === t ? '#fff' : textMuted,
                border: tier === t ? `1px solid ${NYL.blue}` : `1px solid ${borderColor}`,
                transition: 'all 0.15s ease',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* View chips — multiple saved styles per tier */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span
            style={{
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: textMuted,
              marginRight: 4,
            }}
          >
            View
          </span>
          {views.map((v) => (
            <button
              key={v}
              onClick={() => onView(v)}
              style={{
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                background: view === v ? NYL.blue : 'transparent',
                color: view === v ? '#fff' : textMuted,
                border: view === v ? `1px solid ${NYL.blue}` : `1px solid ${borderColor}`,
                transition: 'all 0.15s ease',
              }}
            >
              {v}
            </button>
          ))}
          <button
            onClick={onNewView}
            title="Create a new view for this tier, seeded from the current sliders"
            style={{
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              background: 'transparent',
              color: labelColor,
              border: `1px dashed ${labelColor}`,
            }}
          >
            ＋ New view
          </button>
        </div>

        {sliderRow('Points', points, 10, 200, 1, `${points}`, onPoints)}

        <label
          style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer', color: textColor }}
        >
          <input
            type="checkbox"
            checked={auto}
            onChange={(e) => onAuto(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: NYL.blue, flexShrink: 0 }}
          />
          Match density to size
          <span style={{ fontSize: 12, color: textMuted }}>({recommendedPoints(size)} pts)</span>
        </label>

        {/* Divider — Style */}
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: textMuted,
            borderBottom: `1px solid ${borderColor}`,
            paddingBottom: 8,
          }}
        >
          Style
        </div>

        {sliderRow('Dot size', dotScale, 0.01, 0.2, 0.005, dotScale.toFixed(3), setDotScale)}
        {sliderRow('Glow', glowScale, 0.005, 0.08, 0.002, glowScale.toFixed(3), setGlowScale)}
        {sliderRow('Min opacity', minOpacity, 0.05, 0.9, 0.05, minOpacity.toFixed(2), setMinOpacity)}
        {sliderRow(
          'Rotation',
          rotationSpeed,
          0,
          2,
          0.05,
          rotationSpeed === 0 ? 'still' : `${rotationSpeed.toFixed(2)} rad/s`,
          setRotationSpeed,
        )}
        {sliderRow('Purple', purpleMix, 0, 1, 0.01, `${Math.round(purpleMix * 100)} / 100`, setPurpleMix)}
        {sliderRow(
          'Halo',
          haloStrength,
          0,
          2,
          0.05,
          haloStrength === 0 ? 'off' : `${haloStrength.toFixed(2)}×`,
          setHaloStrength,
        )}

        {/* Background */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span
            style={{
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: textMuted,
              marginRight: 4,
            }}
          >
            Background
          </span>
          {BGS.map((b, i) => (
            <button
              key={b.id}
              onClick={() => setBgIdx(i)}
              title={b.label}
              style={{
                cursor: 'pointer',
                width: 30,
                height: 30,
                borderRadius: 8,
                background: b.css,
                border: bg.id === b.id ? `2px solid ${NYL.blue}` : `1px solid rgba(128,128,128,0.35)`,
                outline: bg.id === b.id ? `2px solid ${NYL.blue}40` : 'none',
                transition: 'border 0.15s ease',
              }}
            />
          ))}
        </div>

        {/* Save */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', paddingTop: 4 }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 8,
              background: saveState === 'saved' ? '#16a34a' : NYL.blue,
              color: '#fff',
              border: 'none',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.06em',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {saveState === 'saved'
              ? `✓ Saved ${tier}px · ${view} — prototype updates live`
              : `Save ${tier}px · ${view}`}
          </button>
          <button
            onClick={handleReset}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              background: 'transparent',
              color: textMuted,
              border: `1px solid ${borderColor}`,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {view === DEFAULT_VIEW ? `Reset ${tier}px` : `Delete "${view}"`}
          </button>
        </div>

        {/* Code snippet */}
        <pre
          style={{
            margin: 0,
            padding: '12px 14px',
            borderRadius: 8,
            background: inputBg,
            border: `1px solid ${borderColor}`,
            fontSize: 11,
            lineHeight: 1.7,
            color: textMuted,
            fontFamily: 'var(--font-mono, monospace)',
            overflow: 'auto',
          }}
        >
          {`// nyla-config.ts → NYLA_TIER_DEFAULTS[${tier}]
'${view}': { dotScale: ${dotScale.toFixed(3)}, glowScale: ${glowScale.toFixed(3)}, minOpacity: ${minOpacity.toFixed(2)}, rotationSpeed: ${rotationSpeed.toFixed(2)}, purpleMix: ${purpleMix.toFixed(2)}, haloStrength: ${haloStrength.toFixed(2)}, points: ${auto ? 'null /* auto */' : points} },
${view === DEFAULT_VIEW ? `// used automatically by <Nyla size={${tier}} />` : `// use with <Nyla size={${tier}} variant="${view}" />`}`}
        </pre>
      </div>
    </div>
  )
}

export const Playground: Story = {
  name: 'Playground',
  parameters: { controls: { disable: true } },
  render: () => <PlaygroundPanel />,
}

// ── Story 2: Size Ramp ────────────────────────────────────────────────────────

export const SizeRamp: Story = {
  name: 'Size Ramp',
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        minHeight: '100vh',
        background: '#f7f7f9',
        fontFamily: 'var(--font-sans)',
        padding: '64px 40px',
      }}
    >
      <div style={{ marginBottom: 40 }}>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 400,
            fontSize: 28,
            margin: '0 0 8px',
            color: NYL.navy,
          }}
        >
          Size system
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: `${NYL.navy}70` }}>
          Six standard sizes with recommended point count at each — all static (animate=false).
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: 40,
          justifyContent: 'center',
        }}
      >
        {RAMP.map(({ size: s, use }) => {
          const pts = recommendedPoints(s)
          const radius = Math.min(16, s / 4)
          return (
            <div
              key={s}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div
                style={{
                  width: s,
                  height: s,
                  borderRadius: radius,
                  background: DEEP,
                  display: 'grid',
                  placeItems: 'center',
                  overflow: 'hidden',
                  boxShadow: '0 10px 32px rgba(0,10,98,0.18)',
                  flexShrink: 0,
                }}
              >
                <Nyla size={s} animate={false} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: NYL.navy,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {s} px
                </div>
                <div style={{ fontSize: 11, color: `${NYL.navy}60`, marginTop: 2 }}>
                  {pts} pts · {use}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  ),
}

// ── Story 3: In Context ───────────────────────────────────────────────────────

export const InContext: Story = {
  name: 'In Context',
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        minHeight: '100vh',
        background: '#f7f7f9',
        fontFamily: 'var(--font-sans)',
        padding: '64px 40px',
      }}
    >
      <div style={{ marginBottom: 40 }}>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 400,
            fontSize: 28,
            margin: '0 0 8px',
            color: NYL.navy,
          }}
        >
          In Context
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: `${NYL.navy}70` }}>
          Sizes used across the prototype — each shown on its typical background, all static.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 20,
          alignItems: 'flex-start',
        }}
      >
        {IN_CONTEXT.map(({ size: s, label, bg }) => {
          const isDark = bg === 'dark'
          const tileSize = Math.max(s + 48, 88)
          return (
            <div
              key={`${s}-${label}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div
                style={{
                  width: tileSize,
                  height: tileSize,
                  borderRadius: 12,
                  background: isDark ? DEEP : '#ffffff',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,10,98,0.10)',
                  border: isDark ? 'none' : `1px solid ${NYL.navy}0f`,
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <Nyla size={s} animate={false} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: NYL.navy,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {s} px
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: `${NYL.navy}60`,
                    marginTop: 2,
                    maxWidth: 96,
                    lineHeight: 1.4,
                  }}
                >
                  {label}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  ),
}
