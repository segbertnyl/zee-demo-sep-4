import type React from 'react'

export function ClientSplashBackground({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#ffffff',
        backgroundImage:
          'radial-gradient(ellipse 80% 60% at 100% 100%, oklch(0.86 0.06 240) 0%, oklch(0.96 0.02 240) 40%, oklch(0.99 0.003 240) 65%, transparent 80%)',
        ...style,
      }}
      aria-hidden="true"
    />
  )
}
