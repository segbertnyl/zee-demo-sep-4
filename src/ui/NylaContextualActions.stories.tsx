import type { Meta, StoryObj } from '@storybook/react'
import { NylaContextualActions } from './NylaContextualActions'

export default {
  title: 'UI / NylaContextualActions',
  component: NylaContextualActions,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof NylaContextualActions>

type Story = StoryObj<typeof NylaContextualActions>

export const Default: Story = {
  name: 'Default (2 actions)',
  args: {
    actions: [{ label: 'How did you get this' }, { label: 'Make a change' }],
  },
}

export const Max: Story = {
  name: 'Max (5 actions)',
  args: {
    actions: [
      { label: 'How did you get this' },
      { label: 'Make a change' },
      { label: 'Show alternatives' },
      { label: 'Learn more' },
      { label: 'Dismiss' },
    ],
  },
}
