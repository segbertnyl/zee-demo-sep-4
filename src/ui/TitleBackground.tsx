import { DriftingBlobs } from './OnboardingIntroOverlay'

export function TitleBackground({ className }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, var(--nyl-purple-900) 0%, var(--nyl-purple-600) 39%, var(--nyl-purple-500) 56%, var(--nyl-purple-400) 71%)',
      }}
      aria-hidden="true"
    >
      <DriftingBlobs />
    </div>
  )
}
