/* Status badge — the pill at the top of a briefing task card (Figma 943-27088).
 * Tone maps to the semantic --badge-* tokens. Optional `meta` adds a divided
 * secondary note (e.g. a confidence %). Used by BriefingTaskCard; see the
 * Storybook "UI / StatusBadge 🆕" story for every tone. */

export type StatusBadgeTone = 'lapse' | 'opportunity' | 'monitor' | 'prep' | 'event' | 'ready' | 'growth'

const TONE: Record<StatusBadgeTone, string> = {
  lapse: 'text-[var(--badge-lapse)] bg-[var(--badge-lapse-soft)]',
  opportunity: 'text-[var(--badge-opportunity)] bg-[var(--badge-opportunity-soft)]',
  monitor: 'text-[var(--badge-monitor)] bg-[var(--badge-monitor-soft)]',
  prep: 'text-[var(--badge-prep)] bg-[var(--badge-prep-soft)]',
  /* Event — blue-25 fill, brighter blue-400 dot, no stroke. */
  event: 'text-[var(--badge-event)] bg-[var(--badge-event-soft)]',
  /* Ready — green: fill green-50, text green-700, dot green-600. */
  ready: 'text-[var(--badge-ready)] bg-[var(--badge-ready-soft)]',
  /* Growth — blue (e.g. "Grow your practice"). */
  growth: 'text-[var(--badge-event)] bg-[var(--badge-event-soft)]',
}

export function StatusBadge({ tone, label, meta }: { tone: StatusBadgeTone; label: string; meta?: string }) {
  return (
    <span className={['inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.1em]', TONE[tone]].join(' ')}>
      <span className="inline-flex items-center gap-1.5">
        <span className={['size-1.5 rounded-full', tone === 'event' ? 'bg-[var(--badge-event-dot)]' : tone === 'ready' ? 'bg-[var(--badge-ready-dot)]' : 'bg-current'].join(' ')} />
        {label}
      </span>
      {meta && (
        <>
          <span className="h-2.5 w-px bg-current opacity-30" />
          <span className="font-normal normal-case tracking-normal opacity-70">{meta}</span>
        </>
      )}
    </span>
  )
}
