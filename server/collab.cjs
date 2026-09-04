/* NYL360 collab server — y-websocket relay for canvas-mode multiplayer.
 *
 * Run alongside `npm run dev`:
 *   npm run collab            (ws://localhost:1234)
 *   PORT=4444 npm run collab
 *
 * Rooms are derived from the connection path (the client passes the room id),
 * so every `?room=` value gets its own isolated Y.Doc. Docs live in memory —
 * restart the server, start from the seeded layout again. For persistence,
 * see y-websocket's LevelDB option (YPERSISTENCE env var).
 */
const http = require('http')
const { WebSocketServer } = require('ws')
const { setupWSConnection } = require('y-websocket/bin/utils')

const port = Number(process.env.PORT || 1234)

const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('NYL360 collab server — connect via WebSocket')
})

const wss = new WebSocketServer({ server })
wss.on('connection', (ws, req) => setupWSConnection(ws, req))

server.listen(port, () => {
  console.log(`NYL360 collab server on ws://localhost:${port}`)
})
