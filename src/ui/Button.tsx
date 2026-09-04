import { forwardRef } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'outlined' | 'icon'
export type ButtonTheme = 'default' | 'dark'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  theme?: ButtonTheme
  noArrow?: boolean
}

/* Base Tailwind classes — layout, shape, focus ring, transition.
 * Hover/active/disabled color states live in globals.css (.btn-* selectors)
 * so CSS pseudo-classes apply reliably without Tailwind class-detection issues. */
const BASE =
  'inline-flex items-center justify-center gap-2 rounded font-sans text-[16px] font-semibold leading-6 tracking-[0.3px] transition-colors duration-[180ms] cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed'

const FOCUS_RING: Record<ButtonTheme, string> = {
  default: 'focus-visible:ring-[var(--action-primary-hover)]',
  dark: 'focus-visible:ring-white',
}

const VARIANT_CLASS: Record<ButtonVariant, Record<ButtonTheme, string>> = {
  primary:   { default: 'btn-primary',        dark: 'btn-primary-dark' },
  secondary: { default: 'btn-secondary',      dark: 'btn-secondary-dark' },
  text:      { default: 'btn-text group',     dark: 'btn-text-dark group' },
  // No dark variant for outlined/icon yet — btn-outlined uses brand-blue
  // which is sufficient on light backgrounds; add btn-outlined-dark if needed.
  outlined:  { default: 'btn-outlined',       dark: 'btn-outlined' },
  icon:      { default: 'btn-icon',           dark: 'btn-icon' },
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', theme = 'default', noArrow = false, className, children, ...props }, ref) => {
    const cls = [BASE, FOCUS_RING[theme], VARIANT_CLASS[variant][theme], className]
      .filter(Boolean)
      .join(' ')
    return (
      <button ref={ref} type="button" className={cls} {...props}>
        {children}
        {variant === 'text' && !noArrow && <ArrowIcon />}
      </button>
    )
  }
)
Button.displayName = 'Button'

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="10"
      viewBox="0 0 20 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="translate-x-0 transition-transform duration-[180ms] group-hover:translate-x-1 group-active:translate-x-0.5"
    >
      <path d="M1 6h18M13 1l6 5-6 5" />
    </svg>
  )
}
