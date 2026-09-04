import type { Meta, StoryObj } from '@storybook/react'
import { BadgePill } from './BadgePill'

export default {
  title: 'UI / BadgePill',
  component: BadgePill,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof BadgePill>

type Story = StoryObj<typeof BadgePill>

export const Urgent: Story = {
  args: { tone: 'urgent', label: 'Urgent' },
}

export const Monitor: Story = {
  args: { tone: 'monitor', label: 'Monitor' },
}

export const Opportunity: Story = {
  args: { tone: 'opportunity', label: 'Opportunity' },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <BadgePill tone="urgent" label="Urgent" />
      <BadgePill tone="monitor" label="Monitor" />
      <BadgePill tone="opportunity" label="Opportunity" />
    </div>
  ),
}
