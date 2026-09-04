import type { Meta, StoryObj } from '@storybook/react'
import { PlanDot } from './PlanDot'
import type { PlanDotState } from './PlanDot'

export default {
  title: 'UI / PlanDot',
  component: PlanDot,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    state: { control: 'radio', options: ['done', 'active', 'pending'] },
  },
  args: { state: 'active' },
} satisfies Meta<typeof PlanDot>

type Story = StoryObj<typeof PlanDot>

export const Playground: Story = {}

export const AllStates: Story = {
  name: 'All States',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-8">
      {(['done', 'active', 'pending'] as PlanDotState[]).map((state) => (
        <div key={state} className="flex flex-col items-center gap-2">
          <PlanDot state={state} />
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-400">{state}</span>
        </div>
      ))}
    </div>
  ),
}

export const StepList: Story = {
  name: 'Step List',
  parameters: { controls: { disable: true } },
  render: () => {
    const steps: { label: string; state: PlanDotState }[] = [
      { label: 'Review policy details', state: 'done' },
      { label: 'Schedule follow-up call', state: 'done' },
      { label: 'Send proposal email', state: 'active' },
      { label: 'Confirm coverage needs', state: 'pending' },
      { label: 'Process application', state: 'pending' },
    ]
    return (
      <ul className="flex flex-col gap-2.5">
        {steps.map(({ label, state }) => (
          <li key={label} className="flex items-start gap-2.5">
            <PlanDot state={state} />
            <span
              className="text-[14px] leading-snug"
              style={{
                color: state === 'done' ? '#94a3b8' : state === 'active' ? '#0f172a' : '#64748b',
                textDecoration: state === 'done' ? 'line-through' : 'none',
              }}
            >
              {label}
            </span>
          </li>
        ))}
      </ul>
    )
  },
}
