import type React from 'react'

/* Copied from LoadingBackground.tsx and edited for the Client flow's loader —
 * kept as its own file so the Client flow stays 100% separate and this dark
 * gradient never leaks into the original loader's purple background. */

const GRADIENT =
  'linear-gradient(134deg, #00031B 0%, #0013B8 39.01%, #2333CC 55.58%, #3245F0 70.92%), #000957'

const PAGE_SHADOW =
  '0 100px 80px 0 rgba(0, 0, 0, 0.07), 0 41.778px 33.422px 0 rgba(0, 0, 0, 0.05), 0 22.336px 17.869px 0 rgba(0, 0, 0, 0.04), 0 12.522px 10.017px 0 rgba(0, 0, 0, 0.04), 0 6.65px 5.32px 0 rgba(0, 0, 0, 0.03), 0 2.767px 2.214px 0 rgba(0, 0, 0, 0.02)'

export function ClientLoadingBackground({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        border: '1px solid #E7E7E7',
        background: GRADIENT,
        boxShadow: PAGE_SHADOW,
        ...style,
      }}
      aria-hidden="true"
    />
  )
}
