import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'
import type { ButtonVariant, ButtonTheme } from './Button'

export default {
  title: 'Components / Button',
  component: Button,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'radio', options: ['primary', 'secondary', 'text', 'outlined', 'icon'] },
    theme: { control: 'radio', options: ['default', 'dark'] },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
  },
  args: {
    children: 'Button text',
    variant: 'primary',
    theme: 'default',
    disabled: false,
  },
} satisfies Meta<typeof Button>

type Story = StoryObj<typeof Button>

// ---------------------------------------------------------------------------
// Playground — full controls
// ---------------------------------------------------------------------------

export const Playground: Story = {}

// ---------------------------------------------------------------------------
// Enabled + Disabled side-by-side per variant
// ---------------------------------------------------------------------------

function Pair({ variant, theme = 'default' }: { variant: ButtonVariant; theme?: ButtonTheme }) {
  const bg = theme === 'dark' ? 'bg-[var(--nyl-blue-800)]' : ''
  return (
    <div className={`flex items-center gap-6 rounded-xl p-6 ${bg}`}>
      <Button variant={variant} theme={theme}>Button text</Button>
      <Button variant={variant} theme={theme} disabled>Button text</Button>
    </div>
  )
}

export const PrimaryDefault: Story = {
  name: 'Primary / Default',
  parameters: { controls: { disable: true } },
  render: () => <Pair variant="primary" />,
}

export const PrimaryDark: Story = {
  name: 'Primary / Dark',
  parameters: { controls: { disable: true }, backgrounds: { default: 'dark' } },
  render: () => <Pair variant="primary" theme="dark" />,
}

export const SecondaryDefault: Story = {
  name: 'Secondary / Default',
  parameters: { controls: { disable: true } },
  render: () => <Pair variant="secondary" />,
}

export const SecondaryDark: Story = {
  name: 'Secondary / Dark',
  parameters: { controls: { disable: true }, backgrounds: { default: 'dark' } },
  render: () => <Pair variant="secondary" theme="dark" />,
}

export const TextDefault: Story = {
  name: 'Text / Default',
  parameters: { controls: { disable: true } },
  render: () => <Pair variant="text" />,
}

export const TextDark: Story = {
  name: 'Text / Dark',
  parameters: { controls: { disable: true }, backgrounds: { default: 'dark' } },
  render: () => <Pair variant="text" theme="dark" />,
}

// ---------------------------------------------------------------------------
// Full matrix — all variants × themes, enabled + disabled
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Outlined — enabled, hover (inspect), disabled
// ---------------------------------------------------------------------------

export const OutlinedDefault: Story = {
  name: 'Outlined / Default',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-6 rounded-xl p-6">
      <Button variant="outlined">Button text</Button>
      <Button variant="outlined" disabled>Button text</Button>
    </div>
  ),
}

// ---------------------------------------------------------------------------
// Icon — enabled, disabled (Figma 926:9262 nav arrows)
// ---------------------------------------------------------------------------

function UpArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 7 L7 2 L12 7" /><path d="M7 2 V12" />
    </svg>
  )
}
function DownArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 7 L7 12 L12 7" /><path d="M7 12 V2" />
    </svg>
  )
}

export const IconDefault: Story = {
  name: 'Icon / Default',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-6 rounded-xl p-6">
      <Button variant="icon" aria-label="Previous"><UpArrow /></Button>
      <Button variant="icon" aria-label="Next"><DownArrow /></Button>
      <Button variant="icon" disabled aria-label="Previous (disabled)"><UpArrow /></Button>
    </div>
  ),
}

// ---------------------------------------------------------------------------
// All Variants
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'All Variants',
  parameters: { controls: { disable: true }, layout: 'padded' },
  render: () => {
    const variants: ButtonVariant[] = ['primary', 'secondary', 'text', 'outlined']
    const label = (text: string) => (
      <p key={text} style={{ fontFamily: 'var(--font-sans)', fontSize: 10.5, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: 'var(--text-body-muted)', marginBottom: 8 }}>
        {text}
      </p>
    )
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {label('Default theme — enabled / disabled')}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 rounded-xl border border-neutral-200 bg-white p-6">
          {variants.flatMap((v) => [
            <Button key={v} variant={v}>Button text</Button>,
            <Button key={`${v}-off`} variant={v} disabled>Button text</Button>,
          ])}
        </div>

        <div style={{ marginTop: 16 }} />
        {label('Dark theme — enabled / disabled')}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 rounded-xl bg-[var(--nyl-blue-800)] p-6">
          {variants.flatMap((v) => [
            <Button key={v} variant={v} theme="dark">Button text</Button>,
            <Button key={`${v}-off`} variant={v} theme="dark" disabled>Button text</Button>,
          ])}
        </div>
      </div>
    )
  },
}
