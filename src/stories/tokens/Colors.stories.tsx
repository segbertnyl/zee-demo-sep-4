import type { Meta, StoryObj } from '@storybook/react'

export default {
  title: 'Design System / Colors',
  parameters: { controls: { disable: true }, layout: 'padded' },
} satisfies Meta

// ---------------------------------------------------------------------------

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 10.5,
          fontWeight: 500,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--text-body-muted)',
          marginBottom: 16,
        }}
      >
        {label}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
        {children}
      </div>
    </section>
  )
}

function Swatch({ token, label, hex }: { token: string; label?: string; hex?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 12px',
        borderRadius: 8,
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 6,
          flexShrink: 0,
          background: `var(${token})`,
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
        }}
      />
      <div style={{ minWidth: 0 }}>
        <code
          style={{
            display: 'block',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-body)',
            lineHeight: 1.4,
          }}
        >
          {token}
        </code>
        {label && (
          <span
            style={{
              display: 'block',
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              color: 'var(--text-body-muted)',
              marginTop: 2,
            }}
          >
            {label}
          </span>
        )}
        {hex && (
          <code
            style={{
              display: 'block',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--text-body-faint)',
              marginTop: 1,
            }}
          >
            {hex}
          </code>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

export const Primitives: StoryObj = {
  render: () => (
    <div>
      <Group label="Grayscale">
        <Swatch token="--nyl-white" label="White" hex="#ffffff" />
        <Swatch token="--nyl-gray-025" label="Gray 025" hex="#faf9f8" />
        <Swatch token="--nyl-gray-050" label="Gray 050" hex="#f0efed" />
        <Swatch token="--nyl-gray-100" label="Gray 100" hex="#e8e6e4" />
        <Swatch token="--nyl-gray-150" label="Gray 150" hex="#d6d3d0" />
        <Swatch token="--nyl-gray-250" label="Gray 250" hex="#c2bfbd" />
        <Swatch token="--nyl-gray-300" label="Gray 300" hex="#b3afac" />
        <Swatch token="--nyl-gray-500" label="Gray 500" hex="#76757a" />
        <Swatch token="--nyl-gray-700" label="Gray 700" hex="#4b4c52" />
        <Swatch token="--nyl-gray-800" label="Gray 800" hex="#313238" />
        <Swatch token="--nyl-gray-900" label="Gray 900" hex="#17181c" />
        <Swatch token="--nyl-gray-warm" label="Gray Warm (Pantone Warm Gray 1)" hex="#e3e0dd" />
      </Group>

      <Group label="Blue — Brand">
        <Swatch token="--nyl-blue-100" label="Blue 100" hex="#cce3ff" />
        <Swatch token="--nyl-blue-250" label="Blue 250 — Brand Light Blue" hex="#80baff" />
        <Swatch token="--nyl-blue-500" label="Blue 500 — Brand Blue" hex="#0468ff" />
        <Swatch token="--nyl-blue-600" label="Blue 600" hex="#0044cc" />
        <Swatch token="--nyl-blue-800" label="Blue 800 — Brand Dark Blue" hex="#000a62" />
      </Group>

      <Group label="Green">
        <Swatch token="--nyl-green-200" label="Green 200" hex="#a5efbf" />
        <Swatch token="--nyl-green-600" label="Green 600" hex="#1ab382" />
        <Swatch token="--nyl-green-800" label="Green 800" hex="#016355" />
      </Group>

      <Group label="Orange — Brand">
        <Swatch token="--nyl-orange-100" label="Orange 100 — Pantone 155" hex="#ffe8cf" />
        <Swatch token="--nyl-orange-400" label="Orange 400 — Pantone 2013" hex="#ff9522" />
        <Swatch token="--nyl-orange-500" label="Orange 500 — Hover" hex="#f2840d" />
      </Group>

      <Group label="Purple — Brand">
        <Swatch token="--nyl-purple-100" label="Purple 100" hex="#eaccff" />
        <Swatch token="--nyl-purple-600" label="Purple 600" hex="#7028a4" />
        <Swatch token="--nyl-purple-700" label="Purple 700 — Pantone 2607" hex="#4d1773" />
      </Group>

      <Group label="Data Visualization">
        <Swatch token="--dv-blue-01" label="DV Blue 01" />
        <Swatch token="--dv-blue-02" label="DV Blue 02" />
        <Swatch token="--dv-blue-03" label="DV Blue 03" />
        <Swatch token="--dv-green-01" label="DV Green 01" />
        <Swatch token="--dv-green-02" label="DV Green 02" />
        <Swatch token="--dv-orange" label="DV Orange" />
        <Swatch token="--dv-purple" label="DV Purple" />
        <Swatch token="--dv-gray" label="DV Gray" />
      </Group>
    </div>
  ),
}

export const Semantic: StoryObj = {
  render: () => (
    <div>
      <Group label="Surfaces">
        <Swatch token="--bg-canvas" label="Canvas" />
        <Swatch token="--bg-surface" label="Surface" />
        <Swatch token="--bg-surface-elevated" label="Surface Elevated" />
        <Swatch token="--bg-surface-subtle" label="Surface Subtle" />
        <Swatch token="--bg-surface-disabled" label="Surface Disabled" />
        <Swatch token="--bg-surface-translucent" label="Surface Translucent" />
        <Swatch token="--bg-inverse" label="Inverse (Dark Blue)" />
        <Swatch token="--bg-canvas-dark" label="Canvas Dark (hero bands)" />
      </Group>

      <Group label="Text">
        <Swatch token="--text-headline" label="Headline" />
        <Swatch token="--text-headline-muted" label="Headline Muted" />
        <Swatch token="--text-body" label="Body" />
        <Swatch token="--text-body-muted" label="Body Muted" />
        <Swatch token="--text-body-faint" label="Body Faint" />
        <Swatch token="--text-accent" label="Accent" />
      </Group>

      <Group label="Borders">
        <Swatch token="--border-subtle" label="Subtle (8% black)" />
        <Swatch token="--border-default" label="Default (14% black)" />
        <Swatch token="--border-strong" label="Strong (28% black)" />
        <Swatch token="--border-brand" label="Brand" />
      </Group>

      <Group label="Actions">
        <Swatch token="--action-primary" label="Primary" />
        <Swatch token="--action-primary-hover" label="Primary Hover" />
        <Swatch token="--action-on-primary" label="On Primary (text)" />
        <Swatch token="--action-ai" label="AI — agent-initiated actions" />
        <Swatch token="--action-ai-hover" label="AI Hover" />
        <Swatch token="--action-ai-soft" label="AI Soft" />
        <Swatch token="--action-ai-ring" label="AI Ring" />
        <Swatch token="--focus-ring" label="Focus Ring" />
      </Group>

      <Group label="Client Priority Tiers">
        <Swatch token="--tier-a" label="Tier A — top (green)" />
        <Swatch token="--tier-a-soft" label="Tier A Soft" />
        <Swatch token="--tier-b" label="Tier B — orange" />
        <Swatch token="--tier-b-soft" label="Tier B Soft" />
        <Swatch token="--tier-c" label="Tier C — blue" />
        <Swatch token="--tier-c-soft" label="Tier C Soft" />
        <Swatch token="--tier-d" label="Tier D — warm gray" />
        <Swatch token="--tier-d-soft" label="Tier D Soft" />
      </Group>

      <Group label="Goal Status">
        <Swatch token="--status-on-track" label="On Track" />
        <Swatch token="--status-on-track-soft" label="On Track Soft" />
        <Swatch token="--status-stretch" label="Stretch" />
        <Swatch token="--status-stretch-soft" label="Stretch Soft" />
        <Swatch token="--status-off-course" label="Off Course" />
        <Swatch token="--status-off-course-soft" label="Off Course Soft" />
      </Group>

      <Group label="Network Node Colors">
        <Swatch token="--node-client" label="Client Node" />
        <Swatch token="--node-prospect" label="Prospect Node" />
        <Swatch token="--node-dim-mix" label="Node Dim" />
      </Group>
    </div>
  ),
}

export const LifeEventTriggers: StoryObj = {
  name: 'Life Event Triggers',
  render: () => (
    <div>
      <Group label="Trigger → DV Color Map">
        <Swatch token="--trigger-new-home" label="New Home" />
        <Swatch token="--trigger-birth" label="Birth" />
        <Swatch token="--trigger-job-change" label="Job Change" />
        <Swatch token="--trigger-term-expiring" label="Term Expiring" />
        <Swatch token="--trigger-no-touch-60" label="No Touch 60 days" />
        <Swatch token="--trigger-no-touch-90" label="No Touch 90 days" />
        <Swatch token="--trigger-wealth-milestone" label="Wealth Milestone" />
        <Swatch token="--trigger-business-sale" label="Business Sale" />
      </Group>
    </div>
  ),
}
