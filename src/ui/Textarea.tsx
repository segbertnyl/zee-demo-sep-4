import { useRef } from 'react'
import { InteractiveTag } from './InteractiveTag'

const CHAR_DELAY = 16

export interface TextareaProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  tags?: string[]
  chipSentences?: Record<string, string>
  onMicClick?: () => void
  rows?: number
  className?: string
  minHeight?: number
}

export function Textarea({
  value = '',
  onChange,
  placeholder,
  tags,
  chipSentences,
  onMicClick,
  rows = 4,
  className,
  minHeight,
}: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleTagClick(tag: string) {
    if (typingRef.current) clearTimeout(typingRef.current)

    const sentence = chipSentences?.[tag] ?? tag
    const base = value.trimEnd()
    const separator = base ? ' ' : ''
    const fullTarget = base + separator + sentence
    let charIndex = (base + separator).length

    function typeNext() {
      if (charIndex <= fullTarget.length) {
        onChange?.(fullTarget.slice(0, charIndex))
        charIndex++
        typingRef.current = setTimeout(typeNext, CHAR_DELAY)
      } else {
        textareaRef.current?.focus()
        const len = fullTarget.length
        textareaRef.current?.setSelectionRange(len, len)
      }
    }
    typeNext()
  }

  return (
    <div
      className={className}
      style={{
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '4px',
        width: '100%',
      }}
    >
      {/* Top section — textarea */}
      <div style={{ padding: 'var(--space-24)' }}>
        <textarea
          ref={textareaRef}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          rows={rows}
          className="text-input-text"
          style={{
            display: 'block',
            width: '100%',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            fontWeight: 400,
            color: 'var(--text-body)',
            resize: 'none',
            minHeight,
          }}
        />
      </div>

      {/* Bottom row — tags + mic */}
      {((tags && tags.length > 0) || onMicClick !== undefined) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 24px',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', flex: 1 }}>
            {tags?.map((tag) => (
              <InteractiveTag
                key={tag}
                label={tag}
                selected={false}
                variant="purple"
                onClick={chipSentences ? () => handleTagClick(tag) : () => {}}
              />
            ))}
          </div>
          {onMicClick !== undefined && (
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
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 0,
                flexShrink: 0,
              }}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect
                  x="13.75"
                  y="8.5"
                  width="4.5"
                  height="8.5"
                  rx="2.25"
                  stroke="var(--action-primary)"
                  strokeWidth="1.5"
                />
                <path
                  d="M22 13.75V14.75C22 18.0637 19.3137 20.75 16 20.75C12.6863 20.75 10 18.0637 10 14.75V13.75"
                  stroke="var(--action-primary)"
                  strokeWidth="1.5"
                />
                <path d="M16 20.75V24.75" stroke="var(--action-primary)" strokeWidth="1.5" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
