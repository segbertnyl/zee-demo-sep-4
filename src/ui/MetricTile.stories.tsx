import type { Meta, StoryObj } from '@storybook/react'
import { MetricTile } from './MetricTile'

export default {
  title: 'UI / MetricTile',
  component: MetricTile,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    label: 'FYC per month',
    value: '$4K',
    sub: 'avg to hit $42K',
    delay: 0,
    valueSize: 32,
  },
} satisfies Meta<typeof MetricTile>

type Story = StoryObj<typeof MetricTile>

export const Default: Story = {}

export const OnTrack: Story = {
  name: 'On Track (green dot)',
  args: {
    label: 'FYC target',
    value: '$47,200',
    sub: '56% to EC',
    dot: '#1ab382',
  },
}

export const Stretch: Story = {
  name: 'Stretch (orange dot)',
  args: {
    label: 'PC gap',
    value: '−$45,600',
    sub: 'needs +$4.5K/mo · stretch',
    dot: '#ff9522',
  },
}

export const NoSub: Story = {
  name: 'No Sub-text',
  args: {
    label: 'Referral asks',
    value: '4 /mo',
    sub: undefined,
  },
}

export const AllVariants: Story = {
  name: 'All Variants',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
      <MetricTile label="FYC per month" value="$4K" sub="avg to hit $42K" />
      <MetricTile label="FYC target" value="$47,200" sub="56% to EC" dot="#1ab382" />
      <MetricTile label="PC gap" value="−$45,600" sub="needs +$4.5K/mo · stretch" dot="#ff9522" />
      <MetricTile label="Cases needed" value="+12 cases" sub="6 months · 2 per mo" valueSize={24} dot="#ff9522" />
      <MetricTile label="Referral asks" value="4 /mo" />
      <MetricTile label="Prospect contacts" value="16 /mo" sub="to fill your appointment pipeline" />
    </div>
  ),
}
