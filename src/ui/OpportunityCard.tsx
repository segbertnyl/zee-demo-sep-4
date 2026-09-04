import { useState } from 'react'
import { motion } from 'motion/react'
import { EASE, DURATION } from '@/motion'
import { PlanDot } from '@/ui/PlanDot'
import { ProgressBar } from '@/ui/ProgressBar'

export type BadgeTone = 'opportunity' | 'monitor'

export interface OpportunityBadge {
  label: string
  tone: BadgeTone
}

export interface OpportunityMetric {
  label: string
  value: number
  tone: 'good' | 'neutral' | 'warn'
}

export interface OpportunityPlanStep {
  label: string
  sub?: string
  cta: string
  promptId?: string
}

export interface OpportunityCardProps {
  id: string
  badges: OpportunityBadge[]
  confidence: number
  headline: string
  body: string
  metrics: OpportunityMetric[]
  fycEstimate: string
  plan: OpportunityPlanStep[]
  tip?: string
  index?: number
  onDeepDive?: (id: string) => void
  onPlanStepRun?: (stepIndex: number, step: OpportunityPlanStep) => void
  onClientClick?: () => void
}

function Badge({ label, tone }: OpportunityBadge) {
  return (
    <span
      className={[
        'rounded-full px-2.5 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.18em]',
        tone === 'opportunity'
          ? 'bg-[var(--nyl-blue-100)] text-[var(--nyl-blue-800)]'
          : 'bg-[var(--nyl-orange-100)] text-[var(--nyl-orange-500)]',
      ].join(' ')}
    >
      {label}
    </span>
  )
}

export function OpportunityCard({
  id,
  badges,
  confidence,
  headline,
  body,
  metrics,
  fycEstimate,
  plan,
  tip,
  index = 0,
  onDeepDive,
  onPlanStepRun,
  onClientClick,
}: OpportunityCardProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [snoozed, setSnoozed] = useState(false)

  const current = plan[activeStep]

  function runStep(stepIndex: number) {
    const step = plan[stepIndex]
    if (!step) return
    if (stepIndex === activeStep) {
      setActiveStep((n) => Math.min(n + 1, plan.length - 1))
    }
    onPlanStepRun?.(stepIndex, step)
  }

  if (snoozed) {
    return (
      <motion.div
        initial={{ height: 'auto', opacity: 1 }}
        animate={{ height: 56, opacity: 0.6 }}
        className="overflow-hidden rounded-2xl border border-dashed border-[var(--border-subtle)] bg-white/50 px-6 py-3 text-[12.5px] text-[var(--text-body-muted)]"
      >
        Snoozed · I'll surface this again tomorrow.{' '}
        <button
          type="button"
          onClick={() => setSnoozed(false)}
          className="text-[var(--nyl-blue-500)] underline-offset-4 hover:underline"
        >
          Undo
        </button>
      </motion.div>
    )
  }

  const headlineWords = headline.split(' ')
  const clientNamePart = headlineWords.slice(0, 2).join(' ')
  const restPart = headlineWords.slice(2).join(' ')

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.standard, delay: 0.06 * index, ease: EASE.settle }}
      className="overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-30px_rgba(0,10,98,0.18)]"
    >
      <div className="grid grid-cols-12 gap-6 p-6 md:p-8">
        <div className="col-span-12 lg:col-span-7">
          <div className="flex flex-wrap items-center gap-2">
            {badges.map((b) => (
              <Badge key={b.label} {...b} />
            ))}
            <span className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-[var(--text-body-muted)]">
              {confidence}% confidence
            </span>
            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                onClick={() => onDeepDive?.(id)}
                className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--nyl-blue-500)] hover:text-[var(--nyl-blue-800)]"
              >
                Open canvas
                <span aria-hidden="true">↗</span>
              </button>
              <button
                type="button"
                onClick={() => setSnoozed(true)}
                className="text-[12px] font-medium text-[var(--text-body-muted)] hover:text-[var(--text-body)]"
              >
                Snooze
              </button>
            </div>
          </div>

          <h2
            className="mt-4 font-serif text-[22px] leading-[1.22] tracking-tight text-[var(--text-headline)] md:text-[24px]"
            style={{ fontWeight: 400, textWrap: 'balance' } as React.CSSProperties}
          >
            <button
              type="button"
              onClick={onClientClick}
              className="text-[var(--nyl-blue-500)] hover:underline"
            >
              {clientNamePart}
            </button>{' '}
            {restPart}
          </h2>

          <p className="mt-3 max-w-[58ch] text-[13.5px] leading-[1.55] text-[var(--text-body)]">
            {body}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-6 border-t border-[var(--border-subtle)] pt-5">
            {metrics.map((m) => (
              <div key={m.label}>
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--text-body-muted)]">
                  {m.label}
                </p>
                <ProgressBar value={m.value} tone={m.tone} />
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10.5px] font-medium uppercase tracking-[0.18em] text-[var(--nyl-blue-500)]">
            {fycEstimate}
          </p>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <div className="rounded-2xl bg-[var(--nyl-blue-100)]/35 p-5">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-[var(--nyl-blue-800)]">
              Plan
            </p>
            <ol className="mt-4 flex flex-col gap-3.5">
              {plan.map((p, i) => {
                const done = i < activeStep
                const active = i === activeStep
                return (
                  <li key={p.label}>
                    <button
                      type="button"
                      onClick={() => runStep(i)}
                      className="flex w-full items-start gap-3 text-left"
                    >
                      <PlanDot state={done ? 'done' : active ? 'active' : 'pending'} />
                      <span className="min-w-0">
                        <span
                          className={[
                            'block text-[13.5px] leading-snug',
                            done
                              ? 'text-[var(--text-body-muted)] line-through decoration-1'
                              : active
                                ? 'font-medium text-[var(--text-headline)]'
                                : 'text-[var(--text-body)]',
                          ].join(' ')}
                        >
                          {p.label}
                        </span>
                        {p.sub && (
                          <span
                            className={[
                              'mt-0.5 block text-[11.5px]',
                              done ? 'text-[var(--text-body-faint)]' : 'text-[var(--text-body-muted)]',
                            ].join(' ')}
                          >
                            {p.sub}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>

            <button
              type="button"
              onClick={() => runStep(activeStep)}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--nyl-blue-500)] px-4 py-3 text-[13px] font-semibold text-white hover:bg-[var(--nyl-blue-600)] disabled:opacity-60"
              disabled={!current}
            >
              {current?.cta ?? 'All steps complete'}
            </button>
          </div>
        </div>
      </div>

      {tip && (
        <p className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 px-6 py-3 text-[12px] italic text-[var(--text-body-muted)] md:px-8">
          {tip}
        </p>
      )}
    </motion.article>
  )
}
