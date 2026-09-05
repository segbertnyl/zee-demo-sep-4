import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { StageRail, STAGES } from './StageRail'
import type { StageId } from './StageRail'

export default {
  title: 'Components / StageRail',
  component: StageRail,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    stageIndex: { control: { type: 'number', min: -1, max: 3 } },
    planSubStep: { control: { type: 'number', min: 0, max: 3 } },
  },
} satisfies Meta<typeof StageRail>

type Story = StoryObj<typeof StageRail>

const noop = (_id: StageId) => {}

const Wrap = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-[500px] w-48 bg-white p-6">{children}</div>
)

/* ── Figma variants ────────────────────────────────────────────────────────── */

export const AboutYou: Story = {
  name: 'All About You — History active',
  parameters: { controls: { disable: true } },
  render: () => (
    <Wrap>
      <StageRail
        stageIndex={0}
        reached={[false, false, false, false]}
        onSelect={noop}
        onPrev={() => {}}
        onNext={() => {}}
        prevDisabled={false}
        nextDisabled={true}
      />
    </Wrap>
  ),
}

export const YourPlan: Story = {
  name: 'Your Plan — What I heard active',
  parameters: { controls: { disable: true } },
  render: () => (
    <Wrap>
      <StageRail
        stageIndex={3}
        reached={[true, true, true, false]}
        onSelect={noop}
        planSubStep={1}
        onPrev={() => {}}
        onNext={() => {}}
        prevDisabled={false}
        nextDisabled={true}
      />
    </Wrap>
  ),
}

/* ── Full state matrix ─────────────────────────────────────────────────────── */

export const AllStages: Story = {
  name: 'All stages matrix',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-4 bg-white p-6">
      {STAGES.map((_, activeIdx) => {
        const reached = STAGES.map((__, ri) => ri < activeIdx)
        return (
          <div key={activeIdx} className="min-h-[360px] w-48 rounded-lg border border-neutral-100 p-4">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
              stageIndex {activeIdx}
            </p>
            <StageRail
              stageIndex={activeIdx}
              reached={reached}
              onSelect={noop}
              planSubStep={activeIdx === 3 ? 1 : undefined}
            />
          </div>
        )
      })}
    </div>
  ),
}

/* ── Goals active ──────────────────────────────────────────────────────────── */

export const GoalsActive: Story = {
  name: 'Goals active',
  parameters: { controls: { disable: true } },
  render: () => (
    <Wrap>
      <StageRail
        stageIndex={1}
        reached={[true, false, false, false]}
        onSelect={noop}
        onPrev={() => {}}
        onNext={() => {}}
      />
    </Wrap>
  ),
}

export const PracticeActive: Story = {
  name: 'Practice active',
  parameters: { controls: { disable: true } },
  render: () => (
    <Wrap>
      <StageRail
        stageIndex={2}
        reached={[true, true, false, false]}
        onSelect={noop}
        onPrev={() => {}}
        onNext={() => {}}
      />
    </Wrap>
  ),
}

export const YourPlanPacing: Story = {
  name: 'Your Plan — Pacing active',
  parameters: { controls: { disable: true } },
  render: () => (
    <Wrap>
      <StageRail
        stageIndex={3}
        reached={[true, true, true, false]}
        onSelect={noop}
        planSubStep={2}
        onPrev={() => {}}
        onNext={() => {}}
      />
    </Wrap>
  ),
}

/* ── Live stepping — Discovery flow pattern ────────────────────────────────
 * Demonstrates the correct usage: StageRail stays mounted while stageIndex
 * and reached[] update reactively. The rail must NOT be inside AnimatePresence
 * or re-keyed on step changes — that causes it to remount and replay the
 * 2.85s stagger animation on every transition.
 * ────────────────────────────────────────────────────────────────────────── */

const DISCOVERY_STEPS = [
  { label: 'History', stageIndex: 0 },
  { label: 'Goals intro', stageIndex: 1 },
  { label: 'Growth', stageIndex: 1 },
  { label: 'Objectives', stageIndex: 1 },
  { label: 'Transition', stageIndex: 1 },
  { label: 'Practice type', stageIndex: 2 },
  { label: 'Practice clients', stageIndex: 2 },
]

function LiveDiscoveryFlowDemo() {
  const [stepIdx, setStepIdx] = useState(0)
  const [maxReached, setMaxReached] = useState(0)
  const current = DISCOVERY_STEPS[stepIdx]

  function go(next: number) {
    setStepIdx(next)
    setMaxReached((prev) => Math.max(prev, DISCOVERY_STEPS[next].stageIndex))
  }

  const reached = STAGES.map((_, i) => i <= maxReached)

  return (
    <div className="flex gap-12 bg-white p-6">
      <div className="min-h-[500px] w-48">
        <StageRail
          stageIndex={current.stageIndex}
          reached={reached}
          onSelect={(_id: StageId) => {}}
          onPrev={() => go(Math.max(0, stepIdx - 1))}
          onNext={() => go(Math.min(DISCOVERY_STEPS.length - 1, stepIdx + 1))}
          prevDisabled={stepIdx === 0}
          nextDisabled={stepIdx === DISCOVERY_STEPS.length - 1}
          introDelay={0}
        />
      </div>
      <div className="flex flex-col justify-center gap-4">
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--text-body-muted)',
          }}
        >
          Current screen
        </p>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--text-headline)' }}>{current.label}</p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-body-muted)' }}>
          Step {stepIdx + 1} of {DISCOVERY_STEPS.length} · stageIndex {current.stageIndex}
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {DISCOVERY_STEPS.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              style={{
                padding: '4px 10px',
                borderRadius: 4,
                border: '1px solid var(--border-default)',
                background: i === stepIdx ? 'var(--action-primary)' : 'transparent',
                color: i === stepIdx ? 'white' : 'var(--text-body)',
                fontSize: 11,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export const LiveDiscoveryFlow: Story = {
  name: 'Live — Discovery flow stepping',
  parameters: { controls: { disable: true } },
  render: () => <LiveDiscoveryFlowDemo />,
}

export const YourPlanSummary: Story = {
  name: 'Your Plan — Summary active',
  parameters: { controls: { disable: true } },
  render: () => (
    <Wrap>
      <StageRail
        stageIndex={3}
        reached={[true, true, true, false]}
        onSelect={noop}
        planSubStep={3}
        onPrev={() => {}}
        onNext={() => {}}
      />
    </Wrap>
  ),
}
