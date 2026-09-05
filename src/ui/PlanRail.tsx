import { type ReactNode } from 'react'
import { motion } from 'motion/react'
import { EASE, DURATION } from '@/motion'

export interface PlanRailGoals {
  fycTarget: number | null
  councilLevel: string | null
  longTermTags: string[]
  progressAreas: string[]
  clientApproach: { existing?: string; new?: string }
}

export interface PlanRailProps {
  goals: PlanRailGoals
  businessDone: boolean
  clientsDone: boolean
}

const BUSINESS_SUMMARY: Record<string, string> = {
  eagle: 'Build toward Eagle and IAR qualification, with the next steps mapped for you.',
  broader: 'Move clients beyond protection into broader planning conversations.',
  referrals: 'Build a steady engine of qualified referrals from your book.',
  positioning: 'Position NYL as a full financial partner, not just insurance.',
  pipeline: 'Protect your prospecting time while staying on top of service.',
  holistic: 'Grow the holistic activity that compounds your compensation.',
}

export function PlanRail({ goals, businessDone, clientsDone }: PlanRailProps) {
  const pills = [
    ...new Set([
      ...(goals.fycTarget !== null ? ['FYC target'] : []),
      ...(goals.councilLevel
        ? [goals.councilLevel.includes('Council') ? goals.councilLevel : `${goals.councilLevel} Council`]
        : []),
      ...goals.longTermTags,
    ]),
  ]
  const businessSummary =
    BUSINESS_SUMMARY[goals.progressAreas[0]] ?? 'Focus your week on the work that grows your practice.'
  const clients = [goals.clientApproach.existing, goals.clientApproach.new].filter((c): c is string => Boolean(c))

  return (
    <>
      <h3 className="text-[14px] font-medium leading-tight tracking-[0.2px]" style={{ color: 'var(--nyl-blue-250)' }}>
        Building your plan
      </h3>

      <div className="flex flex-1 flex-col py-[100px]">
        {pills.length > 0 && (
          <PlanSection title="Long-term goals" divider={businessDone}>
            <div className="flex flex-col items-start gap-2">
              {pills.map((p) => (
                <span
                  key={p}
                  className="rounded-[6px] border py-[7px] pl-[13px] pr-[17px] text-[14px] font-medium capitalize leading-4"
                  style={{ borderColor: 'var(--nyl-purple-200)', color: 'var(--nyl-purple-050)' }}
                >
                  {p}
                </span>
              ))}
            </div>
          </PlanSection>
        )}

        {businessDone && (
          <PlanSection title="Your business" divider={clientsDone}>
            <p className="text-[14px] leading-[1.35] tracking-[0.3px]" style={{ color: 'var(--nyl-purple-050)' }}>
              {businessSummary}
            </p>
          </PlanSection>
        )}

        {clientsDone && clients.length > 0 && (
          <PlanSection title="Your clients" divider={false}>
            <div className="flex flex-col gap-2">
              {clients.map((c) => (
                <p
                  key={c}
                  className="text-[14px] leading-[1.35] tracking-[0.3px]"
                  style={{ color: 'var(--nyl-purple-050)' }}
                >
                  {c}
                </p>
              ))}
            </div>
          </PlanSection>
        )}
      </div>
    </>
  )
}

function PlanSection({ title, divider, children }: { title: string; divider: boolean; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.short, ease: EASE.settle }}
      className="flex w-full flex-col gap-6 py-10"
      style={divider ? { borderBottom: '1px solid var(--nyl-purple-500)' } : undefined}
    >
      <p className="text-[14px] font-medium leading-4 text-white">{title}</p>
      {children}
    </motion.div>
  )
}
