import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { OptionTile, OptionTileGroup } from './OptionTile'
import type { OptionTileProps, OptionTileOption } from './OptionTile'

export default {
  title: 'Components / OptionTile',
  component: OptionTile,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    selected: { control: 'boolean' },
    size: { control: 'radio', options: ['compact', 'spacious'] },
    disabled: { control: 'boolean' },
    title: { control: 'text' },
    sub: { control: 'text' },
  },
  args: {
    title: 'Become a true holistic financial advisor',
    sub: 'Planning, investments, protection together',
    selected: false,
    size: 'spacious',
    disabled: false,
  },
} satisfies Meta<typeof OptionTile>

type Story = StoryObj<typeof OptionTile>

// ---------------------------------------------------------------------------
// Playground
// ---------------------------------------------------------------------------

function PlaygroundTile(args: OptionTileProps) {
  const [selected, setSelected] = useState(args.selected ?? false)
  return (
    <div style={{ maxWidth: 320 }}>
      <OptionTile {...args} selected={selected} onChange={setSelected} />
    </div>
  )
}

export const Playground: Story = {
  render: (args) => <PlaygroundTile {...args} />,
}

// ---------------------------------------------------------------------------
// States — unselected / selected / disabled per size
// ---------------------------------------------------------------------------

export const States: Story = {
  name: 'States',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {(['spacious', 'compact'] as const).map((size) => (
        <div key={size}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10.5, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-body-muted)', marginBottom: 12 }}>
            {size}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 260px)', gap: 12 }}>
            <OptionTile size={size} title="Become a true holistic financial advisor" sub="Planning, investments, protection together" selected={false} />
            <OptionTile size={size} title="Become a true holistic financial advisor" sub="Planning, investments, protection together" selected={true} />
            <OptionTile size={size} title="Become a true holistic financial advisor" sub="Planning, investments, protection together" disabled={true} />
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            {['Unselected', 'Selected', 'Inactive'].map((l) => (
              <p key={l} style={{ width: 260, fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text-body-faint)', textAlign: 'center' }}>{l}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
}

// ---------------------------------------------------------------------------
// Compact vs Spacious — padding-only difference, same typography
// ---------------------------------------------------------------------------

export const CompactVsSpacious: Story = {
  name: 'Compact vs Spacious — padding only',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-body-muted)', margin: 0 }}>
        Typography is identical between sizes. Only padding differs: compact = 16px, spacious = 24px.
      </p>
      {(['compact', 'spacious'] as const).map((size) => (
        <div key={size}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10.5, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-body-muted)', marginBottom: 12 }}>
            {size} · {size === 'compact' ? '16px' : '24px'} padding
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 280px)', gap: 12 }}>
            <OptionTile size={size} title="Personal emails" selected={false} />
            <OptionTile size={size} title="Events and community involvement" selected={true} />
            <OptionTile size={size} title="Clients ready for a holistic conversation" sub="Beyond what they have today" selected={false} />
            <OptionTile size={size} title="Generate qualified referrals" sub="Build a reliable pipeline before expanding further." selected={true} />
          </div>
        </div>
      ))}
    </div>
  ),
}

// ---------------------------------------------------------------------------
// Title only (ClientConversations variant — no subtitle)
// ---------------------------------------------------------------------------

export const TitleOnly: Story = {
  name: 'Title Only',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 220px)', gap: 12 }}>
      {[
        { title: 'Protection & life insurance', selected: true },
        { title: 'Retirement income', selected: false },
        { title: 'Investment planning', selected: true },
        { title: 'Estate and legacy', selected: false },
        { title: 'Business owner solutions', selected: false },
        { title: 'LTC & benefits', selected: false },
      ].map((o) => (
        <OptionTile key={o.title} title={o.title} selected={o.selected} size="spacious" />
      ))}
    </div>
  ),
}

// ---------------------------------------------------------------------------
// Group: 2-column with max cap
// ---------------------------------------------------------------------------

const CLIENT_SIGNALS: OptionTileOption[] = [
  { id: 'life', title: 'Life events worth a planning conversation', sub: 'The right moment to go deeper' },
  { id: 'lapse', title: 'Lapse & retention risks', sub: 'Clients at risk before they act' },
  { id: 'expansion', title: 'Holistic expansion signals', sub: 'Clients ready for more than protection' },
  { id: 'milestones', title: 'Policy & plan milestones', sub: 'Anniversaries, conversion windows, RMDs' },
  { id: 'referral', title: 'Referral network signals', sub: 'Household connections worth exploring' },
]

function Group2ColDemo() {
  const [value, setValue] = useState<string[]>(['life'])
  return (
    <div style={{ maxWidth: 560 }}>
      <OptionTileGroup options={CLIENT_SIGNALS} value={value} onChange={setValue} max={2} cols={2} size="spacious" />
    </div>
  )
}

export const Group2ColWithMax: Story = {
  name: 'Group — 2 col, max 2',
  parameters: { controls: { disable: true } },
  render: () => <Group2ColDemo />,
}

// ---------------------------------------------------------------------------
// Group: 3-column compact
// ---------------------------------------------------------------------------

const DIRECTION_OPTIONS: OptionTileOption[] = [
  { id: 'holistic', title: 'Become a true holistic financial advisor', sub: 'Planning, investments, protection together' },
  { id: 'eagle', title: 'Build toward Eagle and investment advisory', sub: 'IAR track, AUM, fee-based' },
  { id: 'referrals', title: 'Generating qualified referrals consistently', sub: 'Before expanding further' },
  { id: 'referral-practice', title: 'Build a referral-driven practice', sub: 'Less cold outreach, more warm pipeline' },
  { id: 'team', title: 'Build toward a team-based model', sub: 'Teaming, staff, shared clients' },
]

function Group3ColDemo() {
  const [value, setValue] = useState<string[]>(['holistic'])
  return (
    <div style={{ maxWidth: 760 }}>
      <OptionTileGroup options={DIRECTION_OPTIONS} value={value} onChange={setValue} max={3} cols={3} size="compact" />
    </div>
  )
}

export const Group3ColCompact: Story = {
  name: 'Group — 3 col compact, max 3',
  parameters: { controls: { disable: true } },
  render: () => <Group3ColDemo />,
}

// ---------------------------------------------------------------------------
// All variants overview
// ---------------------------------------------------------------------------

function AllVariantsDemo() {
  const [dirValue, setDirValue] = useState<string[]>(['holistic', 'eagle'])
  const [sigValue, setSigValue] = useState<string[]>(['life'])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <section>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10.5, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-body-muted)', marginBottom: 12 }}>
          3-col · compact · max 3 (Direction/ProgressAreas pattern)
        </p>
        <OptionTileGroup options={DIRECTION_OPTIONS} value={dirValue} onChange={setDirValue} max={3} cols={3} size="compact" />
      </section>

      <section>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10.5, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-body-muted)', marginBottom: 12 }}>
          2-col · spacious · max 2 (ClientSignals/ClientActivities pattern)
        </p>
        <OptionTileGroup options={CLIENT_SIGNALS} value={sigValue} onChange={setSigValue} max={2} cols={2} size="spacious" />
      </section>

      <section>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10.5, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-body-muted)', marginBottom: 12 }}>
          3-col · spacious · no sub (ClientConversations pattern)
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { id: 'protection', title: 'Protection & life insurance' },
            { id: 'retirement', title: 'Retirement income' },
            { id: 'investment', title: 'Investment planning' },
            { id: 'estate', title: 'Estate and legacy' },
            { id: 'business', title: 'Business owner solutions' },
            { id: 'ltc', title: 'LTC & benefits' },
          ].map((o, i) => (
            <OptionTile key={o.id} title={o.title} selected={i < 2} size="spacious" />
          ))}
        </div>
      </section>
    </div>
  )
}

export const AllVariants: Story = {
  name: 'All Variants',
  parameters: { controls: { disable: true } },
  render: () => <AllVariantsDemo />,
}
