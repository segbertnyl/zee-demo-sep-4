# NYL360 — Team Brief

**For the design team.** This is your working document for contributing to the prototype using Claude Code.

---

## What we're building

NYL360 is an agent operating system for New York Life financial advisors: a morning briefing, a living book of business, and an AI assistant (Nyla) that turns client signals into next actions. We're building a clickable prototype for client review — not production software. That means demo polish beats architectural perfection every time.

The prototype lives at **https://github.com/HugeInternal/nylife-proto** and auto-deploys to Vercel on every merge to main.

---

## How vibe coding works here

**The loop:**

```
Figma screen  →  describe it to Claude Code  →  Claude writes the code  →  you check it in Storybook  →  branch + PR  →  Vercel preview
```

You don't need to know TypeScript. You need to be able to:

1. Open a Figma screen and describe what you see
2. Run two terminal commands (`npm run storybook` and `npm run dev`)
3. Create a git branch, commit, and open a pull request (Claude Code can do all of this for you — just ask)

**Where to look at your work:**

- **Storybook** (port 6007) — view any individual component in isolation. Great for building and tweaking UI pieces.
- **Dev server** (port 5174) — the full prototype running locally. Use this to see how components fit into the actual flow.

**When you're stuck:** Paste your error message directly into Claude Code and ask "what's wrong?" It will fix it.

---

## The three roles

We're splitting the work into three lanes so nobody blocks anyone else.

---

### Role 1 — Component Builder

**What you own:** Individual UI components — buttons, cards, rails, loaders — in Storybook. You work on one component at a time, in isolation, without needing to understand the full prototype flow.

**Where your files live:**
- Components: `src/ui/YourComponent.tsx`
- Storybook stories: `src/ui/YourComponent.stories.tsx`

**How to add a new component:**

1. Open Figma, find the component you want to build
2. Take a screenshot or copy a description
3. Tell Claude Code: "Build this component as a Storybook story. Here's what it looks like: [paste screenshot/description]. Follow the patterns in `src/ui/Button.tsx` and `src/ui/Button.stories.tsx`."
4. Claude writes the files. Run `npm run storybook` and open http://localhost:6007 to see it.
5. Adjust by describing changes: "Make the border radius tighter" or "The color should be `#0468ff`"

**How to edit an existing component:**

1. Find the file in `src/ui/`
2. Tell Claude Code: "In `src/ui/BriefingCard.tsx`, [describe the change]"

**Your first task:** The `NavTrailBar` component (`src/components/NavTrailBar.tsx`) exists but has no Storybook story. Create `src/components/NavTrailBar.stories.tsx` so the team can see and edit it in isolation. Ask Claude Code: "Create a Storybook stories file for `src/components/NavTrailBar.tsx`. Follow the pattern in `src/ui/StageRail.stories.tsx`."

---

### Role 2 — Flow Assembler

**What you own:** Wiring Storybook components into the actual prototype screens — one Figma screen at a time. You work primarily in `src/scenes/OnboardingFlow.tsx` (the onboarding sequence) and `src/scenes/BriefingV55Scene.tsx` (the morning briefing).

**The migration target:** Figma file [Exploration pt. II](https://www.figma.com/design/VCjqlGu9kQVy2i5nqDxKqa). Everything we build should match the screens in this file.

**The four flows and their status:**

| Flow | Figma section | Status |
|---|---|---|
| Welcome | `00 — Welcome` | Done |
| Discovery | `01 — Discovery` | Done |
| Plan Reveal | `02 — Plan Reveal` | In progress — sub-steps 2.A → 2.E still need migration |
| Briefing | `03 — Briefing` | In progress — multi-state card layout + Sandra Kim content remaining |

**How to migrate a screen:**

1. Open the Figma screen
2. Take a screenshot
3. Tell Claude Code: "This is the Figma screen for Plan Reveal step 2.B (the math step). Here's a screenshot: [paste]. Update `src/scenes/OnboardingFlow.tsx` to match this design. Existing components to use: `PercentLoader`, `StageRail`, `PlanRail`."
4. Check the result at http://localhost:5174 by navigating through the onboarding flow

**Your first task:** Migrate the Plan Reveal loading and math sub-steps (Figma `02 — Plan Reveal`, sub-steps 2.A and 2.B) in `src/scenes/OnboardingFlow.tsx`. Open those Figma screens, screenshot them, and say: "Update OnboardingFlow.tsx so the Plan Reveal sub-steps 2.A (loading state) and 2.B (math reveal) match these Figma designs."

**Key components already available for Plan Reveal:**
- `PercentLoader` — the circular loading indicator
- `StageRail` / `PlanRail` — the left-side navigation rails
- `CreatingBriefing` — the "building your briefing" transition screen

---

### Role 3 — Content and Copy

**What you own:** The words. You keep narrative copy, client names, data labels, and scenario content accurate and on-brand. You work primarily in data and content files — no component logic.

**Where your files live:**
- `src/data/briefingContent.ts` — all briefing card copy (client names, signal descriptions, action labels)
- `src/scenes/freeformContent.ts` — freeform canvas content
- Copy throughout `src/scenes/OnboardingFlow.tsx` — question labels, answer options, Nyla's dialogue lines

**Demo personas to know:**
- **Advisor:** Sarah (the user persona — do not use Marisol)
- **AI assistant:** Nyla (do not call her "Chief of Staff" in UI copy)
- **Featured client:** Sandra Kim (lapse risk scenario in Briefing)

**How to update copy:**

1. Find the Figma screen with the correct copy
2. Tell Claude Code: "In `src/data/briefingContent.ts`, update the Sandra Kim card: the signal should read '[new text]' and the action label should be '[new text]'"
3. Check at http://localhost:5174

**How to add a new copy scenario:**

1. Tell Claude Code: "Add a new BriefingCard entry to `src/data/briefingContent.ts` for a client named Marcus Webb, with a signal about an upcoming policy anniversary. Follow the pattern of the existing Sandra Kim entry."

**Your first task:** Open the Figma screens for `03 — Briefing` and compare the Sandra Kim lapse risk card copy against what's currently in `src/data/briefingContent.ts`. List any differences, then tell Claude Code to update the file to match Figma.

---

## What's already built

**Component library (all in Storybook):**
- Backgrounds: OnboardingBackground (V1/V2), OnboardingIntroBackground, OnboardingIntroOverlay
- Onboarding nav: StageRail (with active states), PlanRail
- Actions: Button (primary/secondary/text/outlined/icon), SectionActions
- Briefing: BriefingCard (UrgentCard + SignalCard), OpportunityRing, BriefingControls
- Action board: OpportunityCard, PlanDot, ProgressBar
- Plan: PaceChart, MetricTile, ContributionBar
- Primitives: BadgePill, SectionEyebrow, Chevron, PercentLoader
- Atoms: NYLLogo, CoSStar, TypewriterText
- Design system: Grid (desktop + mobile), Motion System (with widget), Colors, Spacing, Typography tokens

**Prototype flows (working in dev server):**
- Full onboarding: Welcome → Discovery (All About You + Your Plan steps)
- Plan Reveal: partially migrated — 2.A–2.E still need work
- Morning Briefing: card layout updated, some Sandra Kim content still to migrate

**Motion system:** Storybook toolbar has a play/pause toggle and a panel for adjusting animation ease and duration on any story. The motion source of truth is `src/motion.ts`.

---

## Key links

| Link | URL |
|---|---|
| Figma source | https://www.figma.com/design/VCjqlGu9kQVy2i5nqDxKqa/Exploration-pt-II |
| GitHub repo | https://github.com/HugeInternal/nylife-proto |
| Active branch | `feat/storybook-components` |
| Live preview | https://agent-os-v5-5-evienna-2363-huge-inc-sandbox.vercel.app *(password-gated)* |
| Dev server (local) | http://localhost:5174 |
| Storybook (local) | http://localhost:6007 |

---

## Running the project locally

```bash
# First time only
npm install

# Start the dev server (full prototype)
npm run dev
# Open http://localhost:5174

# Start Storybook (component library)
npm run storybook
# Open http://localhost:6007

# Check your changes will pass CI before committing
npm run build
```

If `npm run build` fails, paste the error into Claude Code. Do not push with a failing build — CI will block your PR.

---

## Branch and commit rules

**Branch naming:**
```
yourname/short-description
# examples:
jana/plan-reveal-math-step
kim/sandra-kim-copy-update
alex/navtrailbar-stories
```

**How to create a branch (ask Claude Code to do this):**
"Create a branch called jana/plan-reveal-math-step and commit my changes with the message 'Add Plan Reveal 2.B math step'"

**Rules:**
- Never push to `main` directly — always branch → PR
- Every PR gets an automatic Vercel preview URL — use that to share work for review
- Merging to `main` auto-deploys to production (the live Vercel URL)
- Commit locally only; ask explicitly when you want to push

**If you're unsure about anything:** Ask Claude Code. Describe what you want in plain language. You do not need to know the command.

---

*Internal prototype — New York Life × Huge — not for distribution*
