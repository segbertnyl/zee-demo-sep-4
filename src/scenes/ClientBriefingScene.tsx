import { useRef, useState, type ReactElement } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useAppStore } from '@/state/useAppStore'
import { EASE, DURATION } from '@/motion'
import { NYLLogo } from '@/ui/NYLLogo'
import {
  NavBriefingIcon, PersonCheckIcon, TagIcon, OrgChartIcon,
  BriefcaseIcon, ListAddIcon, BellIcon, CalendarIcon, type IconProps,
} from '@/ui/icons'

/* ============================================================================
 * Client Briefing scene — the client's own version of the briefing screen.
 * Same chrome shape as BriefingV6Scene (rail + header), duplicated here on
 * purpose so this flow stays 100% separate — no shared nav state, no shared
 * body content. Skeleton only: body content per rail section is a simple
 * placeholder, to be filled in next pass.
 * ========================================================================== */

const GRID = 'ml-[34px] mr-10'

type RailItem = { Icon: (p: IconProps) => ReactElement; label: string; size: number; active?: boolean; dot?: boolean }

const NAV_ITEMS: RailItem[] = [
  { Icon: NavBriefingIcon, label: 'Briefing', size: 22 },
  { Icon: PersonCheckIcon, label: 'Clients', size: 40 },
  { Icon: TagIcon, label: 'Actives', size: 40 },
  { Icon: OrgChartIcon, label: 'Prospects', size: 22 },
  { Icon: BriefcaseIcon, label: 'Planning', size: 40 },
  { Icon: ListAddIcon, label: 'Plan', size: 24 },
]
const BOTTOM_ITEMS: RailItem[] = [
  { Icon: BellIcon, label: 'Notifications', size: 40, dot: true },
  { Icon: CalendarIcon, label: 'Calendar', size: 40, dot: true },
]

/* Placeholder body copy per rail section — separate from briefingV6Content.ts
 * on purpose. Fill in for real next pass. */
const SECTION_PLACEHOLDER: Record<string, string> = {
  Briefing: "Eric's briefing — skeleton placeholder.",
  Clients: 'Clients — skeleton placeholder.',
  Actives: 'Actives — skeleton placeholder.',
  Prospects: 'Prospects — skeleton placeholder.',
  Planning: 'Planning — skeleton placeholder.',
  Plan: 'Plan — skeleton placeholder.',
  Notifications: 'Notifications — skeleton placeholder.',
  Calendar: 'Calendar — skeleton placeholder.',
}

function RailRow({ item, expanded, onClick }: { item: RailItem; expanded: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={item.label}
      className="group flex w-full items-center gap-3 rounded-[11px]"
    >
      <span
        className={[
          'relative flex size-10 shrink-0 items-center justify-center rounded-[11px] transition-colors',
          item.active ? 'bg-[var(--nyl-blue-050)] text-[var(--nyl-blue-500)]' : 'text-[var(--nyl-gray-700)] group-hover:bg-[var(--nyl-blue-025)] group-hover:text-[var(--nyl-blue-500)]',
        ].join(' ')}
      >
        <item.Icon size={item.size} />
        {item.dot && <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[var(--nyl-blue-500)]" />}
      </span>
      <motion.span
        animate={{ opacity: expanded ? 1 : 0 }}
        transition={{ duration: DURATION.micro }}
        className={[
          'whitespace-nowrap text-[14px] font-medium',
          item.active ? 'text-[var(--text-headline)]' : 'text-[var(--text-body)]',
        ].join(' ')}
      >
        {item.label}
      </motion.span>
    </button>
  )
}

function Rail({ active, onSelect, onExit }: { active: string; onSelect: (s: string) => void; onExit: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const enterTimer = useRef<number | undefined>(undefined)
  const onEnter = () => {
    window.clearTimeout(enterTimer.current)
    enterTimer.current = window.setTimeout(() => setExpanded(true), 280)
  }
  const onLeave = () => {
    window.clearTimeout(enterTimer.current)
    setExpanded(false)
  }
  return (
    <div className="relative z-30 w-[96px] shrink-0">
      <motion.nav
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        animate={{ width: expanded ? 248 : 96 }}
        transition={{ duration: 0.28, ease: EASE.settle }}
        className="absolute inset-y-0 left-0 flex flex-col items-start overflow-hidden rounded-br-[8px] bg-white py-10 pl-7 pr-4 shadow-[0_0_40px_rgba(0,0,0,0.08)]"
      >
        <button type="button" onClick={onExit} aria-label="Back to menu" className="shrink-0 rounded-[8px]">
          <NYLLogo pixelSize={40} className="rounded-[8px]" />
        </button>

        <div className="mt-12 flex flex-1 flex-col gap-6">
          {NAV_ITEMS.map((it) => (
            <RailRow key={it.label} item={{ ...it, active: it.label === active }} expanded={expanded} onClick={() => onSelect(it.label)} />
          ))}
        </div>

        <div className="flex flex-col gap-6">
          {BOTTOM_ITEMS.map((it) => (
            <RailRow key={it.label} item={{ ...it, active: it.label === active }} expanded={expanded} onClick={() => onSelect(it.label)} />
          ))}
        </div>

        <div className="mt-6 flex w-full items-center gap-3">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-[13px] font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #7fd8c4 0%, #5ec6e0 100%)' }}
          >
            AF
          </span>
          <motion.span
            animate={{ opacity: expanded ? 1 : 0 }}
            transition={{ duration: DURATION.micro }}
            className="whitespace-nowrap text-[14px] font-medium text-[var(--text-headline)]"
          >
            Sarah Ferreira
          </motion.span>
        </div>
      </motion.nav>
    </div>
  )
}

/* Same header shape as BriefingV6Scene's TopNav, but simpler: title on the
 * left ("Welcome Eric"), nothing on the right. */
function TopNav({ title }: { title: string }) {
  return (
    <div className="flex h-[120px] items-center">
      <div className={[GRID, 'grid w-full grid-cols-12 items-center gap-6'].join(' ')}>
        <p className="col-span-5 font-serif text-[18px] text-[var(--text-headline)]" style={{ fontWeight: 400 }}>{title}</p>
        <div className="col-span-7" />
      </div>
    </div>
  )
}

export function ClientBriefingScene() {
  const open = useAppStore((s) => s.clientBriefingOpen)
  const closeClientBriefing = useAppStore((s) => s.closeClientBriefing)
  const [activeNav, setActiveNav] = useState('Briefing')

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="client-briefing"
          role="dialog"
          aria-label="Client Briefing"
          className="overlay-bleed z-[170] flex bg-[var(--bg-canvas)]"
          initial={false}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.short }}
        >
          <Rail active={activeNav} onSelect={setActiveNav} onExit={closeClientBriefing} />

          <div className="relative z-10 flex min-w-0 flex-1 flex-col">
            <TopNav title="Welcome Eric" />
            <div className="flex flex-1 items-center justify-center text-[16px] text-[var(--text-body-muted)]">
              {SECTION_PLACEHOLDER[activeNav]}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
