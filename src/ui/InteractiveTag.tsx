export interface InteractiveTagProps {
  label: string
  selected?: boolean
  onClick?: () => void
  className?: string
  variant?: 'default' | 'purple'
}

export function InteractiveTag({
  label,
  selected = true,
  onClick,
  className,
  variant = 'default',
}: InteractiveTagProps) {
  const borderColor = variant === 'purple' ? 'var(--nyl-purple-100)' : 'var(--border-default, #c3bfbb)'
  const textColor =
    variant === 'purple' ? 'var(--nyl-purple-700)' : selected ? 'var(--nyl-blue-700)' : 'var(--text-body)'

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '12px 16px',
        borderRadius: '16px 16px 4px 16px',
        border: selected && variant === 'default' ? 'none' : `1px solid ${borderColor}`,
        background: selected && variant === 'default' ? 'var(--nyl-blue-050)' : 'var(--bg-surface-elevated)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--size-sm-01)',
        fontWeight: 'var(--weight-semibold)' as unknown as number,
        lineHeight: 'var(--line-sm-01)',
        color: textColor,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}
