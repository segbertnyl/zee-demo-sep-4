import type { Meta, StoryObj } from '@storybook/react'
import { StatusBadge, type StatusBadgeTone } from './StatusBadge'

/* 🆕 NEW (briefing-v6) — the status pill shown at the top of each briefing task
 * card. One tone per signal type, all driven by the semantic --badge-* tokens.
 * `meta` appends a divided secondary note (e.g. a confidence %). */

export default {
  title: 'UI / StatusBadge  🆕',
  component: StatusBadge,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof StatusBadge>

type Story = StoryObj<typeof StatusBadge>

const TONES: { tone: StatusBadgeTone; label: string }[] = [
  { tone: 'lapse', label: 'Lapse risk' },
  { tone: 'prep', label: 'Qualified appt prep' },
  { tone: 'opportunity', label: 'Opportunity' },
  { tone: 'monitor', label: 'Prep ready' },
  { tone: 'event', label: 'Event nearby' },
]

export const AllTones: Story = {
  name: 'All tones',
  render: () => (
    <div className="flex flex-col items-start gap-3">
      {TONES.map((t) => (
        <StatusBadge key={t.tone} tone={t.tone} label={t.label} />
      ))}
    </div>
  ),
}

export const WithMeta: Story = {
  name: 'With meta note',
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <StatusBadge tone="event" label="New conversions" meta="92% confidence" />
      <StatusBadge tone="prep" label="Renewal window" meta="closes in 5 days" />
    </div>
  ),
}

export const Playground: Story = {
  args: { tone: 'lapse', label: 'Lapse risk', meta: '' },
  argTypes: {
    tone: { control: 'select', options: ['lapse', 'prep', 'opportunity', 'monitor', 'event'] satisfies StatusBadgeTone[] },
    label: { control: 'text' },
    meta: { control: 'text' },
  },
}
