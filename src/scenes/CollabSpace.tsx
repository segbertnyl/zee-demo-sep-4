import { forwardRef, useEffect, useRef, useState } from 'react'
import type { Ref } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useAppStore } from '@/state/useAppStore'
import { suggestionsFor } from '@/scenes/BriefingScene'
import { NYLLogo } from '@/ui/NYLLogo'

/* Briefing-card → collaboration flow. Three stages:
 *   0 — context card (Tom Anderson) + two CTA chips + empty dark ask bar
 *   1 — three sequenced step cards ("Run this before 10AM today in 3 steps.")
 *   2 — first card expanded with conversation guidance + draft text + tone chips.
 *       Suggested follow-up chips animate in above the ask bar after a short delay.
 */

type Stage = 0 | 1 | 2
type Mode = 'global' | 'topic' | 'draft'
type DraftClient = 'janet' | 'helena' | 'tom'

/* Top-bar copy varies by entry point. */
const TITLES: Record<Mode, { title: string; saved: string }> = {
  global: { title: 'New collaboration', saved: 'Just opened' },
  topic: { title: 'Tom Anderson — stalled application', saved: 'Saved 3m ago' },
  draft: { title: 'Draft a message', saved: 'Just opened' },
}

/* Per-client draft templates. The draft view is a focused single-card writer
 * keyed off the action-board "Draft a message" CTA. */
const DRAFT_BY_CLIENT: Record<DraftClient, {
  topBarTitle: string
  eyebrow: string
  headline: string
  sub: string
  message: string
  tones: readonly string[]
  followups: string[]
}> = {
  janet: {
    topBarTitle: 'Janet Henderson — reconnection message',
    eyebrow: 'WARM RECONNECTION',
    headline: "Open with the move, not the policy.",
    sub:
      "Janet just moved to a coastal home in a high flood-risk zone. Lead with the household, not the coverage gap — you'll get the meeting.",
    message:
      "Hi Janet — congratulations on the new place! I saw the address change come through and wanted to check in before things settle.\n\nA few clients who've moved recently have run into surprises with coverage on the new house, so I'd love to take 15 minutes this week to walk through where you stand and what (if anything) needs an update. No pressure either way — just want to make sure you're not left holding a gap you don't know about.\n\nDoes Thursday afternoon or Friday morning work?",
    tones: ['Warm', 'Professional', 'Direct', 'Update'] as const,
    followups: ['Tighten the ask', 'Add flood mention', 'Swap to text'],
  },
  helena: {
    topBarTitle: 'Helena Garcia — milestone outreach',
    eyebrow: 'MILESTONE CHECK-IN',
    headline: 'Frame the milestone, not the rate.',
    sub:
      "Helena just turned 58 and is engaging with retirement-readiness content. Don't pitch — open the door to a conversation about what she's been thinking about.",
    message:
      "Hi Helena — happy belated 58th. I know that age can sneak up on a calendar, and a lot of clients around the same milestone start asking different questions about what's ahead.\n\nI'd love to grab 20 minutes in the next two weeks just to hear what you've been thinking about for the next chapter — not a review, not a pitch, just a conversation. If something useful comes up I'll bring it; if not, you get 20 minutes of free planning back.\n\nWould the week of the 16th work?",
    tones: ['Warm', 'Professional', 'Direct', 'Update'] as const,
    followups: ['Make it shorter', 'Add a rate hook', 'Swap to text'],
  },
  tom: {
    topBarTitle: 'Tom Anderson — application stall',
    eyebrow: 'RESOLVE THE STALL',
    headline: 'Take the next 5 min to chat with Tom and resend the application.',
    sub:
      "Acknowledge the hold, tell him you've identified the issue and are resolving it today.",
    message:
      "Hey Tom, how are you? I wanted to call you off immediately after you hung up. I'm reaching out right now, and once we have that back, we can finalize. Shouldn't take more than a couple of days.",
    tones: ['Personal', 'Professional', 'Apology', 'Update'] as const,
    followups: ['Make it warmer', 'Add the timeline', 'Swap to text'],
  },
}

const CONTEXT_CARD = {
  headline:
    'Tom Anderson has been sitting at underwriting for 11 days on a missing form. One 10-minute call clears it.',
  highlight: 'underwriting for 11 days',
  columns: [
    {
      label: 'LIKELY',
      body:
        "Whole life app stalled at underwriting due to a missing APS medical form and Tom hasn't received the request.",
    },
    {
      label: 'INSIGHT',
      body:
        'This is a system failure, not a client failure since the form was never sent. One resend resolves it.',
    },
    {
      label: 'RECOMMENDATION',
      body:
        'Call Tom Anderson to set expectations, then resend APS request via Sales Central.',
    },
  ],
  footer: "You'll hit $4,200 FYC if this closes.",
  ctas: [
    { label: 'Review the issue', primary: true },
    { label: 'Review underwriting timeline', primary: false },
  ],
}

type StepCard = { id: string; badge: string; title: string; body: string; cta: string | null }
type GenPlan = { footer: string; headline: string; steps: StepCard[] }

/* A chip that lives at the bottom of any generated component — drives the
 * next ask in the freeform flow. */
type GenChip = { label: string; prompt?: string; canvasId?: string }

/* The generative output union — each ask resolves to one of these. The Plan
 * variant is reserved for asks that explicitly call for a multi-step plan
 * (e.g. the briefing's "Run this before 10AM" Tom Anderson CTA). Everything
 * else generates a single contextual component. */
type GenOutput =
  | { kind: 'plan'; pill: string; headline: string; steps: StepCard[]; chips?: GenChip[] }
  | { kind: 'narrative'; pill: string; headline: string; body: string; chips?: GenChip[] }
  | {
      kind: 'draft'
      pill: string
      headline: string
      subjectLabel: string
      subject: string
      bodyLines: string[]
      tones?: string[]
      chips?: GenChip[]
    }
  | {
      kind: 'insight'
      pill: string
      headline: string
      body: string
      metrics: { label: string; value: string; sub?: string }[]
      chips?: GenChip[]
    }
  | {
      kind: 'list'
      pill: string
      headline: string
      body?: string
      items: { id: string; title: string; meta: string; tone?: 'blue' | 'green' | 'amber' | 'red' | 'neutral'; action?: { label: string; prompt?: string; canvasId?: string } }[]
      chips?: GenChip[]
    }

/* Default plan — Tom Anderson 3-step, used by the briefing's "Run this before
 * 10AM" CTA. */
const ANDERSON_PLAN: GenPlan = {
  footer: "You'll hit $4,200 FYC if this closes.",
  headline: 'Run this before 10AM today in 3 steps.',
  steps: [
    {
      id: 'connect',
      badge: 'CONNECT WITH TOM ASAP',
      title: 'Own the delay before he notices it',
      body:
        "Clients who hear about a problem from their advisor stay clients. Clients who discover it themselves don't.",
      cta: 'View conversation guidance',
    },
    {
      id: 'followup',
      badge: 'IMMEDIATE FOLLOW-UP',
      title: 'Resend the APS request via Sales Central',
      body:
        "Do this while Tom is still on the call or immediately after you hang up. Confirm the resend, note the timestamp in the case file, and a 48-hour follow-up alert to check receipt. Don't let this slip into next week.",
      cta: 'Prepare the resend request',
    },
    {
      id: 'protect',
      badge: 'LOG AND PROTECT',
      title: 'Update the case and block your follow-up',
      body:
        "Log the call in Sales Central with the 48-hour timestamp. Set a 48-hour alert to confirm the form was received by underwriting. If APS not returned in 48 hours, escalate and don't wait for another 11-day drift.",
      cta: null,
    },
  ],
}

/* Pick the right generative-UI component for an ask. Each branch produces a
 * single focused component (draft / narrative / insight / list / plan)
 * tailored to the prompt — not a generic 3-step plan. The only path that
 * still returns a multi-step plan is the briefing's Tom Anderson CTA. */
function generateOutput(prompt: string | null): GenOutput {
  const p = (prompt ?? '').toLowerCase()

  /* === DRAFT outputs === */
  if (p.includes('warmer') && p.includes('helena')) {
    return {
      kind: 'draft',
      pill: 'Helena Garcia · warmer rewrite',
      headline: 'A warmer reconnection — same voice, more heart.',
      subjectLabel: 'Email · in your voice',
      subject: 'A long-overdue hello',
      bodyLines: [
        'Hi Helena,',
        "It's been too long — I've been thinking about you and Sergio.",
        "You've just crossed into a new chapter, and the planning that matters at this stage is less about the numbers and more about the shape of the next ten years. I'd love a 20-minute walk-through whenever it suits you — no pitch, no quote, just a look at how the plan you have today stacks up against where you're heading.",
        "If now isn't the right time, just say so and I'll loop back in the fall.",
        'With warmth,\nPriya',
      ],
      tones: ['Warmer', 'More confident', 'More candid', 'Shorter'],
      chips: [
        { label: 'Send as drafted', prompt: 'Send the Helena reconnection as drafted.' },
        { label: 'Make it shorter', prompt: 'Shorten the Helena reconnection by half.' },
        { label: 'Open the canvas', canvasId: 'helena-1' },
      ],
    }
  }
  if (p.includes('draft') && (p.includes('reconnection') || p.includes('helena'))) {
    return {
      kind: 'draft',
      pill: 'Helena Garcia · reconnection draft',
      headline: 'A milestone-first reconnection — in your voice.',
      subjectLabel: 'Email · in your voice',
      subject: 'Thinking about the next chapter',
      bodyLines: [
        'Hi Helena,',
        "I noticed you've been reading about retirement planning lately — and I wanted to reach out before too much time passed.",
        "The years where you're winding into retirement (rather than away from it) tend to need fresher conversations than they do bigger numbers. Would you be open to a 20-minute walk-through in the next couple of weeks? No quote, no pitch — just a look at where things are headed.",
        'Hope to catch up soon,\nPriya',
      ],
      tones: ['Warm', 'Curious', 'Professional', 'Brief'],
      chips: [
        { label: 'Make it warmer',     prompt: 'Make the Helena reconnection a touch warmer — still my voice.' },
        { label: 'Send as drafted',    prompt: 'Send the Helena reconnection as drafted.' },
        { label: 'Open the canvas',    canvasId: 'helena-1' },
      ],
    }
  }
  if (p.includes('draft') && p.includes('janet')) {
    return {
      kind: 'draft',
      pill: 'Janet Henderson · warm outreach',
      headline: 'Frame the move, not the flood policy.',
      subjectLabel: 'Email · in your voice',
      subject: 'A look at the new household',
      bodyLines: [
        'Hi Janet,',
        "Congratulations on the new place — Sergio mentioned you've finally settled in. The 30-day window after a move is one of the best moments to look at how your coverage lines up with the new household, and I'd love to walk through it with you.",
        'Could we find 20 minutes this week or next? No quote, no pressure — just a fresh look across the household.',
        "Talk soon,\nPriya",
      ],
      tones: ['Warm', 'Practical', 'Brief', 'Curious'],
      chips: [
        { label: 'Open Janet canvas', canvasId: 'janet' },
        { label: 'Schedule the review', prompt: 'Help me find a 30-minute slot for Janet Henderson this week.' },
      ],
    }
  }
  if (p.includes('draft') && p.includes('outreach')) {
    return {
      kind: 'draft',
      pill: 'Outreach · Helena is the strongest pick',
      headline: 'A warm note to Helena — ready to send.',
      subjectLabel: 'Email · in your voice',
      subject: 'A long-overdue hello',
      bodyLines: [
        'Hi Helena,',
        "I noticed you've been reading about retirement planning lately, and it brought you to mind. The pre-60 chapter is the one that benefits most from a fresh conversation, not a fresh quote.",
        "Could we find 20 minutes? No agenda, no pitch — just a look at where the plan stands against where you're heading.",
        'Hope to catch up,\nPriya',
      ],
      tones: ['Warm', 'Curious', 'Professional'],
      chips: [
        { label: 'Try a different client', prompt: 'Pick a different client for today\'s morning outreach and draft for them instead.' },
        { label: 'Make it warmer', prompt: 'Make the outreach a touch warmer — still my voice.' },
        { label: 'Send as drafted', prompt: 'Send the morning outreach as drafted.' },
      ],
    }
  }
  if (p.includes('curiosity opener') || (p.includes('90-sec') && p.includes('helena'))) {
    return {
      kind: 'narrative',
      pill: 'Helena Garcia · 90-second opener',
      headline: "Open with what just happened — not what you sell.",
      body:
        "\"Hi Helena. It's been too long. I wanted to reach out — I noticed you've been thinking about the next chapter, and I'd love to hear what's on your mind. No agenda, just a 20-minute conversation about where things are headed for you and Sergio. When would work?\"\n\nThen — and this is the hard part — pause. Don't fill the silence. Let her say the next thing.",
      chips: [
        { label: 'Run the full 5-min drill', prompt: 'Run the full 5-minute holistic talk-track drill — pre-60 scenario.' },
        { label: 'Give me the close instead', prompt: 'Skip the open — give me the soft-close script for the 20-minute look.' },
        { label: 'Open the canvas', canvasId: 'helena-2' },
      ],
    }
  }

  /* === NARRATIVE outputs === */
  if (p.includes('one thing today') || p.includes('focus') || p.includes('priorit')) {
    return {
      kind: 'narrative',
      pill: "Today's top of the stack",
      headline: "Make the Helena call at 10:30. Nothing else matters first.",
      body:
        "The pre-60 window opened overnight — three retirement-content reads in seven days. This is the unprompted holistic opening you flagged at onboarding. Park morning prep, run the 5-minute drill at 10:25, and make the call at 10:30. Patel at 11:00 is already prep'd. Janet stays open-ended for the week.",
      chips: [
        { label: 'Open Helena canvas',          canvasId: 'helena-1' },
        { label: 'Run the 5-min drill',         canvasId: 'helena-2' },
        { label: 'Draft the reconnection',      prompt: "Draft a warm reconnection to Helena Garcia framed around the pre-60 milestone, not the rate." },
      ],
    }
  }
  if (p.includes('which tile is the win')) {
    return {
      kind: 'narrative',
      pill: 'Practice canvas read',
      headline: 'Today\'s win lives in Signals Feed → Helena Garcia.',
      body:
        "Pipeline & Goals is on pace. My Book has nothing urgent. Today's Priorities lead with Helena, but the actual leverage is in the Signals Feed tile — that's where the pre-60 milestone surfaced overnight, and where you'll see future life-event triggers first.",
      chips: [
        { label: 'Open Signals Feed', prompt: 'Open the Signals Feed canvas.' },
        { label: 'Open Helena canvas', canvasId: 'helena-1' },
      ],
    }
  }
  if (p.includes('show me the tour') || p.includes('walk me through the os')) {
    return {
      kind: 'narrative',
      pill: 'Quick start',
      headline: "Here's the shortest version of how this works.",
      body:
        "Briefing lives top-left — that's your morning. The starburst (top-right of any screen) is me — ask anything, anytime. The briefcase opens your plan; the calendar shows the week ahead. Drag any card to reorder it. You can re-onboard from the home menu when life changes — your daily briefing rebuilds from your new answers.",
      chips: [
        { label: 'Open my plan', prompt: 'Open my plan and walk me through what I can change.' },
        { label: 'Show me the briefing', prompt: "Take me to today's briefing and explain what I'm looking at." },
      ],
    }
  }

  /* === INSIGHT outputs === */
  if (p.includes('biggest opportunity') || p.includes('pull my biggest')) {
    return {
      kind: 'insight',
      pill: 'Single biggest opportunity',
      headline: "Janet Henderson's coastal move is the largest opening this week.",
      body:
        "She moved 9 days ago. Her current Term + WL is sized for the old household, not the new coastal one. The 30-day post-move window is when household conversations have the highest trust — and it closes in 21 days.",
      metrics: [
        { label: 'FYC potential', value: '$8,400', sub: 'over 12 mo if household converts' },
        { label: 'Window left',    value: '21 days', sub: 'post-move trust window' },
        { label: 'Propensity',     value: '95%',     sub: 'household-conversation fit' },
      ],
      chips: [
        { label: 'Open Janet canvas',   canvasId: 'janet' },
        { label: 'Draft the outreach',  prompt: 'Draft a warm outreach to Janet Henderson about the new coastal household.' },
      ],
    }
  }
  if (p.includes('compounding') || p.includes('rebuild my plan math') || p.includes('plan math')) {
    return {
      kind: 'insight',
      pill: 'Plan math · May',
      headline: "You're pacing ahead — three weeks left to lock the month.",
      body:
        "Your strongest driver is existing-household multi-policy (38% of May FYC). Annual-review conversions are next (25%). The fastest lever for the remaining three weeks is one more multi-policy household — Janet is the candidate.",
      metrics: [
        { label: 'May FYC',          value: '$11.2K', sub: '+18% vs. April' },
        { label: 'Cases closed',     value: '7 / 6',  sub: '117% of plan' },
        { label: 'YTD to $122K',     value: '76%',    sub: 'on track for August lock' },
      ],
      chips: [
        { label: 'Show me the levers',  prompt: 'What are the 2-3 levers I can pull this month to lock the year early?' },
        { label: 'Open Janet canvas',   canvasId: 'janet' },
      ],
    }
  }

  /* === LIST outputs === */
  if (p.includes('changed overnight') || p.includes('overnight') || p.includes('what changed')) {
    return {
      kind: 'list',
      pill: 'Overnight deltas',
      headline: "Here's what shifted while you slept.",
      items: [
        { id: 'helena', title: 'Helena Garcia · engagement spike',     meta: 'Score 23 → 41 · pre-60 window opened',      tone: 'green', action: { label: 'Open canvas', canvasId: 'helena-1' } },
        { id: 'nigo',   title: 'Reyes term app · NIGO cleared',         meta: 'SSN reformatted · case back in carrier queue', tone: 'blue', action: { label: 'View case', prompt: 'Open the Reyes term application case file.' } },
        { id: 'cal',    title: 'Okafor moved to 2:30 PM',                meta: 'Was 3:00 PM · he confirmed at 9:14 PM',     tone: 'neutral', action: { label: 'Open brief', prompt: 'Open the Okafor pre-meeting brief.' } },
        { id: 'inbox',  title: '23 inbox items triaged',                  meta: '5 flagged for your eyes · 18 routed',     tone: 'neutral', action: { label: 'Show flagged', prompt: 'Pull up the 5 inbox items the Concierge flagged for me this morning.' } },
      ],
    }
  }
  if (p.includes('rerank') || p.includes('re-rank')) {
    return {
      kind: 'list',
      pill: 'Priorities re-sequenced',
      headline: 'Helena rises to #1. Patel slides to #2.',
      items: [
        { id: '1', title: '#1 · Helena Garcia',  meta: 'Pre-60 milestone · call at 10:30',                 tone: 'red',   action: { label: 'Open',  canvasId: 'helena-1' } },
        { id: '2', title: '#2 · Leela Patel',    meta: 'Annual review at 11:00 · pack ready',              tone: 'blue',  action: { label: 'Brief', prompt: "Open Leela Patel's pre-meeting brief." } },
        { id: '3', title: '#3 · Janet Henderson', meta: 'Coverage review · this week, not today',          tone: 'amber', action: { label: 'Open',  canvasId: 'janet' } },
        { id: '4', title: '#4 · Tom Anderson',   meta: 'APS resend in flight · monitor only',              tone: 'neutral' },
      ],
      chips: [
        { label: 'Lock this order', prompt: 'Lock today\'s reranked priorities — keep them through the day.' },
      ],
    }
  }
  if (p.includes('who needs me this week') || p.includes('needs a personal touch')) {
    return {
      kind: 'list',
      pill: 'Personal touches owed this week',
      headline: '4 clients are worth your direct time.',
      items: [
        { id: 'helena', title: 'Helena Garcia',  meta: 'Pre-60 milestone · holistic open',            tone: 'green', action: { label: 'Draft a note', prompt: 'Draft a warm reconnection to Helena Garcia.' } },
        { id: 'janet',  title: 'Janet Henderson', meta: 'Post-move review · household conversation',  tone: 'blue',  action: { label: 'Open canvas', canvasId: 'janet' } },
        { id: 'leela',  title: 'Leela Patel',    meta: 'Annual review · second baby in Feb',          tone: 'blue',  action: { label: 'Open brief', prompt: "Open Leela Patel's pre-meeting brief." } },
        { id: 'maria',  title: 'Maria Garcia',   meta: 'Two referrals in a month · thank-you owed',   tone: 'amber', action: { label: 'Draft thanks', prompt: 'Draft a thank-you note to Maria Garcia for the recent referrals.' } },
      ],
    }
  }
  if (p.includes('3 new prospects') || p.includes('three new prospects') || p.includes('suggest') && p.includes('prospect')) {
    return {
      kind: 'list',
      pill: 'Net-new prospects · match your book shape',
      headline: '3 strong candidates with warm context.',
      items: [
        { id: 'p1', title: 'Sam Bennett',  meta: 'Referred by Helena Garcia · 32, just got married',      tone: 'green',  action: { label: 'Reach out', prompt: 'Draft a warm intro reach-out to Sam Bennett — referred by Helena Garcia.' } },
        { id: 'p2', title: 'Omar Hadi',    meta: 'NYC Estate Forum attendee · estate attorney',           tone: 'blue',   action: { label: 'Reach out', prompt: 'Draft a "let\'s grab coffee" reach-out to Omar Hadi after the NYC Estate Forum.' } },
        { id: 'p3', title: 'Tara O\'Donnell', meta: 'Adult child of Henderson household · 28, new home', tone: 'amber',  action: { label: 'Reach out', prompt: 'Draft a gen-2 reach-out to Tara O\'Donnell — Janet Henderson\'s daughter.' } },
      ],
    }
  }

  /* === PLAN outputs (kept for the briefing CTA + explicit "give me a plan" asks) === */
  if (p.includes('tom') || p.includes('anderson') || p.includes('aps') || p.includes('run this before 10') || p.includes('underwriting')) {
    return { kind: 'plan', pill: ANDERSON_PLAN.footer, headline: ANDERSON_PLAN.headline, steps: ANDERSON_PLAN.steps }
  }
  if (p.includes('plan') && (p.includes('q3') || p.includes('compound') || p.includes('build me a'))) {
    return {
      kind: 'plan',
      pill: 'Quarterly plan · Q3 compounding',
      headline: 'Compound the wins from Q2 in three moves.',
      steps: [
        { id: 'q1', badge: 'JULY · HOLD HOLISTIC',         title: 'Keep one holistic open per week as the floor',                    body: 'Q2 delivered 6 holistic conversations — double Q1. Keep that cadence; one a week is the practice shape you committed to in onboarding.', cta: 'Set the weekly target' },
        { id: 'q2', badge: 'AUG · MULTI-POLICY MOVE',      title: 'Run 3 referral asks out of existing households',                  body: 'You sit at 11 multi-policy households; cohort top quartile is 22. Three referrals from existing households moves your Practice Score ~6 points.', cta: 'See candidate households' },
        { id: 'q3', badge: 'SEP · CENTER OF INFLUENCE',    title: 'Land one estate attorney relationship by end of quarter',         body: 'Zero estate-attorney relationships today; cohort average is 2. One coffee a month for 90 days closes that gap.', cta: null },
      ],
    }
  }

  /* === DEFAULT: a short narrative answer, not a plan === */
  return {
    kind: 'narrative',
    pill: 'Quick take',
    headline: "Here's how I'd think about that.",
    body:
      "I read your last 30 days, your calendar, and your book before answering. Tell me a bit more about what you mean — a specific client, a specific outcome, or a time frame — and I'll generate the right next thing (a draft, a list, a plan, a meeting brief). Or pick one of the moves below.",
    chips: [
      { label: 'Show me the one thing today', prompt: "Tell me the one thing I should not miss today, and why." },
      { label: 'Draft my morning outreach',    prompt: 'Draft the warmest outreach I can send before 10 AM — pick the right client.' },
      { label: 'What changed overnight?',      prompt: 'Show me only what changed in my book overnight — deltas only.' },
    ],
  }
}

const EXPANDED = {
  label: 'CONVERSATION GUIDANCE',
  headline:
    'Take the next 5 min to chat with Tom and resend the application.',
  sub:
    "When you connect with him, acknowledge the hold, and tell him you've identified the issue and are resolving it today.",
  tabs: ['Call', 'Text'] as const,
  message:
    "Hey Tom, how are you? I wanted to call you off immediately after you hung up. I'm reaching out right now, and once we have that back, we can finalize. Shouldn't take more than a couple of days.",
  tones: ['Personal', 'Professional', 'Apology', 'Update'] as const,
}

const SUGGESTED_FOLLOWUPS = [
  'What needs me this week?',
  'Summarize my day',
]

/* One ask + one generated component. Turns stack vertically — prior turns dim,
 * blur, and slide up the chain while the newest generates underneath. */
type GenTurn = {
  id: number
  query: string
  output: GenOutput
  phase: 'processing' | 'settled'
}

/* Serif status lines shown while a turn "generates" — phrased as what the
 * agent is actually doing for this kind of output. */
function processingLines(output: GenOutput): string[] {
  switch (output.kind) {
    case 'draft':
      return ['Reading your recent notes for voice…', 'Drafting it the way you would say it…']
    case 'plan':
      return ['Reading the case timeline…', 'Sequencing the steps…']
    case 'insight':
      return ['Pulling the household numbers…', 'Running the math…']
    case 'list':
      return ['Scanning your book for what moved…', 'Ranking what surfaced…']
    case 'narrative':
      return ['Reading your book and calendar…', 'Shaping a point of view…']
  }
}

export function CollabSpace() {
  const open = useAppStore((s) => s.collabOpen)
  const close = useAppStore((s) => s.closeCollab)
  const seedPrompt = useAppStore((s) => s.collabSeedPrompt)
  const draftClient = useAppStore((s) => s.collabDraftClient)

  const [stage, setStage] = useState<Stage>(0)
  const [mode, setMode] = useState<Mode>('topic')
  const [draftClientState, setDraftClientState] = useState<DraftClient | null>(null)
  const [askInput, setAskInput] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [activeTone, setActiveTone] = useState<string>('Warm')
  const [activeTab, setActiveTab] = useState<typeof EXPANDED.tabs[number]>('Text')
  const [suggestionsVisible, setSuggestionsVisible] = useState(false)
  const askInputRef = useRef<HTMLInputElement>(null)
  /* The generative turn stack rendered in Stage 1+. Each ask appends a turn:
   * the agent picks the right component (draft, narrative, insight, list, or
   * plan), plays a processing beat, then composes it in. Prior turns dim and
   * slide up the chain instead of being replaced. */
  const [turns, setTurns] = useState<GenTurn[]>([])
  const turnSeq = useRef(0)
  const latestTurnRef = useRef<HTMLDivElement>(null)
  const latestTurn = turns.length > 0 ? turns[turns.length - 1] : null

  function pushTurn(query: string) {
    turnSeq.current += 1
    const id = turnSeq.current
    setTurns((ts) => [
      /* Anything still processing settles instantly — only the newest turn animates. */
      ...ts.map((t) => (t.phase === 'settled' ? t : { ...t, phase: 'settled' as const })),
      { id, query, output: generateOutput(query), phase: 'processing' },
    ])
  }

  /* Reset + initialize only on the false→true open transition. We track the
   * previous open state in a ref so internal state changes (e.g. the store
   * clearing the seed on close) don't accidentally re-initialize and snap us
   * back to global mode while the dialog is still up. The seed is cleared by
   * `closeCollab` when the overlay closes — no need to clear it here. */
  const wasOpen = useRef(false)
  useEffect(() => {
    if (!open) {
      wasOpen.current = false
      return
    }
    if (wasOpen.current) return
    wasOpen.current = true

    if (draftClient) {
      /* Action-board "Draft a message" → focused draft writer for this client. */
      setMode('draft')
      setStage(0)
      setDraftClientState(draftClient)
      setSubmittedQuery(seedPrompt ?? '')
      setAskInput('')
      setActiveTone(DRAFT_BY_CLIENT[draftClient].tones[0])
    } else if (seedPrompt) {
      /* Chip with a pre-canned prompt → topic mode, land on Stage 0 (context card
       * + in-canvas CTAs). The seed is preserved as the recent query so it
       * surfaces in the ask bar; the user advances to Stage 1 by picking a CTA. */
      setMode('topic')
      setStage(0)
      setDraftClientState(null)
      setSubmittedQuery(seedPrompt)
      setAskInput('')
      setActiveTone('Personal')
    } else {
      /* Top-right AI launcher → global mode, empty starter canvas. */
      setMode('global')
      setStage(0)
      setDraftClientState(null)
      setAskInput('')
      setSubmittedQuery('')
      setActiveTone('Personal')
    }
    setTurns([])
    setSuggestionsVisible(false)
    setActiveTab('Text')
  }, [open, seedPrompt, draftClient])

  /* Advance the latest turn from processing → settled once the generative
   * beat (logo pulse + serif status lines) has played through. */
  useEffect(() => {
    if (!latestTurn || latestTurn.phase !== 'processing') return
    const t = setTimeout(() => {
      setTurns((ts) => ts.map((x, i) => (i === ts.length - 1 ? { ...x, phase: 'settled' } : x)))
    }, 2400)
    return () => clearTimeout(t)
  }, [latestTurn])

  /* New turn → bring it into view so prior turns visibly move up the chain. */
  useEffect(() => {
    if (turns.length === 0) return
    const t = setTimeout(() => {
      latestTurnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
    return () => clearTimeout(t)
  }, [turns.length])

  /* Escape-to-close — active whenever the overlay is open. */
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, close])

  /* After landing in Stage 2 (card expanded) — OR in draft mode — auto-reveal
   * suggested follow-up chips above the ask bar. */
  useEffect(() => {
    const shouldShow = stage === 2 || mode === 'draft'
    if (!shouldShow) {
      setSuggestionsVisible(false)
      return
    }
    const t = setTimeout(() => setSuggestionsVisible(true), 1400)
    return () => clearTimeout(t)
  }, [stage, mode])

  function submitAsk(value: string) {
    const trimmed = value.trim()
    if (!trimmed) return
    setSubmittedQuery(trimmed)
    setAskInput('')
    /* Any query commits us to a topic — once we know what the advisor wants,
     * the canvas takes on that subject's identity. */
    setMode('topic')
    setStage(1)
    pushTurn(trimmed)
  }

  function pickStarter(prompt: string) {
    setSubmittedQuery(prompt)
    setMode('topic')
    setStage(1)
    pushTurn(prompt)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="collab"
          role="dialog"
          aria-label="Collaboration space"
          className="overlay-bleed z-[160] flex flex-col bg-[#ecebe7]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32 }}
        >
          <TopBar onClose={close} mode={mode} draftClient={draftClientState} />

          {/* Canvas body */}
          <div className="dot-ground relative flex-1 overflow-y-auto overflow-x-hidden">
            <AnimatePresence mode="wait">
              {mode === 'draft' && draftClientState && (
                <motion.div
                  key="draft"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.34 }}
                  className="mx-auto w-full max-w-[1080px] px-8 py-10 pb-44 md:px-12"
                >
                  <DraftView
                    client={draftClientState}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    activeTone={activeTone}
                    setActiveTone={setActiveTone}
                  />
                </motion.div>
              )}
              {mode !== 'draft' && stage === 0 && mode === 'global' && (
                <motion.div
                  key="stage-0-global"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.34 }}
                  className="mx-auto w-full max-w-[1080px] px-8 py-16 pb-44 md:px-12 md:py-24"
                >
                  <Stage0Global onPickStarter={pickStarter} />
                </motion.div>
              )}
              {mode !== 'draft' && stage === 0 && mode === 'topic' && (
                <motion.div
                  key="stage-0-topic"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.34 }}
                  className="mx-auto w-full max-w-[1080px] px-8 py-12 pb-44 md:px-12"
                >
                  <Stage0 onPickCta={(label) => pickStarter(label)} />
                </motion.div>
              )}
              {mode !== 'draft' && (stage === 1 || stage === 2) && (
                <motion.div
                  key="stage-1"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.34 }}
                  className="mx-auto w-full max-w-[1080px] px-8 py-10 pb-44 md:px-12"
                >
                  <div className="flex flex-col gap-16">
                    {turns.map((turn, i) => {
                      const isLatest = i === turns.length - 1
                      return (
                        <TurnBlock
                          key={turn.id}
                          ref={isLatest ? latestTurnRef : undefined}
                          turn={turn}
                          isLatest={isLatest}
                          expandedCardId={
                            isLatest && stage === 2 && turn.output.kind === 'plan'
                              ? turn.output.steps[0].id
                              : null
                          }
                          activeTab={activeTab}
                          activeTone={activeTone}
                          setActiveTab={setActiveTab}
                          setActiveTone={setActiveTone}
                          onExpandFirst={() => setStage(2)}
                          onCollapse={() => setStage(1)}
                          onChip={pickStarter}
                        />
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sticky bottom dock — dark ask bar w/ optional suggestion chips.
            * Hidden on Stage0Global, which has its own inline ask field. */}
          <div className={['pointer-events-none absolute bottom-0 left-0 right-0 flex justify-center px-6 pb-6', stage === 0 && mode === 'global' ? 'hidden' : ''].join(' ')}>
            <div className="pointer-events-auto flex w-full max-w-[760px] flex-col items-center gap-3">
              <AnimatePresence>
                {(stage === 2 || mode === 'draft') && suggestionsVisible && (
                  <motion.div
                    key="suggestions"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.34, ease: [0.22, 0.65, 0.05, 1] }}
                    className="flex flex-wrap items-center justify-center gap-2"
                  >
                    {(mode === 'draft' && draftClientState
                      ? DRAFT_BY_CLIENT[draftClientState].followups
                      : SUGGESTED_FOLLOWUPS
                    ).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => submitAsk(s)}
                        className="rounded-full px-4 py-2 text-[12.5px] font-medium text-white"
                        style={{
                          background:
                            'linear-gradient(180deg, #0b1740 0%, #050b29 100%)',
                          boxShadow:
                            '0 6px 14px -10px rgba(2, 7, 31, 0.6), 0 0 0 1px rgba(255,255,255,0.06) inset',
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <AskBar
                ref={askInputRef}
                placeholder={
                  mode === 'global' && stage === 0
                    ? 'What do you want to do?'
                    : stage === 0
                      ? 'What would you like to change or dive deeper into?'
                      : submittedQuery && !askInput
                        ? submittedQuery
                        : 'Ask a follow-up'
                }
                value={askInput}
                onChange={setAskInput}
                onSubmit={() => submitAsk(askInput)}
                showSubmittedAsValue={stage > 0 && !askInput && !!submittedQuery}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ----------------------------------------------------------------------------
 * Top bar — back, title, view toggle.
 * -------------------------------------------------------------------------- */
function TopBar({ onClose, mode, draftClient }: { onClose: () => void; mode: Mode; draftClient: DraftClient | null }) {
  const base = TITLES[mode]
  const title = mode === 'draft' && draftClient ? DRAFT_BY_CLIENT[draftClient].topBarTitle : base.title
  const saved = base.saved
  return (
    <div className="flex items-center justify-between gap-4 border-b border-neutral-200 bg-white/85 px-6 py-3.5 backdrop-blur-sm md:px-10">
      <button
        type="button"
        onClick={onClose}
        className="group flex items-center gap-3 text-left text-neutral-700 hover:text-neutral-900"
      >
        <span aria-hidden="true" className="text-[18px] text-neutral-500 transition-transform group-hover:-translate-x-0.5">←</span>
        <span className="flex flex-col">
          <span className="text-[15px] font-medium tracking-tight text-neutral-900">
            {title}
          </span>
          <span className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-neutral-400">
            {saved}
          </span>
        </span>
      </button>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          aria-label="List view"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 4 H13" />
            <path d="M3 8 H13" />
            <path d="M3 12 H13" />
          </svg>
        </button>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg bg-neutral-900 text-white"
          aria-label="Canvas view"
          aria-pressed="true"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="0.6" />
            <rect x="9" y="2.5" width="4.5" height="4.5" rx="0.6" />
            <rect x="2.5" y="9" width="4.5" height="4.5" rx="0.6" />
            <rect x="9" y="9" width="4.5" height="4.5" rx="0.6" />
          </svg>
        </button>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------------------
 * Stage 0 (global) — empty canvas with prompt + a few starter chips, used when
 * the advisor opens collab from the top-right AI launcher with no preloaded
 * context. Picking a starter or typing in the ask bar commits to topic mode.
 * -------------------------------------------------------------------------- */
function Stage0Global({ onPickStarter }: { onPickStarter: (prompt: string) => void }) {
  /* Read scene + deep-dive context from the store so suggestions reflect what
   * the advisor was just looking at. */
  const scene = useAppStore((s) => s.scene)
  const deepDive = useAppStore((s) => s.deepDive)
  const suggestions = suggestionsFor(scene, deepDive).filter((s) => !s.freeform)
  const [draft, setDraft] = useState('')

  function submit() {
    const v = draft.trim()
    if (!v) return
    onPickStarter(v)
  }
  return (
    <div className="mx-auto w-full max-w-[860px]">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-neutral-400"
      >
        Nyla · ask
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 0.65, 0.05, 1] }}
        className="mt-5 max-w-[18ch] font-serif text-[44px] leading-[1.04] tracking-tight text-neutral-900 md:text-[64px]"
        style={{ fontWeight: 400, textWrap: 'balance' }}
      >
        What do you want to do next?
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.22 }}
        className="mt-5 max-w-[60ch] text-[15px] leading-[1.55] text-neutral-500"
      >
        I read your book, your calendar, and your last 30 days. Ask me anything — or pick one of the openings I see.
      </motion.p>

      {/* Inline ask input — large pill with + on the left, blue submit on the right */}
      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        onSubmit={(e) => { e.preventDefault(); submit() }}
        className="mt-9 flex items-center gap-3 rounded-full bg-white px-5 py-2.5 shadow-[0_18px_40px_-22px_rgba(0,10,98,0.22)]"
      >
        <button
          type="button"
          aria-label="Attach"
          className="flex size-7 items-center justify-center rounded-full text-neutral-400 hover:text-neutral-700"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
            <path d="M9 3 V15" /><path d="M3 9 H15" />
          </svg>
        </button>
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask anything"
          className="flex-1 rounded-md border border-[var(--nyl-blue-500)]/60 bg-white px-3 py-2 text-[14.5px] text-neutral-900 outline-none focus:border-[var(--nyl-blue-500)]"
        />
        <button
          type="submit"
          aria-label="Send"
          disabled={!draft.trim()}
          className="flex size-9 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-40"
          style={{ background: 'radial-gradient(circle at 30% 30%, #1a2a6b 0%, #060f3f 65%, #02071f 100%)' }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 13 V3" /><path d="M3.5 7.5 L8 3 L12.5 7.5" />
          </svg>
        </button>
      </motion.form>

      {/* List-style suggestions: + on left, label center, → on right */}
      <motion.ul
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="mt-8 flex flex-col"
      >
        {suggestions.map((s, i) => (
          <motion.li
            key={s.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.45 + i * 0.06 }}
          >
            <button
              type="button"
              onClick={() => onPickStarter(s.prompt ?? s.label)}
              className="group flex w-full items-center justify-between gap-4 border-b border-neutral-200/70 px-2 py-4 text-left transition-colors hover:bg-white/50"
            >
              <span className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true" className="shrink-0 text-neutral-400 group-hover:text-[var(--nyl-blue-500)]">
                  <path d="M9 3 V15" /><path d="M3 9 H15" />
                </svg>
                <span className="text-[15px] text-neutral-900">{s.label}</span>
              </span>
              <span aria-hidden="true" className="text-[15px] text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--nyl-blue-500)]">→</span>
            </button>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  )
}

/* ----------------------------------------------------------------------------
 * Stage 0 — context card + two CTA chips.
 * -------------------------------------------------------------------------- */
function Stage0({ onPickCta }: { onPickCta: (label: string) => void }) {
  const [before, after] = CONTEXT_CARD.headline.split(CONTEXT_CARD.highlight)
  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 0.65, 0.05, 1] }}
        className="w-full max-w-[860px] overflow-hidden rounded-2xl bg-white p-7 shadow-[0_24px_60px_-30px_rgba(0,10,98,0.22)] md:p-8"
      >
        <p
          className="font-serif text-[22px] leading-[1.3] tracking-tight text-neutral-900"
          style={{ fontWeight: 400, textWrap: 'balance' }}
        >
          {before}
          <span className="text-[#C5482F]">{CONTEXT_CARD.highlight}</span>
          {after}
        </p>
        <div className="mt-6 grid grid-cols-1 gap-5 border-t border-neutral-100 pt-5 md:grid-cols-3 md:gap-6">
          {CONTEXT_CARD.columns.map((col) => (
            <div key={col.label}>
              <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-neutral-400">{col.label}</p>
              <p className="mt-2 text-[13px] leading-[1.5] text-neutral-700">{col.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-right text-[12.5px] font-medium text-[var(--nyl-blue-800)]">
          {CONTEXT_CARD.footer}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36, delay: 0.18 }}
        className="mt-6 flex flex-wrap items-center justify-center gap-2.5"
      >
        {CONTEXT_CARD.ctas.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => onPickCta(c.label)}
            className="rounded-full px-5 py-2.5 text-[13px] font-medium text-white"
            style={{
              background:
                'linear-gradient(180deg, #0b1740 0%, #050b29 100%)',
              boxShadow:
                '0 6px 14px -10px rgba(2, 7, 31, 0.6), 0 0 0 1px rgba(255,255,255,0.06) inset',
            }}
          >
            {c.label}
          </button>
        ))}
      </motion.div>
    </div>
  )
}

/* ----------------------------------------------------------------------------
 * TurnBlock — one ask in the generative chain. Latest turn plays a processing
 * beat (pulsing NYL mark + serif status lines + shimmer) before its component
 * composes in; prior turns dim, blur, and slide up the chain.
 * -------------------------------------------------------------------------- */
const TurnBlock = forwardRef(function TurnBlock(
  {
    turn,
    isLatest,
    expandedCardId,
    activeTab,
    activeTone,
    setActiveTab,
    setActiveTone,
    onExpandFirst,
    onCollapse,
    onChip,
  }: {
    turn: GenTurn
    isLatest: boolean
    expandedCardId: string | null
    activeTab: typeof EXPANDED.tabs[number]
    activeTone: string
    setActiveTab: (t: typeof EXPANDED.tabs[number]) => void
    setActiveTone: (t: string) => void
    onExpandFirst: () => void
    onCollapse: () => void
    onChip: (prompt: string) => void
  },
  ref: Ref<HTMLDivElement>,
) {
  const dimStyle = isLatest
    ? { filter: 'blur(0px)', opacity: 1, scale: 1 }
    : { filter: 'blur(3px)', opacity: 0.32, scale: 0.985 }

  return (
    <motion.div
      ref={ref}
      layout="position"
      animate={dimStyle}
      transition={{ duration: 0.5, ease: [0.22, 0.65, 0.05, 1] }}
      style={{ pointerEvents: isLatest ? 'auto' : 'none' }}
      /* Each turn owns one canvas-height "screen" with its content vertically
       * centered — a new ask scrolls the prior turn up the chain and the live
       * turn lands framed mid-viewport instead of pushed below the fold. */
      className="flex min-h-[calc(100dvh-300px)] scroll-mt-6 flex-col justify-center"
    >
      {/* Ask echo — keeps the chain legible as turns stack up */}
      <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-neutral-400">You asked</p>
      <p
        className="mt-2 font-serif text-[19px] leading-[1.25] tracking-tight text-neutral-600"
        style={{ fontWeight: 400, textWrap: 'balance' }}
      >
        "{turn.query}"
      </p>

      <AnimatePresence mode="wait">
        {turn.phase === 'processing' ? (
          <ProcessingCard key="processing" output={turn.output} />
        ) : (
          <motion.div
            key="settled"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 0.65, 0.05, 1] }}
            className="mt-6"
          >
            <Stage1
              output={turn.output}
              expandedCardId={expandedCardId}
              activeTab={activeTab}
              activeTone={activeTone}
              setActiveTab={setActiveTab}
              setActiveTone={setActiveTone}
              onExpandFirst={onExpandFirst}
              onCollapse={onCollapse}
              onChip={onChip}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

/* The generative beat — pulsing NYL mark, serif status line cycling through
 * what the agent is doing, and shimmer rows standing in for the component
 * about to compose. */
function ProcessingCard({ output }: { output: GenOutput }) {
  const lines = processingLines(output)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (idx >= lines.length - 1) return
    const t = setTimeout(() => setIdx((i) => i + 1), 1050)
    return () => clearTimeout(t)
  }, [idx, lines.length])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, transition: { duration: 0.28 } }}
      transition={{ duration: 0.4, ease: [0.22, 0.65, 0.05, 1] }}
      className="mt-10"
    >
      <div className="flex items-center gap-4">
        <PulsingMark />
        <AnimatePresence mode="wait">
          <motion.p
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="font-serif text-[21px] leading-snug tracking-tight text-neutral-800"
            style={{ fontWeight: 400 }}
          >
            {lines[idx]}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="mt-7 flex flex-col gap-2.5">
        <ShimmerBar width="58%" delay={0} />
        <ShimmerBar width="86%" delay={0.12} />
        <ShimmerBar width="40%" delay={0.24} />
      </div>
    </motion.div>
  )
}

function PulsingMark() {
  return (
    <span className="relative flex size-11 shrink-0 items-center justify-center">
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-xl"
        style={{
          background:
            'radial-gradient(circle, rgba(4,104,255,0.30) 0%, rgba(4,104,255,0) 70%)',
        }}
        animate={{ scale: [1, 1.55, 1], opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.span
        className="relative inline-flex"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <NYLLogo pixelSize={32} className="rounded-md" />
      </motion.span>
    </span>
  )
}

function ShimmerBar({ width, delay }: { width: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay }}
      className="h-3 rounded-full"
      style={{
        width,
        /* Soft white bars so the shimmer reads on the dotted paper ground. */
        background:
          'linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.5) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.6s linear infinite',
      }}
    />
  )
}

/* ----------------------------------------------------------------------------
 * Stage 1/2 — three step cards (first one expanded in Stage 2).
 * -------------------------------------------------------------------------- */
function Stage1({
  output,
  expandedCardId,
  activeTab,
  activeTone,
  setActiveTab,
  setActiveTone,
  onExpandFirst,
  onCollapse,
  onChip,
}: {
  output: GenOutput
  expandedCardId: string | null
  activeTab: typeof EXPANDED.tabs[number]
  activeTone: string
  setActiveTab: (t: typeof EXPANDED.tabs[number]) => void
  setActiveTone: (t: string) => void
  onExpandFirst: () => void
  onCollapse: () => void
  onChip: (prompt: string) => void
}) {
  const openDeepDive = useAppStore((s) => s.openDeepDive)
  function fireChip(c: GenChip) {
    if (c.canvasId) openDeepDive(c.canvasId)
    else if (c.prompt) onChip(c.prompt)
  }

  /* Non-plan outputs render their own focused component. */
  if (output.kind !== 'plan') {
    return (
      <div className="flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
          className="flex items-center justify-center"
        >
          <span className="rounded-full bg-white px-3.5 py-1.5 text-[11.5px] font-medium text-neutral-500 shadow-[0_4px_12px_-8px_rgba(0,10,98,0.18)]">
            {output.pill}
          </span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, delay: 0.05 }}
          className="mt-5 font-serif text-[34px] leading-[1.08] tracking-tight text-neutral-900 md:text-[44px]"
          style={{ fontWeight: 400, textWrap: 'balance' }}
        >
          {output.headline}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12, ease: [0.22, 0.65, 0.05, 1] }}
          className="mt-7"
        >
          {output.kind === 'narrative' && <NarrativeBlock body={output.body} />}
          {output.kind === 'draft'     && <DraftBlock output={output} />}
          {output.kind === 'insight'   && <InsightBlock output={output} />}
          {output.kind === 'list'      && <ListBlock output={output} fireChip={fireChip} />}
        </motion.div>

        {output.chips && output.chips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36, delay: 0.22 }}
            className="mt-6 flex flex-wrap gap-2"
          >
            {output.chips.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => fireChip(c)}
                className="rounded-full px-4 py-2 text-[12.5px] font-medium text-white"
                style={{
                  background: 'linear-gradient(180deg, #0b1740 0%, #050b29 100%)',
                  boxShadow: '0 6px 14px -10px rgba(2, 7, 31, 0.6), 0 0 0 1px rgba(255,255,255,0.06) inset',
                }}
              >
                {c.label}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
        className="flex items-center justify-center"
      >
        <span className="rounded-full bg-white px-3.5 py-1.5 text-[11.5px] font-medium text-neutral-500 shadow-[0_4px_12px_-8px_rgba(0,10,98,0.18)]">
          {output.pill}
        </span>
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36, delay: 0.05 }}
        className="mt-5 font-serif text-[34px] leading-[1.08] tracking-tight text-neutral-900 md:text-[40px]"
        style={{ fontWeight: 400, textWrap: 'balance' }}
      >
        {output.headline}
      </motion.h1>

      <div className="mt-7 flex flex-col gap-4">
        {output.steps.map((card, i) => {
          const isFirst = i === 0
          const isExpanded = isFirst && expandedCardId === card.id
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08, ease: [0.22, 0.65, 0.05, 1] }}
              layout
              className="overflow-hidden rounded-2xl bg-white shadow-[0_18px_40px_-22px_rgba(0,10,98,0.18)]"
            >
              <button
                type="button"
                onClick={() => {
                  if (!isFirst) return
                  if (isExpanded) onCollapse()
                  else onExpandFirst()
                }}
                className={[
                  'block w-full p-6 text-left md:p-7',
                  isFirst ? 'cursor-pointer' : 'cursor-default',
                ].join(' ')}
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--nyl-blue-100)] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--nyl-blue-800)]">
                  <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-[var(--nyl-blue-500)]" />
                  {card.badge}
                </span>
                <h3 className="mt-3 font-serif text-[22px] leading-tight tracking-tight text-neutral-900" style={{ fontWeight: 400 }}>
                  {card.title}
                </h3>
                <p className="mt-2 max-w-[68ch] text-[13.5px] leading-[1.55] text-neutral-700">
                  {card.body}
                </p>
                {card.cta && !isExpanded && (
                  <span className="mt-4 inline-flex items-center rounded-lg border border-[var(--nyl-blue-500)] px-3.5 py-2 text-[12.5px] font-medium text-[var(--nyl-blue-500)]">
                    {card.cta}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    key="expanded"
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.32 }}
                    className="overflow-hidden border-t border-neutral-100 bg-[var(--nyl-blue-100)]/30"
                  >
                    <div className="p-6 md:p-7">
                      <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-neutral-500">
                        {EXPANDED.label}
                      </p>
                      <p className="mt-3 font-serif text-[18px] leading-snug tracking-tight text-neutral-900" style={{ fontWeight: 400 }}>
                        {EXPANDED.headline}
                      </p>
                      <p className="mt-2 max-w-[68ch] text-[13px] leading-[1.55] text-neutral-700">
                        {EXPANDED.sub}
                      </p>

                      <div className="mt-5 rounded-xl border border-neutral-200 bg-white p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-400">
                            {EXPANDED.tabs.map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setActiveTab(t)}
                                className={[
                                  'flex items-center gap-1.5 rounded-md px-2 py-1',
                                  activeTab === t ? 'text-neutral-900' : 'hover:text-neutral-700',
                                ].join(' ')}
                              >
                                {t === 'Call' ? <CallGlyph /> : <TextGlyph />}
                                {t}
                              </button>
                            ))}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {EXPANDED.tones.map((tone) => (
                              <button
                                key={tone}
                                type="button"
                                onClick={() => setActiveTone(tone)}
                                className={[
                                  'rounded-full px-2.5 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.16em]',
                                  activeTone === tone
                                    ? 'bg-neutral-900 text-white'
                                    : 'border border-neutral-200 text-neutral-500 hover:border-neutral-400',
                                ].join(' ')}
                              >
                                {tone}
                              </button>
                            ))}
                          </div>
                        </div>
                        <p className="mt-4 text-[13px] leading-[1.6] text-neutral-700">
                          {EXPANDED.message}
                        </p>

                        <div className="mt-5 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            className="rounded-lg bg-[var(--nyl-blue-500)] px-4 py-2 text-[12.5px] font-medium text-white hover:bg-[var(--nyl-blue-600)]"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------------------
 * Draft view — focused single-card draft writer for the action-board
 * "Draft a message" CTA. Uses per-client templates from DRAFT_BY_CLIENT.
 * -------------------------------------------------------------------------- */
function DraftView({
  client,
  activeTab,
  setActiveTab,
  activeTone,
  setActiveTone,
}: {
  client: DraftClient
  activeTab: typeof EXPANDED.tabs[number]
  setActiveTab: (t: typeof EXPANDED.tabs[number]) => void
  activeTone: string
  setActiveTone: (t: string) => void
}) {
  const draft = DRAFT_BY_CLIENT[client]
  const [body, setBody] = useState(draft.message)

  /* Reset the editable body whenever the client changes — the per-client
   * template is the canonical starting point. */
  useEffect(() => {
    setBody(draft.message)
  }, [draft.message])

  return (
    <div className="mx-auto w-full max-w-[820px]">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 0.65, 0.05, 1] }}
        className="overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-30px_rgba(0,10,98,0.22)]"
      >
        <div className="p-6 md:p-7">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--nyl-blue-100)] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--nyl-blue-800)]">
            <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-[var(--nyl-blue-500)]" />
            {draft.eyebrow}
          </span>
          <h2
            className="mt-4 font-serif text-[24px] leading-tight tracking-tight text-neutral-900 md:text-[28px]"
            style={{ fontWeight: 400, textWrap: 'balance' }}
          >
            {draft.headline}
          </h2>
          <p className="mt-3 max-w-[68ch] text-[13.5px] leading-[1.55] text-neutral-700">
            {draft.sub}
          </p>

          <div className="mt-6 rounded-xl border border-neutral-200 bg-[var(--nyl-blue-100)]/25 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-400">
                {EXPANDED.tabs.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setActiveTab(t)}
                    className={[
                      'flex items-center gap-1.5 rounded-md px-2 py-1',
                      activeTab === t ? 'text-neutral-900' : 'hover:text-neutral-700',
                    ].join(' ')}
                  >
                    {t === 'Call' ? <CallGlyph /> : <TextGlyph />}
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {draft.tones.map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setActiveTone(tone)}
                    className={[
                      'rounded-full px-2.5 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.16em]',
                      activeTone === tone
                        ? 'bg-neutral-900 text-white'
                        : 'border border-neutral-200 bg-white text-neutral-500 hover:border-neutral-400',
                    ].join(' ')}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={Math.max(6, body.split('\n').length + 1)}
              className="mt-4 block w-full resize-none rounded-lg border border-transparent bg-white p-4 text-[13.5px] leading-[1.65] text-neutral-800 outline-none transition-colors focus:border-[var(--nyl-blue-300)]"
              aria-label="Draft message body"
            />

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded-lg bg-[var(--nyl-blue-500)] px-4 py-2 text-[12.5px] font-medium text-white hover:bg-[var(--nyl-blue-600)]"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ----------------------------------------------------------------------------
 * AskBar — dark sticky input dock at the bottom of the canvas.
 * -------------------------------------------------------------------------- */
const AskBar = forwardRef(function AskBar(
  {
    placeholder,
    value,
    onChange,
    onSubmit,
    showSubmittedAsValue,
  }: {
    placeholder: string
    value: string
    onChange: (v: string) => void
    onSubmit: () => void
    showSubmittedAsValue?: boolean
  },
  ref: Ref<HTMLInputElement>,
) {
  return (
    <div
      className="flex w-full items-center gap-3 rounded-2xl px-5 py-3.5 text-white"
      style={{
        background:
          'linear-gradient(120deg, #0b1740 0%, #060f3f 55%, #02071f 100%)',
        boxShadow:
          '0 22px 56px -26px rgba(2,7,31,0.7), 0 0 0 1px rgba(255,255,255,0.05) inset',
      }}
    >
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onSubmit() }}
        placeholder={placeholder}
        className={[
          'flex-1 bg-transparent text-[14px] focus:outline-none',
          showSubmittedAsValue ? 'italic text-white/85 placeholder:text-white/85' : 'text-white placeholder:text-white/55',
        ].join(' ')}
      />
      <button
        type="button"
        aria-label="Attach"
        className="flex size-8 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.5 3.5 L5 9 a2 2 0 0 0 2.8 2.8 L12 7.7" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Voice input"
        className="flex size-8 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="2.5" width="4" height="7" rx="2" />
          <path d="M4 9 a4 4 0 0 0 8 0" />
          <path d="M8 13 V14.5" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onSubmit}
        aria-label="Send"
        className="flex size-8 items-center justify-center rounded-full bg-white text-[#06122e] hover:bg-white/90"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 12 V2" />
          <path d="M3 6 L7 2 L11 6" />
        </svg>
      </button>
    </div>
  )
})

/* ----------------------------------------------------------------------------
 * Generative-UI sub-components — one per GenOutput kind.
 * -------------------------------------------------------------------------- */

function NarrativeBlock({ body }: { body: string }) {
  return (
    <div className="rounded-2xl bg-white p-7 shadow-[0_18px_40px_-22px_rgba(0,10,98,0.18)] md:p-9">
      <p className="max-w-[68ch] whitespace-pre-line text-[15px] leading-[1.65] text-neutral-800">{body}</p>
    </div>
  )
}

function DraftBlock({ output }: { output: Extract<GenOutput, { kind: 'draft' }> }) {
  return (
    <div className="rounded-2xl bg-white p-7 shadow-[0_18px_40px_-22px_rgba(0,10,98,0.18)] md:p-9">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">{output.subjectLabel}</p>
      <p className="mt-3 font-serif text-[20px] leading-snug tracking-tight text-neutral-900" style={{ fontWeight: 400 }}>{output.subject}</p>
      <div className="mt-5 flex flex-col gap-3 text-[14px] leading-[1.65] text-neutral-800">
        {output.bodyLines.map((line, i) => (
          <p key={i} className="whitespace-pre-line">{line}</p>
        ))}
      </div>
      {output.tones && output.tones.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[10.5px] font-medium uppercase tracking-[0.18em] text-neutral-400">Tone</span>
          {output.tones.map((t, i) => (
            <button
              key={t}
              type="button"
              className={[
                'rounded-full px-2.5 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.16em]',
                i === 0 ? 'bg-neutral-900 text-white' : 'border border-neutral-200 text-neutral-500 hover:border-neutral-400',
              ].join(' ')}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function InsightBlock({ output }: { output: Extract<GenOutput, { kind: 'insight' }> }) {
  return (
    <div className="rounded-2xl bg-white p-7 shadow-[0_18px_40px_-22px_rgba(0,10,98,0.18)] md:p-9">
      <p className="max-w-[68ch] text-[15px] leading-[1.6] text-neutral-800">{output.body}</p>
      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        {output.metrics.map((m) => (
          <div key={m.label} className="rounded-xl border border-neutral-200 bg-[var(--nyl-blue-100)]/30 p-4">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">{m.label}</p>
            <p className="mt-2 font-serif text-[28px] leading-none tracking-tight text-neutral-900" style={{ fontWeight: 400 }}>{m.value}</p>
            {m.sub && <p className="mt-2 text-[11.5px] leading-snug text-neutral-500">{m.sub}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

function ListBlock({
  output,
  fireChip,
}: {
  output: Extract<GenOutput, { kind: 'list' }>
  fireChip: (c: GenChip) => void
}) {
  const dot = (tone: string | undefined) =>
    tone === 'red' ? 'bg-[#dc2626]'
    : tone === 'amber' ? 'bg-[var(--nyl-orange-400)]'
    : tone === 'green' ? 'bg-[var(--nyl-green-600)]'
    : tone === 'blue' ? 'bg-[var(--nyl-blue-500)]'
    : 'bg-neutral-400'
  return (
    <div className="rounded-2xl bg-white p-3 shadow-[0_18px_40px_-22px_rgba(0,10,98,0.18)] md:p-4">
      {output.body && (
        <p className="px-4 pb-2 pt-3 text-[14px] leading-snug text-neutral-700">{output.body}</p>
      )}
      <ul className="flex flex-col">
        {output.items.map((it) => (
          <li key={it.id} className="flex items-center justify-between gap-4 border-b border-neutral-100 px-4 py-4 last:border-b-0">
            <div className="flex min-w-0 items-center gap-3">
              <span aria-hidden="true" className={['inline-block size-2 shrink-0 rounded-full', dot(it.tone)].join(' ')} />
              <div className="min-w-0">
                <p className="text-[14px] font-medium leading-snug text-neutral-900">{it.title}</p>
                <p className="text-[12px] leading-snug text-neutral-500">{it.meta}</p>
              </div>
            </div>
            {it.action && (
              <button
                type="button"
                onClick={() => fireChip({ label: it.action!.label, prompt: it.action!.prompt, canvasId: it.action!.canvasId })}
                className="shrink-0 rounded-md bg-[var(--nyl-blue-500)] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[var(--nyl-blue-600)]"
              >
                {it.action.label}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function CallGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3.5 a1.5 1.5 0 0 1 1.5 -1.5 h1.2 a1 1 0 0 1 1 0.8 L7 5 a1 1 0 0 1 -0.4 0.95 L5.3 7 a8 8 0 0 0 3.7 3.7 l1.05 -1.3 a1 1 0 0 1 0.95 -0.4 l2.2 0.3 a1 1 0 0 1 0.8 1 v1.2 A1.5 1.5 0 0 1 12.5 13 A9.5 9.5 0 0 1 3 3.5 Z" />
    </svg>
  )
}
function TextGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 3.5 h11 a1 1 0 0 1 1 1 v6 a1 1 0 0 1 -1 1 H6 l-3 2 v-2 H2.5 a1 1 0 0 1 -1 -1 v-6 a1 1 0 0 1 1 -1 Z" />
    </svg>
  )
}
