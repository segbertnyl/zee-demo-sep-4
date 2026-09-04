import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { PageSubnav } from './PageSubnav'

/* 🆕 NEW (briefing-v6) — the floating bottom subnav: a horizon/section switcher
 * plus the Nyla sparkle launcher (Figma 1102-101651). Presentational; the caller
 * owns the active value + positioning. */

export default {
  title: 'UI / PageSubnav  🆕',
  component: PageSubnav,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof PageSubnav>

type Story = StoryObj<typeof PageSubnav>

function Interactive() {
  const [active, setActive] = useState('Day')
  return (
    <PageSubnav
      active={active}
      options={['Day', 'Week', 'Month', 'Quarter']}
      onSelect={setActive}
      onAskNyla={() => {}}
    />
  )
}

export const Default: Story = {
  name: 'Horizon switcher',
  render: () => <Interactive />,
}

export const StaticArgs: Story = {
  name: 'Static (args)',
  args: {
    active: 'Week',
    options: ['Day', 'Week', 'Month', 'Quarter'],
    onSelect: () => {},
    onAskNyla: () => {},
  },
}
