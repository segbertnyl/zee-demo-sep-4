# Briefing v6 — build notes & DECISIONS NEEDED

Branch: `briefing-v6`. This documents what was built in the first vertical slice,
plus the open decisions per §9 of the brief. Nothing here is silently finalized —
each item is yours to confirm/tune.

## Update 5 — main navigation (latest)
Rebuilt the left rail to Figma 1002-12213:
- Logo (NY Life mark, doubles as back-to-menu), then six nav items — Briefing
  (active, blue), Clients, Prospects, Network, Business, Action Board — then two
  bottom utilities above the avatar: Notifications + Calendar, each with a blue
  status dot. AF avatar at the bottom.
- **Hover to expand**: collapsed 96px → expands to 248px on hover, revealing the
  labels (and the advisor name by the avatar).
- Pulled the nav glyphs from Figma into the icon library (navBriefing, personCheck,
  tag, orgChart, briefcase, listAdd, bell, calendar) — all in the Storybook
  *Design System / Icons* gallery. Notification dots render as a separate badge so
  the bell/calendar icons stay reusable.
- Nav items are visual for now (don't switch scenes); wire to real destinations next.

## Update 4 — expand interaction, glow, full page
- **Footer expand toggle**: the bottom-left "Outreach approach" / "Prep ready for
  review" (expand icon) now toggles the card's expanded section, with hover
  states on the icon + text. The hero card and the Nyla-suggested card default
  open; clicking collapses. Draft shows for task cards; the autonomous-action
  acknowledgements are the expandable section for suggested cards.
- **Divider** added between the footer (CTA) row and the expanded section.
- **Rotating glow border restored + made more visible** — the `.nyla-suggest-glow`
  conic-gradient (purple↔blue, ~4x slow, soft blurred halo) on suggested cards.
- **Full page built around the cards**:
  - `BriefingV6Background` — soft gradient blobs (purple/blue) drifting slowly in
    the bottom ~50% (Figma 1102-101355). Reduced-motion → static.
  - Top nav: "Briefing" + centered date (TODAY · MONDAY, DEC 12) with chevrons.
  - Floating bottom pill: Day / Week / Month / Quarter horizon switcher + a Nyla
    sparkle launcher (opens the collab space).
  - Time-of-day toggle + Replay kept as small demo controls (top-right).
- Open items: the bottom-pill horizons (Week/Month/Quarter) are placeholders;
  the left-rail nav glyphs are approximate; date chevrons are non-functional.

## Update 3 — task-card refinements
Closely referenced Figma 943-27088, 979-15140, and 943-25993 (expanded):
- **Links + CTAs use Blue-500** throughout (name, Mark as done, Dismiss, Add to
  queue, View request / Review drafts, and all primary buttons). The suggested
  card's actions + "Review and submit" are now blue (not purple).
- **Snooze / "Add to queue now"** render the Figma trigger styling — a dotted
  underline under the selectable word ("Snooze" / "now") + caret, darkening on
  open, with the dropdown menu. **Snooze now actually defers** (removes) the task.
- **Expand**: the bottom-left "Outreach approach" (expand icon) toggles the
  expanded card (943-25993) — a "For a call ▾" draft-type selector, the context
  line, the draft bubble, and the "Draft generated" meta.
- **Button component** is used for the primary CTAs (compact size override).
- Client-name link is now plain Blue-500 + person icon (no border box), matching
  the default/expanded frames; the bordered chip was only the preview state.
- Added a `sparkle` icon (Nyla signature) to the library for the suggested
  "Prep ready for review" footer.

## Update 2 — icons, client preview, glow
- **Icon library** (`src/ui/icons/`) — extracted verbatim from Figma 943-29146 +
  the shared icon set, normalized to `currentColor`. In Storybook under
  *Design System / Icons 🆕* (gallery / sizes / color). Used across the card now
  (person, $, phone, email, doc, book, expand, caret, check) — use these going forward.
- **Client preview** rebuilt to match Figma 943-29146 exactly (the "Sandy ·
  Client since 2021 · Last touch" line, blurb + Score box, tag pills, file chips
  with the doc icon, and the email / phone / Full-profile CTA row). It now
  **portals to `<body>`** and positions `fixed`, so the card's `overflow-hidden`
  no longer clips it — it renders on top, un-clipped.
- **Nyla glow** is now a rotating purple→blue conic-gradient border
  (`.nyla-suggest-glow` in globals.css, `@property --nyla-angle`; technique from
  codepen.io/Quakeee/pen/EaxRKjp), **~4x slower** (12s) with a wider blurred halo
  for a soft effect, on top of the static base purple glow. Colors are token-based
  (`--nyl-blue-500` / `--nyl-purple-300/400/500/700`). Reduced-motion → static ring.

## What shipped in this slice
A new, **non-destructive** `BriefingV6Scene` (the active V5.5 briefing is untouched).
It mounts as a full-screen overlay opened from the prototype menu → **“Briefing v6 🆕”**
(press **M** for the menu). Implemented end-to-end and verified in the browser:

- **Step 1** default two-column layout (editorial left / task-card stack right);
  scroll re-types the left headline (Coach voice, subtle blur-to-sharp).
- **Step 2** mark a task as done.
- **Step 3** Nyla suggests a follow-up — subtle purple glow, a border that traces
  the card perimeter while “thinking”, elegant card entrance, **NEW** pill,
  Dismiss / Add-to-queue, and the two autonomous-action acknowledgements
  (“Payment service request is pre-filled and queued”, “Draft … is ready”).
- **Step 4** ~2s hold, then the border/glow fade and it settles into the regular
  focus card.
- **Step 5** the agent completes the task and **3 follow-ups** queue (Emma Clarke,
  Patricia Lau, Marcus Webb).
- “While you were away” / “Your day” are data-driven; “Your day” gains the
  9:30 Sandra follow-up when the suggestion is queued; progress + clock update.
- Client-name hover preview popover (“Sandy”, score 95, file chips).
- Time-of-day toggle in the top bar (boundaries in `briefingV6Content.TIME_BOUNDARIES`).
- `prefers-reduced-motion` fallbacks for glow, thinking-border, and headline typing.

Files: `src/scenes/BriefingV6Scene.tsx`, `src/ui/BriefingTaskCard.tsx`,
`src/ui/BriefingHeadline.tsx`, `src/data/briefingV6Content.ts`, motion set in
`src/motion.ts` (`NYLA`, `REDUCED`, `prefersReducedMotion`), tokens in
`src/styles/tokens.css`, Storybook stories for the card (all states + a looping
motion demo) and the headline.

## 1 — Content suggestions (current → proposed, all editable in `briefingV6Content.ts`)
- **Sandra card** copy is verbatim from Figma and kept as-is.
- **Headlines** are Coach-voice and time-of-day aware. The morning top headline
  matches Figma (“Today you’ve got $2K in FYC…”). The midday/afternoon/evening
  sequences are **proposed** — please review tone. *Suggestion:* if you want the
  headline to name the next concrete action (more Coach-direct), say so and I’ll
  swap e.g. midday[0] → “Lapse risk cleared — Emma’s 10:00 review is next; brief’s loaded.”
- **Generated follow-ups** (Emma / Patricia / Marcus) are seeded from the tone
  spec + existing `briefingContent.ts`. Confirm the client names/numbers, or
  point me at real NYL360 fixtures and I’ll swap them in.
- **Phone numbers** for Laura/Patricia/Marcus are placeholders.

## 2 — Unaccounted states (not in the Figma flow; recommendations)
- **Empty / no-tasks-left** — after everything’s done. *Rec:* a calm Coach end-state
  (“You’re clear for the morning — next brief builds at …”).
- **Agent action failed** — the suggested service-request can’t be pre-filled.
  *Rec:* keep the card, swap acknowledgement check → amber “couldn’t complete —
  retry / do it manually”. Currently always succeeds.
- **Loading / skeleton** for the initial briefing build (the repo has
  `CreatingBriefing.tsx` — wire it as the entry transition).
- **Dismiss confirmation / undo** — Dismiss currently removes the suggestion with
  no undo; Mark-done has Undo. *Rec:* give Dismiss a brief undo too.
- **Long-content overflow** in the client preview and very long headlines
  (`text-wrap: balance` is applied; not stress-tested).
- **Many-cards scroll** — works; the left column is sticky. Confirm that’s the
  intended scroll model (vs whole-page scroll).
- **Accessibility / focus order** — buttons are real `<button>`s and the headline
  exposes an `aria-label`; a full keyboard-traversal + focus-trap pass on the
  overlay is still owed.
- **Snooze / Add-to-queue** menus are visual only (options don’t change behavior yet).

## 3 — Motion values (the new `NYLA` set in `src/motion.ts`) — flagged for tuning
Figma `get_motion_context` returned **no keyframe data** for the suggest nodes.
Rather than invent numbers, the `NYLA` set now **pulls from the documented
motion system** (the `EASE.*` / `DURATION.*` scale, shown in Storybook →
*Design System / Motion*, where a new “Nyla Suggest set · briefing-v6” section
demos each one):
- `cardEnter` → `DURATION[‘scene-in’]` (520ms), `settle` — the documented
  scene-enter pattern (y+16 / scale .98 / blur 8px).
- `glow.rampIn` / `rampOut` → `DURATION.deliberate` (600ms); peak shadow =
  1px purple ring + soft 40px purple glow.
- `settle.borderFade` → `DURATION.deliberate` (600ms).
- `taskComplete` → `DURATION.standard` (420ms) — the documented “card entry” step.

Two values are intentionally **outside** the one-shot scale (which only covers
transitions, not loops/dwells), so they remain explicit and are the most likely
to want tuning:
- `thinkingBorder.loopDuration` 2.2s, linear, repeating (ambient perimeter trace).
- `settle.holdMs` 2000ms (per the brief’s “~2 seconds” dwell).
Glow intensity + border thickness are also worth a look on a real display.

## 4 — Assumptions to confirm
- **Personas:** Sarah = advisor (the draft is signed “It’s Sarah”), Nyla = AI
  assistant. The brief’s “for the agent, Sarah, to review” reads as *Nyla drafted
  it; Sarah reviews*. Confirm.
- **cc folder / claude.ai project:** I could not open the linked claude.ai project
  (HTTP 403 — no tool can authenticate to it) and found no folder literally named
  “NYL360 cc folder”. Content was generated from the tone-of-voice doc, the Figma
  copy, and the existing `briefingContent.ts`. Point me at the real source to
  re-ground the copy if needed.
- **Scene placement:** built as a menu-launched overlay (matches DiscoveryFlow /
  Quarterly Reflection), not yet a first-class left-rail scene. Easy to promote.
- **Incidental fix:** the branch did not run — `CouncilCreditsChart.tsx` imports
  `d3` which was not installed. I added `d3` + `@types/d3` to `package.json` to
  unblock the dev server. Flagging because it touches dependencies.
- **Pre-existing TS gap:** `CouncilCreditsChart.tsx` has implicit-any params that
  fail `tsc -b` (unrelated to this work; `npm run build` will trip on it until
  someone types those params).

## Not yet done (next slices)
- Per-meeting brief / pre-meeting view wiring from “Your day”.
- Real Snooze/queue behavior; dismiss-undo.
- Playwright tests per `tests/AGENT_TEMPLATE.md` (repo convention).
- Promote to a left-rail scene if desired.
- Team announcement (see below) — confirm channel.

## Update — layout, date carousel, succession + agent preview
- **Grid split:** left/right are now **5 / 7** columns (was 4/8 → 6/6 → 5/7).
- **Headline ↔ card alignment:** scroll-focus now probes just below the top edge
  (container top + 56px, with a straddle test) so the headline reflects the card
  *snapped at the top*, not the one below it. NOTE: smooth-scroll + programmatic
  scroll don't fire events in the headless preview, so this was verified by logic
  + top-card detection, not E2E — confirm with a real wheel/drag scroll.
- **Date carousel (future days):** the top chevrons step the date. Forward days
  (`dayOffset > 0`) render the same layout with a forward-looking set
  (`FUTURE_TASKS`: Harrington / Khoury / Brooks) and a headline that acknowledges
  the weekday ("Looking ahead to Tuesday…"). The task set swaps **synchronously**
  with the date (via `dayOffsetRef`, not an effect) to avoid a stale frame that
  was orphaning Framer exit nodes. Past days (`< 0`) show a placeholder pending a
  real layout (waiting on design).
- **Gloria Mendoza preview:** added an analyst **insight box** (why Sarah fits +
  what new value she brings while honoring David's relationship).
- **David Okafor preview:** new `kind: 'agent'` client-preview variant — a
  fellow-advisor card with **his handoff notes for Sarah**. "David Okafor" in the
  succession headline is now a hoverable name.
- **Deferred (next):** JS-driven smooth scroll for the card stack (approved, to
  replace native smooth scroll + add the snap "stretch"); past-day layout.

## Update — preview kinds, purple rule, date-carousel alignment, headline polish
- **Purple is reserved for Nyla AI** (suggestions/insights). David Okafor's handoff-notes box is now neutral gray. Gloria's "Why you" box stays purple (it's a Nyla insight).
- **Name-link glyphs by category** (Figma 1250-35072/104/125/088): Clients/Prospects → person, NYL agents → domain, License → workspace_premium (new `LicenseIcon`), Events → location. New `kind: 'practice'` preview added (Series 65 credential card).
- **Date carousel** now shares the page's 12-col grid: "Briefing" spans the left 5 cols; the date toggle spans the right 7 cols (same column as the task-card stack), chevrons pinned to the stack's left/right edges, date centered between. Verified left/right deltas = 0.
- **Headline update animation**: now sequences via AnimatePresence mode="wait" — old line blurs OUT (~0.42s), then new line blurs IN (~2.1s). First page-load reveal is still the per-word type-in.
