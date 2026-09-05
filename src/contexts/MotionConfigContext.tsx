import { createContext, useContext } from 'react'
import { EASE, DURATION, DEFAULT_EASE, DEFAULT_DURATION } from '@/motion'
import type { EaseName, DurationName, EaseCurve } from '@/motion'

export interface MotionConfig {
  enabled: boolean
  easeName: EaseName
  durationName: DurationName
  /** Resolved ease array — ready to pass to a motion transition. */
  ease: EaseCurve
  /** Resolved duration in seconds — ready to pass to a motion transition. */
  duration: number
  /** Pre-built transition object. Use: `<motion.div transition={motion.transition}>` */
  transition: { ease: EaseCurve; duration: number } | { duration: 0 }
}

const defaultConfig: MotionConfig = {
  enabled: true,
  easeName: DEFAULT_EASE,
  durationName: DEFAULT_DURATION,
  ease: EASE[DEFAULT_EASE],
  duration: DURATION[DEFAULT_DURATION],
  transition: { ease: EASE[DEFAULT_EASE], duration: DURATION[DEFAULT_DURATION] },
}

export const MotionConfigContext = createContext<MotionConfig>(defaultConfig)

export function useMotionConfig(): MotionConfig {
  return useContext(MotionConfigContext)
}

export function buildMotionConfig(enabled: boolean, easeName: EaseName, durationName: DurationName): MotionConfig {
  const ease = EASE[easeName]
  const duration = DURATION[durationName]
  return {
    enabled,
    easeName,
    durationName,
    ease,
    duration,
    transition: enabled ? { ease, duration } : { duration: 0 },
  }
}
