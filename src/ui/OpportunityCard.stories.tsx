import type { Meta, StoryObj } from '@storybook/react'
import { OpportunityCard, type OpportunityCardProps } from '@/ui/OpportunityCard'

const standardCard: OpportunityCardProps = {
  id: 'janet',
  badges: [{ label: 'Opportunity', tone: 'opportunity' }],
  confidence: 92,
  headline: 'Janet Henderson has recently had a change of address to a high flood-risk coastal location.',
  body: "Similar life-event cases with this propensity score convert at a high rate when contacted within the first 30 days of a move. You're in that window now, but don't limit the conversation to flood. Instead, ask what else has changed. Showing up as a proactive agent is most valuable.",
  metrics: [
    { label: 'Propensity', value: 0.88, tone: 'good' },
    { label: 'Engagement', value: 0.61, tone: 'neutral' },
    { label: 'FYC risk', value: 0.34, tone: 'warn' },
  ],
  fycEstimate: '~$4,200 estimated FYC · Home + life bundle',
  plan: [
    {
      label: 'Review flood exposure data',
      sub: 'Coastal zone 2A — 500-yr floodplain',
      cta: 'Review data',
    },
    {
      label: 'Draft an introductory email',
      sub: 'Acknowledge the move, not just the risk',
      cta: 'Draft outreach',
    },
    {
      label: 'Schedule a 15-min check-in call',
      cta: 'Schedule call',
    },
  ],
  tip: 'Tip: Mention the move before the product. Clients who feel seen before being sold convert at 2× the rate.',
  index: 0,
}

const monitorCard: OpportunityCardProps = {
  id: 'helena-annuity',
  badges: [
    { label: 'Monitor', tone: 'monitor' },
    { label: 'Retention', tone: 'opportunity' },
  ],
  confidence: 74,
  headline: 'Helena Voss may be approaching a key annuity surrender window in the next 60 days.',
  body: 'Her 7-year term ends Q3. Market conditions make a 1035 exchange conversation timely — and competitors have been active in her zip code. Early outreach now protects $38K in trailing commissions.',
  metrics: [
    { label: 'Lapse risk', value: 0.71, tone: 'warn' },
    { label: 'Engagement', value: 0.44, tone: 'neutral' },
    { label: 'Lifetime value', value: 0.82, tone: 'good' },
  ],
  fycEstimate: '~$2,800 protected FYC · Annuity retention',
  plan: [
    {
      label: 'Pull annuity contract summary',
      sub: 'Surrender schedule and current surrender charge',
      cta: 'Pull summary',
    },
    {
      label: 'Send a proactive policy review invite',
      cta: 'Draft invite',
    },
    {
      label: 'Present 1035 exchange scenarios',
      sub: 'Run illustration comparison',
      cta: 'Run illustration',
    },
  ],
  index: 1,
}

export default {
  title: 'UI / OpportunityCard',
  component: OpportunityCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof OpportunityCard>

type Story = StoryObj<typeof OpportunityCard>

export const Playground: Story = {
  args: standardCard,
}

export const Standard: Story = {
  args: standardCard,
  parameters: { controls: { disable: true } },
}

export const MonitorBadge: Story = {
  name: 'Monitor badge variant',
  args: monitorCard,
  parameters: { controls: { disable: true } },
}

export const Snoozed: Story = {
  render: (args) => {
    return (
      <div style={{ maxWidth: 720 }}>
        <p style={{ marginBottom: 16, fontSize: 12, color: '#94a3b8' }}>
          Click "Snooze" on the card below to see the collapsed state.
        </p>
        <OpportunityCard {...args} />
      </div>
    )
  },
  args: standardCard,
  parameters: { controls: { disable: true } },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <OpportunityCard {...standardCard} index={0} />
      <OpportunityCard {...monitorCard} index={1} />
      <OpportunityCard
        id="tom-referral"
        badges={[
          { label: 'Referral', tone: 'opportunity' },
        ]}
        confidence={68}
        headline="Tom Keiser referred two colleagues who haven't been contacted since initial outreach."
        body='Both referrals have household income above $180K and children under 10 — high fit for 20-year term. Tom flagged them as "ready to talk" in your last meeting. Reaching out now closes the loop and keeps Tom engaged.'
        metrics={[
          { label: 'Propensity', value: 0.65, tone: 'neutral' },
          { label: 'Engagement', value: 0.53, tone: 'neutral' },
          { label: 'FYC potential', value: 0.77, tone: 'good' },
        ]}
        fycEstimate='~$6,100 potential FYC · 20-yr term × 2'
        plan={[
          {
            label: 'Review referral intake notes',
            sub: 'Two prospects — Marcus D. and Priya S.',
            cta: 'Review notes',
          },
          {
            label: 'Draft personal intro emails',
            sub: 'Reference Tom by name',
            cta: 'Draft emails',
          },
          {
            label: 'Loop Tom in with a quick thank-you',
            cta: 'Send thank-you',
          },
        ]}
        tip="Tip: Response rates on referral outreach drop sharply after 2 weeks. You're at day 11."
        index={2}
      />
    </div>
  ),
  parameters: { controls: { disable: true } },
}
