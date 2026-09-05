import { AnimatePresence, motion } from 'motion/react'
import { NYLLogo } from '@/ui/NYLLogo'
import { EASE } from '@/motion'

export type StageId = 'background' | 'goals' | 'practice' | 'brand'

export const STAGES: { id: StageId; label: string; sub: string }[] = [
  { id: 'background', label: 'History', sub: '' },
  { id: 'goals', label: 'Goals', sub: '' },
  { id: 'practice', label: 'Practice', sub: '' },
  { id: 'brand', label: 'Brand', sub: '' },
]

export const PLAN_SUB_STEPS = ['What I heard', 'Pacing', 'Summary'] as const
export type PlanSubStep = 0 | 1 | 2 | 3 // 0 = loading (no active sub), 1–3 = sub-items

/* Intro animation timing — edit these to tune the build-in sequence.
 * introDelay: seconds before children start animating (default matches
 * OnboardingFlow's create-plan choreography). Pass introDelay={0} for
 * contexts where the rail is already mounted (e.g. Discovery flow). */
const DEFAULT_INTRO_DELAY = 2.85
const STAGGER = 0.16
const ITEM_DURATION = 0.4

export interface StageRailProps {
  stageIndex: number
  reached: boolean[]
  onSelect: (id: StageId) => void
  planSubStep?: PlanSubStep
  onPrev?: () => void
  onNext?: () => void
  prevDisabled?: boolean
  nextDisabled?: boolean
  introDelay?: number
  dark?: boolean
}

const AAY_STAGES: { id: StageId; label: string }[] = [
  { id: 'background', label: 'History' },
  { id: 'goals', label: 'Goals' },
  { id: 'practice', label: 'Practice' },
  { id: 'brand', label: 'Brand' },
]

const PLAN_STAGE_INDEX = 4

/* Shared step row — identical visual treatment for both AAY and YOUR PLAN. */
function StepRow({
  label,
  active,
  showConnector,
  onClick,
  dark = false,
}: {
  label: string
  active: boolean
  showConnector: boolean
  onClick?: () => void
  dark?: boolean
}) {
  // #80baff = global/blue/blue-250 — no NYL token equivalent; design system gap
  const dotColor = dark ? (active ? 'white' : '#80baff') : active ? 'var(--action-primary)' : 'var(--nyl-gray-250)'
  const connectorColor = dark ? '#80baff' : 'var(--nyl-gray-250)'
  const textColor = dark ? (active ? 'white' : '#dcd9d5') : active ? 'var(--action-primary)' : 'var(--nyl-gray-500)'

  return (
    <div className="flex w-full items-start gap-[8px]">
      <div className="flex w-[12px] shrink-0 flex-col items-center">
        <span className="mt-[6px] shrink-0 rounded-full" style={{ width: 8, height: 8, background: dotColor }} />
        {showConnector && (
          <span className="mt-[6px] w-[2px] flex-1" style={{ background: connectorColor, minHeight: 12 }} />
        )}
      </div>
      <button
        type="button"
        disabled={!onClick}
        onClick={onClick}
        className="min-w-0 flex-1 text-left text-[14px] leading-[20px] tracking-[0.2px] disabled:cursor-default"
        style={{ color: textColor, fontWeight: active && dark ? 500 : undefined }}
      >
        {label}
      </button>
    </div>
  )
}

/* ── Nav arrows — Figma 926:9262 ── */
function NavArrows({
  onPrev,
  onNext,
  prevDisabled,
  nextDisabled,
  dark = false,
}: {
  onPrev?: () => void
  onNext?: () => void
  prevDisabled?: boolean
  nextDisabled?: boolean
  dark?: boolean
}) {
  const borderColor = dark ? 'white' : 'var(--action-primary)'
  const strokeColor = dark ? 'white' : 'var(--action-primary)'
  const hoverBg = dark ? 'rgba(255,255,255,0.1)' : 'var(--nyl-blue-050)'
  return (
    <div className="flex gap-[8px]">
      <button
        type="button"
        onClick={onPrev}
        disabled={prevDisabled}
        className="flex size-[40px] items-center justify-center rounded-[8px] border-[1.5px] transition-opacity"
        style={{ opacity: prevDisabled ? 0.4 : 1, borderColor, background: 'transparent' }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.background = hoverBg
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
        }}
        aria-label="Previous"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M2 7 L7 2 L12 7" />
          <path d="M7 2 V12" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="flex size-[40px] items-center justify-center rounded-[8px] border-[1.5px] transition-opacity"
        style={{ opacity: nextDisabled ? 0.4 : 1, borderColor, background: 'transparent' }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.background = hoverBg
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
        }}
        aria-label="Next"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M2 7 L7 12 L12 7" />
          <path d="M7 12 V2" />
        </svg>
      </button>
    </div>
  )
}

export function StageRail({
  stageIndex,
  reached,
  onSelect,
  planSubStep,
  onPrev,
  onNext,
  prevDisabled,
  nextDisabled,
  introDelay = DEFAULT_INTRO_DELAY,
  dark = false,
}: StageRailProps) {
  const inPlan = stageIndex === PLAN_STAGE_INDEX
  const aayActive = !inPlan && stageIndex >= 0

  // #808299 = approx global/neutral/500 in dark — no NYL token equivalent; design system gap
  const aayLabelColor = dark ? '#808299' : aayActive ? 'var(--action-primary)' : 'var(--nyl-gray-300)'
  const planLabelColor = dark ? 'white' : inPlan ? 'var(--nyl-blue-800)' : 'var(--nyl-gray-500)'
  const dividerColor = dark ? 'rgba(255,255,255,0.15)' : 'var(--nyl-gray-250)'

  return (
    <motion.div
      className="flex flex-col items-start justify-between"
      style={{ width: 156, height: '100%' }}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { delayChildren: introDelay, staggerChildren: STAGGER } } }}
    >
      <div className="flex w-full flex-col gap-[80px]">
        {/* Logo */}
        <motion.div
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: ITEM_DURATION } } }}
        >
          <NYLLogo pixelSize={40} className="rounded-md" />
        </motion.div>

        {/* Progress steps — gap-[16px] between AAY group, divider, and YOUR PLAN group */}
        <motion.div
          className="flex w-full flex-col gap-[16px] px-[8px]"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: ITEM_DURATION } } }}
        >
          {/* ALL ABOUT YOU group */}
          <div className="flex flex-col">
            <p
              className="w-full pb-[8px] text-[12px] font-medium uppercase leading-[26px] tracking-[2px]"
              style={{ color: aayLabelColor }}
            >
              ALL ABOUT YOU
            </p>
            {aayActive && (
              <div className="flex flex-col gap-[8px]">
                {AAY_STAGES.map((s, i) => {
                  const ri = STAGES.findIndex((st) => st.id === s.id)
                  const isActive = ri === stageIndex
                  const isClickable = reached[ri] && !isActive
                  const isLast = i === AAY_STAGES.length - 1
                  return (
                    <StepRow
                      key={s.id}
                      label={s.label}
                      active={isActive}
                      showConnector={!isLast}
                      onClick={isClickable ? () => onSelect(s.id) : undefined}
                      dark={dark}
                    />
                  )
                })}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px w-full" style={{ background: dividerColor }} />

          {/* YOUR PLAN group */}
          <div className="flex flex-col gap-[8px]">
            <p
              className="w-full pb-[8px] text-[12px] font-medium uppercase leading-[26px] tracking-[2px]"
              style={{ color: planLabelColor }}
            >
              YOUR PLAN
            </p>

            {inPlan && planSubStep != null && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: EASE.settle }}
                  className="flex w-full flex-col"
                >
                  {PLAN_SUB_STEPS.map((label, i) => (
                    <StepRow
                      key={label}
                      label={label}
                      active={planSubStep === i + 1}
                      showConnector={i < PLAN_SUB_STEPS.length - 1}
                      dark={dark}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>

      {/* Nav arrows */}
      {(onPrev || onNext) && (
        <NavArrows
          onPrev={onPrev}
          onNext={onNext}
          prevDisabled={prevDisabled}
          nextDisabled={nextDisabled}
          dark={dark}
        />
      )}
    </motion.div>
  )
}
