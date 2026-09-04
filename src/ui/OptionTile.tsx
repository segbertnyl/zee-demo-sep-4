export interface OptionTileOption {
  id: string
  title: string
  sub?: string
}

// ---------------------------------------------------------------------------
// OptionTile — single selectable card
// ---------------------------------------------------------------------------

export interface OptionTileProps {
  title: string
  sub?: string
  selected?: boolean
  /** compact = p-4, no min-height (Direction/SelectionGrid pattern)
   *  spacious = p-5, min-h-[140px] (ListPicker pattern) */
  size?: 'compact' | 'spacious'
  disabled?: boolean
  onChange?: (selected: boolean) => void
  className?: string
}

export function OptionTile({
  title,
  sub,
  selected = false,
  size = 'spacious',
  disabled = false,
  onChange,
  className,
}: OptionTileProps) {
  const padding = size === 'compact' ? 'p-4' : 'p-6'
  const titleClass = `text-[16px] leading-[22px] tracking-[0.3px] ${selected ? 'font-medium' : ''}`
  const subClass = 'text-[12px] leading-[18px] tracking-[0.2px]'

  return (
    <button
      type="button"
      onClick={() => !disabled && onChange?.(!selected)}
      disabled={disabled}
      aria-pressed={selected}
      className={[
        'option-tile flex flex-row items-start justify-between border rounded-[4px] text-left',
        padding,
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        className,
      ].filter(Boolean).join(' ')}
    >
      {/* Text — left side */}
      <div className="flex flex-col flex-1 min-w-0">
        <p className={`font-semibold ${titleClass}`}>
          {title}
        </p>
        {sub && (
          <p className={['option-tile-sub mt-1', subClass].join(' ')}>
            {sub}
          </p>
        )}
      </div>

      {/* Radio indicator — right side */}
      <span className="shrink-0 ml-3 mt-0.5">
        <RadioIcon checked={selected} disabled={disabled} />
      </span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// OptionTileGroup — controlled multi-select group
// ---------------------------------------------------------------------------

export interface OptionTileGroupProps {
  options: OptionTileOption[]
  value?: string[]
  onChange?: (value: string[]) => void
  max?: number
  cols?: 2 | 3
  size?: 'compact' | 'spacious'
  className?: string
}

export function OptionTileGroup({
  options,
  value = [],
  onChange,
  max,
  cols = 2,
  size = 'spacious',
  className,
}: OptionTileGroupProps) {
  function toggle(id: string) {
    if (!onChange) return
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id))
    } else {
      if (max && value.length >= max) return
      onChange([...value, id])
    }
  }

  const gridCols = cols === 3
    ? 'grid-cols-1 md:grid-cols-3'
    : 'grid-cols-1 md:grid-cols-2'

  return (
    <div className={className}>
      <div className={`grid gap-3 ${gridCols}`}>
        {options.map((o) => (
          <OptionTile
            key={o.id}
            title={o.title}
            sub={o.sub}
            selected={value.includes(o.id)}
            size={size}
            disabled={!value.includes(o.id) && !!max && value.length >= max}
            onChange={() => toggle(o.id)}
          />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

function RadioIcon({ checked }: { checked: boolean; disabled: boolean }) {
  if (checked) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="8" fill="var(--action-primary, #0468ff)" />
        <path d="M4.5 8.5L6.5 10.5L11 5.5" style={{ stroke: 'var(--action-on-primary)' }} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="7.25" fill="none" stroke="var(--border-default)" strokeWidth="1.5" />
    </svg>
  )
}
