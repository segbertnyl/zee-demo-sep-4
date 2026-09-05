import { useState, useRef } from 'react'

// ── Bar chart icon ────────────────────────────────────────────────────────────

function BarChartIcon({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="8" width="3" height="6" rx="0.5" fill={color} />
      <rect x="6.5" y="5" width="3" height="9" rx="0.5" fill={color} />
      <rect x="11.5" y="2" width="3" height="12" rx="0.5" fill={color} />
    </svg>
  )
}

function CalendarIcon({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="12" height="11" rx="1.5" stroke={color} strokeWidth="1.3" />
      <path d="M2 6.5h12" stroke={color} strokeWidth="1.3" />
      <path d="M5.5 1.5v3M10.5 1.5v3" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

// ── Line chart ────────────────────────────────────────────────────────────────

export interface ChartDataPoint {
  label: string
  value: number
}

interface LineChartProps {
  data: ChartDataPoint[]
  currentValue: number
  yMin: number
  yMax: number
  width?: number
  height?: number
  yFormat?: (v: number) => string
}

function LineChart({ data, currentValue, yMin, yMax, width = 287, height = 135, yFormat }: LineChartProps) {
  const paddingLeft = 38
  const paddingRight = 8
  const paddingTop = 6
  const paddingBottom = 28

  const chartW = width - paddingLeft - paddingRight
  const chartH = height - paddingTop - paddingBottom

  function xPos(i: number) {
    return paddingLeft + (i / (data.length - 1)) * chartW
  }

  function yPos(val: number) {
    return paddingTop + chartH - ((val - yMin) / (yMax - yMin)) * chartH
  }

  // Build SVG path
  const points = data.map((d, i) => `${xPos(i)},${yPos(d.value)}`)
  const linePath = `M ${points.join(' L ')}`

  // Area fill path
  const firstX = xPos(0)
  const lastX = xPos(data.length - 1)
  const baseY = paddingTop + chartH
  const areaPath = `M ${firstX},${baseY} L ${points.join(' L ')} L ${lastX},${baseY} Z`

  // Y-axis tick values
  const tickCount = 5
  const tickStep = (yMax - yMin) / (tickCount - 1)
  const ticks = Array.from({ length: tickCount }, (_, i) => yMin + i * tickStep)

  // Current value reference line Y
  const refY = yPos(currentValue)
  const isRefInRange = currentValue >= yMin && currentValue <= yMax

  const formatValue = yFormat ?? ((v: number) => `$${v.toLocaleString()}`)

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} overflow="visible">
      {/* Y-axis grid lines and labels */}
      {ticks.map((tick, i) => {
        const y = yPos(tick)
        const isCurrentTick = Math.abs(tick - currentValue) < tickStep * 0.1
        return (
          <g key={i}>
            <line
              x1={paddingLeft}
              y1={y}
              x2={paddingLeft + chartW}
              y2={y}
              stroke={isCurrentTick ? '#3d6eff' : '#e0e0e0'}
              strokeWidth={isCurrentTick ? 1 : 0.75}
              strokeDasharray={isCurrentTick ? '3 3' : undefined}
            />
            <text
              x={paddingLeft - 4}
              y={y + 3}
              textAnchor="end"
              fontSize={9}
              fontFamily="var(--font-sans, sans-serif)"
              fill={isCurrentTick ? '#3d6eff' : '#888'}
            >
              {formatValue(tick)}
            </text>
          </g>
        )
      })}

      {/* Current value reference line (if not already a tick) */}
      {isRefInRange && !ticks.some((t) => Math.abs(t - currentValue) < tickStep * 0.1) && (
        <>
          <line
            x1={paddingLeft}
            y1={refY}
            x2={paddingLeft + chartW}
            y2={refY}
            stroke="#3d6eff"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <text
            x={paddingLeft - 4}
            y={refY + 3}
            textAnchor="end"
            fontSize={9}
            fontFamily="var(--font-sans, sans-serif)"
            fill="#3d6eff"
          >
            {formatValue(currentValue)}
          </text>
        </>
      )}

      {/* Area fill */}
      <defs>
        <linearGradient id="dtAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3d6eff" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#3d6eff" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#dtAreaGrad)" />

      {/* Line */}
      <path d={linePath} fill="none" stroke="#3d6eff" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />

      {/* Dots */}
      {data.map((d, i) => (
        <circle key={i} cx={xPos(i)} cy={yPos(d.value)} r={3.5} fill="white" stroke="#3d6eff" strokeWidth={1.5} />
      ))}

      {/* X-axis labels */}
      {data.map((d, i) => (
        <text
          key={i}
          x={xPos(i)}
          y={height - 4}
          textAnchor="middle"
          fontSize={9}
          fontFamily="var(--font-sans, sans-serif)"
          fill="#888"
        >
          {d.label}
        </text>
      ))}
    </svg>
  )
}

// ── DataTooltip ───────────────────────────────────────────────────────────────

export interface DataTooltipChart {
  title: string
  currentValue: number
  adjustLabel?: string
  onAdjust?: () => void
  data: ChartDataPoint[]
  yMin?: number
  yMax?: number
  source?: string
  yFormat?: (v: number) => string
}

export interface DataTooltipProps {
  /** Label text displayed in the pill */
  label: string
  /** Leading icon in the pill. Defaults to a bar chart. */
  icon?: 'bar' | 'calendar'
  /** Optional chart config for the flyout. If omitted, no flyout on click. */
  chart?: DataTooltipChart
  /** Controlled state override */
  state?: 'default' | 'hover' | 'clicked'
  /** Which direction the flyout opens. Auto-detected if omitted; override with 'up' or 'down'. */
  flyoutDirection?: 'up' | 'down'
  className?: string
}

export function DataTooltip({
  label,
  icon = 'bar',
  chart,
  state: controlledState,
  flyoutDirection,
  className,
}: DataTooltipProps) {
  const [open, setOpen] = useState(false)
  const [autoDirection, setAutoDirection] = useState<'up' | 'down'>('up')
  const ref = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<number | null>(null)

  // Controlled state (Storybook) overrides the hover behavior.
  const isActive = controlledState ? controlledState === 'hover' || controlledState === 'clicked' : open
  const isOpen = controlledState ? controlledState === 'clicked' : open && !!chart

  // Resolved direction: explicit prop wins; otherwise auto-detect on open
  const direction = flyoutDirection ?? autoDirection

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = window.setTimeout(() => setOpen(false), 120)
  }
  function openNow() {
    cancelClose()
    if (!chart) return
    if (ref.current) {
      // Estimate flyout height: title + value + chart + source + padding + gaps ≈ 270px
      const FLYOUT_ESTIMATE = 270
      const rect = ref.current.getBoundingClientRect()
      setAutoDirection(rect.top < FLYOUT_ESTIMATE + 24 ? 'down' : 'up')
    }
    setOpen(true)
  }

  const yMin = chart?.yMin ?? (chart ? Math.floor(Math.min(...chart.data.map((d) => d.value)) / 25) * 25 : 0)
  const yMax = chart?.yMax ?? (chart ? Math.ceil(Math.max(...chart.data.map((d) => d.value)) / 25) * 25 : 100)

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }} className={className}>
      {/* Pill */}
      <button
        type="button"
        onMouseEnter={openNow}
        onMouseLeave={scheduleClose}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 8px 4px 10px',
          borderRadius: 40,
          border: `1px solid ${isActive ? 'var(--action-primary, #0468ff)' : 'var(--border-subtle, #dcd9d5)'}`,
          background: isActive ? '#f2f8ff' : 'white',
          fontFamily: 'var(--font-sans)',
          fontSize: 16,
          lineHeight: '24px',
          letterSpacing: '0.2px',
          fontWeight: 400,
          color: '#17181c',
          cursor: 'default',
          whiteSpace: 'nowrap',
          transition: 'border-color 120ms ease, background 120ms ease',
        }}
      >
        {icon === 'calendar' ? (
          <CalendarIcon color="var(--action-primary, #0468ff)" />
        ) : (
          <BarChartIcon color="var(--action-primary, #0468ff)" />
        )}
        {label}
      </button>

      {/* Flyout */}
      {isOpen && chart && (
        <div
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          style={{
            position: 'absolute',
            ...(direction === 'up' ? { bottom: 'calc(100% + 18px)' } : { top: 'calc(100% + 18px)' }),
            left: '50%',
            transform: 'translateX(-50%)',
            width: 338,
            background: 'white',
            borderRadius: 4,
            boxShadow: '0px 2px 6px rgba(0,0,0,0.25)',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            zIndex: 100,
          }}
        >
          {/* Chart header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                fontWeight: 600,
                lineHeight: '20px',
                letterSpacing: '0.2px',
                color: '#111',
              }}
            >
              {chart.title}
            </p>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                lineHeight: '20px',
                letterSpacing: '0.2px',
                color: '#111',
              }}
            >
              ~{chart.currentValue.toLocaleString()} /policy
              {chart.adjustLabel && (
                <button
                  type="button"
                  onClick={chart.onAdjust}
                  style={{
                    marginLeft: 8,
                    fontFamily: 'var(--font-sans)',
                    fontSize: 14,
                    fontStyle: 'italic',
                    fontWeight: 400,
                    lineHeight: '20px',
                    color: 'var(--action-primary, #0468ff)',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                >
                  {chart.adjustLabel}
                </button>
              )}
            </p>
          </div>

          {/* Line chart */}
          <LineChart
            data={chart.data}
            currentValue={chart.currentValue}
            yMin={yMin}
            yMax={yMax}
            width={306}
            height={130}
            yFormat={chart.yFormat}
          />

          {/* Source */}
          {chart.source && (
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                fontStyle: 'italic',
                fontWeight: 400,
                lineHeight: '20px',
                letterSpacing: '0.2px',
                color: '#17181c',
                whiteSpace: 'nowrap',
              }}
            >
              Source: {chart.source}
            </p>
          )}

          {/* Caret arrow */}
          <div
            style={{
              position: 'absolute',
              ...(direction === 'up'
                ? { bottom: -9, boxShadow: '2px 2px 3px rgba(0,0,0,0.1)' }
                : { top: -9, boxShadow: '-2px -2px 3px rgba(0,0,0,0.1)' }),
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: 18,
              height: 18,
              background: 'white',
              borderRadius: 1,
            }}
          />
        </div>
      )}
    </div>
  )
}
