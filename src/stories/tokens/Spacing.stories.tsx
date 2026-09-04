import type { Meta, StoryObj } from '@storybook/react'

export default {
  title: 'Design System / Spacing',
  parameters: { controls: { disable: true }, layout: 'padded' },
} satisfies Meta

// ---------------------------------------------------------------------------

const SPACING = [2, 4, 8, 12, 16, 24, 32, 40, 48, 56, 64, 80, 96]

const RADII = [
  { token: '--radius-sm', label: 'SM', value: '4px' },
  { token: '--radius-md', label: 'MD', value: '8px' },
  { token: '--radius-lg', label: 'LG', value: '12px' },
  { token: '--radius-pill', label: 'Pill', value: '999px' },
]

// ---------------------------------------------------------------------------

export const Scale: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10.5, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-body-muted)', marginBottom: 8 }}>
        Spacing Scale
      </p>
      {SPACING.map((px) => (
        <div key={px} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 80, flexShrink: 0, display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'center' }}>
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-body-muted)', width: 30, textAlign: 'right' }}>
              {px}px
            </code>
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-body-faint)' }}>
              --space-{px}
            </code>
          </div>
          <div style={{
            height: 20,
            width: px,
            background: 'var(--nyl-blue-500)',
            borderRadius: 3,
            opacity: 0.7,
            flexShrink: 0,
          }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-body-faint)' }}>
            var(--space-{px})
          </span>
        </div>
      ))}
    </div>
  ),
}

export const Radii: StoryObj = {
  render: () => (
    <div>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10.5, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-body-muted)', marginBottom: 20 }}>
        Border Radius
      </p>
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        {RADII.map(({ token, label, value }) => (
          <div key={token} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 80, height: 80,
              background: 'var(--nyl-blue-100)',
              border: '1.5px solid var(--nyl-blue-500)',
              borderRadius: `var(${token})`,
            }} />
            <div style={{ textAlign: 'center' }}>
              <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, color: 'var(--text-body)' }}>{label}</span>
              <code style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-body-muted)' }}>{value}</code>
              <code style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-body-faint)', marginTop: 2 }}>{token}</code>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
}
