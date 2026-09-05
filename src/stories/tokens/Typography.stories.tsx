import type { Meta, StoryObj } from '@storybook/react'

export default {
  title: 'Design System / Typography',
  parameters: { controls: { disable: true }, layout: 'padded' },
} satisfies Meta

// ---------------------------------------------------------------------------

const SCALE = [
  { token: '--size-display-01', lineToken: '--line-display-01', label: 'Display 01', size: 56, line: 64 },
  { token: '--size-display-02', lineToken: '--line-display-02', label: 'Display 02', size: 48, line: 56 },
  { token: '--size-display-03', lineToken: '--line-display-03', label: 'Display 03', size: 40, line: 48 },
  { token: '--size-xl-01', lineToken: '--line-xl-01', label: 'XL 01', size: 32, line: 40 },
  { token: '--size-lg-01', lineToken: '--line-lg-01', label: 'LG 01', size: 24, line: 32 },
  { token: '--size-md-01', lineToken: '--line-md-01', label: 'MD 01', size: 18, line: 28 },
  { token: '--size-sm-01', lineToken: '--line-sm-01', label: 'SM 01', size: 14, line: 20 },
  { token: '--size-xs-01', lineToken: '--line-xs-01', label: 'XS 01', size: 12, line: 16 },
]

const WEIGHTS = [
  { name: 'Light', value: 300, token: '--weight-light' },
  { name: 'Regular', value: 400, token: '--weight-regular' },
  { name: 'Medium', value: 500, token: '--weight-medium' },
  { name: 'Semibold', value: 600, token: '--weight-semibold' },
  { name: 'Bold', value: 700, token: '--weight-bold' },
]

// ---------------------------------------------------------------------------

export const Scale: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {SCALE.map(({ token, lineToken, label, size, line }) => (
        <div
          key={token}
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 24,
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: 12,
          }}
        >
          <div
            style={{
              width: 80,
              flexShrink: 0,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--text-body-muted)',
            }}
          >
            <span style={{ display: 'block' }}>{label}</span>
            <span style={{ display: 'block' }}>
              {size}/{line}
            </span>
            <code style={{ display: 'block', fontSize: 9, color: 'var(--text-body-faint)' }}>{token}</code>
            <code style={{ display: 'block', fontSize: 9, color: 'var(--text-body-faint)' }}>{lineToken}</code>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: `var(${token})`,
              lineHeight: `var(${lineToken})`,
              color: 'var(--text-body)',
              margin: 0,
            }}
          >
            The quick brown fox
          </p>
        </div>
      ))}
    </div>
  ),
}

export const SerifScale: StoryObj = {
  name: 'Serif Scale (Alverata)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {SCALE.slice(0, 5).map(({ token, lineToken, label, size, line }) => (
        <div
          key={token}
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 24,
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: 12,
          }}
        >
          <div
            style={{
              width: 80,
              flexShrink: 0,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--text-body-muted)',
            }}
          >
            <span style={{ display: 'block' }}>{label}</span>
            <span style={{ display: 'block' }}>
              {size}/{line}
            </span>
          </div>
          <p
            className="headline"
            style={{
              fontSize: `var(${token})`,
              lineHeight: `var(${lineToken})`,
              margin: 0,
            }}
          >
            New York Life — NYL360
          </p>
        </div>
      ))}
    </div>
  ),
}

export const Weights: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {WEIGHTS.map(({ name, value, token }) => (
        <div
          key={token}
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 24,
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: 12,
          }}
        >
          <div style={{ width: 120, flexShrink: 0 }}>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                color: 'var(--text-body-muted)',
                display: 'block',
              }}
            >
              {name}
            </span>
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-body-faint)' }}>
              {token} ({value})
            </code>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 24,
              fontWeight: value,
              color: 'var(--text-body)',
              margin: 0,
            }}
          >
            NYL360 — Nyla
          </p>
        </div>
      ))}
    </div>
  ),
}

export const Families: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 10.5,
            fontWeight: 500,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--text-body-muted)',
            marginBottom: 8,
          }}
        >
          Sans — Roboto · <code style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>--font-sans</code>
        </p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 24, color: 'var(--text-body)', margin: 0 }}>
          AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz 0123456789
        </p>
      </div>

      <div>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 10.5,
            fontWeight: 500,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--text-body-muted)',
            marginBottom: 8,
          }}
        >
          Serif — Alverata · <code style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>--font-serif</code>
        </p>
        <p className="headline" style={{ fontSize: 24, margin: 0 }}>
          AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz 0123456789
        </p>
      </div>

      <div>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 10.5,
            fontWeight: 500,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--text-body-muted)',
            marginBottom: 8,
          }}
        >
          Mono — Roboto Mono · <code style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>--font-mono</code>
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-body)', margin: 0 }}>
          AaBbCcDdEeFfGgHhIi 0123456789 {'{ } [ ] ( ) ; : . , ='}
        </p>
      </div>
    </div>
  ),
}

export const UtilityClasses: StoryObj = {
  name: 'Utility Classes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <code
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--text-body-muted)',
            display: 'block',
            marginBottom: 8,
          }}
        >
          .headline
        </code>
        <p className="headline" style={{ fontSize: 32, margin: 0 }}>
          Serif headline, editorial restraint
        </p>
      </div>
      <div>
        <code
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--text-body-muted)',
            display: 'block',
            marginBottom: 8,
          }}
        >
          .eyebrow
        </code>
        <p className="eyebrow" style={{ margin: 0 }}>
          Eyebrow label — section divider
        </p>
      </div>
      <div>
        <code
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--text-body-muted)',
            display: 'block',
            marginBottom: 8,
          }}
        >
          .accent
        </code>
        <p className="accent" style={{ fontSize: 16, fontFamily: 'var(--font-sans)', margin: 0 }}>
          Accent text in brand blue
        </p>
      </div>
    </div>
  ),
}
