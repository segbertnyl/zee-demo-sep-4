import { Nyla } from './Nyla'

export interface NylaContextualActionsProps {
  actions: { label: string; onClick?: () => void }[]
  className?: string
}

export function NylaContextualActions({ actions, className }: NylaContextualActionsProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        gap: 16,
        alignItems: 'center',
      }}
    >
      {/* Nyla circle */}
      <div
        style={{
          width: 40,
          height: 40,
          flexShrink: 0,
          background: 'white',
          border: '1px solid var(--nyl-purple-200)',
          borderRadius: 9999,
          boxShadow: '0 0 16px var(--nyl-purple-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Nyla size={40} variant="on-light" />
      </div>

      {/* Action pills */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {actions.slice(0, 5).map((action, i) => (
          <button
            key={i}
            type="button"
            onClick={action.onClick}
            style={{
              background: 'white',
              border: '1px solid var(--nyl-purple-100)',
              borderRadius: 8,
              padding: '8px 12px',
              fontFamily: 'var(--font-sans)',
              fontSize: 16,
              lineHeight: '24px',
              letterSpacing: '0.3px',
              fontWeight: 500,
              color: 'var(--nyl-purple-700)',
              whiteSpace: 'nowrap',
              cursor: action.onClick ? 'pointer' : 'default',
              textAlign: 'left',
            }}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}
