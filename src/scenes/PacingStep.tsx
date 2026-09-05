import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { EASE, DURATION } from '@/motion'
import { DataTooltip } from '@/ui/DataTooltip'
import { Button } from '@/ui/Button'

// ── Icons ─────────────────────────────────────────────────────────────────────

function CheckCircle() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10.5" stroke="var(--nyl-gray-300)" strokeWidth="1.5" />
      <path
        d="M7.5 12.5l3 3 6-6.5"
        stroke="var(--nyl-gray-500)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ── Motion helpers ────────────────────────────────────────────────────────────

const REVEAL_TRANSITION = {
  duration: DURATION.deliberate,
  ease: EASE.settle as [number, number, number, number],
}

function reveal(show: boolean) {
  return {
    initial: { opacity: 0, y: 8 },
    animate: show ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 },
    transition: REVEAL_TRANSITION,
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CalcRow({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <motion.div {...reveal(show)} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <CheckCircle />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
          fontFamily: 'var(--font-sans)',
          fontSize: 16,
          lineHeight: '24px',
          letterSpacing: '0.2px',
        }}
      >
        {children}
      </div>
    </motion.div>
  )
}

function Connector({ show }: { show: boolean }) {
  return (
    <motion.div
      {...reveal(show)}
      style={{
        width: 1.5,
        height: 24,
        background: 'var(--border-subtle)',
        marginLeft: 11,
      }}
    />
  )
}

function Muted({ children }: { children: React.ReactNode }) {
  return <span style={{ color: 'var(--text-body-secondary)' }}>{children}</span>
}

function Bold({ children }: { children: React.ReactNode }) {
  return <span style={{ color: 'var(--text-heading)', fontWeight: 500 }}>{children}</span>
}

// ── PacingStep ────────────────────────────────────────────────────────────────

interface PacingStepProps {
  fyc: string
  onContinue?: () => void
  onAdjust?: () => void
}

const apptsChart = {
  title: 'Avg appointments per week',
  currentValue: 2.4,
  // Shape: steady climb
  data: [
    { label: 'Q1', value: 1.8 },
    { label: 'Q2', value: 2.0 },
    { label: 'Q3', value: 2.1 },
    { label: 'Q4', value: 2.3 },
    { label: "Q1'26", value: 2.4 },
  ],
  yMin: 1.5,
  yMax: 3.5,
  source: 'NYL360 data.',
  yFormat: (v: number) => `${v}`,
}

const commissionChart = {
  title: 'Avg commission per policy sold',
  currentValue: 950,
  adjustLabel: 'Adjust manually',
  // Shape: rise to a mid peak, then ease back down (hump)
  data: [
    { label: '2022', value: 900 },
    { label: '2023', value: 970 },
    { label: '2024', value: 1015 },
    { label: '2025', value: 985 },
    { label: '2026', value: 950 },
  ],
  yMin: 850,
  yMax: 1050,
  source: 'NYL360 data.',
}

const closeRateChart = {
  title: 'Close rate (qualified appts)',
  currentValue: 33,
  adjustLabel: 'Adjust manually',
  // Shape: dip to a mid trough, then recover (valley)
  data: [
    { label: '2022', value: 38 },
    { label: '2023', value: 30 },
    { label: '2024', value: 27 },
    { label: '2025', value: 31 },
    { label: '2026', value: 33 },
  ],
  yMin: 20,
  yMax: 45,
  source: 'NYL360 data.',
  yFormat: (v: number) => `${v}%`,
}

export function PacingStep({ fyc, onContinue }: PacingStepProps) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const delays = [200, 550, 900, 1250, 1650, 2000]
    const timers = delays.map((delay, i) => setTimeout(() => setPhase(i + 1), delay))
    return () => timers.forEach(clearTimeout)
  }, [])

  // Math derived from the user's FYC target
  const fycNum = parseInt(fyc.replace(/,/g, ''), 10)
  const avgCommission = 950
  const closeRate = 0.33
  const closesPerYear = Math.round(fycNum / avgCommission)
  const apptsPerYear = Math.round(closesPerYear / closeRate)
  const apptsPerWeek = Math.round(apptsPerYear / 52)

  const fmtK = (n: number) => n.toLocaleString()

  return (
    <div
      style={{
        minHeight: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        columnGap: 24,
        alignContent: 'center',
        padding: '40px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ gridColumn: '2 / 9' }}>
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION['scene-in'], ease: EASE.settle as [number, number, number, number] }}
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 32,
            lineHeight: '40px',
            fontWeight: 300,
            color: 'var(--nyl-blue-800)',
            margin: '0 0 20px 0',
          }}
        >
          Your FYC goal is within reach
        </motion.h2>

        {/* Body copy with inline DataTooltip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: DURATION['scene-in'],
            delay: 0.12,
            ease: EASE.settle as [number, number, number, number],
          }}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 16,
            lineHeight: '32px',
            letterSpacing: '0.2px',
            color: 'var(--text-body-secondary)',
            margin: '0 0 48px 0',
          }}
        >
          You have a strong close rate, so achieving your FYC goal comes down to a small increase in your appointment
          volume. You currently average <DataTooltip label="~8.5 appointments /wk" chart={apptsChart} /> ; taking{' '}
          <strong style={{ color: 'var(--text-heading)', fontWeight: 600 }}>
            3 more qualified appointments every 2 weeks
          </strong>{' '}
          would help close the gap.
        </motion.div>

        {/* Calculation block */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {/* FYC goal card */}
          <motion.div
            {...reveal(phase >= 1)}
            style={{
              background: 'white',
              border: '1px solid var(--border-subtle)',
              borderRadius: 4,
              padding: '22px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 32,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: 'var(--text-heading)',
              }}
            >
              Your FYC Goal
            </span>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--text-heading)',
              }}
            >
              ${fyc}
            </span>
          </motion.div>

          {/* Row 1: FYC ÷ avg commission = closes/yr */}
          <CalcRow show={phase >= 2}>
            <Bold>${fmtK(fycNum)} FYC</Bold>
            <Muted>÷</Muted>
            <DataTooltip label={`~$${fmtK(avgCommission)} /policy`} chart={commissionChart} />
            <Muted>=</Muted>
            <Bold>~{fmtK(closesPerYear)} closes /yr</Bold>
          </CalcRow>

          <Connector show={phase >= 3} />

          {/* Row 2: closes/yr ÷ close rate = appointments/yr */}
          <CalcRow show={phase >= 3}>
            <Bold>~{fmtK(closesPerYear)} closes /yr</Bold>
            <Muted>÷</Muted>
            <DataTooltip label={`${Math.round(closeRate * 100)}% close rate`} chart={closeRateChart} />
            <Muted>=</Muted>
            <Bold>~{fmtK(apptsPerYear)} appointments /yr</Bold>
          </CalcRow>

          <Connector show={phase >= 4} />

          {/* Row 3: appointments/yr ÷ 52 weeks = appointments/wk */}
          <CalcRow show={phase >= 4}>
            <Bold>~{fmtK(apptsPerYear)} appointments /yr</Bold>
            <Muted>÷</Muted>
            <Bold>52 wks</Bold>
            <Muted>=</Muted>
            <Bold>{apptsPerWeek} appointments /wk</Bold>
          </CalcRow>

          {/* Purple result card */}
          <motion.div
            {...reveal(phase >= 5)}
            style={{
              background: 'var(--nyl-purple-050)',
              border: '1px solid var(--nyl-purple-200)',
              borderRadius: 4,
              padding: '22px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 40,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: 'var(--text-heading)',
              }}
            >
              Qualified Appointments per Week
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 24,
                  fontWeight: 700,
                  color: 'var(--text-heading)',
                }}
              >
                ~{apptsPerWeek}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 16,
                  fontWeight: 400,
                  color: 'var(--text-body-secondary)',
                }}
              >
                /wk
              </span>
            </div>
          </motion.div>
        </div>

        {/* CTAs */}
        <motion.div
          {...reveal(phase >= 6)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 24,
            marginTop: 48,
            paddingRight: 0,
          }}
        >
          <Button variant="text" noArrow>
            Adjust this
          </Button>
          <Button variant="primary" onClick={onContinue}>
            Got it
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
