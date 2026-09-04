import type { Meta, StoryObj } from '@storybook/react'
import { GoalChip, type GoalIconName } from './GoalChip'

export default {
  title: 'UI / GoalChip',
  component: GoalChip,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    icon: {
      control: 'select',
      options: ['client', 'council', 'email', 'followup', 'fyc', 'growth', 'network', 'protect', 'succession', 'support'] satisfies GoalIconName[],
    },
  },
  args: { icon: 'client', label: 'Goal chip' },
} satisfies Meta<typeof GoalChip>

type Story = StoryObj<typeof GoalChip>

export const Playground: Story = {}

export const AllIcons: Story = {
  name: 'All icons',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', maxWidth: 600 }}>
      {(['client', 'council', 'email', 'followup', 'fyc', 'growth', 'network', 'protect', 'succession', 'support'] satisfies GoalIconName[]).map(name => (
        <GoalChip key={name} icon={name} label={name} />
      ))}
    </div>
  ),
}
