import { motion } from 'motion/react'

/* Briefing-v6 ambient background (Figma 1102-101355).
 * Soft gradient blobs concentrated in the bottom ~50% of the page, drifting
 * very slowly and atmospherically. Purely decorative (aria-hidden), sits behind
 * all content. Reduced-motion → blobs hold still. */

interface Blob {
  /* radial-gradient color stops (token-based) */
  color: string
  /* diameter in px. */
  size: number
  /* horizontal offset from the page center (px); 0 = dead center. */
  cx: number
  /* px the blob is sunk below the page bottom — larger sinks it lower so only
   * the top glow rises into view near the bottom edge. */
  bottom: number
  /* slow drift keyframes + per-blob loop duration (seconds). */
  x: number[]
  y: number[]
  scale: number[]
  duration: number
}

/* Clustered near the bottom center of the page: each blob is horizontally
 * centered (with a small offset for variety) and sunk mostly below the fold so
 * a soft glow rises from the bottom. Drift kept gentle so they stay centered. */
const BLOBS: Blob[] = [
  {
    color: 'var(--nyl-purple-200)',
    size: 1200, cx: 0, bottom: -420,
    x: [0, 140, -100, 0], y: [0, -90, 60, 0], scale: [1, 1.12, 0.92, 1], duration: 42,
  },
  {
    color: 'var(--nyl-blue-200)',
    size: 1000, cx: -300, bottom: -320,
    x: [0, -120, 90, 0], y: [0, 70, -60, 0], scale: [1, 1.1, 0.92, 1], duration: 48,
  },
  {
    color: 'var(--nyl-purple-100)',
    size: 1000, cx: 300, bottom: -340,
    x: [0, 110, -130, 0], y: [0, -70, 80, 0], scale: [1, 0.92, 1.12, 1], duration: 45,
  },
]

export function BriefingV6Background({ reducedMotion = false }: { reducedMotion?: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* positioning box anchored to the page bottom. NOT clipped (no
          overflow-hidden) — the shapes bleed softly upward; only the
          full-viewport container above bounds them. */}
      <div className="absolute inset-x-0 bottom-0 top-1/2">
        {BLOBS.map((b, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: b.size,
              height: b.size,
              /* left:50% + marginLeft:-size/2 centers the blob; cx nudges it.
                 marginLeft is separate from transform, so Framer's x drift
                 composes on top without clobbering the centering. */
              left: '50%',
              marginLeft: -b.size / 2 + b.cx,
              bottom: b.bottom,
              background: `radial-gradient(circle, ${b.color} 0%, transparent 68%)`,
              opacity: 0.5,
              filter: 'blur(40px)',
            }}
            animate={reducedMotion ? undefined : { x: b.x, y: b.y, scale: b.scale }}
            transition={{ duration: b.duration, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }}
          />
        ))}
      </div>
    </div>
  )
}
