import type { Meta, StoryObj } from '@storybook/react'
import { TextInput } from './TextInput'

export default {
  title: 'UI / TextInput',
  component: TextInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TextInput>

type Story = StoryObj<typeof TextInput>

/* ── Numeric variant (default) — for dollar amounts and quantitative values */

export const NumericDefault: Story = {
  name: 'Numeric — with value',
  args: { variant: 'numeric', value: '$ 47,000' },
}

export const NumericEmpty: Story = {
  name: 'Numeric — empty',
  args: { variant: 'numeric', placeholder: 'Enter amount' },
}

/* ── Text variant — for free-text strings; placeholder italic + muted */

export const TextDefault: Story = {
  name: 'Text — with value',
  args: { variant: 'text', value: 'Spend more time with family' },
}

export const TextEmpty: Story = {
  name: 'Text — empty (italic placeholder)',
  args: { variant: 'text', placeholder: 'Tell me in your own words...' },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 600 }}>
      <div>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--text-body-muted)',
            marginBottom: 8,
          }}
        >
          Numeric — quantitative values
        </p>
        <TextInput variant="numeric" value="$ 47,000" />
      </div>
      <div>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--text-body-muted)',
            marginBottom: 8,
          }}
        >
          Text — free-text strings
        </p>
        <TextInput variant="text" placeholder="Tell me in your own words..." />
      </div>
    </div>
  ),
}
