import type { Meta, StoryObj } from '@storybook/react'
import { DataTooltip } from './DataTooltip'
import type { DataTooltipChart } from './DataTooltip'

const meta: Meta<typeof DataTooltip> = {
  title: 'UI / DataTooltip',
  component: DataTooltip,
  parameters: { controls: { disable: true }, layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof DataTooltip>

// ── Shared chart data ─────────────────────────────────────────────────────────

const commissionChart: DataTooltipChart = {
  title: 'Avg commission per policy sold',
  currentValue: 950,
  adjustLabel: 'Adjust manually',
  data: [
    { label: '2022', value: 925 },
    { label: '2023', value: 975 },
    { label: '2024', value: 950 },
    { label: '2025', value: 975 },
    { label: '2026', value: 945 },
  ],
  yMin: 900,
  yMax: 1000,
  source: 'ToolName.',
}

const fycChart: DataTooltipChart = {
  title: 'FYC per active month',
  currentValue: 3800,
  adjustLabel: 'Adjust manually',
  data: [
    { label: '2022', value: 3200 },
    { label: '2023', value: 3900 },
    { label: '2024', value: 3600 },
    { label: '2025', value: 4100 },
    { label: '2026', value: 3800 },
  ],
  yMin: 3000,
  yMax: 4500,
  source: 'NYL360 data.',
}

const caseChart: DataTooltipChart = {
  title: 'Cases placed per month',
  currentValue: 4,
  adjustLabel: 'Edit estimate',
  data: [
    { label: 'Q1', value: 3 },
    { label: 'Q2', value: 5 },
    { label: 'Q3', value: 4 },
    { label: 'Q4', value: 6 },
    { label: 'Q1\'25', value: 4 },
  ],
  yMin: 0,
  yMax: 8,
  source: 'Advisor history.',
}

// ── Stories ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 40 }}>
      <DataTooltip label="~$950 /policy" state="default" chart={commissionChart} />
    </div>
  ),
}

export const Hover: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 40 }}>
      <DataTooltip label="~$950 /policy" state="hover" chart={commissionChart} />
    </div>
  ),
}

export const Clicked: Story = {
  name: 'Clicked (flyout open)',
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '200px 40px 40px' }}>
      <DataTooltip label="~$950 /policy" state="clicked" chart={commissionChart} />
    </div>
  ),
}

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center', padding: '40px 40px 40px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <DataTooltip label="~$950 /policy" state="default" chart={commissionChart} />
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-body-muted)' }}>Default</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <DataTooltip label="~$950 /policy" state="hover" chart={commissionChart} />
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-body-muted)' }}>Hover</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <DataTooltip label="~$950 /policy" state="clicked" chart={commissionChart} />
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-body-muted)' }}>Clicked</span>
      </div>
    </div>
  ),
}

export const Interactive: Story = {
  name: 'Interactive (hover to open)',
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center', padding: '220px 40px 40px' }}>
      <DataTooltip label="~$950 /policy" chart={commissionChart} />
      <DataTooltip label="~$3,800 FYC /mo" chart={fycChart} />
      <DataTooltip label="~4 cases /mo" chart={caseChart} />
    </div>
  ),
}

export const FlyoutDown: Story = {
  name: 'Flyout opens downward',
  render: () => (
    <div style={{ display: 'flex', gap: 16, padding: '40px 40px 220px' }}>
      <DataTooltip label="~$950 /policy" state="clicked" flyoutDirection="down" chart={commissionChart} />
    </div>
  ),
}

export const NoChart: Story = {
  name: 'No chart (label only)',
  render: () => (
    <div style={{ display: 'flex', gap: 16, padding: 40 }}>
      <DataTooltip label="~$950 /policy" />
      <DataTooltip label="86% retention" />
      <DataTooltip label="12 active cases" />
    </div>
  ),
}
