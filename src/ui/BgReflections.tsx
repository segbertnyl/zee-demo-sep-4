import type React from 'react'
import { motion, useReducedMotion } from 'motion/react'
import bgPurple from '@/assets/reflections/bg-purple.png'
import bgBlue from '@/assets/reflections/bg-blue.png'
import bgGreen from '@/assets/reflections/bg-green.png'
import bgOrange from '@/assets/reflections/bg-orange.png'

export type BgReflectionsVariant = 'purple' | 'blue' | 'green' | 'orange'

const BG: Record<BgReflectionsVariant, string> = {
  purple: bgPurple,
  blue: bgBlue,
  green: bgGreen,
  orange: bgOrange,
}

// Spotlight blob configs: color, size, and drift keyframes for x/y (as % of container)
// Two blobs per variant drift independently to create parallax life.
const BLOBS: Record<
  BgReflectionsVariant,
  Array<{
    color: string
    size: string
    x: string[]
    y: string[]
    duration: number
  }>
> = {
  purple: [
    {
      color: 'rgba(190, 130, 255, 0.28)',
      size: '70%',
      x: ['55%', '68%', '52%', '60%', '55%'],
      y: ['25%', '18%', '38%', '22%', '25%'],
      duration: 30,
    },
    {
      color: 'rgba(120,  70, 210, 0.22)',
      size: '50%',
      x: ['25%', '18%', '35%', '28%', '25%'],
      y: ['65%', '75%', '58%', '70%', '65%'],
      duration: 42,
    },
  ],
  blue: [
    {
      color: 'rgba( 80, 160, 255, 0.28)',
      size: '70%',
      x: ['45%', '58%', '38%', '50%', '45%'],
      y: ['30%', '20%', '42%', '28%', '30%'],
      duration: 32,
    },
    {
      color: 'rgba(  0,  80, 200, 0.22)',
      size: '50%',
      x: ['70%', '62%', '78%', '68%', '70%'],
      y: ['70%', '80%', '62%', '72%', '70%'],
      duration: 45,
    },
  ],
  green: [
    {
      color: 'rgba( 60, 210, 155, 0.28)',
      size: '65%',
      x: ['60%', '70%', '52%', '64%', '60%'],
      y: ['35%', '25%', '48%', '30%', '35%'],
      duration: 28,
    },
    {
      color: 'rgba(  5, 120,  90, 0.22)',
      size: '45%',
      x: ['20%', '30%', '15%', '25%', '20%'],
      y: ['60%', '70%', '55%', '65%', '60%'],
      duration: 38,
    },
  ],
  orange: [
    {
      color: 'rgba(255, 180,  60, 0.28)',
      size: '65%',
      x: ['50%', '62%', '42%', '55%', '50%'],
      y: ['30%', '20%', '42%', '26%', '30%'],
      duration: 34,
    },
    {
      color: 'rgba(220, 100,  20, 0.20)',
      size: '45%',
      x: ['30%', '20%', '38%', '25%', '30%'],
      y: ['68%', '78%', '60%', '72%', '68%'],
      duration: 46,
    },
  ],
}

function Blob({
  color,
  size,
  x,
  y,
  duration,
  reduced,
}: {
  color: string
  size: string
  x: string[]
  y: string[]
  duration: number
  reduced: boolean
}) {
  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color} 0%, transparent 100%)`,
        filter: 'blur(80px)',
        translateX: '-50%',
        translateY: '-50%',
        left: x[0],
        top: y[0],
        pointerEvents: 'none',
        // Ensure blob extends beyond edges without clipping
        mixBlendMode: 'screen',
      }}
      animate={reduced ? {} : { left: x, top: y }}
      transition={
        reduced
          ? {}
          : {
              duration,
              ease: 'linear',
              repeat: Infinity,
              // Use the keyframe array as a smooth loop by ending on the same value it started
            }
      }
    />
  )
}

export function BgReflections({
  variant = 'purple',
  className,
  style,
}: {
  variant?: BgReflectionsVariant
  className?: string
  style?: React.CSSProperties
}) {
  const reduced = useReducedMotion() ?? false

  return (
    <div className={className ?? 'relative w-full h-full'} style={{ overflow: 'hidden', ...style }} aria-hidden="true">
      <img
        src={BG[variant]}
        alt=""
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scale(1.3)',
          transformOrigin: 'center',
        }}
      />
      {BLOBS[variant].map((blob, i) => (
        <Blob key={i} {...blob} reduced={reduced} />
      ))}
    </div>
  )
}
