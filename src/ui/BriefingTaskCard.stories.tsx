import { useEffect, useState, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { BriefingTaskCard, type CardState } from './BriefingTaskCard'
import {
  SANDRA_TASK, LAURA_TASK, SANDRA_FOLLOWUP_SUGGESTED,
} from '@/data/briefingV6Content'
import { NYLA } from '@/motion'

/* 🆕 NEW (briefing-v6) — the v6 task card, every state in isolation. */

export default {
  title: 'UI / BriefingTaskCard  🆕',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta

type Story = StoryObj

const frame = (node: ReactNode) => <div className="max-w-[732px]">{node}</div>

export const Default: Story = {
  name: 'Default (hover reveals “Mark as done”)',
  render: () => frame(<BriefingTaskCard model={SANDRA_TASK} state="default" />),
}

export const Focus: Story = {
  name: 'Focus / hover',
  render: () => frame(<BriefingTaskCard model={SANDRA_TASK} state="focus" />),
}

export const ExpandedDraft: Story = {
  name: 'Expanded — call draft preview',
  render: () => frame(<BriefingTaskCard model={SANDRA_TASK} state="focus" expanded />),
}

export const Opportunity: Story = {
  name: 'Opportunity tone',
  render: () => frame(<BriefingTaskCard model={LAURA_TASK} state="focus" />),
}

export const Done: Story = {
  name: 'Marked done',
  render: () => frame(<BriefingTaskCard model={SANDRA_TASK} state="done" />),
}

export const Failed: Story = {
  name: 'Agent action failed',
  render: () => frame(<BriefingTaskCard model={SANDRA_TASK} state="failed" />),
}

export const Suggesting: Story = {
  name: 'Nyla suggesting (glow + thinking border)',
  render: () => frame(<BriefingTaskCard model={SANDRA_FOLLOWUP_SUGGESTED} state="suggesting" expanded />),
}

export const SuggestingReduced: Story = {
  name: 'Nyla suggesting — reduced motion (static ring)',
  render: () => frame(<BriefingTaskCard model={SANDRA_FOLLOWUP_SUGGESTED} state="suggesting" expanded reducedMotion />),
}

export const Settled: Story = {
  name: 'Settled into focus card',
  render: () => frame(<BriefingTaskCard model={SANDRA_FOLLOWUP_SUGGESTED} state="settled" expanded />),
}

export const AllStates: Story = {
  name: 'All states',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex max-w-[732px] flex-col gap-4">
      <BriefingTaskCard model={SANDRA_TASK} state="focus" />
      <BriefingTaskCard model={SANDRA_TASK} state="focus" expanded />
      <BriefingTaskCard model={LAURA_TASK} state="default" />
      <BriefingTaskCard model={SANDRA_FOLLOWUP_SUGGESTED} state="suggesting" expanded />
      <BriefingTaskCard model={SANDRA_FOLLOWUP_SUGGESTED} state="settled" expanded />
      <BriefingTaskCard model={SANDRA_TASK} state="done" />
    </div>
  ),
}

/* The full motion sequence in isolation: enter → glow + thinking border →
 * ~2s hold → settle into focus card. Loops so it's reviewable. */
function Sequence() {
  const [state, setState] = useState<CardState>('suggesting')
  useEffect(() => {
    const settle = window.setTimeout(() => setState('settled'), NYLA.settle.holdMs)
    const loop = window.setTimeout(() => setState('suggesting'), NYLA.settle.holdMs + 3000)
    return () => { window.clearTimeout(settle); window.clearTimeout(loop) }
  }, [state])
  return frame(
    <div>
      <p className="mb-3 text-[12px] uppercase tracking-[0.14em] text-[var(--text-body-muted)]">
        State: {state}
      </p>
      <BriefingTaskCard model={SANDRA_FOLLOWUP_SUGGESTED} state={state} expanded />
    </div>,
  )
}

export const SuggestSequence: Story = {
  name: 'Motion — suggest → settle (loops)',
  parameters: { controls: { disable: true } },
  render: () => <Sequence />,
}
