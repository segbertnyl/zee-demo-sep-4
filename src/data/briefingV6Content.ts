/* ============================================================================
 * briefing-v6 content layer  —  EDIT COPY HERE, NOT IN COMPONENTS.
 *
 * Every string the briefing-v6 surface renders lives in this file. It is the
 * Role-3 (Content & Copy) editing surface. Component logic in
 * src/scenes/BriefingV6Scene.tsx and src/ui/BriefingTaskCard.tsx reads from
 * here — they contain no hard-coded copy.
 *
 * VOICE KEY (see docs/tone-of-voice/nyla-tone-of-voice.md):
 *   Card HEADLINE        → Coach + Strategist  (trajectory / why it matters)
 *   Card DESCRIPTION     → Concierge + Analyst (precise, names client/metric)
 *   Main page headline   → Coach                (advisor's own goals, forward)
 *   "While you were away"→ Concierge            (closed loops, what was done)
 *   Nyla acknowledgements→ Concierge            ("it did it, or it didn't")
 *
 * Personas (locked, per BRIEF.md):
 *   Advisor = Sarah  ·  AI assistant = Nyla  ·  featured client = Sandra Kim
 *   The AI assistant is always "Nyla" in UI copy — never a generic title.
 * ========================================================================== */

/* ── Time of day ──────────────────────────────────────────────────────────
 * Headlines and the "Your day" framing shift across the day. Boundaries are
 * the hour (0–23) at which each phase STARTS. Edit freely. */
export type TimeOfDay = 'morning' | 'midday' | 'afternoon' | 'evening'

export const TIME_BOUNDARIES: { phase: TimeOfDay; startHour: number }[] = [
  { phase: 'morning', startHour: 0 },
  { phase: 'midday', startHour: 12 },
  { phase: 'afternoon', startHour: 14 },
  { phase: 'evening', startHour: 18 },
]

export function timeOfDay(date: Date = new Date()): TimeOfDay {
  const h = date.getHours()
  let phase: TimeOfDay = 'morning'
  for (const b of TIME_BOUNDARIES) if (h >= b.startHour) phase = b.phase
  return phase
}

/* ── Main page headline — COACH voice ──────────────────────────────────────
 * The headline is STATE-DRIVEN, not time-of-day-driven (Figma 1102-101355 /
 * -101651 / -103002 / -104792). The scene picks one based on the scroll-focus
 * card + completion state:
 *   · opening      — top of page, Sandra in focus, nothing done yet
 *   · <task>.focusHeadline — that card is scrolled into focus, not yet handled
 *   · <task>.doneHeadline  — shown after that task is handled (points to next)
 *   · newTask      — the moment Nyla adds the Sandra follow-up (progress → x/7)
 * Each task carries two headline states (focus + done) so the rest of the
 * stack reads the same way. Animated with a slow blur-to-sharp reveal. */
export const HEADLINES = {
  opening: 'Today, you have a new lead named Eric waiting for your call',
  newTask: 'Great job connecting with Sandra. Let’s track those new asks she raised.',
  /* Brief transitional line the moment the Sandra follow-up is completed —
   * acknowledges it, then hands off to Clementine's review. */
  sandraHandled:
    'Sandra’s handled. Next, Clementine’s review turns on one fix — the beneficiary gap, caught before she notices.',
}

/* Sub-line template under the headline. {time} and {done}/{total} are filled
 * by the scene from live completion state. */
export const PROGRESS_TEMPLATE = 'As of {time} · {done}/{total} completed'

/* ── "While you were away" — CONCIERGE voice ───────────────────────────────
 * Closed loops: what Nyla did overnight. Confirmatory, neutral, no preamble.
 * savedLabel is the time-saved badge shown beside the heading. */
export const WHILE_AWAY = {
  heading: 'While you were away',
  savedLabel: '1h 28m saved',
  /* Each item reads like the Snooze trigger (dotted underline, no caret). On
   * hover, `detail` surfaces the specifics in a tooltip. */
  items: [
    {
      id: 'pulled',
      label: 'Pulled 47 days of activity from your book',
      detail: 'Synced calls, emails, policy changes, and payments from Mar 26 – May 12 across 633 clients.',
      cta: 'Review activity',
    },
    {
      id: 'surfaced',
      label: 'Surfaced 3 stalled cases and 2 renewal windows',
      detail: 'Stalled: Anderson (UW, 11d), Rivera (NIGO), Okafor (unsigned). Renewals: Lau (UL, 2d), Holloway (WL).',
      cta: 'Open cases',
    },
    {
      id: 'prepared',
      label: 'Prepared 2 annual review packets',
      detail: 'Emma Clarke — EmmaClarke_AnnualReview.pdf · Patrick Soto — PatrickSoto_AnnualReview.pdf',
      cta: 'Preview packets',
    },
  ],
}

/* Day 2/3/4 copies — same as WHILE_AWAY for now, content to be individualized per day. */
export const WHILE_AWAY_2 = {
  heading: 'While you were away',
  savedLabel: '2h 34m saved',
  items: [
    {
      id: 'pulled',
      label: 'Followed up on 4 life cases with underwriting',
      detail: 'Synced calls, emails, policy changes, and payments from Mar 26 – May 12 across 633 clients.',
      cta: 'Review activity',
    },
    {
      id: 'surfaced',
      label: 'Surfaced 1 stalled cases and 1 renewal windows',
      detail: 'Stalled: Anderson (UW, 11d), Rivera (NIGO), Okafor (unsigned). Renewals: Lau (UL, 2d), Holloway (WL).',
      cta: 'Open cases',
    },
    {
      id: 'prepared',
      label: 'Prepared 6 scheduled annual review packets',
      detail: 'Emma Clarke — EmmaClarke_AnnualReview.pdf · Patrick Soto — PatrickSoto_AnnualReview.pdf',
      cta: 'Preview packets',
    },
  ],
}

export const WHILE_AWAY_3 = {
  heading: 'While you were away',
  savedLabel: '2h 03m saved',
  items: [
    {
      id: 'pulled',
      label: 'Ran suitability check for all Eric Ellis product options',
      detail: 'Synced calls, emails, policy changes, and payments from Mar 26 – May 12 across 633 clients.',
      cta: 'Review activity',
    },
    {
      id: 'surfaced',
      label: 'Surfaced 3 stalled cases and 2 renewal windows',
      detail: 'Stalled: Anderson (UW, 11d), Rivera (NIGO), Okafor (unsigned). Renewals: Lau (UL, 2d), Holloway (WL).',
      cta: 'Open cases',
    },
    {
      id: 'prepared',
      label: 'Prepared 2 annual review packets',
      detail: 'Emma Clarke — EmmaClarke_AnnualReview.pdf · Patrick Soto — PatrickSoto_AnnualReview.pdf',
      cta: 'Preview packets',
    },
  ],
}

export const WHILE_AWAY_4 = {
  heading: 'While you were away',
  savedLabel: '3h 56m saved',
  items: [
    {
      id: 'pulled',
      label: 'Pulled 12 days of activity from your book',
      detail: 'Synced calls, emails, policy changes, and payments from Mar 26 – May 12 across 633 clients.',
      cta: 'Review activity',
    },
    {
      id: 'surfaced',
      label: 'Surfaced 3 stalled cases and 2 renewal windows',
      detail: 'Stalled: Anderson (UW, 11d), Rivera (NIGO), Okafor (unsigned). Renewals: Lau (UL, 2d), Holloway (WL).',
      cta: 'Open cases',
    },
    {
      id: 'prepared',
      label: 'Prepared 2 annual review packets',
      detail: 'Emma Clarke — EmmaClarke_AnnualReview.pdf · Patrick Soto — PatrickSoto_AnnualReview.pdf',
      cta: 'Preview packets',
    },
  ],
}

/* ── "Your day" schedule ───────────────────────────────────────────────────
 * status drives the timeline dot color. The `injected` flag marks the Sandra
 * WL follow-up that appears ONLY after Nyla's suggested task is added to the
 * queue — the scene reveals it then (see step 3/5). */
export type ScheduleDot = 'done' | 'ready' | 'review' | 'now'
export interface DayItem {
  id: string
  time: string
  label: string
  tag?: string
  /** Inline link (e.g. "Ready for review") shown after the label. */
  cta?: string
  dot: ScheduleDot
  injected?: boolean
}

export const YOUR_DAY = {
  heading: 'Your day',
  viewAll: 'View schedule',
  /* Appears after the Nyla suggestion is queued. */
  injectedItem: {
    id: 'sandra-followup',
    time: '9:30 AM',
    label: 'Sandra K. WL Follow-Up',
    tag: 'New',
    dot: 'now' as ScheduleDot,
    injected: true,
  } satisfies DayItem,
  items: [
    { id: 'eric', time: '10:00 AM', label: 'Call Eric Ellis', dot: 'ready' },
    { id: 'patrick', time: '11:30 AM', label: 'Patrick Soto Annual Review', dot: 'ready' },
    {
      id: 'clementine',
      time: '1:45 PM',
      label: 'Clementine Park Annual Review',
      cta: 'Ready for review',
      dot: 'review',
    },
  ] satisfies DayItem[],
}

/* Day 2/3/4 copies — same as YOUR_DAY for now, content to be individualized per day. */
export const YOUR_DAY_2 = {
  heading: 'Your day',
  viewAll: 'View schedule',
  injectedItem: {
    id: 'sandra-followup',
    time: '9:30 AM',
    label: 'Sandra K. WL Follow-Up',
    tag: 'New',
    dot: 'now' as ScheduleDot,
    injected: true,
  } satisfies DayItem,
  items: [
    { id: 'eric', time: '09:00 AM', label: 'Run Eric Ellis Analysis', dot: 'ready' },
    { id: 'patrick', time: '11:30 AM', label: 'Patrick Soto Annual Review', dot: 'ready' },
    {
      id: 'clementine',
      time: '1:45 PM',
      label: 'Clementine Park Annual Review',
      cta: 'Ready for review',
      dot: 'review',
    },
  ] satisfies DayItem[],
}

export const YOUR_DAY_3 = {
  heading: 'Your day',
  viewAll: 'View schedule',
  injectedItem: {
    id: 'sandra-followup',
    time: '9:30 AM',
    label: 'Sandra K. WL Follow-Up',
    tag: 'New',
    dot: 'now' as ScheduleDot,
    injected: true,
  } satisfies DayItem,
  items: [
    { id: 'eric', time: '10:00 AM', label: 'Eric Ellis presentation', dot: 'ready' },
    { id: 'patrick', time: '11:30 AM', label: 'Patrick Soto Annual Review', dot: 'ready' },
    {
      id: 'clementine',
      time: '1:45 PM',
      label: 'Clementine Park Annual Review',
      cta: 'Ready for review',
      dot: 'review',
    },
  ] satisfies DayItem[],
}

export const YOUR_DAY_4 = {
  heading: 'Your day',
  viewAll: 'View schedule',
  injectedItem: {
    id: 'sandra-followup',
    time: '9:30 AM',
    label: 'Sandra K. WL Follow-Up',
    tag: 'New',
    dot: 'now' as ScheduleDot,
    injected: true,
  } satisfies DayItem,
  items: [
    { id: 'eric', time: '10:00 AM', label: 'Charles started his assessment', dot: 'ready' },
    { id: 'patrick', time: '11:30 AM', label: 'Patrick Soto Annual Review', dot: 'ready' },
    {
      id: 'clementine',
      time: '1:45 PM',
      label: 'Clementine Park Annual Review',
      cta: 'Ready for review',
      dot: 'review',
    },
  ] satisfies DayItem[],
}

/* ── Client preview popover ─────────────────────────────────────────────────
 * The hover card on a client name inside a task card (Figma 943-37078).
 * ANALYST voice in the blurb — names the signal, non-alarmist. */
export interface ClientPreview {
  /** 'client' (default) renders the Figma client card; 'event' renders venue +
   *  NYL connection; 'agent' renders a fellow-advisor card + their handoff notes;
   *  'practice' renders a credential card (e.g. a Series 65 license). */
  kind?: 'client' | 'event' | 'agent' | 'practice'
  nickname: string
  clientSince: string
  lastTouch: string
  /** Client grade A–D (replaces the old numeric score). Not used for events. */
  grade?: string
  blurb: string
  /** Optional analyst insight box (client kind) — why this advisor, what new
   *  value, framed against the prior relationship. Renders in a purple box. */
  insight?: string
  tags: string[]
  files: string[]
  /* Footer CTAs in the popover (Figma 943-29146). */
  email?: string
  phone?: string
  /* Event variant (kind === 'event') — a non-duplicative heading, the area
   * relevance (blurb), a list of upcoming events, and the NYL connection. */
  eventTitle?: string
  events?: { name: string; when: string; venue: string; featured?: boolean }[]
  eventConnection?: string
  /* Agent variant (kind === 'agent') — the colleague's handoff notes for Sarah. */
  notes?: string[]
}

export const SANDRA_PREVIEW: ClientPreview = {
  nickname: '"Eric"',
  clientSince: 'Referred Sept 2026',
  lastTouch: 'New lead · 1 day ago',
  grade: 'A',
  blurb: 'Eric is 42 and married living in New Jersey. He may be interested in early retirement',
  tags: ['Pre-retirement', 'Multi-policy', 'Estate planning'],
  files: ['Bank Accounts', 'Website Articles', 'Chat Themes'],
  email: 'eellis@gmail.com',
  phone: '(917) 625-4843',
}

export const ERIC_PREVIEW: ClientPreview = {
  nickname: '"Eric"',
  clientSince: 'Referred Sept 2026',
  lastTouch: 'New lead · 1 day ago',
  grade: 'A',
  blurb: 'Eric is 42 and married living in New Jersey. He may be interested in early retirement',
  tags: ['Pre-retirement', 'Multi-policy', 'Estate planning'],
  files: ['Bank Accounts', 'Website Articles', 'Chat Themes'],
  email: 'eellis@gmail.com',
  phone: '(917) 625-4843',
}

export const LAURA_PREVIEW: ClientPreview = {
  nickname: '"May"',
  clientSince: 'Client since 2019',
  lastTouch: 'Last touch 11/2/2025',
  grade: 'A',
  blurb:
    'Laura, 41, just closed on a second home in Westchester. Married to Daniel (uninsured). Two kids. Growing household income — open to right-sizing coverage.',
  tags: ['New home', 'Household growing', 'Cross-sell'],
  files: ['Mendez-Policy-2024.pdf', 'Home-Closing-Docs.pdf', 'Aug-Review-Notes.doc'],
  email: 'laura.mendez@icloud.com',
  phone: '(917) 414-2208',
}

export const THOMAS_PREVIEW: ClientPreview = {
  nickname: '“Tom”',
  clientSince: 'Client since 2016',
  lastTouch: 'Last touch 8/19/2025',
  grade: 'B',
  blurb:
    'Thomas, 48, holds a 20-year term ($750K) entering its conversion window. Stable income, no permanent coverage yet — a clean candidate to convert before underwriting resets.',
  tags: ['Term conversion', 'Pre-underwriting', 'Retention'],
  files: ['Reyes-Term-Policy.pdf', 'Conversion-Window.pdf', 'Mar-Review-Notes.doc'],
  email: 'treyes@gmail.com',
  phone: '(917) 882-4471',
}

/* Two new leads (New conversions card) — a referral COI + a website inquiry. */
export const JENNIFER_PREVIEW: ClientPreview = {
  nickname: '"Jenn"',
  clientSince: 'Referred Jun 2026',
  lastTouch: 'New lead · 1 day ago',
  grade: 'A',
  blurb:
    'Jennifer came in through Marcus Webb’s referral — a 44-year-old practice owner weighing key-person and personal coverage. High intent, no policy yet.',
  tags: ['Referral', 'Business owner', 'High intent'],
  files: [],
  email: 'jen.nopez@gmail.com',
  phone: '(917) 220-7781',
}

export const ANDERSON_PREVIEW: ClientPreview = {
  nickname: '"Coop"',
  clientSince: 'New lead',
  lastTouch: 'Inquiry 2 days ago',
  grade: 'B',
  blurb:
    'Anderson, 37, requested a term quote through your website after a new baby. Time-sensitive — he’s comparison-shopping with two other carriers.',
  tags: ['New parent', 'Term', 'Comparison shopping'],
  files: [],
  email: 'a.coop@gmail.com',
  phone: '(917) 661-0049',
}

/* Retiring colleague handing Gloria to Sarah — fellow-advisor card + his notes. */
export const DAVID_OKAFOR_PREVIEW: ClientPreview = {
  kind: 'agent',
  nickname: 'David Okafor',
  clientSince: 'Fellow advisor · 22 years',
  lastTouch: 'Retiring Dec 31',
  blurb:
    'David is winding down a 22-year practice and personally choosing who inherits each relationship. He picked you for his retirement-stage clients.',
  notes: [
    'Gloria prefers a phone call to email — she never rushes, and always asks about family. Match that pace.',
    'Her annuity rollover is ~80% done; the paperwork’s in the shared folder. Continue it, don’t restart.',
    'She’s wary of change. Lead with continuity and mention me by name — she’ll extend you the same trust.',
  ],
  tags: ['Retiring advisor', 'Warm handoff'],
  files: ['Okafor-Handoff-Notes.pdf'],
  email: 'd.okafor@nyl.com',
}

/* Inherited client on the succession card — transferred from a retiring colleague. */
export const MENDOZA_PREVIEW: ClientPreview = {
  nickname: 'Gloria Mendoza',
  clientSince: 'Client since 2009 · new to you',
  lastTouch: 'Last touch 4/18/2025 (David O.)',
  grade: 'A',
  blurb:
    'Gloria, 63, is David Okafor’s longest-standing client — three policies and a pending annuity rollover. Approaching retirement and used to a high-touch relationship.',
  insight:
    'Why you: David spent 16 years earning Gloria’s trust — your job is to honor that, not reset it. Lead by referencing his work and her history. What’s new: you bring annuity-rollover depth and evening availability David couldn’t offer, so she gains continuity plus sharper retirement-income options right when she needs them.',
  tags: ['Succession', 'Pre-retirement', 'Multi-policy'],
  files: ['Mendoza-Policies-2025.pdf', 'Okafor-Handoff-Notes.pdf', 'Annuity-Rollover-Draft.pdf'],
  email: 'g.mendoza@gmail.com',
  phone: '(917) 503-6612',
}

/* Event preview — venue + NYL connection, tied to Sarah's location & book. */
export const SUNSHINE_PREVIEW: ClientPreview = {
  kind: 'event',
  nickname: 'Sunshine Country Club',
  clientSince: '',
  lastTouch: '',
  eventTitle: 'Events in your area',
  blurb:
    'The Scarsdale corridor, 12 minutes from your office — 38 of your clients live within 5 miles, with high overlap to your pre-retirement book.',
  tags: ['Prospecting', 'Local', 'Pre-retirement'],
  files: [],
  events: [
    {
      name: 'Sunshine Country Club — member mixer',
      when: 'Sat, Dec 17',
      venue: '14 Heathcote Rd, Scarsdale',
      featured: true,
    },
    { name: 'Westchester Estate Planning Forum', when: 'Thu, Jan 9', venue: 'Crowne Plaza, White Plains' },
    { name: 'Scarsdale Chamber business lunch', when: 'Wed, Jan 22', venue: 'Heathcote Tavern' },
  ],
  eventConnection: 'NYL is a regional sponsor at Sunshine. 14 members match your ideal client profile.',
}

/* ── Task cards ─────────────────────────────────────────────────────────────
 * One model covers every state via props on BriefingTaskCard. `kind` selects
 * the action affordances:
 *   'task'      → Mark as done / Snooze   (advisor-owned work)
 *   'suggested' → Dismiss / Add to queue  (Nyla-suggested, purple, "NEW")
 * client.preview attaches the hover popover to the highlighted name. */
export type CardKind = 'task' | 'suggested'

/** Glyph rendered beside a highlighted name in a task headline. */
export type NameGlyph = 'person' | 'calendar' | 'location' | 'network' | 'domain' | 'license'

/* Draft channels. The expanded card's selector switches between them. */
export type DraftKind = 'call' | 'text' | 'email'
export const DRAFT_LABELS: Record<DraftKind, string> = {
  call: 'For a call',
  text: 'For a text',
  email: 'For an email',
}
export interface DraftContent {
  context: string // CONCIERGE framing line under the selector
  body: string // the draft itself — BRAND ADVOCATE (Sarah's voice)
  meta: string // "Draft generated · Last updated 9:56 AM"
}

export interface TaskCardModel {
  id: string
  kind: CardKind
  badge: {
    label: string
    tone: 'lapse' | 'opportunity' | 'monitor' | 'prep' | 'event' | 'ready' | 'growth'
    meta?: string
  }
  /** Headline with the client name highlighted as a link. Split so the name
   *  can render as a blue link with a person glyph + hover preview. */
  headlinePrefix: string
  clientName?: string
  clientPreview?: ClientPreview
  /** Glyph beside the highlighted name. */
  clientIcon?: NameGlyph
  /** Optional second highlighted name (e.g. two new leads on one card). Rendered
   *  after `headlineMid` and before `headlineSuffix`. */
  headlineMid?: string
  secondName?: { name: string; preview?: ClientPreview; icon?: NameGlyph }
  headlineSuffix: string
  /** Concise one-line summary shown in the completed (DONE) state. Falls back to
   *  the full headline if omitted. */
  doneSummary?: string
  /** DESCRIPTION — Concierge + Analyst. */
  description: string
  tags: string[]
  /** Footer label (left) — e.g. "Outreach approach", "Prep ready for review". */
  footerLabel: string
  /** Primary action button label. */
  primaryCta: string
  /** Optional outreach phone / email shown before the CTA. */
  phone?: string
  email?: string
  /** Page-headline states (Coach voice). focusHeadline shows when this card is
   *  the scroll focus and unhandled; doneHeadline after it's handled. */
  focusHeadline?: string
  doneHeadline?: string
  /** Expanded draft preview. `drafts` holds one per channel; the selector in the
   *  expanded view switches between them. `defaultDraft` is shown first. */
  drafts?: Partial<Record<DraftKind, DraftContent>>
  defaultDraft?: DraftKind
  /** Nyla acknowledgement rows — only on 'suggested' cards. CONCIERGE voice:
   *  closed loops, "it did it." */
  acknowledgements?: { label: string; cta: string }[]
  /** Event expanded view (e.g. Sunshine) — details + a list of similar-advisor
   *  outcomes. Rendered as a list (no draft bubble / dropdown). */
  eventExpand?: {
    details: string
    agents: { name: string; location: string; result: string }[]
  }
  /** Review expanded view (e.g. Harrington) — documents + a recap of recent
   *  meetings that explain what's on the agenda. No draft bubble. */
  review?: {
    documents: string[]
    recap: { date: string; note: string }[]
  }
  /** Licensing / credential path — what it covers + a step-by-step timeline of
   *  what to expect (e.g. the Series 65 card). Rendered as a numbered timeline. */
  pathway?: {
    overview: string
    coverage: string[]
    steps: { label: string; detail: string; when?: string }[]
  }
}

/* HERO task — Sandra Kim lapse risk. Headline = Coach+Strategist (frames the
 * chargeback risk to this month's FYC). Description = Concierge+Analyst. */
export const SANDRA_TASK: TaskCardModel = {
  id: 'sandra-lapse',
  kind: 'task',
  badge: { label: 'LEAD', tone: 'prep' },
  headlinePrefix: 'Call',
  clientName: 'Eric Ellis',
  clientPreview: ERIC_PREVIEW,
  headlineSuffix: 'a lead from NYL.com to introduce yourself.',
  doneSummary: 'Call Sandra Kim to reactivate WL policy',
  description: 'Completing this within 30 minutes gives you a 75% higher chance of closing the deal',
  tags: ['Lead', 'Potential High FYC'],
  footerLabel: 'Outreach approach',
  primaryCta: 'Plan a call',
  phone: '(917) 625-4843',
  focusHeadline: HEADLINES.opening,
  doneHeadline: 'Sandra’s handled. Next up, review Laura’s coverage gaps before you write.',
  defaultDraft: 'call',
  drafts: {
    call: {
      context:
        'Sandy is direct — lead with the policy, skip the warmup, and address the WL lapse (16d left in grace period).',
      body: 'Hi Sandy, it’s Sarah. Your WL policy has a payment past due and I want to make sure we get this resolved before it affects your coverage. Can we connect today?',
      meta: 'Draft generated · Last updated 9:56 AM',
    },
    text: {
      context: 'Short SMS — clear about the deadline, easy to reply to.',
      body: 'Hi Sandy, it’s Sarah from New York Life. Your WL policy payment is past due — 16 days left in the grace period. Can we hop on a quick call today to sort it before it affects your coverage?',
      meta: 'Draft generated · Last updated 9:56 AM',
    },
    email: {
      context: 'A short, warm email — policy first, with the payment link ready.',
      body: 'Subject: A quick fix on your WL policy\n\nHi Sandy,\n\nYour whole life policy has a payment past due, and I’d like to help you clear it before it affects your coverage — there are 16 days left in the grace period. It’s a quick fix; I can send a secure payment link or walk you through it on a short call.\n\nWhat works best for you this week?\n\nBest,\nSarah Ferreira\nNew York Life',
      meta: 'Draft generated · Last updated 9:56 AM',
    },
  },
}

export const SANDRA_TASK2: TaskCardModel = {
  id: 'sandra-lapse',
  kind: 'task',
  badge: { label: 'Follow-up', tone: 'prep' },
  headlinePrefix: 'Run',
  clientName: 'Eric Ellis',
  clientPreview: ERIC_PREVIEW,
  headlineSuffix: 'needs & risk analysis',
  doneSummary: 'Call Sandra Kim to reactivate WL policy',
  description: 'Completing this within the next 3 days gives you a 60^ higher chance of closing the deal.',
  tags: ['Lead', 'Potential High FYC'],
  footerLabel: 'Follow up approach',
  primaryCta: 'View analysis',
  phone: '(917) 625-4843',
  focusHeadline: HEADLINES.opening,
  doneHeadline: 'Sandra’s handled. Next up, review Laura’s coverage gaps before you write.',
  defaultDraft: 'call',
  drafts: {
    call: {
      context:
        'Sandy is direct — lead with the policy, skip the warmup, and address the WL lapse (16d left in grace period).',
      body: 'Hi Sandy, it’s Sarah. Your WL policy has a payment past due and I want to make sure we get this resolved before it affects your coverage. Can we connect today?',
      meta: 'Draft generated · Last updated 9:56 AM',
    },
    text: {
      context: 'Short SMS — clear about the deadline, easy to reply to.',
      body: 'Hi Sandy, it’s Sarah from New York Life. Your WL policy payment is past due — 16 days left in the grace period. Can we hop on a quick call today to sort it before it affects your coverage?',
      meta: 'Draft generated · Last updated 9:56 AM',
    },
    email: {
      context: 'A short, warm email — policy first, with the payment link ready.',
      body: 'Subject: A quick fix on your WL policy\n\nHi Sandy,\n\nYour whole life policy has a payment past due, and I’d like to help you clear it before it affects your coverage — there are 16 days left in the grace period. It’s a quick fix; I can send a secure payment link or walk you through it on a short call.\n\nWhat works best for you this week?\n\nBest,\nSarah Ferreira\nNew York Life',
      meta: 'Draft generated · Last updated 9:56 AM',
    },
  },
}

export const SANDRA_TASK3: TaskCardModel = {
  id: 'sandra-lapse',
  kind: 'task',
  badge: { label: 'PLAN PRESENTATION', tone: 'lapse' },
  headlinePrefix: 'Present',
  clientName: 'Eric Ellis',
  clientPreview: ERIC_PREVIEW,
  headlineSuffix: 'scenarios for his fiancial plan',
  doneSummary: 'Call Sandra Kim to reactivate WL policy',
  description: 'You are one step closer to increasing your client base.',
  tags: ['Lead', 'Potential High FYC'],
  footerLabel: 'Financial scenarios',
  primaryCta: 'Start the meeting',
  phone: '(917) 625-4843',
  focusHeadline: HEADLINES.opening,
  doneHeadline: 'Sandra’s handled. Next up, review Laura’s coverage gaps before you write.',
  defaultDraft: 'call',
  drafts: {
    call: {
      context:
        'Sandy is direct — lead with the policy, skip the warmup, and address the WL lapse (16d left in grace period).',
      body: 'Hi Sandy, it’s Sarah. Your WL policy has a payment past due and I want to make sure we get this resolved before it affects your coverage. Can we connect today?',
      meta: 'Draft generated · Last updated 9:56 AM',
    },
    text: {
      context: 'Short SMS — clear about the deadline, easy to reply to.',
      body: 'Hi Sandy, it’s Sarah from New York Life. Your WL policy payment is past due — 16 days left in the grace period. Can we hop on a quick call today to sort it before it affects your coverage?',
      meta: 'Draft generated · Last updated 9:56 AM',
    },
    email: {
      context: 'A short, warm email — policy first, with the payment link ready.',
      body: 'Subject: A quick fix on your WL policy\n\nHi Sandy,\n\nYour whole life policy has a payment past due, and I’d like to help you clear it before it affects your coverage — there are 16 days left in the grace period. It’s a quick fix; I can send a secure payment link or walk you through it on a short call.\n\nWhat works best for you this week?\n\nBest,\nSarah Ferreira\nNew York Life',
      meta: 'Draft generated · Last updated 9:56 AM',
    },
  },
}

export const SANDRA_TASK4: TaskCardModel = {
  id: 'sandra-lapse',
  kind: 'task',
  badge: { label: 'FOLLOW UP', tone: 'lapse' },
  headlinePrefix: 'Nudge',
  clientName: 'Eric Ellis',
  clientPreview: ERIC_PREVIEW,
  headlineSuffix: 'to complete his applications.',
  doneSummary: 'Call Sandra Kim to reactivate WL policy',
  description: 'Completing this within 30 minutes gives you a 75% higher chance of closing the deal',
  tags: ['Lead', 'Potential High FYC'],
  footerLabel: 'Outreach approach',
  primaryCta: 'Send him a reminder',
  phone: '(917) 625-4843',
  focusHeadline: HEADLINES.opening,
  doneHeadline: 'Sandra’s handled. Next up, review Laura’s coverage gaps before you write.',
  defaultDraft: 'call',
  drafts: {
    call: {
      context:
        'Sandy is direct — lead with the policy, skip the warmup, and address the WL lapse (16d left in grace period).',
      body: 'Hi Sandy, it’s Sarah. Your WL policy has a payment past due and I want to make sure we get this resolved before it affects your coverage. Can we connect today?',
      meta: 'Draft generated · Last updated 9:56 AM',
    },
    text: {
      context: 'Short SMS — clear about the deadline, easy to reply to.',
      body: 'Hi Sandy, it’s Sarah from New York Life. Your WL policy payment is past due — 16 days left in the grace period. Can we hop on a quick call today to sort it before it affects your coverage?',
      meta: 'Draft generated · Last updated 9:56 AM',
    },
    email: {
      context: 'A short, warm email — policy first, with the payment link ready.',
      body: 'Subject: A quick fix on your WL policy\n\nHi Sandy,\n\nYour whole life policy has a payment past due, and I’d like to help you clear it before it affects your coverage — there are 16 days left in the grace period. It’s a quick fix; I can send a secure payment link or walk you through it on a short call.\n\nWhat works best for you this week?\n\nBest,\nSarah Ferreira\nNew York Life',
      meta: 'Draft generated · Last updated 9:56 AM',
    },
  },
}

/* Laura Mendez — qualified appointment prep (Figma 1102-101355). */
export const LAURA_TASK: TaskCardModel = {
  id: 'laura-home',
  kind: 'task',
  badge: { label: 'Qualified appt prep', tone: 'prep' },
  headlinePrefix: 'Contact',
  clientName: 'Laura May Mendez',
  clientPreview: LAURA_PREVIEW,
  headlineSuffix: 'about her new home coverage and to add an uninsured spouse.',
  description: 'Two open coverage gaps on one call. This is a est. $3,400 FYC opportunity.',
  tags: ['Existing client focus', 'Higher FYC', 'Executive Council'],
  footerLabel: 'Outreach approach',
  primaryCta: 'Review coverage gaps',
  email: 'laura.mendez@icloud.com',
  focusHeadline: 'Closing Laura’s two gaps is one call worth ~$3,400 in FYC.',
  doneHeadline: 'Laura’s gaps are covered. The Sunshine event is your next opening.',
  defaultDraft: 'email',
  drafts: {
    email: {
      context: 'A fuller email — lead with the home, cover both gaps, propose a time.',
      body: 'Subject: Quick coverage check on the new home\n\nHi Laura,\n\nCongratulations on the new home in Westchester — a wonderful milestone for the family. A move like this is a good moment to make sure two things are squared away: that the new property is properly protected, and that Daniel is added to your coverage so the household is protected together.\n\nBoth are quick to review. Would you have 15 minutes this week for a short call? I’ll walk you through the options and keep it simple.\n\nWarmly,\nSarah Ferreira\nNew York Life',
      meta: 'Draft generated · Last updated 9:41 AM',
    },
    call: {
      context: 'Warm and brief — congratulate first, then the two gaps.',
      body: 'Hi Laura, it’s Sarah — congratulations on the new home! With the move, I’d love to make sure it’s properly covered and look at adding Daniel to your policy. Do you have 15 minutes this week?',
      meta: 'Draft generated · Last updated 9:41 AM',
    },
    text: {
      context: 'Short, friendly SMS.',
      body: 'Hi Laura! Congrats on the new place 🎉 With the move it’s a good moment to make sure it’s covered and add Daniel to your policy. Got 15 min this week for a quick call?',
      meta: 'Draft generated · Last updated 9:41 AM',
    },
  },
}

/* Event nearby — Sunshine Country Club (prospecting). */
export const SUNSHINE_TASK: TaskCardModel = {
  id: 'sunshine-event',
  kind: 'task',
  badge: { label: 'Event nearby', tone: 'event' },
  headlinePrefix: 'There’s a new event at the',
  clientName: 'Sunshine Country Club',
  clientIcon: 'location',
  clientPreview: SUNSHINE_PREVIEW,
  headlineSuffix: '. Register this week to set up a booth and unlock more prospects.',
  description: 'A booth costs $240 and other colleagues with similar profiles have added est. $3,400 FYC.',
  tags: ['Broader network'],
  footerLabel: 'Event details',
  primaryCta: 'Register for an event',
  focusHeadline: 'One booth, fourteen matched prospects — the Sunshine event pays for itself.',
  doneHeadline: 'Booth booked. Thomas’s conversion is the next thread to pull.',
  eventExpand: {
    details:
      'Booth at the Sunshine Country Club member mixer · Sat, Dec 17, 10 AM – 2 PM. NYL covers the table; you bring materials. 14 members match your ideal client profile.',
    agents: [
      { name: 'Maria T.', location: 'Scarsdale', result: '+$5,200 FYC · 4 new prospects in 60 days' },
      { name: 'James O.', location: 'White Plains', result: '6 fact-finds booked · 2 converted' },
      { name: 'Priya N.', location: 'Rye', result: '+$3,900 FYC · 3 qualified leads' },
    ],
  },
}

/* Thomas Reyes — term-conversion window closing. */
export const THOMAS_TASK: TaskCardModel = {
  id: 'thomas-reyes',
  kind: 'task',
  badge: { label: 'Closing window', tone: 'prep' },
  headlinePrefix: 'Reach',
  clientName: 'Thomas Reyes',
  clientPreview: THOMAS_PREVIEW,
  headlineSuffix: 'to discuss a WL conversion.',
  description: 'Term window closes in 4 months. After that, conversion requires new underwriting.',
  tags: ['Existing client focus', 'Higher FYC'],
  footerLabel: 'Outreach approach',
  primaryCta: 'Review draft',
  email: 'treyes@gmail.com',
  focusHeadline: 'Lock Thomas’s conversion now — four months before it costs him new underwriting.',
  doneHeadline: 'Thomas is locked in. Two warm leads from your network are up next.',
  defaultDraft: 'email',
  drafts: {
    email: {
      context: 'A fuller email — frame the deadline and the benefit of converting now.',
      body: 'Subject: A timely option on your term policy\n\nHi Thomas,\n\nI was reviewing your coverage and wanted to flag something time-sensitive: your 20-year term policy is entering its conversion window, which closes in about four months. Converting now lets you move to permanent coverage without new medical underwriting — after the window, that option requires requalifying.\n\nIt’s worth a short conversation to see whether converting some or all of it makes sense for you. Do you have 20 minutes this week or next?\n\nBest,\nSarah Ferreira\nNew York Life',
      meta: 'Draft generated · Last updated 9:18 AM',
    },
    call: {
      context: 'Lead with the deadline — converting now skips new underwriting.',
      body: 'Hi Thomas, it’s Sarah. Your term policy’s conversion window closes in about four months — converting now means no new medical underwriting. Worth a quick call this week to see if it makes sense?',
      meta: 'Draft generated · Last updated 9:18 AM',
    },
    text: {
      context: 'Short SMS — deadline-forward.',
      body: 'Hi Thomas, it’s Sarah from New York Life. Your term conversion window closes in ~4 months — converting now avoids new medical underwriting. Worth a quick call to review your options?',
      meta: 'Draft generated · Last updated 9:18 AM',
    },
  },
}

/* New conversions — two fresh, high-intent leads on one card (Figma 1102-104772).
 * Carries a second highlighted name + a confidence meta on the badge. */
export const NEW_LEADS_TASK: TaskCardModel = {
  id: 'new-leads',
  kind: 'task',
  badge: { label: 'New conversions', tone: 'event', meta: '92% confidence' },
  headlinePrefix: 'Reach out to two new leads',
  clientName: 'Jennifer Nopez',
  clientIcon: 'person',
  clientPreview: JENNIFER_PREVIEW,
  headlineMid: 'and',
  secondName: { name: 'Anderson Coop', icon: 'person', preview: ANDERSON_PREVIEW },
  headlineSuffix: 'while their intent is high.',
  description:
    'Both arrived this week with strong buying signals. Leads contacted within a day convert ~3× more often than those left to cool.',
  tags: ['Broader network', 'Boost FYC'],
  footerLabel: 'Outreach approach',
  primaryCta: 'Draft intros',
  focusHeadline: 'Two fresh leads, both high-intent — today is the day they convert or cool.',
  doneHeadline: 'Intros sent. One warm handoff from David’s book is the last thread.',
  defaultDraft: 'email',
  drafts: {
    email: {
      context: 'A warm first touch — name how they came in, keep it short, propose a quick call.',
      body: 'Subject: Glad you reached out\n\nHi Jennifer,\n\nThanks for the introduction from Marcus — he speaks highly of you. I help business owners protect what they’ve built, and I’d love to learn what matters most to you. Would 15 minutes this week work for a quick call?\n\nWarmly,\nSarah Ferreira\nNew York Life',
      meta: 'Draft generated · Last updated 9:12 AM',
    },
    call: {
      context: 'Brief, friendly opener — reference the referral, then ask for a short fact-find.',
      body: 'Hi Jennifer, it’s Sarah Ferreira with New York Life — Marcus Webb suggested I reach out. I’d love to hear what’s on your mind around coverage. Do you have 15 minutes this week?',
      meta: 'Draft generated · Last updated 9:12 AM',
    },
    text: {
      context: 'Short SMS first-touch.',
      body: 'Hi Jennifer, it’s Sarah with New York Life — Marcus Webb connected us. Would love a quick 15-min call this week to learn what you’re looking for. What day works?',
      meta: 'Draft generated · Last updated 9:12 AM',
    },
  },
}

/* Succession — a client handed off from a retiring colleague (David Okafor).
 * The relationship transfers to Sarah; a warm first touch protects continuity. */
export const SUCCESSION_TASK: TaskCardModel = {
  id: 'succession-mendoza',
  kind: 'task',
  badge: { label: 'Book transfer', tone: 'event' },
  headlinePrefix: 'Introduce yourself to',
  clientName: 'Gloria Mendoza',
  clientPreview: MENDOZA_PREVIEW,
  headlineMid: '— inheriting her from',
  secondName: { name: 'David Okafor', icon: 'domain', preview: DAVID_OKAFOR_PREVIEW },
  headlineSuffix: 'as he retires this month.',
  description:
    'David is transitioning 18 households to you this month. Gloria is his highest-value relationship — a personal intro this week keeps the trust he built intact.',
  tags: ['Succession', 'Retention'],
  footerLabel: 'Outreach approach',
  primaryCta: 'Draft intro',
  email: 'g.mendoza@gmail.com',
  focusHeadline: 'A warm intro to Gloria keeps David’s book — and its trust — intact as it moves to you.',
  doneHeadline: 'Gloria’s welcomed aboard. The Harrington review is next on deck.',
  defaultDraft: 'email',
  drafts: {
    email: {
      context: 'A warm handoff note — reference David by name, reassure continuity, ask for a short intro call.',
      body: 'Subject: A warm introduction from David Okafor’s team\n\nHi Gloria,\n\nDavid Okafor has spoken so highly of you, and as he moves into a well-earned retirement, he’s asked me to look after your accounts personally. I want to make this transition seamless — nothing about your coverage changes, and I’m here whenever you need me.\n\nCould we find 20 minutes this week for a quick introduction? I’d love to hear what matters most to you heading into retirement.\n\nWarmly,\nSarah Ferreira\nNew York Life',
      meta: 'Draft generated · Last updated 9:04 AM',
    },
    call: {
      context: 'Reassuring opener — name David, stress continuity, keep it brief.',
      body: 'Hi Gloria, it’s Sarah Ferreira with New York Life. David Okafor is retiring and asked me to personally look after your accounts. Nothing changes on your end — I just wanted to introduce myself. Do you have 20 minutes this week to connect?',
      meta: 'Draft generated · Last updated 9:04 AM',
    },
  },
}

/* ── Nyla's suggested follow-up (step 3) ────────────────────────────────────
 * Appears after the Sandra CALL task is marked done. Nyla reasons the next
 * action and acknowledges the autonomous work it already did. HEADLINE frames
 * the concrete next step; acknowledgements are CONCIERGE (closed loops). */
export const SANDRA_FOLLOWUP_SUGGESTED: TaskCardModel = {
  id: 'sandra-followup',
  kind: 'suggested',
  badge: { label: 'Follow-up', tone: 'prep' },
  headlinePrefix: 'Submit a request to update payment information for',
  clientName: 'Sandra Kim',
  clientPreview: SANDRA_PREVIEW,
  headlineSuffix: 'and send a follow-up message with details.',
  description:
    'Agents who have sent a follow-up right after a call have seen a +25% increase in clients active by EOD.',
  tags: ['Improve follow-ups'],
  footerLabel: 'Prep ready for review',
  primaryCta: 'Review all and submit',
  acknowledgements: [
    { label: 'Payment service request is pre-filled and queued', cta: 'View request' },
    { label: 'Draft for a follow-up confirmation email is ready', cta: 'Review drafts' },
  ],
}

/* Clementine Park — annual-review prep (aligns with "Your day"). */
export const CLEMENTINE_PREVIEW: ClientPreview = {
  nickname: '"Clem"',
  clientSince: 'Client since 2015',
  lastTouch: 'Last touch 6/12/2025',
  grade: 'A',
  blurb:
    'Clementine, 58, has three policies and a 1:45 annual review. Her WL beneficiary still lists her ex-husband — the one flag to clear before the rest of the conversation.',
  tags: ['Deepen existing clients', 'Compliance'],
  files: ['ClementinePark_AnnualReview.pdf', 'Beneficiary-Update.pdf'],
  email: 'c.park@gmail.com',
  phone: '(917) 662-1180',
}

export const CLEMENTINE_TASK: TaskCardModel = {
  id: 'clementine-review',
  kind: 'task',
  badge: { label: 'Prep ready', tone: 'ready' },
  headlinePrefix: 'Walk into',
  clientName: 'Clementine Park',
  clientPreview: CLEMENTINE_PREVIEW,
  headlineSuffix: '’s 1:45 review ready to catch the beneficiary gap before she does.',
  doneSummary: 'Prep Clementine Park’s annual review',
  description:
    'Her WL beneficiary still lists her ex-husband. Updating it clears a compliance flag and earns the rest of the meeting.',
  tags: ['Deepen existing clients'],
  footerLabel: 'Pre-meeting brief',
  primaryCta: 'Open the brief',
  focusHeadline: 'Clementine’s review turns on one fix — the beneficiary gap, caught before she notices.',
  doneHeadline: 'Clementine’s prepped. Laura’s coverage gaps are the next call.',
  defaultDraft: 'email',
  drafts: {
    email: {
      context:
        'A short confirmation the morning of — reconfirm 1:45 and hint at the beneficiary update so it isn’t a surprise.',
      body: 'Subject: See you at 1:45 today\n\nHi Clementine,\n\nLooking forward to our review at 1:45. I’ll bring a quick summary of your three policies, and there’s one small housekeeping item on a beneficiary designation we can update in a few minutes.\n\nSee you soon,\nSarah Ferreira\nNew York Life',
      meta: 'Draft generated · Last updated 9:22 AM',
    },
    call: {
      context: 'If you’d rather call — warm, brief, reconfirm the time.',
      body: 'Hi Clementine, it’s Sarah — just confirming our 1:45 review today. I’ll walk you through your policies and we’ll take care of a quick beneficiary update. See you then!',
      meta: 'Draft generated · Last updated 9:22 AM',
    },
  },
}

/* Harrington / Khoury — more of today's priorities. */

/* Harrington Family Trust — a multi-member trust; the preview breaks out the
 * members, history, and the parts of the trust (policies + annuity). */
export const HARRINGTON_PREVIEW: ClientPreview = {
  nickname: 'Harrington Family Trust',
  clientSince: 'Trust since 2011',
  lastTouch: '3 members · last review Q1',
  grade: 'A',
  blurb:
    'A three-member family trust: Robert & Diane Harrington (grantors) and daughter Claire Harrington (successor trustee). Robert’s the primary contact; Claire has joined the last two reviews as she steps into the trustee role.',
  tags: ['WL — Robert', 'WL — Diane', 'Survivorship policy', 'Fixed annuity'],
  files: ['Harrington-Trust-Agreement.pdf', 'Q1-2025-Review-Notes.pdf', 'Annuity-Statement-2025.pdf'],
  email: 'r.harrington@gmail.com',
  phone: '(917) 208-4471',
}

export const HARRINGTON_TASK: TaskCardModel = {
  id: 'harrington-review',
  kind: 'task',
  badge: { label: 'Review prep', tone: 'prep' },
  headlinePrefix: 'Prep the quarterly review for',
  clientName: 'the Harrington Trust',
  clientPreview: HARRINGTON_PREVIEW,
  headlineSuffix: ' — three policies and an annuity to walk through.',
  description:
    'Their portfolio review is booked. Nyla has the packet and talking points ready, so you walk in prepared.',
  tags: ['Deepen existing clients'],
  footerLabel: 'Pre-meeting brief',
  primaryCta: 'Open the brief',
  focusHeadline: 'The Harrington review rewards prep — walk in knowing all three policies cold.',
  doneHeadline: 'Harrington’s prepped. Nadia’s renewal is the next clock ticking.',
  review: {
    documents: [
      'Harrington-Trust-Agreement.pdf',
      'Q1-2025-Review-Notes.pdf',
      'Annuity-Statement-2025.pdf',
      'Policy-Summary-3up.pdf',
    ],
    recap: [
      {
        date: 'Q1 review',
        note: 'Robert asked to revisit the survivorship policy’s funding after Diane’s retirement — flagged to model at the next review.',
      },
      {
        date: 'Nov call',
        note: 'Claire joined; wants to understand how the fixed annuity feeds the trust before she becomes trustee.',
      },
      {
        date: 'Sep email',
        note: 'Requested a consolidated statement across all three policies — the reason for the 3-policy walkthrough this quarter.',
      },
    ],
  },
}

/* Nadia Khoury — hover preview for the renewal card. */
export const KHOURY_PREVIEW: ClientPreview = {
  nickname: '"Nadia"',
  clientSince: 'Client since 2015',
  lastTouch: 'Last touch 3/2/2025',
  grade: 'B',
  blurb:
    'Nadia, 45, holds a 10-year term ($600K) renewing this week. Steady premium payer, dual-income household — a strong candidate to renew now before the rate re-rates on age.',
  tags: ['Term renewal', 'Retention', 'Higher FYC'],
  files: ['Khoury-Term-Policy.pdf', 'Renewal-Options-2025.pdf'],
  email: 'n.khoury@gmail.com',
  phone: '(917) 442-9930',
}

export const KHOURY_TASK: TaskCardModel = {
  id: 'khoury-renewal',
  kind: 'task',
  badge: { label: 'Renewal window', tone: 'prep' },
  headlinePrefix: 'Confirm the term renewal for',
  clientName: 'Nadia Khoury',
  clientPreview: KHOURY_PREVIEW,
  headlineSuffix: ' before her rate locks in for another ten years.',
  description:
    'Her 10-year term renews this week. A quick check-in protects both the relationship and the premium before it auto-renews.',
  tags: ['Existing client focus', 'Higher FYC'],
  footerLabel: 'Outreach approach',
  primaryCta: 'Plan a call',
  phone: '(917) 442-9930',
  focusHeadline: 'Catch Nadia before her rate locks — ten years of premium rides on this week.',
  doneHeadline: 'Nadia’s renewal is handled. The last one today is an investment in you.',
  defaultDraft: 'call',
  drafts: {
    call: {
      context: 'Lead with the deadline — the rate locks this week; a quick call protects the premium.',
      body: 'Hi Nadia, it’s Sarah from New York Life. Your 10-year term renews this week — I’d love to review your options before the rate locks so you keep the best premium. Do you have 15 minutes today or tomorrow?',
      meta: 'Draft generated · Last updated 9:15 AM',
    },
    email: {
      context: 'A short email if she prefers — deadline-forward, easy to reply to.',
      body: 'Subject: A quick check before your renewal\n\nHi Nadia,\n\nYour 10-year term is up for renewal this week. A short conversation now lets us lock the best available rate and make sure the coverage still fits. Would 15 minutes this week work?\n\nWarmly,\nSarah Ferreira\nNew York Life',
      meta: 'Draft generated · Last updated 9:15 AM',
    },
  },
}

/* License / practice preview — Sarah's own credential, on the path to holistic
 * advising. Hover card explains what the credential unlocks. */
export const PRACTICE_PREVIEW: ClientPreview = {
  kind: 'practice',
  nickname: 'Series 65',
  clientSince: 'Investment Adviser Rep',
  lastTouch: '~40–60 hrs prep',
  blurb:
    'The Series 65 lets you give investment advice for a fee — the credential that turns protection-only clients into full financial-planning relationships.',
  insight:
    'Nyla’s read on your book: advisors who added a Series 65 brought ~$22K in new fee-based FYC within a year, mostly from assets they were already referring out. For your book, that’s roughly 30 households who’d consolidate with you.',
  notes: [
    'Advise on investments and charge a fee, not just product commission.',
    'Keep assets in-house instead of referring clients to an outside advisor.',
    'Pairs with your insurance license for true one-stop, holistic planning.',
  ],
  tags: ['Fee-based advising', 'Holistic planning'],
  files: [],
}

/* Sarah's own growth — adding a credential on the path to holistic advising. No
 * client; this one's an investment in her practice, not an outreach. */
export const LICENSE_TASK: TaskCardModel = {
  id: 'license-series65',
  kind: 'task',
  badge: { label: 'Grow your practice', tone: 'growth' },
  headlinePrefix: 'Add a',
  clientName: 'Series 65',
  clientIcon: 'license',
  clientPreview: PRACTICE_PREVIEW,
  headlineSuffix: 'to your license stack — your first step toward holistic, fee-based advising.',
  description:
    'You already cover protection; the Series 65 lets you advise on investments too, so clients consolidate around you instead of splitting with another advisor. Nyla can map the exam timeline around your calendar.',
  tags: ['Grow your practice', 'Higher FYC'],
  footerLabel: 'Your path to holistic advising',
  primaryCta: 'Start training',
  focusHeadline: 'One credential widens your whole remit — the Series 65 makes you a one-stop advisor.',
  doneHeadline: 'Your Series 65 plan is set. You’ve cleared the board for today.',
  pathway: {
    overview:
      'The Series 65 (Uniform Investment Adviser Law Exam) qualifies you as an Investment Adviser Representative — so you can give fee-based investment advice as a fiduciary, not just place protection products. No sponsor or prerequisite exam required; you register on your own.',
    coverage: [
      'Investment vehicles — equities, bonds, funds, alternatives',
      'Client recommendations, portfolio & retirement strategy',
      'Laws, regulations & fiduciary/ethical duties',
      'Economic factors & business fundamentals',
    ],
    steps: [
      {
        label: 'Enroll in a prep course',
        detail: 'Self-paced online, ~40–60 hours of material — no sponsor needed.',
        when: 'Week 1',
      },
      {
        label: 'Study around your calendar',
        detail: 'Nyla protects 2–3 prep blocks a week so it fits your book.',
        when: 'Weeks 1–6',
      },
      {
        label: 'Schedule the exam',
        detail: 'Register through FINRA (~$187); take it at a Prometric center or online-proctored.',
        when: 'Week 6',
      },
      {
        label: 'Pass the exam',
        detail: '130 scored questions · 180 minutes · 72% to pass (94 correct).',
        when: 'Week 7',
      },
      {
        label: 'Register as an IAR',
        detail: 'File with your state — then you’re cleared to advise on investments.',
        when: 'Week 8',
      },
    ],
  },
}

/* Convenience bundle for the scene's initial stack — today's 10 priorities.
 * Clementine sits right after Sandra (aligns with the two "Your day" reviews). */
export const INITIAL_TASKS: TaskCardModel[] = [
  SANDRA_TASK,
  CLEMENTINE_TASK,
  LAURA_TASK,
  SUNSHINE_TASK,
  THOMAS_TASK,
  NEW_LEADS_TASK,
  SUCCESSION_TASK,
  HARRINGTON_TASK,
  KHOURY_TASK,
  LICENSE_TASK,
]

export const DAY2_GROUP_TASKS: TaskCardModel[] = [
  SUNSHINE_TASK,
  THOMAS_TASK,
  NEW_LEADS_TASK,
  SUCCESSION_TASK,
  HARRINGTON_TASK,
  KHOURY_TASK,
  LICENSE_TASK,
]

export const DAY3_GROUP_TASKS: TaskCardModel[] = [
  NEW_LEADS_TASK,
  SUCCESSION_TASK,
  HARRINGTON_TASK,
  KHOURY_TASK,
  LICENSE_TASK,
]

export const DAY4_GROUP_TASKS: TaskCardModel[] = [HARRINGTON_TASK, KHOURY_TASK, LICENSE_TASK]

/* Day 2/3/4 task tracks — copies of Day 1's for now, content to be individualized per day.
 * Each day leads with its own Sandra task variant in place of Day 1's. */
export const DAY2_TASKS: TaskCardModel[] = [SANDRA_TASK2, ...DAY2_GROUP_TASKS]
export const DAY3_TASKS: TaskCardModel[] = [SANDRA_TASK3, ...DAY3_GROUP_TASKS]
export const DAY4_TASKS: TaskCardModel[] = [SANDRA_TASK4, ...DAY4_GROUP_TASKS]

/* Closing line under the task stack — signals the priorities end here and Nyla
 * keeps watch for the rest. */
export const STACK_FOOTER = 'That’s today’s priorities. Nyla is watching the rest of your book — check back for more.'

/* ── Future-day briefing (date carousel → next days) ────────────────────────
 * Clicking the date forward shows the same layout with a forward-looking task
 * set. Nyla "pre-stages" what's coming; the headline acknowledges the date. */
export const FUTURE_TASKS: TaskCardModel[] = [
  {
    id: 'future-castellano',
    kind: 'task',
    badge: { label: 'Review prep', tone: 'prep' },
    headlinePrefix: 'Prep the estate review for',
    clientName: 'the Castellano family',
    headlineSuffix: ' — a trust update and two beneficiary changes to confirm.',
    description:
      'Their estate review is on the calendar. Nyla is assembling the documents and flagging what needs a signature.',
    tags: ['Deepen existing clients'],
    footerLabel: 'Pre-meeting brief loading',
    primaryCta: 'Preview the brief',
  },
  {
    id: 'future-webb-delivery',
    kind: 'task',
    badge: { label: 'Policy delivery', tone: 'prep' },
    headlinePrefix: 'Deliver the new policy to',
    clientName: 'Marcus Webb',
    headlineSuffix: ' and set the first annual review while you’re there.',
    description:
      'His approved policy is ready to hand off. Delivery is the natural moment to confirm beneficiaries and book next year.',
    tags: ['Existing client focus'],
    footerLabel: 'Outreach approach',
    primaryCta: 'Schedule delivery',
    email: 'm.webb@gmail.com',
  },
  {
    id: 'future-rivera',
    kind: 'task',
    badge: { label: 'Re-engage', tone: 'opportunity' },
    headlinePrefix: 'Reconnect with',
    clientName: 'Tomás Rivera',
    headlineSuffix: ', a prospect who went quiet after a strong first meeting.',
    description:
      'Six weeks since your last touch. A light, value-first note tends to revive prospects at this stage better than a hard follow-up.',
    tags: ['Broader network'],
    footerLabel: 'Outreach approach',
    primaryCta: 'Draft a note',
  },
]

/* ── Horizon views (Day / Week / Month / Quarter) ───────────────────────────
 * Day shows the live briefing. The longer horizons swap to a Coach-voice summary
 * + a few aggregate stats so the time-scope switch is meaningful. */
export interface HorizonStat {
  label: string
  value: string
  sub: string
  tone?: 'good' | 'warn' | 'neutral'
}
export interface HorizonView {
  headline: string
  note: string
  stats: HorizonStat[]
}

export const HORIZON_VIEWS: Record<'Week' | 'Month' | 'Quarter', HorizonView> = {
  Week: {
    headline: 'Your week turns on three reviews and one lapse cleared.',
    note: 'Switch back to Day to act on today’s priorities.',
    stats: [
      { label: 'FYC in play', value: '$11.4K', sub: 'across 6 open threads', tone: 'good' },
      { label: 'Reviews', value: '4', sub: '3 prepped · 1 to confirm', tone: 'neutral' },
      { label: 'At-risk policies', value: '2', sub: 'Sandra cleared · Lau in 2 days', tone: 'warn' },
    ],
  },
  Month: {
    headline: 'June is a revenue month — you’re 76% to target with room to close.',
    note: 'Switch back to Day to act on today’s priorities.',
    stats: [
      { label: 'FYC to date', value: '$92.4K', sub: 'of $122K target', tone: 'good' },
      { label: 'Cases closed', value: '38', sub: '+6 vs. May', tone: 'good' },
      { label: 'Reviews booked', value: '11', sub: '3 cross-sell openings', tone: 'neutral' },
    ],
  },
  Quarter: {
    headline: 'The quarter’s story: steady growth, concentrated in your top relationships.',
    note: 'Switch back to Day to act on today’s priorities.',
    stats: [
      { label: 'FYC this quarter', value: '$268K', sub: '+22% YoY', tone: 'good' },
      { label: 'Concentration', value: '68%', sub: 'in your top 11 clients', tone: 'warn' },
      { label: 'Retention', value: '97%', sub: '2 lapses prevented', tone: 'good' },
    ],
  },
}

/* ── Main nav sections (Figma 1002-12213) ───────────────────────────────────
 * Briefing is the built view; the others show a placeholder inside the overlay
 * so the nav reads as connected without leaving the prototype. */
export interface NavPlaceholderMeta {
  title: string
  valueProp: string
  example?: string
}

export const NAV_PLACEHOLDER: Record<string, NavPlaceholderMeta> = {
  Clients: {
    title: 'Clients',
    valueProp:
      "Your book, seen the way top agents see it. Nyla analyzes life signals, coverage gaps, and patterns across similar advisors to show you who's ready and why.",
    example: 'Dig into a client segment to find overlooked households Nyla flagged for follow-up.',
  },
  Actives: {
    title: 'Actives',
    valueProp:
      'Nothing stalls. Nothing slips. Nyla tracks every open case, surfaces blockers, and connects the dots across your pipeline — no chasing required.',
    example: 'Pull up an active case to see exactly where it stands and what clears it with a click.',
  },
  Prospects: {
    title: 'Prospects',
    valueProp:
      "Find the clients you didn't know to look for. Nyla learns from your niche, your history, and agents like you to surface prospects that actually fit, with the context to reach them well.",
    example: 'Explore a new prospect segment to see who Nyla surfaced and why they fit your book.',
  },
  Planning: {
    title: 'Business',
    valueProp:
      'Your numbers, turned into a plan. Nyla benchmarks your production against peers, finds the real gaps, and maps the moves that matter most to your goals.',
    example: 'Open council pacing to see where you stand and what Nyla recommends to close the gap.',
  },
  Notifications: {
    title: 'Notifications',
    valueProp: 'Only the alerts that earned their place. Nyla filtered the rest.',
    example: 'Open an alert to see the context and act on it immediately.',
  },
  Calendar: {
    title: 'Calendar',
    valueProp: 'Every meeting prepped before you sit down.',
    example: 'Open an event to see the brief Nyla built — client history, open items, recommended ask.',
  },
  Plan: {
    title: 'Plan',
    valueProp: 'Your goals, targets, and the path Nyla maps to hit them.',
  },
}

/* ── Snooze / queue menu options ───────────────────────────────────────────*/
export const SNOOZE_OPTIONS = ['1 hour', 'This afternoon', 'Tomorrow', 'Next week']
export const QUEUE_OPTIONS = ['now', 'this morning', 'this afternoon', 'tomorrow']
/* Draft-type selector in the expanded card view. */
export const DRAFT_TYPES = ['For a call', 'For a text', 'For an email']
