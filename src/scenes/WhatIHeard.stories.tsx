import type { Meta, StoryObj } from '@storybook/react'
import { WhatIHeard } from './WhatIHeard'

export default {
  title: 'Scenes / WhatIHeard',
  component: WhatIHeard,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WhatIHeard>

type Story = StoryObj<typeof WhatIHeard>

// "Here's what I heard…" — the plan-reveal step. Hover a row to expand it;
// it stays open for 300ms after the cursor leaves. The CTA is pinned bottom-right.
export const Playground: Story = {
  args: {
    onContinue: () => {},
  },
}
