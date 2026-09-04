# NYLife Proto — Session Handoff

## Repo
`git@github.com:HugeInternal/nylife-proto.git`
Cloned to: `~/Projects/nylife-proto`

## SSH Setup
- Key: `~/.ssh/id_ed25519_huge` (added to `tim-drabandt_huge` GitHub account)
- SSH config: `~/.ssh/config` points github.com to `id_ed25519_huge`
- SSH agent: run `ssh-add ~/.ssh/id_ed25519_huge` if auth fails after reboot

## Dev Servers
```bash
cd ~/Projects/nylife-proto
npm run dev        # http://localhost:5174
npm run storybook  # http://localhost:6006
```

## Current Branch
`feat/cleanup-bg-components` — not yet pushed to remote

## What's on this branch (cumulative)

### Storybook
- **UI / Backgrounds**: Intro—Overlay, Title, Loading, Plan Summary — all use CSS tokens + DriftingBlobs (dark/light theme)
- **UI / Discovery / Transition**: 3-phase component (intro/reveal/settled) for the 00.1–00.3 transition screens
- **UI / Nyla**: 4-variant icon (dark-fill, dark-stroke, light-fill, light-stroke) — pure SVG
- **UI / ButtonContainer**: right-aligned action bar, text/secondary/primary-only variants
- **UI / SectionHeader**: primary (42px navy serif + Nyla icon) and secondary (24px serif) variants
- **UI / TextInput**: 66px input with inline SVG mic button
- **UI / InteractiveTag**: asymmetric pill, selected/unselected states
- **UI / NylaGuidance**: blue left border + Nyla dark-stroke + rich text
- **UI / OptionTile** (updated): horizontal layout, light-blue selected state matching Figma 839-765
- **Components / OptionTile**: updated to match Figma (was dark-inverted, now blue-050 bg)
- **Playwright QA harness**: `tests/` with helpers, AGENT_TEMPLATE.md, tests for all components

### Token system
- `tokens.css`: full purple scale added (025→050→200→400→500→900), nyl-blue-050/700 added
- Token compliance pass across all 34 components — no hardcoded hex colors, no local ease constants
- All motion values use `EASE.*` / `DURATION.*` from `@/motion`

### Prototype
- **DiscoveryFlow** (`src/scenes/DiscoveryFlow.tsx`): 8-screen overlay accessible from prototype menu (press M)
  - 1A: Nyla intro (TitleBackground + white card)
  - 1B: History stats table (What we know)
  - 2.0 Goals intro: Primary SectionHeader + LoadingBackground
  - 2.1 Growth: OptionTileGroup (max 3) + NylaGuidance
  - 2.4 Objectives: OptionTileGroup + TextInput
  - Transition: rotating Nyla + loading text, auto-advances 3s
  - 1D Practice: two question screens + Finish
- **LandingChooser**: "Discovery flow" tile added at bottom
- All screens on 271px left rail zone, 850px content column, 40px padding

## Motion Token Source of Truth
`src/motion.ts` — EASE, DURATION, SPRING. Storybook: `Design System / Motion`.

## Figma → Storybook Direction
**Figma → Storybook → prototype**. Tim creates/refines in Figma; agents read via MCP and implement.

### QA process (mandatory for every new component)
1. Fetch Figma via MCP
2. Implement using existing Storybook components + grid (271px rail, 850px content, 40px padding)
3. Senior dev token review before commit
4. Playwright test following `tests/AGENT_TEMPLATE.md`

### Figma file
`VCjqlGu9kQVy2i5nqDxKqa` — Exploration pt II

### Discovery flow nodes (895-3976)
| Node | Screen | Status |
|---|---|---|
| 816-25664 | 1A Intro | ✅ Prototype |
| 816-25562 | 1B History | ✅ Prototype |
| 816-22955 | 2.0 Goals intro | ✅ Prototype |
| 816-23032 | 2.1 Growth | ✅ Prototype |
| 816-23621 | 2.4 Objectives | ✅ Prototype |
| 867-20572 | Transition | ✅ Prototype |
| 940-3805 | 1D Practice type | ✅ Prototype |
| — | 1D Practice clients | ✅ Prototype |

### Next flows (not started)
- Plan Reveal (Figma nodes TBD)
- Briefing flow

## Copy Document
`scripts/copy-export.BASELINE.csv` — last ID: 756. Append new rows at end.

## Known open items
- Discovery flow screens 2.2, 2.3 (Personal Goal / FYC target) not in the prototype yet
- DiscoveryFlow visual QA still in progress — user flagged 1B as needing fixes (applied)
- `WelcomeSequence.tsx` `beginExit()` has 3 unguarded setTimeouts (low demo risk)
- BriefingCard urgent/error colors have no NYL tokens yet (design system gap)
- PaceChart chart line colors (#66a8ff, #bc79ec) have no tokens (design system gap)

## Branch Workflow
```bash
npm run build      # strict TS + lint must pass before pushing
git push origin feat/cleanup-bg-components
# open PR into main → CI → Vercel preview auto-posted
```
