import type { Meta, StoryObj } from '@storybook/react'
import { ProgressBar } from './ProgressBar'
import type { ProgressBarTone } from './ProgressBar'

export default {
  title: 'UI / ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    tone: { control: 'radio', options: ['good', 'warn', 'neutral'] },
    value: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
    label: { control: 'text' },
  },
  args: { value: 0.72, tone: 'good' },
} satisfies Meta<typeof ProgressBar>

type Story = StoryObj<typeof ProgressBar>

export const Playground: Story = {}

export const AllTones: Story = {
  name: 'All Tones',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-8 w-64">
      {([
        { tone: 'good', value: 0.78 },
        { tone: 'warn', value: 0.43 },
        { tone: 'neutral', value: 0.55 },
      ] as { tone: ProgressBarTone; value: number }[]).map(({ tone, value }) => (
        <div key={tone}>
          <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-400">{tone}</p>
          <ProgressBar value={value} tone={tone} />
        </div>
      ))}
    </div>
  ),
}

export const WithLabels: Story = {
  name: 'With Labels',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-8 w-64">
      <ProgressBar value={0.82} tone="good" label="Propensity score" />
      <ProgressBar value={0.38} tone="warn" label="Engagement score" />
      <ProgressBar value={0.61} tone="neutral" label="FYC attainment" />
    </div>
  ),
}

export const VariousPercentages: Story = {
  name: 'Various Percentages',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6 w-64">
      {[0.05, 0.25, 0.5, 0.75, 0.95, 1.0].map((v) => (
        <ProgressBar key={v} value={v} tone="good" label={`${Math.round(v * 100)}% complete`} />
      ))}
    </div>
  ),
}

export const CardContext: Story = {
  name: 'Card Context',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-72 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-[13px] font-semibold text-neutral-800">Sarah Chen</p>
      <p className="mb-1 text-[12px] text-neutral-500">Policy #88-4421-C · Term Life</p>
      <ProgressBar value={0.84} tone="good" label="Propensity" />
      <ProgressBar value={0.41} tone="warn" label="Engagement" />
      <ProgressBar value={0.6} tone="neutral" label="FYC" />
    </div>
  ),
}
