import * as d3 from 'd3'

export interface CouncilCreditsChartProps {
  width?: number
  height?: number
  currentCredits?: number
  targetCredits?: number
  currentMonth?: number
}

// Month index 0 = Jul, 12 = end of Jun (next Jul). Data only through currentMonth.
const ACTUAL_DATA: [number, number][] = [
  [0, 0],
  [1, 800],
  [2, 2200],
  [3, 5000],
  [4, 9500],
  [5, 16000],
  [6, 25000],
  [7, 36000],
  [8, 46800],
]

const TOTAL_MONTHS = 12

const X_LABELS: { label: string; month: number; anchor: 'start' | 'middle' | 'end' }[] = [
  { label: 'Jul', month: 0,            anchor: 'start'  },
  { label: 'Nov', month: 4,            anchor: 'middle' },
  { label: 'Mar', month: 8,            anchor: 'middle' },
  { label: 'Jul', month: TOTAL_MONTHS, anchor: 'end'    },
]

// Solid gridlines at Nov only; today (Mar) gets its own dashed line
const REFERENCE_MONTHS = [4]

export function CouncilCreditsChart({
  width = 300,
  height = 214,
  currentCredits = 46800,
  targetCredits = 90000,
  currentMonth = 8,
}: CouncilCreditsChartProps) {
  const margin = { top: 8, right: 8, bottom: 24, left: 8 }

  const xScale = d3
    .scaleLinear()
    .domain([0, TOTAL_MONTHS])
    .range([margin.left, width - margin.right])

  const yScale = d3
    .scaleLinear()
    .domain([0, targetCredits])
    .range([height - margin.bottom, margin.top])

  const lineGen = d3
    .line<[number, number]>()
    .x((d) => xScale(d[0]))
    .y((d) => yScale(d[1]))
    .curve(d3.curveMonotoneX)

  const areaGen = d3
    .area<[number, number]>()
    .x((d) => xScale(d[0]))
    .y0(height - margin.bottom)
    .y1((d) => yScale(d[1]))
    .curve(d3.curveMonotoneX)

  // Goal line spans full fiscal year
  const goalLine = lineGen([[0, 0], [TOTAL_MONTHS, targetCredits]])

  // Actual data only through currentMonth
  const visibleActual = ACTUAL_DATA.filter((d) => d[0] <= currentMonth)
  const actualPath = lineGen(visibleActual)
  const areaPath = areaGen(visibleActual)

  const dotX = xScale(currentMonth)
  const dotY = yScale(currentCredits)
  const vlineX = dotX

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block', overflow: 'hidden' }}
    >
      {/* Solid reference gridlines (Nov) */}
      {REFERENCE_MONTHS.map((m) => (
        <line
          key={m}
          x1={xScale(m)}
          x2={xScale(m)}
          y1={margin.top}
          y2={height - margin.bottom}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      ))}

      {/* Diagonal goal line — full year */}
      {goalLine && (
        <path d={goalLine} fill="none" stroke="#d1d5db" strokeWidth={1} />
      )}

      {/* Orange area fill under actual */}
      {areaPath && (
        <path d={areaPath} fill="rgba(255,149,34,0.12)" stroke="none" />
      )}

      {/* Actual performance line — stops at today */}
      {actualPath && (
        <path
          d={actualPath}
          fill="none"
          stroke="var(--nyl-orange-400, #ff9522)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Today marker — dashed vertical */}
      <line
        x1={vlineX}
        x2={vlineX}
        y1={margin.top}
        y2={height - margin.bottom}
        stroke="var(--nyl-orange-300, #ffb347)"
        strokeWidth={1.5}
        strokeDasharray="3,3"
      />

      {/* Halo + dot at current position */}
      <circle cx={dotX} cy={dotY} r={10} fill="rgba(255,149,34,0.15)" />
      <circle cx={dotX} cy={dotY} r={5}  fill="var(--nyl-orange-400, #ff9522)" />

      {/* X-axis labels */}
      {X_LABELS.map(({ label, month, anchor }) => (
        <text
          key={`${label}-${month}`}
          x={xScale(month)}
          y={height - 6}
          textAnchor={anchor}
          fontSize={12}
          fill="var(--text-body-muted, #94a3b8)"
          fontFamily="var(--font-sans)"
        >
          {label}
        </text>
      ))}
    </svg>
  )
}
