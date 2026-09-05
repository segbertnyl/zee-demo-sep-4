import type { Meta, StoryObj } from '@storybook/react'
import { DriftingBlobs, HighlightBlob } from './OnboardingIntroOverlay'
import bgIntroOverlay from '@/assets/bg-intro-overlay.png'

export default {
  title: 'UI / Backgrounds / Intro — Overlay',
  parameters: {
    layout: 'fullscreen',
    backgrounds: { disable: true },
  },
} satisfies Meta

type Story = StoryObj

export const Default: Story = {
  name: 'Intro — Overlay',
  render: () => (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: 'var(--bg-overlay-dark)',
        overflow: 'hidden',
      }}
    >
      <img
        src={bgIntroOverlay}
        alt=""
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      <HighlightBlob />
      <DriftingBlobs />
    </div>
  ),
}
