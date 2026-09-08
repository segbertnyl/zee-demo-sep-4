export interface TextInputProps {
  value?: string
  placeholder?: string
  onChange?: (value: string) => void
  onMicClick?: () => void
  /** No longer affects styling — value/placeholder text is always 16px/400/18px
   *  regardless of variant. Kept for callers' semantic intent. */
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
  void variant
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
        className="text-input-text"
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontFamily: 'var(--font-sans)',
          fontSize: '16px',
          fontWeight: 400,
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
