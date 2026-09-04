import type { Meta, StoryObj } from '@storybook/react'
import { PacingStep } from './PacingStep'

export default {
  title: 'Scenes / PacingStep',
  component: PacingStep,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PacingStep>

type Story = StoryObj<typeof PacingStep>

// "Your FYC goal is within reach" — the question before Pacing.
// Hover any data pill to open its chart flyout.
export const Playground: Story = {
  args: {
    fyc: '47,000',
    onContinue: () => {},
    onAdjust: () => {},
  },
}
