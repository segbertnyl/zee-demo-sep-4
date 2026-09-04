import type { Meta, StoryObj } from '@storybook/react'
import { DiscoveryTransition } from './DiscoveryTransition'

export default {
  title: 'UI / Discovery / Transition',
  component: DiscoveryTransition,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    advisorName: { control: 'text' },
    phase: { control: 'radio', options: ['intro', 'reveal', 'settled'] },
  },
} satisfies Meta<typeof DiscoveryTransition>

type Story = StoryObj<typeof DiscoveryTransition>

export const Intro: Story = {
  args: { phase: 'intro', advisorName: 'Sarah' },
}

export const Reveal: Story = {
  args: { phase: 'reveal', advisorName: 'Sarah' },
}

export const Settled: Story = {
  args: { phase: 'settled', advisorName: 'Sarah' },
}
