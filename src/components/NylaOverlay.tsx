/* ---------------------------------------------------------------------------
 * NylaOverlay — floating dev overlay showing every in-use Nyla size.
 * Toggle with the N key. Close with Esc or click the backdrop.
 * --------------------------------------------------------------------------- */
import { useEffect } from 'react'
import { Nyla } from '@/ui/Nyla'

// ── Shared constants ──────────────────────────────────────────────────────────

const DEEP =
  'radial-gradient(100% 85% at 52% 110%, #b87be2 0%, #6f4fd6 26%, rgba(111,79,214,0) 62%), linear-gradient(120deg, #2a0f57 0%, #3a2491 42%, #4a52e0 74%, #6a44c8 100%)'

/* The size ramp — mirrors NYLA_SIZE_TIERS + the In Context story. */
const SIZES: { size: number; label: string; context: string; bg: 'dark' | 'light' }[] = [
  { size: 24, label: '24px', context: 'Button / inline icon', bg: 'light' },
  { size: 40, label: '40px', context: 'Launcher / badge', bg: 'dark' },
  { size: 64, label: '64px', context: 'Guidance callout', bg: 'light' },
  { size: 96, label: '96px', context: 'Card (Year in Review)', bg: 'dark' },
  { size: 160, label: '160px', context: 'Section intro / Discovery', bg: 'light' },
  { size: 256, label: '256px', context: 'Hero', bg: 'dark' },
]

// ── Component ─────────────────────────────────────────────────────────────────

interface NylaOverlayProps {
  onClose: () => void
}

export function NylaOverlay({ onClose }: NylaOverlayProps) {
  // Esc key closes the overlay
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Nyla size reference"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        background: 'rgba(0,10,62,0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflowY: 'auto',
        padding: '40px 32px 64px',
      }}
    >
      {/* Inner panel — stops click propagation so backdrop click closes cleanly */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 760,
          display: 'flex',
          flexDirection: 'column',
          gap: 40,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontFamily: 'var(--font-serif)',
                fontWeight: 400,
                fontSize: 28,
                color: '#ffffff',
                letterSpacing: '0.01em',
              }}
            >
              Nyla · The Collective
            </h2>
            <p
              style={{
                margin: '6px 0 0',
                fontSize: 13,
                color: 'rgba(255,255,255,0.45)',
                letterSpacing: '0.04em',
              }}
            >
              Press N to close · all in-use sizes
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close overlay"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8,
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              fontSize: 13,
              letterSpacing: '0.06em',
              padding: '6px 14px',
              fontFamily: 'var(--font-sans)',
              textTransform: 'uppercase',
            }}
          >
            Esc
          </button>
        </div>

        {/* Feature preview — large animated instance */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            background: DEEP,
            borderRadius: 20,
            padding: '40px 32px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Nyla size={256} variant="on-dark" animate />
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.85)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              256px · Hero
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Animated</div>
          </div>
        </div>

        {/* Size grid */}
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'rgba(255,255,255,0.35)',
              marginBottom: 16,
            }}
          >
            In-use sizes
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
              alignItems: 'flex-start',
            }}
          >
            {SIZES.map(({ size: s, label, context, bg }) => {
              const isDark = bg === 'dark'
              const tileSize = Math.max(s + 52, 96)
              return (
                <div
                  key={`${s}-${context}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: tileSize,
                      height: tileSize,
                      borderRadius: 12,
                      background: isDark ? DEEP : '#ffffff',
                      display: 'grid',
                      placeItems: 'center',
                      boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,10,98,0.14)',
                      border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,10,98,0.08)',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    <Nyla size={s} variant={isDark ? 'on-dark' : 'on-light'} animate={false} />
                  </div>
                  <div style={{ textAlign: 'center', maxWidth: tileSize }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'rgba(255,255,255,0.9)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.4)',
                        marginTop: 3,
                        lineHeight: 1.4,
                      }}
                    >
                      {context}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
