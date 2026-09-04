import { motion } from 'motion/react'

export type BriefingModeId = 'daily' | 'pre-meeting' | 'weekly' | 'annual'
export type Horizon = 'day' | 'week' | 'month' | 'quarter' | 'year'

const HORIZONS: { id: Horizon; label: string }[] = [
  { id: 'day',     label: 'Day' },
  { id: 'week',    label: 'Week' },
  { id: 'month',   label: 'Month' },
  { id: 'quarter', label: 'Quarter' },
  { id: 'year',    label: 'Year' },
]

function SunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" /><path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" /><path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" /><path d="M20 12h2" />
      <path d="M4.93 19.07l1.41-1.41" /><path d="M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function TargetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  )
}

function BarsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M5 7h14" /><path d="M5 12h14" /><path d="M5 17h14" />
    </svg>
  )
}

function DiamondIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" transform="rotate(45 12 12)" />
      <rect x="9.5" y="9.5" width="5" height="5" transform="rotate(45 12 12)" />
    </svg>
  )
}

const BRIEFING_MODES: {
  id: BriefingModeId
  label: string
  persona: string
  horizon?: Horizon
  tint: string
  iconTint: string
  Icon: React.ComponentType
}[] = [
  { id: 'daily',       label: 'Daily briefing',     persona: 'Nyla',                   horizon: 'day',  tint: 'bg-[var(--nyl-blue-100)]/55',    iconTint: 'text-[var(--nyl-blue-600)]',   Icon: SunIcon },
  { id: 'pre-meeting', label: 'Pre-meeting brief',  persona: 'Intelligence Analyst',                    tint: 'bg-[var(--nyl-blue-100)]/35',    iconTint: 'text-[var(--nyl-blue-600)]',   Icon: TargetIcon },
  { id: 'weekly',      label: 'Weekly ops',         persona: 'Concierge',              horizon: 'week', tint: 'bg-[var(--nyl-orange-100)]/60',  iconTint: 'text-[var(--nyl-orange-500)]', Icon: BarsIcon },
  { id: 'annual',      label: 'Annual / strategic', persona: 'Strategist + Coach',     horizon: 'year', tint: 'bg-[var(--nyl-green-200)]/45',   iconTint: 'text-[var(--nyl-green-800)]',  Icon: DiamondIcon },
]

export type BriefingControlsProps = {
  activeMode: BriefingModeId
  activeHorizon: Horizon
  onModeChange: (mode: BriefingModeId) => void
  onHorizonChange: (horizon: Horizon) => void
}

export function BriefingControls({
  activeMode,
  activeHorizon,
  onModeChange,
  onHorizonChange,
}: BriefingControlsProps) {
  return (
    <div className="mb-8">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-[var(--nyl-blue-800)]/70">
        Briefing mode
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        {BRIEFING_MODES.map((m) => {
          const on = m.id === activeMode
          const Icon = m.Icon
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onModeChange(m.id)}
              aria-pressed={on}
              className={[
                'group relative flex items-start gap-3 rounded-2xl border bg-white/70 px-4 py-3.5 text-left backdrop-blur-sm transition-all',
                on
                  ? 'border-[var(--nyl-blue-500)] bg-white shadow-[0_8px_24px_-16px_rgba(0,10,98,0.35)]'
                  : 'border-white/50 hover:border-[var(--nyl-blue-500)]/40 hover:bg-white/85',
              ].join(' ')}
            >
              <span
                aria-hidden="true"
                className={['inline-flex size-10 shrink-0 items-center justify-center rounded-xl', m.tint, m.iconTint].join(' ')}
              >
                <Icon />
              </span>
              <div className="min-w-0">
                <p className={['text-[14px] font-medium leading-tight', on ? 'text-[var(--nyl-blue-500)]' : 'text-neutral-900'].join(' ')}>
                  {m.label}
                </p>
                <p className="mt-1 text-[11.5px] leading-snug text-neutral-500">{m.persona}</p>
              </div>
            </button>
          )
        })}
      </div>

      {activeMode !== 'pre-meeting' && (
        <nav
          aria-label="Time scope"
          className="mt-4 inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/60 p-1 backdrop-blur-sm"
        >
          {HORIZONS.map((h) => {
            const on = h.id === activeHorizon
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => onHorizonChange(h.id)}
                aria-pressed={on}
                className={[
                  'relative rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors',
                  on ? 'text-white' : 'text-neutral-600 hover:text-neutral-900',
                ].join(' ')}
              >
                {on && (
                  <motion.span
                    layoutId="horizon-pill"
                    className="absolute inset-0 -z-[1] rounded-full bg-[var(--nyl-blue-500)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                {h.label}
              </button>
            )
          })}
        </nav>
      )}
    </div>
  )
}
