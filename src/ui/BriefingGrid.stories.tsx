import type { Meta, StoryObj } from '@storybook/react'
import { BriefingGrid } from './BriefingGrid'

/* 🆕 NEW (briefing-v6) — the standard page grid (Figma 1102-101355).
 * 96px rail + 12-col content (1272px max · 24px gutter · 40px margin).
 * Used for every page; the expanded nav overlays content and never reflows it. */

export default {
  title: 'Design System / Page Grid  🆕',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta

type Story = StoryObj

export const Standard: Story = {
  name: 'Page grid (rail + 12 cols)',
  render: () => (
    <div className="p-6">
      <BriefingGrid />
    </div>
  ),
}

export const EditorialSplit: Story = {
  name: 'Briefing 5 / 7 split',
  render: () => (
    <div className="p-6">
      <BriefingGrid showSplit height={520} />
    </div>
  ),
}

export const ColumnsOnly: Story = {
  name: 'Uniform 12 columns',
  render: () => (
    <div className="p-6">
      <BriefingGrid showSplit={false} height={520} />
    </div>
  ),
}
