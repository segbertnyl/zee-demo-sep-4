# FE Design Refinements — Sprint Plan

**Status:** Ready to build  
**Scope:** Transitions, loading states, logo stability  
**Owner:** Unassigned — pick up any ticket independently  
**Branch convention:** `feat/refinement-<ticket-id>`

---

## Decision log (grilled 2026-06-29)

| Decision | Choice | Rationale |
|---|---|---|
| Logo stability | Single persistent instance at app shell | Eliminates remount drift across all future flows |
| Within-section feel | Continuous scroll, questions build on each other | Matches conversational rhythm |
| Between-section feel | Distinct choreography per boundary | Each boundary has a different emotional weight |
| Loading state triggers | Auto-advance at ~2.5s | Affirmation moments, not decisions — tapping breaks rhythm |
| Loading headline animation | Fade up (opacity + y), not typewriter | Typewriter is reserved for WelcomeSequence opening lines |
| Plan Reveal scope | Infrastructure only — stub + transition | Client approval pending; wire route, content follows after sign-off |

---

## Ticket 1 — Persistent NYLLogo

**Complexity:** Low  
**Blocks:** All other tickets (logo must be stable before transition work starts)

### What
Move `NYLLogo` out of individual flow components into a single persistent instance at the `SceneShell` level, fixed at `top: 40px, left: 40px`, z-index above all overlays (`z-[9999]`).

### Why
Currently the logo lives in 5 separate places at slightly different sizes and positions:
- `LeftRail.tsx` — `pixelSize={44}`
- `StageRail.tsx` — `pixelSize={40}`
- `OnboardingFlow.tsx` (line 381) — `pixelSize={40}`
- `OnboardingIntroOverlay.tsx` (line 106) — `pixelSize={40}`
- `DiscoveryFlow.tsx` (line 316) — `size="md"` in a flex row with close button

Each remounts independently, causing visible positional jumps on every state change.

### How
1. Add `<NYLLogo pixelSize={40} className="rounded-md" />` to `src/components/SceneShell.tsx` as a `fixed` element at `top: 40, left: 40, z-[9999], pointer-events-none`
2. Remove the logo instance from every flow that renders one:
   - `StageRail.tsx` — remove the animated `NYLLogo` motion.div (lines ~140–144)
   - `OnboardingFlow.tsx` — remove the logo div (line ~381)
   - `DiscoveryFlow.tsx` 1A intro — restructure the top bar so only the close button remains; the shell logo shows through
   - `OnboardingIntroOverlay.tsx` — remove logo from the purple drawer div
3. The `introDelay` animation on StageRail currently staggers the logo entrance — this stagger should be removed since the logo is now persistent

### Acceptance
- Logo stays fixed at the same pixel position through: WelcomeSequence → DiscoveryFlow → prototype menu → any other state
- No jump, no fade-out/in, no resize between states

---

## Ticket 2 — NylaAffirmation component

**Complexity:** Medium  
**Depends on:** Nothing (can be built in parallel with Ticket 1)

### What
A reusable full-screen affirmation moment. Nyla appears, a small label fades in, then a large serif headline fades up. Auto-advances after a configurable duration.

### Figma references
- After FYC target: [node 1034-20836](https://www.figma.com/design/VCjqlGu9kQVy2i5nqDxKqa/Exploration-pt-II?node-id=1034-20836) — "Pulling in your FYC goals... $47,000 is a great target"
- After Goals section: [node 1034-20849](https://www.figma.com/design/VCjqlGu9kQVy2i5nqDxKqa/Exploration-pt-II?node-id=1034-20849) — "Pulling in your goals... I'll track and align to your 6 goals"

### Component spec

**File:** `src/ui/NylaAffirmation.tsx`

```tsx
export interface NylaAffirmationProps {
  label: string           // small text above — "Pulling in your FYC goals..."
  headline: string        // large serif below — "$47,000 is a great target"
  headlineAccent?: string // optional substring rendered in accent treatment
  duration?: number       // ms before onComplete fires, default 2500
  onComplete: () => void
}
```

**Animation sequence:**
1. `t=0`: `LoadingBackground` renders (instant)
2. `t=0`: Nyla dark-stroke icon fades in + slow spin (18s loop, `EASE.settle`, `DURATION.dramatic`)
3. `t=400ms`: label fades in (`opacity: 0→1`, `DURATION.short`, `EASE.settle`)
4. `t=700ms`: headline fades up (`opacity: 0→1`, `y: 8→0`, `DURATION['scene-in']`, `EASE.settle`)
5. `t=duration`: `onComplete()` fires

**Storybook:** `UI / NylaAffirmation`  
Stories: `FYCTarget`, `GoalsConfirmation`, `AllVariants`

**Playwright test:** mount smoke + auto-advance fires onComplete

### Usage in DiscoveryFlow
Add two new steps:

| Step ID | Trigger | label | headline |
|---|---|---|---|
| `affirmation-fyc` | After `goals-fyc-target` | "Pulling in your FYC goals..." | `"$${fycTarget} is a great target"` |
| `affirmation-goals` | After `goals-objectives` | "Pulling in your goals..." | `"I'll track and align to your ${count} goals"` (count = growthSelections.length + objectivesSelections.length) |

Insert `affirmation-fyc` between `goals-fyc-target` and `goals-objectives` in `STEPS[]`.  
Insert `affirmation-goals` between `goals-objectives` and `transition` in `STEPS[]`.

Both steps: `STEP_TO_STAGE = 1`, `introDelay = 0` on StageRail (already persistent via Ticket 1).

---

## Ticket 3 — Discovery within-section scroll

**Complexity:** Low  
**Depends on:** Nothing

### What
Ensure all question steps within DiscoveryFlow use a consistent enter/exit animation that reads as continuous scroll. Currently most steps use `y: 24→0` on enter and `y: -12` on exit — this is correct but not uniformly applied.

### How
1. Audit every `motion.div` screen block in `DiscoveryFlow.tsx` — confirm all use:
   - `initial={{ opacity: 0, y: 24 }}`
   - `animate={{ opacity: 1, y: 0 }}`
   - `exit={{ opacity: 0, y: -12 }}`
   - `transition={{ duration: DURATION['scene-in'], ease: EASE.settle }}`
2. Extract a shared `SCREEN_TRANSITION` constant at the top of the file and reference it from every screen's `transition` prop
3. The `intro` step (1A) is an exception — it has its own entrance via TitleBackground and should keep its current transition

---

## Ticket 4 — Plan Reveal infrastructure

**Complexity:** Low  
**Depends on:** Ticket 2 (NylaAffirmation) should be done first so the flow to Plan Reveal feels complete

### What
Wire the navigation from Discovery's final screen (`practice-close-rate`) through to a Plan Reveal stub. The transition *into* the reveal should feel intentional even if the content is placeholder.

### Figma reference (pending client approval)
[node 1120-147320](https://www.figma.com/design/VCjqlGu9kQVy2i5nqDxKqa/Exploration-pt-II?node-id=1120-147320) — full scrollable plan document, dark purple, chart + section cards.  
**Do not build content until approval confirmed.**

### How
1. Add `'plan-reveal'` to the `Step` type and `STEPS[]` array in `DiscoveryFlow.tsx`, after `practice-close-rate`. `STEP_TO_STAGE = 2`.
2. Create the stub screen:
   ```
   Full-screen purple gradient (TitleBackground or PlanSummaryBackground)
   Centered: NYLLogo + "Sarah's 2026–2027 Plan" (serif, white, Display 01)
   Below: "Coming soon — pending client approval" (small, muted)
   ButtonContainer: "Back to menu" → closeDiscovery()
   ```
3. The transition from `practice-close-rate` → `plan-reveal` should use a distinct enter animation:
   - Purple gradient wipes in from the bottom (`y: 100%→0`, 0.95s, `[0.7, 0, 0.2, 1]`) — mirrors the WelcomeSequence exit wipe but from the opposite direction
   - Headline fades up after the wipe settles (0.4s delay)
4. Change `practice-close-rate`'s "Save and continue" button: `onPrimary={nextStep}` (currently `nextStep` would hit end of STEPS — make sure it flows to `plan-reveal`)

### When to build the real screen
After client approval on Figma node 1120-147320. That becomes its own ticket — full Plan scene with chart, section cards, scroll behavior.

---

## Build order

```
Ticket 1 (Logo)     ──────────────────────────────────────────── first, blocks nothing else
Ticket 2 (NylaAffirmation) ──────────────────────── parallel with Ticket 1
Ticket 3 (Scroll)   ────────────────────────────────── parallel with 1 + 2
Ticket 4 (Plan stub) ────────── after Ticket 2 is merged
```

---

## Out of scope for this sprint

- Plan Reveal content (waiting on client approval — Figma node 1120-147320)
- Plan screen scroll behavior
- Section card components
- `headlineAccent` visual design (color/weight of the accent portion in NylaAffirmation) — flagged for design pass

---

## Agent roster for this work

| Agent | Task |
|---|---|
| Minimal Change Engineer | Ticket 1 (logo removal from each flow) |
| Frontend Developer | Ticket 2 (NylaAffirmation component + Storybook + tests) |
| Minimal Change Engineer | Ticket 3 (scroll audit + SCREEN_TRANSITION constant) |
| Frontend Developer | Ticket 4 (Plan Reveal stub + wipe transition) |
| Code Reviewer | Token + motion compliance pass after all 4 tickets merge |
