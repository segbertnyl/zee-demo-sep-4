/**
 * PROTOTYPE — Welcome → Discovery transition variants
 * Throwaway. Delete or absorb after picking a variant.
 * Press T to open/close.
 *
 * A — Continuous purple: wipes right, discovery fades in
 * B — Vertical curtain: purple exits up, discovery rises from below
 * C — Star flash: star expands → white flash → discovery fades from white
 */

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { EASE, DURATION } from '@/motion'
import { TitleBackground } from '@/ui/TitleBackground'
import { NYLLogo } from '@/ui/NYLLogo'
import { Nyla } from '@/ui/Nyla'
import { DriftingBlobs } from '@/ui/OnboardingIntroOverlay'

type Variant = 'A' | 'B' | 'C'
type Phase = 'welcome' | 'transitioning' | 'discovery'

const PURPLE = 'linear-gradient(145deg, var(--nyl-purple-900) 0%, var(--nyl-purple-600) 39%, var(--nyl-purple-500) 56%, var(--nyl-purple-400) 71%)'
const EASE_WIPE = [0.7, 0, 0.2, 1] as const

// ─── Discovery card (destination — same for all variants) ────────────────────
function DiscoveryCard({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0">
      <TitleBackground />
      <div style={{ position: 'absolute', inset: 15, borderRadius: 16, background: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '56px 40px 0', flexShrink: 0 }}>
          <NYLLogo size="md" />
          <button type="button" onClick={onClose} style={{ fontSize: 18, color: 'var(--text-body-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 60px' }}>
          <Nyla size={40} />
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--size-display-01)', lineHeight: 'var(--line-display-01)', letterSpacing: '-0.3px', color: 'var(--nyl-blue-800)', marginTop: 24, marginBottom: 0 }}>
            Hi, Sarah. I'm Nyla. Together, we'll build a plan for your practice, your way.
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: 'var(--text-body)', marginTop: 24 }}>
            Every agent is different, and I want to hear what makes your style your own.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Variant A — Purple wipes right, discovery fades in behind it ─────────────
function VariantA({ phase, onClose }: { phase: Phase; onClose: () => void }) {
  return (
    <div className="absolute inset-0">
      {/* Discovery sits underneath — revealed as purple wipes away */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <DiscoveryCard onClose={onClose} />
      </div>

      {/* Purple wipes right */}
      <AnimatePresence>
        {phase !== 'discovery' && (
          <motion.div
            key="purple"
            className="absolute inset-0"
            style={{ background: PURPLE, zIndex: 2 }}
            animate={{ x: phase === 'transitioning' ? '100%' : 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.95, ease: EASE_WIPE }}
          >
            <DriftingBlobs />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Variant B — Purple exits up, discovery rises from below ──────────────────
function VariantB({ phase, onClose }: { phase: Phase; onClose: () => void }) {
  return (
    <div className="absolute inset-0">
      {/* Discovery rises from below */}
      <AnimatePresence>
        {(phase === 'transitioning' || phase === 'discovery') && (
          <motion.div
            key="discovery"
            className="absolute inset-0"
            style={{ zIndex: 1 }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.85, ease: EASE.settle as [number, number, number, number] }}
          >
            <DiscoveryCard onClose={onClose} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Purple exits upward */}
      <AnimatePresence>
        {phase !== 'discovery' && (
          <motion.div
            key="purple"
            className="absolute inset-0"
            style={{ background: PURPLE, zIndex: 2 }}
            animate={{ y: phase === 'transitioning' ? '-100%' : 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.85, ease: EASE_WIPE }}
          >
            <DriftingBlobs />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Variant C — Star expands, white flash, discovery fades in ────────────────
function VariantC({ phase, onClose }: { phase: Phase; onClose: () => void }) {
  return (
    <div className="absolute inset-0">
      {/* Discovery fades in after flash */}
      <AnimatePresence>
        {phase === 'discovery' && (
          <motion.div
            key="discovery"
            className="absolute inset-0"
            style={{ zIndex: 1 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DURATION['scene-in'], ease: EASE.settle as [number, number, number, number] }}
          >
            <DiscoveryCard onClose={onClose} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Purple base */}
      <AnimatePresence>
        {phase !== 'discovery' && (
          <motion.div
            key="purple"
            className="absolute inset-0"
            style={{ background: PURPLE, zIndex: 2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <DriftingBlobs />

            {/* Star expands on trigger */}
            {phase === 'transitioning' && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 3 }}>
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: 50, opacity: 0 }}
                  transition={{ duration: 0.7, ease: EASE.settle as [number, number, number, number] }}
                >
                  <Nyla size={40} />
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* White flash */}
      {phase === 'transitioning' && (
        <motion.div
          className="absolute inset-0"
          style={{ background: 'white', zIndex: 4, pointerEvents: 'none' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.6, delay: 0.45, times: [0, 0.4, 1] }}
        />
      )}
    </div>
  )
}

// ─── Shared welcome content (on top of all variants) ─────────────────────────
function WelcomeContent({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ pointerEvents: 'none' }}>
      <div className="absolute left-7 top-7" style={{ pointerEvents: 'auto' }}>
        <NYLLogo pixelSize={40} className="rounded-md" />
      </div>
      <div className="relative flex flex-col items-center gap-6 text-center px-16" style={{ pointerEvents: 'auto' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}>
          <Nyla size={40} />
        </motion.div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 42, fontWeight: 300, color: 'white', lineHeight: 1.15, letterSpacing: '-0.3px', maxWidth: 560, margin: 0 }}>
          A plan that frees you to focus on clients.
        </h1>
        <button
          type="button"
          onClick={onGetStarted}
          className="rounded-md bg-white px-8 py-3 text-[13.5px] font-semibold hover:bg-white/90 transition-colors"
          style={{ color: 'var(--nyl-blue-700)', cursor: 'pointer' }}
        >
          Get started
        </button>
      </div>
    </div>
  )
}

// ─── Main prototype shell ─────────────────────────────────────────────────────
export function WelcomeToDiscoveryProto({ onClose }: { onClose: () => void }) {
  const [variant, setVariant] = useState<Variant>('A')
  const [phase, setPhase] = useState<Phase>('welcome')

  const DELAYS: Record<Variant, number> = { A: 950, B: 850, C: 1300 }

  function trigger() {
    if (phase !== 'welcome') return
    setPhase('transitioning')
    setTimeout(() => setPhase('discovery'), DELAYS[variant])
  }

  function reset() {
    setPhase('welcome')
  }

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 170 }}>
      {/* Variant-specific layers (sit below welcome content) */}
      {variant === 'A' && <VariantA phase={phase} onClose={handleClose} />}
      {variant === 'B' && <VariantB phase={phase} onClose={handleClose} />}
      {variant === 'C' && <VariantC phase={phase} onClose={handleClose} />}

      {/* Welcome content — always on top, fades out when triggered */}
      <AnimatePresence>
        {phase === 'welcome' && (
          <motion.div
            key="welcome-content"
            className="absolute inset-0"
            style={{ zIndex: 10 }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <WelcomeContent onGetStarted={trigger} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating control bar */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-full px-5 py-2.5 shadow-lg"
        style={{ background: 'rgba(0,10,40,0.85)', backdropFilter: 'blur(12px)', zIndex: 200 }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>PROTO</span>
        {(['A', 'B', 'C'] as Variant[]).map(v => (
          <button
            key={v}
            type="button"
            onClick={() => { setVariant(v); reset() }}
            style={{
              fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600,
              padding: '4px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: variant === v ? 'var(--nyl-blue-500)' : 'transparent',
              color: variant === v ? 'white' : 'rgba(255,255,255,0.5)',
              transition: 'all 0.15s',
            }}
          >{v}</button>
        ))}
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)' }} />
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
          {{ A: 'Wipe right', B: 'Curtain up', C: 'Star flash' }[variant]}
        </span>
        {phase !== 'welcome' && (
          <button type="button" onClick={reset} style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--nyl-blue-250)', background: 'transparent', border: 'none', cursor: 'pointer', marginLeft: 4 }}>
            ↺ replay
          </button>
        )}
      </div>
    </div>
  )
}
