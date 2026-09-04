import type { Meta, StoryObj } from '@storybook/react'
import { SectionEyebrow } from './SectionEyebrow'

export default {
  title: 'UI / SectionEyebrow',
  component: SectionEyebrow,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SectionEyebrow>

type Story = StoryObj<typeof SectionEyebrow>

export const Default: Story = {
  args: { eyebrow: 'Requires action before 10am' },
}

export const ClientSignals: Story = {
  args: { eyebrow: 'Client signals — today' },
}

export const NoDivider: Story = {
  args: { eyebrow: 'At a glance', divider: false },
}

export const AllVariants: Story = {
  render: () => (
    <div>
      <SectionEyebrow eyebrow="Requires action before 10am" />
      <SectionEyebrow eyebrow="Client signals — today" />
      <SectionEyebrow eyebrow="Where the month is compounding" />
      <SectionEyebrow eyebrow="At a glance" divider={false} />
    </div>
  ),
}
