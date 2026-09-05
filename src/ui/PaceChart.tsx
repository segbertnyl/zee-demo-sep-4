import { motion } from 'motion/react'
import { EASE, DURATION } from '@/motion'

export interface PacePoint {
  x: number
  value: number
}

export interface LegendItem {
  label: string
  color: string
  dotted?: boolean
}

export interface PaceChartProps {
  actualPoints: PacePoint[]
  currentPacePoints: PacePoint[]
  neededPacePoints: PacePoint[]
  todayX: number
  todayLabel: string
  actualValueAtToday: number
  fycGoal: number
  legend: LegendItem[]
  width?: number
  height?: number
  yMin?: number
  yMax?: number
  yMinPx?: number
  yMaxPx?: number
  xAxisLabels?: { x: number; label: string; anchor?: 'start' | 'middle' | 'end' }[]
  gridlineCount?: number
  gridlineSpacing?: number
  /** Font size (in viewBox units) for the today marker + axis/ref labels. Scales
   *  with the chart; lower it when the chart renders wide so text stays ~16px. */
  labelFontSize?: number
  // Color overrides for dark/themed contexts
  actualColor?: string
  currentPaceColor?: string
  neededPaceColor?: string
  vGridlineColor?: string
  refLineColor?: string
  refLine1?: number
  refLine1Label?: string
  refLine2?: number
  refLine2Label?: string
  todayDotColor?: string
  todayHaloColor?: string
}

const DEFAULT_WIDTH = 858
const DEFAULT_HEIGHT = 196

function cy(value: number, yMin: number, yMinPx: number, yMax: number, yMaxPx: number): number {
  const ratio = (value - yMin) / (yMax - yMin)
  return yMinPx - ratio * (yMinPx - yMaxPx)
}

function toPath(pts: PacePoint[], cyFn: (v: number) => number): string {
  return pts.map(({ x, value }, i) => `${i === 0 ? 'M' : 'L'} ${x} ${cyFn(value)}`).join(' ')
}

export function PaceChart({
  actualPoints,
  currentPacePoints,
  neededPacePoints,
  todayX,
  todayLabel,
  actualValueAtToday,
  fycGoal,
  legend,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  yMin = 0,
  yMax = 100,
  yMinPx = 164,
  yMaxPx = 36,
  xAxisLabels = [],
  gridlineCount = 13,
  gridlineSpacing = 71.5,
  labelFontSize = 14,
  actualColor = '#9b9997',
  currentPaceColor = '#bc79ec',
  neededPaceColor = '#66a8ff',
  vGridlineColor = '#efedf2',
  refLineColor = 'var(--nyl-gray-100)',
  refLine1 = 50,
  refLine1Label = '$50K',
  refLine2 = 100,
  refLine2Label = '$100K',
  todayDotColor = 'var(--nyl-purple-600)',
  todayHaloColor = '#bc79ec',
}: PaceChartProps) {
  const cyFn = (v: number) => cy(v, yMin, yMinPx, yMax, yMaxPx)
  const ref1y = cy(refLine1, yMin, yMinPx, yMax, yMaxPx)
  const ref2y = cy(refLine2, yMin, yMinPx, yMax, yMaxPx)

  return (
    <div style={{ marginTop: 0 }}>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {legend.map((l) => (
          <span
            key={l.label}
            className="inline-flex items-center gap-2 text-[14px] leading-[20px] tracking-[0.2px] text-[var(--text-body)]"
          >
            <span
              aria-hidden="true"
              className="inline-block h-0 w-5"
              style={{ borderTop: `3px ${l.dotted ? 'dashed' : 'solid'} ${l.color}` }}
            />
            {l.label}
          </span>
        ))}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="mt-6 w-full" role="img" aria-label="Projected pace chart">
        {/* vertical gridlines */}
        {Array.from({ length: gridlineCount }, (_, i) => (
          <line
            key={i}
            x1={i * gridlineSpacing}
            y1="14"
            x2={i * gridlineSpacing}
            y2={yMinPx}
            stroke={vGridlineColor}
            strokeWidth="1"
          />
        ))}

        {/* horizontal reference lines */}
        <line x1="0" y1={ref2y} x2={width} y2={ref2y} stroke={refLineColor} strokeWidth="1" />
        <line x1="0" y1={ref1y} x2={width} y2={ref1y} stroke={refLineColor} strokeWidth="1" />
        <text x="7" y={ref2y - 6} style={{ fill: 'var(--text-body-muted)' }} opacity="0.6" fontSize={labelFontSize}>
          {refLine2Label}
        </text>
        <text x="7" y={ref1y - 6} style={{ fill: 'var(--text-body-muted)' }} opacity="0.6" fontSize={labelFontSize}>
          {refLine1Label}
        </text>

        {/* FYC goal — single dotted line */}
        <motion.line
          x1="0"
          y1={cyFn(fycGoal)}
          x2={width}
          y2={cyFn(fycGoal)}
          stroke={neededPaceColor}
          strokeWidth="2"
          strokeDasharray="4 4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: DURATION['scene-in'], delay: 0.7, ease: EASE.settle }}
        />

        {/* Today marker */}
        <line
          x1={todayX}
          y1="18"
          x2={todayX}
          y2={yMinPx}
          style={{ stroke: 'var(--text-headline)' }}
          strokeWidth="1.2"
        />
        <text
          x={todayX}
          y="10"
          textAnchor="middle"
          style={{ fill: 'var(--text-headline)' }}
          fontSize={labelFontSize}
          fontWeight="600"
        >
          {todayLabel}
        </text>

        {/* Historical line */}
        <motion.path
          d={toPath(actualPoints, cyFn)}
          fill="none"
          stroke={actualColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: DURATION.dramatic, ease: EASE.settle }}
        />
        {/* Current pace projection (orange, lower) */}
        <motion.path
          d={toPath(currentPacePoints, cyFn)}
          fill="none"
          stroke={currentPaceColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: DURATION.dramatic, delay: 0.85, ease: EASE.settle }}
        />
        {/* Plan projection (purple, reaches goal) */}
        <motion.path
          d={toPath(neededPacePoints, cyFn)}
          fill="none"
          stroke={neededPaceColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: DURATION.dramatic, delay: 0.85, ease: EASE.settle }}
        />

        {/* Today dot */}
        <motion.g
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: DURATION.standard, delay: 0.9, ease: EASE.settle }}
          style={{ transformOrigin: `${todayX}px ${cyFn(actualValueAtToday)}px` }}
        >
          <circle cx={todayX} cy={cyFn(actualValueAtToday)} r="11" fill={todayHaloColor} opacity="0.22" />
          <g transform={`translate(${todayX} ${cyFn(actualValueAtToday)}) rotate(45)`}>
            <rect x="-4" y="-4" width="8" height="8" fill={todayDotColor} />
          </g>
        </motion.g>

        {/* X-axis labels */}
        {xAxisLabels.map(({ x, label, anchor = 'middle' }) => (
          <text
            key={label}
            x={x}
            y={height - 6}
            textAnchor={anchor}
            style={{ fill: 'var(--text-body-muted)' }}
            opacity="0.6"
            fontSize={labelFontSize}
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  )
}
