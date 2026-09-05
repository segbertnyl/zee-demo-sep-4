import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { EASE, DURATION } from '@/motion'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StatCardSource {
  title: string
  rows: string[]
  src: string
}

export interface StatCardProps {
  label: string
  value: string
  sub?: string
  /** Stack the sub-label below the value instead of right-aligning it */
  subBelow?: boolean
  source?: StatCardSource
  /** Drives the entrance animation; defaults to true */
  revealed?: boolean
  className?: string
}

// ---------------------------------------------------------------------------
// StatCard — profile / onboarding data card
// ---------------------------------------------------------------------------

export function StatCard({ label, value, sub, subBelow = false, source, revealed = true, className }: StatCardProps) {
  const [tipOpen, setTipOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* Short values (≤5 chars) get the large 60px treatment; longer get 32px */
  const big = value.length <= 5

  function openTip() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setTipOpen(true)
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setTipOpen(false), 80)
  }

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    },
    [],
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={{ duration: DURATION['scene-in'], ease: EASE.settle }}
      className={[
        'relative flex min-h-[150px] flex-col justify-between gap-4 rounded-[4px] border border-[var(--border-subtle)] bg-white p-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Header — label + optional info trigger */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-[16px] leading-[24px] tracking-[0.2px] text-[var(--text-headline)]">{label}</p>
        {source && (
          <button
            type="button"
            onMouseEnter={openTip}
            onMouseLeave={scheduleClose}
            onFocus={openTip}
            onBlur={scheduleClose}
            className="-mr-0.5 -mt-0.5 inline-flex size-5 shrink-0 items-center justify-center text-[var(--text-body-muted)] hover:text-[var(--text-body)]"
            aria-label="Source details"
          >
            <InfoIcon />
          </button>
        )}
      </div>

      {/* Value + sub */}
      {subBelow ? (
        <div className="flex w-full flex-col gap-1">
          <p
            className="font-serif text-[32px] leading-[1.1] tracking-[0.3px]"
            style={{ fontWeight: 400, color: 'var(--nyl-purple-600)' }}
          >
            {value}
          </p>
          {sub && (
            <p className="text-[14px] leading-[20px] tracking-[0.2px] text-[var(--text-headline-muted)]">{sub}</p>
          )}
        </div>
      ) : (
        <div className="flex w-full items-end gap-2">
          <p
            className={['font-serif leading-[1.1] tracking-[0.3px]', big ? 'text-[60px]' : 'text-[32px]'].join(' ')}
            style={{ fontWeight: 400, color: 'var(--nyl-purple-600)' }}
          >
            {value}
          </p>
          {sub && (
            <p className="flex-1 pb-1.5 text-right text-[14px] leading-[20px] tracking-[0.2px] text-[var(--text-headline-muted)]">
              {sub}
            </p>
          )}
        </div>
      )}

      {/* Tooltip */}
      <AnimatePresence>
        {tipOpen && source && <StatCardTooltip source={source} onMouseEnter={openTip} onMouseLeave={scheduleClose} />}
      </AnimatePresence>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// StatCardTooltip — source detail popover
// ---------------------------------------------------------------------------

export function StatCardTooltip({
  source,
  onMouseEnter,
  onMouseLeave,
}: {
  source: StatCardSource
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: DURATION.micro, ease: EASE.settle }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute right-3 top-12 z-30 w-[300px] rounded-md border border-[var(--border-subtle)] bg-white p-4 text-left shadow-[0_18px_40px_-16px_rgba(0,10,98,0.24)]"
    >
      <p className="text-[12.5px] font-semibold text-[var(--text-headline)]">{source.title}</p>
      <ul className="mt-2 flex flex-col gap-0.5 text-[12px] text-[var(--text-body)]">
        {source.rows.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <p className="mt-3 text-[11.5px] italic text-[var(--text-body-muted)]">{source.src}</p>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// MetricTile — plan scene activity/goal tile
// ---------------------------------------------------------------------------

export interface MetricTileProps {
  label: string
  value: string
  sub: string
  /** Value font size — 32 for default, 24 for EC / compact contexts */
  valueSize?: 24 | 32
  /** Status dot color */
  dot?: string
  delay?: number
  className?: string
}

export function MetricTile({ label, value, sub, valueSize = 32, dot, delay = 0, className }: MetricTileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION['scene-in'], delay, ease: EASE.settle }}
      className={[
        'flex h-[133px] flex-col rounded-[4px] border border-[var(--nyl-gray-050)] bg-white px-4 pb-4 pt-2 drop-shadow-[0_0_20px_#f8f7f7]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <p className="flex-1 text-[12px] font-medium uppercase leading-[26px] tracking-[2px] text-[var(--text-body)]">
        {label}
      </p>
      <p
        className="font-serif tracking-[0.3px] text-[var(--nyl-purple-600)]"
        style={{ fontWeight: 400, fontSize: valueSize, lineHeight: 1 }}
      >
        {value}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-[12px] leading-[16px] tracking-[0.2px] text-[var(--text-headline)]">{sub}</p>
        {dot && <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ background: dot }} />}
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// GoalsCard — goals rail / sidebar tile (lavender style)
// ---------------------------------------------------------------------------

export interface GoalsCardProps {
  label: string
  status?: string
  dot?: string
  value: string
  sub: string
  className?: string
}

export function GoalsCard({ label, status, dot, value, sub, className }: GoalsCardProps) {
  return (
    <div
      className={[
        'flex h-[111px] flex-col rounded-[4px] border border-[var(--nyl-purple-200)] bg-[var(--nyl-purple-025)] px-4 py-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-medium uppercase tracking-[1.5px] text-[var(--text-body)]">{label}</p>
        {status && dot && (
          <div className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-1.5 rounded-full" style={{ background: dot }} />
            <span className="text-[11px] text-[var(--text-body)]">{status}</span>
          </div>
        )}
      </div>
      <p
        className="mt-auto font-serif text-[24px] leading-[1.1] tracking-[0.3px]"
        style={{ fontWeight: 400, color: 'var(--nyl-purple-600)' }}
      >
        {value}
      </p>
      <p className="text-[11px] leading-[16px] tracking-[0.2px] text-[var(--text-body)]">{sub}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ProgressCard — progress grid tile (filled or empty/add state)
// ---------------------------------------------------------------------------

export interface ProgressCardFilledProps {
  state: 'filled'
  name: string
  amount: string
}
export interface ProgressCardEmptyProps {
  state: 'empty'
  onAdd?: () => void
}
export type ProgressCardProps = ProgressCardFilledProps | ProgressCardEmptyProps

export function ProgressCard(props: ProgressCardProps) {
  if (props.state === 'filled') {
    return (
      <div className="flex h-[133px] flex-col rounded-[4px] border border-[var(--nyl-purple-200)] bg-white p-2">
        <p className="text-[14px] leading-[20px] tracking-[0.2px] text-[var(--text-headline)]">{props.name}</p>
        <p className="text-[14px] leading-[20px] tracking-[0.2px] text-[var(--text-body)]">{props.amount}</p>
        <span className="mt-auto inline-flex h-6 w-fit items-center rounded-[6px] bg-[var(--nyl-purple-050)] px-2 text-[12px] text-[var(--text-body)]">
          In progress
        </span>
      </div>
    )
  }
  return (
    <button
      type="button"
      onClick={props.onAdd}
      className="flex h-[133px] flex-col items-start rounded-[4px] border border-[var(--nyl-blue-100)] bg-white p-2 text-left transition-colors hover:bg-[var(--nyl-gray-025)]"
    >
      <p className="text-[14px] leading-[20px] tracking-[0.2px] text-[var(--text-body)]">Add</p>
      <span className="mt-auto inline-flex h-6 items-center rounded-[6px] bg-[var(--nyl-gray-025)] px-1 text-[var(--action-primary)]">
        <PlusIcon />
      </span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function InfoIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 7.5v4" />
      <circle cx="8" cy="5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M7 2v10M2 7h10" />
    </svg>
  )
}
