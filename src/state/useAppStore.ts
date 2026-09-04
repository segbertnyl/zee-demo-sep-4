import { create } from 'zustand'

/* v5 — generative-UI prototype + Touch-Designer-style three-layer canvas mode.
 * One scene at a time; canvas mode is a parallel rendering layer the advisor
 * opts into via the LeftRail icon. */

export type Scene =
  | 'briefing'
  | 'clients'
  | 'actives'
  | 'prospects'
  | 'business'
  | 'plan'
  | 'calendar'
  | 'actionboard'
  | 'freeform'
  | 'canvas'

/* Tiered access — which role can see/edit a given Layer 1 tile.
 * Advisor sees everything; assistant is restricted to client-facing nodes. */
export type Role = 'advisor' | 'assistant'

/* A breadcrumb entry on the canvas-mode navigation stack. The first entry is
 * always Layer 1 ('practice'); each push is a drill into a child network. */
export type CanvasFrame = {
  /* 1 = practice (Layer 1), 2 = domain (e.g. my-book), 3 = object (per-client) */
  layer: 1 | 2 | 3
  /* Which Layer 1 tile id we're inside, when layer > 1. */
  tileId?: string
  /* For layer 3, which object node id is open. */
  objectId?: string
  /* For multi-perspective Layer 2 canvases (e.g. My Book), which lens is active. */
  lens?: string
}

/* A breadcrumb crumb. The "trail" lets the advisor click back to any prior
 * step after drilling out of the canvas into a destination scene, a child
 * canvas layer, or a per-client deep-dive view. */
export type TrailCrumb = {
  id: string
  label: string
  target:
    | { kind: 'canvas-layer1' }
    | { kind: 'canvas-layer2'; tileId: string }
    | { kind: 'scene'; scene: Scene }
    | { kind: 'deep-dive'; id: string }
}

type AppState = {
  scene: Scene
  /* When set, the Freeform scene auto-starts this prompt on entry. */
  pendingPromptId: string | null
  /* Whether the right-side Nyla narrative drawer is open. */
  coachOpen: boolean
  /* When set, the action-board deep dive canvas is open for this opportunity id. */
  deepDive: string | null
  /* Whether the freeform collab space overlay is open */
  collabOpen: boolean
  /* Optional seed prompt — when set, CollabSpace skips Stage 0 and lands in Stage 1
   * (gathering) with this string as the asked question. */
  collabSeedPrompt: string | null
  /* When set, CollabSpace renders a focused single-card draft writer for the
   * given client instead of the Tom-Anderson briefing flow. Used by the action
   * board's "Draft a message" CTA. */
  collabDraftClient: 'janet' | 'helena' | 'tom' | null
  setScene: (s: Scene) => void
  next: () => void
  prev: () => void
  jumpToFreeform: (promptId: string) => void
  clearPendingPrompt: () => void
  setCoachOpen: (open: boolean) => void
  openChiefOfStaff: () => void
  openDeepDive: (id: string) => void
  closeDeepDive: () => void
  openCollab: (seedPrompt?: string, draftClient?: 'janet' | 'helena' | 'tom') => void
  closeCollab: () => void
  clearCollabSeedPrompt: () => void
  /* Canvas-mode navigation. */
  canvasPath: CanvasFrame[]
  /* Demo role — drives tiered access on canvas tiles. */
  role: Role
  setRole: (r: Role) => void
  openCanvas: () => void
  closeCanvas: () => void
  /* Onboarding takeover overlay. */
  onboardingOpen: boolean
  /* 'first-run' is the welcome variant; 'reorg' is the new-onboarding variant
   * for advisors who've completed onboarding before. */
  onboardingMode: 'first-run' | 'reorg' | 'revisit-goals' | null
  openOnboarding: (mode?: 'first-run' | 'reorg') => void
  openGoalRevisit: () => void
  closeOnboarding: () => void
  /* Quick-start tour shown the first time the user lands on the briefing after
   * finishing onboarding. Highlights key features and is replayable via the AI
   * assistant. */
  quickStartOpen: boolean
  openQuickStart: () => void
  closeQuickStart: () => void
  /* Coach drill overlay — guided 3-beat talk-track rehearsal triggered from
   * any "Start the X-min drill" CTA. The id picks which drill plays. */
  coachDrillId: string | null
  openCoachDrill: (id: string) => void
  closeCoachDrill: () => void
  /* Practice Wrapped takeover — Spotify-Wrapped-style year-in-review story
   * deck for the advisor. */
  wrappedOpen: boolean
  openWrapped: () => void
  closeWrapped: () => void
  /* Year in Review — 1-year Wrapped-style milestone review. */
  yearInReviewOpen: boolean
  openYearInReview: () => void
  closeYearInReview: () => void
  /* Discovery flow — 1A→1B→1C→Transition→1D onboarding discovery screens. */
  discoveryOpen: boolean
  discoveryInitialStep: string | null
  openDiscovery: () => void
  openDiscoveryAt: (step: string) => void
  closeDiscovery: () => void
  /** True when Discovery was opened straight from the onboarding welcome —
   *  drives the Nyla flight handoff (onboarding exits with a fast fade and the
   *  orb travels from the star slot). Menu quick-links leave it false, so the
   *  intro orb gathers in place instead. Consumed (cleared) once she lands. */
  discoveryFromOnboarding: boolean
  openDiscoveryFromOnboarding: () => void
  clearDiscoveryFromOnboarding: () => void
  /* Briefing v6 — the redesigned morning briefing scene (Exploration pt-II).
   * Mounted as a full-screen overlay, opened from the prototype menu. Kept
   * separate from the active 'briefing' scene so V55 stays intact. */
  briefingV6Open: boolean
  openBriefingV6: () => void
  closeBriefingV6: () => void
  /** True when Briefing v6 was opened straight from Discovery + plan-accept —
   *  triggers the one-time onboarding tour on first load. Consumed (cleared)
   *  once the tour starts. */
  briefingV6FromDiscovery: boolean
  openBriefingV6FromDiscovery: () => void
  clearBriefingV6FromDiscovery: () => void
  /* Drill-down breadcrumb trail — starts populating when the advisor enters
   * canvas mode and clicks a tile. Stays visible across destination scenes
   * (Business, Calendar, deep-dive canvases, etc.) so they can click back to
   * any prior level. Cleared by left-rail navigation. */
  navTrail: TrailCrumb[]
  pushTrail: (crumb: TrailCrumb) => void
  popTrailTo: (index: number) => void
  clearTrail: () => void
  /* Active advisor segment — drives briefing personalization. Persisted to
   * localStorage on onboarding finish so the briefing reflects the same advisor
   * across reloads. Defaults to 'cs-leading' (Marcus) per the demo screenshots. */
  activeSegment: 'cs-leading' | 'hl-accelerating' | 'cs-building'
  setActiveSegment: (s: 'cs-leading' | 'hl-accelerating' | 'cs-building') => void
  /* Session-scoped landing chooser shown at app boot. */
  landingChoiceOpen: boolean
  dismissLanding: () => void
  openLanding: () => void
  /* Drill into a child network. layer 1→2 needs tileId; 2→3 needs objectId. */
  canvasDrill: (next: CanvasFrame) => void
  /* Surface one level back; collapses to scene if the stack empties. */
  canvasSurface: () => void
  /* Change the active lens at the current Layer 2 frame. */
  setCanvasLens: (lens: string) => void
}

const ORDER: Scene[] = ['briefing', 'actionboard', 'freeform']

/* Turn a deep-dive id (e.g. "helena-1", "tom-anderson") into a human label
 * for breadcrumbs. Numeric suffixes are dropped; dashes become spaces. */
function humanizeDeepDive(id: string): string {
  const base = id.replace(/-\d+$/, '').replace(/-/g, ' ')
  return base.replace(/\b\w/g, (c) => c.toUpperCase())
}

export const useAppStore = create<AppState>((set, get) => ({
  scene: 'briefing',
  pendingPromptId: null,
  coachOpen: false,
  deepDive: null,
  collabOpen: false,
  collabSeedPrompt: null,
  collabDraftClient: null,
  setScene: (scene) => set({ scene }),
  next: () => {
    const i = ORDER.indexOf(get().scene)
    set({ scene: ORDER[Math.min(i + 1, ORDER.length - 1)] })
  },
  prev: () => {
    const i = ORDER.indexOf(get().scene)
    set({ scene: ORDER[Math.max(i - 1, 0)] })
  },
  jumpToFreeform: (promptId) => set({ scene: 'freeform', pendingPromptId: promptId }),
  clearPendingPrompt: () => set({ pendingPromptId: null }),
  setCoachOpen: (open) => set({ coachOpen: open }),
  openChiefOfStaff: () => set({ scene: 'freeform', coachOpen: true }),
  openDeepDive: (id) => {
    const trail = get().navTrail
    /* If the advisor is already inside a canvas-originated trail, append the
     * deep-dive as the next crumb so they can click back to where they were. */
    if (trail.length > 0) {
      set({
        deepDive: id,
        navTrail: [...trail, { id: `deep-${id}`, label: humanizeDeepDive(id), target: { kind: 'deep-dive', id } }],
      })
    } else {
      set({ deepDive: id })
    }
  },
  closeDeepDive: () => {
    /* Closing a deep-dive should also pop it from the trail if it was at the top. */
    const trail = get().navTrail
    if (trail.length > 0 && trail[trail.length - 1].target.kind === 'deep-dive') {
      set({ deepDive: null, navTrail: trail.slice(0, -1) })
    } else {
      set({ deepDive: null })
    }
  },
  openCollab: (seedPrompt, draftClient) =>
    set({
      collabOpen: true,
      collabSeedPrompt: seedPrompt ?? null,
      collabDraftClient: draftClient ?? null,
    }),
  closeCollab: () => set({ collabOpen: false, collabSeedPrompt: null, collabDraftClient: null }),
  clearCollabSeedPrompt: () => set({ collabSeedPrompt: null }),
  canvasPath: [{ layer: 1 }],
  role: 'advisor',
  setRole: (role) => set({ role }),
  openCanvas: () => set({
    scene: 'canvas',
    canvasPath: [{ layer: 1 }],
    navTrail: [{ id: 'practice', label: 'Practice', target: { kind: 'canvas-layer1' } }],
  }),
  closeCanvas: () => set({ scene: 'briefing', navTrail: [] }),
  onboardingOpen: false,
  onboardingMode: null,
  openOnboarding: (mode) => set({ onboardingOpen: true, onboardingMode: mode ?? 'first-run' }),
  openGoalRevisit: () => set({ onboardingOpen: true, onboardingMode: 'revisit-goals', yearInReviewOpen: false }),
  closeOnboarding: () => set({ onboardingOpen: false, onboardingMode: null }),
  quickStartOpen: false,
  openQuickStart: () => set({ quickStartOpen: true }),
  closeQuickStart: () => set({ quickStartOpen: false }),
  coachDrillId: null,
  openCoachDrill: (id) => set({ coachDrillId: id }),
  closeCoachDrill: () => set({ coachDrillId: null }),
  wrappedOpen: false,
  openWrapped: () => set({ wrappedOpen: true }),
  closeWrapped: () => set({ wrappedOpen: false }),
  yearInReviewOpen: false,
  openYearInReview: () => set({ yearInReviewOpen: true }),
  closeYearInReview: () => set({ yearInReviewOpen: false, briefingV6Open: true }),
  discoveryOpen: false,
  discoveryInitialStep: null,
  openDiscovery: () => set({ discoveryOpen: true, landingChoiceOpen: false, discoveryInitialStep: null, discoveryFromOnboarding: false }),
  openDiscoveryAt: (step) => set({ discoveryOpen: true, landingChoiceOpen: false, discoveryInitialStep: step, discoveryFromOnboarding: false }),
  closeDiscovery: () => set({ discoveryOpen: false, landingChoiceOpen: true, discoveryInitialStep: null, discoveryFromOnboarding: false }),
  discoveryFromOnboarding: false,
  openDiscoveryFromOnboarding: () => set({ discoveryOpen: true, landingChoiceOpen: false, discoveryInitialStep: null, discoveryFromOnboarding: true }),
  clearDiscoveryFromOnboarding: () => set({ discoveryFromOnboarding: false }),
  briefingV6Open: false,
  briefingV6FromDiscovery: false,
  openBriefingV6: () => set({ briefingV6Open: true, landingChoiceOpen: false }),
  openBriefingV6FromDiscovery: () => set({ briefingV6Open: true, landingChoiceOpen: false, briefingV6FromDiscovery: true }),
  closeBriefingV6: () => set({ briefingV6Open: false, landingChoiceOpen: true }),
  clearBriefingV6FromDiscovery: () => set({ briefingV6FromDiscovery: false }),
  navTrail: [],
  pushTrail: (crumb) => {
    const trail = get().navTrail
    /* Dedupe identical ids in a row. */
    if (trail.length > 0 && trail[trail.length - 1].id === crumb.id) return
    set({ navTrail: [...trail, crumb] })
  },
  popTrailTo: (index) => {
    const trail = get().navTrail
    if (index < 0 || index >= trail.length) return
    const next = trail.slice(0, index + 1)
    const target = next[next.length - 1].target
    if (target.kind === 'canvas-layer1') {
      set({ scene: 'canvas', canvasPath: [{ layer: 1 }], deepDive: null, navTrail: next })
    } else if (target.kind === 'canvas-layer2') {
      set({
        scene: 'canvas',
        canvasPath: [{ layer: 1 }, { layer: 2, tileId: target.tileId }],
        deepDive: null,
        navTrail: next,
      })
    } else if (target.kind === 'scene') {
      set({ scene: target.scene, deepDive: null, navTrail: next })
    } else if (target.kind === 'deep-dive') {
      set({ deepDive: target.id, navTrail: next })
    }
  },
  clearTrail: () => set({ navTrail: [] }),
  activeSegment: (() => {
    if (typeof window === 'undefined') return 'hl-accelerating'
    try {
      const saved = window.localStorage.getItem('agent-os-v5.active-segment')
      if (saved === 'cs-leading' || saved === 'hl-accelerating' || saved === 'cs-building') return saved
    } catch { /* no-op */ }
    return 'hl-accelerating'
  })(),
  setActiveSegment: (s) => {
    try { window.localStorage.setItem('agent-os-v5.active-segment', s) } catch { /* no-op */ }
    set({ activeSegment: s })
  },
  landingChoiceOpen: true,
  dismissLanding: () => set({ landingChoiceOpen: false }),
  openLanding: () => set({
    landingChoiceOpen: true,
    onboardingOpen: false,
    onboardingMode: null,
    collabOpen: false,
    deepDive: null,
    coachDrillId: null,
    wrappedOpen: false,
    // Close every full-screen overlay portal so "M" always returns to the menu,
    // rather than opening it underneath a still-mounted overlay.
    yearInReviewOpen: false,
    briefingV6Open: false,
    briefingV6FromDiscovery: false,
    discoveryOpen: false,
    discoveryInitialStep: null,
    quickStartOpen: false,
    coachOpen: false,
  }),
  canvasDrill: (next) => set({ canvasPath: [...get().canvasPath, next] }),
  canvasSurface: () => {
    const path = get().canvasPath
    if (path.length <= 1) {
      set({ scene: 'briefing' })
      return
    }
    set({ canvasPath: path.slice(0, -1) })
  },
  setCanvasLens: (lens) => {
    const path = get().canvasPath
    if (path.length === 0) return
    const top = { ...path[path.length - 1], lens }
    set({ canvasPath: [...path.slice(0, -1), top] })
  },
}))
