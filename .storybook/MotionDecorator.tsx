import React, { useState } from 'react'
import type { Decorator } from '@storybook/react'
import * as Select from '@radix-ui/react-select'
import * as Switch from '@radix-ui/react-switch'
import { MotionConfig } from 'motion/react'
import { EASE, DURATION, DEFAULT_EASE, DEFAULT_DURATION } from '../src/motion'
import type { EaseName, DurationName } from '../src/motion'
import { MotionConfigContext, buildMotionConfig } from '../src/contexts/MotionConfigContext'

/* ── Styled Radix Select ────────────────────────────────────────────────── */

function MotionSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, color: 'var(--text-body-muted, #9b9997)', letterSpacing: '0.12em', textTransform: 'uppercase', width: 60, flexShrink: 0 }}>
        {label}
      </span>
      <Select.Root value={value} onValueChange={(v) => onChange(v as T)}>
        <Select.Trigger
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 6, height: 28, padding: '0 8px', borderRadius: 5,
            border: '1px solid var(--border-subtle, #e8e5e2)',
            background: 'var(--bg-surface, white)',
            fontFamily: 'var(--font-mono, monospace)', fontSize: 11,
            color: 'var(--text-body, #17181c)', cursor: 'pointer', minWidth: 140,
          }}
        >
          <Select.Value />
          <Select.Icon style={{ color: 'var(--text-body-muted, #9b9997)', fontSize: 10 }}>▾</Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={4}
            style={{
              background: 'var(--bg-surface, white)',
              border: '1px solid var(--border-subtle, #e8e5e2)',
              borderRadius: 6, overflow: 'hidden',
              boxShadow: '0 8px 24px -8px rgba(0,10,98,0.16)',
              zIndex: 9999, minWidth: 160,
            }}
          >
            <Select.Viewport>
              {options.map((opt) => (
                <Select.Item
                  key={opt.value}
                  value={opt.value}
                  style={{
                    display: 'flex', alignItems: 'center', padding: '6px 12px',
                    fontFamily: 'var(--font-mono, monospace)', fontSize: 11,
                    color: 'var(--text-body, #17181c)', cursor: 'pointer',
                    outline: 'none',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--nyl-blue-100, #cce3ff)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <Select.ItemText>{opt.label}</Select.ItemText>
                  <Select.ItemIndicator style={{ marginLeft: 'auto', color: 'var(--action-primary, #0468ff)', fontSize: 10 }}>✓</Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  )
}

/* ── Ease + Duration options ────────────────────────────────────────────── */

const EASE_OPTIONS: { value: EaseName; label: string }[] = [
  { value: 'settle',   label: 'settle — enter / reveal' },
  { value: 'lift',     label: 'lift — exit / depart' },
  { value: 'slide',    label: 'slide — panels' },
  { value: 'standard', label: 'standard — weighty' },
]

const DURATION_OPTIONS: { value: DurationName; label: string }[] = Object.entries({
  micro:      '180ms — label fades',
  quick:      '260ms — drawer close',
  short:      '320ms — list enter',
  standard:   '420ms — card entry',
  'scene-in': '520ms — scene enter',
  deliberate: '600ms — panel slide',
  dramatic:   '900ms — hero panels',
}).map(([value, label]) => ({ value: value as DurationName, label }))

/* ── Motion panel ───────────────────────────────────────────────────────── */

function MotionPanel({
  enabled, onEnabled,
  ease, onEase,
  duration, onDuration,
}: {
  enabled: boolean
  onEnabled: (v: boolean) => void
  ease: EaseName
  onEase: (v: EaseName) => void
  duration: DurationName
  onDuration: (v: DurationName) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9998,
        background: 'var(--bg-surface-elevated, #f6f5f3)',
        borderTop: '1px solid var(--border-subtle, #e8e5e2)',
        fontFamily: 'var(--font-sans, sans-serif)',
        boxShadow: '0 -4px 16px -8px rgba(0,10,98,0.10)',
      }}
    >
      {/* Header row — always visible */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '6px 16px',
          cursor: 'pointer', userSelect: 'none',
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <span style={{ fontSize: 12, color: 'var(--action-primary, #0468ff)' }}>⏱</span>
        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-body, #17181c)' }}>
          Motion
        </span>
        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, color: 'var(--text-body-muted, #9b9997)', marginLeft: 4 }}>
          {ease} · {Object.keys(DURATION).indexOf(duration) >= 0 ? `${Math.round(DURATION[duration] * 1000)}ms` : duration}
        </span>

        {/* On/off switch — stop propagation so clicking switch doesn't toggle panel */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }} onClick={(e) => e.stopPropagation()}>
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, color: enabled ? 'var(--action-primary, #0468ff)' : 'var(--text-body-muted, #9b9997)' }}>
            {enabled ? 'on' : 'off'}
          </span>
          <Switch.Root
            checked={enabled}
            onCheckedChange={onEnabled}
            style={{
              width: 32, height: 18, borderRadius: 9, border: 'none', cursor: 'pointer', position: 'relative',
              background: enabled ? 'var(--action-primary, #0468ff)' : 'var(--border-subtle, #e8e5e2)',
              transition: 'background 0.2s',
            }}
          >
            <Switch.Thumb
              style={{
                display: 'block', width: 14, height: 14, borderRadius: 7, background: 'white',
                position: 'absolute', top: 2, left: enabled ? 16 : 2,
                transition: 'left 0.2s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }}
            />
          </Switch.Root>
        </div>

        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, color: 'var(--text-body-faint, #c3bfbb)', marginLeft: 8 }}>
          {open ? '▾' : '▸'}
        </span>
      </div>

      {/* Expanded controls */}
      {open && (
        <div style={{ display: 'flex', gap: 24, padding: '8px 16px 12px', borderTop: '1px solid var(--border-subtle, #e8e5e2)' }}>
          <MotionSelect label="Ease" value={ease} options={EASE_OPTIONS} onChange={onEase} />
          <MotionSelect label="Duration" value={duration} options={DURATION_OPTIONS} onChange={onDuration} />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, color: 'var(--text-body-faint, #c3bfbb)' }}>
              cubic-bezier({EASE[ease].join(', ')}) · {Math.round(DURATION[duration] * 1000)}ms
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Decorator ──────────────────────────────────────────────────────────── */

function MotionWrapper({ Story, globalPlayback }: { Story: React.ComponentType; globalPlayback?: string }) {
  const [localEnabled, setLocalEnabled] = useState(true)
  const [ease, setEase] = useState<EaseName>(DEFAULT_EASE)
  const [duration, setDuration] = useState<DurationName>(DEFAULT_DURATION)

  const globallyDisabled = globalPlayback === 'paused'
  const enabled = localEnabled && !globallyDisabled
  const config = buildMotionConfig(enabled, ease, duration)

  return (
    <MotionConfigContext.Provider value={config}>
      <MotionConfig reducedMotion={enabled ? 'user' : 'always'}>
        <div style={{ paddingBottom: 48 }}>
          <Story />
        </div>
      </MotionConfig>
      <MotionPanel
        enabled={localEnabled}
        onEnabled={setLocalEnabled}
        ease={ease}
        onEase={setEase}
        duration={duration}
        onDuration={setDuration}
      />
    </MotionConfigContext.Provider>
  )
}

export const withMotionControls: Decorator = (Story, context) => (
  <MotionWrapper Story={Story} globalPlayback={context.globals?.motionPlayback} />
)
