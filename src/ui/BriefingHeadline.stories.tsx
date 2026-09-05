import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { BriefingHeadline } from './BriefingHeadline'
import { HEADLINES, INITIAL_TASKS } from '@/data/briefingV6Content'

/* 🆕 NEW (briefing-v6) — Coach-voice headline with a slow blur-to-sharp typing
 * reveal. The headline is state-driven: opening, per-task focus/done lines, and
 * the "new task" line. Cycle through them below to see the re-type. */

export default {
  title: 'UI / BriefingHeadline  🆕',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta

type Story = StoryObj

export const Opening: Story = {
  render: () => (
    <div className="max-w-[460px]">
      <BriefingHeadline text={HEADLINES.opening} />
    </div>
  ),
}

export const ReducedMotion: Story = {
  name: 'Reduced motion (no typing/blur)',
  render: () => (
    <div className="max-w-[460px]">
      <BriefingHeadline text={HEADLINES.opening} reducedMotion />
    </div>
  ),
}

/* Cycle through the headline states (opening → each task's focus/done → new task). */
function Cycler() {
  const lines = [
    HEADLINES.opening,
    ...INITIAL_TASKS.flatMap((t) => [t.focusHeadline, t.doneHeadline].filter(Boolean) as string[]),
    HEADLINES.newTask,
  ]
  const [i, setI] = useState(0)
  return (
    <div className="max-w-[460px]">
      <BriefingHeadline text={lines[i]} />
      <button
        type="button"
        onClick={() => setI((n) => (n + 1) % lines.length)}
        className="mt-6 rounded-full bg-[var(--action-primary)] px-3 py-1 text-[12px] text-white"
      >
        Next headline ({i + 1}/{lines.length})
      </button>
    </div>
  )
}

export const States: Story = {
  name: 'Headline states (cycle)',
  parameters: { controls: { disable: true } },
  render: () => <Cycler />,
}
