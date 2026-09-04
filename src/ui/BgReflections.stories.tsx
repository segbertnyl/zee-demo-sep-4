import type { Meta, StoryObj } from '@storybook/react'
import { BgReflections } from './BgReflections'
import type { BgReflectionsVariant } from './BgReflections'

export default {
  title: 'UI / Backgrounds / Reflections',
  component: BgReflections,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { disable: true },
    docs: {
      description: {
        component: [
          'Full-bleed gradient backgrounds for the Year in Review reflections flow (Figma node 1300-13013).',
          '',
          'Four color variants — purple, blue, green, orange — each rendered as a full-bleed image',
          'that fills its container with object-fit: cover.',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['purple', 'blue', 'green', 'orange'] satisfies BgReflectionsVariant[],
    },
  },
} satisfies Meta<typeof BgReflections>

type Story = StoryObj<typeof BgReflections>

const fullscreen = { width: '100vw', height: '100vh' }

export const Purple: Story = {
  render: () => <BgReflections variant="purple" style={fullscreen} />,
}

export const Blue: Story = {
  render: () => <BgReflections variant="blue" style={fullscreen} />,
}

export const Green: Story = {
  render: () => <BgReflections variant="green" style={fullscreen} />,
}

export const Orange: Story = {
  render: () => <BgReflections variant="orange" style={fullscreen} />,
}

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100vw', height: '100vh' }}>
      {(['purple', 'blue', 'green', 'orange'] satisfies BgReflectionsVariant[]).map((v) => (
        <div key={v} style={{ position: 'relative' }}>
          <BgReflections variant={v} style={{ width: '100%', height: '100%' }} />
          <span style={{
            position: 'absolute', bottom: 12, left: 16,
            color: 'white', fontSize: 12, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            textShadow: '0 1px 4px rgba(0,0,0,0.4)',
          }}>{v}</span>
        </div>
      ))}
    </div>
  ),
}
