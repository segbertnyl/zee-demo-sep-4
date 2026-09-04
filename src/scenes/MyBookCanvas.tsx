import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useAppStore } from '@/state/useAppStore'

/* My Book — pannable, zoomable canvas of the advisor's clients as cards.
 * Each card matches the deep-dive client card vocabulary, so going from the
 * book to a client feels like zooming into a node in a Touch Designer network.
 * Double-click a card to open its individual canvas. */

type Tier = 'top' | 'mid' | 'cool'

type ClientNode = {
  id: string
  name: string
  initials: string
  segment: string
  signal: string
  metric: string
  tier: Tier
  x: number
  y: number
  canvasId?: string
}

/* 5-column × 4-row grid · card 260w + 60 gap (320 step) · 140h + 80 gap (220 step) */
const COL_STEP = 320
const ROW_STEP = 220
const GRID_X0 = 40
const GRID_Y0 = 40

/* Card dimensions — used for line endpoints + centering math */
const CARD_W = 260
const CARD_H = 140
const DEFAULT_ZOOM = 0.72

function gridPos(col: number, row: number) {
  return { x: GRID_X0 + col * COL_STEP, y: GRID_Y0 + row * ROW_STEP }
}

const CLIENTS: ClientNode[] = [
  /* Row 0 — top priority. Each card opens its own deep-dive canvas; ids match
   * SPECS / CONTENT_BY_ID / FALLBACK_CLIENTS keys in ActionDeepDive. */
  { id: 'janet',     name: 'Janet Henderson',  initials: 'JH', segment: 'Coastal household',   signal: 'New address · flood-risk',         metric: '+$1.2K FYC',   tier: 'top',  ...gridPos(0, 0), canvasId: 'janet' },
  { id: 'tom',       name: 'Tom Anderson',     initials: 'TA', segment: 'Stalled application', signal: 'Day 11 in underwriting',           metric: '$4.2K FYC',    tier: 'top',  ...gridPos(1, 0), canvasId: 'tom-anderson' },
  { id: 'helena',    name: 'Helena Garcia',    initials: 'HG', segment: 'Pre-retirement',      signal: 'Retirement content spike',         metric: '+$2.8K FYC',   tier: 'top',  ...gridPos(2, 0), canvasId: 'helena-1' },
  { id: 'emma',      name: 'Emma Clarke',      initials: 'EC', segment: 'Annual review',       signal: '9:30 AM today',                    metric: 'Prep ready',   tier: 'top',  ...gridPos(3, 0), canvasId: 'emma-clarke' },
  { id: 'jon',       name: 'Jon Owen',         initials: 'JO', segment: 'Warm referral',       signal: 'Close tomorrow',                   metric: '$6.8K FYC',    tier: 'top',  ...gridPos(4, 0), canvasId: 'jon-owen' },

  /* Row 1 — mid focus */
  { id: 'andrew',    name: 'Andrew Cooper',    initials: 'AC', segment: 'Service · benef',     signal: 'Awaiting e-sign · day 6',          metric: '90s call',     tier: 'mid',  ...gridPos(0, 1), canvasId: 'andrew-cooper' },
  { id: 'chloe',     name: 'Chloe Abrams',     initials: 'CA', segment: 'Milestone planning',  signal: '45th birthday · 6 mo',             metric: '2.4× window',  tier: 'mid',  ...gridPos(1, 1), canvasId: 'chloe-abrams' },
  { id: 'cesar',     name: 'Cesar Powell',     initials: 'CP', segment: 'Term renewal',        signal: 'No-touch 84d',                     metric: 'Sept expiry',  tier: 'mid',  ...gridPos(2, 1), canvasId: 'cesar-powell' },
  { id: 'frances',   name: 'Frances Carter',   initials: 'FC', segment: 'Uninsured spouse',    signal: 'Beneficiary on Janet',             metric: 'Open intro',   tier: 'mid',  ...gridPos(3, 1), canvasId: 'frances-carter' },
  { id: 'maria',     name: 'Maria Diaz',       initials: 'MD', segment: 'WL conversion',       signal: 'APS stalled · 18d',                metric: '$3.4K/yr',     tier: 'mid',  ...gridPos(4, 1), canvasId: 'maria-diaz' },

  /* Row 2 — mid watch */
  { id: 'rachel',    name: 'Rachel Lim',       initials: 'RL', segment: 'LTC research',        signal: 'Web signal · 2d',                  metric: 'Watch',        tier: 'mid',  ...gridPos(0, 2), canvasId: 'rachel-lim' },
  { id: 'paul',      name: 'Paul Reyes',       initials: 'PR', segment: 'Fact-finding',        signal: '11:00 AM today',                   metric: 'Virtual',      tier: 'mid',  ...gridPos(1, 2), canvasId: 'paul-reyes' },
  { id: 'leela',     name: 'Leela Patel',      initials: 'LP', segment: 'Term life',           signal: 'Annual review window',             metric: '$1.2M face',   tier: 'mid',  ...gridPos(2, 2), canvasId: 'leela-patel' },
  { id: 'wei',       name: 'Wei Chen',         initials: 'WC', segment: 'Cross-sell open',     signal: 'Score 23 → 41 after life event',   metric: '$2.1K FYC',    tier: 'mid',  ...gridPos(3, 2), canvasId: 'wei-chen' },
  { id: 'noor',      name: 'Noor Yehya',       initials: 'NY', segment: 'New dependent',       signal: 'Birth signal · 12d',               metric: 'Open intro',   tier: 'mid',  ...gridPos(4, 2), canvasId: 'noor-yehya' },

  /* Row 3 — quiet */
  { id: 'aanya',     name: 'Aanya Patel',      initials: 'AP', segment: 'Next-gen',            signal: 'Turning 18 · Sept',                metric: 'Locked rate',  tier: 'cool', ...gridPos(0, 3), canvasId: 'aanya-patel' },
  { id: 'sam',       name: 'Sam Bennett',      initials: 'SB', segment: 'Stable',              signal: 'NPS 9 last review',                metric: '8 yrs',        tier: 'cool', ...gridPos(1, 3), canvasId: 'sam-bennett' },
  { id: 'omar',      name: 'Omar Hadi',        initials: 'OH', segment: 'Stable',              signal: 'No-touch 30d',                     metric: '6 yrs',        tier: 'cool', ...gridPos(2, 3), canvasId: 'omar-hadi' },
  { id: 'tara',      name: "Tara O'Donnell",   initials: 'TO', segment: 'Annual review',       signal: 'Scheduled · Tue 2pm',              metric: 'Prepped',      tier: 'cool', ...gridPos(3, 3), canvasId: 'tara-odonnell' },
  { id: 'kai',       name: 'Kai Park',         initials: 'KP', segment: 'New household',       signal: 'Move-in detected',                 metric: 'Activate',     tier: 'cool', ...gridPos(4, 3), canvasId: 'kai-park' },
]

/* Influence lines — pairs of node ids that connect on the canvas */
const LINKS: Array<[string, string]> = [
  ['janet', 'frances'],
  ['leela', 'aanya'],
  ['jon', 'janet'],
  ['cesar', 'emma'],
  ['helena', 'rachel'],
  ['tom', 'cesar'],
  ['noor', 'kai'],
  ['paul', 'leela'],
  ['emma', 'tom'],
  ['maria', 'wei'],
  ['andrew', 'cesar'],
  ['chloe', 'helena'],
]

const TIER_DOT: Record<Tier, string> = {
  top: 'bg-[var(--nyl-blue-500)]',
  mid: 'bg-[var(--nyl-orange-400)]',
  cool: 'bg-neutral-400',
}

const TIER_PILL: Record<Tier, string> = {
  top: 'bg-[var(--nyl-blue-100)] text-[var(--nyl-blue-800)]',
  mid: 'bg-[var(--nyl-orange-100)] text-[var(--nyl-orange-500)]',
  cool: 'bg-neutral-100 text-neutral-500',
}

const TIER_LABEL: Record<Tier, string> = {
  top: 'Priority',
  mid: 'Watch',
  cool: 'Quiet',
}

/* Priority levels — Brian's A–D book-of-business language. Each maps to one
 * grid row; row 0 (A Level) stays the priority emphasis. Rendered as section
 * subheads in canvas space so they pan/zoom with the cards. */
const LEVELS: { key: string; label: string; sub: string; row: number }[] = [
  { key: 'A', label: 'A Level', sub: 'Priority focus', row: 0 },
  { key: 'B', label: 'B Level', sub: 'Active', row: 1 },
  { key: 'C', label: 'C Level', sub: 'Watch', row: 2 },
  { key: 'D', label: 'D Level', sub: 'Steady', row: 3 },
]
/* The level rule spans all five columns of a row. */
const LEVEL_RULE_W = 4 * COL_STEP + CARD_W

export function MyBookCanvas() {
  const openDeepDive = useAppStore((s) => s.openDeepDive)
  const viewportRef = useRef<HTMLDivElement>(null)
  const [pan, setPan] = useState({ x: 60, y: 140 })
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const panDrag = useRef<{ x: number; y: number; pan: { x: number; y: number } } | null>(null)
  const [hover, setHover] = useState<string | null>(null)

  /* Center the whole card field in the viewport at the given zoom. */
  const centerView = useCallback((z = DEFAULT_ZOOM) => {
    const el = viewportRef.current
    if (!el) return
    const vw = el.clientWidth
    const vh = el.clientHeight
    if (!vw || !vh) return
    const minX = Math.min(...CLIENTS.map((c) => c.x))
    const maxX = Math.max(...CLIENTS.map((c) => c.x)) + CARD_W
    const minY = Math.min(...CLIENTS.map((c) => c.y))
    const maxY = Math.max(...CLIENTS.map((c) => c.y)) + CARD_H
    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2
    setPan({ x: vw / 2 - cx * z, y: vh / 2 - cy * z })
  }, [])

  /* Center once on mount — retry across frames until the viewport has a size. */
  useEffect(() => {
    let raf = 0
    const tryCenter = () => {
      const el = viewportRef.current
      if (el && el.clientWidth && el.clientHeight) {
        centerView(DEFAULT_ZOOM)
      } else {
        raf = requestAnimationFrame(tryCenter)
      }
    }
    raf = requestAnimationFrame(tryCenter)
    return () => cancelAnimationFrame(raf)
  }, [centerView])

  /* Native wheel handler — pan or zoom (ctrl/⌘) */
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    function handler(e: WheelEvent) {
      const rect = el!.getBoundingClientRect()
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = -e.deltaY * 0.01
        const next = Math.max(0.35, Math.min(2.2, zoom * (1 + delta)))
        if (next === zoom) return
        const factor = next / zoom
        setPan({
          x: px * (1 - factor) + pan.x * factor,
          y: py * (1 - factor) + pan.y * factor,
        })
        setZoom(next)
      } else {
        e.preventDefault()
        setPan((p) => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }))
      }
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [zoom, pan.x, pan.y])

  function onPointerDown(e: React.PointerEvent) {
    /* Pan from anywhere on the field — but let cards (and their double-click /
     * hover) keep their own clicks. */
    if ((e.target as HTMLElement).closest('button')) return
    e.currentTarget.setPointerCapture(e.pointerId)
    panDrag.current = { x: e.clientX, y: e.clientY, pan }
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!panDrag.current) return
    setPan({
      x: panDrag.current.pan.x + (e.clientX - panDrag.current.x),
      y: panDrag.current.pan.y + (e.clientY - panDrag.current.y),
    })
  }
  function onPointerUp(e: React.PointerEvent) {
    panDrag.current = null
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* no-op */ }
  }

  function nodeById(id: string) {
    return CLIENTS.find((c) => c.id === id)
  }

  function openClient(node: ClientNode) {
    /* Every client has its own canvasId. Falls back to the client's short id so
     * the deep-dive sees a unique key even if canvasId was somehow unset. */
    openDeepDive(node.canvasId ?? node.id)
  }

  return (
    <section className="relative flex flex-1 flex-col">
      {/* Floating editorial header */}
      <div className="pointer-events-none absolute left-1/2 top-6 z-10 -translate-x-1/2 px-8 text-center md:top-8">
        <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-neutral-500">
          My book · {CLIENTS.length} households
        </p>
        <h1
          className="mt-2 font-serif text-[26px] leading-[1.04] tracking-tight text-neutral-900 md:text-[32px]"
          style={{ fontWeight: 400, textWrap: 'balance' }}
        >
          Your book, at a glance.
        </h1>
        <p className="mt-2 text-[12px] text-neutral-500">
          Pan + scroll to explore · ⌘-scroll to zoom · double-click a card to open
        </p>
      </div>

      {/* Top-right tools (matches deep-dive chrome) */}
      <div className="pointer-events-none absolute right-6 top-6 z-[20] flex items-center gap-2">
        <div className="pointer-events-auto flex items-center gap-0.5 rounded-full bg-white px-1.5 py-1 shadow-[0_12px_32px_-18px_rgba(0,10,98,0.32)]">
          <ToolButton active label="Pan">
            <HandIcon />
          </ToolButton>
          <ToolButton label="Annotate">
            <AnnotateIcon />
          </ToolButton>
          <ToolButton label="Reset view" onClick={() => { setZoom(DEFAULT_ZOOM); centerView(DEFAULT_ZOOM) }}>
            <RefreshIcon />
          </ToolButton>
        </div>
        <div className="pointer-events-auto flex items-center gap-0.5 rounded-full bg-white px-1.5 py-1 shadow-[0_12px_32px_-18px_rgba(0,10,98,0.32)]">
          <ToolButton label="List view"><ListIcon /></ToolButton>
          <ToolButton active label="Canvas view"><CanvasIcon /></ToolButton>
        </div>
      </div>

      {/* Bottom-left recap sticky */}
      <div className="pointer-events-none absolute bottom-6 left-6 z-[20]">
        <div className="pointer-events-auto flex w-[44px] flex-col items-center gap-3 rounded-full bg-white py-4 shadow-[0_18px_40px_-22px_rgba(0,10,98,0.32)]">
          <span className="block h-[2px] w-[22px] rounded-full bg-neutral-300" />
          <span className="block h-[2px] w-[22px] rounded-full bg-neutral-300" />
          <span className="block h-[2px] w-[22px] rounded-full bg-neutral-900" />
          <span className="block h-[2px] w-[22px] rounded-full bg-neutral-300" />
          <span className="block h-[2px] w-[22px] rounded-full bg-neutral-300" />
          <span className="block h-[2px] w-[22px] rounded-full bg-neutral-300" />
          <button
            type="button"
            aria-label="History"
            title="Recap"
            className="mt-2 flex size-7 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          >
            <HistoryIcon />
          </button>
        </div>
      </div>

      {/* Zoom indicator */}
      <div className="pointer-events-none absolute bottom-6 right-6 z-[20] rounded-full bg-white px-3 py-1.5 text-[11px] font-medium tabular-nums text-neutral-500 shadow-[0_12px_32px_-18px_rgba(0,10,98,0.32)]">
        {Math.round(zoom * 100)}%
      </div>

      {/* Canvas viewport */}
      <div
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="dot-ground absolute inset-0 cursor-grab select-none active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      >
        <div
          className="absolute"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            willChange: 'transform',
          }}
        >
          {/* Influence lines — connect card centers */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{ left: 0, top: 0, width: 1800, height: 1100, overflow: 'visible' }}
          >
            {LINKS.map(([a, b], i) => {
              const na = nodeById(a)
              const nb = nodeById(b)
              if (!na || !nb) return null
              const highlight = hover === a || hover === b
              return (
                <line
                  key={`${a}-${b}-${i}`}
                  x1={na.x + CARD_W / 2}
                  y1={na.y + CARD_H / 2}
                  x2={nb.x + CARD_W / 2}
                  y2={nb.y + CARD_H / 2}
                  stroke="var(--nyl-blue-500)"
                  strokeWidth={highlight ? 1.8 : 0.9}
                  opacity={highlight ? 0.55 : 0.16}
                />
              )
            })}
          </svg>

          {/* Client cards */}
          {CLIENTS.map((c, i) => (
            <div
              key={c.id}
              className="absolute"
              style={{ left: c.x, top: c.y, width: CARD_W }}
              onMouseEnter={() => setHover(c.id)}
              onMouseLeave={() => setHover(null)}
            >
              <motion.button
                type="button"
                onDoubleClick={() => openClient(c)}
                initial={{ opacity: 0, scale: 0.94, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.02 * i, ease: [0.22, 0.65, 0.05, 1] }}
                whileHover={{ y: -2 }}
                className="group block w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 text-left shadow-[0_18px_40px_-22px_rgba(0,10,98,0.22)] transition-shadow hover:border-[var(--nyl-blue-500)]/50 hover:shadow-[0_24px_60px_-22px_rgba(0,10,98,0.32)]"
                title={`${c.name} · double-click to open`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className={[
                      'flex size-9 items-center justify-center rounded-full text-[11px] font-semibold',
                      c.tier === 'top'
                        ? 'bg-[var(--nyl-blue-500)] text-white'
                        : c.tier === 'mid'
                        ? 'bg-[var(--nyl-blue-100)] text-[var(--nyl-blue-800)]'
                        : 'bg-neutral-100 text-neutral-500',
                    ].join(' ')}>
                      {c.initials}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className={['size-1.5 rounded-full', TIER_DOT[c.tier]].join(' ')} aria-hidden="true" />
                      <span className={['rounded-full px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-[0.18em]', TIER_PILL[c.tier]].join(' ')}>
                        {TIER_LABEL[c.tier]}
                      </span>
                    </span>
                  </div>
                  <span aria-hidden="true" className="text-[12px] text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--nyl-blue-500)]">
                    ↗
                  </span>
                </div>

                <p className="mt-3 font-serif text-[18px] leading-tight tracking-tight text-neutral-900">
                  {c.name}
                </p>
                <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-neutral-400">
                  {c.segment}
                </p>

                <p className="mt-2.5 text-[12.5px] leading-snug text-neutral-700">
                  {c.signal}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-2.5">
                  <span className="text-[10.5px] uppercase tracking-[0.18em] text-neutral-400">
                    {c.metric}
                  </span>
                  <span className="text-[10.5px] uppercase tracking-[0.18em] text-[var(--nyl-blue-500)] opacity-0 transition-opacity group-hover:opacity-100">
                    Double-click →
                  </span>
                </div>
              </motion.button>
            </div>
          ))}

          {/* Priority-level subheads — one per grid row (A → D), sitting in the
              gap above each row so the book reads as grouped by Brian's A–D
              book language. Rendered last so they sit above the cards. */}
          {LEVELS.map((lv) => (
            <div
              key={lv.key}
              className="pointer-events-none absolute"
              style={{ left: GRID_X0, top: GRID_Y0 + lv.row * ROW_STEP - 50, width: LEVEL_RULE_W, zIndex: 5 }}
            >
              <div className="flex items-baseline gap-2.5 border-b border-neutral-200 pb-2">
                <span className="font-serif text-[18px] leading-none tracking-tight text-neutral-900">
                  {lv.label}
                </span>
                <span className="text-[10.5px] font-medium uppercase tracking-[0.2em] text-neutral-400">
                  {lv.sub}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* -- Tool icons reused from the deep-dive chrome -- */

function ToolButton({
  children,
  active,
  label,
  onClick,
}: {
  children: React.ReactNode
  active?: boolean
  label: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={[
        'flex size-9 items-center justify-center rounded-full transition-colors',
        active ? 'bg-[var(--nyl-blue-500)] text-white' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function HandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 8 V4 a1.4 1.4 0 0 1 2.8 0 V8" />
      <path d="M8.8 8 V3 a1.4 1.4 0 0 1 2.8 0 V8" />
      <path d="M11.6 8 V4 a1.4 1.4 0 0 1 2.8 0 V11 a4.5 4.5 0 0 1 -4.5 4.5 H8 c-1.6 0 -2.5 -1 -3.5 -2 L3 11 a1.2 1.2 0 0 1 2 -1.5 L6 11" />
    </svg>
  )
}

function AnnotateIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 14.5 V11.5 L11.5 3 L14.5 6 L6 14.5 Z" />
      <path d="M10 4.5 L13 7.5" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 8 a5.5 5.5 0 0 1 9.5 -3" />
      <path d="M13 2.5 V5 H10.5" />
      <path d="M14.5 10 a5.5 5.5 0 0 1 -9.5 3" />
      <path d="M5 15.5 V13 H7.5" />
    </svg>
  )
}

function CanvasIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1.5" y="2.5" width="6" height="6" rx="1.2" />
      <rect x="10.5" y="2.5" width="6" height="6" rx="1.2" />
      <rect x="1.5" y="11" width="6" height="5" rx="1.2" />
      <rect x="10.5" y="11" width="6" height="5" rx="1.2" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M3 5 H15" />
      <path d="M3 9 H15" />
      <path d="M3 13 H15" />
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6.5 a6.5 6.5 0 1 1 -0.2 4" />
      <path d="M3 3 V6.5 H6.5" />
      <path d="M9 5.5 V9 L11.5 10.5" />
    </svg>
  )
}
