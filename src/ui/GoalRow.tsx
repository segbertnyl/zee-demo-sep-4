import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { EASE, DURATION } from '@/motion'

export interface GoalRowProps {
  icon: React.ReactNode
  title: string
  description?: string
  selected?: boolean
  onSelect?: () => void
  onChange?: () => void
  onRemove?: () => void
  className?: string
}

export function GoalRow({
  icon,
  title,
  description,
  selected = false,
  onSelect,
  onChange,
  onRemove,
  className,
}: GoalRowProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      layout
      role="button"
      tabIndex={0}
      onClick={!selected ? onSelect : undefined}
      onKeyDown={(e) => {
        if (!selected && (e.key === 'Enter' || e.key === ' ')) onSelect?.()
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={className}
      transition={{ duration: DURATION.deliberate, ease: EASE.settle as [number, number, number, number] }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        paddingTop: 12,
        paddingBottom: 12,
        borderTop: '1px solid var(--border-subtle, #dcd9d5)',
        outline: 'none',
        borderRadius: selected ? 4 : 0,
        cursor: selected ? 'default' : 'pointer',
        background: 'transparent',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Icon */}
      <div style={{ flexShrink: 0, width: 24, height: 24 }}>{icon}</div>

      {/* Content */}
      <div style={{ flex: '1 0 0', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <motion.p
          layout="position"
          style={{
            margin: 0,
            fontFamily: 'var(--font-sans)',
            fontSize: 16,
            lineHeight: '24px',
            letterSpacing: '0.2px',
            fontWeight: hovered || selected ? 500 : 400,
            color: hovered || selected ? 'var(--text-heading, #000533)' : 'var(--text-body-secondary, #474952)',
            transition: 'color 120ms ease',
          }}
        >
          {title}
        </motion.p>

        <AnimatePresence initial={false}>
          {selected && description && (
            <motion.div
              key="desc"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: DURATION.deliberate, ease: EASE.settle as [number, number, number, number] }}
              style={{ overflow: 'hidden' }}
            >
              <p
                style={{
                  margin: '8px 0 0',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 16,
                  lineHeight: '24px',
                  letterSpacing: '0.2px',
                  fontWeight: 400,
                  color: 'var(--text-body-secondary, #474952)',
                }}
              >
                {description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions — "Change" and "Remove" appear only on hover/expanded */}
      <AnimatePresence initial={false}>
        {selected && (
          <motion.div
            key="actions"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: DURATION.deliberate, ease: EASE.settle as [number, number, number, number] }}
            style={{
              display: 'flex',
              gap: 24,
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onChange?.()
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontFamily: 'var(--font-sans)',
                fontSize: 16,
                lineHeight: '24px',
                letterSpacing: '0.2px',
                fontWeight: 400,
                color: 'var(--action-primary, #0044cc)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Change
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRemove?.()
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontFamily: 'var(--font-sans)',
                fontSize: 16,
                lineHeight: '24px',
                letterSpacing: '0.2px',
                fontWeight: 400,
                color: 'var(--action-primary, #0044cc)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Remove
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
