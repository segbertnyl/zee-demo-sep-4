import { AnimatePresence, motion } from 'motion/react'
import { EASE, DURATION } from '@/motion'
import { BadgePill } from '@/ui/BadgePill'
import { Chevron } from '@/ui/Chevron'

export interface CoSAction {
  label: string
  prompt?: string
  freeform?: boolean
  canvasId?: string
}

export interface CardDetails {
  analysis: string
  insight: string
  recommendation: string
  followup?: string
  suggestedActions?: CoSAction[]
}

export interface UrgentCardProps {
  item: {
    id: string
    title: string
    body: string
    meta: string
    badge?: { label: string; tone: 'urgent' | 'monitor' | 'opportunity' }
    details?: CardDetails
    actionPrompt?: string
  }
  expanded: boolean
  onToggle: () => void
  onActionPrompt?: (prompt: string) => void
  onSuggestedAction?: (action: CoSAction) => void
}

export interface SignalCardProps {
  signal: {
    id: string
    pip: 'red' | 'amber' | 'green'
    title: string
    body: string
    action: string
    badge: { label: string; tone: 'urgent' | 'monitor' | 'opportunity' }
    details?: CardDetails
    actionPrompt?: string
  }
  expanded: boolean
  onToggle: () => void
  onActionPrompt?: (prompt: string) => void
  onSuggestedAction?: (action: CoSAction) => void
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10 3 L17.5 16 H2.5 Z" />
      <path d="M10 9 V12" />
      <circle cx="10" cy="14" r="0.7" fill="currentColor" />
    </svg>
  )
}

function PenIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-white/80"
    >
      <path d="M11.3 2.2 L13.8 4.7 L5 13.5 L2 14 L2.5 11 Z" />
      <path d="M10.3 3.2 L12.8 5.7" />
    </svg>
  )
}

function CoSExpandedBody({
  expanded,
  details,
  onSuggestedAction,
}: {
  expanded: boolean
  details: CardDetails | undefined
  onSuggestedAction?: (action: CoSAction) => void
}) {
  return (
    <AnimatePresence initial={false}>
      {expanded && details && (
        <motion.div
          key="body"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: DURATION.short, ease: EASE.settle }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-1 gap-7 border-t border-[var(--border-subtle)] px-7 pb-6 pt-5 md:grid-cols-3">
            <div>
              <p className="text-[12.5px] text-[var(--text-body-muted)]">Analysis</p>
              <p className="mt-2 text-[13.5px] leading-[1.55] text-[var(--text-body)]">{details.analysis}</p>
            </div>
            <div>
              <p className="text-[12.5px] text-[var(--text-body-muted)]">Insight</p>
              <p className="mt-2 text-[13.5px] leading-[1.55] text-[var(--text-body)]">{details.insight}</p>
            </div>
            <div>
              <p className="text-[12.5px] text-[var(--text-body-muted)]">Recommendation</p>
              <p className="mt-2 text-[13.5px] leading-[1.55] text-[var(--text-body)]">{details.recommendation}</p>
            </div>
          </div>
          {details.followup && (
            <p className="bg-[var(--nyl-blue-050)] px-7 py-3 text-center text-[13.5px] text-[var(--text-body)]">
              {details.followup}
            </p>
          )}
          {details.suggestedActions && details.suggestedActions.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 px-7 py-5">
              <span
                aria-hidden="true"
                className="flex size-11 shrink-0 items-center justify-center rounded-full text-[var(--nyl-blue-500)]"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, #1a2a6b 0%, #060f3f 65%, #02071f 100%)',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 28 28" fill="currentColor">
                  <path d="M12.5759 1.06709C12.992 -0.355698 15.0074 -0.355698 15.4235 1.06709L17.0505 6.63252L22.1374 3.84834C23.4377 3.13651 24.8629 4.56172 24.1511 5.86202L21.3669 10.948L26.9323 12.5759C28.3551 12.992 28.3551 15.0074 26.9323 15.4235L21.3659 17.0505L24.1511 22.1384C24.8628 23.4386 23.4377 24.8639 22.1374 24.1521L17.0505 21.3669L15.4235 26.9323C15.0074 28.3551 12.992 28.3551 12.5759 26.9323L10.948 21.3669L5.86202 24.1521C4.56177 24.8639 3.13668 23.4386 3.84834 22.1384L6.63252 17.0505L1.06709 15.4235C-0.355698 15.0074 -0.355698 12.992 1.06709 12.5759L6.63252 10.948L3.84834 5.86202C3.13651 4.56172 4.56172 3.13651 5.86202 3.84834L10.948 6.63252L12.5759 1.06709Z" />
                </svg>
              </span>
              {details.suggestedActions.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSuggestedAction?.(a)
                  }}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[13.5px] text-white transition-shadow hover:shadow-[0_10px_24px_-12px_rgba(2,7,31,0.55)]"
                  style={{
                    background: 'linear-gradient(180deg, #0b1740 0%, #050b29 100%)',
                    boxShadow: '0 6px 14px -10px rgba(2, 7, 31, 0.6), 0 0 0 1px rgba(255,255,255,0.04) inset',
                  }}
                >
                  {a.freeform && <PenIcon />}
                  <span className={a.freeform ? 'italic text-[var(--nyl-blue-250)]' : ''}>{a.label}</span>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function UrgentCard({ item, expanded, onToggle, onActionPrompt, onSuggestedAction }: UrgentCardProps) {
  // TODO: #fecaca, #fef2f2, #fee2e2, #dc2626, #b82a1f — urgent/error colors have no NYL token equivalents; design system gap
  const toneRing =
    item.badge?.tone === 'urgent'
      ? 'border-[#fecaca] bg-[#fef2f2]'
      : item.badge?.tone === 'opportunity'
        ? 'border-[var(--nyl-green-600)]/35 bg-[var(--nyl-green-200)]/30'
        : 'border-[var(--border-subtle)] bg-white'
  const dotBg =
    item.badge?.tone === 'urgent'
      ? 'bg-[#fee2e2] text-[#b82a1f]'
      : item.badge?.tone === 'opportunity'
        ? 'bg-[var(--nyl-green-200)]/70 text-[var(--nyl-green-800)]'
        : 'bg-[var(--nyl-gray-050)] text-[var(--text-body)]'

  return (
    <div className={['overflow-hidden rounded-xl border', toneRing].join(' ')}>
      <button type="button" onClick={onToggle} className="group flex w-full items-start gap-4 p-5 text-left">
        <span
          aria-hidden="true"
          className={['mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md', dotBg].join(' ')}
        >
          <AlertIcon />
        </span>
        <div className="min-w-0 flex-1">
          <p
            className="font-serif text-[20px] leading-[1.25] tracking-tight text-[var(--text-headline)] md:text-[22px]"
            style={{ fontWeight: 400, textWrap: 'balance' }}
          >
            {item.title}
          </p>
          <p className="mt-2 text-[13.5px] leading-snug text-[var(--text-body)]">{item.body}</p>
          {item.actionPrompt ? (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                onActionPrompt?.(item.actionPrompt!)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation()
                  onActionPrompt?.(item.actionPrompt!)
                }
              }}
              className="mt-3 inline-flex text-[12.5px] font-medium text-[var(--nyl-blue-500)] hover:text-[var(--nyl-blue-800)] cursor-pointer"
            >
              → {item.meta}
            </span>
          ) : (
            <p className="mt-3 text-[12px] text-[var(--text-body-muted)]">{item.meta}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {item.badge && <BadgePill tone={item.badge.tone} label={item.badge.label} />}
          {item.details && <Chevron expanded={expanded} />}
        </div>
      </button>
      <CoSExpandedBody expanded={expanded} details={item.details} onSuggestedAction={onSuggestedAction} />
    </div>
  )
}

export function SignalCard({ signal, expanded, onToggle, onActionPrompt, onSuggestedAction }: SignalCardProps) {
  // TODO: #dc2626 red pip — no NYL error/danger token; design system gap
  const pip =
    signal.pip === 'red'
      ? 'bg-[#dc2626]'
      : signal.pip === 'amber'
        ? 'bg-[var(--nyl-orange-400)]'
        : 'bg-[var(--nyl-green-600)]'

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-white">
      <button type="button" onClick={onToggle} className="group flex w-full items-start gap-4 p-5 text-left">
        <div className="min-w-0 flex-1">
          <p
            className="flex items-center gap-2 font-serif text-[19px] leading-[1.25] tracking-tight text-[var(--text-headline)] md:text-[20px]"
            style={{ fontWeight: 400, textWrap: 'balance' }}
          >
            <span aria-hidden="true" className={['inline-block size-2 shrink-0 rounded-full', pip].join(' ')} />
            {signal.title}
          </p>
          <p className="mt-1.5 text-[13.5px] leading-snug text-[var(--text-body)]">{signal.body}</p>
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation()
              if (signal.actionPrompt) onActionPrompt?.(signal.actionPrompt)
            }}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && signal.actionPrompt) {
                e.stopPropagation()
                onActionPrompt?.(signal.actionPrompt)
              }
            }}
            className={[
              'mt-2 inline-flex text-[12.5px] font-medium',
              signal.actionPrompt
                ? 'cursor-pointer text-[var(--nyl-blue-500)] hover:text-[var(--nyl-blue-800)]'
                : 'text-[var(--nyl-blue-500)]',
            ].join(' ')}
          >
            → {signal.action}
          </span>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <BadgePill tone={signal.badge.tone} label={signal.badge.label} />
          {signal.details && <Chevron expanded={expanded} />}
        </div>
      </button>
      <CoSExpandedBody expanded={expanded} details={signal.details} onSuggestedAction={onSuggestedAction} />
    </div>
  )
}
