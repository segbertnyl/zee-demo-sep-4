import type React from 'react'
import bgLoading from '@/assets/bg-loading.png'

export function LoadingBackground({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={className}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...style }}
      aria-hidden="true"
    >
      <img src={bgLoading} alt="" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  )
}
