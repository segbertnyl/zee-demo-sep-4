import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { useAppStore } from '@/state/useAppStore'
// import { hasCompletedOnboarding } from '@/scenes/OnboardingFlow'
import { NYLLogo } from '@/ui/NYLLogo'
import { DriftingBlobs, HighlightBlob } from '@/ui/OnboardingIntroOverlay'
import { EASE, DURATION } from '@/motion'
import bgIntroOverlay from '@/assets/bg-intro-overlay.png'

type Card = {
  label: string
  description: string
  quickLinks?: Array<{ label: string; action: () => void }>
  action: () => void
}

export function LandingChooser() {
  const open = useAppStore((s) => s.landingChoiceOpen)
  const dismiss = useAppStore((s) => s.dismissLanding)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // const openOnboarding = useAppStore((s) => s.openOnboarding)
  const openYearInReview = useAppStore((s) => s.openYearInReview)
  const openDiscovery = useAppStore((s) => s.openDiscovery)
  const openDiscoveryAt = useAppStore((s) => s.openDiscoveryAt)
  const openBriefingV6 = useAppStore((s) => s.openBriefingV6)
  const openClientFlow = useAppStore((s) => s.openClientFlow)
  const openClientBrief = useAppStore((s) => s.openClientBriefing)
  // const completed = hasCompletedOnboarding()

  // function pickOnboarding() {
  //   dismiss()
  //   openOnboarding(completed ? 'reorg' : 'first-run')
  // }

  function placeholder() {
    console.log('nothing')
  }

  const cards: Card[] = [
    {
      label: 'First-time agent onboarding',
      description: 'Set your goals, shape how your OS works, and see your first plan come together.',
      quickLinks: [
        { label: 'Discovery', action: () => openDiscovery() },
        { label: 'Plan reveal', action: () => openDiscoveryAt('plan') },
      ],
      action: placeholder,
    },
    {
      label: 'First-time client onboarding',
      description: 'Set your goals, shape how your OS works, and see your first plan come together.',
      quickLinks: [
        { label: 'Discovery', action: () => openClientFlow() },
        { label: 'Dashboard', action: () => openClientBrief() },
      ],
      action: placeholder,
    },
    {
      label: 'The briefing',
      description:
        'Nyla prepares everything you need to hit the ground running. Priorities ranked, meetings prepped, nothing missed.',
      action: () => openBriefingV6(),
    },
    {
      label: 'Year in review',
      description:
        'Reflect on what you accomplished, where you leveled against your goals, and what to carry into next year.',
      action: () => {
        dismiss()
        openYearInReview()
      },
    },
  ]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="landing-chooser"
          role="dialog"
          aria-label="2026 Design Standards"
          className="overlay-bleed z-[180] overflow-hidden"
          style={{ background: 'var(--bg-overlay-dark)' }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: DURATION.quick, delay: DURATION.short } }}
          transition={{ duration: DURATION['scene-in'] }}
        >
          <img
            src={bgIntroOverlay}
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
          <HighlightBlob />
          <DriftingBlobs />

          {/* Huge + NYL lockup — top left (prototype menu only) */}
          <div className="absolute left-7 top-7 z-10 flex items-center gap-2">
            <NYLLogo pixelSize={56} className="rounded-md" />
          </div>

          {/* Split layout */}
          <div className="relative z-10 flex h-full w-full items-center px-16 gap-16">
            {/* Left — heading + keyboard hint */}
            <motion.div
              className="flex flex-1 flex-col justify-center gap-10"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE.settle }}
            >
              <div>
                <p
                  className="mb-5"
                  style={{
                    color: '#FFF',
                    fontFamily: 'var(--Font-family-font-family-roboto, Roboto)',
                    fontSize: 'var(--Font-size-Heading-title-extra-small, 14px)',
                    fontStyle: 'normal',
                    fontWeight: 'var(--Font-weight-font-weight-medium, 500)',
                    lineHeight: 'var(--Line-height-Heading-line-height-title-small, 26px)',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                  }}
                >
                  2026 Design Standards
                </p>
                <h1
                  className="text-white"
                  style={{
                    fontFamily: 'var(--Font-family-font-family-alverata, Alverata)',
                    fontSize: '120px',
                    fontWeight: 'var(--Font-weight-font-weight-light, 300)',
                    fontStyle: 'normal',
                    lineHeight: '99%',
                    letterSpacing: '-1.5px',
                    fontFeatureSettings: '"liga" 1, "dlig" 1, "calt" 1',
                  }}
                >
                  Prototype
                  <br />
                  menu
                </h1>
              </div>

              {/* Keyboard hint — below heading */}
              <p
                className="flex items-center gap-2"
                style={{
                  color: 'rgba(255,255,255,0.45)',
                  fontFamily: 'var(--Font-family-font-family-roboto, Roboto)',
                  fontSize: 'var(--Font-size-Body-body-small, 16px)',
                  fontStyle: 'normal',
                  fontWeight: 'var(--Font-weight-font-weight-regular, 400)',
                  lineHeight: 'var(--line-height-body-links-line-height-body-small, 24px)',
                  letterSpacing: '0.2px',
                }}
              >
                Press
                <kbd
                  className="inline-flex items-center rounded px-2 py-1 font-mono text-[18px]"
                  style={{
                    border: '1px solid rgba(255,255,255,0.30)',
                    background: 'rgba(255,255,255,0.10)',
                    color: 'rgba(255,255,255,0.60)',
                  }}
                >
                  M
                </kbd>
                from anywhere to return to this menu.
              </p>
            </motion.div>

            {/* Right — cards */}
            <div className="flex w-[480px] shrink-0 flex-col gap-3">
              {cards.map((card, i) => (
                <motion.div
                  key={card.label}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('[data-quicklinks]')) return
                    card.action()
                  }}
                  // onKeyDown={(e) => {
                  //   if (e.key === 'Enter' || e.key === ' ') card.action()
                  // }}
                  className="group w-full cursor-pointer rounded-2xl text-left transition-shadow"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    padding: '32px',
                    background: '#ffffff',
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{
                    opacity: hoveredIndex !== null && hoveredIndex !== i ? 0.5 : 1,
                    y: 0,
                    boxShadow: hoveredIndex === i ? '0 4px 16px rgba(0,0,0,0.14)' : '0 1px 3px rgba(0,0,0,0.08)',
                  }}
                  transition={{
                    opacity: { duration: 0.2, ease: 'easeOut' },
                    y: { duration: 0.45, delay: 0.08 + i * 0.07, ease: EASE.settle },
                    boxShadow: { duration: 0.2, ease: 'easeOut' },
                  }}
                >
                  <div className="flex items-center justify-between" style={{ gap: '40px' }}>
                    <div className="flex-1 min-w-0">
                      <p
                        style={{
                          color: 'var(--Text-header-text-primary, #000533)',
                          fontFamily: 'var(--Font-family-font-family-alverata, Alverata)',
                          fontSize: 'var(--Font-size-Heading-title-small, 20px)',
                          fontStyle: 'normal',
                          fontWeight: 'var(--Font-weight-font-weight-medium, 500)',
                          lineHeight: 'var(--Line-height-Heading-line-height-title-small, 26px)',
                        }}
                      >
                        {card.label}
                      </p>
                      <p
                        className="mt-3"
                        style={{
                          color: 'var(--Text-text-secondary, #474952)',
                          fontFamily: 'var(--Font-family-font-family-roboto, Roboto)',
                          fontSize: 'var(--Font-size-Body-body-small, 16px)',
                          fontStyle: 'normal',
                          fontWeight: 'var(--Font-weight-font-weight-regular, 400)',
                          lineHeight: 'var(--line-height-body-links-line-height-body-small, 24px)',
                          letterSpacing: '0.2px',
                        }}
                      >
                        {card.description}
                      </p>
                      {card.quickLinks && (
                        <div
                          className="flex items-center gap-1"
                          style={{
                            marginTop: '24px',
                            color: 'var(--Text-text-secondary, #474952)',
                            fontFamily: 'var(--Font-family-font-family-roboto, Roboto)',
                            fontSize: 'var(--Font-size-Body-body-small, 16px)',
                            fontStyle: 'normal',
                            fontWeight: 'var(--Font-weight-font-weight-regular, 400)',
                            lineHeight: 'var(--line-height-body-links-line-height-body-small, 24px)',
                            letterSpacing: '0.2px',
                          }}
                          data-quicklinks
                        >
                          <span>Quick links:</span>
                          {card.quickLinks.map((ql, qi) => (
                            <span key={ql.label} className="flex items-center gap-1">
                              {qi > 0 && <span style={{ color: 'var(--text-body-faint)' }}>|</span>}
                              <button
                                type="button"
                                onClick={ql.action}
                                className="cursor-pointer transition-colors hover:underline hover:underline-offset-2"
                                style={{
                                  color: 'var(--Text-link-primary, #04C)',
                                  fontFamily: 'var(--Font-family-font-family-roboto, Roboto)',
                                  fontSize: 'var(--Font-size-Links-cta-small, 16px)',
                                  fontStyle: 'normal',
                                  fontWeight: 'var(--Font-weight-font-weight-semibold, 600)',
                                  lineHeight: 'var(--line-height-body-links-line-height-body-small, 24px)',
                                  letterSpacing: '0.3px',
                                }}
                              >
                                {ql.label}
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="shrink-0 transition-transform group-hover:translate-x-2">
                      <svg width="25" height="12" viewBox="0 0 25 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M20.5239 6.94431L17.0966 10.388C16.7296 10.7567 16.7296 11.3546 17.0966 11.7234C17.4636 12.0922 18.0587 12.0922 18.4257 11.7234L24.1221 6L18.4257 0.276583C18.0587 -0.0921956 17.4636 -0.0921957 17.0966 0.276583C16.7296 0.645361 16.7296 1.24327 17.0966 1.61205L20.5239 5.05568L1.06192 5.05568C0.542856 5.05568 0.122072 5.47847 0.122072 6C0.122072 6.52153 0.542856 6.94431 1.06192 6.94431L20.5239 6.94431Z"
                          fill="#0044CC"
                        />
                      </svg>
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
