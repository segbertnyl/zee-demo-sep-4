import { Button } from './Button'

export interface ButtonContainerProps {
  primaryLabel?: string
  onPrimary?: () => void
  primaryDisabled?: boolean
  secondaryLabel?: string
  onSecondary?: () => void
  secondaryVariant?: 'text' | 'secondary'
  showSecondary?: boolean
  className?: string
}

export function ButtonContainer({
  primaryLabel = 'Next',
  onPrimary,
  primaryDisabled = false,
  secondaryLabel = 'Skip',
  onSecondary,
  secondaryVariant = 'text',
  showSecondary = true,
  className,
}: ButtonContainerProps) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-24)', paddingBlock: 16, width: '100%' }}
      className={className}
    >
      {showSecondary && (
        <Button
          variant={secondaryVariant === 'text' ? 'text' : 'secondary'}
          noArrow={secondaryVariant === 'text'}
          onClick={onSecondary}
        >
          {secondaryLabel}
        </Button>
      )}
      <Button variant="primary" onClick={onPrimary} disabled={primaryDisabled}>
        {primaryLabel}
      </Button>
    </div>
  )
}
