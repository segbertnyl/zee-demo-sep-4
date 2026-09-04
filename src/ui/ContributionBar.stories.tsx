import type { Meta, StoryObj } from '@storybook/react'
import { ContributionBar } from './ContributionBar'
import type { ContributionSegment } from './ContributionBar'

const DEFAULT_SEGMENTS: ContributionSegment[] = [
  { label: 'Contribution to date', value: '$52.4K', width: 339, bg: '#f4e6ff' },
  { label: 'Existing client opportunities', value: '+$10K', width: 105, bg: '#bc79ec' },
  { label: 'Unaccounted pipeline', value: '$27.6K', width: 414, bg: '#f2840d' },
]

export default {
  title: 'UI / ContributionBar',
  component: ContributionBar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    segments: DEFAULT_SEGMENTS,
    height: 57,
  },
} satisfies Meta<typeof ContributionBar>

type Story = StoryObj<typeof ContributionBar>

export const Default: Story = {}

export const TwoSegments: Story = {
  name: 'Two Segments',
  args: {
    segments: [
      { label: 'Existing clients', value: '$62K', width: 444, bg: '#f4e6ff' },
      { label: 'New business', value: '$28K', width: 414, bg: '#bc79ec' },
    ],
  },
}

export const Balanced: Story = {
  name: 'Balanced (equal widths)',
  args: {
    segments: [
      { label: 'Existing clients', value: '$30K', width: 286, bg: '#f4e6ff' },
      { label: 'New clients', value: '$30K', width: 286, bg: '#bc79ec' },
      { label: 'Referred clients', value: '$30K', width: 286, bg: '#f2840d' },
    ],
  },
}

export const AllVariants: Story = {
  name: 'All Variants',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-12">
      <div>
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[2px] text-[#474952]">Default (3 segments)</p>
        <ContributionBar segments={DEFAULT_SEGMENTS} />
      </div>

      <div>
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[2px] text-[#474952]">Two Segments</p>
        <ContributionBar
          segments={[
            { label: 'Existing clients', value: '$62K', width: 444, bg: '#f4e6ff' },
            { label: 'New business', value: '$28K', width: 414, bg: '#bc79ec' },
          ]}
        />
      </div>

      <div>
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[2px] text-[#474952]">Balanced (equal widths)</p>
        <ContributionBar
          segments={[
            { label: 'Existing clients', value: '$30K', width: 286, bg: '#f4e6ff' },
            { label: 'New clients', value: '$30K', width: 286, bg: '#bc79ec' },
            { label: 'Referred clients', value: '$30K', width: 286, bg: '#f2840d' },
          ]}
        />
      </div>

      <div>
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[2px] text-[#474952]">Taller bar (height=80)</p>
        <ContributionBar segments={DEFAULT_SEGMENTS} height={80} />
      </div>
    </div>
  ),
}
