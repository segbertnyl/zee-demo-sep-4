import type { Meta, StoryObj } from '@storybook/react'
import { DesktopGrid, MobileGrid } from './DesktopGrid'

export default {
  title: 'Design System / Grid',
  component: DesktopGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          'Grid reference from [BW Design System — node 106:788](https://www.figma.com/design/h9jhQiDJSJXxhGZcITe370/BW-Design-System?node-id=106-788).',
          '',
          '**Desktop:** sidebar (fixed width, contextual to platform) + main container: 12 columns, 40px margin, 24px gutter.',
          '',
          '**Mobile:** 375px viewport, 4 columns, 24px margin, 16px gutter.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    sidebarWidth: { control: { type: 'number', min: 0, max: 400, step: 8 } },
    columns: { control: { type: 'number', min: 1, max: 16 } },
    margin: { control: { type: 'number', min: 0, max: 80, step: 8 } },
    gutter: { control: { type: 'number', min: 0, max: 48, step: 8 } },
    height: { control: { type: 'number', min: 200, max: 1024, step: 8 } },
    showLabels: { control: 'boolean' },
  },
} satisfies Meta<typeof DesktopGrid>

type Story = StoryObj<typeof DesktopGrid>

/* ── Desktop ──────────────────────────────────────────────────────────────── */

export const Desktop: Story = {
  name: 'Desktop — 12 col',
  args: {
    sidebarWidth: 272,
    columns: 12,
    margin: 40,
    gutter: 24,
    height: 600,
    showLabels: true,
  },
}

export const DesktopNarrowSidebar: Story = {
  name: 'Desktop — narrow sidebar (240px)',
  args: {
    sidebarWidth: 240,
    columns: 12,
    margin: 40,
    gutter: 24,
    height: 600,
    showLabels: true,
  },
}

export const DesktopNoSidebar: Story = {
  name: 'Desktop — no sidebar',
  args: {
    sidebarWidth: 0,
    columns: 12,
    margin: 40,
    gutter: 24,
    height: 600,
    showLabels: true,
  },
}

/* ── Mobile ───────────────────────────────────────────────────────────────── */

export const Mobile: StoryObj<typeof MobileGrid> = {
  name: 'Mobile — 4 col',
  render: () => (
    <div className="p-10 bg-white">
      <MobileGrid columns={4} margin={24} gutter={16} height={480} showLabels />
    </div>
  ),
}

/* ── Both ─────────────────────────────────────────────────────────────────── */

export const BothBreakpoints: Story = {
  name: 'Desktop + Mobile',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-16 bg-white p-12">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-[13px] font-semibold text-neutral-800">Desktop</p>
          <p className="text-[12px] text-neutral-500">
            Sidebar: fixed width (272px) · Main: 12 columns, 40px margin, 24px gutter
          </p>
        </div>
        <DesktopGrid sidebarWidth={272} columns={12} margin={40} gutter={24} height={480} showLabels />
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <p className="text-[13px] font-semibold text-neutral-800">Mobile</p>
          <p className="text-[12px] text-neutral-500">
            Width: 375px · 4 columns · 24px margin · 16px gutter
          </p>
        </div>
        <MobileGrid columns={4} margin={24} gutter={16} height={420} showLabels={false} />
      </div>
    </div>
  ),
}
