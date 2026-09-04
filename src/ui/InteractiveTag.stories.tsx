import type { Meta, StoryObj } from '@storybook/react'
import { InteractiveTag } from './InteractiveTag'

export default {
  title: 'UI / InteractiveTag',
  component: InteractiveTag,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof InteractiveTag>

type Story = StoryObj<typeof InteractiveTag>

export const Selected: Story = {
  args: { label: 'Poor lead quality lately', selected: true },
}

export const Unselected: Story = {
  args: { label: 'Poor lead quality lately', selected: false },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
      <InteractiveTag label="Poor lead quality lately" selected={true} />
      <InteractiveTag label="Market volatility" selected={true} />
      <InteractiveTag label="Client retention" selected={false} />
      <InteractiveTag label="Poor lead quality lately" selected={false} />
      <InteractiveTag label="Prospecting cadence" selected={true} />
    </div>
  ),
}
