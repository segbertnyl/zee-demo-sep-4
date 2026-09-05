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
          'radial-gradient(ellipse 60% 60% at 100% 100%, oklch(0.86 0.09 262) 0%, oklch(0.95 0.03 262) 40%, oklch(0.99 0.003 262) 65%, transparent 90%)',
        ...style,
      }}
      aria-hidden="true"
    />
  )
}
