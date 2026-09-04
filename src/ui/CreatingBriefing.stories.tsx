import type { Meta, StoryObj } from '@storybook/react'
import { CreatingBriefing } from './CreatingBriefing'

export default {
  title: 'UI / CreatingBriefing',
  component: CreatingBriefing,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { disable: true },
  },
} satisfies Meta<typeof CreatingBriefing>

type Story = StoryObj<typeof CreatingBriefing>

export const Default: Story = {
  render: () => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <CreatingBriefing />
    </div>
  ),
}
