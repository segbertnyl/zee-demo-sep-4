import type { Meta, StoryObj } from '@storybook/react'
import { NylaAffirmation } from './NylaAffirmation'

export default {
  title: 'UI / NylaAffirmation',
  component: NylaAffirmation,
  parameters: { layout: 'fullscreen' },
  args: {
    onComplete: () => {},
    duration: 99999,  // disabled in Storybook so screen stays visible
  },
} satisfies Meta<typeof NylaAffirmation>

type Story = StoryObj<typeof NylaAffirmation>

export const FYCTarget: Story = {
  args: {
    headline: 'Pulling in your FYC goals...',
    description: '$47,000 is a great target',
  },
}

export const GoalsConfirmation: Story = {
  args: {
    headline: 'Pulling in your goals...',
    description: "I'll track and align to your 6 goals",
  },
}

export const PacingConfirmation: Story = {
  args: {
    description: "Let's put everything together into your plan...",
  },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <NylaAffirmation
          headline="Pulling in your FYC goals..."
          description="$47,000 is a great target"
          duration={99999}
          onComplete={() => {}}
        />
      </div>
    </div>
  ),
}
