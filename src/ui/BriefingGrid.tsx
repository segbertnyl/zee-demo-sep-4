/* Page grid reference — Figma "Exploration pt-II" (3.0-Briefing 1102-101355).
 *
 * The standard layout for every NYL360 page:
 *   · a fixed 96px left rail (the main nav)
 *   · a 12-column content area: 1272px max content, 24px gutter, 40px margin
 *   · the editorial split used on the Briefing: left = 5 cols, right = 7 cols
 *
 * The main nav's hover-EXPANDED state floats ABOVE page content (overlay) and
 * does NOT change this grid — content always lays out against the 96px rail.
 *
 * This component is a visual reference/overlay (like DesktopGrid), not layout
 * primitives. Real pages compose with the same constants (see BriefingV6Scene
 * `GRID`). */

export interface BriefingGridProps {
  railWidth?: number
  columns?: number
  margin?: number
  gutter?: number
  contentMax?: number
  height?: number
  /** Tint the 5-col / 7-col editorial split. */
  showSplit?: boolean
  showLabels?: boolean
}

export function BriefingGrid({
  railWidth = 96,
  columns = 12,
  margin = 40,
  gutter = 24,
  contentMax = 1272,
  height = 600,
  showSplit = true,
  showLabels = true,
}: BriefingGridProps) {
  const cols = Array.from({ length: columns })
  const leftSpan = 5 // editorial left column

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-[var(--border-subtle)]" style={{ height }}>
      {/* Rail */}
      <div
        className="absolute inset-y-0 left-0 flex flex-col items-center pt-5"
        style={{ width: railWidth, background: 'var(--nyl-blue-700)' }}
      >
        <div className="size-7 rounded-md bg-white/90" />
      </div>

      {/* Content area — centered, capped at contentMax + margins */}
      <div className="absolute inset-y-0 flex justify-center" style={{ left: railWidth, right: 0 }}>
        <div
          className="flex w-full"
          style={{ maxWidth: contentMax + margin * 2, paddingLeft: margin, paddingRight: margin, gap: gutter }}
        >
          {cols.map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-b"
              style={{
                minWidth: 0,
                background: showSplit
                  ? i < leftSpan
                    ? 'var(--nyl-blue-200)'
                    : 'var(--nyl-purple-200)'
                  : 'var(--nyl-purple-200)',
                opacity: 0.7,
              }}
            />
          ))}
        </div>
      </div>

      {showLabels && (
        <>
          <div className="absolute bottom-5 flex flex-col items-center gap-1 text-center" style={{ width: railWidth }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/90">Rail</p>
            <p className="text-[10px] text-white/70">{railWidth}px</p>
          </div>
          <div
            className="absolute top-4 flex flex-col items-center gap-0.5 text-center"
            style={{ left: railWidth, right: 0 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--nyl-purple-700)]">
              Content · {columns} columns
            </p>
            <p className="text-[11px] text-[var(--nyl-purple-600)]">
              {contentMax}px max · {gutter}px gutter · {margin}px margin
            </p>
            {showSplit && (
              <p className="mt-0.5 text-[11px] text-[var(--nyl-blue-700)]">
                Editorial split — left 5 cols · right 7 cols
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
