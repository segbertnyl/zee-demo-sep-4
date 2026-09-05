import type React from 'react'
import bgGeneral from '@/assets/bg-general.png'

export function GeneralBackground({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={className}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...style }}
      aria-hidden="true"
    >
      <img src={bgGeneral} alt="" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  )
}
