import type { Meta, StoryObj } from '@storybook/react'
import { NYLLogo } from './NYLLogo'

export default {
  title: 'Components / NYLLogo',
  component: NYLLogo,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    pixelSize: { control: { type: 'number', min: 16, max: 256, step: 4 } },
  },
} satisfies Meta<typeof NYLLogo>

type Story = StoryObj<typeof NYLLogo>

export const Default: Story = {
  args: { size: 'md' },
}

export const AllSizes: Story = {
  name: 'All Sizes',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 32, padding: 24 }}>
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <NYLLogo size={size} />
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-body-muted)' }}>
            size="{size}"
          </code>
        </div>
      ))}
    </div>
  ),
}

export const OnDark: Story = {
  name: 'On Dark Background',
  parameters: { backgrounds: { default: 'dark' }, controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, padding: 24 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <NYLLogo key={size} size={size} />
      ))}
    </div>
  ),
}
