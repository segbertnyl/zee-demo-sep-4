import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { EASE, DURATION, NYLA } from '@/motion'
import { Button } from '@/ui/Button'
import { Nyla } from '@/ui/Nyla'
import { StatusBadge } from '@/ui/StatusBadge'
import { GoalChip, type GoalIconName } from '@/ui/GoalChip'
import type { TaskCardModel, ClientPreview, NameGlyph } from '@/data/briefingV6Content'
import { SNOOZE_OPTIONS, QUEUE_OPTIONS, DRAFT_LABELS, type DraftKind } from '@/data/briefingV6Content'
import {
  PersonIcon,
  ArrowDropDownIcon,
  DocIcon,
  EmailIcon,
  PhoneIcon,
  BookIcon,
  ExpandContentIcon,
  CollapseContentIcon,
  CheckIcon,
  CalendarIcon,
  OrgChartIcon,
  LocationIcon,
  DomainIcon,
  LicenseIcon,
} from '@/ui/icons'

/* Glyph rendered beside a highlighted name in a headline. */
const NAME_GLYPH: Record<NameGlyph, typeof PersonIcon> = {
  person: PersonIcon,
  calendar: CalendarIcon,
  location: LocationIcon,
  network: OrgChartIcon,
  domain: DomainIcon,
  license: LicenseIcon,
}

/* Briefing-v6 task card — ONE component, all states (Figma 943-27088 / 943-25993
 * / 979-15140 / 943-29146). State is prop-driven so Storybook can render each:
 *   default   → resting; "Mark as done" hidden until hover
 *   focus     → hover/keyboard target; actions + tags fully shown
 *   done      → compact completed row
 *   suggesting→ Nyla-suggested: rotating purple/blue glow border + NEW pill
 *   settled   → suggested content settled into a regular focus card (no glow)
 * Links + CTAs use Blue-500. Primary CTA uses the shared Button component.
 * No cursor is ever rendered — hover states are implemented directly.
 * All icons come from the shared @/ui/icons library. */

export type CardState = 'default' | 'focus' | 'done' | 'loading' | 'suggesting' | 'settled' | 'failed'

export interface BriefingTaskCardProps {
  model: TaskCardModel
  state?: CardState
  expanded?: boolean
  reducedMotion?: boolean
  onToggleExpand?: () => void
  onMarkDone?: () => void
  onSnooze?: (option: string) => void
  onDismiss?: () => void
  onAddToQueue?: (option: string) => void
  onPrimary?: () => void
  onUndo?: () => void
  /** When passed, hides "Mark as done" and shows this text in place of
   *  "Snooze" (same control, same styling — just a different trigger label). */
  label?: string
}

/* Shared link style — Blue-500, per the design note. */
const LINK = 'text-[var(--nyl-blue-500)] hover:text-[var(--nyl-blue-600)]'
/* Compact override so the design-system Button fits the card footer. */
const COMPACT_BTN = '!px-4 !py-2 !text-[13px] !leading-5 !rounded-lg'

/* Map a card's goal label to the matching design-system GoalChip icon. */
function goalIcon(label: string): GoalIconName {
  const l = label.toLowerCase()
  if (l.includes('council')) return 'council'
  if (l.includes('network')) return 'network'
  if (l.includes('fyc') || l.includes('coverage')) return 'fyc'
  if (l.includes('follow')) return 'followup'
  if (l.includes('succession')) return 'succession'
  if (l.includes('retention')) return 'support'
  if (l.includes('compliance') || l.includes('protect')) return 'protect'
  if (l.includes('grow') || l.includes('practice')) return 'growth'
  if (l.includes('client') || l.includes('deepen')) return 'client'
  return 'client'
}

/* ── client-name link + portaled hover preview (Figma 943-29146) ────────────*/
function ClientName({ name, preview, icon = 'person' }: { name: string; preview?: ClientPreview; icon?: NameGlyph }) {
  const Glyph = NAME_GLYPH[icon] ?? PersonIcon
  const ref = useRef<HTMLSpanElement>(null)
  const closeTimer = useRef<number | undefined>(undefined)
  const openTimer = useRef<number | undefined>(undefined)
  const [pos, setPos] = useState<{ left: number; anchorTop: number; anchorBottom: number } | null>(null)

  /* Hover-intent pause: wait 200ms before the preview unfolds, so a cursor
   * passing over the name doesn't flash the card open. */
  const open = useCallback(() => {
    window.clearTimeout(closeTimer.current)
    if (!preview || !ref.current) return
    if (pos) return // already open — don't re-arm the delay
    window.clearTimeout(openTimer.current)
    openTimer.current = window.setTimeout(() => {
      if (!ref.current) return
      const r = ref.current.getBoundingClientRect()
      const width = 524
      const left = Math.max(16, Math.min(r.left, window.innerWidth - width - 16))
      setPos({ left, anchorTop: r.top, anchorBottom: r.bottom })
    }, 200)
  }, [preview, pos])

  const scheduleClose = useCallback(() => {
    window.clearTimeout(openTimer.current)
    closeTimer.current = window.setTimeout(() => setPos(null), 120)
  }, [])

  return (
    <span ref={ref} className="relative inline-flex" onMouseEnter={open} onMouseLeave={scheduleClose}>
      <span
        tabIndex={preview ? 0 : -1}
        onFocus={open}
        onBlur={scheduleClose}
        className="inline-flex items-center gap-1 font-serif leading-none text-[var(--nyl-blue-500)]"
      >
        {name}
        <Glyph size={16} className="text-[var(--nyl-blue-500)]" />
      </span>
      {pos &&
        preview &&
        createPortal(
          <ClientPreviewCard preview={preview} pos={pos} onMouseEnter={open} onMouseLeave={scheduleClose} />,
          document.body,
        )}
    </span>
  )
}

function ClientPreviewCard({
  preview,
  pos,
  onMouseEnter,
  onMouseLeave,
}: {
  preview: ClientPreview
  pos: { left: number; anchorTop: number; anchorBottom: number }
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  /* Keep the card fully on screen: open below the name by default, flip above
   * if it would overflow the bottom, and clamp into the viewport if neither
   * fits. Measured after layout (before paint) so there's no flicker. */
  const cardRef = useRef<HTMLDivElement>(null)
  const [top, setTop] = useState(pos.anchorBottom + 8)
  const [origin, setOrigin] = useState<'top' | 'bottom'>('top')
  useLayoutEffect(() => {
    const el = cardRef.current
    if (!el) return
    const margin = 16
    const vh = window.innerHeight
    const h = el.offsetHeight
    let t = pos.anchorBottom + 8
    let o: 'top' | 'bottom' = 'top'
    if (t + h > vh - margin) {
      const above = pos.anchorTop - h - 8
      if (above >= margin) {
        t = above
        o = 'bottom'
      } else t = Math.max(margin, vh - h - margin)
    }
    setTop(t)
    setOrigin(o)
  }, [pos.left, pos.anchorTop, pos.anchorBottom])

  return (
    <motion.div
      ref={cardRef}
      role="dialog"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, scaleY: 0.82 }}
      animate={{ opacity: 1, scaleY: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: DURATION.standard, ease: EASE.settle }}
      className="fixed z-[200] w-[524px] rounded-[6px] border border-[var(--nyl-blue-100)] bg-white p-4 shadow-[0_0_30px_rgba(0,0,0,0.12)]"
      style={{ left: pos.left, top, transformOrigin: origin }}
    >
      {preview.kind === 'event' ? (
        <>
          <p className="font-serif text-[18px] text-[var(--text-headline)]">
            {preview.eventTitle ?? 'Events near you'}
          </p>
          <p className="mt-1.5 text-[13.5px] leading-[1.5] text-[var(--text-body-muted)]">{preview.blurb}</p>
          {/* tags moved up — below the description, like the client preview */}
          <div className="mt-3 flex flex-wrap gap-1">
            {preview.tags.map((t) => (
              <span
                key={t}
                className="rounded-[41px] border border-[var(--nyl-gray-100)] bg-white px-2 py-1 text-[12px] text-[var(--text-body-muted)]"
              >
                {t}
              </span>
            ))}
          </div>
          <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-body-muted)]">
            Upcoming events
          </p>
          <div className="mt-2 space-y-2.5">
            {preview.events?.map((ev) => (
              <div key={ev.name} className="flex items-start gap-2.5">
                <span
                  className={[
                    'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md',
                    ev.featured
                      ? 'bg-[var(--nyl-blue-050)] text-[var(--nyl-blue-500)]'
                      : 'bg-[var(--nyl-gray-025)] text-[var(--text-body-muted)]',
                  ].join(' ')}
                >
                  <CalendarIcon size={14} />
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[13px] text-[var(--text-headline)]">
                    {ev.name}
                    {ev.featured && (
                      <span className="rounded-full border border-[var(--nyl-purple-050)] bg-white px-1.5 py-0.5 text-[9.5px] font-medium uppercase tracking-[0.08em] text-[var(--badge-new)]">
                        Recommended
                      </span>
                    )}
                  </p>
                  <p className="text-[12px] text-[var(--text-body-muted)]">
                    {ev.when} · {ev.venue}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-[6px] border border-[var(--nyl-purple-100)] bg-[var(--nyl-purple-025)] p-3 text-[12.5px] leading-[1.5] text-[var(--nyl-purple-700)]">
            {preview.eventConnection}
          </div>
        </>
      ) : preview.kind === 'agent' ? (
        <>
          {/* fellow-advisor handoff card */}
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--nyl-gray-050)] text-[var(--text-body-muted)]">
              <PersonIcon size={20} />
            </span>
            <div className="min-w-0">
              <p className="font-serif text-[18px] leading-tight text-[var(--text-headline)]">{preview.nickname}</p>
              <p className="text-[12.5px] text-[var(--text-body-muted)]">
                {preview.clientSince}&nbsp;&nbsp;·&nbsp;&nbsp;{preview.lastTouch}
              </p>
            </div>
          </div>
          <p className="mt-3 text-[14px] leading-[1.5] text-[var(--text-body)]">{preview.blurb}</p>
          <div className="mt-3 flex flex-wrap gap-1">
            {preview.tags.map((t) => (
              <span
                key={t}
                className="rounded-[41px] border border-[var(--nyl-gray-100)] bg-white px-2 py-1 text-[12px] text-[var(--text-body-muted)]"
              >
                {t}
              </span>
            ))}
          </div>
          {preview.notes && preview.notes.length > 0 && (
            <div className="mt-4 rounded-[6px] border border-[var(--border-subtle)] bg-[var(--nyl-gray-025)] p-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-body-muted)]">
                David’s notes for you
              </p>
              <ul className="mt-2 space-y-2">
                {preview.notes.map((n) => (
                  <li key={n} className="flex gap-2 text-[12.5px] leading-[1.5] text-[var(--text-body)]">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-[var(--text-body-faint)]" />
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {preview.files.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--nyl-blue-100)] pt-4">
              {preview.files.map((f) => (
                <span
                  key={f}
                  className="flex items-center gap-1 rounded-[4px] bg-[var(--nyl-blue-050)] py-0.5 pl-1.5 pr-3"
                >
                  <span className="flex items-center p-1 text-[var(--nyl-blue-500)]">
                    <DocIcon size={12} />
                  </span>
                  <span className="truncate text-[12px] text-[var(--nyl-gray-700)]">{f}</span>
                </span>
              ))}
            </div>
          )}
          {preview.email && (
            <div className="mt-3 flex items-stretch gap-1 border-t border-[var(--nyl-blue-100)] pt-3">
              <button
                type="button"
                className="flex h-9 min-w-0 flex-1 items-center justify-center gap-2 rounded-[6px] px-2 text-[14px] text-[var(--text-body-muted)] hover:bg-[var(--nyl-gray-025)]"
              >
                <EmailIcon size={16} /> <span className="truncate">{preview.email}</span>
              </button>
              <button
                type="button"
                className={[
                  'flex h-9 min-w-0 flex-1 items-center justify-center gap-2 rounded-[6px] px-2 text-[14px] font-semibold hover:bg-[var(--nyl-blue-025)]',
                  LINK,
                ].join(' ')}
              >
                <BookIcon size={14} /> View handoff
              </button>
            </div>
          )}
        </>
      ) : preview.kind === 'practice' ? (
        <>
          {/* license / practice credential card */}
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--nyl-blue-050)] text-[var(--nyl-blue-500)]">
              <LicenseIcon size={20} />
            </span>
            <div className="min-w-0">
              <p className="font-serif text-[18px] leading-tight text-[var(--text-headline)]">{preview.nickname}</p>
              <p className="text-[12.5px] text-[var(--text-body-muted)]">
                {preview.clientSince}&nbsp;&nbsp;·&nbsp;&nbsp;{preview.lastTouch}
              </p>
            </div>
          </div>
          <p className="mt-3 text-[14px] leading-[1.5] text-[var(--text-body)]">{preview.blurb}</p>
          <div className="mt-3 flex flex-wrap gap-1">
            {preview.tags.map((t) => (
              <span
                key={t}
                className="rounded-[41px] border border-[var(--nyl-gray-100)] bg-white px-2 py-1 text-[12px] text-[var(--text-body-muted)]"
              >
                {t}
              </span>
            ))}
          </div>
          {preview.insight && (
            <div className="mt-4 flex gap-2 rounded-[6px] border border-[var(--nyl-purple-100)] bg-[var(--nyl-purple-025)] p-3">
              <Nyla size={24} variant="on-light" className="mt-0.5 shrink-0" />
              <p className="text-[12.5px] leading-[1.5] text-[var(--nyl-purple-700)]">{preview.insight}</p>
            </div>
          )}
          {preview.notes && preview.notes.length > 0 && (
            <div className="mt-4 rounded-[6px] border border-[var(--border-subtle)] bg-[var(--nyl-gray-025)] p-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-body-muted)]">
                What it unlocks
              </p>
              <ul className="mt-2 space-y-2">
                {preview.notes.map((n) => (
                  <li key={n} className="flex gap-2 text-[12.5px] leading-[1.5] text-[var(--text-body)]">
                    <CheckIcon size={14} className="mt-0.5 shrink-0 text-[var(--badge-opportunity)]" />
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1 pt-2">
              <p className="text-[14px] leading-[1.5] text-[var(--text-body-muted)]">
                {preview.nickname}&nbsp;&nbsp;·&nbsp;&nbsp;{preview.clientSince}&nbsp;&nbsp;·&nbsp;&nbsp;
                {preview.lastTouch}
              </p>
              <p className="mt-1 text-[14px] leading-[1.5] text-[var(--text-headline)]">{preview.blurb}</p>
            </div>
            <div className="flex w-14 shrink-0 flex-col items-center gap-1 rounded-[6px] bg-[var(--nyl-gray-025)] p-2 text-center">
              <span className="text-[12px] leading-[1.5] text-[var(--text-body-muted)]">Grade</span>
              <span className="font-serif text-[22px] leading-none text-[var(--text-headline)]">
                {preview.grade ?? '—'}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1">
            {preview.tags.map((t) => (
              <span
                key={t}
                className="rounded-[41px] border border-[var(--nyl-gray-100)] bg-white px-2 py-1 text-[12px] text-[var(--text-body-muted)]"
              >
                {t}
              </span>
            ))}
          </div>

          {preview.insight && (
            <div className="mt-4 rounded-[6px] border border-[var(--nyl-purple-100)] bg-[var(--nyl-purple-025)] p-3 text-[12.5px] leading-[1.5] text-[var(--nyl-purple-700)]">
              {preview.insight}
            </div>
          )}

          {preview.files.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--nyl-blue-100)] pt-5">
              {preview.files.map((f) => (
                <span
                  key={f}
                  className="flex items-center gap-1 rounded-[4px] bg-[var(--nyl-blue-050)] py-0.5 pl-1.5 pr-3"
                >
                  <span className="flex items-center p-1 text-[var(--nyl-blue-500)]">
                    <DocIcon size={12} />
                  </span>
                  <span className="truncate text-[12px] text-[var(--nyl-gray-700)]">{f}</span>
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-stretch gap-1 border-t border-[var(--nyl-blue-100)] pt-3">
            {preview.email && (
              <button
                type="button"
                className="flex h-9 min-w-0 flex-1 items-center justify-center gap-2 rounded-[6px] px-2 text-[14px] text-[var(--text-body-muted)] hover:bg-[var(--nyl-gray-025)]"
              >
                <EmailIcon size={16} /> <span className="truncate">{preview.email}</span>
              </button>
            )}
            {preview.phone && (
              <button
                type="button"
                className="flex h-9 min-w-0 flex-1 items-center justify-center gap-2 rounded-[6px] px-2 text-[14px] text-[var(--text-body-muted)] hover:bg-[var(--nyl-gray-025)]"
              >
                <PhoneIcon size={12} /> <span className="truncate">{preview.phone}</span>
              </button>
            )}
            <button
              type="button"
              className={[
                'flex h-9 min-w-0 flex-1 items-center justify-center gap-2 rounded-[6px] px-2 text-[14px] font-semibold hover:bg-[var(--nyl-blue-025)]',
                LINK,
              ].join(' ')}
            >
              <BookIcon size={14} /> Full profile
            </button>
          </div>
        </>
      )}
    </motion.div>
  )
}

/* ── dropdown trigger (Snooze · Add to queue · draft-type) ───────────────────
 * The trigger word carries a dotted underline + caret; an optional blue prefix
 * sits before it (e.g. "Add to queue"). Open state darkens the trigger. */
function MenuButton({
  prefix,
  trigger,
  value,
  options,
  onPick,
  align = 'right',
}: {
  prefix?: string
  trigger: string
  /** Controlled display value (overrides internal picked state). */
  value?: string
  options: string[]
  onPick?: (o: string) => void
  align?: 'left' | 'right'
}) {
  const [open, setOpen] = useState(false)
  const [picked, setPicked] = useState(trigger)
  const shown = value ?? picked
  return (
    <span className="relative inline-flex items-center gap-1 text-[12.5px] font-medium">
      {prefix && <span className={LINK}>{prefix}</span>}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className={[
          'inline-flex items-center gap-0.5 transition-colors',
          open ? 'text-[var(--text-body)]' : 'text-[var(--text-body-muted)] hover:text-[var(--text-body)]',
        ].join(' ')}
      >
        <span
          className={[
            'underline decoration-dotted underline-offset-[3px]',
            open ? 'decoration-[var(--text-body)]' : 'decoration-[var(--text-body-faint)]',
          ].join(' ')}
        >
          {shown}
        </span>
        <ArrowDropDownIcon size={16} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: DURATION.micro, ease: EASE.settle }}
            className={[
              'absolute top-[calc(100%+6px)] z-40 block w-[170px] overflow-hidden rounded-lg border border-[var(--border-default)] bg-white py-1 shadow-[0_14px_36px_-16px_rgba(23,24,28,0.3)]',
              align === 'right' ? 'right-0' : 'left-0',
            ].join(' ')}
          >
            {options.map((o) => (
              <button
                key={o}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setOpen(false)
                  setPicked(o)
                  onPick?.(o)
                }}
                className={[
                  'block w-full px-3 py-2 text-left text-[12.5px] hover:bg-[var(--nyl-gray-025)]',
                  o === picked ? 'font-medium text-[var(--text-body)]' : 'text-[var(--text-body)]',
                ].join(' ')}
              >
                {o}
              </button>
            ))}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

/* ── main component ──────────────────────────────────────────────────────── */
export function BriefingTaskCard({
  model,
  state = 'default',
  expanded = false,
  reducedMotion,
  onToggleExpand,
  onMarkDone,
  onSnooze,
  onDismiss,
  onAddToQueue,
  onPrimary,
  onUndo,
  label,
}: BriefingTaskCardProps) {
  const reduced = reducedMotion ?? false
  /* Selected draft channel in the expanded view (call/text/email). */
  const draftKinds = model.drafts ? (Object.keys(model.drafts) as DraftKind[]) : []
  const [draftKind, setDraftKind] = useState<DraftKind>(model.defaultDraft ?? draftKinds[0] ?? 'call')
  const activeDraft = model.drafts?.[draftKind]
  const isSuggested = state === 'suggesting'
  const isSettled = state === 'settled'
  const isFailed = state === 'failed'
  const showNew = isSuggested || isSettled
  const hasDraft = !!model.drafts

  /* ── done (Figma 1102-102376) — green outline, DONE chip, concise summary ── */
  if (state === 'done') {
    const summary =
      model.doneSummary ??
      `${model.headlinePrefix} ${model.clientName ?? ''} ${model.headlineSuffix}`.replace(/\s+/g, ' ').trim()
    return (
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: NYLA.taskComplete.duration, ease: NYLA.taskComplete.ease }}
        className="flex items-center gap-4 rounded-[14px] border border-[var(--nyl-green-600)] bg-white px-5 py-[38px]"
      >
        <span className="inline-flex shrink-0 items-center gap-1.5 text-[var(--nyl-green-600)]">
          <CheckIcon size={16} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">Done</span>
        </span>
        <p className="min-w-0 flex-1 truncate text-[14px] text-[var(--text-body)]">{summary}</p>
        <button type="button" onClick={onUndo} className={['shrink-0 text-[12.5px] font-medium', LINK].join(' ')}>
          Undo
        </button>
      </motion.div>
    )
  }

  /* ── loading (Figma 1102-105706) — glowing card, centered Nyla sparkle while
   *    the suggested task is generated. Fills in (suggesting) once ready. ───── */
  if (state === 'loading') {
    return (
      <div className="nyla-suggest-glow rounded-[16px]">
        <motion.div
          layout
          className="nyla-suggest-card flex h-[212px] items-center justify-center rounded-[14px] border border-transparent bg-white"
        >
          <motion.span
            className="text-[var(--nyl-purple-500)]"
            animate={reduced ? undefined : { scale: [1, 1.12, 1], opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity }}
          >
            <Nyla size={40} variant="on-light" />
          </motion.span>
        </motion.div>
      </div>
    )
  }

  const glowShadow = isSuggested ? NYLA.glow.peakShadow : NYLA.glow.restingShadow
  const hasAcks = !!model.acknowledgements && (isSuggested || isSettled)
  const expandable = hasDraft || hasAcks || !!model.eventExpand || !!model.review || !!model.pathway

  /* When the suggested card fills in (loading → suggesting), reveal its content
   * with a per-block stagger — a typewriter-style "fill" (Figma 1102-104792). */
  const fill = (i: number) =>
    isSuggested && !reduced
      ? {
          initial: { opacity: 0, y: 4, filter: 'blur(6px)' },
          animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
          transition: {
            delay: NYLA.fill.startDelay + i * NYLA.fill.perBlock,
            duration: NYLA.fill.duration,
            ease: EASE.settle,
          },
        }
      : {}

  const card = (
    <motion.div
      layout
      initial={false}
      animate={{ boxShadow: glowShadow }}
      transition={{
        boxShadow: { duration: isSuggested ? NYLA.glow.rampIn : NYLA.glow.rampOut, ease: EASE.settle },
        layout: { duration: DURATION.standard, ease: EASE.settle },
      }}
      className={[
        'nyla-suggest-card group relative overflow-hidden rounded-[14px] border bg-white',
        isSuggested
          ? 'border-transparent'
          : isSettled
            ? 'border-[var(--nyl-purple-200)]'
            : isFailed
              ? 'border-[var(--nyl-red-040)]'
              : 'border-[var(--border-subtle)]',
      ].join(' ')}
    >
      <div className="p-5">
        {/* top row: badge(s) + actions — 24px gap to the headline (Figma 1102-107961) */}
        <div className="mb-6 flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={model.badge.tone} label={model.badge.label} meta={model.badge.meta} />
            {showNew && (
              <span className="inline-flex items-center rounded-full bg-[var(--badge-new-soft)] px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.1em] text-[var(--badge-new)]">
                New
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-4">
            {isSuggested ? (
              <>
                <button type="button" onClick={onDismiss} className={['text-[12.5px] font-medium', LINK].join(' ')}>
                  Dismiss
                </button>
                <MenuButton prefix="Add to queue" trigger="now" options={QUEUE_OPTIONS} onPick={onAddToQueue} />
              </>
            ) : (
              <>
                {!label && (
                  <button
                    type="button"
                    onClick={onMarkDone}
                    className={[
                      'text-[12.5px] font-medium transition-opacity',
                      LINK,
                      state === 'default' ? 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100' : 'opacity-100',
                    ].join(' ')}
                  >
                    Mark as done
                  </button>
                )}
                <MenuButton trigger={label ?? 'Snooze'} options={SNOOZE_OPTIONS} onPick={onSnooze} />
              </>
            )}
          </div>
        </div>

        {/* headline */}
        <motion.p
          {...fill(0)}
          className="font-serif text-[21px] leading-[1.3] tracking-[-0.01em] text-[var(--text-headline)]"
          style={{ fontWeight: 400, textWrap: 'pretty' }}
        >
          {model.headlinePrefix}{' '}
          {model.clientName && (
            <ClientName name={model.clientName} preview={model.clientPreview} icon={model.clientIcon} />
          )}{' '}
          {model.secondName && (
            <>
              {model.headlineMid && <>{model.headlineMid} </>}
              <ClientName
                name={model.secondName.name}
                preview={model.secondName.preview}
                icon={model.secondName.icon}
              />{' '}
            </>
          )}
          {model.headlineSuffix}
        </motion.p>

        {/* description */}
        <motion.p {...fill(1)} className="mt-2.5 text-[14px] leading-[1.5] text-[var(--text-body-muted)]">
          {model.description}
        </motion.p>

        {/* goal chips (design-system GoalChip — one per goal on the card) */}
        <motion.div {...fill(2)} className="mt-4 flex flex-wrap gap-2">
          {model.tags.map((t) => (
            <GoalChip key={t} icon={goalIcon(t)} label={t} />
          ))}
        </motion.div>
      </div>

      {/* failed — agent couldn't complete autonomously */}
      {isFailed && (
        <div className="flex items-center gap-2 border-t border-[var(--border-subtle)] bg-[var(--badge-lapse-soft)] px-5 py-2.5 text-[12.5px] text-[var(--badge-lapse)]">
          <span className="flex size-4 items-center justify-center rounded-full bg-[var(--badge-lapse)] text-[10px] font-bold text-white">
            !
          </span>
          Nyla couldn’t complete this automatically.
          <button type="button" onClick={onPrimary} className="ml-auto font-medium underline">
            Retry
          </button>
        </div>
      )}

      {/* footer — the expand toggle (icon + label) opens/collapses the
          card's bottom section. Hover highlights icon + text. */}
      <div className="flex items-center justify-between gap-3 border-t border-[var(--border-subtle)] px-5 py-3.5">
        {expandable ? (
          <button
            type="button"
            onClick={onToggleExpand}
            aria-expanded={expanded}
            className={[
              'group/ft inline-flex items-center gap-2 text-[12.5px] font-medium transition-colors hover:text-[var(--nyl-blue-500)]',
              expanded ? 'text-[var(--nyl-blue-600)]' : 'text-[var(--text-body-muted)]',
            ].join(' ')}
          >
            {/* expanded state shows the COLLAPSE glyph (Figma 1102-107961) */}
            {expanded ? (
              <CollapseContentIcon
                size={16}
                className="text-[var(--nyl-blue-600)] transition-colors group-hover/ft:text-[var(--nyl-blue-500)]"
              />
            ) : (
              <ExpandContentIcon size={16} className="transition-colors group-hover/ft:text-[var(--nyl-blue-500)]" />
            )}
            {model.footerLabel}
          </button>
        ) : (
          <span className="inline-flex items-center gap-2 text-[12.5px] font-medium text-[var(--text-body-muted)]">
            <ExpandContentIcon size={16} />
            {model.footerLabel}
          </span>
        )}
        <div className="flex items-center gap-4">
          {model.email ? (
            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--text-body-muted)]">
              <EmailIcon size={14} />
              {model.email}
            </span>
          ) : model.phone ? (
            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--text-body-muted)]">
              <PhoneIcon size={12} />
              {model.phone}
            </span>
          ) : null}
          <Button variant="primary" className={COMPACT_BTN} onClick={onPrimary}>
            {model.primaryCta}
          </Button>
        </div>
      </div>

      {/* expanded bottom section (Figma 943-25993 / 979-15140) — separated from
          the footer by its own border. Draft for task cards; acknowledgements
          for Nyla-suggested cards. */}
      <AnimatePresence initial={false}>
        {expanded && expandable && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: DURATION.dramatic, ease: EASE.settle }}
            className="overflow-hidden"
          >
            {model.pathway ? (
              <div className="border-t border-[var(--border-subtle)] px-5 py-4">
                {/* what a Series 65 covers */}
                <p className="text-[13.5px] leading-[1.5] text-[var(--text-body)]">{model.pathway.overview}</p>
                <p className="mt-4 text-[12px] uppercase tracking-[0.1em] text-[var(--text-body-muted)]">
                  What it covers
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {model.pathway.coverage.map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-[var(--nyl-gray-100)] bg-white px-3 py-1 text-[12px] text-[var(--text-body-muted)]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                {/* the path — a numbered timeline of what to expect */}
                <p className="mt-5 text-[12px] uppercase tracking-[0.1em] text-[var(--text-body-muted)]">
                  The path — what to expect
                </p>
                <ol className="mt-3">
                  {model.pathway.steps.map((s, i) => (
                    <li key={s.label} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--nyl-purple-050)] text-[11px] font-semibold text-[var(--nyl-purple-600)]">
                          {i + 1}
                        </span>
                        {i < model.pathway!.steps.length - 1 && (
                          <span className="my-1 w-px flex-1 bg-[var(--border-subtle)]" />
                        )}
                      </div>
                      <div className={['flex-1', i < model.pathway!.steps.length - 1 ? 'pb-4' : ''].join(' ')}>
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-[13.5px] font-medium text-[var(--text-headline)]">{s.label}</span>
                          {s.when && (
                            <span className="shrink-0 text-[12px] text-[var(--text-body-muted)]">{s.when}</span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[13px] leading-[1.5] text-[var(--text-body-muted)]">{s.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ) : model.drafts && activeDraft ? (
              <div className="border-t border-[var(--border-subtle)] px-5 py-4">
                <MenuButton
                  trigger={DRAFT_LABELS[draftKind]}
                  value={DRAFT_LABELS[draftKind]}
                  options={draftKinds.map((k) => DRAFT_LABELS[k])}
                  onPick={(label) => {
                    const k = draftKinds.find((kind) => DRAFT_LABELS[kind] === label)
                    if (k) setDraftKind(k)
                  }}
                  align="left"
                />
                <p className="mt-3 text-[13.5px] leading-[1.5] text-[var(--text-body-muted)]">{activeDraft.context}</p>
                <p className="mt-3 whitespace-pre-line rounded-lg border border-[var(--border-subtle)] bg-[var(--nyl-gray-025)] px-4 py-3 text-[13.5px] leading-[1.5] text-[var(--text-body)]">
                  {activeDraft.body}
                </p>
                <p className="mt-2 text-[11.5px] italic text-[var(--text-body-faint)]">{activeDraft.meta}</p>
              </div>
            ) : model.eventExpand ? (
              <div className="border-t border-[var(--border-subtle)] px-5 py-4">
                <p className="text-[13.5px] leading-[1.5] text-[var(--text-body)]">{model.eventExpand.details}</p>
                <p className="mt-4 text-[12px] uppercase tracking-[0.1em] text-[var(--text-body-muted)]">
                  Advisors like you who registered
                </p>
                <ul className="mt-2 space-y-2">
                  {model.eventExpand.agents.map((a) => (
                    <li key={a.name} className="flex items-baseline justify-between gap-3 text-[13px]">
                      <span className="text-[var(--text-headline)]">
                        {a.name} <span className="text-[var(--text-body-muted)]">· {a.location}</span>
                      </span>
                      <span className="shrink-0 text-right text-[var(--text-body-muted)]">{a.result}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : model.review ? (
              <div className="border-t border-[var(--border-subtle)] px-5 py-4">
                <p className="text-[12px] uppercase tracking-[0.1em] text-[var(--text-body-muted)]">Documents</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {model.review.documents.map((f) => (
                    <span
                      key={f}
                      className="flex items-center gap-1 rounded-[4px] bg-[var(--nyl-blue-050)] py-0.5 pl-1.5 pr-3"
                    >
                      <span className="flex items-center p-1 text-[var(--nyl-blue-500)]">
                        <DocIcon size={12} />
                      </span>
                      <span className="truncate text-[12px] text-[var(--nyl-gray-700)]">{f}</span>
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-[12px] uppercase tracking-[0.1em] text-[var(--text-body-muted)]">
                  Recent meetings — why this review
                </p>
                <ul className="mt-2 space-y-2.5">
                  {model.review.recap.map((r) => (
                    <li key={r.date} className="flex gap-3 text-[13px] leading-[1.5]">
                      <span className="w-16 shrink-0 font-medium text-[var(--text-body-muted)]">{r.date}</span>
                      <span className="text-[var(--text-body)]">{r.note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="border-t border-[var(--border-subtle)] px-5 py-3">
                {model.acknowledgements!.map((a, i) => (
                  <motion.p
                    key={a.label}
                    initial={reduced ? false : { opacity: 0, y: 4, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ delay: 0.35 + i * 0.22, duration: DURATION.deliberate, ease: EASE.settle }}
                    className="flex flex-wrap items-center gap-1.5 py-1 text-[12.5px] text-[var(--text-body-muted)]"
                  >
                    {a.label}
                    <span aria-hidden="true">·</span>
                    <button type="button" className={['font-medium', LINK].join(' ')}>
                      {a.cta}
                    </button>
                  </motion.p>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )

  return isSuggested ? <div className="nyla-suggest-glow rounded-[16px]">{card}</div> : card
}
