import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Chevron } from './Chevron'

export default {
  title: 'UI / Chevron',
  component: Chevron,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Chevron>

type Story = StoryObj<typeof Chevron>

export const Collapsed: Story = {
  args: { expanded: false },
}

export const Expanded: Story = {
  args: { expanded: true },
}

function InteractiveChevron() {
  const [expanded, setExpanded] = useState(false)
  return (
    <button
      type="button"
      onClick={() => setExpanded((v) => !v)}
      className="flex items-center gap-2 text-sm text-neutral-600"
    >
      {expanded ? 'Collapse' : 'Expand'}
      <Chevron expanded={expanded} />
    </button>
  )
}

export const Interactive: Story = {
  render: () => <InteractiveChevron />,
}
