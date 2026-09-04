import type { Meta, StoryObj } from '@storybook/react'
import { SectionActions } from './SectionActions'

export default {
  title: 'UI / SectionActions',
  component: SectionActions,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    theme: { control: 'radio', options: ['default', 'dark'] },
  },
} satisfies Meta<typeof SectionActions>

type Story = StoryObj<typeof SectionActions>

// ── Playground ────────────────────────────────────────────────────────────────

export const Playground: Story = {
  args: {
    actions: [
      { label: 'See other council levels', variant: 'secondary' },
      { label: "Don't set council goal", variant: 'secondary' },
      { label: 'Go for Executive Council', variant: 'primary' },
    ],
  },
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

function Fixture({ label, dark = false, children }: { label: string; dark?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="eyebrow">{label}</p>
      <div className={`rounded-2xl border p-6 ${dark ? 'border-white/10 bg-[var(--nyl-blue-800)]' : 'border-neutral-100 bg-[var(--bg-surface)]'}`}>
        {children}
      </div>
    </div>
  )
}

export const AllPatterns: Story = {
  name: 'All patterns',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-8">
      <Fixture label="Primary + two secondary">
        <SectionActions actions={[
          { label: 'See other council levels', variant: 'secondary' },
          { label: "Don't set council goal", variant: 'secondary' },
          { label: 'Go for Executive Council', variant: 'primary' },
        ]} />
      </Fixture>

      <Fixture label="Primary + secondary">
        <SectionActions actions={[
          { label: "There's an issue", variant: 'secondary' },
          { label: 'This looks good', variant: 'primary' },
        ]} />
      </Fixture>

      <Fixture label="Ghost + primary">
        <SectionActions actions={[
          { label: 'Something seems wrong', variant: 'ghost' },
          { label: 'Looks good', variant: 'primary' },
        ]} />
      </Fixture>

      <Fixture label="Single primary">
        <SectionActions actions={[
          { label: 'Continue', variant: 'primary' },
        ]} />
      </Fixture>

      <Fixture label="Primary always sorts right (regardless of array order)" >
        <SectionActions actions={[
          { label: 'Primary passed first', variant: 'primary' },
          { label: 'Secondary passed second', variant: 'secondary' },
        ]} />
      </Fixture>
    </div>
  ),
}

export const DarkTheme: Story = {
  name: 'Dark theme',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-8">
      <Fixture label="Dark — primary + secondary" dark>
        <SectionActions theme="dark" actions={[
          { label: 'Skip for now', variant: 'secondary' },
          { label: 'Continue', variant: 'primary' },
        ]} />
      </Fixture>
      <Fixture label="Dark — ghost + primary" dark>
        <SectionActions theme="dark" actions={[
          { label: 'Something seems wrong', variant: 'ghost' },
          { label: 'Looks good', variant: 'primary' },
        ]} />
      </Fixture>
    </div>
  ),
}
