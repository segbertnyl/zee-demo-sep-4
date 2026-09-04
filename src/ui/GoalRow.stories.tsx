import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { GoalRow } from './GoalRow'

const meta: Meta<typeof GoalRow> = {
  title: 'UI / GoalRow',
  component: GoalRow,
  parameters: { controls: { disable: true }, layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof GoalRow>

const ProtectIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip-protect-row)">
      <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2ZM18 11.09C18 15.09 15.45 18.79 12 19.92C8.55 18.79 6 15.1 6 11.09V6.39L12 4.14L18 6.39V11.09Z" fill="#7028A4"/>
    </g>
    <defs><clipPath id="clip-protect-row"><rect width="24" height="24" fill="white"/></clipPath></defs>
  </svg>
)

const GrowthIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.55 20H15.45L16.45 16H7.55L8.55 20ZM8.55 22C8.08333 22 7.675 21.8583 7.325 21.575C6.975 21.2917 6.74167 20.925 6.625 20.475L5.5 16H18.5L17.375 20.475C17.2583 20.925 17.025 21.2917 16.675 21.575C16.325 21.8583 15.9167 22 15.45 22H8.55ZM5 14H19V12H5V14ZM12 8C12 6.33333 12.5833 4.91667 13.75 3.75C14.9167 2.58333 16.3333 2 18 2C18 3.5 17.525 4.8 16.575 5.9C15.625 7 14.4333 7.66667 13 7.9V10H21V14C21 14.55 20.8043 15.0207 20.413 15.412C20.021 15.804 19.55 16 19 16H5C4.45 16 3.979 15.804 3.587 15.412C3.19567 15.0207 3 14.55 3 14V10H11V7.9C9.56667 7.66667 8.375 7 7.425 5.9C6.475 4.8 6 3.5 6 2C7.66667 2 9.08333 2.58333 10.25 3.75C11.4167 4.91667 12 6.33333 12 8Z" fill="#7028A4"/>
  </svg>
)

const NetworkIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 18C0.716667 18 0.479333 17.904 0.288 17.712C0.096 17.5207 0 17.2833 0 17V16.425C0 15.6917 0.366667 15.104 1.1 14.662C1.83333 14.2207 2.8 14 4 14C4.21667 14 4.421 14.0083 4.613 14.025C4.80433 14.0417 4.99167 14.0667 5.175 14.1C4.94167 14.4333 4.77067 14.7917 4.662 15.175C4.554 15.5583 4.5 15.9667 4.5 16.4V18H1ZM7 18C6.71667 18 6.479 17.904 6.287 17.712C6.09567 17.5207 6 17.2833 6 17V16.4C6 15.3167 6.55433 14.4373 7.663 13.762C8.771 13.0873 10.2167 12.75 12 12.75C13.8 12.75 15.25 13.0873 16.35 13.762C17.45 14.4373 18 15.3167 18 16.4V17C18 17.2833 17.904 17.5207 17.712 17.712C17.5207 17.904 17.2833 18 17 18H7ZM19.5 18V16.4C19.5 15.9667 19.4417 15.5583 19.325 15.175C19.2083 14.7917 19.0417 14.4333 18.825 14.1C19.0083 14.0667 19.196 14.0417 19.388 14.025C19.5793 14.0083 19.7833 14 20 14C21.2 14 22.1667 14.2207 22.9 14.662C23.6333 15.104 24 15.6917 24 16.425V17C24 17.2833 23.904 17.5207 23.712 17.712C23.5207 17.904 23.2833 18 23 18H19.5ZM12 14.75C11.05 14.75 10.2 14.879 9.45 15.137C8.7 15.3957 8.25833 15.6833 8.125 16H15.875C15.725 15.6667 15.2793 15.375 14.538 15.125C13.796 14.875 12.95 14.75 12 14.75ZM4 13C3.45 13 2.97933 12.804 2.588 12.412C2.196 12.0207 2 11.55 2 11C2 10.45 2.196 9.979 2.588 9.587C2.97933 9.19567 3.45 9 4 9C4.55 9 5.02067 9.19567 5.412 9.587C5.804 9.979 6 10.45 6 11C6 11.55 5.804 12.0207 5.412 12.412C5.02067 12.804 4.55 13 4 13ZM20 13C19.45 13 18.979 12.804 18.587 12.412C18.1957 12.0207 18 11.55 18 11C18 10.45 18.1957 9.979 18.587 9.587C18.979 9.19567 19.45 9 20 9C20.55 9 21.021 9.19567 21.413 9.587C21.8043 9.979 22 10.45 22 11C22 11.55 21.8043 12.0207 21.413 12.412C21.021 12.804 20.55 13 20 13ZM12 12C11.1667 12 10.4583 11.7083 9.875 11.125C9.29167 10.5417 9 9.83333 9 9C9 8.16667 9.29167 7.45833 9.875 6.875C10.4583 6.29167 11.1667 6 12 6C12.8333 6 13.5417 6.29167 14.125 6.875C14.7083 7.45833 15 8.16667 15 9C15 9.83333 14.7083 10.5417 14.125 11.125C13.5417 11.7083 12.8333 12 12 12ZM12 8C11.7167 8 11.4793 8.09567 11.288 8.287C11.096 8.479 11 8.71667 11 9C11 9.28333 11.096 9.52067 11.288 9.712C11.4793 9.904 11.7167 10 12 10C12.2833 10 12.521 9.904 12.713 9.712C12.9043 9.52067 13 9.28333 13 9C13 8.71667 12.9043 8.479 12.713 8.287C12.521 8.09567 12.2833 8 12 8Z" fill="#7028A4"/>
  </svg>
)

// ── Static states ──────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 730 }}>
      <GoalRow
        icon={<ProtectIcon />}
        title="Protect time outside of work"
      />
    </div>
  ),
}

export const Hover: Story = {
  render: () => (
    <div style={{ maxWidth: 730 }}>
      {/* Force hover appearance by using a wrapper that pre-sets hovered state */}
      <GoalRow
        icon={<ProtectIcon />}
        title="Protect time outside of work"
        // hover is internal state; shown via the interactive story below
      />
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-body-muted)', marginTop: 16 }}>
        Hover over the row above to see the hover state.
      </p>
    </div>
  ),
}

export const Selected: Story = {
  render: () => (
    <div style={{ maxWidth: 730 }}>
      <GoalRow
        icon={<ProtectIcon />}
        title="Protect time outside of work"
        description="You said you haven't been able to take a vacation in a long time, and you're struggling to dedicate focused time to your family. We'll work on that."
        selected
      />
    </div>
  ),
}

// ── Interactive list ────────────────────────────────────────────────────────

const GOALS = [
  {
    icon: <ProtectIcon />,
    title: 'Protect time outside of work',
    description: "You said you haven't been able to take a vacation in a long time, and you're struggling to dedicate focused time to your family. We'll work on that.",
  },
  {
    icon: <GrowthIcon />,
    title: 'Grow my book of business',
    description: "You mentioned wanting to increase AUM by 20% over the next two years. We'll build a plan focused on referrals and prospecting cadence.",
  },
  {
    icon: <NetworkIcon />,
    title: 'Expand my professional network',
    description: "Strengthening your referral network and council relationships is a top priority. We'll identify key contacts and map out your outreach approach.",
  },
]

function InteractiveList() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  return (
    <div style={{ maxWidth: 730 }}>
      {GOALS.map((goal, i) => (
        <GoalRow
          key={i}
          icon={goal.icon}
          title={goal.title}
          description={goal.description}
          selected={selectedIndex === i}
          onSelect={() => setSelectedIndex(i)}
          onChange={() => setSelectedIndex(null)}
          onRemove={() => setSelectedIndex(null)}
        />
      ))}
    </div>
  )
}

export const Interactive: Story = {
  render: () => <InteractiveList />,
}
