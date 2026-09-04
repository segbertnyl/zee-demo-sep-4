import type { Meta, StoryObj } from '@storybook/react'
import { PlanSummaryBackground } from './PlanSummaryBackground'

export default {
  title: 'UI / Backgrounds / Plan Summary',
  parameters: {
    layout: 'fullscreen',
    backgrounds: { disable: true },
  },
} satisfies Meta

type Story = StoryObj

// Plan summary / plan-reveal — tall portrait bokeh (nyla-bkg-planreveal).
export const Default: Story = {
  name: 'Plan Summary (reveal)',
  render: () => (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <PlanSummaryBackground variant="reveal" />
    </div>
  ),
}

// Plan page — wide landscape bokeh (nyla-bkg-planpage).
export const Page: Story = {
  name: 'Plan Page',
  render: () => (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <PlanSummaryBackground variant="page" />
    </div>
  ),
}
