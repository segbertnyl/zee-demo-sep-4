import type React from 'react'
import planReveal from '@/assets/nyla-bkg-planreveal.jpg'
import planPage from '@/assets/nyla-bkg-planpage.jpg'

// Purple bokeh backgrounds. Committed locally so they never expire.
// - 'reveal' (default): tall portrait art for the Plan summary / plan-reveal moment.
// - 'page': wide landscape art for the persistent Plan page.
const BG = {
  reveal: planReveal,
  page: planPage,
} as const

export function PlanSummaryBackground({
  className,
  style,
  variant = 'reveal',
}: {
  className?: string
  style?: React.CSSProperties
  variant?: keyof typeof BG
}) {
  return (
    <div
      className={className}
      style={{
        ...style,
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: 'var(--nyl-purple-900)',
      }}
      aria-hidden="true"
    >
      <img
        src={BG[variant]}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'top center',
        }}
      />
    </div>
  )
}
