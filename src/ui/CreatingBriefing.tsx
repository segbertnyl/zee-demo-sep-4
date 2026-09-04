import { motion } from 'motion/react'
import { DriftingBlobs } from '@/ui/OnboardingIntroOverlay'
import { Nyla } from '@/ui/Nyla'
import { TypewriterText } from '@/ui/TypewriterText'
import { EASE } from '@/motion'

export function CreatingBriefing() {
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, var(--nyl-purple-900) 0%, var(--nyl-purple-700) 50%, var(--nyl-purple-700) 100%)', color: 'white' }}
    >
      <DriftingBlobs />
      <div className="relative z-10 flex flex-col items-center px-8 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: EASE.settle }}
          className="mb-7"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
            style={{ filter: 'drop-shadow(0 0 24px rgba(128,186,255,0.6))' }}
          >
            <Nyla size={40} variant="on-dark" />
          </motion.div>
        </motion.div>
        <h1
          className="max-w-[18ch] font-serif text-[34px] leading-[1.12] tracking-tight md:text-[42px]"
          style={{ fontWeight: 400, fontFamily: 'var(--font-serif)', textWrap: 'balance' }}
        >
          <TypewriterText text="Building your plan." delayMs={200} perWordMs={170} duration={0.7} blur />
        </h1>
      </div>
    </div>
  )
}
