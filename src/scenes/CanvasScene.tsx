import { useEffect, useRef, useState } from 'react'
import {
  addNode, moveNode, moveTile, removeNode, renameNode, selfUser, setPresence,
  useConnState, useCustomNodes, usePeers, useTilePositions,
  type CustomNode, type Peer,
} from '@/collab/collab'
import { motion } from 'motion/react'
import { useAppStore, type Role } from '@/state/useAppStore'
import { MyBookCanvas } from '@/scenes/MyBookCanvas'
import { SignalsCanvas } from '@/scenes/SignalsCanvas'
import { CollabLauncher } from '@/scenes/BriefingScene'

/* CanvasScene — the three-layer Touch-Designer-inspired canvas surface for v5.
 *
 *   Layer 1 — Practice canvas. Eight node-tiles (My Book, Calendar, Practice
 *             Score, Pipeline, Signals Feed, Priorities, Plans, Field Run)
 *             with influence edges between them. Double-click a tile to drill.
 *   Layer 2 — Domain canvas for a single tile. My Book and Signals Feed render
 *             dedicated canvases; other tiles fall through to their existing
 *             linear scene as a v1 escape hatch.
 *   Layer 3 — Object canvas (per-client deep dive). Handled by the existing
 *             ActionDeepDive overlay when an item inside Layer 2 is opened.
 *
 * The user enters canvas mode via the network-graph icon in the LeftRail; the
 * navigation stack is `canvasPath` in the store. Surface back with ESC, the
 * breadcrumb, or the back arrow. */

/* ----------------------------------------------------------------------------
 * Layer 1 tile model
 * -------------------------------------------------------------------------- */

type TileId =
  | 'my-book'
  | 'calendar'
  | 'practice-score'
  | 'pipeline'
  | 'signals'
  | 'priorities'
  | 'plans'
  | 'field-run'
  | 'onboarding'
  | 'wrapped'

type Tile = {
  id: TileId
  title: string
  eyebrow: string
  preview: string
  /* Spatial position on the Layer 1 canvas. */
  x: number
  y: number
  w: number
  h: number
  /* Which roles can open this tile. */
  accessibleBy: Role[]
  /* Visual tier — drives the accent color. */
  tier: 'practice' | 'book' | 'ops' | 'setup'
  /* When defined, the tile drills into a dedicated Layer 2 canvas. Otherwise
   * double-click falls through to an existing linear scene OR a fullscreen
   * takeover (onboarding). */
  drillsTo?: 'canvas' | 'scene' | 'takeover'
  /* For drillsTo === 'scene', which existing scene to open. */
  fallbackScene?: 'briefing' | 'business' | 'calendar' | 'actionboard'
  /* For drillsTo === 'takeover', which fullscreen flow to open. */
  takeover?: 'onboarding' | 'wrapped'
}

/* Layer 1 layout — 3 rows × 3 cols (minus one slot). My Book sits at the
 * gravity center; financial nodes top-left, ops bottom-right. */
const COL = 340
const ROW = 220
const X0 = 60
const Y0 = 60

const TILES: Tile[] = [
  /* Row 0 — practice / business signals */
  {
    id: 'practice-score', title: 'Practice Score', eyebrow: 'YOU · BUSINESS',
    preview: '68 / 100  ·  Peer +2',
    x: X0 + 0 * COL, y: Y0 + 0 * ROW, w: 280, h: 160,
    accessibleBy: ['advisor'], tier: 'practice',
    drillsTo: 'scene', fallbackScene: 'business',
  },
  {
    id: 'pipeline', title: 'Pipeline & Goals', eyebrow: 'YOU · MONEY',
    preview: '$122K plan  ·  74 qualified appts',
    x: X0 + 1 * COL, y: Y0 + 0 * ROW, w: 280, h: 160,
    accessibleBy: ['advisor'], tier: 'practice',
    drillsTo: 'scene', fallbackScene: 'business',
  },
  {
    id: 'priorities', title: "Today's Priorities", eyebrow: 'TODAY',
    preview: '3 priorities  ·  Tom · day 11 underwriting',
    x: X0 + 2 * COL, y: Y0 + 0 * ROW, w: 280, h: 160,
    accessibleBy: ['advisor', 'assistant'], tier: 'ops',
    drillsTo: 'scene', fallbackScene: 'briefing',
  },

  /* Row 1 — the book + its feeds */
  {
    id: 'plans', title: 'Suggested Plans', eyebrow: 'QUICK WINS',
    preview: '2 plays ready  ·  Russo · Park',
    x: X0 + 0 * COL, y: Y0 + 1 * ROW, w: 280, h: 160,
    accessibleBy: ['advisor', 'assistant'], tier: 'ops',
    drillsTo: 'scene', fallbackScene: 'business',
  },
  {
    id: 'my-book', title: 'My Book', eyebrow: 'CLIENTS',
    preview: '20 households  ·  5 priority',
    x: X0 + 1 * COL, y: Y0 + 1 * ROW, w: 280, h: 160,
    accessibleBy: ['advisor', 'assistant'], tier: 'book',
    drillsTo: 'canvas',
  },
  {
    id: 'signals', title: 'Signals Feed', eyebrow: 'TRIGGERS',
    preview: '12 fresh  ·  4 urgent in 7d',
    x: X0 + 2 * COL, y: Y0 + 1 * ROW, w: 280, h: 160,
    accessibleBy: ['advisor', 'assistant'], tier: 'book',
    drillsTo: 'canvas',
  },

  /* Row 2 — time + field + onboarding */
  {
    id: 'calendar', title: 'Calendar', eyebrow: 'TIME',
    preview: '3 today  ·  Emma 9:30 AM',
    x: X0 + 0 * COL, y: Y0 + 2 * ROW, w: 280, h: 160,
    accessibleBy: ['advisor', 'assistant'], tier: 'ops',
    drillsTo: 'scene', fallbackScene: 'calendar',
  },
  {
    id: 'field-run', title: 'Field Run', eyebrow: 'TERRITORY',
    preview: '1 saved  ·  Astoria · Tuesday',
    x: X0 + 1 * COL, y: Y0 + 2 * ROW, w: 280, h: 160,
    accessibleBy: ['advisor', 'assistant'], tier: 'ops',
    drillsTo: 'scene', fallbackScene: 'actionboard',
  },
  {
    id: 'onboarding', title: 'Onboarding', eyebrow: 'SETUP · NEW HERE',
    preview: 'Personalize your OS  ·  ~3 min',
    x: X0 + 2 * COL, y: Y0 + 2 * ROW, w: 280, h: 160,
    accessibleBy: ['advisor'], tier: 'setup',
    drillsTo: 'takeover', takeover: 'onboarding',
  },
  {
    id: 'wrapped', title: 'Practice Wrapped', eyebrow: 'YOUR YEAR · 2026',
    preview: '11 stories  ·  $132K · 74 cases',
    x: X0 + 3 * COL, y: Y0 + 2 * ROW, w: 280, h: 160,
    accessibleBy: ['advisor'], tier: 'setup',
    drillsTo: 'takeover', takeover: 'wrapped',
  },
]

/* Edges — directed influence between tiles. Layout is hub-and-spoke around
 * "My Book" since the book is what the practice ultimately operates on. */
const EDGES: Array<[TileId, TileId]> = [
  ['practice-score', 'pipeline'],
  ['pipeline', 'my-book'],
  ['priorities', 'my-book'],
  ['signals', 'my-book'],
  ['signals', 'priorities'],
  ['plans', 'my-book'],
  ['calendar', 'my-book'],
  ['field-run', 'calendar'],
  ['practice-score', 'plans'],
  ['wrapped', 'practice-score'],
]

const TIER_ACCENT: Record<Tile['tier'], { ring: string; chip: string }> = {
  practice: { ring: 'border-[var(--nyl-purple-700)]/35', chip: 'bg-[rgba(112,40,164,0.08)] text-[var(--nyl-purple-700)]' },
  book:     { ring: 'border-[var(--nyl-blue-500)]/35',   chip: 'bg-[var(--nyl-blue-100)] text-[var(--nyl-blue-800)]' },
  ops:      { ring: 'border-[var(--nyl-orange-400)]/35', chip: 'bg-[var(--nyl-orange-100)] text-[var(--nyl-orange-500)]' },
  setup:    { ring: 'border-dashed border-[var(--nyl-blue-500)]/60', chip: 'bg-[var(--nyl-blue-500)] text-white' },
}

/* ----------------------------------------------------------------------------
 * CanvasScene — top-level switcher across the three layers.
 * -------------------------------------------------------------------------- */

export function CanvasScene() {
  const path = useAppStore((s) => s.canvasPath)
  const top = path[path.length - 1]

  if (top.layer === 1) return <PracticeLayer />
  if (top.layer === 2 && top.tileId === 'my-book') return <DomainLayer tile="my-book"><MyBookCanvas /></DomainLayer>
  if (top.layer === 2 && top.tileId === 'signals') return <DomainLayer tile="signals"><SignalsCanvas /></DomainLayer>
  /* Layer 3 — handled by ActionDeepDive overlay, but we still need a layer to
   * render under it. Fall through to MyBookCanvas for now. */
  return <DomainLayer tile="my-book"><MyBookCanvas /></DomainLayer>
}

/* ----------------------------------------------------------------------------
 * Layer 1 — Practice canvas.
 * -------------------------------------------------------------------------- */

function PracticeLayer() {
  const role = useAppStore((s) => s.role)
  const drill = useAppStore((s) => s.canvasDrill)
  const setScene = useAppStore((s) => s.setScene)
  const closeCanvas = useAppStore((s) => s.closeCanvas)
  const openOnboarding = useAppStore((s) => s.openOnboarding)
  const openWrapped = useAppStore((s) => s.openWrapped)
  const pushTrail = useAppStore((s) => s.pushTrail)

  /* Multiplayer — shared tile positions, live custom nodes, named cursors. */
  const tilePos = useTilePositions()
  const customNodes = useCustomNodes()
  const peers = usePeers()
  const conn = useConnState()
  const liveTiles = TILES.map((t) => {
    const o = tilePos[t.id]
    return o ? { ...t, x: o.x, y: o.y } : t
  })

  /* Broadcast that we're on Layer 1; clear presence on the way out. */
  useEffect(() => {
    setPresence('layer1', null)
    return () => setPresence(null, null)
  }, [])

  /* ESC closes canvas mode entirely from Layer 1. */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCanvas()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [closeCanvas])

  function tilePoint(t: Tile) {
    return { cx: t.x + t.w / 2, cy: t.y + t.h / 2 }
  }

  function openTile(t: Tile) {
    if (!t.accessibleBy.includes(role)) return
    if (t.drillsTo === 'canvas') {
      pushTrail({ id: `tile-${t.id}`, label: t.title, target: { kind: 'canvas-layer2', tileId: t.id } })
      drill({ layer: 2, tileId: t.id })
    } else if (t.drillsTo === 'scene' && t.fallbackScene) {
      pushTrail({ id: `scene-${t.fallbackScene}`, label: t.title, target: { kind: 'scene', scene: t.fallbackScene } })
      setScene(t.fallbackScene)
    } else if (t.drillsTo === 'takeover' && t.takeover === 'onboarding') {
      /* Canvas tile entry = reorg mode (the advisor's already in the OS). */
      openOnboarding('reorg')
    } else if (t.drillsTo === 'takeover' && t.takeover === 'wrapped') {
      openWrapped()
    }
  }

  /* Compute the canvas bounding box so we can center the field. */
  const maxX = Math.max(...TILES.map((t) => t.x + t.w))
  const maxY = Math.max(...TILES.map((t) => t.y + t.h))
  const worldW = maxX + X0
  const worldH = maxY + Y0

  /* Pan + zoom state. Touch-Designer-style: trackpad pinch (ctrl/meta + wheel)
   * zooms around the cursor; two-finger swipe pans; pointer-drag pans. */
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)
  const [tx, setTx] = useState(0)
  const [ty, setTy] = useState(0)
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null)
  const [grabbing, setGrabbing] = useState(false)

  /* Auto-center the canvas in the viewport on first paint. */
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const vw = el.clientWidth
    const vh = el.clientHeight
    setTx((vw - worldW) / 2)
    setTy(Math.max(40, (vh - worldH) / 2))
  }, [worldW, worldH])

  /* Non-passive wheel handler — required to call preventDefault for the
   * browser's default pinch-zoom and scroll behavior. */
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    function onWheel(e: WheelEvent) {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const rect = el!.getBoundingClientRect()
        const cx = e.clientX - rect.left
        const cy = e.clientY - rect.top
        setScale((prev) => {
          const next = Math.max(0.3, Math.min(2.5, prev * Math.exp(-e.deltaY * 0.0018)))
          const k = next / prev
          setTx((t) => cx - (cx - t) * k)
          setTy((t) => cy - (cy - t) * k)
          return next
        })
      } else {
        e.preventDefault()
        setTx((t) => t - e.deltaX)
        setTy((t) => t - e.deltaY)
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    /* Don't hijack drags that start on a tile — those are clicks/double-clicks. */
    const target = e.target as HTMLElement
    if (target.closest('[data-canvas-tile]')) return
    /* Right-click is for context menu — let it pass through. */
    if (e.button === 2) return
    dragRef.current = { x: e.clientX, y: e.clientY, tx, ty }
    setGrabbing(true)
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch { /* no-op */ }
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    setTx(dragRef.current.tx + (e.clientX - dragRef.current.x))
    setTy(dragRef.current.ty + (e.clientY - dragRef.current.y))
  }
  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    dragRef.current = null
    setGrabbing(false)
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId) } catch { /* no-op */ }
  }

  /* Tile/node drag — pointer capture on the tile itself; deltas divided by
   * scale so the move tracks the cursor at any zoom. Writes go straight to
   * the shared Y.Map, so remote peers watch the tile travel live. A small
   * movement threshold keeps click/double-click working. */
  const tileDrag = useRef<{
    id: string; kind: 'tile' | 'node'; px: number; py: number; ox: number; oy: number; moved: boolean
  } | null>(null)
  const justDragged = useRef(false)

  function startTileDrag(e: React.PointerEvent, id: string, kind: 'tile' | 'node', x: number, y: number) {
    if (e.button !== 0) return
    /* Typing in a node title or hitting its delete affordance isn't a drag. */
    if ((e.target as HTMLElement).closest('input,[data-node-action]')) return
    tileDrag.current = { id, kind, px: e.clientX, py: e.clientY, ox: x, oy: y, moved: false }
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch { /* no-op */ }
  }
  function moveTileDrag(e: React.PointerEvent) {
    const d = tileDrag.current
    if (!d) return
    const dxs = e.clientX - d.px
    const dys = e.clientY - d.py
    if (!d.moved && Math.hypot(dxs, dys) < 4) return
    d.moved = true
    const nx = d.ox + dxs / scale
    const ny = d.oy + dys / scale
    if (d.kind === 'tile') moveTile(d.id, nx, ny)
    else moveNode(d.id, nx, ny)
  }
  function endTileDrag(e: React.PointerEvent) {
    const d = tileDrag.current
    if (!d) return
    tileDrag.current = null
    if (d.moved) {
      justDragged.current = true
      setTimeout(() => { justDragged.current = false }, 250)
    }
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId) } catch { /* no-op */ }
  }

  /* Cursor presence — broadcast pointer position in canvas-space coords,
   * throttled to one awareness update per frame. */
  const cursorRaf = useRef<number | null>(null)
  function broadcastCursor(e: React.PointerEvent) {
    const el = viewportRef.current
    if (!el || cursorRaf.current !== null) return
    const { clientX, clientY } = e
    cursorRaf.current = requestAnimationFrame(() => {
      cursorRaf.current = null
      const rect = el.getBoundingClientRect()
      setPresence('layer1', {
        x: (clientX - rect.left - tx) / scale,
        y: (clientY - rect.top - ty) / scale,
      })
    })
  }

  function addNodeAtCenter() {
    const el = viewportRef.current
    if (!el) return
    addNode(
      (el.clientWidth / 2 - tx) / scale - 140,
      (el.clientHeight / 2 - ty) / scale - 80,
    )
  }

  function zoomBy(factor: number) {
    const el = viewportRef.current
    if (!el) return
    const vw = el.clientWidth
    const vh = el.clientHeight
    const cx = vw / 2
    const cy = vh / 2
    setScale((prev) => {
      const next = Math.max(0.3, Math.min(2.5, prev * factor))
      const k = next / prev
      setTx((t) => cx - (cx - t) * k)
      setTy((t) => cy - (cy - t) * k)
      return next
    })
  }
  function resetView() {
    const el = viewportRef.current
    if (!el) return
    setScale(1)
    setTx((el.clientWidth - worldW) / 2)
    setTy(Math.max(40, (el.clientHeight - worldH) / 2))
  }

  /* Keyboard zoom — ⌘+ / ⌘− / ⌘0 like every other canvas tool. */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey)) return
      if (e.key === '=' || e.key === '+') { e.preventDefault(); zoomBy(1.2) }
      else if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomBy(1 / 1.2) }
      else if (e.key === '0') { e.preventDefault(); resetView() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [worldW, worldH])

  return (
    <section className="relative flex flex-1 flex-col overflow-hidden bg-[#f4f3ef]">
      <CanvasTopBar />

      <div
        ref={viewportRef}
        className={[
          'relative flex-1 overflow-hidden dot-ground select-none touch-none',
          grabbing ? 'cursor-grabbing' : 'cursor-grab',
        ].join(' ')}
        onPointerDown={onPointerDown}
        onPointerMove={(e) => { onPointerMove(e); broadcastCursor(e) }}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => setPresence('layer1', null)}
      >
        <div
          className="absolute left-0 top-0 will-change-transform"
          style={{
            width: worldW,
            height: worldH,
            transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`,
            transformOrigin: '0 0',
          }}
        >
          {/* Edges */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
          >
            {EDGES.map(([a, b], i) => {
              const ta = liveTiles.find((t) => t.id === a)
              const tb = liveTiles.find((t) => t.id === b)
              if (!ta || !tb) return null
              const pa = tilePoint(ta)
              const pb = tilePoint(tb)
              const aLocked = !ta.accessibleBy.includes(role)
              const bLocked = !tb.accessibleBy.includes(role)
              const muted = aLocked || bLocked
              return (
                <line
                  key={`${a}-${b}-${i}`}
                  x1={pa.cx} y1={pa.cy} x2={pb.cx} y2={pb.cy}
                  stroke="var(--nyl-blue-500)"
                  strokeWidth={1.1}
                  opacity={muted ? 0.08 : 0.22}
                />
              )
            })}
          </svg>

          {/* Tiles */}
          {liveTiles.map((t, i) => {
            const locked = !t.accessibleBy.includes(role)
            const accent = TIER_ACCENT[t.tier]
            return (
              <motion.button
                key={t.id}
                type="button"
                data-canvas-tile
                onDoubleClick={() => { if (!justDragged.current) openTile(t) }}
                onPointerDown={(e) => startTileDrag(e, t.id, 'tile', t.x, t.y)}
                onPointerMove={moveTileDrag}
                onPointerUp={endTileDrag}
                onPointerCancel={endTileDrag}
                disabled={locked}
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: locked ? 0.45 : 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.04 * i, ease: [0.22, 0.65, 0.05, 1] }}
                whileHover={locked ? undefined : { y: -2 }}
                className={[
                  'absolute flex flex-col gap-2 rounded-2xl border bg-white p-5 text-left',
                  'shadow-[0_18px_40px_-22px_rgba(0,10,98,0.22)]',
                  locked
                    ? 'cursor-not-allowed'
                    : 'transition-shadow hover:shadow-[0_24px_60px_-22px_rgba(0,10,98,0.32)]',
                  accent.ring,
                ].join(' ')}
                style={{ left: t.x, top: t.y, width: t.w, height: t.h }}
                title={locked ? `${t.title} — restricted for assistants` : `${t.title} — double-click to open`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={['rounded-full px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-[0.18em]', accent.chip].join(' ')}>
                    {t.eyebrow}
                  </span>
                  {locked ? <LockGlyph /> : <ArrowGlyph />}
                </div>
                <p className="font-serif text-[24px] leading-tight tracking-tight text-neutral-900" style={{ fontWeight: 400 }}>
                  {t.title}
                </p>
                <p className="text-[13px] leading-snug text-neutral-600">
                  {t.preview}
                </p>
                <p className="mt-auto text-[10px] uppercase tracking-[0.22em] text-neutral-400">
                  {locked
                    ? 'Restricted · advisor only'
                    : t.drillsTo === 'canvas'
                      ? 'Double-click to expand →'
                      : 'Double-click to open →'}
                </p>
              </motion.button>
            )
          })}

          {/* Live custom nodes — created by anyone in the room */}
          {customNodes.map((n) => (
            <CustomNodeTile
              key={n.id}
              node={n}
              onPointerDown={(e) => startTileDrag(e, n.id, 'node', n.x, n.y)}
              onPointerMove={moveTileDrag}
              onPointerUp={endTileDrag}
            />
          ))}
        </div>

        {/* Remote cursors — peers on this layer, mapped from canvas-space
         * through the local pan/zoom so they land where that user is. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          {peers
            .filter((p) => p.layer === 'layer1' && p.cursor)
            .map((p) => (
              <RemoteCursor key={p.clientId} peer={p} sx={p.cursor!.x * scale + tx} sy={p.cursor!.y * scale + ty} />
            ))}
        </div>

        {/* Presence + create — who's in the room, and the new-node affordance */}
        <div className="absolute right-5 top-4 z-30 flex items-center gap-2">
          <PresencePill peers={peers} conn={conn} />
          <button
            type="button"
            onClick={addNodeAtCenter}
            className="pointer-events-auto flex h-9 items-center gap-2 rounded-full bg-[var(--nyl-blue-800)] px-4 text-[12px] font-medium text-white shadow-[0_8px_24px_-12px_rgba(0,10,98,0.4)] hover:bg-[var(--nyl-blue-600)]"
          >
            <span aria-hidden="true" className="text-[14px] leading-none">＋</span>
            New node
          </button>
        </div>

        {/* Zoom toolbar — floating bottom-right, ignores pointer events on the
         * parent so it doesn't trigger pan when clicked. */}
        <div className="pointer-events-none absolute bottom-5 right-5 flex flex-col gap-1.5">
          <div className="pointer-events-auto flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white/90 shadow-[0_8px_24px_-12px_rgba(0,10,98,0.18)] backdrop-blur-sm">
            <button
              type="button"
              onClick={() => zoomBy(1.2)}
              aria-label="Zoom in"
              title="Zoom in (⌘+)"
              className="flex size-9 items-center justify-center text-[15px] text-neutral-700 hover:bg-neutral-100"
            >
              +
            </button>
            <div className="h-px w-full bg-neutral-200" />
            <button
              type="button"
              onClick={() => zoomBy(1 / 1.2)}
              aria-label="Zoom out"
              title="Zoom out (⌘−)"
              className="flex size-9 items-center justify-center text-[15px] text-neutral-700 hover:bg-neutral-100"
            >
              −
            </button>
          </div>
          <button
            type="button"
            onClick={resetView}
            aria-label="Reset view"
            title="Reset view (⌘0)"
            className="pointer-events-auto rounded-lg border border-neutral-200 bg-white/90 px-2 py-1.5 text-[10.5px] font-medium uppercase tracking-[0.18em] text-neutral-700 shadow-[0_8px_24px_-12px_rgba(0,10,98,0.18)] backdrop-blur-sm hover:bg-neutral-100"
          >
            {Math.round(scale * 100)}%
          </button>
        </div>
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------------------
 * Multiplayer primitives — custom nodes, remote cursors, presence pill.
 * -------------------------------------------------------------------------- */

function CustomNodeTile({
  node,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  node: CustomNode
  onPointerDown: (e: React.PointerEvent) => void
  onPointerMove: (e: React.PointerEvent) => void
  onPointerUp: (e: React.PointerEvent) => void
}) {
  return (
    <motion.div
      data-canvas-tile
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 0.65, 0.05, 1] }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="absolute flex cursor-grab flex-col gap-2 rounded-2xl border border-dashed border-[var(--nyl-blue-500)]/60 bg-white p-5 text-left shadow-[0_18px_40px_-22px_rgba(0,10,98,0.22)] active:cursor-grabbing"
      style={{ left: node.x, top: node.y, width: node.w, height: node.h }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-[var(--nyl-blue-100)] px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-[0.18em] text-[var(--nyl-blue-800)]">
          Node · {node.createdBy}
        </span>
        <button
          type="button"
          data-node-action
          onClick={() => removeNode(node.id)}
          aria-label="Delete node"
          className="text-[16px] leading-none text-neutral-300 hover:text-neutral-700"
        >
          ×
        </button>
      </div>
      <input
        value={node.title}
        onChange={(e) => renameNode(node.id, e.target.value)}
        aria-label="Node title"
        className="w-full bg-transparent font-serif text-[24px] leading-tight tracking-tight text-neutral-900 focus:outline-none"
        style={{ fontWeight: 400 }}
      />
      <p className="mt-auto text-[10px] uppercase tracking-[0.22em] text-neutral-400">
        Drag to move · shared live
      </p>
    </motion.div>
  )
}

function RemoteCursor({ peer, sx, sy }: { peer: Peer; sx: number; sy: number }) {
  return (
    <motion.div
      initial={false}
      animate={{ x: sx, y: sy }}
      transition={{ duration: 0.1, ease: 'linear' }}
      className="absolute left-0 top-0"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path
          d="M2 1.5 L16 8.5 L9.5 10 L6.5 16.5 Z"
          fill={peer.color}
          stroke="white"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className="ml-3.5 inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
        style={{ background: peer.color }}
      >
        {peer.name}
      </span>
    </motion.div>
  )
}

function PresencePill({ peers, conn }: { peers: Peer[]; conn: string }) {
  const me = selfUser()
  const dot =
    conn === 'connected' ? 'bg-[#1ab382]' : conn === 'connecting' ? 'bg-[var(--nyl-orange-400)]' : 'bg-neutral-300'
  return (
    <div
      className="pointer-events-auto flex h-9 items-center gap-2 rounded-full border border-neutral-200 bg-white/90 py-1.5 pl-3 pr-2 shadow-[0_8px_24px_-12px_rgba(0,10,98,0.18)] backdrop-blur-sm"
      title={conn === 'connected' ? 'Live — connected to the room' : conn === 'connecting' ? 'Connecting…' : 'Offline — run npm run collab'}
    >
      <span aria-hidden="true" className={['size-2 rounded-full', dot].join(' ')} />
      <span className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-neutral-500">
        {peers.length === 0 ? 'Only you' : `${peers.length + 1} here`}
      </span>
      <div className="flex items-center -space-x-1.5">
        <PresenceAvatar name={me.name} color={me.color} />
        {peers.map((p) => (
          <PresenceAvatar key={p.clientId} name={p.name} color={p.color} />
        ))}
      </div>
    </div>
  )
}

function PresenceAvatar({ name, color }: { name: string; color: string }) {
  return (
    <span
      title={name}
      className="flex size-6 items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold text-white"
      style={{ background: color }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

/* ----------------------------------------------------------------------------
 * Domain layer wrapper — chrome shared by every Layer 2 canvas.
 * -------------------------------------------------------------------------- */

function DomainLayer({ tile, children }: { tile: TileId; children: React.ReactNode }) {
  const surface = useAppStore((s) => s.canvasSurface)
  const tileMeta = TILES.find((t) => t.id === tile)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') surface()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [surface])
  return (
    <section className="relative flex flex-1 flex-col overflow-hidden bg-[#f4f3ef]">
      <CanvasTopBar tileTitle={tileMeta?.title} />
      <div className="relative flex-1 overflow-hidden">
        {children}
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------------------
 * Top bar — breadcrumb + close. Sits at every canvas layer.
 * -------------------------------------------------------------------------- */

function CanvasTopBar({ tileTitle }: { tileTitle?: string }) {
  const path = useAppStore((s) => s.canvasPath)
  const surface = useAppStore((s) => s.canvasSurface)
  const closeCanvas = useAppStore((s) => s.closeCanvas)
  const role = useAppStore((s) => s.role)
  const depth = path.length

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-neutral-200 bg-white/85 px-8 py-3 backdrop-blur-sm md:px-12">
      <button
        type="button"
        onClick={depth > 1 ? surface : closeCanvas}
        className="flex items-center gap-3 text-[13px] font-medium text-neutral-700 hover:text-neutral-900"
        title={depth > 1 ? 'Back' : 'Close canvas mode'}
      >
        <span aria-hidden="true" className="text-[18px] text-neutral-500">←</span>
        <span className="flex items-baseline gap-2">
          <span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-400">
            Canvas
          </span>
          <Crumb label="Practice" active={depth === 1} onClick={depth > 1 ? () => { while (path.length > 1) surface() } : undefined} />
          {depth > 1 && tileTitle && (
            <>
              <span aria-hidden="true" className="text-neutral-300">›</span>
              <Crumb label={tileTitle} active={depth === 2} />
            </>
          )}
        </span>
      </button>
      <div className="flex items-center gap-3">
        <RoleChip role={role} />
        <p className="text-[10.5px] uppercase tracking-[0.22em] text-neutral-400">
          ESC to surface
        </p>
        <CollabLauncher />
      </div>
    </div>
  )
}

function Crumb({ label, active, onClick }: { label: string; active: boolean; onClick?: () => void }) {
  const Cmp = onClick ? 'button' : 'span'
  return (
    <Cmp
      onClick={onClick}
      className={[
        'text-[13.5px] tracking-tight transition-colors',
        active ? 'font-medium text-neutral-900' : 'text-neutral-500 hover:text-neutral-900',
      ].join(' ')}
    >
      {label}
    </Cmp>
  )
}

function RoleChip({ role }: { role: Role }) {
  const advisor = role === 'advisor'
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.18em]',
        advisor
          ? 'bg-[var(--nyl-blue-100)] text-[var(--nyl-blue-800)]'
          : 'bg-[var(--nyl-orange-100)] text-[var(--nyl-orange-500)]',
      ].join(' ')}
    >
      <span aria-hidden="true" className={['size-1.5 rounded-full', advisor ? 'bg-[var(--nyl-blue-500)]' : 'bg-[var(--nyl-orange-400)]'].join(' ')} />
      {advisor ? 'Marisol · advisor' : 'Lily · assistant'}
    </span>
  )
}

/* ----------------------------------------------------------------------------
 * Small glyphs
 * -------------------------------------------------------------------------- */

function ArrowGlyph() {
  return (
    <span aria-hidden="true" className="text-[14px] text-neutral-300">↗</span>
  )
}

function LockGlyph() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400">
      <rect x="3" y="7" width="10" height="7" rx="1.5" />
      <path d="M5.5 7 V5 a2.5 2.5 0 0 1 5 0 V7" />
    </svg>
  )
}
