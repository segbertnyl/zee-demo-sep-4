import type { Meta, StoryObj } from '@storybook/react'
import { NylaGuidance } from './NylaGuidance'

export default {
  title: 'UI / NylaGuidance',
  component: NylaGuidance,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    text: { control: 'text' },
  },
} satisfies Meta<typeof NylaGuidance>

type Story = StoryObj<typeof NylaGuidance>

export const Default: Story = {
  args: {
    text: "Your client base grew 22% last year—amazing work, but you could be hitting a capacity wall in the near future. If you can't decide, think about which 3 you'd want to do first or are most on your mind.",
  },
}

export const ShortText: Story = {
  args: {
    text: 'Your client base grew 22% last year—amazing work, but you could be hitting a capacity wall in the near future.',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '280px' }}>
      <NylaGuidance text="Your client base grew 22% last year—amazing work, but you could be hitting a capacity wall in the near future. If you can't decide, think about which 3 you'd want to do first or are most on your mind." />
      <NylaGuidance text="Your client base grew 22% last year—amazing work, but you could be hitting a capacity wall in the near future." />
    </div>
  ),
}
