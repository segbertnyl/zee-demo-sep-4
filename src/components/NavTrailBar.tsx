import { AnimatePresence, motion } from 'motion/react'
import { useAppStore } from '@/state/useAppStore'
import { EASE, DURATION } from '@/motion'

/* Sticky breadcrumb strip mounted globally in SceneShell. Lights up the
 * moment the advisor enters the Practice canvas and drills into a tile,
 * then trails them across destination scenes (Business, Calendar, deep-dive
 * canvases, etc.) so they can click back to any prior step. */

export function NavTrailBar() {
  const trail = useAppStore((s) => s.navTrail)
  const popTrailTo = useAppStore((s) => s.popTrailTo)
  const clearTrail = useAppStore((s) => s.clearTrail)
  const scene = useAppStore((s) => s.scene)
  const deepDive = useAppStore((s) => s.deepDive)

  /* Hide on the canvas itself (it has its own in-canvas breadcrumb chrome). */
  if (scene === 'canvas') return null
  /* Hide when there's a deep-dive overlay open — the deep-dive has its own
   * top bar, and the trail would render under the modal. */
  if (deepDive) return null
  if (trail.length === 0) return null

  return (
    <AnimatePresence>
      <motion.nav
        key="trail"
        aria-label="Navigation breadcrumb"
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -8, opacity: 0 }}
        transition={{ duration: DURATION.micro, ease: EASE.settle }}
        className="sticky top-0 z-[120] flex items-center gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]/90 px-6 py-2 backdrop-blur-sm md:px-8"
      >
        <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-[var(--text-body-muted)]">Trail</p>
        <span aria-hidden="true" className="text-[var(--text-body-faint)]">·</span>
        <ol className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {trail.map((c, i) => {
            const isLast = i === trail.length - 1
            return (
              <li key={c.id} className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => popTrailTo(i)}
                  disabled={isLast}
                  className={[
                    'rounded-md px-2 py-1 text-[12px] font-medium transition-colors',
                    isLast
                      ? 'cursor-default text-[var(--text-headline)]'
                      : 'text-[var(--nyl-blue-600)] hover:bg-[var(--nyl-blue-100)]/55 hover:text-[var(--nyl-blue-800)]',
                  ].join(' ')}
                  title={isLast ? c.label : `Back to ${c.label}`}
                >
                  {c.label}
                </button>
                {!isLast && <span aria-hidden="true" className="text-[var(--text-body-faint)]">›</span>}
              </li>
            )
          })}
        </ol>
        <button
          type="button"
          onClick={clearTrail}
          aria-label="Clear trail"
          title="Clear trail"
          className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-[var(--text-body-muted)] hover:text-[var(--text-headline)]"
        >
          Clear
        </button>
      </motion.nav>
    </AnimatePresence>
  )
}
