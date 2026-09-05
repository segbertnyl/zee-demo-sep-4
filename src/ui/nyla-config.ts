/* Orb configuration — single source of truth for PointSphere rendering.
 *
 * Configs are per SIZE TIER × VIEW. Each tier in the ramp can hold multiple
 * named views (e.g. 64px "default", 64px "on-dark") so the same size can look
 * different in different contexts. A <Nyla size={n} variant="on-dark"> picks
 * the nearest tier, then that tier's named view (falling back to "default").
 *
 * SAVED VIEWS live in src/ui/nyla-views.json — a checked-in file written by
 * the dev-server endpoint /__nyla-config (see scripts/nyla-config-sync.ts).
 * Because Storybook and the prototype both register that plugin AND both
 * import the same JSON, saving from the Storybook Playground hot-reloads the
 * prototype with the new values. No localStorage, no per-origin drift. */

import savedViews from './nyla-views.json'

export interface NylaOrbConfig {
  dotScale: number // baseD = size * dotScale — controls dot size
  glowScale: number // boxShadow blur = size * glowScale
  minOpacity: number // opacity of back-facing dots (0–1)
  rotationSpeed: number // yaw speed in rad/s (0 = still, 0.5 = reference speed)
  purpleMix: number // particle blue↔purple blend (0 = all blue, 1 = all purple)
  haloStrength: number // ambient background-glow intensity multiplier (0 = off, 1 = base, 2 = max)
  points: number | null // dot count; null = auto (recommendedPoints for the render size)
}

/* The size ramp — keep in sync with the Storybook Size Ramp story. */
export const NYLA_SIZE_TIERS = [24, 40, 64, 96, 160, 256] as const
export type NylaSizeTier = (typeof NYLA_SIZE_TIERS)[number]

export const DEFAULT_VIEW = 'default'

const BASE: NylaOrbConfig = {
  dotScale: 0.07,
  glowScale: 0.022,
  minOpacity: 0.4,
  rotationSpeed: 0.5,
  purpleMix: 0,
  haloStrength: 1,
  points: null,
}

/* Checked-in fallbacks per tier × view. Saved views from the Playground
 * (nyla-views.json) layer on top. */
export const NYLA_TIER_DEFAULTS: Record<NylaSizeTier, Record<string, NylaOrbConfig>> = {
  24: { [DEFAULT_VIEW]: { ...BASE } },
  40: { [DEFAULT_VIEW]: { ...BASE } },
  64: { [DEFAULT_VIEW]: { ...BASE } },
  96: { [DEFAULT_VIEW]: { ...BASE } },
  160: { [DEFAULT_VIEW]: { ...BASE } },
  256: { [DEFAULT_VIEW]: { ...BASE } },
}

type ViewMap = Partial<Record<string, Record<string, Partial<NylaOrbConfig>>>>

/* In-memory copy — starts from the bundled JSON, updated on save so the
 * current session sees changes immediately (HMR refreshes the bundle too). */
let viewMap: ViewMap = savedViews as ViewMap

export function nearestTier(size: number): NylaSizeTier {
  let best: NylaSizeTier = NYLA_SIZE_TIERS[0]
  let bestDist = Infinity
  for (const t of NYLA_SIZE_TIERS) {
    const d = Math.abs(size - t)
    if (d < bestDist) {
      bestDist = d
      best = t
    }
  }
  return best
}

/* Resolve the effective config for any render size + view.
 * Fallback chain: saved[tier][view] → defaults[tier][view] →
 * saved[tier][default] → defaults[tier][default]. */
export function loadOrbConfigForSize(size: number, view: string = DEFAULT_VIEW): NylaOrbConfig {
  return loadOrbConfigForTier(nearestTier(size), view)
}

export function loadOrbConfigForTier(tier: NylaSizeTier, view: string = DEFAULT_VIEW): NylaOrbConfig {
  const saved = viewMap[String(tier)] ?? {}
  const defaults = NYLA_TIER_DEFAULTS[tier]
  return {
    ...defaults[DEFAULT_VIEW],
    ...saved[DEFAULT_VIEW],
    ...defaults[view],
    ...saved[view],
  }
}

/* All view names available for a tier — checked-in defaults + saved. */
export function listViewsForTier(tier: NylaSizeTier): string[] {
  const names = new Set<string>([DEFAULT_VIEW])
  for (const n of Object.keys(NYLA_TIER_DEFAULTS[tier])) names.add(n)
  for (const n of Object.keys(viewMap[String(tier)] ?? {})) names.add(n)
  return [...names]
}

/* Persist ONE view change to nyla-views.json via the dev-server endpoint.
 * Read-merge-write against the file, not this tab's memory: the module-level
 * viewMap can be stale (a tab opened before other saves, or mid-HMR), and
 * POSTing it wholesale used to revert every other tier/view to old values.
 * The tab also adopts the merged result so it self-heals on save. */
async function persistView(tier: string, view: string, config: NylaOrbConfig | null): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    const onDisk = (await (await fetch('/__nyla-config')).json()) as ViewMap
    const tierViews = { ...(onDisk[tier] ?? {}) }
    if (config) tierViews[view] = config
    else delete tierViews[view]
    viewMap = { ...onDisk, [tier]: tierViews }
    await fetch('/__nyla-config', { method: 'POST', body: JSON.stringify(viewMap) })
  } catch {
    console.warn('[nyla-config] Could not persist — dev server endpoint unavailable')
  }
}

export function saveOrbConfigForTier(tier: NylaSizeTier, view: string, config: NylaOrbConfig): void {
  viewMap = { ...viewMap, [String(tier)]: { ...(viewMap[String(tier)] ?? {}), [view]: config } }
  void persistView(String(tier), view, config)
}

export function clearOrbConfigForTier(tier: NylaSizeTier, view: string): void {
  const tierViews = { ...(viewMap[String(tier)] ?? {}) }
  delete tierViews[view]
  viewMap = { ...viewMap, [String(tier)]: tierViews }
  void persistView(String(tier), view, null)
}

export function clearAllOrbConfigs(): void {
  viewMap = {}
  if (typeof window === 'undefined') return
  fetch('/__nyla-config', { method: 'POST', body: '{}' }).catch(() => {
    console.warn('[nyla-config] Could not persist — dev server endpoint unavailable')
  })
}
