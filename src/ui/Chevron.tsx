export interface ChevronProps {
  expanded: boolean
}

export function Chevron({ expanded }: ChevronProps) {
  return (
    <span
      aria-hidden="true"
      className={['text-[var(--text-body-muted)] transition-transform', expanded ? 'rotate-180' : ''].join(' ')}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 6 L8 11 L13 6" />
      </svg>
    </span>
  )
}
