import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { motion } from 'motion/react'
import { EASE, DURATION } from '@/motion'
import { GoalRow } from '@/ui/GoalRow'
// import { Button } from '@/ui/Button'

// ── Icon components ──────────────────────────────────────────────────────────

function FYCIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#wh-fyc)">
        <path
          d="M11.8003 10.9C9.53031 10.31 8.80031 9.7 8.80031 8.75C8.80031 7.66 9.81031 6.9 11.5003 6.9C13.2803 6.9 13.9403 7.75 14.0003 9H16.2103C16.1403 7.28 15.0903 5.7 13.0003 5.19V3H10.0003V5.16C8.06031 5.58 6.50031 6.84 6.50031 8.77C6.50031 11.08 8.41031 12.23 11.2003 12.9C13.7003 13.5 14.2003 14.38 14.2003 15.31C14.2003 16 13.7103 17.1 11.5003 17.1C9.44031 17.1 8.63031 16.18 8.52031 15H6.32031C6.44031 17.19 8.08031 18.42 10.0003 18.83V21H13.0003V18.85C14.9503 18.48 16.5003 17.35 16.5003 15.3C16.5003 12.46 14.0703 11.49 11.8003 10.9Z"
          fill="#7028A4"
        />
      </g>
      <defs>
        <clipPath id="wh-fyc">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

function CouncilIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7 21V19H11V15.9C10.1833 15.7167 9.45417 15.3708 8.8125 14.8625C8.17083 14.3542 7.7 13.7167 7.4 12.95C6.15 12.8 5.10417 12.2542 4.2625 11.3125C3.42083 10.3708 3 9.26667 3 8V7C3 6.45 3.19583 5.97917 3.5875 5.5875C3.97917 5.19583 4.45 5 5 5H7V3H17V5H19C19.55 5 20.0208 5.19583 20.4125 5.5875C20.8042 5.97917 21 6.45 21 7V8C21 9.26667 20.5792 10.3708 19.7375 11.3125C18.8958 12.2542 17.85 12.8 16.6 12.95C16.3 13.7167 15.8292 14.3542 15.1875 14.8625C14.5458 15.3708 13.8167 15.7167 13 15.9V19H17V21H7ZM7 10.8V7H5V8C5 8.63333 5.18333 9.20417 5.55 9.7125C5.91667 10.2208 6.4 10.5833 7 10.8ZM12 14C12.8333 14 13.5417 13.7083 14.125 13.125C14.7083 12.5417 15 11.8333 15 11V5H9V11C9 11.8333 9.29167 12.5417 9.875 13.125C10.4583 13.7083 11.1667 14 12 14ZM17 10.8C17.6 10.5833 18.0833 10.2208 18.45 9.7125C18.8167 9.20417 19 8.63333 19 8V7H17V10.8Z"
        fill="#7028A4"
      />
    </svg>
  )
}

function GrowthIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8.55 20H15.45L16.45 16H7.55L8.55 20ZM8.55 22C8.08333 22 7.675 21.8583 7.325 21.575C6.975 21.2917 6.74167 20.925 6.625 20.475L5.5 16H18.5L17.375 20.475C17.2583 20.925 17.025 21.2917 16.675 21.575C16.325 21.8583 15.9167 22 15.45 22H8.55ZM5 14H19V12H5V14ZM12 8C12 6.33333 12.5833 4.91667 13.75 3.75C14.9167 2.58333 16.3333 2 18 2C18 3.5 17.525 4.8 16.575 5.9C15.625 7 14.4333 7.66667 13 7.9V10H21V14C21 14.55 20.8043 15.0207 20.413 15.412C20.021 15.804 19.55 16 19 16H5C4.45 16 3.979 15.804 3.587 15.412C3.19567 15.0207 3 14.55 3 14V10H11V7.9C9.56667 7.66667 8.375 7 7.425 5.9C6.475 4.8 6 3.5 6 2C7.66667 2 9.08333 2.58333 10.25 3.75C11.4167 4.91667 12 6.33333 12 8Z"
        fill="#7028A4"
      />
    </svg>
  )
}

function SuccessionIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#wh-succession)">
        <path
          d="M12.2201 19.85C12.0401 20.03 11.7201 20.06 11.5101 19.85C11.3301 19.67 11.3001 19.35 11.5101 19.14L14.9001 15.75L13.4901 14.34L10.1001 17.73C9.91009 17.93 9.59009 17.92 9.39009 17.73C9.18009 17.52 9.21009 17.2 9.39009 17.02L12.7801 13.63L11.3701 12.22L7.98009 15.61C7.80009 15.79 7.48009 15.82 7.27009 15.61C7.08009 15.42 7.08009 15.1 7.27009 14.9L10.6601 11.51L9.24009 10.1L5.85009 13.49C5.67009 13.67 5.35009 13.7 5.14009 13.49C4.95009 13.29 4.95009 12.98 5.14009 12.78L9.52009 8.4L11.3901 10.26C12.3401 11.21 13.9801 11.2 14.9301 10.26C15.9101 9.28 15.9101 7.7 14.9301 6.72L13.0701 4.86L13.3501 4.58C14.1301 3.8 15.4001 3.8 16.1801 4.58L20.4201 8.82C21.2001 9.6 21.2001 10.87 20.4201 11.65L12.2201 19.85ZM21.8301 13.07C23.3901 11.51 23.3901 8.98 21.8301 7.41L17.5901 3.17C16.0301 1.61 13.5001 1.61 11.9301 3.17L11.6501 3.45L11.3701 3.17C9.81009 1.61 7.28009 1.61 5.71009 3.17L2.17009 6.71C0.750092 8.13 0.620092 10.34 1.77009 11.9L3.22009 10.45C2.83009 9.7 2.96009 8.75 3.59009 8.12L7.13009 4.58C7.91009 3.8 9.18009 3.8 9.96009 4.58L13.5201 8.14C13.7001 8.32 13.7301 8.64 13.5201 8.85C13.3101 9.06 12.9901 9.03 12.8101 8.85L9.52009 5.57L3.72009 11.36C2.74009 12.33 2.74009 13.92 3.72009 14.9C4.11009 15.29 4.61009 15.53 5.14009 15.6C5.21009 16.12 5.44009 16.62 5.84009 17.02C6.24009 17.42 6.74009 17.65 7.26009 17.72C7.33009 18.24 7.56009 18.74 7.96009 19.14C8.36009 19.54 8.86009 19.77 9.38009 19.84C9.45009 20.38 9.69009 20.87 10.0801 21.26C10.5501 21.73 11.1801 21.99 11.8501 21.99C12.5201 21.99 13.1501 21.73 13.6201 21.26L21.8301 13.07Z"
          fill="#7028A4"
        />
      </g>
      <defs>
        <clipPath id="wh-succession">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

function NetworkIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1 18C0.716667 18 0.479333 17.904 0.288 17.712C0.096 17.5207 0 17.2833 0 17V16.425C0 15.6917 0.366667 15.104 1.1 14.662C1.83333 14.2207 2.8 14 4 14C4.21667 14 4.421 14.0083 4.613 14.025C4.80433 14.0417 4.99167 14.0667 5.175 14.1C4.94167 14.4333 4.77067 14.7917 4.662 15.175C4.554 15.5583 4.5 15.9667 4.5 16.4V18H1ZM7 18C6.71667 18 6.479 17.904 6.287 17.712C6.09567 17.5207 6 17.2833 6 17V16.4C6 15.3167 6.55433 14.4373 7.663 13.762C8.771 13.0873 10.2167 12.75 12 12.75C13.8 12.75 15.25 13.0873 16.35 13.762C17.45 14.4373 18 15.3167 18 16.4V17C18 17.2833 17.904 17.5207 17.712 17.712C17.5207 17.904 17.2833 18 17 18H7ZM19.5 18V16.4C19.5 15.9667 19.4417 15.5583 19.325 15.175C19.2083 14.7917 19.0417 14.4333 18.825 14.1C19.0083 14.0667 19.196 14.0417 19.388 14.025C19.5793 14.0083 19.7833 14 20 14C21.2 14 22.1667 14.2207 22.9 14.662C23.6333 15.104 24 15.6917 24 16.425V17C24 17.2833 23.904 17.5207 23.712 17.712C23.5207 17.904 23.2833 18 23 18H19.5ZM12 14.75C11.05 14.75 10.2 14.879 9.45 15.137C8.7 15.3957 8.25833 15.6833 8.125 16H15.875C15.725 15.6667 15.2793 15.375 14.538 15.125C13.796 14.875 12.95 14.75 12 14.75ZM4 13C3.45 13 2.97933 12.804 2.588 12.412C2.196 12.0207 2 11.55 2 11C2 10.45 2.196 9.979 2.588 9.587C2.97933 9.19567 3.45 9 4 9C4.55 9 5.02067 9.19567 5.412 9.587C5.804 9.979 6 10.45 6 11C6 11.55 5.804 12.0207 5.412 12.412C5.02067 12.804 4.55 13 4 13ZM20 13C19.45 13 18.979 12.804 18.587 12.412C18.1957 12.0207 18 11.55 18 11C18 10.45 18.1957 9.979 18.587 9.587C18.979 9.19567 19.45 9 20 9C20.55 9 21.021 9.19567 21.413 9.587C21.8043 9.979 22 10.45 22 11C22 11.55 21.8043 12.0207 21.413 12.412C21.021 12.804 20.55 13 20 13ZM12 12C11.1667 12 10.4583 11.7083 9.875 11.125C9.29167 10.5417 9 9.83333 9 9C9 8.16667 9.29167 7.45833 9.875 6.875C10.4583 6.29167 11.1667 6 12 6C12.8333 6 13.5417 6.29167 14.125 6.875C14.7083 7.45833 15 8.16667 15 9C15 9.83333 14.7083 10.5417 14.125 11.125C13.5417 11.7083 12.8333 12 12 12ZM12 8C11.7167 8 11.4793 8.09567 11.288 8.287C11.096 8.479 11 8.71667 11 9C11 9.28333 11.096 9.52067 11.288 9.712C11.4793 9.904 11.7167 10 12 10C12.2833 10 12.521 9.904 12.713 9.712C12.9043 9.52067 13 9.28333 13 9C13 8.71667 12.9043 8.479 12.713 8.287C12.521 8.09567 12.2833 8 12 8Z"
        fill="#7028A4"
      />
    </svg>
  )
}

function ProtectIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#wh-protect)">
        <path
          d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2ZM18 11.09C18 15.09 15.45 18.79 12 19.92C8.55 18.79 6 15.1 6 11.09V6.39L12 4.14L18 6.39V11.09Z"
          fill="#7028A4"
        />
      </g>
      <defs>
        <clipPath id="wh-protect">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

function ClientIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#wh-client)">
        <path
          d="M18.39 14.56C16.71 13.7 14.53 13 12 13C9.47 13 7.29 13.7 5.61 14.56C4.61 15.07 4 16.1 4 17.22V20H20V17.22C20 16.1 19.39 15.07 18.39 14.56ZM18 18H6V17.22C6 16.84 6.2 16.5 6.52 16.34C7.71 15.73 9.63 15 12 15C14.37 15 16.29 15.73 17.48 16.34C17.8 16.5 18 16.84 18 17.22V18Z"
          fill="#7028A4"
        />
        <path
          d="M12 12C14.21 12 16 10.21 16 8C16 6.63 16 4.5 16 4.5C16 3.67 15.33 3 14.5 3C13.98 3 13.52 3.27 13.25 3.67C12.98 3.27 12.52 3 12 3C11.48 3 11.02 3.27 10.75 3.67C10.48 3.27 10.02 3 9.5 3C8.67 3 8 3.67 8 4.5C8 4.5 8 6.62 8 8C8 10.21 9.79 12 12 12ZM10 5.5H14V8C14 9.1 13.1 10 12 10C10.9 10 10 9.1 10 8V5.5Z"
          fill="#7028A4"
        />
      </g>
      <defs>
        <clipPath id="wh-client">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

function FollowupIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#wh-followup)">
        <path
          d="M4 4H20V16H5.17L4 17.17V4ZM4 2C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2H4ZM6 12H14V14H6V12ZM6 9H18V11H6V9ZM6 6H18V8H6V6Z"
          fill="#7028A4"
        />
      </g>
      <defs>
        <clipPath id="wh-followup">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

function SupportIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#wh-support)">
        <path
          d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM19.46 9.12L16.68 10.27C16.17 8.91 15.1 7.83 13.73 7.33L14.88 4.55C16.98 5.35 18.65 7.02 19.46 9.12ZM12 15C10.34 15 9 13.66 9 12C9 10.34 10.34 9 12 9C13.66 9 15 10.34 15 12C15 13.66 13.66 15 12 15ZM9.13 4.54L10.3 7.32C8.92 7.82 7.83 8.91 7.32 10.29L4.54 9.13C5.35 7.02 7.02 5.35 9.13 4.54ZM4.54 14.87L7.32 13.72C7.83 15.1 8.91 16.18 10.29 16.68L9.12 19.46C7.02 18.65 5.35 16.98 4.54 14.87ZM14.88 19.46L13.73 16.68C15.1 16.17 16.18 15.09 16.68 13.71L19.46 14.88C18.65 16.98 16.98 18.65 14.88 19.46Z"
          fill="#7028A4"
        />
      </g>
      <defs>
        <clipPath id="wh-support">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#wh-email)">
        <path
          d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z"
          fill="#7028A4"
        />
      </g>
      <defs>
        <clipPath id="wh-email">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

// ── Animation variants ───────────────────────────────────────────────────────

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.deliberate,
      ease: EASE.settle as [number, number, number, number],
    },
  },
}

const headingVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.deliberate,
      ease: EASE.settle as [number, number, number, number],
    },
  },
}

// ── Data ─────────────────────────────────────────────────────────────────────

const GOALS = [
  {
    icon: <FYCIcon />,
    title: 'Earn $147,000 per year in retirement income',
  },
  {
    icon: <CouncilIcon />,
    title: 'Start a college scholarship of $10,000 per year',
  },
  {
    icon: <GrowthIcon />,
    title: 'Leave $1,000,000 for my children',
  },
  {
    icon: <SuccessionIcon />,
    title: 'Donate $100,000 to community organizations',
  },
  {
    icon: <NetworkIcon />,
    title: 'Sell my business for at least $150,000',
  },
  {
    icon: <ProtectIcon />,
    title: 'Establish a personal trust to manage all inheritance ',
  },
]

const PRACTICE = [
  {
    icon: <ClientIcon />,
    title: 'Retire by 68 and plan to live to 95',
  },
  {
    icon: <FollowupIcon />,
    title: 'Volunteer at a local charity',
  },
  {
    icon: <SupportIcon />,
    title: 'Do an around the world cruise by 70',
  },
  {
    icon: <EmailIcon />,
    title: 'Read 30 books per year',
  },
]

// ── Component ────────────────────────────────────────────────────────────────

// interface WhatIHeardProps {
//   onContinue?: () => void
// }

export function WhatIHeardClient() {
  const [goals] = useState(GOALS)
  const [practice] = useState(PRACTICE)
  const [showGoals, setShowGoals] = useState(false)
  const [showPractice, setShowPractice] = useState(false)
  const [showCTA, setShowCTA] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  // const [topOffset, setTopOffset] = useState(64)

  // Center the content based on its COLLAPSED height. Measure only on mount,
  // after fonts load (serif metrics change the height), and on resize.
  useLayoutEffect(() => {
    const scrollEl = scrollRef.current
    const contentEl = contentRef.current
    if (!scrollEl || !contentEl) return
    const measure = () => {
      // const avail = scrollEl.clientHeight
      // const contentH = contentEl.offsetHeight
      // Vertically center the (collapsed) content. Measured only on mount/fonts/resize,
      // so expanding a row grows downward and never shifts the group's y-position.
      // setTopOffset(Math.max(64, (avail - contentH) / 2))
    }
    measure()
    let cancelled = false
    document.fonts?.ready.then(() => {
      if (!cancelled) measure()
    })
    window.addEventListener('resize', measure)
    return () => {
      cancelled = true
      window.removeEventListener('resize', measure)
    }
  }, [])

  useEffect(() => {
    // Build-in delay (same idea as the section intros): the orb comes in first
    // (~0.5s), the heading follows (~1.2s), then the goals/practice/CTA sequence.
    const t1 = setTimeout(() => setShowGoals(true), 1100)
    const t2 = setTimeout(() => setShowPractice(true), 2500)
    const t3 = setTimeout(() => setShowCTA(true), 3700)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  return (
    <div style={{ position: 'relative', height: '100%', boxSizing: 'border-box' }}>
      {/* Scrollable content — columns 2-8, centered from collapsed state */}
      <div
        ref={scrollRef}
        style={{
          height: '100%',
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          columnGap: 24,
          alignContent: 'start',
          padding: '0 40px',
          boxSizing: 'border-box',
        }}
      >
        <div ref={contentRef} style={{ gridColumn: '2 / 9', marginBottom: 64 }}>
          {/* Heading */}
          <motion.h1
            variants={headingVariants}
            initial="hidden"
            animate="visible"
            transition={{
              duration: DURATION.deliberate,
              ease: EASE.settle as [number, number, number, number],
              delay: 0.5,
            }}
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 32,
              lineHeight: '40px',
              letterSpacing: '-0.3px',
              fontWeight: 300,
              color: '#000a62',
              margin: '0px 0 32px 0',
            }}
          >
            Here&rsquo;s what I heard&hellip;
          </motion.h1>

          {/* Content sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* YOUR GOALS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <motion.p
                variants={itemVariants}
                initial="hidden"
                animate={showGoals ? 'visible' : 'hidden'}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: '26px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: '#000',
                  margin: 0,
                }}
              >
                Your Financial Goals
              </motion.p>
              <motion.div variants={listVariants} initial="hidden" animate={showGoals ? 'visible' : 'hidden'}>
                {goals.map((goal) => {
                  return (
                    <motion.div key={goal.title} variants={itemVariants}>
                      <GoalRow icon={goal.icon} title={goal.title} />
                    </motion.div>
                  )
                })}
              </motion.div>
            </div>

            {/* YOUR PRACTICE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <motion.p
                variants={itemVariants}
                initial="hidden"
                animate={showPractice ? 'visible' : 'hidden'}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: '26px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: '#000',
                  margin: 0,
                }}
              >
                Your Personal Goals
              </motion.p>
              <motion.div variants={listVariants} initial="hidden" animate={showPractice ? 'visible' : 'hidden'}>
                {practice.map((item) => {
                  return (
                    <motion.div key={item.title} variants={itemVariants}>
                      <GoalRow icon={item.icon} title={item.title} />
                    </motion.div>
                  )
                })}
              </motion.div>
            </div>

            {/* CTA — below the content (not sticky), right-aligned with the content */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate={showCTA ? 'visible' : 'hidden'}
              style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 48 }}
            >
              {/* <Button variant="primary" style={{ padding: '12px 32px' }} onClick={onContinue}>
                Let&rsquo;s turn it into a plan
              </Button> */}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
