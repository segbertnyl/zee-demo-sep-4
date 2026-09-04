import { motion } from 'motion/react'
import { useAppStore } from '@/state/useAppStore'

/* SignalsCanvas — Layer 2 view of the trigger feed.
 *
 * Ported from agent-os-v2's universe/seed-triggers model. Each trigger is a
 * node grouped by type (new_home / term_expiring / no_touch_90 / etc.);
 * clicking a trigger drills into the affected client's deep-dive (Layer 3),
 * which the existing ActionDeepDive overlay handles.
 *
 * Lightweight in v5 Phase 1 — a grid of trigger nodes grouped by type. Future
 * iterations will lay these out spatially with edges to the affected clients. */

type TriggerType =
  | 'new_home'
  | 'term_expiring'
  | 'no_touch_90'
  | 'birth'
  | 'retirement_milestone'
  | 'content_engagement'
  | 'wealth_milestone'
  | 'beneficiary_uninsured'

type Trigger = {
  id: string
  type: TriggerType
  clientId: string   /* maps to ActionDeepDive canvasId */
  clientName: string
  detail: string
  /* Days since the trigger fired. Lower = more urgent. */
  freshness: number
}

const TYPE_LABEL: Record<TriggerType, string> = {
  new_home: 'New address',
  term_expiring: 'Term expiring',
  no_touch_90: 'No-touch 90d',
  birth: 'New dependent',
  retirement_milestone: 'Retirement milestone',
  content_engagement: 'Content engagement',
  wealth_milestone: 'Wealth milestone',
  beneficiary_uninsured: 'Uninsured beneficiary',
}

const TYPE_TONE: Record<TriggerType, string> = {
  new_home: 'bg-[var(--nyl-blue-100)] text-[var(--nyl-blue-800)]',
  term_expiring: 'bg-[var(--nyl-orange-100)] text-[var(--nyl-orange-500)]',
  no_touch_90: 'bg-neutral-100 text-neutral-700',
  birth: 'bg-[var(--nyl-green-200)]/50 text-[var(--nyl-green-800)]',
  retirement_milestone: 'bg-[rgba(112,40,164,0.10)] text-[var(--nyl-purple-700)]',
  content_engagement: 'bg-[var(--nyl-blue-100)] text-[var(--nyl-blue-800)]',
  wealth_milestone: 'bg-[var(--nyl-green-200)]/50 text-[var(--nyl-green-800)]',
  beneficiary_uninsured: 'bg-[var(--nyl-blue-100)] text-[var(--nyl-blue-800)]',
}

const TRIGGERS: Trigger[] = [
  /* Urgent — last 7 days */
  { id: 't1', type: 'term_expiring', clientId: 'cesar-powell', clientName: 'Cesar Powell', detail: 'Sept expiry · 84d no-touch', freshness: 2 },
  { id: 't2', type: 'new_home', clientId: 'janet', clientName: 'Janet Henderson', detail: 'Coastal household · flood-risk', freshness: 3 },
  { id: 't3', type: 'birth', clientId: 'noor-yehya', clientName: 'Noor Yehya', detail: 'New dependent · 12 days', freshness: 12 },
  { id: 't4', type: 'content_engagement', clientId: 'helena-1', clientName: 'Helena Garcia', detail: 'Retirement pages · spike wk 1', freshness: 4 },
  { id: 't5', type: 'retirement_milestone', clientId: 'helena-1', clientName: 'Helena Garcia', detail: 'Turned 58 · pre-60 window', freshness: 6 },
  { id: 't6', type: 'beneficiary_uninsured', clientId: 'frances-carter', clientName: 'Frances Carter', detail: 'Beneficiary on Janet · no NYL', freshness: 9 },

  /* Watching — 7–30 days */
  { id: 't7', type: 'no_touch_90', clientId: 'rachel-lim', clientName: 'Rachel Lim', detail: '90d silence · LTC web signal', freshness: 14 },
  { id: 't8', type: 'wealth_milestone', clientId: 'wei-chen', clientName: 'Wei Chen', detail: 'Score 23 → 41 · life event', freshness: 11 },
  { id: 't9', type: 'content_engagement', clientId: 'rachel-lim', clientName: 'Rachel Lim', detail: 'LTC pages · 14 min · 2 days', freshness: 2 },
  { id: 't10', type: 'new_home', clientId: 'kai-park', clientName: 'Kai Park', detail: 'Move-in detected · new household', freshness: 7 },
  { id: 't11', type: 'no_touch_90', clientId: 'omar-hadi', clientName: 'Omar Hadi', detail: '30d window · light-touch', freshness: 30 },
  { id: 't12', type: 'retirement_milestone', clientId: 'aanya-patel', clientName: 'Aanya Patel', detail: 'Turns 18 · Sept · locked rate', freshness: 20 },
]

const GROUP_ORDER: TriggerType[] = [
  'term_expiring',
  'new_home',
  'birth',
  'retirement_milestone',
  'content_engagement',
  'beneficiary_uninsured',
  'wealth_milestone',
  'no_touch_90',
]

export function SignalsCanvas() {
  const openDeepDive = useAppStore((s) => s.openDeepDive)
  const drill = useAppStore((s) => s.canvasDrill)

  function openClient(t: Trigger) {
    openDeepDive(t.clientId)
    drill({ layer: 3, tileId: 'signals', objectId: t.clientId })
  }

  const grouped = GROUP_ORDER.map((type) => ({
    type,
    items: TRIGGERS.filter((t) => t.type === type).sort((a, b) => a.freshness - b.freshness),
  })).filter((g) => g.items.length > 0)

  return (
    <section className="dot-ground flex flex-1 flex-col overflow-auto">
      <div className="mx-auto w-full max-w-[1200px] px-8 py-10 pb-20 md:px-12">
        <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-neutral-400">
          Signals · last 30 days
        </p>
        <h1
          className="mt-3 font-serif text-[40px] leading-[1.04] tracking-tight text-neutral-900 md:text-[52px]"
          style={{ fontWeight: 400, textWrap: 'balance' }}
        >
          12 fresh signals on your book.
        </h1>
        <p className="mt-3 max-w-[58ch] text-[13.5px] leading-[1.55] text-neutral-600">
          Each signal is a trigger that opens a household to a conversation. Click any
          node to drop into that client's canvas.
        </p>

        <div className="mt-10 flex flex-col gap-7">
          {grouped.map((g) => (
            <div key={g.type}>
              <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">
                {TYPE_LABEL[g.type]} · {g.items.length}
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {g.items.map((t, i) => (
                  <motion.button
                    key={t.id}
                    type="button"
                    onClick={() => openClient(t)}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, delay: 0.04 * i }}
                    whileHover={{ y: -2 }}
                    className="flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-4 text-left shadow-[0_8px_24px_-18px_rgba(0,10,98,0.18)] transition-shadow hover:shadow-[0_18px_40px_-22px_rgba(0,10,98,0.28)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={['rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em]', TYPE_TONE[t.type]].join(' ')}>
                        {TYPE_LABEL[t.type]}
                      </span>
                      <span className="text-[10.5px] uppercase tracking-[0.18em] text-neutral-400">
                        {t.freshness}d
                      </span>
                    </div>
                    <p className="text-[14px] font-medium text-neutral-900">
                      {t.clientName}
                    </p>
                    <p className="text-[12.5px] leading-snug text-neutral-600">
                      {t.detail}
                    </p>
                    <p className="mt-1 text-[10.5px] uppercase tracking-[0.22em] text-[var(--nyl-blue-500)]">
                      Open canvas →
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
