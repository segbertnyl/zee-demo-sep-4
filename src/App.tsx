import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useAppStore, type Scene } from '@/state/useAppStore'
import { SceneShell } from '@/components/SceneShell'
import { BriefingV55Scene } from '@/scenes/BriefingV55Scene'
import { ActionBoardScene } from '@/scenes/ActionBoardScene'
import { FreeformScene } from '@/scenes/FreeformScene'
import { CalendarScene } from '@/scenes/CalendarScene'
import { DestinationScene } from '@/scenes/DestinationScene'
import { ActionDeepDive } from '@/scenes/ActionDeepDive'
import { CollabSpace } from '@/scenes/CollabSpace'
import { BusinessScene } from '@/scenes/BusinessScene'
import { CanvasScene } from '@/scenes/CanvasScene'
import { OnboardingFlow } from '@/scenes/OnboardingFlow'
import { LandingChooser } from '@/scenes/LandingChooser'
import { QuickStartTour } from '@/scenes/QuickStartTour'
import { CoachDrill } from '@/scenes/CoachDrill'
import { PracticeWrapped } from '@/scenes/PracticeWrapped'
import { YearInReview } from '@/scenes/YearInReview'
import { PlanScene } from '@/scenes/PlanScene'
import { DiscoveryFlow } from '@/scenes/DiscoveryFlow'
import { BriefingV6Scene } from '@/scenes/BriefingV6Scene'
import { NylaOverlay } from '@/components/NylaOverlay'
import { WelcomeToDiscoveryProto } from '@/proto/WelcomeToDiscoveryProto'

/* Scene transitions — "sheets on the paper ground."
 *
 * Scenes are sheets laid on the dotted canvas. Navigation is direction-aware:
 * moving DOWN the rail lifts the current sheet up and off while the next one
 * slides up from below; moving UP the rail reverses it. Between the two, the
 * bare paper ground shows for a beat — the same base Nyla
 * "thinks" on — and a ghosted serif chapter title sweeps through. The rail's
 * active pill glides to the new destination in sync (see LeftRail). */

const SCENE_ORDER: Scene[] = [
  'briefing', 'clients', 'actives', 'prospects', 'business', 'plan',
  'calendar', 'actionboard', 'freeform', 'canvas',
]

const SCENE_TITLES: Record<Scene, string> = {
  briefing: 'Briefing',
  clients: 'Clients',
  actives: 'Actives',
  prospects: 'Prospects',
  business: 'Business',
  plan: 'Plan',
  calendar: 'Calendar',
  actionboard: 'Action Board',
  freeform: 'Nyla',
  canvas: 'Canvas',
}

const EASE_SETTLE = [0.22, 0.65, 0.05, 1] as const
const EASE_LIFT = [0.55, 0.06, 0.68, 0.19] as const

const sceneVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    y: dir >= 0 ? 72 : -72,
    scale: 0.992,
    filter: 'blur(10px)',
  }),
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.52, ease: EASE_SETTLE },
  },
  exit: (dir: number) => ({
    opacity: 0,
    y: dir >= 0 ? -56 : 56,
    scale: 0.988,
    filter: 'blur(8px)',
    transition: { duration: 0.26, ease: EASE_LIFT },
  }),
}

export default function App() {
  const scene = useAppStore((s) => s.scene)
  const openLanding = useAppStore((s) => s.openLanding)
  const openBriefingV6 = useAppStore((s) => s.openBriefingV6)
  const briefingV6Open = useAppStore((s) => s.briefingV6Open)
  const [showGrid, setShowGrid] = useState(false)
  const [showNylaOverlay, setShowNylaOverlay] = useState(false)
  const [showTransitionProto, setShowTransitionProto] = useState(false)

  /* Deep-link: #briefing-v6 opens the v6 briefing directly (shareable preview). */
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('briefing-v6')) {
      openBriefingV6()
    }
  }, [openBriefingV6])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return
      if (e.key === 'm' || e.key === 'M') openLanding()
      if (e.key === 'g' || e.key === 'G') setShowGrid((v) => !v)
      if (e.key === 'n' || e.key === 'N') setShowNylaOverlay((v) => !v)
      if (e.key === 't' || e.key === 'T') setShowTransitionProto((v) => !v)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [openLanding])

  /* Direction of travel along the rail — adjusted during render when the
   * scene changes (React's derived-state pattern). Equal/unlisted → "down". */
  const [prev, setPrev] = useState(scene)
  const [dir, setDir] = useState(1)
  if (prev !== scene) {
    setPrev(scene)
    setDir(SCENE_ORDER.indexOf(scene) >= SCENE_ORDER.indexOf(prev) ? 1 : -1)
  }

  return (
    <SceneShell>
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={scene}
          custom={dir}
          variants={sceneVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="flex flex-1 flex-col"
        >
          {scene === 'briefing' && <BriefingV55Scene />}
          {scene === 'clients' && <ActionBoardScene />}
          {scene === 'actives' && <DestinationScene id="actives" />}
          {scene === 'prospects' && <DestinationScene id="prospects" />}
          {scene === 'business' && <BusinessScene />}
          {scene === 'plan' && <PlanScene />}
          {scene === 'calendar' && <CalendarScene />}
          {scene === 'actionboard' && <ActionBoardScene />}
          {scene === 'freeform' && <FreeformScene />}
          {scene === 'canvas' && <CanvasScene />}
        </motion.div>
      </AnimatePresence>
      <ChapterVeil scene={scene} dir={dir} />
      <ActionDeepDive />
      <CollabSpace />
      <OnboardingFlow />
      <LandingChooser />
      <QuickStartTour />
      <CoachDrill />
      <PracticeWrapped />
      <YearInReview />
      <DiscoveryFlow />
      <BriefingV6Scene />
      {showTransitionProto && <WelcomeToDiscoveryProto onClose={() => setShowTransitionProto(false)} />}
      {showGrid && !briefingV6Open && <GridOverlay />}
      {showNylaOverlay && <NylaOverlay onClose={() => setShowNylaOverlay(false)} />}
    </SceneShell>
  )
}

/* ── Grid overlay — toggled with G key ──────────────────────────────────────
 * Mirrors the column spec from DesktopGrid.tsx:
 * sidebar 272px · 12 cols · 40px margin · 24px gutter
 * Rendered fixed on top of everything so it works across all scenes and
 * overlays. pointer-events: none so it never blocks interaction. */
function GridOverlay() {
  const cols = Array.from({ length: 12 })
  const SIDEBAR = 272
  const MARGIN = 40
  const GUTTER = 24

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        display: 'flex',
      }}
    >
      {/* Sidebar zone */}
      <div style={{ width: SIDEBAR, flexShrink: 0, background: 'rgba(112, 40, 164, 0.08)', borderRight: '1px solid rgba(112,40,164,0.3)' }} />

      {/* Column zone */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          paddingLeft: MARGIN,
          paddingRight: MARGIN,
          gap: GUTTER,
        }}
      >
        {cols.map((_, i) => (
          <div
            key={i}
            style={{ flex: 1, background: 'rgba(112, 40, 164, 0.07)', borderLeft: '1px solid rgba(112,40,164,0.2)', borderRight: '1px solid rgba(112,40,164,0.2)' }}
          />
        ))}
      </div>

      {/* Label */}
      <div style={{ position: 'absolute', top: 6, left: SIDEBAR + MARGIN, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(112,40,164,0.7)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Grid · sidebar {SIDEBAR}px · {cols.length} col · {MARGIN}px margin · {GUTTER}px gutter · G to hide
      </div>
    </div>
  )
}

/* Ghosted serif chapter title that sweeps across the paper ground while one
 * sheet lifts off and the next settles in. Skips the initial mount. */
function ChapterVeil({ scene, dir }: { scene: Scene; dir: number }) {
  const [veil, setVeil] = useState<Scene | null>(null)
  const firstMount = useRef(true)

  useEffect(() => {
    if (firstMount.current) {
      firstMount.current = false
      return
    }
    setVeil(scene)
    const t = setTimeout(() => setVeil(null), 640)
    return () => clearTimeout(t)
  }, [scene])

  return (
    <AnimatePresence>
      {veil && (
        <motion.div
          key={veil}
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          transition={{ duration: 0.18 }}
          className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center pl-[76px]"
        >
          <motion.p
            initial={{ y: dir >= 0 ? 36 : -36 }}
            animate={{ y: 0 }}
            exit={{ y: dir >= 0 ? -28 : 28 }}
            transition={{ duration: 0.6, ease: EASE_SETTLE }}
            className="font-serif text-[clamp(64px,9vw,120px)] leading-none tracking-tight text-neutral-900/[0.08]"
            style={{ fontWeight: 400 }}
          >
            {SCENE_TITLES[veil]}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
