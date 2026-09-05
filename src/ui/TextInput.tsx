export interface TextInputProps {
  value?: string
  placeholder?: string
  onChange?: (value: string) => void
  onMicClick?: () => void
  /** numeric: 24px medium — for dollar amounts and quantitative values (default)
   *  text: 16px regular — for free-text strings; placeholder rendered italic + muted */
  variant?: 'numeric' | 'text'
  className?: string
}

export function TextInput({
  value = '',
  placeholder,
  onChange,
  onMicClick,
  variant = 'numeric',
  className,
}: TextInputProps) {
  const isText = variant === 'text'
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '66px',
        padding: '0 24px',
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '4px',
      }}
    >
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className={isText ? 'text-input-text' : undefined}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontFamily: 'var(--font-sans)',
          fontSize: isText ? '16px' : 'var(--size-lg-01)',
          fontWeight: isText ? 400 : ('var(--weight-medium)' as unknown as number),
          lineHeight: '18px',
          letterSpacing: '0.2px',
          color: 'var(--text-body)',
        }}
      />
      <button
        type="button"
        onClick={onMicClick}
        aria-label="Voice input"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          padding: 0,
          flexShrink: 0,
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect x="13.75" y="8.5" width="4.5" height="8.5" rx="2.25" stroke="var(--action-primary)" strokeWidth="1.5" />
          <path
            d="M22 13.75V14.75C22 18.0637 19.3137 20.75 16 20.75C12.6863 20.75 10 18.0637 10 14.75V13.75"
            stroke="var(--action-primary)"
            strokeWidth="1.5"
          />
          <path d="M16 20.75V24.75" stroke="var(--action-primary)" strokeWidth="1.5" />
        </svg>
      </button>
    </div>
  )
}
