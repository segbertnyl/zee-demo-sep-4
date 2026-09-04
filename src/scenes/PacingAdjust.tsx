import { useState, useRef, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { EASE, DURATION } from '@/motion'
import { NylaGuidance } from '@/ui/NylaGuidance'
import { Button } from '@/ui/Button'
import { StatusPill } from '@/ui/StatusPill'

// ── Slider config ─────────────────────────────────────────────────────────────

interface SliderConfig {
  id: string
  label: string
  subtitle: string
  min: number
  max: number
  step: number
  recommendedMin: number
  recommendedMax: number
  defaultValue: number
  unit: string
  lastYear?: number
}

const SLIDERS: SliderConfig[] = [
  {
    id: 'referrals',
    label: 'Referral asks',
    subtitle: 'Your highest conversion source',
    min: 0, max: 7, step: 1,
    recommendedMin: 3, recommendedMax: 5,
    defaultValue: 4,
    unit: '/mo',
    lastYear: 3,
  },
  {
    id: 'prospects',
    label: 'New prospects to contact',
    subtitle: 'To fill your appointment pipeline',
    min: 0, max: 14, step: 1,
    recommendedMin: 7, recommendedMax: 12,
    defaultValue: 10,
    unit: '/wk',
    lastYear: 6,
  },
  {
    id: 'networking',
    label: 'Networking events',
    subtitle: 'To fuel the funnel',
    min: 0, max: 4, step: 1,
    recommendedMin: 1, recommendedMax: 2,
    defaultValue: 1,
    unit: '/mo',
  },
]

// ── Slider track sub-component ────────────────────────────────────────────────

interface PacingSliderProps {
  config: SliderConfig
  value: number
  onChange: (v: number) => void
}

function PacingSlider({ config, value, onChange }: PacingSliderProps) {
  // All discrete values from min to max
  const steps = Math.round((config.max - config.min) / config.step)
  const segments = Array.from({ length: steps + 1 }, (_, i) => config.min + i * config.step)
  const currentIdx = Math.round((value - config.min) / config.step)
  const lastYearIdx = config.lastYear != null
    ? Math.round((config.lastYear - config.min) / config.step)
    : null
  // Thumb reflects the zone it sits in: purple within the recommended range,
  // grey anywhere outside it.
  const inRange = value >= config.recommendedMin && value <= config.recommendedMax
  const thumbColor = inRange ? 'var(--nyl-purple-600)' : 'var(--nyl-gray-300, #b6b2af)'

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        height: 79,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
      }}
    >
      {/* Discrete segment track */}
      <div style={{
        width: '100%',
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        position: 'relative',
      }}>
        {segments.map((segVal, i) => {
          const isThumb = i === currentIdx
          const isRec = segVal >= config.recommendedMin && segVal <= config.recommendedMax
          const isLastYear = i === lastYearIdx

          return (
            <div
              key={i}
              style={{
                flex: '1 0 0',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Segment bar */}
              <div style={{
                width: '100%',
                height: isThumb ? 10 : 4,
                borderRadius: isThumb ? 11 : 1,
                background: isThumb
                  ? thumbColor
                  : isRec
                    ? 'var(--nyl-purple-500)'
                    : 'var(--nyl-gray-200, #d0ccc8)',
                border: isThumb ? '2px solid white' : 'none',
                boxShadow: isThumb ? '0px 2px 12px 0px rgba(0,10,98,0.45)' : 'none',
              }} />

              {/* Triangle caret + label at last-year position */}
              {isLastYear && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(50% + 8px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}>
                  {/* Upward-pointing caret — points toward the track above */}
                  <div style={{
                    width: 0,
                    height: 0,
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderBottom: '6px solid var(--nyl-gray-300, #b6b2af)',
                    marginBottom: 3,
                  }} />
                  <div style={{
                    background: 'white',
                    padding: '4px 8px',
                    borderRadius: 40,
                    fontSize: 14,
                    lineHeight: '20px',
                    letterSpacing: '0.2px',
                    color: 'var(--text-body-secondary)',
                    whiteSpace: 'nowrap',
                    fontFamily: 'var(--font-sans)',
                  }}>
                    ~{config.lastYear} last year
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Native range input — hidden visually, handles drag interaction */}
      <input
        type="range"
        min={config.min}
        max={config.max}
        step={config.step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="pacing-range"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: 'pointer',
          margin: 0,
        }}
      />
    </div>
  )
}

// ── Stat row wrapper ──────────────────────────────────────────────────────────

interface StatRowProps {
  config: SliderConfig
  value: number
  onChange: (v: number) => void
  outOfRange: boolean
  first?: boolean
  last?: boolean
}

function StatRow({ config, value, onChange, outOfRange, first, last }: StatRowProps) {
  const borderRadius = first ? '4px 4px 0 0' : last ? '0 0 4px 4px' : undefined

  // Click the value box to type a custom number (clamped to the slider's scale).
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  function startEdit() {
    setDraft(String(value))
    setEditing(true)
  }
  function commit() {
    const parsed = parseInt(draft, 10)
    if (!Number.isNaN(parsed)) {
      const stepped = Math.round(parsed / config.step) * config.step
      onChange(Math.max(config.min, Math.min(config.max, stepped)))
    }
    setEditing(false)
  }

  const valueTextStyle: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: 32,
    fontWeight: 500,
    lineHeight: '40px',
    letterSpacing: '-2px',
    color: outOfRange ? 'var(--nyl-orange-500)' : 'var(--text-heading)',
    transition: `color ${DURATION.deliberate}s`,
  }

  return (
    <motion.div
      animate={{
        borderColor: outOfRange ? 'var(--nyl-purple-100)' : 'var(--border-subtle, #dcd9d5)',
        boxShadow: outOfRange ? '0 0 20px var(--nyl-purple-050)' : '0 0 0px transparent',
      }}
      transition={{ duration: DURATION.deliberate, ease: EASE.settle as [number, number, number, number] }}
      style={{
        background: 'white',
        border: '1px solid var(--border-subtle, #dcd9d5)',
        borderRadius,
        display: 'flex',
        gap: 24,
        alignItems: 'center',
        padding: '0 24px',
        height: 107,
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: outOfRange ? 1 : 0,
      }}
    >
      {/* Label */}
      <div style={{ flexShrink: 0, width: 236 }}>
        <p style={{
          margin: 0,
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
          fontWeight: 500,
          lineHeight: '20px',
          letterSpacing: '0.2px',
          color: 'var(--text-heading)',
        }}>
          {config.label}
        </p>
        <p style={{
          margin: 0,
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
          fontWeight: 400,
          lineHeight: '20px',
          letterSpacing: '0.2px',
          color: 'var(--text-body-secondary)',
        }}>
          {config.subtitle}
        </p>
      </div>

      {/* Slider */}
      <PacingSlider config={config} value={value} onChange={onChange} />

      {/* Value display */}
      <div style={{
        flexShrink: 0,
        width: 100,
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'flex-end',
        gap: 8,
      }}>
        <div
          onClick={() => { if (!editing) startEdit() }}
          style={{
            width: 48,
            height: 48,
            border: `1px solid ${outOfRange ? 'var(--nyl-purple-100)' : 'var(--border-subtle, #dcd9d5)'}`,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: `border-color ${DURATION.deliberate}s`,
            cursor: editing ? 'text' : 'pointer',
          }}
        >
          {editing ? (
            <input
              type="number"
              autoFocus
              className="pacing-num-input"
              value={draft}
              min={config.min}
              max={config.max}
              step={config.step}
              onChange={e => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
              style={{ ...valueTextStyle, width: '100%', height: '100%', border: 'none', outline: 'none', background: 'transparent', textAlign: 'center', padding: 0 }}
            />
          ) : (
            <span style={valueTextStyle}>{value}</span>
          )}
        </div>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
          fontWeight: 400,
          lineHeight: '20px',
          letterSpacing: '0.2px',
          color: 'var(--text-body-secondary)',
          whiteSpace: 'nowrap',
        }}>
          {config.unit}
        </span>
      </div>
    </motion.div>
  )
}

// ── Qualified appointments formula ────────────────────────────────────────────

function calcApptsPerWk(referrals: number, prospects: number, networking: number) {
  const raw = (prospects / 10) * 2 + (referrals / 4) * 0.8 + (networking / 1) * 0.2
  return Math.round(raw * 2) / 2  // round to nearest 0.5
}

// ── Recommended pace (from the prior question / PacingStep) ────────────────────
// Derived from the $47K FYC goal, mirroring src/scenes/PacingStep.tsx.
const FYC_GOAL = 175000
const AVG_COMMISSION = 950
const CLOSE_RATE = 0.33
const REC_CLOSES_PER_YEAR = Math.round(FYC_GOAL / AVG_COMMISSION)       // ~49
const REC_APPTS_PER_YEAR = Math.round(REC_CLOSES_PER_YEAR / CLOSE_RATE) // ~148
const REC_APPTS_PER_WEEK = Math.round(REC_APPTS_PER_YEAR / 52)          // 3
const fmtK = (n: number) => n.toLocaleString()

// Blue calendar icon — matches the appointments pill treatment in PacingStep.
function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="var(--action-primary, #0468ff)" strokeWidth="1.3" />
      <path d="M2 6.5h12" stroke="var(--action-primary, #0468ff)" strokeWidth="1.3" />
      <path d="M5.5 1.5v3M10.5 1.5v3" stroke="var(--action-primary, #0468ff)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

const Bold = ({ children }: { children: ReactNode }) => (
  <strong style={{ color: 'var(--text-heading)', fontWeight: 600 }}>{children}</strong>
)

// The recommended-appointments pill: shows the fixed recommended value from the
// prior question. Hovering reveals the math tooltip with an "Adjust this" CTA;
// clicking that lets the user override the value inline.
function RecommendedApptsPill({ onAdjustPace }: { onAdjustPace?: () => void }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(REC_APPTS_PER_WEEK)
  const [draft, setDraft] = useState('')
  const timer = useRef<number | null>(null)

  const cancelClose = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null } }
  const scheduleClose = () => { cancelClose(); timer.current = window.setTimeout(() => setOpen(false), 120) }
  const openNow = () => { cancelClose(); if (!editing) setOpen(true) }

  function startEdit() {
    setDraft(String(value))
    setOpen(false)
    setEditing(true)
  }
  function commit() {
    const parsed = parseInt(draft, 10)
    if (!Number.isNaN(parsed)) setValue(Math.max(0, Math.min(20, parsed)))
    setEditing(false)
  }

  return (
    <span
      style={{ position: 'relative', display: 'inline-block', verticalAlign: 'middle' }}
      onMouseEnter={openNow}
      onMouseLeave={scheduleClose}
    >
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        border: `1px solid ${open ? 'var(--action-primary, #0468ff)' : 'var(--border-subtle, #dcd9d5)'}`,
        borderRadius: 40,
        background: open ? '#f2f8ff' : 'white',
        transition: 'border-color 120ms ease, background 120ms ease',
        whiteSpace: 'nowrap',
      }}>
        <span style={{ display: 'inline-flex', marginRight: 6 }}><CalendarIcon /></span>
        {editing ? (
          <input
            type="number"
            autoFocus
            className="pacing-num-input"
            value={draft}
            min={0}
            max={20}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
            style={{ width: 28, border: 'none', outline: 'none', background: 'transparent', textAlign: 'right', fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: '20px', letterSpacing: '0.2px', fontWeight: 400, color: '#17181c', padding: 0 }}
          />
        ) : (
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: '20px', letterSpacing: '0.2px', fontWeight: 400, color: '#17181c' }}>
            ~{value}
          </span>
        )}
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: '20px', letterSpacing: '0.2px', fontWeight: 400, color: '#17181c' }}>
          {editing ? ' appointments /wk' : ' appointments /wk'}
        </span>
      </span>

      {open && !editing && (
        <div
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 12px)',
            left: 0,
            width: 'max-content',
            maxWidth: 380,
            background: 'white',
            borderRadius: 4,
            boxShadow: '0px 2px 6px rgba(0,0,0,0.25)',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            zIndex: 100,
            whiteSpace: 'nowrap',
          }}
        >
          <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, lineHeight: '20px', color: '#111' }}>
            Recommended pace for your ${fmtK(FYC_GOAL)} FYC goal
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: '20px', letterSpacing: '0.2px', color: 'var(--text-body-secondary)' }}>
            <span><Bold>${fmtK(FYC_GOAL)} FYC</Bold> ÷ <Bold>~${fmtK(AVG_COMMISSION)} /policy</Bold> = <Bold>~{fmtK(REC_CLOSES_PER_YEAR)} closes /yr</Bold></span>
            <span><Bold>~{fmtK(REC_CLOSES_PER_YEAR)} closes /yr</Bold> ÷ <Bold>{Math.round(CLOSE_RATE * 100)}% close rate</Bold> = <Bold>~{fmtK(REC_APPTS_PER_YEAR)} appts /yr</Bold></span>
            <span><Bold>~{fmtK(REC_APPTS_PER_YEAR)} appts /yr</Bold> ÷ <Bold>52 wks</Bold> = <Bold>~{REC_APPTS_PER_WEEK} appts /wk</Bold></span>
          </div>
          <button
            type="button"
            onClick={() => (onAdjustPace ? onAdjustPace() : startEdit())}
            style={{ alignSelf: 'flex-start', background: 'none', border: 'none', padding: 0, fontFamily: 'var(--font-sans)', fontSize: 14, fontStyle: 'italic', lineHeight: '20px', color: 'var(--action-primary, #0468ff)', cursor: 'pointer' }}
          >
            Adjust this
          </button>
          {/* caret */}
          <div style={{ position: 'absolute', bottom: -9, left: 24, width: 18, height: 18, background: 'white', transform: 'rotate(45deg)', boxShadow: '2px 2px 3px rgba(0,0,0,0.1)', borderRadius: 1 }} />
        </div>
      )}
    </span>
  )
}

// ── PacingAdjust ──────────────────────────────────────────────────────────────

interface PacingAdjustProps {
  onSkip?: () => void
  onConfirm?: () => void
}

export function PacingAdjust({ onSkip, onConfirm }: PacingAdjustProps) {
  // Suppress native range thumb so our custom segments show cleanly
  const rangeStyle = `
    .pacing-range { -webkit-appearance: none; appearance: none; background: transparent; }
    .pacing-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 0; height: 0; }
    .pacing-range::-moz-range-thumb { appearance: none; width: 0; height: 0; border: none; background: transparent; }
    .pacing-range::-webkit-slider-runnable-track { background: transparent; }
    .pacing-range::-moz-range-track { background: transparent; }
    .pacing-num-input::-webkit-outer-spin-button, .pacing-num-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    .pacing-num-input { -moz-appearance: textfield; }
  `
  const defaults = Object.fromEntries(SLIDERS.map(s => [s.id, s.defaultValue])) as Record<string, number>
  const [values, setValues] = useState<Record<string, number>>(defaults)

  function setValue(id: string, v: number) {
    setValues(prev => ({ ...prev, [id]: v }))
  }

  function isOutOfRange(id: string) {
    const config = SLIDERS.find(s => s.id === id)!
    const v = values[id]
    return v < config.recommendedMin || v > config.recommendedMax
  }

  const anyOutOfRange = SLIDERS.some(s => isOutOfRange(s.id))
  const outOfRangeSliders = SLIDERS.filter(s => isOutOfRange(s.id))

  const apptsPerWk = 11
  // Status: below the recommended range = off track; above it = stretch; else on track.
  const anyBelow = SLIDERS.some(s => values[s.id] < s.recommendedMin)
  const anyAbove = SLIDERS.some(s => values[s.id] > s.recommendedMax)
  const status: 'on-track' | 'stretch' | 'off-track' = anyBelow ? 'off-track' : anyAbove ? 'stretch' : 'on-track'
  const numberColor = status === 'on-track'
    ? 'var(--text-heading)'
    : 'var(--nyl-orange-500)'

  function adjustToRange() {
    const snapped: Record<string, number> = {}
    SLIDERS.forEach(s => {
      const v = values[s.id]
      if (v < s.recommendedMin) snapped[s.id] = s.recommendedMin
      else if (v > s.recommendedMax) snapped[s.id] = s.recommendedMax
      else snapped[s.id] = v
    })
    setValues(snapped)
  }

  // Build guidance message based on which sliders are out of range
  const guidanceBody = buildGuidanceBody(outOfRangeSliders, values)

  return (
    <>
    <style>{rangeStyle}</style>
    <div style={{
      minHeight: '100%',
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      columnGap: 24,
      alignContent: 'center',
      alignItems: 'center',
      boxSizing: 'border-box',
      padding: '40px',
    }}>
      {/* Main content — columns 2-8 */}
      <div style={{ gridColumn: '2 / 9', minWidth: 0 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION['scene-in'], ease: EASE.settle as [number, number, number, number] }}
          style={{ marginBottom: 32 }}
        >
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 32,
            lineHeight: '40px',
            fontWeight: 300,
            color: 'var(--nyl-blue-800)',
            margin: '0 0 16px 0',
          }}>
            {"Let's focus on how to get there."}
          </h2>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 16,
            lineHeight: '24px',
            letterSpacing: '0.2px',
            color: 'var(--text-body-secondary)',
            margin: 0,
          }}>
            Set your weekly and monthly activity targets to establish a pace that serves your ambitions.
            {"I'll let you know if a change puts your goals at risk."}
          </p>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DURATION['scene-in'], delay: 0.1, ease: EASE.settle as [number, number, number, number] }}
          style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 32 }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 32, height: 4, borderRadius: 1, background: 'var(--nyl-purple-500)' }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: '20px', letterSpacing: '0.2px', color: 'var(--text-body-secondary)', whiteSpace: 'nowrap' }}>
              Recommended range
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{
              width: 32,
              height: 10,
              borderRadius: 11,
              border: '2px solid white',
              background: 'var(--nyl-purple-600)',
              boxShadow: '0px 2px 12px 0px rgba(0,10,98,0.45)',
            }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: '20px', letterSpacing: '0.2px', color: 'var(--text-body-secondary)', whiteSpace: 'nowrap' }}>
              Your target (drag to change)
            </span>
          </div>
        </motion.div>

        {/* Slider rows */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION['scene-in'], delay: 0.15, ease: EASE.settle as [number, number, number, number] }}
        >
          <div>
            {SLIDERS.map((config, i) => (
              <StatRow
                key={config.id}
                config={config}
                value={values[config.id]}
                onChange={v => setValue(config.id, v)}
                outOfRange={isOutOfRange(config.id)}
                first={i === 0}
                last={i === SLIDERS.length - 1}
              />
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 2, background: 'var(--nyl-gray-800, #2e3038)', marginTop: 24 }} />

          {/* Result row */}
          <div style={{
            display: 'flex',
            gap: 24,
            alignItems: 'center',
            padding: '16px 24px',
            marginTop: 24,
          }}>
            {/* Left: label + targeting */}
            <div style={{ flex: '0 0 auto', width: 340 }}>
              <p style={{
                margin: '0 0 8px',
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                fontWeight: 500,
                lineHeight: '20px',
                letterSpacing: '0.2px',
                color: 'var(--text-heading)',
              }}>
                Qualified appointments
              </p>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: '28px', letterSpacing: '0.2px', color: 'var(--text-body-secondary)' }}>
                <RecommendedApptsPill />
                {' is the recommended pace to reach your $175K FYC goal.'}
              </div>
            </div>

            <div style={{ flex: 1 }} />

            {/* Right: status + number */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              {/* Status pill */}
              <StatusPill status={status} />

              {/* Appointments count */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
                <motion.span
                  animate={{ color: numberColor }}
                  transition={{ duration: DURATION.deliberate }}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 32,
                    fontWeight: 500,
                    lineHeight: '40px',
                    letterSpacing: '-2px',
                  }}
                >
                  ~{apptsPerWk}
                </motion.span>
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  fontWeight: 400,
                  lineHeight: '20px',
                  letterSpacing: '0.2px',
                  color: 'var(--text-body-secondary)',
                }}>
                  /wk
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DURATION['scene-in'], delay: 0.2, ease: EASE.settle as [number, number, number, number] }}
          style={{ display: 'flex', justifyContent: 'flex-end', gap: 24, marginTop: 24 }}
        >
          <Button variant="text" noArrow onClick={onSkip}>
            Skip
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Target this pace
          </Button>
        </motion.div>
      </div>

      {/* Right rail — NylaGuidance (animated in/out) */}
      <AnimatePresence>
        {anyOutOfRange && (
          <motion.div
            key="nyla-guidance"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: DURATION.deliberate, ease: EASE.settle as [number, number, number, number] }}
            style={{
              gridColumn: '9 / 13',
              minWidth: 0,
              paddingTop: 8,
            }}
          >
            <NylaGuidance>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 16,
                lineHeight: '24px',
                letterSpacing: '0.2px',
                color: 'var(--text-heading)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}>
                <p style={{ margin: 0 }}>{guidanceBody}</p>
                <button
                  type="button"
                  onClick={adjustToRange}
                  style={{
                    alignSelf: 'flex-start',
                    background: 'white',
                    border: '1px solid var(--nyl-purple-100)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 16,
                    fontWeight: 500,
                    lineHeight: '24px',
                    letterSpacing: '0.3px',
                    color: 'var(--nyl-purple-700)',
                    cursor: 'pointer',
                  }}
                >
                  Adjust within range
                </button>
              </div>
            </NylaGuidance>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  )
}

// ── Guidance copy helper ──────────────────────────────────────────────────────

function buildGuidanceBody(outSliders: SliderConfig[], values: Record<string, number>): ReactNode {
  if (outSliders.length === 0) return null

  // Focus on prospects first, then others
  const prospects = outSliders.find(s => s.id === 'prospects')
  if (prospects) {
    const v = values[prospects.id]
    const needed = prospects.recommendedMin - v
    if (needed > 0) {
      return (
        <>
          Looking at the current size of your book, you would need to add{' '}
          <strong>~{needed} more prospects /wk</strong>{' '}
          to your pipeline to reach your recommended appointment volume.
        </>
      )
    }
    return (
      <>
        You're targeting more prospects than recommended. Reducing to{' '}
        <strong>~{prospects.recommendedMax}/wk</strong>{' '}
        keeps your pipeline manageable and your close rate healthy.
      </>
    )
  }

  const referrals = outSliders.find(s => s.id === 'referrals')
  if (referrals) {
    const v = values[referrals.id]
    if (v < referrals.recommendedMin) {
      return (
        <>
          Increasing referral asks to at least{' '}
          <strong>{referrals.recommendedMin}/mo</strong>{' '}
          would significantly improve your qualified appointment volume.
        </>
      )
    }
    return (
      <>
        That's a strong referral target. Stay within{' '}
        <strong>{referrals.recommendedMax}/mo</strong>{' '}
        to keep your follow-up quality high.
      </>
    )
  }

  const networking = outSliders.find(s => s.id === 'networking')
  if (networking) {
    return (
      <>
        Targeting{' '}
        <strong>{values[networking.id]} networking events/mo</strong>{' '}
        puts you outside the recommended range of {networking.recommendedMin}–{networking.recommendedMax}. Adjusting within range keeps your pipeline balanced.
      </>
    )
  }

  return 'Some targets are outside the recommended range. Adjusting within range will keep your goals on track.'
}
