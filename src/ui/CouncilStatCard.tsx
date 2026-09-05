import type React from 'react'

export type CouncilStatus = 'complete' | 'on-track' | 'stretch'

export interface CouncilStatCardProps {
  label: string
  value: string
  valueSuffix?: string
  status: CouncilStatus
  progress: number
  caption: string
  captionBold?: string
  dimmed?: boolean
  noBorder?: boolean
  className?: string
}

function statusBadgeStyle(status: CouncilStatus): React.CSSProperties {
  if (status === 'stretch') {
    return {
      background: 'var(--nyl-orange-100, #ffe8cf)',
      border: '1px solid var(--nyl-orange-400)',
      color: '#5c3b00',
    }
  }
  return {
    background: 'var(--nyl-green-200, #a5efbf)',
    border: '1px solid var(--nyl-green-600)',
    color: '#0a2e1c',
  }
}

function statusLabel(status: CouncilStatus): string {
  if (status === 'complete') return 'Complete'
  if (status === 'on-track') return 'On Track'
  return 'Stretch'
}

function fillColor(status: CouncilStatus): string {
  return status === 'stretch' ? 'var(--nyl-orange-400, #ff9522)' : 'var(--nyl-green-800, #016355)'
}

function renderCaption(caption: string, captionBold?: string) {
  if (!captionBold) {
    return <span>{caption}</span>
  }
  const idx = caption.indexOf(captionBold)
  if (idx === -1) {
    return <span>{caption}</span>
  }
  return (
    <>
      {caption.slice(0, idx)}
      <strong style={{ fontWeight: 600 }}>{captionBold}</strong>
      {caption.slice(idx + captionBold.length)}
    </>
  )
}

export function CouncilStatCard({
  label,
  value,
  valueSuffix,
  status,
  progress,
  caption,
  captionBold,
  dimmed,
  noBorder,
  className,
}: CouncilStatCardProps) {
  const pct = Math.min(1, Math.max(0, progress)) * 100

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: '100%',
        paddingTop: 16,
        paddingBottom: noBorder ? 16 : 17,
        borderBottom: noBorder ? 'none' : '1px solid var(--border-subtle)',
        opacity: dimmed ? 0.5 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            fontWeight: 400,
            color: 'var(--text-body)',
            lineHeight: 1.3,
          }}
        >
          {label}
        </span>
        <span
          style={{
            ...statusBadgeStyle(status),
            borderRadius: 999,
            padding: '2px 10px',
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {statusLabel(status)}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 22,
            fontWeight: 500,
            color: 'var(--text-headline)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        {valueSuffix && (
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              fontWeight: 400,
              color: 'var(--text-body-muted)',
              marginLeft: 1,
            }}
          >
            {valueSuffix}
          </span>
        )}
      </div>

      <div
        style={{
          height: 6,
          width: '100%',
          borderRadius: 999,
          background: '#e2e8f0',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: 999,
            background: fillColor(status),
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 11.5,
          color: 'var(--text-body-muted)',
          margin: 0,
          lineHeight: 1.4,
        }}
      >
        {renderCaption(caption, captionBold)}
      </p>
    </div>
  )
}
