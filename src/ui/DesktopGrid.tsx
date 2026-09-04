/* Desktop and Mobile grid reference components.
 * Figma source: BW Design System node 106:788
 *
 * Desktop: sidebar (fixed, 272px) + 12-col main (40px margin, 24px gutter)
 * Mobile:  375px viewport, 4 cols, 24px margin, 16px gutter
 */

export interface DesktopGridProps {
  sidebarWidth?: number
  columns?: number
  margin?: number
  gutter?: number
  height?: number
  showLabels?: boolean
}

export function DesktopGrid({
  sidebarWidth = 272,
  columns = 12,
  margin = 40,
  gutter = 24,
  height = 600,
  showLabels = true,
}: DesktopGridProps) {
  const cols = Array.from({ length: columns })

  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      {/* Sidebar */}
      <div
        className="absolute bottom-0 top-0 left-0"
        style={{ width: sidebarWidth, background: 'var(--nyl-purple-600)' }}
      />

      {/* Main container */}
      <div
        className="absolute bottom-0 top-0 flex"
        style={{
          left: sidebarWidth,
          right: 0,
          paddingLeft: margin,
          paddingRight: margin,
          gap: gutter,
          background: 'var(--nyl-purple-050)',
        }}
      >
        {cols.map((_, i) => (
          <div
            key={i}
            className="flex-1"
            style={{ background: 'var(--nyl-purple-200)', minWidth: 0 }}
          />
        ))}
      </div>

      {/* Labels */}
      {showLabels && (
        <>
          {/* Sidebar label */}
          <div
            className="absolute bottom-6 left-0 flex flex-col items-center gap-1 text-center"
            style={{ width: sidebarWidth }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80">Sidebar</p>
            <p className="text-[11px] text-white/60">{sidebarWidth}px fixed · 40px margin</p>
          </div>

          {/* Main container label */}
          <div
            className="absolute top-4 flex flex-col items-center gap-0.5 text-center"
            style={{ left: sidebarWidth + margin, right: margin }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--nyl-purple-700)]">Main container</p>
            <p className="text-[11px] text-[var(--nyl-purple-600,#4d1773)]">{columns} columns · {margin}px margin · {gutter}px gutter</p>
          </div>
        </>
      )}
    </div>
  )
}

export interface MobileGridProps {
  columns?: number
  margin?: number
  gutter?: number
  height?: number
  showLabels?: boolean
}

export function MobileGrid({
  columns = 4,
  margin = 24,
  gutter = 16,
  height = 480,
  showLabels = true,
}: MobileGridProps) {
  const cols = Array.from({ length: columns })
  const viewportWidth = 375

  return (
    <div className="flex flex-col gap-4">
      {showLabels && (
        <div className="flex flex-col gap-0.5">
          <p className="text-[13px] font-medium text-neutral-800">Mobile</p>
          <p className="text-[12px] text-neutral-500">
            Width: {viewportWidth}px · Columns: {columns} · Margin: {margin}px · Gutter: {gutter}px
          </p>
        </div>
      )}
      <div
        className="relative flex-col overflow-hidden"
        style={{ width: viewportWidth, height, flexShrink: 0 }}
      >
        {/* Nav bar */}
        <div
          className="w-full"
          style={{ height: 64, background: 'var(--nyl-purple-600)', flexShrink: 0 }}
        />
        {/* Column area */}
        <div
          className="flex"
          style={{
            flex: 1,
            height: height - 64,
            paddingLeft: margin,
            paddingRight: margin,
            gap: gutter,
            background: 'var(--nyl-purple-050)',
          }}
        >
          {cols.map((_, i) => (
            <div
              key={i}
              className="flex-1"
              style={{ background: 'var(--nyl-purple-200)', minWidth: 0 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
