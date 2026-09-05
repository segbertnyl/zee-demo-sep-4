import type { Meta, StoryObj } from '@storybook/react'
import { BriefingTour, type TourStep } from './BriefingTour'

/* The onboarding tour normally spotlights nav-rail targets in the Briefing v6
 * scene. In isolation those targets don't exist, so every step renders as the
 * centered, page-level card (step 1's treatment) — useful for reviewing the
 * card design, copy, progress dots, and Next/Skip/replay affordances. */
const meta = {
  title: 'UI / BriefingTour',
  component: BriefingTour,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof BriefingTour>

export default meta
type Story = StoryObj<typeof BriefingTour>

const STEPS: TourStep[] = [
  {
    eyebrow: 'Morning briefing',
    title: 'Your morning briefing lives here.',
    body: 'Each morning, Nyla lays out a strategically prioritized set of actions for your day — what to read, what to act on, and what’s running in the background. Open it from the left rail anytime.',
  },
  {
    eyebrow: 'Your plan',
    title: 'Your plan lives here.',
    body: 'This is the plan you just accepted — it lives on your Plan page and keeps evolving over time to fit you, Sarah, with Nyla working in the background to make it happen. Personalize it any time.',
    targets: ['plan'],
  },
  {
    eyebrow: 'Action boards',
    title: 'Opportunities, surfaced for you.',
    body: 'Clients, Actives, and Prospects each have an action board that surfaces the opportunities worth your time — dive into any one to go deeper.',
    targets: ['clients', 'actives', 'prospects'],
  },
  {
    eyebrow: 'Business',
    title: 'Stay on track with your targets.',
    body: 'Business keeps you aligned with New York Life’s targets, and surfaces learning and development opportunities to help you grow.',
    targets: ['business'],
  },
]

export const Default: Story = {
  name: 'Onboarding tour (centered in isolation)',
  render: () => (
    <div style={{ position: 'relative', height: '100vh', background: 'var(--bg-canvas)' }}>
      <BriefingTour
        steps={STEPS}
        onClose={() => {
          /* noop in story */
        }}
      />
    </div>
  ),
}
