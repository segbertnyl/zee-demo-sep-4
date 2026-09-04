import { PointSphere, recommendedPoints } from './PointSphere'

/* Re-export — the auto-density curve lives with PointSphere now (it needs it
 * to resolve points: null configs), but existing importers use this path. */
export { recommendedPoints }

/* The visible sphere spans ~42% of the render box (the rest is glow padding),
 * so its left edge sits ~29% in from the box edge. align="left" compensates
 * so the visible orb lines up with left-aligned content below it. */
const SPHERE_INSET = 0.29

export interface NylaProps {
  size: number
  animate?: boolean
  /** Named view within the size tier (saved via the Storybook Playground). */
  variant?: string
  /** 'left' pulls the wrapper left so the visible sphere edge aligns with content. */
  align?: 'center' | 'left'
  /** When false, skip PointSphere's 2s exploded-mount intro (render resolved).
   *  Used when NylaFlight owns the gather so the handoff is phase-perfect. */
  condense?: boolean
  /** Per-frame scatter multiplier for NylaFlight (see PointSphere.spreadRef). */
  spreadRef?: { current: number }
  className?: string
}

export function Nyla({ size, animate = true, variant, align = 'center', condense = true, spreadRef, className }: NylaProps) {
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        flexShrink: 0,
        pointerEvents: 'none',
        userSelect: 'none',
        ...(align === 'left' ? { marginLeft: -Math.round(size * SPHERE_INSET) } : {}),
      }}
    >
      <PointSphere
        size={size}
        animate={animate}
        variant={variant}
        condense={condense}
        spreadRef={spreadRef}
      />
    </div>
  )
}
