import type { Meta, StoryObj } from '@storybook/react'
import { PlanRail, type PlanRailGoals } from './PlanRail'

export default {
  title: 'Components / PlanRail',
  component: PlanRail,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PlanRail>

type Story = StoryObj<typeof PlanRail>

const baseGoals: PlanRailGoals = {
  fycTarget: 55000,
  councilLevel: 'Executive',
  longTermTags: ['Holistic Advising', 'Eagle Status'],
  progressAreas: ['holistic', 'eagle', 'referrals'],
  clientApproach: {
    existing: 'Prioritize deepening your existing relationships in the long term',
    new: 'Explore new long term prospects and discover events to broaden your branded reach',
  },
}

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      background: 'linear-gradient(160deg, #2a1463 0%, #4d1773 100%)',
      borderRadius: 12,
      padding: '32px 28px',
      minHeight: 400,
      width: 260,
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    {children}
  </div>
)

export const GoalsOnly: Story = {
  render: () => (
    <Wrapper>
      <PlanRail goals={baseGoals} businessDone={false} clientsDone={false} />
    </Wrapper>
  ),
}

export const WithBusiness: Story = {
  render: () => (
    <Wrapper>
      <PlanRail goals={baseGoals} businessDone={true} clientsDone={false} />
    </Wrapper>
  ),
}

export const WithClients: Story = {
  render: () => (
    <Wrapper>
      <PlanRail goals={baseGoals} businessDone={true} clientsDone={true} />
    </Wrapper>
  ),
}

export const FullyPopulated: Story = {
  render: () => (
    <Wrapper>
      <PlanRail
        goals={{
          fycTarget: 72000,
          councilLevel: 'Presidents',
          longTermTags: ['Holistic Advising', 'Eagle Status', 'Referral engine'],
          progressAreas: ['referrals', 'eagle', 'holistic'],
          clientApproach: {
            existing: 'Focus on annual review conversations with your top 20 clients',
            new: 'Build referral partnerships with two CPAs and one estate attorney',
          },
        }}
        businessDone={true}
        clientsDone={true}
      />
    </Wrapper>
  ),
}
