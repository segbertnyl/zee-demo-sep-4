<p align="center">
  <img src="docs/banner.svg" alt="NYL360 — Chief of Staff" width="100%" />
</p>

<p align="center">
  <img alt="React 19" src="https://img.shields.io/badge/React-19-0468ff?logo=react&logoColor=white&labelColor=000a62" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6.0-0468ff?logo=typescript&logoColor=white&labelColor=000a62" />
  <img alt="Vite 8" src="https://img.shields.io/badge/Vite-8-0468ff?logo=vite&logoColor=white&labelColor=000a62" />
  <img alt="Tailwind CSS 4" src="https://img.shields.io/badge/Tailwind-4-0468ff?logo=tailwindcss&logoColor=white&labelColor=000a62" />
  <img alt="Zustand" src="https://img.shields.io/badge/Zustand-5-ff9522?labelColor=000a62" />
  <img alt="Motion" src="https://img.shields.io/badge/Motion-12-ff9522?labelColor=000a62" />
  <img alt="Deployed on Vercel" src="https://img.shields.io/badge/Vercel-deployed-1ab382?logo=vercel&logoColor=white&labelColor=000a62" />
</p>

# NYL360 — Chief of Staff

An interactive prototype of an **agent operating system** for New York Life advisors: a morning briefing, a living book of business, and an AI chief of staff that turns client signals into next actions. Built by [Huge](https://www.hugeinc.com) as a scene-based React app — no backend, all narrative.

> 🔗 **Live preview:** [agent-os-v5-5 on Vercel](https://agent-os-v5-5-evienna-2363-huge-inc-sandbox.vercel.app) *(password-gated)*

---

## How it works

One Zustand store drives everything. `scene` selects the primary view; overlay experiences (deep dives, collab space, onboarding, coach drills) are always mounted and reveal themselves from their own slices of state. Scene transitions animate through Motion's `AnimatePresence`.

```mermaid
flowchart LR
    store[("useAppStore<br/>(Zustand)")] -->|scene| shell["SceneShell<br/>LeftRail · NavTrailBar"]

    subgraph scenes ["Primary scenes — one at a time"]
        briefing["☀️ Briefing"]
        book["📒 Book of Business"]
        calendar["🗓 Calendar"]
        canvas["🧠 Canvas"]
    end

    subgraph overlays ["Overlay experiences — summoned by state"]
        deepdive["Action Deep Dive"]
        collab["Collab Space"]
        coach["Coach Drill"]
        wrapped["Practice Wrapped"]
        onboarding["Onboarding · Tour"]
    end

    shell --> scenes
    store -.-> overlays

    style store fill:#000a62,color:#fff,stroke:#0468ff
    style shell fill:#0468ff,color:#fff,stroke:#000a62
    style scenes fill:#f0efed,stroke:#b3afac
    style overlays fill:#ffe8cf,stroke:#ff9522
```

## Scene guide

| Scene | File | What it does |
|---|---|---|
| ☀️ **Briefing** | `BriefingV55Scene` | The morning briefing — today's signals, narrated |
| 📒 **Book of Business** | `ActionBoardScene` · `MyBookCanvas` | Clients and prospects as a living action board |
| 🎯 **Destinations** | `DestinationScene` | Actives and prospects pipelines |
| 📈 **Business** | `BusinessScene` | Practice-level metrics |
| 🗓 **Calendar** | `CalendarScene` | The week, with prep woven in |
| 🧠 **Canvas** | `CanvasScene` · `FreeformScene` · `SignalsCanvas` | Freeform thinking surfaces |
| 🔍 **Action Deep Dive** | `ActionDeepDive` | Drill into a single recommended action |
| 🤝 **Collab Space** | `CollabSpace` | Working session with the AI chief of staff |
| 🏋️ **Coach Drill** | `CoachDrill` | Practice conversations before the real one |
| 🎁 **Practice Wrapped** | `PracticeWrapped` | Year-in-review, Spotify-Wrapped style |
| 👋 **Onboarding** | `OnboardingFlow` · `LandingChooser` · `QuickStartTour` | First-run flows and guided tour |

## Getting started

```bash
npm install
npm run dev      # vite dev server
npm run build    # tsc -b && vite build — strict, unused vars fail the build
npm run lint
```

## Project structure

```
src/
├── App.tsx              # scene router (AnimatePresence)
├── state/useAppStore.ts # the one store
├── scenes/              # primary scenes + overlay experiences
├── components/          # SceneShell, LeftRail, NavTrailBar, Typewriter…
├── data/                # briefing + advisor narrative content
├── styles/tokens.css    # NYL token layer: primitives → semantics → theme
└── ui/                  # brand atoms (NYLLogo)
```

## Design system

- **Tokens first** — touch `src/styles/tokens.css`, not component styles. Primitives → semantics → theme, with the raw JSON preserved in `src/styles/tokens/`.
- **Type** — [Alverata](https://fonts.adobe.com/fonts/alverata) (serif, via Adobe Fonts kit) + Roboto / Roboto Mono.
- **Color** — NYL brand palette: Blue `#0468ff` · Dark Blue `#000a62` · Orange `#ff9522` · Purple `#4d1773`, plus a data-viz ramp mapped to client trigger types.

## Working on this repo

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for full setup — access, SSO, and local dev.

- Clone to a normal folder — **not** a synced directory (Dropbox/iCloud corrupt `.git` and `node_modules`).
- Branch per change → PR into `main`. `main` is protected and always deployable.
- `npm run build` must pass — `tsc -b` is strict and unused vars are errors. **CI enforces this on every PR.**
- Every PR gets an automatic Vercel preview URL; merging to `main` auto-deploys to production.

---

<p align="center">
  <sub>Internal prototype · New York Life × Huge · not for distribution</sub>
</p>
