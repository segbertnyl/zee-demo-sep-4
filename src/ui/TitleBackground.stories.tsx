import type { Meta, StoryObj } from '@storybook/react'
import { TitleBackground } from './TitleBackground'

export default {
  title: 'UI / Backgrounds / Title',
  parameters: {
    layout: 'fullscreen',
    backgrounds: { disable: true },
  },
} satisfies Meta

type Story = StoryObj

export const Default: Story = {
  render: () => (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <TitleBackground />
    </div>
  ),
}
