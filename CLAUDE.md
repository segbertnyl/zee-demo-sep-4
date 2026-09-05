# Claude Code — NYL360 Prototype

## What this is

A clickable prototype for New York Life financial advisors. Not production — demo polish beats architectural purity. React 19 + TypeScript + Vite + Tailwind 4 + Zustand + Motion (Framer).

## Dev servers

```bash
npm run dev        # http://localhost:5174
npm run storybook  # http://localhost:6006
```

Press **M** in the prototype to open the menu. Press **G** to toggle the grid overlay.

## Active sprint

**Read `docs/FE-REFINEMENTS.md` before starting any work.** It contains 4 ready-to-build tickets decided in a design grilling session on 2026-06-29:

| Ticket | Summary                                                                            | Agent                   |
| ------ | ---------------------------------------------------------------------------------- | ----------------------- |
| 1      | Persistent NYLLogo — single instance in SceneShell, remove from all flows          | Minimal Change Engineer |
| 2      | NylaAffirmation component — reusable loading affirmation screen with auto-advance  | Frontend Developer      |
| 3      | Discovery scroll consistency — uniform SCREEN_TRANSITION constant across all steps | Minimal Change Engineer |
| 4      | Plan Reveal stub — wire navigation + purple wipe transition, placeholder content   | Frontend Developer      |

Build order: Tickets 1, 2, 3 in parallel → Ticket 4 after Ticket 2 merges.

## Key rules

- **All colors via CSS tokens** — no hardcoded hex. See `src/styles/tokens.css`.
- **All motion via `@/motion`** — import `EASE.*` and `DURATION.*`, never inline arrays.
- **Every new Storybook component gets a Playwright test** — follow `tests/AGENT_TEMPLATE.md`.
- **Commit locally only** — never push unless explicitly asked.
- **Senior dev token review before committing** — run the Code Reviewer agent after building.

## Component library

All UI components are in `src/ui/` with Storybook stories. Before building anything new, check Storybook first — the component likely already exists.

Key components for the active sprint:

- `src/ui/LoadingBackground.tsx` — background for NylaAffirmation
- `src/ui/Nyla.tsx` — use `style="dark-stroke"` for NylaAffirmation
- `src/ui/StageRail.tsx` — contains the NYLLogo that Ticket 1 removes
- `src/scenes/DiscoveryFlow.tsx` — where Tickets 2 + 3 + 4 wire in
- `src/components/SceneShell.tsx` — where Ticket 1 adds the persistent logo

## Agent roster

Agent definitions live in `scripts/agents/`. Invoke them with the `Agent` tool and `subagent_type`. Full descriptions in `AGENTS.md`.

| Agent                   | `subagent_type`           | Definition file                                         | When to use                                              |
| ----------------------- | ------------------------- | ------------------------------------------------------- | -------------------------------------------------------- |
| Frontend Developer      | `Frontend Developer`      | `scripts/agents/engineering-frontend-developer.md`      | Building new components, scenes, Storybook stories       |
| Minimal Change Engineer | `Minimal Change Engineer` | `scripts/agents/engineering-minimal-change-engineer.md` | Targeted fixes, single-prop changes, removing code       |
| Code Reviewer           | `Code Reviewer`           | `scripts/agents/engineering-code-reviewer.md`           | Token + motion compliance audit — run after every ticket |
| Workflow Architect      | `Workflow Architect`      | `scripts/agents/specialized-workflow-architect.md`      | Scoping work from Figma, writing build-ready specs       |
| Reality Checker         | `Reality Checker`         | `scripts/agents/testing-reality-checker.md`             | Pre-merge production readiness check                     |

### Standard workflow per ticket

```
1. Workflow Architect   — read Figma, produce spec (if design ambiguous)
2. Frontend Developer   — build component/scene + Storybook story + Playwright test
   OR
   Minimal Change Engineer — apply targeted changes
3. Code Reviewer        — token/motion compliance audit
4. Apply fixes          — Minimal Change Engineer patches anything the reviewer flags
5. Commit + push
```

## Figma file

`VCjqlGu9kQVy2i5nqDxKqa` — Exploration pt II. All Figma references in `docs/FE-REFINEMENTS.md` include direct node links.

## Branch

`feat/cleanup-bg-components` — create a sub-branch from here for each ticket: `feat/refinement-logo`, `feat/refinement-nyla-affirmation`, etc.
