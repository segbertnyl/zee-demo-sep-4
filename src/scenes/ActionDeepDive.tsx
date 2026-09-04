import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useAppStore } from '@/state/useAppStore'
import { TomGuidedCanvas } from './TomGuidedCanvas'
import { CollabLauncher } from './BriefingScene'

/* Action-board deep dive — pannable, zoomable, annotatable infinite canvas.
 *
 *  · Pan: drag background, or two-finger trackpad scroll
 *  · Zoom: ctrl/⌘ + wheel, or pinch on trackpad
 *  · Drag cards: grip handle in the top-right of each card
 *  · Annotate: bottom dock toggle → click + drag draws blue ink
 *  · List view: bottom dock toggle for a stacked vertical layout */

type CardType = 'opportunity' | 'opportunity-areas' | 'outreach-draft' | 'relationship-snapshot' | 'photo'
type Pos = { x: number; y: number }
type CanvasCard = { id: string; type: CardType; pos: Pos }
type Path = { id: number; points: Pos[] }
type Mode = 'pan' | 'annotate'
type ViewMode = 'canvas' | 'list'

/* User-created editable node — spawned by the "+ Node" button. Editable until
 * the advisor hits Confirm; lockable, draggable, and persists for the session.
 * Five kinds: free-form note, checklist, open question, A/B decision, reminder. */
type UserNodeKind = 'note' | 'checklist' | 'question' | 'decision' | 'reminder'

type ChecklistItem = { text: string; done: boolean }

type UserNode = {
  id: string
  kind: UserNodeKind
  x: number
  y: number
  title: string
  /* Used by: note (body), question (context), reminder (what), decision (context) */
  body: string
  locked: boolean
  /* Type-specific */
  items?: ChecklistItem[]            /* checklist */
  optionA?: string                   /* decision */
  optionB?: string                   /* decision */
  picked?: 'A' | 'B' | null          /* decision */
  when?: string                      /* reminder — free-text date/time */
}

type DeepDiveSpec = {
  id: string
  title: string
  savedLabel: string
  cards: CanvasCard[]
}

const CARD_TITLES: Record<CardType, string> = {
  opportunity: 'Opportunity',
  'opportunity-areas': 'Opportunity areas',
  'outreach-draft': 'A warm outreach approach',
  'relationship-snapshot': 'Relationship snapshot',
  photo: 'Client',
}

/* Per-deep-dive content. Falls back to Janet for ids without an override. */
type CanvasContent = {
  opp: {
    badge: string
    confidence: number
    nameLink: string
    headline: string
    body: string
    metrics: {
      propensity: { value: string; tone: 'good' | 'warn' | 'ok' }
      engagement: { value: string; tone: 'good' | 'warn' | 'ok' }
      fyc: { value: string; tone: 'good' | 'warn' | 'ok' }
    }
    plan: { label: string; sub: string }[]
    primaryCta: string
  }
  areas: { title: string; copy: string }[]
  draft: {
    title: string
    eyebrow: string
    salutation: string
    body: string
  }
  snapshot: { label: string; value: string }[]
  photo: { name: string; subtitle: string; tags: string[]; initials: string; tint: 'blue' | 'orange' | 'green' | 'purple' }
}

const DEFAULT_CONTENT: CanvasContent = {
  opp: {
    badge: 'Opportunity',
    confidence: 92,
    nameLink: 'Janet Henderson',
    headline: ' has recently had a change of address to a high flood-risk coastal location.',
    body: "You're in the 30-day post-move window. Lead with a coverage conversation, not flood specifically.",
    metrics: {
      propensity: { value: '95%', tone: 'good' },
      engagement: { value: '-8.2%', tone: 'warn' },
      fyc: { value: '+$1,200', tone: 'ok' },
    },
    plan: [
      { label: "Review Janet's portfolio", sub: 'Prep for the call' },
      { label: 'Draft the warm outreach', sub: 'Start the coverage conversation' },
      { label: "Revise Janet's coverage", sub: 'Broaden flood + household share' },
    ],
    primaryCta: "Review Janet's portfolio",
  },
  areas: [
    { title: 'Retirement readiness', copy: 'Retirement review completed 24 months ago.' },
    { title: 'Asset consolidation', copy: 'Retirement assets currently unknown.' },
    { title: 'Legacy planning', copy: 'Beneficiary review overdue.' },
    { title: 'Potential Recommendations', copy: 'Focus on strategies, not products.' },
  ],
  draft: {
    title: 'A warm outreach approach',
    eyebrow: 'Time for a planning-readiness review?',
    salutation: 'Hi Janet,',
    body: `I hope you're doing well.

The next chapter — the years where you're winding into retirement rather than away from it — is the part of planning that tends to need fresher conversations, not bigger numbers.

Plans often evolve over time, and a quick walk-through helps make sure your existing strategy is still built for what's ahead.

Would you be available for a 20-minute conversation in the next couple of weeks?

Looking forward to catching up.`,
  },
  snapshot: [
    { label: 'Client since', value: '2014' },
    { label: 'Active policies', value: '3' },
    { label: 'Household status', value: 'Married' },
    { label: 'Dependents', value: '2 (adult children)' },
    { label: 'Coverage type', value: 'Term + WL' },
    { label: 'Last meeting', value: '11 months ago' },
  ],
  photo: { name: 'Janet Henderson', subtitle: 'Coastal household · 2 dependents', tags: ['Pre-retirement', 'Multi-policy', 'Coastal move'], initials: 'JH', tint: 'blue' },
}

const CONTENT_BY_ID: Record<string, CanvasContent> = {
  janet: DEFAULT_CONTENT,
  'jon-owen': {
    opp: {
      badge: 'Opportunity',
      confidence: 88,
      nameLink: 'Jon Owen',
      headline: ' is the referral you should close tomorrow.',
      body:
        "Warm referral from Marcus Rosenthal three weeks ago. Two productive calls. He asked for an illustration on Friday and hasn't replied — but his open rate on your emails is 100%. He's waiting on you to close the loop, not to sell harder.",
      metrics: {
        propensity: { value: '88%', tone: 'good' },
        engagement: { value: '+12%', tone: 'good' },
        fyc: { value: '+$6,800', tone: 'ok' },
      },
      plan: [
        { label: 'Close the loop', sub: 'A one-line check-in tomorrow' },
        { label: 'Send the illustration recap', sub: 'Three-line summary of last week' },
        { label: 'Calendar a close', sub: 'Friday before 2pm — his reply window' },
      ],
      primaryCta: "Draft Jon's check-in",
    },
    areas: [
      { title: 'Close the loop', copy: 'He needs a one-line check-in, not a pitch.' },
      { title: 'Send the illustration recap', copy: 'A 3-line summary of what you discussed.' },
      { title: 'Calendar a close', copy: 'Book Friday before 2pm — his usual reply window.' },
      { title: "Pull the Rosenthal thread", copy: '3 more warm intros sit one degree out from Jon.' },
    ],
    draft: {
      title: 'A one-line check-in',
      eyebrow: 'Don\'t pitch · close the loop',
      salutation: 'Hi Jon,',
      body: `Quick one — wanted to make sure my illustration last week made it to you.

Happy to walk through it whenever works (15 minutes is plenty), and if you'd rather sit on it a bit longer, no rush. Just don't want you to think I dropped the thread.

Best,
Sarah`,
    },
    snapshot: [
      { label: 'Status', value: 'Prospect · warm' },
      { label: 'Source', value: 'Marcus Rosenthal referral' },
      { label: 'First contact', value: '3 weeks ago' },
      { label: 'Calls completed', value: '2' },
      { label: 'Last touch', value: '4 days ago' },
      { label: 'Email open rate', value: '100%' },
    ],
    photo: { name: 'Jon Owen', subtitle: 'Warm referral · Rosenthal', tags: ['Pre-illustration', '100% open rate', 'High close intent'], initials: 'JO', tint: 'green' },
  },
  'tom-anderson': {
    opp: {
      badge: 'High priority',
      confidence: 96,
      nameLink: 'Tom Anderson',
      headline: ' has been sitting at underwriting for 11 days on a missing form.',
      body:
        "The application stalled because the carrier never sent the APS form request to Tom. That's a system failure, not a client failure. One 10-minute call clears the path, and Tom recovers the $4,200 FYC if he closes.",
      metrics: {
        propensity: { value: '96%', tone: 'good' },
        engagement: { value: '+4%', tone: 'good' },
        fyc: { value: '+$4,200', tone: 'ok' },
      },
      plan: [
        { label: 'Connect with Tom ASAP', sub: 'Own the delay before he notices it' },
        { label: 'Resend the APS request', sub: 'Re-route through Sales Central' },
        { label: 'Log and protect', sub: '48-hour follow-up alert' },
      ],
      primaryCta: 'Open the resend pack',
    },
    areas: [
      { title: 'Connect with Tom ASAP', copy: 'Own the delay before he notices it.' },
      { title: 'Resend the APS request', copy: 'Re-route through Sales Central.' },
      { title: 'Log and protect', copy: 'Set a 48-hour follow-up alert.' },
      { title: 'Avoid future drift', copy: 'Audit other underwriting cases for missing requests.' },
    ],
    draft: {
      title: 'Conversation guidance',
      eyebrow: 'Take the next 5 min',
      salutation: 'Hey Tom,',
      body: `How are you? I wanted to call you with an update on the application because we're still waiting on a medical form request. That's on our end — my apologies. I'm resending it right now, and once we have that back, you're clear to close. Shouldn't take more than a week.

Thanks for hanging in there.

Sarah`,
    },
    snapshot: [
      { label: 'Status', value: 'In underwriting · day 11' },
      { label: 'Product', value: 'Term life' },
      { label: 'Face amount', value: '$1.2M' },
      { label: 'Stage', value: 'APS missing' },
      { label: 'Est. FYC', value: '$4,200' },
      { label: 'Client since', value: '2021' },
    ],
    photo: { name: 'Tom Anderson', subtitle: 'Term life · application stalled', tags: ['Underwriting', 'APS missing', 'Day 11 drift'], initials: 'TA', tint: 'orange' },
  },
  'helena-1': {
    opp: {
      badge: 'Opportunity',
      confidence: 94,
      nameLink: 'Helena Garcia',
      headline: " just turned 58 and is engaging with retirement content — the pre-60 planning window is open.",
      body:
        "Three retirement-readiness articles opened in 7 days. Engagement score climbed from 23 to 41. Last touched 5 months ago. The holistic conversation you flagged in onboarding is sitting right here, unprompted — she did the homework herself.",
      metrics: {
        propensity: { value: '94%', tone: 'good' },
        engagement: { value: '+18 pts', tone: 'good' },
        fyc: { value: '+$3,400', tone: 'ok' },
      },
      plan: [
        { label: 'Draft the reconnection', sub: 'Frame the milestone, not the rate' },
        { label: 'Run the holistic talk-track', sub: '5-min Coach drill before 10:30' },
        { label: 'Suggest the 20-minute look', sub: 'No quote, no pitch — a portfolio review' },
      ],
      primaryCta: "Draft Helena's reconnection",
    },
    areas: [
      { title: 'Retirement readiness', copy: 'Pre-60 window opens once · widest in the first 30 days.' },
      { title: 'Income strategy', copy: 'Two-bucket framing fits her engagement pattern.' },
      { title: 'Household + Sergio', copy: 'Sergio (62) is retired. Joint conversation overdue.' },
      { title: 'Tone', copy: 'Curious, not consultative. The rate lives at the end.' },
    ],
    draft: {
      title: 'A warm reconnection',
      eyebrow: 'Lead with the milestone, not the rate',
      salutation: 'Hi Helena,',
      body: `It's been too long — I hope you and Sergio are well.

I've been thinking about you. You just crossed into a new chapter, and the kind of planning that matters at this stage is less about the numbers and more about the shape of the next ten years. The questions get better, not bigger.

Would you be open to a 20-minute walk-through in the next couple of weeks? No quote, no pitch — just a look at how the plan you have today stacks up against where you're heading. If now isn't the right time, just tell me and I'll loop back in the fall.

With warmth,
Priya`,
    },
    snapshot: [
      { label: 'Client since', value: '2011' },
      { label: 'Active policies', value: '2 · WL + IRA rollover' },
      { label: 'Spouse',         value: 'Sergio, 62 · retired' },
      { label: 'Children',       value: '2 (adults, financially independent)' },
      { label: 'Last meeting',   value: '5 months ago' },
      { label: 'Est. HH NW',     value: '$2.1M' },
    ],
    photo: { name: 'Helena Garcia', subtitle: 'Pre-60 window · holistic candidate', tags: ['Pre-60 milestone', 'Engagement spike', 'Holistic candidate'], initials: 'HG', tint: 'purple' },
  },
  'helena-2': {
    opp: {
      badge: 'Coach drill ready',
      confidence: 88,
      nameLink: 'Helena Garcia',
      headline: " is doing the homework herself — the right move is a talk-track drill, not a pitch.",
      body:
        "Three retirement-content opens in 7 days. The wrong instinct here is to lead with a rate or a product. The Coach drill is built around the holistic talk-track you flagged in onboarding — 5 minutes, three beats, ready to run before the 10:30 call.",
      metrics: {
        propensity: { value: '88%', tone: 'good' },
        engagement: { value: '+18 pts', tone: 'good' },
        fyc: { value: 'Indirect', tone: 'ok' },
      },
      plan: [
        { label: 'Beat 1 · Open with the milestone', sub: '60 seconds · the pre-60 framing' },
        { label: 'Beat 2 · One question · silence', sub: '90 seconds · don\'t rescue the pause' },
        { label: 'Beat 3 · The 20-minute look', sub: '90 seconds · land the soft close' },
      ],
      primaryCta: 'Start the 5-min drill',
    },
    areas: [
      { title: 'What to avoid', copy: 'Rates, products, "I have an idea." None of it lands today.' },
      { title: 'What works', copy: 'Curiosity questions. Listening. Asking what changed.' },
      { title: 'The household angle', copy: 'Sergio retired 18 months ago — that\'s the real fork.' },
      { title: 'Practice tape', copy: 'Recording auto-saved · reviewable after the call.' },
    ],
    draft: {
      title: 'The curiosity opener',
      eyebrow: 'Beat 1 — the milestone, not the rate',
      salutation: 'Hi Helena,',
      body: `I noticed you've been thinking about the next chapter — the years where you're winding into retirement rather than away from it.

I'd love to hear what's been on your mind. No agenda, no quote. Just a 20-minute conversation about where things are headed for you and Sergio.

When would work?

— Priya`,
    },
    snapshot: [
      { label: 'Drill type',     value: 'Holistic talk-track' },
      { label: 'Duration',       value: '5 minutes · 3 beats' },
      { label: 'Scenario',       value: 'Pre-60 milestone' },
      { label: 'Confidence push', value: 'Opens · pause · soft close' },
      { label: 'Coach',          value: 'Tracks the soft close · flags rate-leak' },
      { label: 'Tape',           value: 'Auto-saved for review' },
    ],
    photo: { name: 'Helena Garcia', subtitle: 'Coach drill · talk-track ready', tags: ['5-min drill', 'Holistic', 'Pre-60'], initials: 'HG', tint: 'purple' },
  },
}

function contentFor(id: string | null | undefined): CanvasContent {
  if (!id) return DEFAULT_CONTENT
  if (CONTENT_BY_ID[id]) return CONTENT_BY_ID[id]
  const seed = FALLBACK_CLIENTS[id]
  if (seed) return fallbackContent(seed)
  return DEFAULT_CONTENT
}

const SPECS: Record<string, DeepDiveSpec> = {
  janet: {
    id: 'janet',
    title: "Janet Henderson's flood policy opportunity",
    savedLabel: 'Saved 2m ago',
    cards: [
      { id: 'opp', type: 'opportunity', pos: { x: 40, y: 40 } },
      { id: 'photo', type: 'photo', pos: { x: 840, y: 40 } },
      { id: 'areas', type: 'opportunity-areas', pos: { x: 40, y: 600 } },
      { id: 'draft', type: 'outreach-draft', pos: { x: 500, y: 600 } },
      { id: 'snapshot', type: 'relationship-snapshot', pos: { x: 1140, y: 600 } },
    ],
  },
  'helena-1': {
    id: 'helena-1',
    title: "Helena Garcia's retirement readiness opportunity",
    savedLabel: 'Saved 5m ago',
    cards: [
      { id: 'opp', type: 'opportunity', pos: { x: 40, y: 40 } },
      { id: 'areas', type: 'opportunity-areas', pos: { x: 40, y: 600 } },
      { id: 'draft', type: 'outreach-draft', pos: { x: 500, y: 600 } },
      { id: 'snapshot', type: 'relationship-snapshot', pos: { x: 1140, y: 600 } },
    ],
  },
  'helena-2': {
    id: 'helena-2',
    title: "Helena Garcia's content engagement opportunity",
    savedLabel: 'Saved 8m ago',
    cards: [
      { id: 'opp', type: 'opportunity', pos: { x: 40, y: 40 } },
      { id: 'areas', type: 'opportunity-areas', pos: { x: 40, y: 600 } },
      { id: 'draft', type: 'outreach-draft', pos: { x: 500, y: 600 } },
      { id: 'snapshot', type: 'relationship-snapshot', pos: { x: 1140, y: 600 } },
    ],
  },
  /* Briefing priorities open into their own canvas */
  'tom-anderson': {
    id: 'tom-anderson',
    title: 'Tom Anderson · stalled application',
    savedLabel: 'Saved just now',
    cards: [
      { id: 'opp', type: 'opportunity', pos: { x: 40, y: 40 } },
      { id: 'photo', type: 'photo', pos: { x: 840, y: 40 } },
      { id: 'areas', type: 'opportunity-areas', pos: { x: 40, y: 600 } },
      { id: 'draft', type: 'outreach-draft', pos: { x: 500, y: 600 } },
      { id: 'snapshot', type: 'relationship-snapshot', pos: { x: 1140, y: 600 } },
    ],
  },
  'jon-owen': {
    id: 'jon-owen',
    title: 'Jon Owen · referral to close',
    savedLabel: 'Saved 4m ago',
    cards: [
      { id: 'opp', type: 'opportunity', pos: { x: 40, y: 40 } },
      { id: 'photo', type: 'photo', pos: { x: 840, y: 40 } },
      { id: 'areas', type: 'opportunity-areas', pos: { x: 40, y: 600 } },
      { id: 'draft', type: 'outreach-draft', pos: { x: 500, y: 600 } },
      { id: 'snapshot', type: 'relationship-snapshot', pos: { x: 1140, y: 600 } },
    ],
  },
  'andrew-cooper': {
    id: 'andrew-cooper',
    title: "Andrew Cooper · beneficiary change",
    savedLabel: 'Saved 12m ago',
    cards: [
      { id: 'opp', type: 'opportunity', pos: { x: 40, y: 40 } },
      { id: 'areas', type: 'opportunity-areas', pos: { x: 40, y: 600 } },
      { id: 'draft', type: 'outreach-draft', pos: { x: 500, y: 600 } },
      { id: 'snapshot', type: 'relationship-snapshot', pos: { x: 1140, y: 600 } },
    ],
  },
  'chloe-abrams': {
    id: 'chloe-abrams',
    title: "Chloe Abrams · 45th birthday milestone",
    savedLabel: 'Saved 1h ago',
    cards: [
      { id: 'opp', type: 'opportunity', pos: { x: 40, y: 40 } },
      { id: 'areas', type: 'opportunity-areas', pos: { x: 40, y: 600 } },
      { id: 'draft', type: 'outreach-draft', pos: { x: 500, y: 600 } },
      { id: 'snapshot', type: 'relationship-snapshot', pos: { x: 1140, y: 600 } },
    ],
  },
}

/* ----------------------------------------------------------------------------
 * Fallback clients — for every My Book card without a hand-authored SPEC/CONTENT
 * above, we generate a coherent deep-dive on the fly from this seed. Keeps the
 * 20-card book fully clickable without 20 unique authored canvases.
 * -------------------------------------------------------------------------- */

type FallbackSeed = {
  name: string
  /* Subtitle / segment shown below the name */
  segment: string
  /* Short signal phrase (e.g. "9:30 AM today", "Birth signal · 12d") */
  signal: string
  /* Metric shown on the My Book card — surfaced as the FYC line */
  metric: string
  initials: string
  tint: 'blue' | 'orange' | 'green'
  /* Headline tail — comes after the linked first name in the opportunity card */
  headlineTail: string
  /* Short body paragraph for the opportunity card */
  body: string
  badge: string
  confidence: number
  /* What three things the advisor should do next */
  plan: { label: string; sub: string }[]
  primaryCta: string
  /* Four "opportunity areas" listed as topic chips */
  areas: { title: string; copy: string }[]
  /* Outreach draft */
  draft: { title: string; eyebrow: string; salutation: string; body: string }
  snapshot: { label: string; value: string }[]
  /* Tags on the photo card */
  tags: string[]
  /* Title shown in the top bar */
  title: string
  savedLabel: string
}

const FALLBACK_CLIENTS: Record<string, FallbackSeed> = {
  'emma-clarke': {
    name: 'Emma Clarke', initials: 'EC', segment: 'Annual review · 9:30 AM today', signal: 'Today at 9:30 AM',
    metric: 'Prep ready', tint: 'blue',
    headlineTail: " has her annual review on the calendar this morning — pre-pack is ready to walk through.",
    body: "Her household ran a quiet year. Coverage is current, beneficiaries are clean, and her income picked up in Q1. The conversation to lead with is goal-mapping for the next five years.",
    badge: 'Annual review', confidence: 88,
    plan: [
      { label: 'Open the meeting pack', sub: 'Last review + this year deltas' },
      { label: 'Anchor on 5-year goal map', sub: 'Lead, don\'t recap' },
      { label: 'Flag retirement readiness ask', sub: 'Pre-60 window opens 2026' },
    ],
    primaryCta: 'Open meeting pack',
    areas: [
      { title: 'Goal map refresh', copy: 'Last mapped 18 months ago. Q1 income lift changes the math.' },
      { title: 'Retirement readiness', copy: 'Pre-60 window opens in 14 months.' },
      { title: 'Beneficiary check', copy: 'Clean, but worth confirming on camera.' },
      { title: 'Education funding', copy: 'Two dependents · 529 not optimized.' },
    ],
    draft: {
      title: 'Pre-meeting nudge', eyebrow: 'Send 20 min before', salutation: 'Hi Emma,',
      body: 'Quick note ahead of our 9:30 — I\'ve got the meeting pack ready. I\'d like to spend the bulk of our time on a fresh 5-year goal map rather than a line-item review. See you then.\n\nSarah',
    },
    snapshot: [
      { label: 'Client since', value: '2017' }, { label: 'Active policies', value: '4' },
      { label: 'Household status', value: 'Married' }, { label: 'Dependents', value: '2' },
      { label: 'Last meeting', value: '12 months ago' }, { label: 'NPS', value: '9' },
    ],
    tags: ['Annual review', 'Pre-60 window', 'Multi-policy'],
    title: 'Emma Clarke · annual review', savedLabel: 'Saved 2m ago',
  },
  'cesar-powell': {
    name: 'Cesar Powell', initials: 'CP', segment: 'Term renewal · September expiry', signal: 'No-touch 84d · expiry approaching',
    metric: 'Sept expiry', tint: 'orange',
    headlineTail: "'s 20-year term expires in September and he hasn't been touched in 84 days — the renewal window is now.",
    body: "Conversion to permanent is the right move on a household of his age and balance sheet. The longer the no-touch runs, the more likely he shops elsewhere.",
    badge: 'Renewal', confidence: 78,
    plan: [
      { label: 'Re-establish contact', sub: '84-day no-touch · break the silence' },
      { label: 'Frame the conversion math', sub: 'Term-to-perm in his window' },
      { label: 'Book a 30-minute call', sub: 'Pre-September close' },
    ],
    primaryCta: 'Draft re-engagement',
    areas: [
      { title: 'Break the silence', copy: '84 days is long enough that a value-first opener wins.' },
      { title: 'Term-to-perm conversion', copy: 'Conversion privilege still inside the window.' },
      { title: 'Coverage gap audit', copy: 'New mortgage two years in · check liability coverage.' },
      { title: 'Beneficiary review', copy: 'Hasn\'t been touched since policy inception.' },
    ],
    draft: {
      title: 'Re-engagement', eyebrow: 'Value-first, not transactional', salutation: 'Hi Cesar,',
      body: "I know we haven't connected in a few months — I wanted to make sure your term policy comes up on your radar before the September expiry. I'd love a 20-minute call to walk through your options.\n\nSarah",
    },
    snapshot: [
      { label: 'Client since', value: '2006' }, { label: 'Active policies', value: '1 (term)' },
      { label: 'Expiry', value: 'September 2026' }, { label: 'Conversion window', value: 'Open' },
      { label: 'Last touch', value: '84 days ago' }, { label: 'Premium', value: '$1,820/yr' },
    ],
    tags: ['Term expiring', 'Conversion eligible', 'No-touch'],
    title: 'Cesar Powell · term renewal window', savedLabel: 'Saved 6m ago',
  },
  'frances-carter': {
    name: 'Frances Carter', initials: 'FC', segment: 'Uninsured spouse · Janet\'s household', signal: 'Beneficiary on Janet · no NYL policy',
    metric: 'Open intro', tint: 'blue',
    headlineTail: " is Janet Henderson's spouse and the listed beneficiary on three policies — but doesn't carry coverage of her own.",
    body: "Best framed as a household-protection conversation, not a referral. Janet's already a top client, so trust transfers fast — the ask is a beneficiary review, not a sale.",
    badge: 'Household protect', confidence: 82,
    plan: [
      { label: 'Reach via Janet, not cold', sub: 'Beneficiary review framing' },
      { label: 'Run the household-balance lens', sub: 'Show the asymmetry on screen' },
      { label: 'Offer a 20-minute discovery', sub: 'In Janet\'s next review' },
    ],
    primaryCta: 'Draft beneficiary outreach',
    areas: [
      { title: 'Frame as protection, not sales', copy: 'Beneficiary review is the door, not the close.' },
      { title: 'Household asymmetry', copy: 'Three policies on Janet, zero on Frances.' },
      { title: 'Insurability check', copy: 'Window matters — health-event in two years.' },
      { title: 'Estate-line view', copy: 'Walks the path beneficiary-by-beneficiary.' },
    ],
    draft: {
      title: 'Through Janet', eyebrow: 'Beneficiary review framing', salutation: 'Hi Frances,',
      body: "Janet and I are doing a beneficiary review this month and your name comes up across her policies — which is great. I'd love a quick 20-minute conversation to make sure the protection on her side is matched on yours.\n\nSarah",
    },
    snapshot: [
      { label: 'Status', value: 'Spouse · uninsured' }, { label: 'Listed on', value: '3 policies' },
      { label: 'Source', value: 'Janet Henderson' }, { label: 'Health', value: 'Insurable' },
      { label: 'Last contact', value: 'None' }, { label: 'Household share', value: '~0%' },
    ],
    tags: ['Uninsured spouse', 'Beneficiary review', 'Household protect'],
    title: 'Frances Carter · uninsured beneficiary', savedLabel: 'Saved 9m ago',
  },
  'maria-diaz': {
    name: 'Maria Diaz', initials: 'MD', segment: 'Whole life conversion · APS stalled', signal: 'Application stalled 18 days · APS missing',
    metric: '$3.4K/yr', tint: 'orange',
    headlineTail: "'s whole-life application has been stuck at underwriting for 18 days waiting on a missing APS.",
    body: "Pattern looks like Tom Anderson — the form never reached her. Resend through Sales Central and confirm receipt by phone before close of day.",
    badge: 'Application stalled', confidence: 94,
    plan: [
      { label: 'Call Maria today', sub: 'Own the delay before she notices' },
      { label: 'Resend APS via Sales Central', sub: 'And note timestamp in case' },
      { label: 'Set 48-hour follow-up', sub: 'Don\'t let this drift like Tom' },
    ],
    primaryCta: 'Resend APS request',
    areas: [
      { title: 'Re-establish trust', copy: 'Acknowledge the delay on the call, not in writing.' },
      { title: 'Resend the APS', copy: 'Same root cause as Tom Anderson · check the queue.' },
      { title: 'Log and protect', copy: '48-hour alert until form returns.' },
      { title: 'Pattern detection', copy: 'Two stalls in a month · audit the queue this week.' },
    ],
    draft: {
      title: 'Acknowledge + resolve', eyebrow: 'Call, then text confirm', salutation: 'Hi Maria,',
      body: "Wanted to call with an update — your application's been waiting on a medical form that I just discovered never reached you. That's on our end. I'm resending it now, and once it's back, you're clear to close.\n\nSarah",
    },
    snapshot: [
      { label: 'Status', value: 'In underwriting · day 18' }, { label: 'Product', value: 'Whole life' },
      { label: 'Face amount', value: '$500K' }, { label: 'Stage', value: 'APS missing' },
      { label: 'Est. premium', value: '$3,400/yr' }, { label: 'Client since', value: '2024' },
    ],
    tags: ['Underwriting', 'APS missing', 'Day 18 drift'],
    title: 'Maria Diaz · stalled WL application', savedLabel: 'Saved just now',
  },
  'rachel-lim': {
    name: 'Rachel Lim', initials: 'RL', segment: 'LTC research · web signal', signal: 'Web signal · LTC product pages · 2d ago',
    metric: 'Watch', tint: 'orange',
    headlineTail: " spent 14 minutes on long-term-care pages two days ago — the first explicit LTC signal in her file.",
    body: "Too early for an outreach ask. The right move is a content nudge that meets her where she is and confirms whether the interest is hers or her parents'.",
    badge: 'Signal · early', confidence: 62,
    plan: [
      { label: 'Send a content piece', sub: 'No CTA · just open the door' },
      { label: 'Watch for re-engagement', sub: 'A reply unlocks the call' },
      { label: 'Log to LTC pipeline', sub: 'Quarterly nurture cohort' },
    ],
    primaryCta: 'Send LTC primer',
    areas: [
      { title: 'Meet the signal', copy: 'Content nudge, not a sales call.' },
      { title: 'Self vs. parent', copy: 'LTC search at 47 often means a parent, not her.' },
      { title: 'Quarterly nurture', copy: 'Add to the LTC content sequence.' },
      { title: 'Watch the next visit', copy: 'Second visit unlocks the offer.' },
    ],
    draft: {
      title: 'Soft content open', eyebrow: 'No ask · just a door', salutation: 'Hi Rachel,',
      body: "Saw an article on long-term care that made me think of a few conversations we had a couple of years ago. Sending it your way — no need to reply. If anything raises a question, you know where to find me.\n\nSarah",
    },
    snapshot: [
      { label: 'Client since', value: '2019' }, { label: 'Last touch', value: '6 weeks ago' },
      { label: 'Web signal', value: 'LTC pages · 14 min' }, { label: 'Parents', value: 'Both 70+' },
      { label: 'Active policies', value: '2' }, { label: 'Email opens', value: '88%' },
    ],
    tags: ['LTC signal', 'Early stage', 'Watch'],
    title: 'Rachel Lim · LTC research signal', savedLabel: 'Saved 1h ago',
  },
  'paul-reyes': {
    name: 'Paul Reyes', initials: 'PR', segment: 'Fact-finding · virtual at 11', signal: '11:00 AM today · virtual',
    metric: 'Virtual', tint: 'blue',
    headlineTail: " has fact-finding at 11 — first real conversation. Lead with the household, not the products.",
    body: "Prospect from the Rosenthal mentor network. The discovery should land on goals and household structure first; the product surface comes later in the sequence.",
    badge: 'Discovery', confidence: 71,
    plan: [
      { label: 'Open with goals', sub: 'Household, not products' },
      { label: 'Capture the household', sub: 'Dependents, debts, dreams' },
      { label: 'Book the follow-up', sub: 'Don\'t close on the discovery' },
    ],
    primaryCta: 'Open fact-find prep',
    areas: [
      { title: 'Goal-first discovery', copy: 'Lead with what he wants the next 10 years to look like.' },
      { title: 'Household structure', copy: 'Two kids, mortgage, freelance income — confirm.' },
      { title: 'Source check-in', copy: 'Loop Marcus Rosenthal post-meeting.' },
      { title: 'Set the next step', copy: 'Follow-up in 7 days · not on the discovery call.' },
    ],
    draft: {
      title: 'Pre-meeting confirm', eyebrow: 'Send 1 hour before', salutation: 'Hi Paul,',
      body: "Looking forward to our 11 AM. I'll keep it to ~40 minutes and the goal is just to get to know you and your household — no products, no pressure. Talk soon.\n\nSarah",
    },
    snapshot: [
      { label: 'Status', value: 'Prospect · discovery today' }, { label: 'Source', value: 'Marcus Rosenthal' },
      { label: 'Meeting', value: '11:00 AM · virtual' }, { label: 'Household', value: 'Married + 2' },
      { label: 'Sequence', value: 'Discovery → follow-up @ +7d' }, { label: 'Income', value: 'Freelance' },
    ],
    tags: ['Discovery', 'Warm referral', 'Today'],
    title: 'Paul Reyes · fact-finding prep', savedLabel: 'Saved 8m ago',
  },
  'leela-patel': {
    name: 'Leela Patel', initials: 'LP', segment: 'Term life · $1.2M face', signal: 'Annual review window opens',
    metric: '$1.2M face', tint: 'blue',
    headlineTail: "'s annual review window is open and her $1.2M term is the simplest cross-sell setup you have this month.",
    body: "Her household has grown — second dependent, new home. The $1.2M term has been right-sized for the household she had three years ago, not the one she has now.",
    badge: 'Cross-sell ready', confidence: 84,
    plan: [
      { label: 'Right-size the coverage', sub: 'Term ladder against new household' },
      { label: 'Offer the planning lens', sub: 'Education funding fits here too' },
      { label: 'Book the review call', sub: 'September window holds best' },
    ],
    primaryCta: 'Open coverage analysis',
    areas: [
      { title: 'Coverage right-sizing', copy: 'Household grew · term hasn\'t.' },
      { title: 'Education funding', copy: 'Older child age 9 · 529 not opened.' },
      { title: 'DI gap', copy: 'Dual-income household · neither covered.' },
      { title: 'Annual review timing', copy: 'September is the best month for her cycle.' },
    ],
    draft: {
      title: 'Annual review opener', eyebrow: 'September timing', salutation: 'Hi Leela,',
      body: "It's coming up on a year since we last sat down — and a lot has changed in your household. I'd love to walk through whether your current term still fits, and where the next layer should sit.\n\nSarah",
    },
    snapshot: [
      { label: 'Client since', value: '2018' }, { label: 'Active policies', value: '1 (term)' },
      { label: 'Face amount', value: '$1.2M' }, { label: 'Household', value: 'Married + 2' },
      { label: 'Last review', value: '11 months ago' }, { label: 'Premium', value: '$1,140/yr' },
    ],
    tags: ['Annual review window', 'Cross-sell ready', 'Multi-dependent'],
    title: 'Leela Patel · annual review window', savedLabel: 'Saved 14m ago',
  },
  'wei-chen': {
    name: 'Wei Chen', initials: 'WC', segment: 'Cross-sell open · life event', signal: 'Score jumped 23 → 41 after life event',
    metric: '$2.1K FYC', tint: 'orange',
    headlineTail: "'s engagement score jumped from 23 to 41 in one week — there's been a household change worth investigating.",
    body: "The lift is too sharp to be ambient. A new job, a baby, or a move shows up like this. Open with a curiosity question, not a pitch.",
    badge: 'Cross-sell open', confidence: 76,
    plan: [
      { label: 'Investigate the lift', sub: 'Curiosity, not assumption' },
      { label: 'Confirm the trigger', sub: 'Job, household, or location' },
      { label: 'Set the cross-sell ask', sub: 'Match the change to the product' },
    ],
    primaryCta: 'Draft curiosity outreach',
    areas: [
      { title: 'Score interpretation', copy: '+18 points in 7 days · structural, not seasonal.' },
      { title: 'Life-event match', copy: 'Top 3 candidates: new job, baby, move.' },
      { title: 'Cross-sell options', copy: 'Income protection if job · WL if baby · property if move.' },
      { title: 'Don\'t front-load product', copy: 'A pitch on the curiosity call burns the signal.' },
    ],
    draft: {
      title: 'Curiosity opener', eyebrow: 'No products on first contact', salutation: 'Hi Wei,',
      body: "I noticed you've been more active on our content recently and I wanted to check in. If something's shifted in the household — good or otherwise — I'd love a quick conversation to make sure your plan still matches.\n\nSarah",
    },
    snapshot: [
      { label: 'Client since', value: '2020' }, { label: 'Engagement score', value: '41 (+18 wk-over-wk)' },
      { label: 'Last open', value: '3 days ago' }, { label: 'Active policies', value: '2' },
      { label: 'Household', value: 'Married' }, { label: 'Signal class', value: 'Structural lift' },
    ],
    tags: ['Engagement spike', 'Cross-sell open', 'Life event'],
    title: 'Wei Chen · cross-sell opening', savedLabel: 'Saved 20m ago',
  },
  'noor-yehya': {
    name: 'Noor Yehya', initials: 'NY', segment: 'New dependent · birth signal', signal: 'Birth signal · 12 days ago',
    metric: 'Open intro', tint: 'blue',
    headlineTail: "'s household added a dependent 12 days ago — the protection conversation runs warmest in the first 60.",
    body: "Don't lead with insurance. Lead with congratulations and a 30-day window to revisit beneficiaries and coverage when she's ready. The right move is a paced sequence, not a single ask.",
    badge: 'Life event · birth', confidence: 81,
    plan: [
      { label: 'Send the warm note', sub: 'Congrats · no ask · 12 days in' },
      { label: 'Schedule the 30-day check', sub: 'Beneficiary + coverage review' },
      { label: 'Frame the 90-day plan', sub: 'Right product after the dust settles' },
    ],
    primaryCta: 'Draft warm note',
    areas: [
      { title: 'Congrats, not pitch', copy: 'Day 12 is too early for a product conversation.' },
      { title: 'Beneficiary update', copy: 'Three policies · all need to add the new dependent.' },
      { title: 'Coverage right-sizing', copy: 'Household needs reset around a new financial dependent.' },
      { title: '529 conversation', copy: 'Open it within the first 90 days.' },
    ],
    draft: {
      title: 'Warm note', eyebrow: 'No ask · just the door', salutation: 'Hi Noor,',
      body: "Just heard the news — congratulations to both of you. When the dust settles, I'd love to grab 20 minutes to walk through the beneficiary and coverage updates that come with a new household member. No rush — let me know when you're ready.\n\nSarah",
    },
    snapshot: [
      { label: 'Status', value: 'New dependent · 12 days' }, { label: 'Active policies', value: '3' },
      { label: 'Household', value: 'Married + 1 (new)' }, { label: 'Last touch', value: '5 weeks ago' },
      { label: 'Beneficiary update', value: 'Pending' }, { label: 'Coverage', value: 'Right-size due' },
    ],
    tags: ['New dependent', 'Birth signal', 'Warm window'],
    title: 'Noor Yehya · new dependent', savedLabel: 'Saved 5m ago',
  },
  'aanya-patel': {
    name: 'Aanya Patel', initials: 'AP', segment: 'Next-gen · turning 18 in September', signal: 'Turns 18 · September',
    metric: 'Locked rate', tint: 'green',
    headlineTail: " turns 18 in September — the rate she locks in now follows her for life.",
    body: "Leela's daughter. The right play is a one-time household conversation that includes Aanya as a participant — not a separate prospecting cycle. Locked rates at 18 are a generational gift.",
    badge: 'Next-gen activation', confidence: 70,
    plan: [
      { label: 'Loop in via Leela', sub: 'Household conversation · not solo' },
      { label: 'Frame the locked rate', sub: 'A gift, not a sale' },
      { label: 'Set the September call', sub: 'Two weeks before her birthday' },
    ],
    primaryCta: 'Draft household intro',
    areas: [
      { title: 'Through the parent', copy: 'Loop Leela in · don\'t reach Aanya cold.' },
      { title: 'Locked-rate framing', copy: 'A gift Leela is giving, not a referral.' },
      { title: 'Term ladder', copy: '20-year at 18 follows her through her 30s.' },
      { title: 'Next-gen pipeline', copy: 'Open a content drip · this cohort runs warm.' },
    ],
    draft: {
      title: 'Household intro', eyebrow: 'Through Leela', salutation: 'Hi Leela,',
      body: "Quick one — Aanya turns 18 in September, and the rate she locks in this year is one she carries forever. Want me to draft a 15-minute walkthrough for the three of us? No pressure either way.\n\nSarah",
    },
    snapshot: [
      { label: 'Status', value: 'Next-gen · age 17' }, { label: 'Parent', value: 'Leela Patel' },
      { label: 'Birthday', value: 'September' }, { label: 'Health', value: 'Insurable' },
      { label: 'Rate window', value: 'Locks September' }, { label: 'Source', value: 'Household' },
    ],
    tags: ['Next-gen', 'Locked rate', 'Household'],
    title: 'Aanya Patel · next-gen activation', savedLabel: 'Saved 22m ago',
  },
  'sam-bennett': {
    name: 'Sam Bennett', initials: 'SB', segment: 'Stable · 8-year client', signal: 'NPS 9 on last review',
    metric: '8 yrs', tint: 'green',
    headlineTail: " is the kind of client you don't want to over-touch — but a 30-minute warmth call keeps him in the referral seat.",
    body: "His coverage is right, his household is stable, and his NPS is 9. The job here is presence, not pressure. Mention Marcus Rosenthal in passing — referrals come from the in-between.",
    badge: 'Stable · maintain', confidence: 65,
    plan: [
      { label: 'Schedule a warmth call', sub: 'Presence, not pressure' },
      { label: 'Surface the referral seat', sub: 'Mention Rosenthal in passing' },
      { label: 'Confirm no admin needs', sub: 'Quiet check on beneficiaries' },
    ],
    primaryCta: 'Draft warmth check-in',
    areas: [
      { title: 'Presence over pitch', copy: 'Over-touch breaks trust on stable households.' },
      { title: 'Referral seat', copy: 'Mention Rosenthal · plant, don\'t harvest.' },
      { title: 'Beneficiary check', copy: 'Worth a 30-second confirm — every two years.' },
      { title: 'NPS sustaining', copy: 'A 9 is a renewal, not a finish line.' },
    ],
    draft: {
      title: 'Warmth call', eyebrow: 'Stable · low-pressure', salutation: 'Hi Sam,',
      body: "It's been a quiet stretch, which is a good thing — I just wanted to keep our connection warm and make sure nothing on your household has shifted. 20 minutes when it suits.\n\nSarah",
    },
    snapshot: [
      { label: 'Client since', value: '2018' }, { label: 'Active policies', value: '3' },
      { label: 'NPS', value: '9' }, { label: 'Last review', value: '11 months ago' },
      { label: 'Household', value: 'Married + 2' }, { label: 'Tier', value: 'Stable' },
    ],
    tags: ['Stable', 'NPS 9', 'Referral seat'],
    title: 'Sam Bennett · maintain warmth', savedLabel: 'Saved 1h ago',
  },
  'omar-hadi': {
    name: 'Omar Hadi', initials: 'OH', segment: 'Stable · light-touch', signal: 'No-touch 30 days',
    metric: '6 yrs', tint: 'green',
    headlineTail: " is a quiet, stable client at the 30-day no-touch mark — a brief, low-friction note keeps the line warm.",
    body: "Doesn't need a meeting. Doesn't need a review. He needs to know you're there, and a one-line check-in costs nothing. The 60-day mark is when silence gets noticed.",
    badge: 'Light-touch', confidence: 60,
    plan: [
      { label: 'Send a 2-line note', sub: 'No ask · no agenda' },
      { label: 'Log the touch', sub: 'Reset the 60-day clock' },
      { label: 'Watch for reply', sub: 'A response unlocks the call' },
    ],
    primaryCta: 'Draft 2-line note',
    areas: [
      { title: 'Light touch', copy: 'A 30-day touch is presence, not action.' },
      { title: 'Cycle hygiene', copy: 'Keeps him out of the 90-day drift bucket.' },
      { title: 'Annual review timing', copy: 'Next review window opens in 4 months.' },
      { title: 'Beneficiary check', copy: 'Worth a passive confirm in the next contact.' },
    ],
    draft: {
      title: '2-line note', eyebrow: 'Email · low-friction', salutation: 'Hi Omar,',
      body: "Just a quick hello to keep us connected. If anything's come up on the household side, I'm a reply away — otherwise, all good on my end.\n\nSarah",
    },
    snapshot: [
      { label: 'Client since', value: '2020' }, { label: 'Active policies', value: '2' },
      { label: 'Last touch', value: '30 days ago' }, { label: 'Household', value: 'Married' },
      { label: 'Coverage', value: 'Right-sized' }, { label: 'Tier', value: 'Stable' },
    ],
    tags: ['Stable', 'Light-touch', '30-day window'],
    title: 'Omar Hadi · light-touch check-in', savedLabel: 'Saved 2h ago',
  },
  'tara-odonnell': {
    name: "Tara O'Donnell", initials: 'TO', segment: 'Annual review · Tuesday 2 PM', signal: 'Scheduled · Tuesday 2 PM',
    metric: 'Prepped', tint: 'green',
    headlineTail: "'s annual review is on the calendar for Tuesday — the pack is already prepped and worth a final pass.",
    body: "Stable client, good shape. The conversation should focus on goal-tracking, not coverage adjustment. Plenty of room to introduce the next-gen conversation if her daughter comes up.",
    badge: 'Annual review', confidence: 86,
    plan: [
      { label: 'Final pass on the pack', sub: 'Pre-Tuesday polish' },
      { label: 'Lead with goal-tracking', sub: 'Last year\'s map · this year\'s reality' },
      { label: 'Plant the next-gen seed', sub: 'If her daughter comes up' },
    ],
    primaryCta: 'Open meeting pack',
    areas: [
      { title: 'Goal-tracking lead', copy: 'The story is progress, not adjustment.' },
      { title: 'Next-gen seed', copy: 'Daughter is 19 · locked-rate window open.' },
      { title: 'Estate-line check', copy: 'Beneficiary review · routine, not urgent.' },
      { title: 'Education funding', copy: '529 sits at 38% of target.' },
    ],
    draft: {
      title: 'Pre-meeting note', eyebrow: 'Send Monday afternoon', salutation: 'Hi Tara,',
      body: "Looking forward to Tuesday. I'll send the pack ahead and we can spend the call talking about progress against last year's goal map. No surprises, just a clean review.\n\nSarah",
    },
    snapshot: [
      { label: 'Client since', value: '2015' }, { label: 'Active policies', value: '4' },
      { label: 'Household', value: 'Married + 1' }, { label: 'Last review', value: '12 months ago' },
      { label: 'NPS', value: '8' }, { label: 'Tier', value: 'Stable · top quintile' },
    ],
    tags: ['Annual review', 'Prepped', 'Next-gen seed'],
    title: "Tara O'Donnell · annual review prep", savedLabel: 'Saved 18m ago',
  },
  'kai-park': {
    name: 'Kai Park', initials: 'KP', segment: 'New household · move-in', signal: 'Move-in detected · activate',
    metric: 'Activate', tint: 'green',
    headlineTail: " just moved into the household — the welcome sequence triggers and the first 30 days are the window for activation.",
    body: "Newly added household member. Standard activation playbook applies: warm intro, household orientation, soft beneficiary review. Don't sell — orient.",
    badge: 'Activation', confidence: 73,
    plan: [
      { label: 'Run the welcome sequence', sub: 'Day 0, 7, 21' },
      { label: 'Schedule the household orient', sub: '30-minute call · no products' },
      { label: 'Soft beneficiary review', sub: 'Builds insurability runway' },
    ],
    primaryCta: 'Send welcome sequence',
    areas: [
      { title: 'Welcome sequence', copy: 'Three touches in the first 21 days.' },
      { title: 'Household orient', copy: 'A 30-minute call that maps the household.' },
      { title: 'Insurability runway', copy: 'Soft beneficiary review opens the door.' },
      { title: 'Long-cycle planning', copy: 'First 90 days frame the next 5 years.' },
    ],
    draft: {
      title: 'Welcome', eyebrow: 'Day-of move-in', salutation: 'Hi Kai,',
      body: "Welcome — really glad to have you in the household. Over the next few weeks I'll send a couple of light pieces, and when you're settled in, I'd love a 30-minute call to walk through how I can be useful.\n\nSarah",
    },
    snapshot: [
      { label: 'Status', value: 'New household · day 0' }, { label: 'Source', value: 'Move-in' },
      { label: 'Active policies', value: '0' }, { label: 'Sequence', value: 'Welcome · day 0/7/21' },
      { label: 'Orient call', value: 'Pending' }, { label: 'Tier', value: 'Activation' },
    ],
    tags: ['New household', 'Activation', 'Welcome sequence'],
    title: 'Kai Park · new household activation', savedLabel: 'Saved 3m ago',
  },
}

/* Default 4-card layout (opp · areas · draft · snapshot) used by the generator. */
const FALLBACK_CARDS: CanvasCard[] = [
  { id: 'opp',      type: 'opportunity',           pos: { x: 40,   y: 40  } },
  { id: 'photo',    type: 'photo',                 pos: { x: 840,  y: 40  } },
  { id: 'areas',    type: 'opportunity-areas',     pos: { x: 40,   y: 600 } },
  { id: 'draft',    type: 'outreach-draft',        pos: { x: 500,  y: 600 } },
  { id: 'snapshot', type: 'relationship-snapshot', pos: { x: 1140, y: 600 } },
]

function specForId(id: string | null | undefined): DeepDiveSpec | null {
  if (!id) return null
  if (SPECS[id]) return SPECS[id]
  const seed = FALLBACK_CLIENTS[id]
  if (!seed) return null
  return { id, title: seed.title, savedLabel: seed.savedLabel, cards: FALLBACK_CARDS }
}

function fallbackContent(seed: FallbackSeed): CanvasContent {
  return {
    opp: {
      badge: seed.badge,
      confidence: seed.confidence,
      nameLink: seed.name,
      headline: seed.headlineTail,
      body: seed.body,
      metrics: {
        propensity: { value: `${seed.confidence}%`, tone: seed.confidence >= 75 ? 'good' : 'warn' },
        engagement: { value: seed.signal, tone: 'ok' },
        fyc: { value: seed.metric, tone: 'ok' },
      },
      plan: seed.plan,
      primaryCta: seed.primaryCta,
    },
    areas: seed.areas,
    draft: seed.draft,
    snapshot: seed.snapshot,
    photo: { name: seed.name, subtitle: seed.segment, tags: seed.tags, initials: seed.initials, tint: seed.tint },
  }
}

export function ActionDeepDive() {
  const id = useAppStore((s) => s.deepDive)
  const close = useAppStore((s) => s.closeDeepDive)
  const [view, setView] = useState<ViewMode>('canvas')
  const [mode, setMode] = useState<Mode>('pan')

  /* Per-session card layout, zoom, pan and annotation state */
  const [cardPositions, setCardPositions] = useState<Record<string, Pos>>({})
  const [paths, setPaths] = useState<Path[]>([])
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })

  /* Selection — for scoped Nyla chat */
  const [selected, setSelected] = useState<string[]>([])

  /* User-created nodes — added via the "+ Node" button. Editable until Confirm. */
  const [userNodes, setUserNodes] = useState<UserNode[]>([])

  function spawnUserNodes(kind: UserNodeKind) {
    setUserNodes((prev) => {
      const baseX = prev.length === 0 ? 40   : Math.max(...prev.map((n) => n.x)) + 320
      const baseY = prev.length === 0 ? 1140 : Math.max(...prev.map((n) => n.y))
      return [
        ...prev,
        {
          id: `user-${Date.now()}`,
          x: baseX,
          y: baseY,
          locked: false,
          ...DEFAULT_NODE_PAYLOAD[kind],
        },
      ]
    })
  }
  function updateUserNode(id: string, patch: Partial<UserNode>) {
    setUserNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)))
  }
  function removeUserNode(id: string) {
    setUserNodes((prev) => prev.filter((n) => n.id !== id))
  }

  const spec = specForId(id)

  function toggleSelect(cardId: string, additive: boolean) {
    setSelected((prev) => {
      if (additive) {
        return prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
      }
      /* Replace selection (or clear if clicking the only selected one) */
      if (prev.length === 1 && prev[0] === cardId) return []
      return [cardId]
    })
  }

  /* Reset transient state when entering a deep dive. Keyed on the id (and not
   * `spec`) because `specForId` builds a fresh object every render — depending
   * on `spec` would re-run the effect on every render and reset card positions
   * mid-drag, which is why drag appeared to "snap back" to spec positions. */
  useEffect(() => {
    if (!spec) return
    setView('canvas')
    setMode('pan')
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setPaths([])
    setSelected([])
    setUserNodes([])
    setCardPositions(Object.fromEntries(spec.cards.map((c) => [c.id, c.pos])))
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, close])

  /* Tom Anderson uses a guided 3-step canvas — different from the spatial canvas. */
  if (id === 'tom-anderson') {
    return (
      <AnimatePresence>
        <motion.div
          key="tom-guided"
          role="dialog"
          aria-label="Tom Anderson"
          className="fixed inset-0 z-[150] flex flex-col bg-[#ecebe7]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
        >
          <TomGuidedCanvas />
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      {spec && (
        <motion.div
          key="deepdive"
          role="dialog"
          aria-label={spec.title}
          className="fixed inset-0 z-[150] flex flex-col bg-[#ecebe7]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
        >
          {/* Top bar */}
          <div className="flex items-center gap-4 border-b border-neutral-200 bg-white/85 px-8 py-4 backdrop-blur-sm md:px-12">
            <button
              type="button"
              onClick={close}
              className="flex items-center gap-2 text-[13px] font-medium text-neutral-700 hover:text-neutral-900"
            >
              <span aria-hidden="true">←</span>
              <span className="font-serif text-[18px] tracking-tight text-neutral-900">{spec.title}</span>
            </button>
            <p className="ml-2 text-[11px] uppercase tracking-[0.22em] text-neutral-400">
              {spec.savedLabel}
            </p>
            {mode === 'annotate' && view === 'canvas' && (
              <span className="inline-flex items-center gap-2 rounded-full bg-[var(--nyl-blue-100)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--nyl-blue-800)]">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-[var(--nyl-blue-500)]" />
                Annotating — click & drag
              </span>
            )}
            {/* Menu section — tool pill + view pill + AI launcher, all together */}
            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-0.5 rounded-full bg-white px-1.5 py-1 shadow-[0_8px_22px_-16px_rgba(0,10,98,0.32)] ring-1 ring-neutral-200/70">
                <DockToggle active={mode === 'pan'} onClick={() => setMode('pan')} label="Pan">
                  <HandIcon />
                </DockToggle>
                <DockToggle
                  active={mode === 'annotate'}
                  onClick={() => setMode(mode === 'annotate' ? 'pan' : 'annotate')}
                  label="Annotate"
                >
                  <AnnotateIcon />
                </DockToggle>
                <DockToggle
                  onClick={paths.length > 0 ? () => setPaths([]) : undefined}
                  label="Clear ink"
                >
                  <RefreshIcon />
                </DockToggle>
              </div>
              <div className="flex items-center gap-0.5 rounded-full bg-white px-1.5 py-1 shadow-[0_8px_22px_-16px_rgba(0,10,98,0.32)] ring-1 ring-neutral-200/70">
                <DockToggle active={view === 'list'} onClick={() => setView('list')} label="List view">
                  <ListIcon />
                </DockToggle>
                <DockToggle active={view === 'canvas'} onClick={() => setView('canvas')} label="Canvas view">
                  <CanvasIcon />
                </DockToggle>
              </div>
              <CollabLauncher />
            </div>
          </div>

          {/* Body */}
          <div className="relative flex-1 overflow-hidden dot-ground">
            {view === 'canvas' ? (
              <CanvasView
                spec={spec}
                mode={mode}
                zoom={zoom}
                setZoom={setZoom}
                pan={pan}
                setPan={setPan}
                cardPositions={cardPositions}
                setCardPositions={setCardPositions}
                paths={paths}
                setPaths={setPaths}
                selected={selected}
                onToggleSelect={toggleSelect}
                userNodes={userNodes}
                onUpdateUserNode={updateUserNode}
                onRemoveUserNode={removeUserNode}
              />
            ) : (
              <ListView spec={spec} selected={selected} onToggleSelect={toggleSelect} />
            )}

            {/* Scoped Nyla panel — slides in when any tile is selected */}
            <ScopedCoachPanel
              spec={spec}
              selected={selected}
              onClear={() => setSelected([])}
            />
          </div>

          {/* Bottom dock */}
          <BottomDock
            view={view}
            zoom={zoom}
            onAddNodes={spawnUserNodes}
            userNodeCount={userNodes.length}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ----------------------------------------------------------------------------
 * Canvas
 * -------------------------------------------------------------------------- */

function CanvasView({
  spec,
  mode,
  zoom,
  setZoom,
  pan,
  setPan,
  cardPositions,
  setCardPositions,
  paths,
  setPaths,
  selected,
  onToggleSelect,
  userNodes,
  onUpdateUserNode,
  onRemoveUserNode,
}: {
  spec: DeepDiveSpec
  mode: Mode
  zoom: number
  setZoom: (z: number) => void
  pan: Pos
  setPan: (p: Pos | ((p: Pos) => Pos)) => void
  cardPositions: Record<string, Pos>
  setCardPositions: React.Dispatch<React.SetStateAction<Record<string, Pos>>>
  paths: Path[]
  setPaths: React.Dispatch<React.SetStateAction<Path[]>>
  selected: string[]
  onToggleSelect: (id: string, additive: boolean) => void
  userNodes: UserNode[]
  onUpdateUserNode: (id: string, patch: Partial<UserNode>) => void
  onRemoveUserNode: (id: string) => void
}) {
  const userDrag = useRef<{ id: string; startPointer: Pos; startPos: Pos } | null>(null)
  function startUserDrag(id: string, e: React.PointerEvent) {
    if (mode === 'annotate') return
    e.stopPropagation()
    const n = userNodes.find((u) => u.id === id)
    if (!n) return
    userDrag.current = { id, startPointer: { x: e.clientX, y: e.clientY }, startPos: { x: n.x, y: n.y } }
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch { /* no-op */ }
  }
  function moveUserDrag(e: React.PointerEvent) {
    if (!userDrag.current) return
    const dx = (e.clientX - userDrag.current.startPointer.x) / zoom
    const dy = (e.clientY - userDrag.current.startPointer.y) / zoom
    onUpdateUserNode(userDrag.current.id, {
      x: userDrag.current.startPos.x + dx,
      y: userDrag.current.startPos.y + dy,
    })
  }
  function endUserDrag() { userDrag.current = null }
  const viewportRef = useRef<HTMLDivElement>(null)
  const panDrag = useRef<{ x: number; y: number; pan: Pos } | null>(null)
  const cardDrag = useRef<{ id: string; startPointer: Pos; startPos: Pos } | null>(null)
  const [currentPath, setCurrentPath] = useState<Path | null>(null)

  function screenToCanvas(clientX: number, clientY: number): Pos {
    const rect = viewportRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return { x: (clientX - rect.left - pan.x) / zoom, y: (clientY - rect.top - pan.y) / zoom }
  }

  /* Keep current zoom/pan reachable from the long-lived wheel listener via
   * refs — otherwise we'd have to tear down + re-attach on every state change. */
  const zoomRef = useRef(zoom)
  const panRef = useRef(pan)
  useEffect(() => { zoomRef.current = zoom }, [zoom])
  useEffect(() => { panRef.current = pan }, [pan])

  /* Native wheel listener — passive: false so we can preventDefault for
   * trackpad pinch (ctrlKey) and two-finger pan. Attached once for the
   * lifetime of the view; reads from refs above. */
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    function handler(e: WheelEvent) {
      const rect = el!.getBoundingClientRect()
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top

      if (e.ctrlKey || e.metaKey) {
        /* Pinch zoom (browsers send ctrlKey on trackpad pinch) */
        e.preventDefault()
        const z = zoomRef.current
        const p = panRef.current
        const next = Math.max(0.35, Math.min(2.5, z * Math.exp(-e.deltaY * 0.0018)))
        if (next === z) return
        const k = next / z
        setPan({
          x: px - (px - p.x) * k,
          y: py - (py - p.y) * k,
        })
        setZoom(next)
      } else {
        e.preventDefault()
        setPan((p) => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }))
      }
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [setPan, setZoom])

  /* Background pointer handlers — pan or draw depending on mode. We allow pan
   * from anywhere on the canvas EXCEPT when the pointer lands inside a card or
   * user node (those have their own drag/edit affordances). Right-click is
   * left alone for any future context-menu. */
  function onBgPointerDown(e: React.PointerEvent) {
    if (e.button === 2) return
    const target = e.target as HTMLElement | null
    if (target && (target.closest('[data-canvas-card]') || target.closest('[data-user-node]'))) return
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch { /* no-op */ }
    if (mode === 'annotate') {
      const p = screenToCanvas(e.clientX, e.clientY)
      setCurrentPath({ id: Date.now() + Math.random(), points: [p] })
    } else {
      panDrag.current = { x: e.clientX, y: e.clientY, pan }
    }
  }
  function onBgPointerMove(e: React.PointerEvent) {
    if (cardDrag.current) return
    if (mode === 'annotate' && currentPath) {
      const p = screenToCanvas(e.clientX, e.clientY)
      setCurrentPath({ id: currentPath.id, points: [...currentPath.points, p] })
      return
    }
    if (!panDrag.current) return
    setPan({
      x: panDrag.current.pan.x + (e.clientX - panDrag.current.x),
      y: panDrag.current.pan.y + (e.clientY - panDrag.current.y),
    })
  }
  function onBgPointerUp(e: React.PointerEvent) {
    if (mode === 'annotate' && currentPath) {
      if (currentPath.points.length > 1) setPaths((arr) => [...arr, currentPath])
      setCurrentPath(null)
    }
    panDrag.current = null
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* no-op */
    }
  }

  function startCardDrag(id: string, e: React.PointerEvent) {
    if (mode === 'annotate') return
    e.stopPropagation()
    /* Resolve the starting position from current state — if the card has never
     * been moved, fall back to its spec position, NOT (0, 0). */
    const specPos = spec.cards.find((c) => c.id === id)?.pos ?? { x: 0, y: 0 }
    const startPos = cardPositions[id] ?? specPos
    cardDrag.current = { id, startPointer: { x: e.clientX, y: e.clientY }, startPos }
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* no-op — some browsers throw if the element isn't capturable. */
    }
  }
  function moveCardDrag(e: React.PointerEvent) {
    if (!cardDrag.current) return
    const dx = (e.clientX - cardDrag.current.startPointer.x) / zoom
    const dy = (e.clientY - cardDrag.current.startPointer.y) / zoom
    const id = cardDrag.current.id
    setCardPositions((prev) => ({
      ...prev,
      [id]: { x: cardDrag.current!.startPos.x + dx, y: cardDrag.current!.startPos.y + dy },
    }))
  }
  function endCardDrag() {
    cardDrag.current = null
  }

  return (
    <div
      ref={viewportRef}
      onPointerDown={onBgPointerDown}
      onPointerMove={onBgPointerMove}
      onPointerUp={onBgPointerUp}
      onPointerCancel={onBgPointerUp}
      className={[
        'absolute inset-0 select-none',
        mode === 'annotate' ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing',
      ].join(' ')}
      style={{ touchAction: 'none' }}
    >
      <div
        className="absolute"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          willChange: 'transform',
        }}
      >
        {/* Cards */}
        {spec.cards.map((c) => {
          const pos = cardPositions[c.id] ?? c.pos
          const isSelected = selected.includes(c.id)
          return (
            <div
              key={c.id}
              className="absolute"
              style={{ left: pos.x, top: pos.y }}
            >
              <CardWrapper
                disabled={mode === 'annotate'}
                selected={isSelected}
                onGripDown={(e) => startCardDrag(c.id, e)}
                onChat={(e) => onToggleSelect(c.id, e.shiftKey)}
                onPointerMove={moveCardDrag}
                onPointerUp={endCardDrag}
                onPointerCancel={endCardDrag}
              >
                {renderCard(c.type, contentFor(spec.id))}
              </CardWrapper>
            </div>
          )
        })}

        {/* User-created nodes — editable until Confirm. Drag, edit, lock. */}
        {userNodes.map((n) => (
          <div key={n.id} className="absolute" style={{ left: n.x, top: n.y }}>
            <UserNodeCard
              node={n}
              disabled={mode === 'annotate'}
              onGripDown={(e) => startUserDrag(n.id, e)}
              onPointerMove={moveUserDrag}
              onPointerUp={endUserDrag}
              onPointerCancel={endUserDrag}
              onChange={(patch) => onUpdateUserNode(n.id, patch)}
              onRemove={() => onRemoveUserNode(n.id)}
            />
          </div>
        ))}

        {/* Annotation overlay — SVG inside the transformed parent so ink pans + zooms with cards */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{ left: -2000, top: -2000, width: 6000, height: 6000, overflow: 'visible' }}
        >
          {paths.map((p) => (
            <PathPoly key={p.id} path={p} offsetX={2000} offsetY={2000} />
          ))}
          {currentPath && currentPath.points.length > 0 && (
            <PathPoly path={currentPath} offsetX={2000} offsetY={2000} />
          )}
        </svg>
      </div>
    </div>
  )
}

function PathPoly({ path, offsetX, offsetY }: { path: Path; offsetX: number; offsetY: number }) {
  const points = path.points.map((p) => `${p.x + offsetX},${p.y + offsetY}`).join(' ')
  return (
    <polyline
      points={points}
      fill="none"
      stroke="var(--nyl-blue-500)"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

function CardWrapper({
  children,
  disabled,
  selected,
  onGripDown,
  onChat,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: {
  children: React.ReactNode
  disabled?: boolean
  selected?: boolean
  onGripDown: (e: React.PointerEvent) => void
  onChat: (e: React.MouseEvent) => void
  onPointerMove: (e: React.PointerEvent) => void
  onPointerUp: (e: React.PointerEvent) => void
  onPointerCancel: (e: React.PointerEvent) => void
}) {
  return (
    <div
      data-canvas-card
      className={[
        'relative rounded-2xl transition-shadow',
        selected ? 'ring-2 ring-[var(--nyl-blue-500)] ring-offset-2 ring-offset-[#ecebe7]' : '',
      ].join(' ')}
      style={{ pointerEvents: disabled ? 'none' : 'auto' }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {children}

      {/* Chat bubble — always-visible when selected, on-hover otherwise */}
      <button
        type="button"
        aria-label="Chat with Nyla about this tile"
        title={selected ? 'Selected · click to deselect (shift to multi-select)' : 'Chat with Nyla (shift to multi-select)'}
        onClick={onChat}
        className={[
          'absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full text-white shadow-[0_6px_16px_-6px_rgba(4,104,255,0.6)] transition-all',
          selected
            ? 'bg-[var(--nyl-blue-500)] ring-4 ring-[var(--nyl-blue-100)] opacity-100'
            : 'bg-[var(--nyl-blue-500)] opacity-0 hover:bg-[var(--nyl-blue-600)] [.relative:hover>&]:opacity-100',
        ].join(' ')}
      >
        <ChatBubbleIcon />
      </button>

      {/* Drag handle — bottom of the top-right cluster */}
      <button
        type="button"
        aria-label="Move card"
        title="Drag to move"
        onPointerDown={onGripDown}
        className="absolute right-12 top-3 z-10 flex size-7 items-center justify-center rounded-md border border-transparent bg-white/90 text-neutral-400 opacity-0 transition-opacity hover:border-neutral-200 hover:text-neutral-900 [.relative:hover>&]:opacity-100"
        style={{ cursor: 'grab' }}
      >
        <GripIcon />
      </button>
    </div>
  )
}

function ChatBubbleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 4 H15 a1.4 1.4 0 0 1 1.4 1.4 V11 a1.4 1.4 0 0 1 -1.4 1.4 H8 L5 15 V12.4 H3 a1.4 1.4 0 0 1 -1.4 -1.4 V5.4 A1.4 1.4 0 0 1 3 4 Z" />
    </svg>
  )
}

function GripIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
      <circle cx="3" cy="3" r="1" />
      <circle cx="9" cy="3" r="1" />
      <circle cx="3" cy="6" r="1" />
      <circle cx="9" cy="6" r="1" />
      <circle cx="3" cy="9" r="1" />
      <circle cx="9" cy="9" r="1" />
    </svg>
  )
}

function ListView({
  spec,
  selected,
  onToggleSelect,
}: {
  spec: DeepDiveSpec
  selected: string[]
  onToggleSelect: (id: string, additive: boolean) => void
}) {
  /* Two-column layout: photo (image) tile leads the left column, the Opportunity
   * tile leads the right column so they sit beside each other; remaining tiles
   * stack alternately down the two columns. Tiles keep their intrinsic widths. */
  const photoCard = spec.cards.find((c) => c.type === 'photo')
  const oppCard = spec.cards.find((c) => c.type === 'opportunity')
  const rest = spec.cards.filter((c) => c !== photoCard && c !== oppCard)
  const leftCol = [photoCard, ...rest.filter((_, i) => i % 2 === 0)].filter(Boolean) as CanvasCard[]
  const rightCol = [oppCard, ...rest.filter((_, i) => i % 2 === 1)].filter(Boolean) as CanvasCard[]

  const renderTile = (c: CanvasCard) => {
    const isSelected = selected.includes(c.id)
    return (
      <div
        key={c.id}
        className={[
          'relative rounded-2xl',
          isSelected ? 'ring-2 ring-[var(--nyl-blue-500)] ring-offset-2 ring-offset-[#ecebe7]' : '',
        ].join(' ')}
      >
        {renderCard(c.type, contentFor(spec.id))}
        <button
          type="button"
          aria-label="Chat with Nyla about this tile"
          title={isSelected ? 'Selected · click to deselect' : 'Chat with Nyla (shift to multi-select)'}
          onClick={(e) => onToggleSelect(c.id, e.shiftKey)}
          className={[
            'absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full text-white shadow-[0_6px_16px_-6px_rgba(4,104,255,0.6)] transition-all',
            isSelected
              ? 'bg-[var(--nyl-blue-500)] ring-4 ring-[var(--nyl-blue-100)] opacity-100'
              : 'bg-[var(--nyl-blue-500)] opacity-0 hover:bg-[var(--nyl-blue-600)] [.relative:hover>&]:opacity-100',
          ].join(' ')}
        >
          <ChatBubbleIcon />
        </button>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 overflow-y-auto px-8 py-10 md:px-12 md:py-12">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-start justify-center gap-5">
        <div className="flex flex-col items-start gap-5">{leftCol.map(renderTile)}</div>
        <div className="flex flex-col items-start gap-5">{rightCol.map(renderTile)}</div>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------------------
 * Card renderers
 * -------------------------------------------------------------------------- */

function renderCard(type: CardType, content: CanvasContent) {
  switch (type) {
    case 'opportunity':
      return <OpportunityMini content={content} />
    case 'opportunity-areas':
      return <OpportunityAreas content={content} />
    case 'outreach-draft':
      return <OutreachDraftMini content={content} />
    case 'relationship-snapshot':
      return <RelationshipSnapshot content={content} />
    case 'photo':
      return <PhotoNode content={content} />
    default:
      return null
  }
}

function OpportunityMini({ content }: { content: CanvasContent }) {
  const { opp } = content
  return (
    <div className="w-[760px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-30px_rgba(0,10,98,0.22)]">
      <div className="grid grid-cols-12 gap-6 p-6 pr-7 md:p-7">
        {/* Left — narrative + metrics */}
        <div className="col-span-12 pr-12 md:col-span-7 md:pr-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EFE7FA] px-2.5 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.18em] text-[#5E2DAA]">
              <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-[#7C3AED]" />
              {opp.badge}
            </span>
            <span className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-neutral-400">
              {opp.confidence}% confidence
            </span>
          </div>
          <h2
            className="mt-4 font-serif text-[22px] leading-[1.22] tracking-tight text-neutral-900"
            style={{ fontWeight: 400, textWrap: 'balance' }}
          >
            <span className="text-[var(--nyl-blue-500)]">{opp.nameLink}</span>{opp.headline}
          </h2>
          <p className="mt-3 text-[13.5px] leading-[1.55] text-neutral-700">{opp.body}</p>

          <div className="mt-6 grid grid-cols-3 gap-5">
            <MetricBar label="Propensity" value={opp.metrics.propensity.value} tone={opp.metrics.propensity.tone} />
            <MetricBar label="Engagement" value={opp.metrics.engagement.value} tone={opp.metrics.engagement.tone} />
            <MetricBar label="FYC opp" value={opp.metrics.fyc.value} tone={opp.metrics.fyc.tone} />
          </div>
        </div>

        {/* Right — Plan column with timeline + primary CTA */}
        <div className="col-span-12 border-t border-neutral-100 pt-5 md:col-span-5 md:border-l md:border-t-0 md:pl-6 md:pt-0">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-neutral-400">Plan</p>
          <ol className="mt-4 flex flex-col gap-3.5">
            {opp.plan.map((step, i) => {
              const active = i === 0
              return (
                <li key={step.label} className="flex items-start gap-3">
                  <span aria-hidden="true" className="mt-1 flex flex-col items-center">
                    <span
                      className={[
                        'inline-block size-2.5 rounded-full',
                        active ? 'bg-[var(--nyl-blue-500)] ring-4 ring-[var(--nyl-blue-100)]' : 'bg-neutral-300',
                      ].join(' ')}
                    />
                    {i < opp.plan.length - 1 && (
                      <span className="mt-1 inline-block h-6 w-px bg-neutral-200" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className={['text-[13.5px] leading-snug', active ? 'font-medium text-neutral-900' : 'text-neutral-700'].join(' ')}>
                      {step.label}
                    </p>
                    <p className="mt-0.5 text-[12px] text-neutral-500">{step.sub}</p>
                  </div>
                </li>
              )
            })}
          </ol>
          <PrimaryCtaButton label={opp.primaryCta} />
        </div>
      </div>
    </div>
  )
}

/* Route the primary opportunity CTA to the right experience. "Start the
 * X-min drill" launches the CoachDrill overlay; everything else is just
 * the visual confirmation for now. */
function PrimaryCtaButton({ label }: { label: string }) {
  const openCoachDrill = useAppStore((s) => s.openCoachDrill)
  const lower = label.toLowerCase()
  const drillId = lower.includes('drill') && lower.includes('helena') ? 'helena-holistic'
    : lower.includes('drill') ? 'helena-holistic'
    : lower.includes('retirement-income') || lower.includes('reyes') ? 'reyes-retirement-objection'
    : null
  return (
    <button
      type="button"
      onClick={() => { if (drillId) openCoachDrill(drillId) }}
      className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-[var(--nyl-blue-500)] px-4 py-3 text-[13px] font-semibold text-white hover:bg-[var(--nyl-blue-600)]"
    >
      {label}
    </button>
  )
}

function MetricBar({ label, value, tone }: { label: string; value: string; tone: 'good' | 'warn' | 'ok' }) {
  const barColor = tone === 'good' ? '#1ab382' : tone === 'warn' ? 'var(--nyl-orange-400)' : 'var(--nyl-blue-500)'
  const textColor = tone === 'good' ? '#0f7a4a' : tone === 'warn' ? '#c47b1f' : 'var(--nyl-blue-600)'
  /* Derive a pseudo-fill from the value text so bars look proportional. */
  const numeric = parseFloat(value.replace(/[^0-9.\-]/g, ''))
  const fill = isNaN(numeric) ? 65 : Math.max(15, Math.min(95, Math.abs(numeric) > 5 ? Math.abs(numeric) : Math.abs(numeric) * 10 + 50))
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-400">{label}</p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full rounded-full" style={{ width: `${fill}%`, background: barColor }} />
      </div>
      <p className="mt-1.5 text-[12px] font-medium" style={{ color: textColor }}>{value}</p>
    </div>
  )
}

function PhotoNode({ content }: { content: CanvasContent }) {
  const { photo } = content
  const tintBg = photo.tint === 'green' ? '#1ab382' : photo.tint === 'orange' ? 'var(--nyl-orange-400)' : photo.tint === 'purple' ? 'var(--nyl-purple-700)' : 'var(--nyl-blue-500)'
  const tintSoft = photo.tint === 'green' ? '#ddf5e8' : photo.tint === 'orange' ? 'var(--nyl-orange-100)' : photo.tint === 'purple' ? 'rgba(112,40,164,0.12)' : 'var(--nyl-blue-100)'
  return (
    <div className="w-[300px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-30px_rgba(0,10,98,0.22)]">
      <div className="relative aspect-[5/4] w-full" style={{ background: tintSoft }}>
        {/* Stylized "photo" — initials over a tinted gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              `radial-gradient(circle at 30% 35%, ${tintBg}55 0%, transparent 60%), radial-gradient(circle at 80% 70%, ${tintBg}38 0%, transparent 70%)`,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex size-20 items-center justify-center rounded-full font-serif text-[28px] tracking-tight text-white shadow-[0_12px_28px_-12px_rgba(0,10,98,0.35)]"
            style={{ background: tintBg }}
          >
            {photo.initials}
          </div>
        </div>
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500 backdrop-blur-sm">
          Photo
        </span>
      </div>
      <div className="p-5">
        <p className="font-serif text-[18px] leading-tight tracking-tight text-neutral-900">{photo.name}</p>
        <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400">{photo.subtitle}</p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {photo.tags.map((t) => (
            <li key={t} className="rounded-full border border-neutral-200 px-2 py-0.5 text-[10.5px] text-neutral-600">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}


function OpportunityAreas({ content }: { content: CanvasContent }) {
  return (
    <div className="w-[420px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-30px_rgba(0,10,98,0.22)]">
      <div className="p-6 pr-12">
        <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-400">
          Opportunity areas
        </p>
        <ul className="mt-4 flex flex-col divide-y divide-neutral-100">
          {content.areas.map((a) => (
            <AreaRow key={a.title} title={a.title} copy={a.copy} />
          ))}
        </ul>
      </div>
    </div>
  )
}

function AreaRow({ title, copy }: { title: string; copy: string }) {
  return (
    <li className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <span aria-hidden="true" className="mt-2 inline-block size-1.5 shrink-0 rounded-full bg-[var(--nyl-blue-500)]" />
      <div>
        <p className="text-[13.5px] font-medium text-neutral-900">{title}</p>
        <p className="text-[12.5px] text-neutral-500">{copy}</p>
      </div>
    </li>
  )
}

function OutreachDraftMini({ content }: { content: CanvasContent }) {
  const { draft } = content
  return (
    <div className="w-[600px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-30px_rgba(0,10,98,0.22)]">
      <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-3 pr-12">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">
          {draft.title}
        </p>
      </div>
      <div className="px-6 py-5">
        <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-400">
          {draft.eyebrow}
        </p>
        <div className="mt-4 whitespace-pre-wrap text-[13.5px] leading-[1.65] text-neutral-800">
          {`${draft.salutation}\n\n${draft.body}`}
        </div>

        <div className="mt-5 flex items-center gap-2">
          <button className="rounded-md bg-[var(--nyl-blue-500)] px-3 py-1.5 text-[12px] font-medium text-white">
            Send
          </button>
          <button className="rounded-md border border-neutral-300 px-3 py-1.5 text-[12px] text-neutral-700">
            Save as a draft
          </button>
          <button className="rounded-md border border-neutral-300 px-3 py-1.5 text-[12px] text-neutral-700">
            Try a crisper tone
          </button>
        </div>
      </div>
    </div>
  )
}

function RelationshipSnapshot({ content }: { content: CanvasContent }) {
  return (
    <div className="w-[380px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-30px_rgba(0,10,98,0.22)]">
      <div className="p-6 pr-12">
        <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-400">
          Relationship snapshot
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-y-3 gap-x-4">
          {content.snapshot.map((r) => (
            <Row key={r.label} label={r.label} value={r.value} />
          ))}
        </dl>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-[11px] uppercase tracking-[0.16em] text-neutral-400">{label}</dt>
      <dd className="text-[13px] text-neutral-900">{value}</dd>
    </>
  )
}

/* ----------------------------------------------------------------------------
 * Bottom dock
 * -------------------------------------------------------------------------- */

function BottomDock({
  view,
  zoom,
  onAddNodes,
  userNodeCount,
}: {
  view: ViewMode
  zoom: number
  onAddNodes: (kind: UserNodeKind) => void
  userNodeCount: number
}) {
  void userNodeCount
  const [pickerOpen, setPickerOpen] = useState(false)

  /* Keyboard shortcut — N opens the picker (or closes it if already open).
   * Ignores when the user is typing in an input/textarea so we don't hijack
   * "n" inside the editable node fields. */
  useEffect(() => {
    if (view !== 'canvas') return
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'n' && e.key !== 'N') return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (target) {
        const tag = target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return
      }
      e.preventDefault()
      setPickerOpen((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [view])
  return (
    <>
      {/* Bottom-left recap sticky — vertical pill with section nav + history */}
      <RecapSticky />

      {/* Bottom-center: Add-Node button + zoom chip */}
      {view === 'canvas' && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-[160] flex -translate-x-1/2 items-center gap-2">
          <div className="pointer-events-auto relative">
            <button
              type="button"
              onClick={() => setPickerOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--nyl-blue-500)] px-4 py-2 text-[12.5px] font-medium text-white shadow-[0_12px_32px_-12px_rgba(0,10,98,0.45)] hover:bg-[var(--nyl-blue-600)]"
              title="Pick a node to add · N"
              aria-haspopup="menu"
              aria-expanded={pickerOpen}
            >
              <span aria-hidden="true" className="text-[15px] leading-none">+</span>
              <span>Add node</span>
              <kbd className="hidden rounded bg-white/15 px-1.5 py-[1px] text-[10px] font-medium uppercase tracking-[0.18em] text-white/80 md:inline-block">N</kbd>
            </button>

            {pickerOpen && (
              <>
                {/* dismiss layer */}
                <button
                  type="button"
                  aria-label="Dismiss"
                  onClick={() => setPickerOpen(false)}
                  className="fixed inset-0 z-[160] cursor-default bg-transparent"
                />
                <div
                  role="menu"
                  className="absolute bottom-full left-1/2 z-[161] mb-3 w-[280px] -translate-x-1/2 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_24px_60px_-22px_rgba(0,10,98,0.32)]"
                >
                  <div className="px-4 py-3 text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">
                    Add a node
                  </div>
                  {NODE_KIND_DEFS.map((k) => (
                    <button
                      key={k.kind}
                      type="button"
                      role="menuitem"
                      onClick={() => { onAddNodes(k.kind); setPickerOpen(false) }}
                      className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-neutral-50"
                    >
                      <span aria-hidden="true" className={['mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md', k.iconBg].join(' ')}>
                        <k.Icon />
                      </span>
                      <span className="flex flex-col">
                        <span className="text-[13px] font-medium text-neutral-900">{k.label}</span>
                        <span className="text-[11.5px] leading-snug text-neutral-500">{k.tagline}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="pointer-events-auto rounded-full bg-white px-3 py-1.5 text-[11px] font-medium tabular-nums text-neutral-500 shadow-[0_12px_32px_-18px_rgba(0,10,98,0.32)]">
            {Math.round(zoom * 100)}%
          </div>
        </div>
      )}
    </>
  )
}

/* ----------------------------------------------------------------------------
 * Node kind defs + default payloads + demo seeds.
 * -------------------------------------------------------------------------- */

const NoteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 3 H11 L13 5 V13 H3 Z" /><path d="M5.5 6.5 H10.5" /><path d="M5.5 9 H10.5" /><path d="M5.5 11.5 H8.5" />
  </svg>
)
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="10" height="10" rx="2" /><path d="M6 8 L7.5 9.5 L10.5 6.5" />
  </svg>
)
const QuestionIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="8" cy="8" r="5.5" /><path d="M6.5 6.5 a1.5 1.5 0 1 1 2.5 1.2 L8 8.5 V9.5" /><circle cx="8" cy="11.2" r="0.5" fill="currentColor" />
  </svg>
)
const DecisionIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 2 V14" /><path d="M3 6 L8 2 L13 6" /><path d="M3 14 H13" />
  </svg>
)
const ReminderIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="8" cy="8.5" r="5.5" /><path d="M8 5.5 V8.5 L10 10" /><path d="M5.5 2.5 L4 4" /><path d="M10.5 2.5 L12 4" />
  </svg>
)

const NODE_KIND_DEFS: { kind: UserNodeKind; label: string; tagline: string; iconBg: string; Icon: React.ComponentType }[] = [
  { kind: 'note',      label: 'Note',      tagline: 'Free-form thinking or aside',                iconBg: 'bg-amber-100 text-amber-700',                              Icon: NoteIcon },
  { kind: 'checklist', label: 'Checklist', tagline: 'Steps you want to tick off before the call', iconBg: 'bg-[var(--nyl-green-200)]/70 text-[var(--nyl-green-800)]', Icon: CheckIcon },
  { kind: 'question',  label: 'Question',  tagline: 'Open question to ask the agent or yourself', iconBg: 'bg-[var(--nyl-blue-100)] text-[var(--nyl-blue-600)]',     Icon: QuestionIcon },
  { kind: 'decision',  label: 'Decision',  tagline: 'A vs B · pick a path',                       iconBg: 'bg-[rgba(112,40,164,0.10)] text-[var(--nyl-purple-700)]', Icon: DecisionIcon },
  { kind: 'reminder',  label: 'Reminder',  tagline: 'Something to come back to with a time',      iconBg: 'bg-[var(--nyl-orange-100)] text-[var(--nyl-orange-500)]', Icon: ReminderIcon },
]

const DEFAULT_NODE_PAYLOAD: Record<UserNodeKind, Omit<UserNode, 'id' | 'x' | 'y' | 'locked'>> = {
  note:      { kind: 'note',      title: 'New note',      body: 'Tap to edit. Hit confirm to lock.' },
  checklist: { kind: 'checklist', title: 'New checklist', body: '', items: [{ text: 'First step', done: false }, { text: 'Second step', done: false }] },
  question:  { kind: 'question',  title: 'New question',  body: 'Where the conversation might go from here…' },
  decision:  { kind: 'decision',  title: 'A vs B',        body: 'What you\'re weighing.', optionA: 'Option A', optionB: 'Option B', picked: null },
  reminder:  { kind: 'reminder',  title: 'Follow up',     body: 'What to do', when: 'Tomorrow · 9:00 AM' },
}

/* ----------------------------------------------------------------------------
 * UserNodeCard — editable note card on the canvas. Title + body inputs while
 * unlocked, static text once confirmed. Drag handle on hover, Confirm/Edit/Delete.
 * -------------------------------------------------------------------------- */

function UserNodeCard({
  node,
  disabled,
  onGripDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onChange,
  onRemove,
}: {
  node: UserNode
  disabled: boolean
  onGripDown: (e: React.PointerEvent) => void
  onPointerMove: (e: React.PointerEvent) => void
  onPointerUp: (e: React.PointerEvent) => void
  onPointerCancel: (e: React.PointerEvent) => void
  onChange: (patch: Partial<UserNode>) => void
  onRemove: () => void
}) {
  const titleRef = useRef<HTMLInputElement | null>(null)
  const def = NODE_KIND_DEFS.find((d) => d.kind === node.kind) ?? NODE_KIND_DEFS[0]
  useEffect(() => {
    if (!node.locked && node.title.startsWith('New ')) {
      titleRef.current?.focus()
      titleRef.current?.select()
    }
  }, [node.locked, node.title])

  const tint = node.kind === 'note'      ? 'border-amber-300/60'
            : node.kind === 'checklist' ? 'border-[var(--nyl-green-600)]/45'
            : node.kind === 'question'  ? 'border-[var(--nyl-blue-500)]/45'
            : node.kind === 'decision'  ? 'border-[var(--nyl-purple-700)]/40'
                                        : 'border-[var(--nyl-orange-400)]/55'
  const focusBg = node.kind === 'note'      ? 'focus:bg-amber-50/60'
              : node.kind === 'checklist' ? 'focus:bg-[var(--nyl-green-200)]/35'
              : node.kind === 'question'  ? 'focus:bg-[var(--nyl-blue-100)]/55'
              : node.kind === 'decision'  ? 'focus:bg-[rgba(112,40,164,0.08)]'
                                          : 'focus:bg-[var(--nyl-orange-100)]/55'

  const baseClasses = [
    'group relative flex w-[300px] flex-col gap-2 rounded-2xl border bg-white p-4 shadow-[0_14px_36px_-22px_rgba(0,10,98,0.28)]',
    node.locked ? 'border-[var(--nyl-blue-500)]/40' : tint,
    disabled ? 'opacity-60' : '',
  ].join(' ')

  return (
    <div data-user-node className={baseClasses}>
      {/* Header — grip + kind chip + status + delete */}
      <div className="flex items-center justify-between gap-2 text-[10px] font-medium uppercase tracking-[0.22em]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onPointerDown={onGripDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            disabled={disabled}
            aria-label="Drag node"
            className="cursor-grab text-neutral-400 hover:text-neutral-700 active:cursor-grabbing"
          >
            <GripIcon />
          </button>
          <span className={['inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5', def.iconBg].join(' ')}>
            <def.Icon /> <span className="text-[9.5px]">{def.label}</span>
          </span>
          <span className={node.locked ? 'text-[var(--nyl-blue-600)]' : 'text-neutral-400'}>
            {node.locked ? '· Locked' : '· Draft'}
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Delete node"
          className="text-neutral-300 hover:text-[#b82a1f]"
        >
          ✕
        </button>
      </div>

      {/* Title — common across kinds */}
      {node.locked ? (
        <p className="font-serif text-[18px] leading-tight tracking-tight text-neutral-900" style={{ fontWeight: 400 }}>
          {node.title || 'Untitled'}
        </p>
      ) : (
        <input
          ref={titleRef}
          value={node.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Title"
          className={['-mx-1 rounded-md px-1 py-0.5 font-serif text-[18px] leading-tight tracking-tight text-neutral-900 outline-none', focusBg].join(' ')}
          style={{ fontWeight: 400 }}
        />
      )}

      {/* Body — kind-specific */}
      {node.kind === 'note' && (
        node.locked ? (
          <p className="text-[13px] leading-snug text-neutral-700" style={{ whiteSpace: 'pre-wrap' }}>{node.body}</p>
        ) : (
          <textarea
            value={node.body}
            onChange={(e) => onChange({ body: e.target.value })}
            placeholder="Write a note…"
            rows={4}
            className={['-mx-1 resize-none rounded-md px-1 py-0.5 text-[13px] leading-snug text-neutral-700 outline-none', focusBg].join(' ')}
          />
        )
      )}

      {node.kind === 'checklist' && (
        <ul className="flex flex-col gap-1.5">
          {(node.items ?? []).map((it, i) => (
            <li key={i} className="flex items-start gap-2">
              <button
                type="button"
                onClick={() => {
                  const next = [...(node.items ?? [])]
                  next[i] = { ...next[i], done: !next[i].done }
                  onChange({ items: next })
                }}
                aria-label={it.done ? 'Mark not done' : 'Mark done'}
                className={[
                  'mt-[2px] flex size-4 shrink-0 items-center justify-center rounded-[5px] border',
                  it.done ? 'border-[var(--nyl-green-800)] bg-[var(--nyl-green-200)]/70 text-[var(--nyl-green-800)]' : 'border-neutral-300 bg-white text-transparent',
                ].join(' ')}
              >
                <svg width="9" height="9" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1.5 4 L3.2 5.7 L6.5 2.4" />
                </svg>
              </button>
              {node.locked ? (
                <span className={['text-[13px] leading-snug', it.done ? 'text-neutral-400 line-through' : 'text-neutral-800'].join(' ')}>{it.text}</span>
              ) : (
                <input
                  value={it.text}
                  onChange={(e) => {
                    const next = [...(node.items ?? [])]
                    next[i] = { ...next[i], text: e.target.value }
                    onChange({ items: next })
                  }}
                  placeholder="Step…"
                  className={['flex-1 rounded-md px-1 py-0.5 text-[13px] leading-snug text-neutral-800 outline-none', focusBg].join(' ')}
                />
              )}
              {!node.locked && (
                <button
                  type="button"
                  onClick={() => onChange({ items: (node.items ?? []).filter((_, j) => j !== i) })}
                  aria-label="Remove step"
                  className="text-[12px] text-neutral-300 hover:text-[#b82a1f]"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
          {!node.locked && (
            <button
              type="button"
              onClick={() => onChange({ items: [...(node.items ?? []), { text: '', done: false }] })}
              className="mt-1 inline-flex items-center gap-1 self-start text-[11.5px] font-medium text-[var(--nyl-blue-600)] hover:text-[var(--nyl-blue-800)]"
            >
              + Add step
            </button>
          )}
        </ul>
      )}

      {node.kind === 'question' && (
        node.locked ? (
          <p className="text-[13px] leading-snug text-neutral-700" style={{ whiteSpace: 'pre-wrap' }}>{node.body}</p>
        ) : (
          <textarea
            value={node.body}
            onChange={(e) => onChange({ body: e.target.value })}
            placeholder="Why it matters / where to go with it…"
            rows={3}
            className={['-mx-1 resize-none rounded-md px-1 py-0.5 text-[13px] leading-snug text-neutral-700 outline-none', focusBg].join(' ')}
          />
        )
      )}

      {node.kind === 'decision' && (
        <>
          {node.locked ? (
            <p className="text-[12.5px] leading-snug text-neutral-600">{node.body}</p>
          ) : (
            <textarea
              value={node.body}
              onChange={(e) => onChange({ body: e.target.value })}
              placeholder="What you're weighing…"
              rows={2}
              className={['-mx-1 resize-none rounded-md px-1 py-0.5 text-[12.5px] leading-snug text-neutral-600 outline-none', focusBg].join(' ')}
            />
          )}
          <div className="mt-1 grid grid-cols-2 gap-2">
            {(['A', 'B'] as const).map((key) => {
              const value = key === 'A' ? (node.optionA ?? '') : (node.optionB ?? '')
              const picked = node.picked === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onChange({ picked: picked ? null : key })}
                  disabled={node.locked && !picked}
                  className={[
                    'rounded-lg border p-2.5 text-left text-[12.5px] leading-snug transition-colors',
                    picked
                      ? 'border-[var(--nyl-purple-700)] bg-[rgba(112,40,164,0.08)] text-neutral-900'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-[var(--nyl-purple-700)]/40',
                    node.locked && !picked ? 'opacity-50' : '',
                  ].join(' ')}
                >
                  <span className="text-[9.5px] font-medium uppercase tracking-[0.18em] text-neutral-500">Option {key}</span>
                  {node.locked ? (
                    <p className="mt-1 text-[12.5px] text-neutral-900">{value}</p>
                  ) : (
                    <input
                      value={value}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onChange(key === 'A' ? { optionA: e.target.value } : { optionB: e.target.value })}
                      placeholder={`Option ${key}`}
                      className="mt-1 w-full bg-transparent text-[12.5px] text-neutral-900 outline-none"
                    />
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}

      {node.kind === 'reminder' && (
        <>
          {node.locked ? (
            <>
              <p className="inline-flex items-center gap-1.5 self-start rounded-md bg-[var(--nyl-orange-100)] px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.18em] text-[var(--nyl-orange-500)]">
                <ReminderIcon /> {node.when || '—'}
              </p>
              <p className="text-[13px] leading-snug text-neutral-700" style={{ whiteSpace: 'pre-wrap' }}>{node.body}</p>
            </>
          ) : (
            <>
              <input
                value={node.when ?? ''}
                onChange={(e) => onChange({ when: e.target.value })}
                placeholder="When · e.g. Tomorrow · 9:00 AM"
                className={['-mx-1 rounded-md px-1 py-0.5 text-[12px] font-medium uppercase tracking-[0.18em] text-[var(--nyl-orange-500)] outline-none', focusBg].join(' ')}
              />
              <textarea
                value={node.body}
                onChange={(e) => onChange({ body: e.target.value })}
                placeholder="What to do…"
                rows={3}
                className={['-mx-1 resize-none rounded-md px-1 py-0.5 text-[13px] leading-snug text-neutral-700 outline-none', focusBg].join(' ')}
              />
            </>
          )}
        </>
      )}

      {/* Footer */}
      <div className="mt-1 flex items-center justify-end gap-2 border-t border-neutral-100 pt-2">
        {node.locked ? (
          <button
            type="button"
            onClick={() => onChange({ locked: false })}
            className="rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Edit again
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onChange({ locked: true })}
            className="inline-flex items-center gap-1.5 rounded-md bg-[var(--nyl-blue-500)] px-3 py-1 text-[11px] font-medium text-white hover:bg-[var(--nyl-blue-600)]"
          >
            ✓ Confirm
          </button>
        )}
      </div>
    </div>
  )
}

function HandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 8 V4 a1.4 1.4 0 0 1 2.8 0 V8" />
      <path d="M8.8 8 V3 a1.4 1.4 0 0 1 2.8 0 V8" />
      <path d="M11.6 8 V4 a1.4 1.4 0 0 1 2.8 0 V11 a4.5 4.5 0 0 1 -4.5 4.5 H8 c-1.6 0 -2.5 -1 -3.5 -2 L3 11 a1.2 1.2 0 0 1 2 -1.5 L6 11" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 8 a5.5 5.5 0 0 1 9.5 -3" />
      <path d="M13 2.5 V5 H10.5" />
      <path d="M14.5 10 a5.5 5.5 0 0 1 -9.5 3" />
      <path d="M5 15.5 V13 H7.5" />
    </svg>
  )
}

const RECAP_SECTIONS = [
  { label: 'Opportunity tile', time: 'Just now', active: false },
  { label: 'Opportunity areas', time: '1m ago', active: false },
  { label: 'A warm outreach approach', time: '2m ago', active: true },
  { label: 'Relationship snapshot', time: '2m ago', active: false },
  { label: 'Nyla thread', time: '3m ago', active: false },
]

const RECAP_SNAPSHOTS = [
  { label: 'Outreach draft v2', time: '2m ago' },
  { label: 'Plan annotations', time: '4m ago' },
  { label: 'Initial layout', time: '6m ago' },
]

function RecapSticky() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open])

  return (
    <>
      <div className="pointer-events-none absolute bottom-6 left-6 z-[160]">
        <div className="pointer-events-auto flex w-[44px] flex-col items-center gap-3 rounded-full bg-white py-4 shadow-[0_18px_40px_-22px_rgba(0,10,98,0.32)]">
          {RECAP_SECTIONS.map((s, i) => (
            <button
              key={s.label + i}
              type="button"
              onClick={() => setOpen(true)}
              aria-label={s.label}
              title={s.label}
              className={[
                'block h-[2px] w-[22px] rounded-full transition-colors',
                s.active ? 'bg-neutral-900' : 'bg-neutral-300 hover:bg-neutral-500',
              ].join(' ')}
            />
          ))}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="History"
            title="Recap"
            aria-expanded={open}
            className={[
              'mt-2 flex size-7 items-center justify-center rounded-full transition-colors',
              open ? 'bg-[var(--nyl-blue-500)] text-white' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900',
            ].join(' ')}
          >
            <HistoryIcon />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close recap"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[170] cursor-default bg-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
            <motion.div
              role="dialog"
              aria-label="Canvas recap"
              initial={{ opacity: 0, x: -10, y: 4, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, y: 4, scale: 0.96 }}
              transition={{ duration: 0.28, ease: [0.22, 0.65, 0.05, 1] }}
              className="absolute bottom-6 left-[68px] z-[180] w-[320px] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_24px_60px_-20px_rgba(0,10,98,0.32)]"
            >
              <div className="border-b border-neutral-100 px-4 py-3">
                <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-neutral-400">
                  Sections on this canvas
                </p>
              </div>
              <ol className="px-2 py-1">
                {RECAP_SECTIONS.map((s) => (
                  <li key={s.label}>
                    <button
                      type="button"
                      className={[
                        'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                        s.active ? 'bg-[var(--nyl-blue-100)]/60' : 'hover:bg-neutral-100',
                      ].join(' ')}
                    >
                      <span className={['flex items-center gap-2.5 text-[12.5px]', s.active ? 'font-medium text-neutral-900' : 'text-neutral-700'].join(' ')}>
                        <span aria-hidden="true" className={['inline-block size-1.5 rounded-full', s.active ? 'bg-[var(--nyl-blue-500)]' : 'bg-neutral-300'].join(' ')} />
                        {s.label}
                      </span>
                      <span className="text-[10.5px] uppercase tracking-[0.16em] text-neutral-400">{s.time}</span>
                    </button>
                  </li>
                ))}
              </ol>
              <div className="border-t border-neutral-100 px-4 py-3">
                <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-neutral-400">
                  Saved snapshots
                </p>
                <ul className="mt-2 flex flex-col gap-1">
                  {RECAP_SNAPSHOTS.map((s) => (
                    <li key={s.label} className="flex items-center justify-between py-1 text-[12px]">
                      <span className="text-neutral-700">{s.label}</span>
                      <span className="text-[10.5px] uppercase tracking-[0.16em] text-neutral-400">{s.time}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[var(--nyl-blue-500)] hover:text-[var(--nyl-blue-800)]"
                >
                  Capture new snapshot
                  <span aria-hidden="true">+</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function HistoryIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6.5 a6.5 6.5 0 1 1 -0.2 4" />
      <path d="M3 3 V6.5 H6.5" />
      <path d="M9 5.5 V9 L11.5 10.5" />
    </svg>
  )
}

function DockToggle({
  children,
  active,
  label,
  onClick,
}: {
  children: React.ReactNode
  active?: boolean
  label: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={[
        'flex size-9 items-center justify-center rounded-full transition-colors',
        active ? 'bg-[var(--nyl-blue-500)] text-white' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function CanvasIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1.5" y="2.5" width="6" height="6" rx="1.2" />
      <rect x="10.5" y="2.5" width="6" height="6" rx="1.2" />
      <rect x="1.5" y="11" width="6" height="5" rx="1.2" />
      <rect x="10.5" y="11" width="6" height="5" rx="1.2" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M3 5 H15" />
      <path d="M3 9 H15" />
      <path d="M3 13 H15" />
    </svg>
  )
}

function AnnotateIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 14.5 V11.5 L11.5 3 L14.5 6 L6 14.5 Z" />
      <path d="M10 4.5 L13 7.5" />
    </svg>
  )
}


/* ----------------------------------------------------------------------------
 * Scoped Nyla panel — opens when one or more tiles are selected.
 * Provides a chat surface scoped specifically to those tiles.
 * -------------------------------------------------------------------------- */

function ScopedCoachPanel({
  spec,
  selected,
  onClear,
}: {
  spec: DeepDiveSpec
  selected: string[]
  onClear: () => void
}) {
  const [draft, setDraft] = useState('')

  const selectedCards = selected
    .map((id) => spec.cards.find((c) => c.id === id))
    .filter((c): c is CanvasCard => !!c)

  return (
    <AnimatePresence>
      {selectedCards.length > 0 && (
        <motion.aside
          key="scoped-coach"
          role="complementary"
          aria-label="Nyla"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.38, ease: [0.22, 0.65, 0.05, 1] }}
          className="absolute bottom-0 right-0 top-0 z-[170] flex w-[min(380px,92vw)] flex-col text-white shadow-[-24px_0_60px_-20px_rgba(0,10,98,0.32)]"
          style={{
            background:
              'linear-gradient(155deg, #122879 0%, #000a62 55%, #00084a 100%)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="text-[var(--nyl-blue-500)]" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1.5 L13.6 9.2 L21 11 L13.6 12.8 L12 20.5 L10.4 12.8 L3 11 L10.4 9.2 Z" />
                </svg>
              </span>
              <p className="text-[12.5px] font-medium">Nyla</p>
            </div>
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear selection"
              className="text-[18px] leading-none text-white/55 hover:text-white"
            >
              ×
            </button>
          </div>

          {/* Scope chips */}
          <div className="border-b border-white/8 px-5 py-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/55">
              Discussing
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {selectedCards.map((c) => (
                <li
                  key={c.id}
                  className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[11.5px] text-white"
                >
                  {CARD_TITLES[c.type]}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[10.5px] text-white/45">
              Shift-click another tile to add it to the conversation.
            </p>
          </div>

          {/* Thread */}
          <div className="flex-1 overflow-y-auto px-5 py-6">
            <p
              className="font-serif text-[20px] leading-[1.22] tracking-tight text-white md:text-[22px]"
              style={{ fontWeight: 400, textWrap: 'balance' }}
            >
              {selectedCards.length === 1
                ? deriveSingleScopeLine(selectedCards[0])
                : `I'm holding ${selectedCards.length} cards in scope. Ask me to compare, summarize, or draft something across them.`}
            </p>

            <div className="mt-6">
              <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-white/55">
                Suggested
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {deriveSuggestions(selectedCards).map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      className="block w-full rounded-lg border border-[var(--nyl-blue-250)]/55 bg-[var(--nyl-blue-100)]/95 px-3.5 py-2 text-left text-[12.5px] font-medium text-[var(--nyl-blue-800)] hover:bg-white"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-white/8 px-4 py-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/4 px-3 py-2.5">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask anything about this scope"
                className="flex-1 bg-transparent text-[13px] text-white placeholder:text-white/40 focus:outline-none"
              />
              <button
                type="button"
                aria-label="Send"
                className="flex size-7 items-center justify-center rounded-full bg-white text-[12px] text-neutral-900 hover:bg-neutral-200"
              >
                ↑
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

function deriveSingleScopeLine(card: CanvasCard): string {
  switch (card.type) {
    case 'opportunity':
      return "Looking at this opportunity, I'd start with the conversation, not the product. Want me to draft an opener?"
    case 'opportunity-areas':
      return "These four areas all matter, but the legacy planning gap is the one I'd lead with. Want me to map a sequence?"
    case 'outreach-draft':
      return "The draft is in your voice and on the milestone, not the policy. I can tighten, soften, or set a send time."
    case 'relationship-snapshot':
      return "I see two adult children and 11 months since the last meeting. Want me to find the next move?"
    default:
      return "Ask me anything about this tile."
  }
}

function deriveSuggestions(cards: CanvasCard[]): string[] {
  if (cards.length > 1) {
    return [
      'Summarize how these connect',
      'Draft an outreach that covers both',
      'Show me the gaps across these tiles',
    ]
  }
  const t = cards[0]?.type
  if (t === 'opportunity') return ['Draft the opener', 'Show the math', 'Find a calendar slot']
  if (t === 'opportunity-areas') return ['Rank these by impact', 'Map a 3-step sequence', 'Open the legacy frame']
  if (t === 'outreach-draft') return ['Tighten by 30%', 'Try a crisper tone', 'Schedule for Tuesday 9 am']
  if (t === 'relationship-snapshot') return ['Find a multi-gen play', "Show me what's changed", 'Surface next move']
  return ['Tell me more']
}
