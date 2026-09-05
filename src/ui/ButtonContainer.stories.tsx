import type { Meta, StoryObj } from '@storybook/react'
import { ButtonContainer } from './ButtonContainer'

export default {
  title: 'UI / ButtonContainer',
  component: ButtonContainer,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    primaryLabel: { control: 'text' },
    secondaryLabel: { control: 'text' },
    secondaryVariant: { control: 'select', options: ['text', 'secondary'] },
    showSecondary: { control: 'boolean' },
  },
  args: {
    primaryLabel: 'Next',
    secondaryLabel: 'Skip',
    secondaryVariant: 'text',
    showSecondary: true,
    primaryDisabled: false,
  },
} satisfies Meta<typeof ButtonContainer>

type Story = StoryObj<typeof ButtonContainer>

export const Default: Story = {}

export const OutlinedSecondary: Story = {
  name: 'OutlinedSecondary',
  args: {
    secondaryVariant: 'secondary',
  },
}

export const PrimaryOnly: Story = {
  name: 'PrimaryOnly',
  args: {
    showSecondary: false,
  },
}

export const CustomLabels: Story = {
  name: 'CustomLabels',
  args: {
    secondaryLabel: 'Back',
    primaryLabel: 'Continue',
  },
}

const label = (text: string) => (
  <p
    style={{
      fontFamily: 'var(--font-sans)',
      fontSize: 10.5,
      fontWeight: 500,
      letterSpacing: '0.22em',
      textTransform: 'uppercase' as const,
      color: 'var(--text-body-muted)',
      marginBottom: 8,
    }}
  >
    {text}
  </p>
)

export const AllVariants: Story = {
  name: 'AllVariants',
  parameters: { controls: { disable: true }, layout: 'padded', backgrounds: { default: 'light' } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: 'white', padding: 24 }}>
      {label('Text secondary (default)')}
      <ButtonContainer secondaryVariant="text" showSecondary={true} />

      {label('Outlined secondary')}
      <ButtonContainer secondaryVariant="secondary" showSecondary={true} />

      {label('Primary only')}
      <ButtonContainer showSecondary={false} />
    </div>
  ),
}
