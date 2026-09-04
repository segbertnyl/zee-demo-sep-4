import { useState } from 'react'
import { motion } from 'motion/react'
import { EASE, DURATION } from '@/motion'
import { Nyla } from '@/ui/Nyla'
import { GoalChip, type GoalIconName } from '@/ui/GoalChip'

/* PlanDomain — the per-domain layout used by the Plan page tabs (Practice /
 * Production / Life Balance) in Exploration pt-II (Figma 1327-35971 etc.).
 *
 * Layout: a stack of white action cards on the left (each = one plan action with
 * title, description, goal chips, and a divider + Nyla-suggestion rows), and a
 * transparent "Nyla will…" panel on the right that lives OUTSIDE the cards and is
 * sticky, so it stays in view while the cards scroll. The panel splits into
 * committed items (checkmark, above a divider) and suggestions (＋, below);
 * clicking a suggestion moves it up into the committed list with a checkmark. */

export interface PlanInsight {
  /** Nyla's read — punchy, data-forward analysis / coaching lines (incl. past-metric
   *  comparisons where they make sense). Vary the count per card. */
  analysis: string[]
  /** Gamification hook — a celebratory win / momentum / comparison stat, shown as a
   *  banner at the card bottom so Sarah can clock the win at a glance. */
  badge: string
}

export interface PlanDomainItem {
  title: string
  description: string
  chips?: { icon: GoalIconName; label: string }[]
  /** Nyla's progress insight for this action, shown below the goal chips. */
  insight?: PlanInsight
}

export interface NylaWillItem {
  id: string
  label: string
  /** Committed from the start (rendered checked, above the divider). */
  static?: boolean
}

// ── Icons (light, for the purple background) ────────────────────────────────────

function CheckLight() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M6.00009 10.7799L3.68676 8.46655C3.42676 8.20655 3.00676 8.20655 2.74676 8.46655C2.48676 8.72655 2.48676 9.14655 2.74676 9.40655L5.53342 12.1932C5.79342 12.4532 6.21342 12.4532 6.47342 12.1932L13.5268 5.13988C13.7868 4.87988 13.7868 4.45988 13.5268 4.19988C13.2668 3.93988 12.8468 3.93988 12.5868 4.19988L6.00009 10.7799Z" fill="white"/>
    </svg>
  )
}

function PlusLight() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="white" strokeOpacity="0.7" strokeWidth="1"/>
      <path d="M8 5.5V10.5M5.5 8H10.5" stroke="white" strokeOpacity="0.9" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

function XLight() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="white" strokeOpacity="0.7" strokeWidth="1"/>
      <path d="M5.75 5.75L10.25 10.25M10.25 5.75L5.75 10.25" stroke="white" strokeOpacity="0.9" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

// ── Action card ─────────────────────────────────────────────────────────────────

function ActionCard({ item }: { item: PlanDomainItem }) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--border-subtle)',
      borderRadius: 16,
      padding: 32,
      boxShadow: '0 2px 14px rgba(0,10,98,0.06)',
      overflow: 'hidden', // clip the bottom win banner to the card's rounded corners
    }}>
      <p style={{
        margin: 0,
        fontFamily: 'var(--font-sans)',
        fontSize: 16,
        fontWeight: 500,
        lineHeight: '26px',
        letterSpacing: '0.3px',
        color: 'var(--text-heading)',
      }}>
        {item.title}
      </p>
      <p style={{
        margin: '8px 0 0',
        fontFamily: 'var(--font-sans)',
        fontSize: 16,
        lineHeight: '24px',
        letterSpacing: '0.2px',
        color: 'var(--text-body-secondary)',
      }}>
        {item.description}
      </p>

      {item.chips && item.chips.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 16 }}>
          {item.chips.map((chip, i) => (
            <GoalChip key={i} icon={chip.icon} label={chip.label} />
          ))}
        </div>
      )}

      {item.insight && (
        <>
          {/* divider between the goal chips and Nyla's read */}
          <div style={{
            marginTop: 20,
            paddingTop: 20,
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            {item.insight.analysis.map((point, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ marginTop: 8, width: 4, height: 4, borderRadius: 9999, background: 'var(--nyl-purple-400)', flexShrink: 0 }} />
                <p style={{
                  margin: 0,
                  fontFamily: 'var(--font-sans)',
                  fontSize: 15,
                  lineHeight: '22px',
                  letterSpacing: '0.2px',
                  color: 'var(--text-body-secondary)',
                }}>
                  {point}
                </p>
              </div>
            ))}
          </div>

          {/* gamification "win" banner — always the last item; bleeds to the card
              edges and sits flush at the bottom (card clips it to its radius).
              purple-025 fill; text left-aligned to the card heading (32px inset). */}
          <div style={{
            margin: '16px -32px -32px',
            padding: '16px 32px',
            background: 'var(--nyl-purple-025)',
          }}>
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.2px',
              color: 'var(--nyl-purple-700)',
            }}>
              {item.insight.badge}
            </span>
          </div>
        </>
      )}
    </div>
  )
}

// ── "Nyla will…" panel (external, sticky, on the purple background) ────────────────

function NylaWill({ items }: { items: NylaWillItem[] }) {
  // `on` = ids currently committed (checked). Seeded with the static items.
  const [on, setOn] = useState<Set<string>>(() => new Set(items.filter((i) => i.static).map((i) => i.id)))
  const [editing, setEditing] = useState(false)

  const committed = items.filter((i) => on.has(i.id))
  const available = items.filter((i) => !on.has(i.id))

  function setCommitted(id: string, value: boolean) {
    setOn((prev) => {
      const next = new Set(prev)
      if (value) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const rowBase: React.CSSProperties = {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
    padding: '6px 4px',
    width: '100%',
    background: 'none',
    border: 'none',
    textAlign: 'left',
  }
  const labelBase: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: 16,
    lineHeight: '22px',
  }

  return (
    <div>
      {/* header — Nyla mark + label, and an inline Edit toggle once anything is committed.
          +16px below the header (20px total) to breathe before the list. */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '0 4px 20px' }}>
        <Nyla size={32} variant="on-dark" />
        <span style={{ ...labelBase, fontFamily: 'var(--font-serif)', fontSize: 18, color: 'white' }}>Nyla will…</span>
        <span style={{ flex: 1 }} />
        {committed.length > 0 && (
          <button
            type="button"
            onClick={() => setEditing((e) => !e)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              lineHeight: '20px',
              color: 'rgba(255,255,255,0.75)',
              textDecoration: 'underline',
              textUnderlineOffset: 2,
            }}
          >
            {editing ? 'Done' : 'Edit'}
          </button>
        )}
      </div>

      {/* committed — checkmarks, or ✕ (removable) while editing */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {committed.map((item) => (
          <motion.div
            layout
            key={item.id}
            transition={{ duration: DURATION.short, ease: EASE.settle }}
            role={editing ? 'button' : undefined}
            tabIndex={editing ? 0 : undefined}
            onClick={editing ? () => setCommitted(item.id, false) : undefined}
            onKeyDown={editing ? (e) => { if (e.key === 'Enter' || e.key === ' ') setCommitted(item.id, false) } : undefined}
            style={{ ...rowBase, cursor: editing ? 'pointer' : 'default' }}
          >
            <span style={{ width: 32, display: 'flex', justifyContent: 'center', paddingTop: 2, flexShrink: 0 }}>{editing ? <XLight /> : <CheckLight />}</span>
            <span style={{ ...labelBase, color: 'white' }}>{item.label}</span>
          </motion.div>
        ))}
      </div>

      {/* divider — only when there are both committed and available items */}
      {committed.length > 0 && available.length > 0 && (
        <div style={{ height: 1, background: 'rgba(255,255,255,0.18)', margin: '12px 4px' }} />
      )}

      {/* available — click ＋ to move it up into the committed list */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {available.map((item) => (
          <motion.button
            layout
            key={item.id}
            type="button"
            onClick={() => setCommitted(item.id, true)}
            transition={{ duration: DURATION.short, ease: EASE.settle }}
            style={{ ...rowBase, cursor: 'pointer' }}
          >
            <span style={{ width: 32, display: 'flex', justifyContent: 'center', paddingTop: 2, flexShrink: 0 }}><PlusLight /></span>
            <span style={{ ...labelBase, color: 'rgba(255,255,255,0.88)' }}>{item.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ── PlanDomain ────────────────────────────────────────────────────────────────────

export function PlanDomain({ items, nylaItems }: { items: PlanDomainItem[]; nylaItems: NylaWillItem[] }) {
  return (
    <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
      {/* left — stacked action cards */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.map((item, i) => <ActionCard key={i} item={item} />)}
      </div>

      {/* right — sticky Nyla panel, outside the cards */}
      <div style={{ width: 288, flexShrink: 0, position: 'sticky', top: 24, alignSelf: 'flex-start' }}>
        <NylaWill items={nylaItems} />
      </div>
    </div>
  )
}
