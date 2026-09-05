import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { EASE, DURATION } from '@/motion'
import { Nyla } from './Nyla'
import { GoalChip, type GoalIconName } from './GoalChip'

// ── Icons ─────────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#check-clip)">
        <path
          d="M6.00009 10.7799L3.68676 8.46655C3.42676 8.20655 3.00676 8.20655 2.74676 8.46655C2.48676 8.72655 2.48676 9.14655 2.74676 9.40655L5.53342 12.1932C5.79342 12.4532 6.21342 12.4532 6.47342 12.1932L13.5268 5.13988C13.7868 4.87988 13.7868 4.45988 13.5268 4.19988C13.2668 3.93988 12.8468 3.93988 12.5868 4.19988L6.00009 10.7799Z"
          fill="var(--nyl-purple-700)"
        />
      </g>
      <defs>
        <clipPath id="check-clip">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

function PlusCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="6.5" stroke="var(--nyl-purple-600)" strokeWidth="1" />
      <path d="M8 5.5V10.5M5.5 8H10.5" stroke="var(--nyl-purple-600)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NylaWillItem {
  id: string
  label: string
  static?: boolean
}

export interface PlanActionItem {
  title: string
  description: string
  chips?: { icon: GoalIconName; label: string }[]
}

export interface PlanActionsProps {
  icon: React.ReactNode
  title: string
  items: PlanActionItem[]
  nylaItems: NylaWillItem[]
  onMakeChanges?: () => void
  className?: string
  /** Fill behind the "Nyla will…" panel. Defaults to the lavender used in the
   *  Discovery Plan-summary; pass 'transparent' on the Plan page where the design
   *  has no fill on that container. */
  nylaFill?: string
}

// ── PlanActions ───────────────────────────────────────────────────────────────

export function PlanActions({
  icon,
  title,
  items,
  nylaItems,
  onMakeChanges,
  className,
  nylaFill = 'var(--nyl-purple-025, #fbf5ff)',
}: PlanActionsProps) {
  const [hovered, setHovered] = useState(false)
  const [added, setAdded] = useState<Set<string>>(new Set())

  function toggleAdd(id: string) {
    setAdded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const isChecked = (item: NylaWillItem) => item.static || added.has(item.id)

  // PILL_AREA: space reserved to the right for the Nyla circle badge + gap + pills
  // Circle is 40px wide, half (20px) hangs off the card edge, then 16px gap, then pills ~207px
  const PILL_AREA = 20 + 16 + 207 // 243

  return (
    // Outer wrapper spans card + pill area so hover persists when cursor moves to pills
    <div
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', display: 'flex', alignItems: 'stretch' }}
    >
      <motion.div
        animate={{
          borderColor: hovered ? 'var(--action-primary)' : 'var(--border-subtle)',
          boxShadow: hovered ? '0px 2px 14px rgba(0,10,98,0.3)' : '0px 0px 0px rgba(0,0,0,0)',
        }}
        transition={{ duration: DURATION.deliberate }}
        style={{
          flex: 1,
          position: 'relative',
          background: 'white',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div
            style={{
              width: 48,
              height: 48,
              flexShrink: 0,
              background: 'var(--nyl-purple-050)',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </div>
          <p
            style={{
              flex: 1,
              margin: 0,
              fontFamily: 'var(--font-serif)',
              fontSize: 20,
              lineHeight: '32px',
              fontWeight: 400,
              color: 'var(--nyl-blue-900, #000a62)',
            }}
          >
            {title}
          </p>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          {/* Left: plan items */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 32 }}>
            {items.slice(0, 3).map((item, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p
                  style={{
                    margin: 0,
                    fontFamily: 'var(--font-sans)',
                    fontSize: 16,
                    fontWeight: 500,
                    lineHeight: '26px',
                    letterSpacing: '0.3px',
                    color: 'var(--text-heading)',
                  }}
                >
                  {item.title}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontFamily: 'var(--font-sans)',
                    fontSize: 16,
                    fontWeight: 400,
                    lineHeight: '24px',
                    letterSpacing: '0.2px',
                    color: 'var(--text-body-secondary)',
                  }}
                >
                  {item.description}
                </p>
                {item.chips && item.chips.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {item.chips.map((chip, j) => (
                      <GoalChip key={j} icon={chip.icon} label={chip.label} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right: Nyla will... */}
          <div
            style={{
              width: 312,
              flexShrink: 0,
              background: nylaFill,
              borderRadius: 12,
              padding: '16px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '0 4px' }}>
              <Nyla size={40} variant="on-light" />
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 16,
                  fontWeight: 500,
                  letterSpacing: '0.3px',
                  color: 'var(--text-headline)',
                }}
              >
                Nyla will...
              </span>
            </div>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {nylaItems.slice(0, 10).map((item) => {
                const checked = isChecked(item)
                return (
                  <div
                    key={item.id}
                    role={!item.static ? 'button' : undefined}
                    tabIndex={!item.static ? 0 : undefined}
                    onClick={!item.static ? () => toggleAdd(item.id) : undefined}
                    onKeyDown={
                      !item.static
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') toggleAdd(item.id)
                          }
                        : undefined
                    }
                    style={{
                      display: 'flex',
                      gap: 16,
                      alignItems: 'flex-start',
                      padding: '6px 12px 6px 16px',
                      borderRadius: 16,
                      cursor: item.static ? 'default' : 'pointer',
                    }}
                  >
                    <div style={{ paddingTop: 3, flexShrink: 0 }}>{checked ? <CheckIcon /> : <PlusCircleIcon />}</div>
                    <span
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 16,
                        lineHeight: '22px',
                        color: item.static ? 'var(--text-heading)' : 'var(--nyl-purple-600)',
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Badge + pills — single flex row anchored to the right edge, vertically centered */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              key="nyla-hover"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: DURATION.deliberate, ease: EASE.settle as [number, number, number, number] }}
              style={{
                position: 'absolute',
                left: 'calc(100% - 20px)',
                top: '50%',
                translateY: '-50%',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              {/* Nyla badge circle */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  background: 'white',
                  border: '1px solid var(--nyl-purple-200)',
                  borderRadius: 9999,
                  boxShadow: '0 0 16px var(--nyl-purple-200)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Nyla size={40} variant="on-light" />
              </div>
              {/* Pills column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'How did you get this', onClick: undefined as (() => void) | undefined },
                  { label: 'Make a change', onClick: onMakeChanges },
                ].map((action, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={action.onClick}
                    style={{
                      background: 'white',
                      border: '1px solid var(--nyl-purple-100)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 16,
                      lineHeight: '24px',
                      letterSpacing: '0.3px',
                      fontWeight: 500,
                      color: 'var(--nyl-purple-700)',
                      whiteSpace: 'nowrap',
                      cursor: action.onClick ? 'pointer' : 'default',
                      textAlign: 'left',
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Invisible spacer — keeps hover zone alive while cursor moves to pills */}
      <div style={{ width: PILL_AREA, flexShrink: 0 }} />
    </div>
  )
}
