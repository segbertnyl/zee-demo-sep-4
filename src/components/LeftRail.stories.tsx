import type { Meta, StoryObj, Decorator } from '@storybook/react'
import { LeftRail } from './LeftRail'
import { useAppStore } from '@/state/useAppStore'
import type { Scene, Role } from '@/state/useAppStore'

export default {
  title: 'Components / LeftRail',
  component: LeftRail,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    docs: {
      description: {
        component:
          'Fixed vertical navigation rail. Collapsed at 76px wide; expands to 220px on hover after 2s. Houses primary destinations, canvas mode toggle, role switcher, recent activity flyout, and user avatar.',
      },
    },
  },
  decorators: [
    ((Story) => (
      <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', paddingLeft: 76 }}>
        <Story />
      </div>
    )) satisfies Decorator,
  ],
} satisfies Meta<typeof LeftRail>

type Story = StoryObj<typeof LeftRail>

function withState(scene: Scene, role: Role = 'advisor'): Decorator {
  return (Story) => {
    useAppStore.setState((prev) => ({ ...prev, scene, role, deepDive: null }))
    return <Story />
  }
}

export const Briefing: Story = {
  decorators: [withState('briefing')],
}

export const Clients: Story = {
  decorators: [withState('clients')],
}

export const Actives: Story = {
  decorators: [withState('actives')],
}

export const Business: Story = {
  decorators: [withState('business')],
}

export const Plan: Story = {
  decorators: [withState('plan')],
}

export const CanvasMode: Story = {
  name: 'Canvas Mode Active',
  decorators: [
    ((Story) => {
      useAppStore.setState((prev) => ({ ...prev, scene: 'canvas', role: 'advisor', deepDive: null }))
      return <Story />
    }) satisfies Decorator,
  ],
}

export const AssistantRole: Story = {
  name: 'Assistant Role',
  decorators: [withState('briefing', 'assistant')],
}
