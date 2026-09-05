import { motion } from 'motion/react'

/* Calendar — a quiet day view with the advisor's commitments + light AI annotations.
 * Editorial, sparse, but enough to feel real for the workshop. */

type Block = {
  time: string
  label: string
  meta?: string
  kind: 'meeting' | 'block' | 'open' | 'overflow'
  note?: string
}

const TODAY: Block[] = [
  { time: '8:00', label: 'Morning brief', meta: '10 min · solo', kind: 'block' },
  {
    time: '9:00',
    label: 'Emma Clarke · annual review',
    meta: 'In-person · Astoria',
    kind: 'meeting',
    note: 'Drift toward the retirement-readiness frame.',
  },
  {
    time: '10:30',
    label: 'Patel household · annual review',
    meta: 'Virtual · 60 min',
    kind: 'meeting',
    note: 'Drill loaded. Aanya turns 18 in September.',
  },
  { time: '12:00', label: 'Open · lunch', kind: 'open' },
  {
    time: '1:00',
    label: 'Cesar Powell · reactivation call',
    meta: 'Phone · 20 min',
    kind: 'meeting',
    note: "Lead with his daughter. Don't pitch.",
  },
  { time: '1:30', label: 'Open · 90 minutes', kind: 'open', note: 'Plan my day suggests outreach drafts here.' },
  { time: '3:00', label: 'Block · Astoria field run sequencing', meta: '60 min', kind: 'block' },
  { time: '4:30', label: 'Open · 60 minutes', kind: 'open' },
]

const WEEK = [
  { day: 'Mon', date: 'Jun 2', count: 6, label: 'Today' },
  { day: 'Tue', date: 'Jun 3', count: 4 },
  { day: 'Wed', date: 'Jun 4', count: 7, label: 'Astoria field run' },
  { day: 'Thu', date: 'Jun 5', count: 3, label: 'Business breakfast' },
  { day: 'Fri', date: 'Jun 6', count: 5 },
]

export function CalendarScene() {
  return (
    <section className="flex flex-1 flex-col px-8 pb-20 pt-10 md:px-12 md:pt-12">
      <motion.header
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto w-full max-w-[1080px]"
      >
        <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-neutral-400">Calendar</p>
        <h1
          className="mt-5 font-serif text-[42px] leading-[1.04] tracking-tight text-neutral-900 md:text-[60px]"
          style={{ fontWeight: 400, textWrap: 'balance' }}
        >
          Monday, June 2 — your day in 8 moves.
        </h1>
        <p className="mt-4 max-w-[58ch] text-[14.5px] leading-[1.55] text-neutral-500">
          Three meetings, two blocks, three openings. I marked the openings where I'd plan something if you asked.
        </p>
      </motion.header>

      {/* Week strip */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mx-auto mt-10 grid w-full max-w-[1080px] grid-cols-5 gap-2"
      >
        {WEEK.map((w, i) => (
          <button
            key={w.date}
            type="button"
            className={[
              'rounded-2xl border bg-white p-4 text-left transition-colors',
              i === 0 ? 'border-[var(--nyl-blue-500)]' : 'border-neutral-200 hover:border-neutral-400',
            ].join(' ')}
          >
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-400">
              {w.day} · {w.date}
            </p>
            <p className="mt-2 font-serif text-[26px] leading-none tracking-tight text-neutral-900">{w.count}</p>
            <p className="mt-1 text-[11px] text-neutral-500">events</p>
            {w.label && <p className="mt-2 text-[11.5px] font-medium text-[var(--nyl-blue-600)]">{w.label}</p>}
          </button>
        ))}
      </motion.div>

      {/* Day list */}
      <motion.ol
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mx-auto mt-10 flex w-full max-w-[1080px] flex-col"
      >
        {TODAY.map((b, i) => (
          <motion.li
            key={`${b.time}-${b.label}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.05 * i }}
            className="grid grid-cols-12 items-start gap-4 border-b border-neutral-200 py-4 last:border-b-0"
          >
            <div className="col-span-2 text-right">
              <p className="font-serif text-[20px] leading-none tracking-tight text-neutral-900">{b.time}</p>
            </div>
            <div className="col-span-7 min-w-0">
              <p
                className={[
                  'text-[16px] leading-snug',
                  b.kind === 'open' ? 'italic text-neutral-400' : 'text-neutral-900',
                ].join(' ')}
              >
                {b.label}
              </p>
              {b.meta && <p className="mt-0.5 text-[12px] uppercase tracking-[0.18em] text-neutral-400">{b.meta}</p>}
              {b.note && <p className="mt-1.5 text-[12.5px] italic text-[var(--nyl-blue-600)]">· {b.note}</p>}
            </div>
            <div className="col-span-3 flex items-center justify-end">
              <span
                className={[
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.18em]',
                  b.kind === 'meeting'
                    ? 'bg-[var(--nyl-blue-100)] text-[var(--nyl-blue-800)]'
                    : b.kind === 'block'
                      ? 'bg-neutral-100 text-neutral-600'
                      : 'border border-dashed border-neutral-300 text-neutral-400',
                ].join(' ')}
              >
                {b.kind}
              </span>
            </div>
          </motion.li>
        ))}
      </motion.ol>
    </section>
  )
}
