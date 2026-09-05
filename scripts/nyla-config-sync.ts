/* Vite dev-server plugin — lets the Storybook Playground save Nyla orb configs
 * to src/ui/nyla-views.json. Registered in BOTH vite.config.ts and
 * .storybook/main.ts, so saving from Storybook (port 6006) writes the same
 * file the prototype (port 5173) imports. Vite HMR then hot-reloads the
 * prototype with the new values — no manual reload.
 *
 * Dev-only; the endpoint doesn't exist in production builds (the JSON file
 * itself is bundled, so saved views still ship). */
import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

/* Both `npm run dev` and `npm run storybook` execute from the repo root. */
const VIEWS_FILE = path.resolve(process.cwd(), 'src/ui/nyla-views.json')

export function nylaConfigSync(): Plugin {
  return {
    name: 'nyla-config-sync',
    configureServer(server) {
      server.middlewares.use('/__nyla-config', (req, res) => {
        if (req.method === 'POST') {
          // Same-origin only — blocks cross-site pages from rewriting the config
          const site = req.headers['sec-fetch-site']
          if (site && site !== 'same-origin') {
            res.statusCode = 403
            res.end('forbidden')
            return
          }
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body) // validate before writing
              fs.writeFileSync(VIEWS_FILE, JSON.stringify(parsed, null, 2) + '\n')
              res.statusCode = 200
              res.end('ok')
            } catch {
              res.statusCode = 400
              res.end('invalid json')
            }
          })
          return
        }
        res.setHeader('Content-Type', 'application/json')
        res.end(fs.existsSync(VIEWS_FILE) ? fs.readFileSync(VIEWS_FILE, 'utf8') : '{}')
      })
    },
  }
}
