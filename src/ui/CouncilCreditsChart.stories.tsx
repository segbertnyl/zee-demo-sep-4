import type { Meta, StoryObj } from '@storybook/react'
import { CouncilCreditsChart } from './CouncilCreditsChart'

export default {
  title: 'UI / CouncilCreditsChart',
  component: CouncilCreditsChart,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CouncilCreditsChart>

type Story = StoryObj<typeof CouncilCreditsChart>

export const Default: Story = {
  args: {
    width: 300,
    height: 214,
    currentCredits: 46800,
    targetCredits: 90000,
    currentMonth: 8,
  },
}

function AllVariantsDemo() {
  const variants: { currentCredits: number; currentMonth: number }[] = [
    { currentCredits: 16000, currentMonth: 4 },
    { currentCredits: 46800, currentMonth: 8 },
    { currentCredits: 72000, currentMonth: 11 },
  ]

  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
      {variants.map(({ currentCredits, currentMonth }) => (
        <div key={currentCredits} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              color: 'var(--text-body-muted)',
              margin: 0,
            }}
          >
            {currentCredits.toLocaleString()} credits
          </p>
          <CouncilCreditsChart
            width={260}
            height={190}
            currentCredits={currentCredits}
            targetCredits={90000}
            currentMonth={currentMonth}
          />
        </div>
      ))}
    </div>
  )
}

export const AllVariants: Story = {
  render: () => <AllVariantsDemo />,
}
