import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { useSyncExternalStore } from 'react'

/* Canvas-mode multiplayer — Yjs under the bespoke canvas.
 *
 * One shared Y.Doc per room (from `?room=`, default below). Two maps:
 *   tile-positions — x/y overrides for the built-in Layer 1 tiles
 *   custom-nodes   — nodes created live on the canvas
 * Presence (named cursors, who's here) rides on the Yjs Awareness protocol.
 *
 * Identity is URL-based for the no-login demo: `?room=nyl-review&name=Eric`.
 * The session is a lazy singleton — nothing connects until canvas mode first
 * asks for it, and it survives scene switches so state stays warm.
 *
 * Dev server: `npm run collab` (ws://localhost:1234). Override at deploy with
 * VITE_COLLAB_SERVER (e.g. a y-partykit room URL). If the server is missing,
 * the provider quietly retries — the canvas still works solo. */

export type TilePos = { x: number; y: number }
export type CustomNode = {
  id: string
  title: string
  x: number
  y: number
  w: number
  h: number
  createdBy: string
}
export type PeerCursor = { x: number; y: number } | null
export type Peer = {
  clientId: number
  name: string
  color: string
  layer: string | null
  cursor: PeerCursor
}
export type ConnState = 'connecting' | 'connected' | 'disconnected'

/* Distinct, brand-adjacent cursor colors — assigned by awareness client id. */
const CURSOR_COLORS = ['#0468ff', '#7028a4', '#f06c00', '#0d8a5f', '#c5482f', '#0a6c74']

type Session = {
  doc: Y.Doc
  provider: WebsocketProvider
  tilesMap: Y.Map<TilePos>
  nodesMap: Y.Map<CustomNode>
  self: { name: string; color: string }
  tileSnap: Record<string, TilePos>
  nodeSnap: CustomNode[]
  peerSnap: Peer[]
  connSnap: ConnState
  tileListeners: Set<() => void>
  nodeListeners: Set<() => void>
  peerListeners: Set<() => void>
  connListeners: Set<() => void>
}

let session: Session | null = null

function emit(listeners: Set<() => void>) {
  listeners.forEach((l) => l())
}

export function getCollab(): Session {
  if (session) return session

  const params = new URLSearchParams(window.location.search)
  const room = params.get('room') ?? 'nyl360-canvas'
  const name = params.get('name') ?? 'Advisor'
  const url = (import.meta.env.VITE_COLLAB_SERVER as string | undefined) ?? 'ws://localhost:1234'

  const doc = new Y.Doc()
  const provider = new WebsocketProvider(url, room, doc)
  const tilesMap = doc.getMap<TilePos>('tile-positions')
  const nodesMap = doc.getMap<CustomNode>('custom-nodes')
  const color = CURSOR_COLORS[provider.awareness.clientID % CURSOR_COLORS.length]

  const s: Session = {
    doc,
    provider,
    tilesMap,
    nodesMap,
    self: { name, color },
    tileSnap: {},
    nodeSnap: [],
    peerSnap: [],
    connSnap: 'connecting',
    tileListeners: new Set(),
    nodeListeners: new Set(),
    peerListeners: new Set(),
    connListeners: new Set(),
  }

  provider.awareness.setLocalState({ user: { name, color }, layer: null, cursor: null })

  tilesMap.observeDeep(() => {
    s.tileSnap = Object.fromEntries(tilesMap.entries())
    emit(s.tileListeners)
  })
  nodesMap.observeDeep(() => {
    s.nodeSnap = [...nodesMap.values()]
    emit(s.nodeListeners)
  })
  provider.awareness.on('change', () => {
    s.peerSnap = readPeers(provider)
    emit(s.peerListeners)
  })
  provider.on('status', (e: { status: string }) => {
    s.connSnap = e.status === 'connected' ? 'connected' : e.status === 'connecting' ? 'connecting' : 'disconnected'
    emit(s.connListeners)
  })

  session = s
  return s
}

function readPeers(provider: WebsocketProvider): Peer[] {
  const me = provider.awareness.clientID
  const out: Peer[] = []
  provider.awareness.getStates().forEach((state, clientId) => {
    if (clientId === me) return
    const user = state.user as { name?: string; color?: string } | undefined
    if (!user) return
    out.push({
      clientId,
      name: user.name ?? 'Guest',
      color: user.color ?? CURSOR_COLORS[clientId % CURSOR_COLORS.length],
      layer: (state.layer as string | null) ?? null,
      cursor: (state.cursor as PeerCursor) ?? null,
    })
  })
  return out.sort((a, b) => a.clientId - b.clientId)
}

/* ---------------------------------------------------------------------------
 * Hooks — useSyncExternalStore over cached snapshots, so renders stay pure.
 * ------------------------------------------------------------------------- */

export function useTilePositions(): Record<string, TilePos> {
  const s = getCollab()
  return useSyncExternalStore(
    (cb) => {
      s.tileListeners.add(cb)
      return () => s.tileListeners.delete(cb)
    },
    () => s.tileSnap,
  )
}

export function useCustomNodes(): CustomNode[] {
  const s = getCollab()
  return useSyncExternalStore(
    (cb) => {
      s.nodeListeners.add(cb)
      return () => s.nodeListeners.delete(cb)
    },
    () => s.nodeSnap,
  )
}

export function usePeers(): Peer[] {
  const s = getCollab()
  return useSyncExternalStore(
    (cb) => {
      s.peerListeners.add(cb)
      return () => s.peerListeners.delete(cb)
    },
    () => s.peerSnap,
  )
}

export function useConnState(): ConnState {
  const s = getCollab()
  return useSyncExternalStore(
    (cb) => {
      s.connListeners.add(cb)
      return () => s.connListeners.delete(cb)
    },
    () => s.connSnap,
  )
}

export function selfUser(): { name: string; color: string } {
  return getCollab().self
}

/* ---------------------------------------------------------------------------
 * Mutators — every call is a CRDT op; remote peers see it live.
 * ------------------------------------------------------------------------- */

export function moveTile(id: string, x: number, y: number) {
  getCollab().tilesMap.set(id, { x, y })
}

export function addNode(x: number, y: number): string {
  const s = getCollab()
  const id = `node-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`
  s.nodesMap.set(id, { id, title: 'New node', x, y, w: 280, h: 160, createdBy: s.self.name })
  return id
}

export function moveNode(id: string, x: number, y: number) {
  const s = getCollab()
  const n = s.nodesMap.get(id)
  if (n) s.nodesMap.set(id, { ...n, x, y })
}

export function renameNode(id: string, title: string) {
  const s = getCollab()
  const n = s.nodesMap.get(id)
  if (n) s.nodesMap.set(id, { ...n, title })
}

export function removeNode(id: string) {
  getCollab().nodesMap.delete(id)
}

/* Broadcast where I am (layer key) and where my cursor sits in canvas-space
 * coordinates. Pass null cursor on leave; null layer on unmount. */
export function setPresence(layer: string | null, cursor: PeerCursor) {
  const aw = getCollab().provider.awareness
  aw.setLocalStateField('layer', layer)
  aw.setLocalStateField('cursor', cursor)
}
