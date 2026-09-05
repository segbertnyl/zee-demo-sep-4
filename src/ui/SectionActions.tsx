import { Button } from '@/ui/Button'
import type { ButtonTheme } from '@/ui/Button'

export type SectionActionVariant = 'primary' | 'secondary' | 'ghost'

export type SectionAction = {
  label: string
  variant?: SectionActionVariant
  onClick?: () => void
  disabled?: boolean
}

export interface SectionActionsProps {
  actions: SectionAction[]
  theme?: ButtonTheme
}

const VARIANT_MAP = {
  primary: 'primary',
  secondary: 'secondary',
  ghost: 'text',
} as const satisfies Record<SectionActionVariant, ButtonTheme extends never ? never : 'primary' | 'secondary' | 'text'>

export function SectionActions({ actions, theme = 'default' }: SectionActionsProps) {
  /* Primary always lands on the right — sort non-primary first, preserve relative order */
  const sorted = [...actions].sort((a, b) => {
    const aP = a.variant === 'primary' ? 1 : 0
    const bP = b.variant === 'primary' ? 1 : 0
    return aP - bP
  })

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {sorted.map(({ label, variant = 'secondary', onClick, disabled }) => (
        <Button key={label} variant={VARIANT_MAP[variant]} theme={theme} onClick={onClick} disabled={disabled}>
          {label}
        </Button>
      ))}
    </div>
  )
}
