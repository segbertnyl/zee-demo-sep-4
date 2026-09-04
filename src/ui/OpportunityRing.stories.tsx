import type { Meta, StoryObj } from '@storybook/react'
import { OpportunityRing } from './OpportunityRing'

export default {
  title: 'UI / OpportunityRing',
  component: OpportunityRing,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof OpportunityRing>

type Story = StoryObj<typeof OpportunityRing>

export const Empty: Story = {
  name: '0%',
  args: {
    percentToGoal: 0,
    fycInPlayLabel: '$0 in FYC available today',
    fycToDateLabel: '$0 of $122,000',
    ringNudge: 'Nothing unlocked yet — check back later.',
  },
}

export const ThirdWay: Story = {
  name: '33%',
  args: {
    percentToGoal: 33,
    fycInPlayLabel: '$2,100 in FYC is sitting on your desk today.',
    fycToDateLabel: '$40,260 of $122,000',
    ringNudge: 'Three closes today puts you back on pace.',
  },
}

export const TwoThirds: Story = {
  name: '67%',
  args: {
    percentToGoal: 67,
    fycInPlayLabel: '$5,400 in FYC is sitting on your desk today.',
    fycToDateLabel: '$81,740 of $122,000',
    ringNudge: 'Two more closes today and you cross 80%.',
  },
}

export const Full: Story = {
  name: '100%',
  args: {
    percentToGoal: 100,
    fycInPlayLabel: 'Goal achieved — $122,000 FYC.',
    fycToDateLabel: '$122,000 of $122,000',
    ringNudge: "You've hit the annual goal. Keep the pace.",
  },
}

export const WithStreak: Story = {
  name: '67% with streak',
  args: {
    percentToGoal: 67,
    fycInPlayLabel: '$5,400 in FYC is sitting on your desk today.',
    fycToDateLabel: '$81,740 of $122,000',
    ringNudge: 'Two more closes today and you cross 80%.',
    streak: '9 days in a row at >80% pace',
  },
}

export const WithoutStreak: Story = {
  name: '67% without streak',
  args: {
    percentToGoal: 67,
    fycInPlayLabel: '$5,400 in FYC is sitting on your desk today.',
    fycToDateLabel: '$81,740 of $122,000',
    ringNudge: 'Two more closes today and you cross 80%.',
  },
}
