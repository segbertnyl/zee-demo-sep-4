import type { Meta, StoryObj } from '@storybook/react'
import { ICONS, type IconName } from './index'

/* 🆕 NEW (briefing-v6) — icon library pulled from the Exploration pt-II Figma.
 * Use these components everywhere instead of inline SVGs. */

export default {
  title: 'Design System / Icons  🆕',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta

type Story = StoryObj

const names = Object.keys(ICONS) as IconName[]

export const Gallery: Story = {
  name: 'All icons',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
      {names.map((name) => {
        const Icon = ICONS[name]
        return (
          <div
            key={name}
            className="flex flex-col items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-white p-5"
          >
            <Icon size={24} className="text-[var(--text-headline)]" />
            <code className="text-[11px] text-[var(--text-body-muted)]">{name}</code>
          </div>
        )
      })}
    </div>
  ),
}

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-end gap-6 text-[var(--text-accent)]">
      {[12, 16, 20, 24, 32].map((s) => (
        <div key={s} className="flex flex-col items-center gap-2">
          <ICONS.person size={s} />
          <code className="text-[11px] text-[var(--text-body-muted)]">{s}px</code>
        </div>
      ))}
    </div>
  ),
}

export const ColorInheritance: Story = {
  name: 'Color (currentColor)',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex gap-6">
      <ICONS.attachMoney size={28} className="text-[var(--nyl-purple-600)]" />
      <ICONS.phone size={28} className="text-[var(--action-primary)]" />
      <ICONS.book size={28} className="text-[var(--badge-opportunity)]" />
      <ICONS.email size={28} className="text-[var(--text-body-muted)]" />
    </div>
  ),
}
