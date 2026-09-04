import type { Meta, StoryObj } from '@storybook/react'
import { PacingAdjust } from './PacingAdjust'

export default {
  title: 'Scenes / PacingAdjust',
  component: PacingAdjust,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PacingAdjust>

type Story = StoryObj<typeof PacingAdjust>

// Sliders start in range (all thumbs purple, "on track"). Drag a slider below
// the recommended range → grey thumb; past the recommended range → orange thumb.
export const Playground: Story = {
  args: {
    onSkip: () => {},
    onConfirm: () => {},
  },
}
