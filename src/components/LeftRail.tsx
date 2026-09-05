import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useAppStore, type Scene } from '@/state/useAppStore'
import { NYLLogo } from '@/ui/NYLLogo'
import { EASE, DURATION } from '@/motion'

/* Left navigation rail — five destinations + Calendar shortcut + bottom avatars.
 * Hovering the rail for 2s expands it to reveal the labels alongside each icon. */

const HOVER_EXPAND_DELAY_MS = 2000
const COLLAPSED_WIDTH = 76
const EXPANDED_WIDTH = 220

type NavItem = {
  id: string
  label: string
  icon: React.ReactNode
  scene?: Scene
  badge?: number
}

export function LeftRail() {
  const scene = useAppStore((s) => s.scene)
  const setSceneRaw = useAppStore((s) => s.setScene)
  const clearTrail = useAppStore((s) => s.clearTrail)
  /* Left-rail navigation is a top-level jump — it clears any in-progress
   * canvas breadcrumb trail. */
  const setScene = (s: typeof scene) => {
    clearTrail()
    setSceneRaw(s)
  }
  const openCanvas = useAppStore((s) => s.openCanvas)
  const role = useAppStore((s) => s.role)
  const setRole = useAppStore((s) => s.setRole)
  const canvasActive = scene === 'canvas'
  const [expanded, setExpanded] = useState(false)
  const expandTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function startHover() {
    if (expandTimer.current) clearTimeout(expandTimer.current)
    expandTimer.current = setTimeout(() => setExpanded(true), HOVER_EXPAND_DELAY_MS)
  }
  function endHover() {
    if (expandTimer.current) {
      clearTimeout(expandTimer.current)
      expandTimer.current = null
    }
    setExpanded(false)
  }
  useEffect(
    () => () => {
      if (expandTimer.current) clearTimeout(expandTimer.current)
    },
    [],
  )

  const primary: NavItem[] = [
    { id: 'briefing', label: 'Briefing', icon: <BriefingIcon />, scene: 'briefing' },
    { id: 'clients', label: 'Clients', icon: <ClientsIcon />, scene: 'clients' },
    { id: 'actives', label: 'Actives', icon: <ActivesIcon />, scene: 'actives' },
    { id: 'prospects', label: 'Prospects', icon: <ProspectsIcon />, scene: 'prospects' },
    { id: 'business', label: 'Business', icon: <BusinessIcon />, scene: 'business' },
    { id: 'plan', label: 'Plan', icon: <PlanIcon />, scene: 'plan' },
  ]

  return (
    <motion.aside
      aria-label="Primary"
      onMouseEnter={startHover}
      onMouseLeave={endHover}
      animate={{
        width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
        boxShadow: expanded ? '0 24px 60px -20px rgba(0,10,98,0.18)' : '0 0 0 0 rgba(0,0,0,0)',
      }}
      transition={{ duration: DURATION.short, ease: EASE.settle }}
      style={{ width: COLLAPSED_WIDTH }}
      className="fixed left-0 top-0 z-[100] flex h-screen flex-col items-stretch overflow-hidden border-r border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] py-4"
    >
      {/* Logo */}
      <div className="flex items-center px-4">
        <div className="flex size-12 shrink-0 items-center justify-center">
          <NYLLogo pixelSize={44} />
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.span
              key="brand-label"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.22 }}
              className="ml-3 whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-body-muted)]"
            >
              NYL 360
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="my-6 ml-4 h-px w-8 bg-[var(--border-subtle)]" />

      {/* Primary destinations */}
      <ul className="flex flex-col gap-1.5 px-4">
        {primary.map((it) => {
          const active = it.scene === scene
          return (
            <li key={it.id} className="relative">
              {/* Active tick + pill share layoutIds so they physically glide
               * up/down the rail to the new destination, in sync with the
               * scene sheet sliding the same direction. */}
              {active && (
                <motion.span
                  aria-hidden="true"
                  layoutId="rail-active-tick"
                  transition={{ type: 'spring', stiffness: 420, damping: 38 }}
                  className="absolute -left-4 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-[var(--nyl-blue-500)]"
                />
              )}
              <button
                type="button"
                title={it.label}
                aria-label={it.label}
                aria-current={active ? 'page' : undefined}
                onClick={() => it.scene && setScene(it.scene)}
                className={[
                  'group/nav relative flex h-11 w-full items-center gap-3 rounded-xl pl-[10px] pr-3 transition-colors',
                  active
                    ? 'text-white'
                    : 'text-[var(--text-body-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-headline)]',
                ].join(' ')}
              >
                {active && (
                  <motion.span
                    aria-hidden="true"
                    layoutId="rail-active-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 38 }}
                    className="absolute inset-0 rounded-xl bg-[var(--nyl-blue-500)]"
                  />
                )}
                <span className="relative flex size-6 shrink-0 items-center justify-center">{it.icon}</span>
                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      key="nav-label"
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.2 }}
                      className={[
                        'relative whitespace-nowrap text-[13.5px] font-medium tracking-tight',
                        active
                          ? 'text-white'
                          : 'text-[var(--text-body-muted)] group-hover/nav:text-[var(--text-headline)]',
                      ].join(' ')}
                    >
                      {it.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </li>
          )
        })}
      </ul>

      {/* Bottom — canvas mode + role switcher + activity flyout + user avatar */}
      <div className="mt-auto flex flex-col items-stretch gap-2.5 px-4">
        {/* Canvas-mode toggle — the entry into the three-layer canvas */}
        <button
          type="button"
          onClick={openCanvas}
          aria-label="Open canvas mode"
          title="Canvas mode"
          aria-pressed={canvasActive}
          className={[
            'relative flex h-9 items-center gap-3 rounded-full border pl-[5px] pr-3 transition-colors',
            canvasActive
              ? 'border-[var(--nyl-blue-500)] bg-[var(--nyl-blue-500)] text-white'
              : 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-body-muted)] hover:border-[var(--border-default)] hover:text-[var(--text-headline)]',
          ].join(' ')}
        >
          <span className="flex size-7 shrink-0 items-center justify-center">
            <CanvasModeIcon />
          </span>
          <AnimatePresence>
            {expanded && (
              <motion.span
                key="canvas-label"
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap text-[12.5px] font-medium tracking-tight"
              >
                Canvas mode
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Role switcher — toggles the tiered-access demo */}
        <button
          type="button"
          onClick={() => setRole(role === 'advisor' ? 'assistant' : 'advisor')}
          aria-label={`Viewing as ${role}. Click to switch role.`}
          title={`Viewing as ${role === 'advisor' ? 'Sarah (advisor)' : 'Lily (assistant)'} — click to switch`}
          className={[
            'relative flex h-9 items-center gap-3 rounded-full border pl-[5px] pr-3 transition-colors',
            role === 'advisor'
              ? 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-body-muted)] hover:border-[var(--border-default)] hover:text-[var(--text-headline)]'
              : 'border-[var(--nyl-orange-400)] bg-[var(--nyl-orange-100)] text-[var(--nyl-orange-500)]',
          ].join(' ')}
        >
          <span className="flex size-7 shrink-0 items-center justify-center text-[10px] font-semibold uppercase tracking-[0.16em]">
            {role === 'advisor' ? 'M' : 'L'}
          </span>
          <AnimatePresence>
            {expanded && (
              <motion.span
                key="role-label"
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap text-[12.5px] font-medium tracking-tight"
              >
                {role === 'advisor' ? 'Sarah · Advisor' : 'Lily · Assistant'}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <RecentActivityFlyout expanded={expanded} />

        <div aria-label="You" title="You" className="relative flex h-10 items-center gap-3 rounded-full">
          <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--nyl-blue-500)] text-[11px] font-semibold tracking-[0.04em] text-white">
            E
            <span
              aria-hidden="true"
              className="absolute -bottom-0 -right-0 size-2.5 rounded-full border-2 border-white bg-[var(--nyl-green-600)]"
            />
          </span>
          <AnimatePresence>
            {expanded && (
              <motion.span
                key="user-label"
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col leading-tight"
              >
                <span className="whitespace-nowrap text-[13px] font-medium text-[var(--text-headline)]">
                  Eric Vienna
                </span>
                <span className="whitespace-nowrap text-[10.5px] uppercase tracking-[0.18em] text-[var(--text-body-muted)]">
                  Advisor
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  )
}

const RECENT_ACTIVITY = [
  { stamp: '9/9', label: 'Goal mapping' },
  { stamp: '9/9', label: 'Emma Sloan Annual review prep' },
  { stamp: '9/9', label: 'Planning for End of Year' },
  { stamp: '9/9', label: 'Batch follow-ups' },
  { stamp: '9/8', label: 'Batch follow-ups' },
  { stamp: '9/8', label: 'Batch follow-ups' },
]

function RecentActivityFlyout({ expanded = false }: { expanded?: boolean }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Recent activity"
        title="Recent activity"
        aria-expanded={open}
        className={[
          'group/recent relative mb-1 flex h-9 items-center gap-3 rounded-full border transition-colors',
          'pl-[5px] pr-3',
          open
            ? 'border-[var(--nyl-blue-500)] bg-[var(--nyl-blue-100)] text-[var(--nyl-blue-800)]'
            : 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-body-muted)] hover:border-[var(--border-default)] hover:text-[var(--text-headline)]',
        ].join(' ')}
      >
        <span className="flex size-7 shrink-0 items-center justify-center">
          <HistoryIcon />
        </span>
        <AnimatePresence>
          {expanded && (
            <motion.span
              key="recent-label"
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.2 }}
              className="whitespace-nowrap text-[12.5px] font-medium tracking-tight"
            >
              Recent activity
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Outside-click scrim — transparent, only catches clicks */}
            <motion.button
              type="button"
              aria-label="Close activity"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[105] cursor-default bg-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />

            <motion.div
              role="dialog"
              aria-label="Recent activity"
              initial={{ opacity: 0, x: -10, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, y: 6, scale: 0.96 }}
              transition={{ duration: DURATION.micro, ease: EASE.settle }}
              className="fixed bottom-[140px] left-[84px] z-[110] w-[300px] overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] shadow-[0_24px_60px_-20px_rgba(0,10,98,0.28)]"
            >
              <div className="border-b border-[var(--border-subtle)] px-4 py-3">
                <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-[var(--text-body-muted)]">
                  Recent activity
                </p>
              </div>
              <ol className="max-h-[60vh] overflow-y-auto px-4 py-2">
                {RECENT_ACTIVITY.map((a, i) => (
                  <motion.li
                    key={`${a.stamp}-${a.label}-${i}`}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.04 * i }}
                    className="flex items-baseline gap-3 border-b border-[var(--border-subtle)] py-2.5 last:border-b-0"
                  >
                    <span className="w-[34px] text-[11px] uppercase tracking-[0.18em] text-[var(--text-body-muted)]">
                      {a.stamp}
                    </span>
                    <span className="text-[13px] text-[var(--text-body)]">{a.label}</span>
                  </motion.li>
                ))}
              </ol>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function HistoryIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 8 a8.5 8.5 0 1 1 -0.3 5" />
      <path d="M3 4 V8 H7" />
      <path d="M11 7 V11 L14 13" />
    </svg>
  )
}

/* -- Inline icons -- */

/* Network-graph icon — three nodes connected by lines, the Touch-Designer affordance. */
function CanvasModeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="4" cy="5" r="1.6" />
      <circle cx="14" cy="5" r="1.6" />
      <circle cx="9" cy="13" r="1.6" />
      <path d="M5.4 5.7 L12.6 5.7" />
      <path d="M5.0 6.3 L8.2 11.7" />
      <path d="M13.0 6.3 L9.8 11.7" />
    </svg>
  )
}

function BriefingIcon() {
  /* Morning check-in — a confident check over the day's baseline */
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 10.5 L8.5 15 L18 4.5" />
      <path d="M4 19 H18" />
    </svg>
  )
}

function PlanIcon() {
  /* List with a plus — the plan you add to (per the Exploration pt-II rail) */
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6 H14" />
      <path d="M4 11 H14" />
      <path d="M4 16 H9" />
      <path d="M16.5 13.5 V19.5" />
      <path d="M13.5 16.5 H19.5" />
    </svg>
  )
}

function ClientsIcon() {
  /* Person with check */
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="7" r="3.5" />
      <path d="M3 19 c0-3.5 2.7-6 6-6 c1.4 0 2.6 0.4 3.7 1.1" />
      <path d="M14.5 17 L16.2 18.7 L20 14.5" />
    </svg>
  )
}

function ActivesIcon() {
  /* Handshake (filled) — from Figma node 1366:3716 */
  return (
    <svg width="20" height="20" viewBox="0 0 28 29" fill="currentColor" aria-hidden="true">
      <path d="M13.885 22C13.9517 22 14.0183 21.9833 14.085 21.95C14.1517 21.9167 14.2017 21.8833 14.235 21.85L22.435 13.65C22.635 13.45 22.781 13.225 22.873 12.975C22.9643 12.725 23.01 12.475 23.01 12.225C23.01 11.9583 22.9643 11.704 22.873 11.462C22.781 11.2207 22.635 11.0083 22.435 10.825L18.185 6.575C18.0017 6.375 17.7893 6.229 17.548 6.137C17.306 6.04567 17.0517 6 16.785 6C16.535 6 16.285 6.04567 16.035 6.137C15.785 6.229 15.56 6.375 15.36 6.575L15.085 6.85L16.935 8.725C17.185 8.95833 17.3683 9.225 17.485 9.525C17.6017 9.825 17.66 10.1417 17.66 10.475C17.66 11.175 17.4227 11.7623 16.948 12.237C16.4727 12.7123 15.885 12.95 15.185 12.95C14.8517 12.95 14.531 12.8917 14.223 12.775C13.9143 12.6583 13.6433 12.4833 13.41 12.25L11.535 10.4L7.16 14.775C7.11 14.825 7.07233 14.8793 7.047 14.938C7.02233 14.996 7.01 15.0583 7.01 15.125C7.01 15.2583 7.06 15.379 7.16 15.487C7.26 15.5957 7.37667 15.65 7.51 15.65C7.57667 15.65 7.64333 15.6333 7.71 15.6C7.77667 15.5667 7.82667 15.5333 7.86 15.5L11.26 12.1L12.66 13.5L9.285 16.9C9.235 16.95 9.19733 17.004 9.172 17.062C9.14733 17.1207 9.135 17.1833 9.135 17.25C9.135 17.3833 9.185 17.5 9.285 17.6C9.385 17.7 9.50167 17.75 9.635 17.75C9.70167 17.75 9.76833 17.7333 9.835 17.7C9.90167 17.6667 9.95167 17.6333 9.985 17.6L13.385 14.225L14.785 15.625L11.41 19.025C11.36 19.0583 11.3227 19.1083 11.298 19.175C11.2727 19.2417 11.26 19.3083 11.26 19.375C11.26 19.5083 11.31 19.625 11.41 19.725C11.51 19.825 11.6267 19.875 11.76 19.875C11.8267 19.875 11.8893 19.8623 11.948 19.837C12.006 19.8123 12.06 19.775 12.11 19.725L15.51 16.35L16.91 17.75L13.51 21.15C13.46 21.2 13.4227 21.254 13.398 21.312C13.3727 21.3707 13.36 21.4333 13.36 21.5C13.36 21.6333 13.4143 21.75 13.523 21.85C13.631 21.95 13.7517 22 13.885 22ZM13.86 24C13.2433 24 12.6977 23.7957 12.223 23.387C11.7477 22.979 11.4683 22.4667 11.385 21.85C10.8183 21.7667 10.3433 21.5333 9.96 21.15C9.57667 20.7667 9.34333 20.2917 9.26 19.725C8.69333 19.6417 8.22267 19.4043 7.848 19.013C7.47267 18.621 7.24333 18.15 7.16 17.6C6.52667 17.5167 6.01 17.2417 5.61 16.775C5.21 16.3083 5.01 15.7583 5.01 15.125C5.01 14.7917 5.07267 14.4707 5.198 14.162C5.32267 13.854 5.50167 13.5833 5.735 13.35L11.535 7.575L14.81 10.85C14.8433 10.9 14.8933 10.9373 14.96 10.962C15.0267 10.9873 15.0933 11 15.16 11C15.31 11 15.435 10.9543 15.535 10.863C15.635 10.771 15.685 10.65 15.685 10.5C15.685 10.4333 15.6727 10.3667 15.648 10.3C15.6227 10.2333 15.585 10.1833 15.535 10.15L11.96 6.575C11.7767 6.375 11.564 6.229 11.322 6.137C11.0807 6.04567 10.8267 6 10.56 6C10.31 6 10.06 6.04567 9.81 6.137C9.56 6.229 9.335 6.375 9.135 6.575L5.61 10.125C5.46 10.275 5.335 10.45 5.235 10.65C5.135 10.85 5.06833 11.05 5.035 11.25C5.00167 11.45 5.00167 11.654 5.035 11.862C5.06833 12.0707 5.135 12.2667 5.235 12.45L3.785 13.9C3.50167 13.5167 3.29333 13.0957 3.16 12.637C3.02667 12.179 2.97667 11.7167 3.01 11.25C3.04333 10.7833 3.16 10.329 3.36 9.887C3.56 9.44567 3.835 9.05 4.185 8.7L7.71 5.175C8.11 4.79167 8.556 4.5 9.048 4.3C9.53933 4.1 10.0433 4 10.56 4C11.0767 4 11.5807 4.1 12.072 4.3C12.564 4.5 13.0017 4.79167 13.385 5.175L13.66 5.45L13.935 5.175C14.335 4.79167 14.7807 4.5 15.272 4.3C15.764 4.1 16.2683 4 16.785 4C17.3017 4 17.806 4.1 18.298 4.3C18.7893 4.5 19.2267 4.79167 19.61 5.175L23.835 9.4C24.2183 9.78333 24.51 10.225 24.71 10.725C24.91 11.225 25.01 11.7333 25.01 12.25C25.01 12.7667 24.91 13.2707 24.71 13.762C24.51 14.254 24.2183 14.6917 23.835 15.075L15.635 23.25C15.4017 23.4833 15.1307 23.6667 14.822 23.8C14.514 23.9333 14.1933 24 13.86 24Z" />
    </svg>
  )
}

function ProspectsIcon() {
  /* Network / org tree */
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="4" r="2" />
      <circle cx="5" cy="17" r="2" />
      <circle cx="11" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M11 6 V11" />
      <path d="M5 15 V12 H17 V15" />
    </svg>
  )
}

function BusinessIcon() {
  /* Briefcase */
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="7" width="16" height="12" rx="1.5" />
      <path d="M8 7 V5.5 a1.5 1.5 0 0 1 1.5 -1.5 H12.5 a1.5 1.5 0 0 1 1.5 1.5 V7" />
      <path d="M3 12 H19" />
    </svg>
  )
}
