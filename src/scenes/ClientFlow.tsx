import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useAppStore } from '@/state/useAppStore'
import { Nyla } from '@/ui/Nyla'
import { NYLLogo } from '@/ui/NYLLogo'
import { ClientLoadingBackground } from '@/ui/ClientLoadingBackground'
import { ClientSplashBackground } from '@/ui/ClientSplashBackground'
import { SectionHeader } from '@/ui/SectionHeader'
import { TextInput } from '@/ui/TextInput'
import { ButtonContainer } from '@/ui/ButtonContainer'
import { Button } from '@/ui/Button'
import { DURATION, EASE } from '@/motion'
import { CLIENT_FLOW_CONTENT } from '@/data/clientFlowContent'

/* ============================================================================
 * Client flow — placeholder onboarding wizard for a single client (Eric).
 * Fully separate from the advisor Discovery flow: its own store flags, its own
 * local step state, no shared indices. Skeleton only, per FE-REFINEMENTS-style
 * scaffolding — content + visuals to be filled in next pass.
 *
 *   0 client-loading  — loader (copy of Brand's "Pulling it all together...")
 *   1 client-intro    — splash (copy of Discovery's "Hi, Sarah..." intro)
 *   2 client-salary   — single input: yearly salary
 *   3 client-address  — single input: full address
 *   4 client-image    — image placeholder where the input would be
 * ========================================================================== */

type ClientStep = 'client-intro' | 'client-loading' | 'client-salary' | 'client-address' | 'client-image'
const CLIENT_STEPS: ClientStep[] = ['client-loading', 'client-intro', 'client-salary', 'client-address', 'client-image']

const QUESTION_STEPS: ClientStep[] = ['client-salary', 'client-address', 'client-image']

/* client-loading's text/Nyla/CTA sequence — cycles on its own timer, but the
 * "Get started" button (shown from line 2 onward) can jump to client-intro
 * at any point without waiting for the sequence to finish. */
type LoadingLine = { text: string; showNyla: boolean; showButton: boolean }
const LOADING_LINES: LoadingLine[] = [
  { text: 'You want an AI powered plan', showNyla: false, showButton: false },
  { text: 'I can help with that.', showNyla: true, showButton: false },
  { text: "Let's start your financial planning journey", showNyla: true, showButton: true },
  { text: 'With secure tools and capabilities that are personalized', showNyla: true, showButton: true },
  { text: 'And designed to help you solidify your goals.', showNyla: true, showButton: true },
  { text: 'To achieve your growth & ambitions', showNyla: true, showButton: true },
  { text: 'Click below to get started', showNyla: true, showButton: true },
]
const LOADING_LINE_HOLD_MS = [1500, 3000, 3000, 3000, 3000, 3000, 3000]
/* Slower, more deliberate crossfade than the DURATION scale's default beats —
 * this is the exact "slow dissolve" case DURATION.cinematic is documented for. */
const LOADING_LINE_CROSSFADE = DURATION.cinematic
/* Fixed offsets from the (never-moving) text's center line, so Nyla/the CTA
 * appearing or disappearing can never push the text around. */
const LOADING_NYLA_OFFSET = 24
const LOADING_CTA_OFFSET = 64

function ClientLoadingSequence({ onGetStarted }: { onGetStarted: () => void }) {
  const [lineIndex, setLineIndex] = useState(0)

  useEffect(() => {
    if (lineIndex >= LOADING_LINES.length - 1) return
    const t = window.setTimeout(() => setLineIndex((i) => i + 1), LOADING_LINE_HOLD_MS[lineIndex])
    return () => window.clearTimeout(t)
  }, [lineIndex])

  const line = LOADING_LINES[lineIndex]

  return (
    <div className="relative z-10" style={{ width: '100%', height: 420 }}>
      {/* Nyla — absolutely positioned above the text's fixed center line. */}
      <div style={{ position: 'absolute', left: '50%', bottom: `calc(50% + ${LOADING_NYLA_OFFSET}px)`, transform: 'translateX(-50%)' }}>
        <AnimatePresence>
          {line.showNyla && (
            <motion.div
              key="client-loading-nyla"
              initial={{ opacity: 0,  }}
              animate={{ opacity: 1,  }}
              exit={{ opacity: 0,  }}
              transition={{ duration: DURATION.cinematic, ease: EASE.settle as [number, number, number, number] }}
            >
              <Nyla size={160} variant="on-dark" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Text — always dead-center, never shifts regardless of Nyla/CTA visibility. */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          maxHeight: 48,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={lineIndex}
            className="whitespace-nowrap text-center font-serif text-[42px] tracking-normal"
            style={{ color: 'var(--nyl-white)' }}
            initial={lineIndex === 0 ? false : { opacity: 0.5, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: LOADING_LINE_CROSSFADE, ease: EASE.settle as [number, number, number, number] }}
          >
            {line.text}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* CTA — absolutely positioned below the text's fixed center line.
       * width: max-content so the absolutely-positioned wrapper always shrinks
       * to the button's natural size instead of stretching and wrapping the label. */}
      <div style={{ position: 'absolute', left: '50%', top: `calc(50% + ${LOADING_CTA_OFFSET}px)`, width: 'max-content', transform: 'translateX(-50%)' }}>
        <AnimatePresence>
          {line.showButton && (
            <motion.div
              key="client-loading-cta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.cinematic, ease: EASE.settle as [number, number, number, number] }}
            >
              <Button variant="primary" theme="dark" onClick={onGetStarted} className="whitespace-nowrap">
                Get started
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function ClientQuestionRail({ onPrev, onNext, prevDisabled, nextDisabled }: { onPrev: () => void; onNext: () => void; prevDisabled: boolean; nextDisabled: boolean }) {
  return (
    <div className="fixed left-0 top-0 z-30 flex h-full w-[272px] flex-col justify-between px-2 py-10 pl-10">
      <div className="flex w-full flex-col gap-[80px]">
        <NYLLogo pixelSize={40} className="rounded-md" />

        <div className="flex w-full flex-col gap-[16px] px-[8px]">
          <div className="flex flex-col gap-[12px]">
            <p
              className="w-full text-[14px] text-[#001e94] font-medium uppercase leading-[26px] tracking-[2px]"
            >
              ALL ABOUT YOU
            </p>
            <div className="flex w-full items-start gap-[8px]">
              <span className="mt-[6px] size-2 shrink-0 rounded-full" style={{ background: 'var(--action-primary)' }} />
              <span className="min-w-0 flex-1 text-[14px] leading-[20px] tracking-[0.2px] text-[#0468FF]" >
                Your background
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-[8px]">
        <button
          type="button"
          onClick={onPrev}
          disabled={prevDisabled}
          className="flex size-[40px] items-center justify-center rounded-[8px] border-[1.5px] transition-opacity"
          style={{ opacity: prevDisabled ? 0.4 : 1, borderColor: '#001E94', background: 'transparent' }}
          aria-label="Previous"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#001E94" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 7 L7 2 L12 7" />
            <path d="M7 2 V12" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="flex size-[40px] items-center justify-center rounded-[8px] border-[1.5px] transition-opacity"
          style={{ opacity: nextDisabled ? 0.4 : 1, borderColor: '#001E94', background: 'transparent' }}
          aria-label="Next"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#001E94" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 7 L7 12 L12 7" />
            <path d="M7 12 V2" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export function ClientFlow() {
  const open = useAppStore((s) => s.clientFlowOpen)
  const closeClientFlow = useAppStore((s) => s.closeClientFlow)
  const openClientBriefing = useAppStore((s) => s.openClientBriefing)

  const [stepIndex, setStepIndex] = useState(0)
  const step = CLIENT_STEPS[stepIndex]
  const [salary, setSalary] = useState('')
  const [address, setAddress] = useState('')
  const [collapsedUpTo, setCollapsedUpTo] = useState(-1)

  useEffect(() => {
    if (open) {
      setStepIndex(0)
      setCollapsedUpTo(-1)
    }
  }, [open])

  function advance() {
    setStepIndex((i) => Math.min(i + 1, CLIENT_STEPS.length - 1))
  }

  function goBack() {
    setStepIndex((i) => Math.max(0, i - 1))
  }

  const isQuestionStep = step === 'client-salary' || step === 'client-address' || step === 'client-image'
  const questionIndex = QUESTION_STEPS.indexOf(step)
  const lastQuestionIndex = QUESTION_STEPS.length - 1
  const questionCtaShown = !isQuestionStep || questionIndex > collapsedUpTo

  function advanceQuestion() {
    setCollapsedUpTo((prev) => Math.max(prev, questionIndex))
    advance()
  }

  function handleFinish() {
    closeClientFlow()
    openClientBriefing()
  }

  function finishQuestion() {
    setCollapsedUpTo((prev) => Math.max(prev, questionIndex))
    handleFinish()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="client-flow"
          role="dialog"
          aria-label="Client flow"
          className="overlay-bleed z-[170] flex flex-col items-center justify-center bg-[var(--bg-canvas)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.short }}
        >
          {step === 'client-loading' && (
            <ClientLoadingBackground style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
          )}
          {step !== 'client-loading' && (
            <ClientSplashBackground style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
          )}

          {isQuestionStep && (
            <ClientQuestionRail
              onPrev={goBack}
              onNext={advance}
              prevDisabled={questionIndex === 0}
              nextDisabled={questionIndex >= Math.min(collapsedUpTo + 1, lastQuestionIndex)}
            />
          )}

          <AnimatePresence mode="wait">
            {step === 'client-intro' && (
              <motion.div
                key="client-intro"
                className="relative z-10 mx-auto w-full max-w-[620px] px-6"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.deliberate, ease: EASE.settle as [number, number, number, number] }}
              >
                <Nyla size={160} variant="on-light" align="left" />
                <h1
                  className="mt-6 font-serif text-[var(--nyl-blue-800)]"
                  style={{ fontSize: 'var(--size-display-01)', lineHeight: 'var(--line-display-01)', letterSpacing: 0 }}
                >
                  {CLIENT_FLOW_CONTENT.intro.headline}
                </h1>
                <p className="mt-6 text-[16px] text-[var(--text-body)]">{CLIENT_FLOW_CONTENT.intro.body1}</p>
                <p className="mt-2 text-[16px] text-[var(--text-headline)]">{CLIENT_FLOW_CONTENT.intro.body2}</p>
                <ButtonContainer primaryLabel={CLIENT_FLOW_CONTENT.intro.cta} showSecondary={false} onPrimary={advance} className="mt-8" />
              </motion.div>
            )}

            {step === 'client-loading' && (
              <motion.div
                key="client-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.deliberate, ease: EASE.settle as [number, number, number, number] }}
              >
                <ClientLoadingSequence onGetStarted={advance} />
              </motion.div>
            )}

            {step === 'client-salary' && (
              <>
              <motion.div
                key="client-salary"
                className="relative z-10 mx-auto w-full max-w-[620px] px-6"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.deliberate, ease: EASE.settle as [number, number, number, number] }}
              >
                <SectionHeader variant="secondary" heading={CLIENT_FLOW_CONTENT.salary.heading} body={CLIENT_FLOW_CONTENT.salary.body} />
                <TextInput
                  variant="numeric"
                  value={salary}
                  onChange={setSalary}
                  placeholder={CLIENT_FLOW_CONTENT.salary.placeholder}
                  className="mt-8"
                />
                {questionCtaShown && <ButtonContainer secondaryVariant="secondary" showClientSecondary={true} showSecondary={false} onPrimary={advanceQuestion} onSecondary={advanceQuestion} className="mt-6" />}

              </motion.div>
                <Nyla size={160} variant="on-light" align="left" className="absolute bottom-0 right-0"/>
</>
            )}

            {step === 'client-address' && (
              <>
              <motion.div
                key="client-address"
                className="relative z-10 mx-auto w-full max-w-[620px] px-6"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.deliberate, ease: EASE.settle as [number, number, number, number] }}
              >
                <SectionHeader variant="secondary" heading={CLIENT_FLOW_CONTENT.address.heading} body={CLIENT_FLOW_CONTENT.address.body} />
                <TextInput
                  variant="text"
                  value={address}
                  onChange={setAddress}
                  placeholder={CLIENT_FLOW_CONTENT.address.placeholder}
                  className="mt-8"
                />
                {questionCtaShown && <ButtonContainer secondaryVariant="secondary" showClientSecondary={true} showSecondary={false} onPrimary={advanceQuestion} onSecondary={advanceQuestion} className="mt-6" />}
              </motion.div>
                <Nyla size={160} variant="on-light" align="left" className="absolute bottom-0 right-0"/>
</>
            )}

            {step === 'client-image' && (
              <>
              <motion.div
                key="client-image"
                className="relative z-10 mx-auto w-full max-w-[620px] px-6"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.deliberate, ease: EASE.settle as [number, number, number, number] }}
              >
                <SectionHeader variant="secondary" heading={CLIENT_FLOW_CONTENT.image.heading} body={CLIENT_FLOW_CONTENT.image.body} />
                <div
                  className="mt-8 flex items-center justify-center rounded-[4px] border border-dashed"
                  style={{ height: 220, borderColor: 'var(--border-subtle)', color: 'var(--text-body-faint)' }}
                >
                  {CLIENT_FLOW_CONTENT.image.imagePlaceholderLabel}
                </div>
                {questionCtaShown && <ButtonContainer secondaryVariant="secondary" showClientSecondary={true} showSecondary={false} onPrimary={finishQuestion} onSecondary={finishQuestion} className="mt-6" />}
              </motion.div>
                <Nyla size={160} variant="on-light" align="left" className="absolute bottom-0 right-0"/>

              </>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
