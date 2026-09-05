# Year in Review — Nyla AI-nod voice variants

Reference for the AI-nod pill copy across the Year in Review slides
(`src/scenes/YearInReview.tsx`, the `aiNod` field on each card in `CARDS`).

Four slides carry an AI-nod pill: Commission, Cases, Network, Client-voice.
(Intro, Nyla-tasks, and Outro have no pill.)

The pill is a single shared component and is `whitespace-nowrap` (one line, so the
pill height stays constant across slides — 74px, dominated by the 48px Nyla orb + padding).

## Voice directions

- **Original** — first-person Nyla, factual ("I flagged…", "I prioritized…").
- **Coach** — collaborative "we did it together"; credits the advisor's own win
  (use _you_ for what they did, _we/together_ only for genuinely shared work).
- **Strategist** — verb-first, no "I"; Nyla framing how she _enabled/supported_
  the advisor as chief of staff (surfaced, triaged, mapped, drafted…).
- **Merged (with "we")** — Strategist verb-first opener + Coach's shared-work
  reference, ending on the advisor's win.
- **Merged — no "we" — ✅ IMPLEMENTED** — two verb-first Nyla actions, then the
  advisor's win. Collaboration is implied, not stated. Pattern:
  `[Verb] [Nyla's setup] and [Nyla's second action] — you [win].`

## The table

### Commission — `$54,000`

| Version                 | Copy                                                                                                       |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| Original                | I flagged 3 coverage-gap clients that weren't in your pipeline. Two closed.                                |
| Coach                   | We spotted 3 coverage-gap clients off your radar — and you closed two.                                     |
| Strategist              | Surfaced 3 coverage-gap clients beyond your pipeline so you could move first — two became closed business. |
| Merged (with "we")      | Surfaced 3 coverage-gap clients off your radar and we lined them up — you closed two.                      |
| **Merged — no "we" ✅** | **Surfaced 3 coverage-gap clients off your radar and lined them up — you closed two.**                     |

### Cases — `534 families`

| Version                 | Copy                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| Original                | I prioritized 89 at-risk cases before their review window closed.                                              |
| Coach                   | We stayed ahead of 89 at-risk cases together — you cleared each one before its review window closed.           |
| Strategist              | Triaged and sequenced 89 at-risk cases by deadline so none slipped past review.                                |
| Merged (with "we")      | Triaged 89 at-risk cases and we stayed ahead of them — you cleared every one before its review window closed.  |
| **Merged — no "we" ✅** | **Triaged 89 at-risk cases and stayed ahead of them — you cleared every one before its review window closed.** |

### Network — `40 people added`

| Version                 | Copy                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| Original                | After you closed the Hendersons in May, I found 6 similar households in their zip code—4 became meetings.      |
| Coach                   | After you closed the Hendersons in May, we cased 6 similar households nearby — and you turned 4 into meetings. |
| Strategist              | Mapped 6 comparable households in the Hendersons' zip and teed up the outreach — 4 converted to meetings.      |
| Merged (with "we")      | Mapped 6 households near your Henderson win and we cased them together — you turned 4 into meetings.           |
| **Merged — no "we" ✅** | **Mapped 6 households near your Henderson win and cased them — you turned 4 into meetings.**                   |

### Client-voice — quote slide

| Version                 | Copy                                                                                                |
| ----------------------- | --------------------------------------------------------------------------------------------------- |
| Original                | I drafted the annual review summary—you showed up prepared.                                         |
| Coach                   | We prepped that annual review together — you walked in and earned every word.                       |
| Strategist              | Drafted the annual review summary and briefed you in advance so you could lead the room.            |
| Merged (with "we")      | Drafted the annual review summary and we prepped together — you walked in and earned every word.    |
| **Merged — no "we" ✅** | **Drafted the annual review summary and prepped you for it — you walked in and earned every word.** |

## Notes on voice (from the Nyla tone-of-voice by role reference)

- **Coach** — grounded in the advisor's goals, elevates wins without fluff, direct
  about gaps, forward-focused. "The agent" = the financial advisor; ending a line
  on their achievement celebrates their win.
- **Strategist** — measured, connects the advisor's book data to opportunity,
  uses their trajectory as the lens; Nyla has no agenda of her own — the advisor does.
