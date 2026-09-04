import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { BriefingControls, type BriefingModeId, type Horizon } from './BriefingControls'

export default {
  title: 'UI / BriefingControls',
  component: BriefingControls,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof BriefingControls>

type Story = StoryObj<typeof BriefingControls>

export const Default: Story = {
  name: 'Default (Daily active)',
  args: {
    activeMode: 'daily',
    activeHorizon: 'day',
    onModeChange: () => {},
    onHorizonChange: () => {},
  },
}

export const PreMeetingActive: Story = {
  name: 'Pre-meeting active',
  args: {
    activeMode: 'pre-meeting',
    activeHorizon: 'day',
    onModeChange: () => {},
    onHorizonChange: () => {},
  },
}

function AllModesDemo() {
  const [mode, setMode] = useState<BriefingModeId>('daily')
  const [horizon, setHorizon] = useState<Horizon>('day')

  function handleModeChange(next: BriefingModeId) {
    setMode(next)
    if (next === 'weekly') setHorizon('week')
    else if (next === 'annual') setHorizon('year')
    else if (next === 'daily') setHorizon('day')
  }

  return (
    <div
      style={{
        background: 'linear-gradient(165deg, #e9efff 0%, #d5e2fd 45%, #bccff9 100%)',
        padding: '2rem',
        borderRadius: '1rem',
      }}
    >
      <BriefingControls
        activeMode={mode}
        activeHorizon={horizon}
        onModeChange={handleModeChange}
        onHorizonChange={setHorizon}
      />
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-body-muted)', marginTop: 8 }}>
        mode: <strong>{mode}</strong> · horizon: <strong>{horizon}</strong>
      </p>
    </div>
  )
}

export const AllModes: Story = {
  name: 'All Modes (interactive)',
  render: () => <AllModesDemo />,
}
