import type { Meta, StoryObj } from '@storybook/react'
import { CouncilStatCard } from './CouncilStatCard'

export default {
  title: 'UI / CouncilStatCard',
  component: CouncilStatCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CouncilStatCard>

type Story = StoryObj<typeof CouncilStatCard>

export const Complete: Story = {
  args: {
    label: 'Protection FYC',
    value: '$24.6K',
    status: 'complete',
    progress: 1.0,
    caption: '100% complete of $21K minimum',
    captionBold: '$21K minimum',
  },
}

export const OnTrack: Story = {
  args: {
    label: 'Case rate bonus',
    value: '46',
    valueSuffix: '/50',
    status: 'on-track',
    progress: 0.92,
    caption: '92% complete of 50 case rate',
    captionBold: '50 case rate',
  },
}

export const Stretch: Story = {
  args: {
    label: 'Protection premium',
    value: '$56,100',
    status: 'stretch',
    progress: 0.65,
    caption: '65% complete of $86,300 stretch',
    captionBold: '$86,300 stretch',
  },
}

export const Dimmed: Story = {
  args: {
    label: 'Protection premium',
    value: '$56,100',
    status: 'stretch',
    progress: 0.65,
    caption: '65% complete of $86,300 stretch',
    captionBold: '$86,300 stretch',
    dimmed: true,
  },
}

function AllVariantsDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}>
      <CouncilStatCard
        label="Protection FYC"
        value="$24.6K"
        status="complete"
        progress={1.0}
        caption="100% complete of $21K minimum"
        captionBold="$21K minimum"
      />
      <CouncilStatCard
        label="Case rate bonus"
        value="46"
        valueSuffix="/50"
        status="on-track"
        progress={0.92}
        caption="92% complete of 50 case rate"
        captionBold="50 case rate"
      />
      <CouncilStatCard
        label="Protection premium"
        value="$56,100"
        status="stretch"
        progress={0.65}
        caption="65% complete of $86,300 stretch"
        captionBold="$86,300 stretch"
      />
    </div>
  )
}

export const AllVariants: Story = {
  render: () => <AllVariantsDemo />,
}
