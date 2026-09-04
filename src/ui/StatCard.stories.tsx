import type { Meta, StoryObj } from '@storybook/react'
import {
  StatCard, StatCardTooltip,
  MetricTile,
  GoalsCard,
  ProgressCard,
} from './StatCard'
import type { StatCardSource } from './StatCard'

export default {
  title: 'Components / StatCard',
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const SOURCE_SALESFORCE: StatCardSource = {
  title: 'Active clients in your book today.',
  rows: ['Households: 142', 'Individual records: 213', 'Last sync: 2 hrs ago'],
  src: 'Source: Salesforce',
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>{children}</div>
}

function CardWrap({ children }: { children: React.ReactNode }) {
  return <div style={{ width: 240 }}>{children}</div>
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10.5, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-body-muted)', marginTop: 32, marginBottom: 12 }}>
      {children}
    </p>
  )
}

// ---------------------------------------------------------------------------
// StatCard — all variants
// ---------------------------------------------------------------------------

export const AllStatCards: StoryObj = {
  name: 'StatCard — All Variants',
  render: () => (
    <div>
      <SectionLabel>Simple — no source</SectionLabel>
      <Row>
        <CardWrap>
          <StatCard label="Years with New York Life" value="5" sub="Since 2021" />
        </CardWrap>
        <CardWrap>
          <StatCard label="Council standing" value="Quality Council" sub="2 years running" />
        </CardWrap>
      </Row>

      <SectionLabel>With source tooltip — hover the ⓘ icon</SectionLabel>
      <Row>
        <CardWrap>
          <StatCard
            label="Active clients"
            value="213"
            sub="in your book"
            source={SOURCE_SALESFORCE}
          />
        </CardWrap>
        <CardWrap>
          <StatCard
            label="2026 production pace"
            value="+8%"
            sub="vs. last year"
            source={{
              title: 'Production pace through Q2 2026.',
              rows: ['Q1 FYC — $13,400', 'Q2 FYC — $15,800', 'YTD — $29,200 (+8% YoY)'],
              src: 'Source: Salesforce',
            }}
          />
        </CardWrap>
        <CardWrap>
          <StatCard
            label="3 year average FYC"
            value="$52K"
            source={{
              title: 'Averaged from your recorded FYC from 2023–2025.',
              rows: ['2023 FYC — $50,937', '2024 FYC — $53,981', '2025 FYC — $52,224'],
              src: 'Source: Salesforce',
            }}
          />
        </CardWrap>
      </Row>

      <SectionLabel>subBelow — descriptor stacks beneath value</SectionLabel>
      <Row>
        <CardWrap>
          <StatCard
            label="Primary product"
            value="Protection"
            sub="Transitioning to holistic"
            subBelow
            source={{
              title: 'Primary product mix over the last 12 months.',
              rows: ['Whole life — 64%', 'Term — 22%', 'Investments / planning — 14%'],
              src: 'Source: Salesforce',
            }}
          />
        </CardWrap>
        <CardWrap>
          <StatCard
            label="Licensing"
            value="6 active licenses"
            source={{
              title: 'Licenses and registrations on file.',
              rows: ['Series 6 — Active', 'Series 63 — Active', 'Life & Health — Active'],
              src: 'Source: Sales Central',
            }}
          />
        </CardWrap>
        <CardWrap>
          <StatCard
            label="Practice type"
            value="Solo"
            source={{
              title: 'Current practice structure.',
              rows: ['Sole practitioner', 'No teaming agreements on file'],
              src: 'Source: Sales Central',
            }}
          />
        </CardWrap>
      </Row>

      <SectionLabel>Entrance animation — revealed / hidden</SectionLabel>
      <Row>
        <CardWrap>
          <StatCard label="Revealed" value="213" sub="in your book" revealed={true} />
        </CardWrap>
        <CardWrap>
          <StatCard label="Hidden (not yet revealed)" value="213" sub="in your book" revealed={false} />
        </CardWrap>
      </Row>
    </div>
  ),
}

// ---------------------------------------------------------------------------
// Tooltip — standalone placeholder
// ---------------------------------------------------------------------------

export const TooltipPlaceholder: StoryObj = {
  name: 'StatCardTooltip — Placeholder',
  parameters: { layout: 'centered' },
  render: () => (
    <div style={{ position: 'relative', padding: '60px 40px 40px' }}>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text-body-muted)', marginBottom: 12, fontStyle: 'italic' }}>
        Tooltip is triggered by hovering the ⓘ icon on a StatCard with a source prop. Shown here in always-open state for documentation.
      </p>
      {/* Positioned relative to a fake card outline */}
      <div style={{ width: 240, minHeight: 150, borderRadius: 4, border: '1px dashed var(--border-default)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text-body-faint)' }}>StatCard</span>
        <StatCardTooltip source={SOURCE_SALESFORCE} />
      </div>
    </div>
  ),
}

// ---------------------------------------------------------------------------
// MetricTile — plan scene variants
// ---------------------------------------------------------------------------

export const AllMetricTiles: StoryObj = {
  name: 'MetricTile — All Variants',
  render: () => (
    <div>
      <SectionLabel>Default — 32px value (activity targets)</SectionLabel>
      <Row>
        {[
          { label: 'FYC per month', value: '$4K', sub: 'avg to hit $42K' },
          { label: 'Cases to close', value: '1–2 /mo', sub: 'based on your avg case size' },
          { label: 'Client appointments', value: '7', sub: 'to generate your close rate' },
          { label: 'Prospect contacts', value: '16 /mo', sub: 'to fill your appointment pipeline' },
        ].map((t) => (
          <CardWrap key={t.label}>
            <MetricTile label={t.label} value={t.value} sub={t.sub} />
          </CardWrap>
        ))}
      </Row>

      <SectionLabel>24px value + status dot (EC catch-up cards)</SectionLabel>
      <Row>
        {[
          { label: 'Gap to close', value: '$37,000', sub: '6 months · 2 cases/mo', dot: '#ff9522' },
          { label: 'Expected premium', value: 'avg. $3,200', sub: 'per new case', dot: '#ff9522' },
          { label: 'Cases needed', value: '+12 cases', sub: '6 months · 2 cases per mo', dot: '#ff9522' },
        ].map((t) => (
          <CardWrap key={t.label}>
            <MetricTile label={t.label} value={t.value} sub={t.sub} valueSize={24} dot={t.dot} />
          </CardWrap>
        ))}
      </Row>

      <SectionLabel>Green dot — on-track status</SectionLabel>
      <Row>
        <CardWrap>
          <MetricTile label="FYC pace" value="$47K" sub="on track for $52K" dot="#1ab382" />
        </CardWrap>
        <CardWrap>
          <MetricTile label="Council credits" value="46,800" sub="of 90,000 target" dot="#ff9522" />
        </CardWrap>
      </Row>
    </div>
  ),
}

// ---------------------------------------------------------------------------
// GoalsCard — sidebar rail variant
// ---------------------------------------------------------------------------

export const AllGoalsCards: StoryObj = {
  name: 'GoalsCard — Sidebar Rail',
  render: () => (
    <div>
      <SectionLabel>Goals rail — lavender style</SectionLabel>
      <Row>
        {[
          { label: 'FYC target', status: 'On track', dot: '#1ab382', value: '$47,200', sub: '< $42K minimum · 56% to EC' },
          { label: 'Projected year-end', status: 'On track', dot: '#1ab382', value: '$94,400', sub: 'EC to be secured · $9.4K buffer' },
          { label: 'EC credits', status: 'Stretch', dot: '#ff9522', value: '$52,400', sub: '< $32K min' },
          { label: 'Protection FYC', status: 'On track', dot: '#1ab382', value: '$24,600', sub: '100% of $21K minimum' },
        ].map((c) => (
          <CardWrap key={c.label}>
            <GoalsCard
              label={c.label}
              status={c.status}
              dot={c.dot}
              value={c.value}
              sub={c.sub}
            />
          </CardWrap>
        ))}
      </Row>
    </div>
  ),
}

// ---------------------------------------------------------------------------
// ProgressCard — progress grid variant
// ---------------------------------------------------------------------------

export const AllProgressCards: StoryObj = {
  name: 'ProgressCard — Grid Tile',
  render: () => (
    <div>
      <SectionLabel>Filled — item in progress</SectionLabel>
      <Row>
        <CardWrap>
          <ProgressCard state="filled" name="Whole life case" amount="$3,200 premium" />
        </CardWrap>
        <CardWrap>
          <ProgressCard state="filled" name="IRA rollover" amount="$45,000 AUM" />
        </CardWrap>
      </Row>

      <SectionLabel>Empty — add slot</SectionLabel>
      <Row>
        <CardWrap>
          <ProgressCard state="empty" />
        </CardWrap>
        <CardWrap>
          <ProgressCard state="empty" />
        </CardWrap>
      </Row>

      <SectionLabel>Mixed grid — as used in PlanScene</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 240px)', gap: 8 }}>
        <ProgressCard state="filled" name="Whole life case" amount="$3,200 premium" />
        <ProgressCard state="filled" name="IRA rollover" amount="$45,000 AUM" />
        <ProgressCard state="empty" />
        <ProgressCard state="empty" />
        <ProgressCard state="empty" />
        <ProgressCard state="empty" />
      </div>
    </div>
  ),
}
