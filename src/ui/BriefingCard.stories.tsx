import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { UrgentCard, SignalCard } from './BriefingCard'
import type { UrgentCardProps, SignalCardProps } from './BriefingCard'

const urgentItem: UrgentCardProps['item'] = {
  id: 'urgent-1',
  title: 'Helena Vasquez policy has been in underwriting for 11 days',
  body: 'Standard review window is 7-10 days. The delay is creating anxiety -- her coverage gap extends with each passing day.',
  meta: 'Draft a status update for Helena',
  badge: { label: 'Urgent', tone: 'urgent' },
  actionPrompt:
    'Draft a reassuring status update for Helena Vasquez about her underwriting delay, with a realistic timeline.',
  details: {
    analysis:
      'Helena submitted her application on June 4th. Underwriting typically closes within 7-10 business days, placing the expected close at June 13th. We are now 4 days past that window with no update issued.',
    insight:
      'Clients who go silent during underwriting delays show a 3x higher lapse rate at policy delivery. Helena has two school-age children -- the coverage gap is emotionally charged, not just financial.',
    recommendation:
      'Send a proactive status note today acknowledging the delay, setting a new expectation of June 20th, and offering a 15-minute call if she has concerns. Do not wait for underwriting to close.',
    followup: 'Nyla will flag this again on June 20th if underwriting has not cleared.',
    suggestedActions: [
      {
        label: 'Draft update for Helena',
        prompt:
          'Draft a reassuring, concise status update for Helena Vasquez about her underwriting delay. Acknowledge the timeline slippage, give a new target date of June 20th, and offer a call.',
      },
      { label: 'Review her full case', canvasId: 'helena-1' },
      {
        label: 'Write my own note',
        prompt: 'Open a blank note for Helena Vasquez underwriting update.',
        freeform: true,
      },
    ],
  },
}

const opportunityItem: UrgentCardProps['item'] = {
  id: 'urgent-2',
  title: "Tom Anderson's daughter graduates this weekend -- coverage gap approaching",
  body: 'She ages off the family policy on her 26th birthday, June 28th. No individual policy has been initiated.',
  meta: 'Review coverage options for Sarah',
  badge: { label: 'Opportunity', tone: 'opportunity' },
  actionPrompt:
    'Prepare a summary of individual term and whole life options for Sarah Anderson, age 26, recent graduate.',
  details: {
    analysis:
      "Sarah Anderson turns 26 on June 28th and will no longer be covered under Tom's group family plan. No replacement policy exists. Tom has a $3.2M book and is an A-tier relationship.",
    insight:
      'Life events -- graduation, marriage, first job -- are the highest-converting moments for new policy conversations. Tom is likely already aware of the gap but may not know NYL offers options tailored to early-career clients.',
    recommendation:
      'Call Tom today, frame it as a congratulatory check-in, and surface the coverage transition naturally. Have a 20-year term scenario prepared as a starting point.',
    followup: 'If Tom engages, schedule a three-way meeting with Sarah before June 28th.',
    suggestedActions: [
      {
        label: 'Prep term scenarios for Sarah',
        prompt:
          'Prepare two term life scenarios for Sarah Anderson, 26, healthy, non-smoker: a 20-year $500k term and a 30-year $1M term. Include estimated premium range.',
      },
      {
        label: 'Draft outreach to Tom',
        prompt:
          "Draft a brief, warm call script for Tom Anderson -- congratulating him on Sarah's graduation and naturally transitioning to the coverage conversation.",
      },
    ],
  },
}

const redSignal: SignalCardProps['signal'] = {
  id: 'signal-1',
  pip: 'red',
  title: 'Janet Kim missed her second premium payment',
  body: 'Policy #NYL-2241 entered a 30-day grace period this morning. No response to the automated reminder sent June 10th.',
  action: 'Call Janet before noon',
  badge: { label: 'Urgent', tone: 'urgent' },
  actionPrompt:
    'Prepare a brief, empathetic script for calling Janet Kim about her missed premium -- offer payment plan options and avoid leading with the policy lapse language.',
  details: {
    analysis:
      "Janet's second consecutive missed payment triggered automatic grace-period status at 8:00 AM. Her last inbound contact was May 22nd. She has a $450k whole life policy with 4 years of premium history.",
    insight:
      'Two consecutive misses followed by no response to automated outreach typically signals a financial hardship or life disruption -- not disengagement. A personal call converts at 70%+ in this scenario versus 12% for a follow-up mailer.',
    recommendation:
      'Call before noon. Lead with genuine concern, not the policy status. Offer the premium deferral option if she brings up cash flow. Document the outcome in the CRM immediately after the call.',
    followup: 'If unreachable by end of day, send a handwritten card via the concierge service.',
    suggestedActions: [
      {
        label: 'Prepare call script',
        prompt:
          'Write a 90-second empathetic call script for Janet Kim -- missed premium, grace period, offer payment deferral option. Warm tone, no alarm language.',
      },
      { label: 'Review her account', canvasId: 'janet' },
    ],
  },
}

const amberSignal: SignalCardProps['signal'] = {
  id: 'signal-2',
  pip: 'amber',
  title: "Marcus Webb's portfolio allocation drifted outside his stated risk band",
  body: "Equity exposure reached 78% after last week's rally. His stated ceiling is 70%. No rebalancing has been triggered.",
  action: 'Review rebalancing options',
  badge: { label: 'Monitor', tone: 'monitor' },
  actionPrompt:
    'Summarize rebalancing options for Marcus Webb, target equity 70%, current 78%, long-term growth objective, moderate risk tolerance.',
  details: {
    analysis:
      "Marcus's variable annuity sub-accounts drifted to 78% equity during the June 10-14 rally. His IPS specifies a 65-70% equity ceiling with a +/-5% rebalancing trigger. We are now 8 points above his stated max.",
    insight:
      'Marcus is 54 and expressed strong conviction about protecting downside in his onboarding. Drift above his stated ceiling, if unaddressed, erodes trust even if markets continue to rise.',
    recommendation:
      'Send a proactive rebalancing note before his next quarterly review. Do not wait for the review -- proactive notification is a key differentiator Marcus has cited in past feedback.',
    suggestedActions: [
      {
        label: 'Model rebalancing scenarios',
        prompt:
          'Model three rebalancing options for Marcus Webb: (1) trim equity to exactly 70%, (2) trim to 67% to build buffer, (3) do nothing and monitor. Show projected impact on volatility.',
      },
    ],
  },
}

const greenSignal: SignalCardProps['signal'] = {
  id: 'signal-3',
  pip: 'green',
  title: "Priya Nair's disability policy anniversary -- 5 years clean",
  body: 'No claims, no lapses. Her income has grown 40% since policy inception -- coverage may now be under-indexed.',
  action: 'Schedule an annual policy review',
  badge: { label: 'Opportunity', tone: 'opportunity' },
  actionPrompt:
    "Prepare a brief for Priya Nair's disability policy anniversary -- note the income growth gap and frame a natural conversation around a coverage increase.",
}

export default {
  title: 'UI / BriefingCard',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta

type Story = StoryObj

export const UrgentCollapsed: Story = {
  name: 'Urgent -- Collapsed',
  render: () => <UrgentCard item={urgentItem} expanded={false} onToggle={() => {}} />,
}

export const UrgentExpanded: Story = {
  name: 'Urgent -- Expanded',
  render: () => <UrgentCard item={urgentItem} expanded={true} onToggle={() => {}} />,
}

export const OpportunityExpanded: Story = {
  name: 'Urgent -- Opportunity tone, Expanded',
  render: () => <UrgentCard item={opportunityItem} expanded={true} onToggle={() => {}} />,
}

export const SignalRed: Story = {
  name: 'Signal -- Red pip, Collapsed',
  render: () => <SignalCard signal={redSignal} expanded={false} onToggle={() => {}} />,
}

export const SignalRedExpanded: Story = {
  name: 'Signal -- Red pip, Expanded',
  render: () => <SignalCard signal={redSignal} expanded={true} onToggle={() => {}} />,
}

export const SignalAmber: Story = {
  name: 'Signal -- Amber pip',
  render: () => <SignalCard signal={amberSignal} expanded={false} onToggle={() => {}} />,
}

export const SignalGreen: Story = {
  name: 'Signal -- Green pip (no details)',
  render: () => <SignalCard signal={greenSignal} expanded={false} onToggle={() => {}} />,
}

export const AllVariants: Story = {
  name: 'All Variants',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4 max-w-2xl">
      <UrgentCard item={urgentItem} expanded={false} onToggle={() => {}} />
      <UrgentCard item={opportunityItem} expanded={false} onToggle={() => {}} />
      <SignalCard signal={redSignal} expanded={false} onToggle={() => {}} />
      <SignalCard signal={amberSignal} expanded={false} onToggle={() => {}} />
      <SignalCard signal={greenSignal} expanded={false} onToggle={() => {}} />
    </div>
  ),
}

function InteractiveUrgent() {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="max-w-2xl">
      <UrgentCard
        item={urgentItem}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
        onActionPrompt={(p) => alert(`Nyla prompt:\n\n${p}`)}
        onSuggestedAction={(a) =>
          alert(
            `Action: ${a.label}${a.canvasId ? `\nCanvas: ${a.canvasId}` : ''}${a.prompt ? `\nPrompt: ${a.prompt}` : ''}`,
          )
        }
      />
    </div>
  )
}

export const InteractiveUrgentStory: Story = {
  name: 'Interactive -- Urgent (expand/collapse)',
  parameters: { controls: { disable: true } },
  render: () => <InteractiveUrgent />,
}

function InteractiveSignal() {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="max-w-2xl">
      <SignalCard
        signal={redSignal}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
        onActionPrompt={(p) => alert(`Nyla prompt:\n\n${p}`)}
        onSuggestedAction={(a) => alert(`Action: ${a.label}`)}
      />
    </div>
  )
}

export const InteractiveSignalStory: Story = {
  name: 'Interactive -- Signal (expand/collapse)',
  parameters: { controls: { disable: true } },
  render: () => <InteractiveSignal />,
}
