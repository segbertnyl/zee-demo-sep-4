import type { Meta, StoryObj } from '@storybook/react'
import { StatusPill } from './StatusPill'

export default {
  title: 'UI / StatusPill',
  component: StatusPill,
  parameters: { layout: 'padded' },
  argTypes: {
    status: { control: 'radio', options: ['on-track', 'stretch', 'off-track'] },
  },
} satisfies Meta<typeof StatusPill>

type Story = StoryObj<typeof StatusPill>

export const OnTrack: Story = {
  args: { status: 'on-track' },
}

export const Stretch: Story = {
  args: { status: 'stretch' },
}

export const OffTrack: Story = {
  args: { status: 'off-track' },
}

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <StatusPill status="on-track" />
      <StatusPill status="stretch" />
      <StatusPill status="off-track" />
    </div>
  ),
}
