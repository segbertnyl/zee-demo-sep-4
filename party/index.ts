import type * as Party from 'partykit/server'
import { onConnect } from 'y-partykit'

/* NYL360 collab backend on PartyKit — the managed twin of server/collab.cjs.
 *
 * y-partykit speaks the same y-websocket protocol the app's WebsocketProvider
 * already uses, so the client needs no code change. Each PartyKit room is one
 * Y.Doc; the room id comes from the connection URL, which the provider builds
 * as `<VITE_COLLAB_SERVER>/<room>`. Point the app at the deployment with:
 *
 *   VITE_COLLAB_SERVER=wss://nyl360-collab.<your-username>.partykit.dev/parties/main
 *
 * Local: `npm run party:dev` (ws://127.0.0.1:1999/parties/main)
 * Deploy: `npx partykit deploy` (GitHub auth on first run)
 */
export default class Collab implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    return onConnect(conn, this.room, {
      /* Keep docs warm in room storage between connections, so the layout
       * survives everyone leaving and rejoining mid-demo. */
      persist: { mode: 'snapshot' },
    })
  }
}
