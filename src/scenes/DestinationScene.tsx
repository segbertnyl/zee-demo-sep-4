import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useAppStore } from '@/state/useAppStore'
import { CollabLauncher } from '@/scenes/BriefingScene'

/* DestinationScene — spec-driven destination page with its own top menu bar.
 * Mirrors the Figma frames for Actives (1321:32550) and Prospects (1321:32689).
 *
 * Each tab now renders rich content: optional summary stats, a list of items
 * (clients with canvasId drill-through + action button that drops into the
 * CollabSpace), and an optional follow-up card. */

type ItemTone = 'urgent' | 'monitor' | 'opportunity' | 'ready' | 'neutral'

type Item = {
  id: string
  /* Primary line — usually a client name or case title. */
  title: string
  /* When set, the title becomes a button that drills into that client's canvas. */
  canvasId?: string
  /* Secondary line — status, stage, days, FYC, etc. */
  detail: string
  /* Optional small line below the detail (e.g. "Submitted May 14"). */
  meta?: string
  /* Status badge on the right. */
  badge?: { label: string; tone: ItemTone }
  /* Action button on the right — opens CollabSpace with the seed prompt. */
  action?: { label: string; prompt: string }
}

type StatTile = { label: string; value: string; note?: string; tone?: ItemTone }

type TabContent = {
  headline: string
  body: string
  stats?: StatTile[]
  items?: Item[]
  card?: { title: string; copy: string }
}

export type DestinationSpec = {
  eyebrow: string
  scope: string
  tabs: { id: string; label: string }[]
  content: Record<string, TabContent>
}

/* ----------------------------------------------------------------------------
 * Actives — Cases / Service / Tracking / Follow up
 * -------------------------------------------------------------------------- */

const ACTIVES_SPEC: DestinationSpec = {
  eyebrow: 'Actives',
  scope: 'My queue',
  tabs: [
    { id: 'cases', label: 'Cases' },
    { id: 'service', label: 'Service' },
    { id: 'tracking', label: 'Tracking' },
    { id: 'followup', label: 'Follow up' },
  ],
  content: {
    cases: {
      headline: 'Cases in flight — quiet until they need you.',
      body:
        "Underwriting, service requests, applications. They move on their own. I'll pull one into your briefing the moment it actually needs your eye.",
      stats: [
        { label: 'Open cases', value: '7', note: '2 urgent · 2 stuck on client', tone: 'urgent' },
        { label: 'Avg time in UW', value: '8 days', note: 'Tom Anderson is at 11', tone: 'monitor' },
        { label: 'Issued this week', value: '2', note: 'Both ready to deliver', tone: 'ready' },
      ],
      items: [
        {
          id: 'tom',
          title: 'Tom Anderson',
          canvasId: 'tom-anderson',
          detail: 'Whole life · $500K · APS missing',
          meta: 'Day 11 in underwriting · est. $4,200 FYC at close',
          badge: { label: 'Urgent', tone: 'urgent' },
          action: { label: 'Resend APS', prompt: "Walk me through resending the APS for Tom Anderson and draft a 10-minute call script to set expectations." },
        },
        {
          id: 'maria',
          title: 'Maria Diaz',
          canvasId: 'maria-diaz',
          detail: 'Whole life · $500K · APS missing',
          meta: 'Day 18 · same pattern as Tom · est. $3,400 FYC',
          badge: { label: 'Urgent', tone: 'urgent' },
          action: { label: 'Resend APS', prompt: "Resend the APS for Maria Diaz and queue a Concierge audit so this stops happening." },
        },
        {
          id: 'williams',
          title: 'Sarah Williams',
          detail: 'Annuity rollover · waiting on signature',
          meta: 'Day 9 · client form outstanding',
          badge: { label: 'Stuck on client', tone: 'monitor' },
          action: { label: 'Draft reminder', prompt: 'Draft a friendly signature reminder to Sarah Williams for her annuity rollover form.' },
        },
        {
          id: 'patel',
          title: 'Leela Patel',
          canvasId: 'leela-patel',
          detail: 'Term life · review window opens',
          meta: 'Annual review Friday · cross-sell entry point loaded',
          badge: { label: 'Prep ready', tone: 'ready' },
          action: { label: 'Open meeting pack', prompt: "Open Leela Patel's annual review pack — show me the cross-sell entry point and the talking points." },
        },
        {
          id: 'clarke',
          title: 'Emma Clarke',
          canvasId: 'emma-clarke',
          detail: 'Annual review · 11 AM today',
          meta: 'WL + term + investment · beneficiary catch loaded',
          badge: { label: 'Prep ready', tone: 'ready' },
          action: { label: 'Open meeting pack', prompt: "Open Emma Clarke's annual review pack — surface the beneficiary catch + 401(k) rollover talking points." },
        },
        {
          id: 'nguyen',
          title: 'Nguyen application',
          detail: 'DocuSign reminder pending',
          meta: 'Day 5 · standard send-twice-then-call',
          badge: { label: 'Stuck on client', tone: 'monitor' },
          action: { label: 'Send the reminder', prompt: 'Resend the DocuSign reminder to Nguyen and draft a text confirmation.' },
        },
        {
          id: 'henderson',
          title: 'Janet Henderson',
          canvasId: 'janet',
          detail: 'Coverage review · new property',
          meta: '30-day post-move window · Strategist prep pack queued',
          badge: { label: 'Opportunity', tone: 'opportunity' },
          action: { label: 'Schedule the review', prompt: "Find me a 30-minute slot for Janet Henderson this week and load the flood-risk review pack." },
        },
      ],
    },
    service: {
      headline: 'Service requests, handled before they reach you.',
      body:
        'Address changes, beneficiary updates, policy questions. Most resolve without you. The few that need a signature surface here.',
      stats: [
        { label: 'In motion', value: '12', note: '9 auto-routed · 3 need you', tone: 'neutral' },
        { label: 'Resolved overnight', value: '8', note: 'Avg 2-hour turnaround', tone: 'ready' },
        { label: 'Needs sign-off', value: '3', note: 'See list below', tone: 'monitor' },
      ],
      items: [
        {
          id: 'cooper',
          title: 'Andrew Cooper',
          canvasId: 'andrew-cooper',
          detail: 'Beneficiary change · awaiting e-signature',
          meta: 'Day 6 · one tap sends the reminder',
          badge: { label: 'Sign-off', tone: 'monitor' },
          action: { label: 'Send reminder', prompt: 'Send the e-signature reminder to Andrew Cooper for the beneficiary change.' },
        },
        {
          id: 'morales',
          title: 'L. Morales',
          detail: 'Address change · pending home office',
          meta: 'Routed to processing · expected 24h',
          badge: { label: 'In progress', tone: 'neutral' },
        },
        {
          id: 'kim',
          title: 'M. Kim',
          detail: 'Beneficiary update · confirmation pending',
          meta: 'Day 3 · awaiting client read receipt',
          badge: { label: 'Awaiting client', tone: 'monitor' },
        },
        {
          id: 'cesar',
          title: 'Cesar Powell',
          canvasId: 'cesar-powell',
          detail: 'Premium adjustment · request submitted',
          meta: 'Carrier acknowledged · ETA Friday',
          badge: { label: 'In progress', tone: 'neutral' },
        },
        {
          id: 'frances',
          title: 'Frances Carter',
          canvasId: 'frances-carter',
          detail: 'Beneficiary review request',
          meta: 'Janet referred · open intro queued',
          badge: { label: 'Open intro', tone: 'opportunity' },
          action: { label: 'Draft the intro', prompt: "Draft a beneficiary-review intro to Frances Carter — referred through Janet Henderson, household protection framing." },
        },
      ],
    },
    tracking: {
      headline: 'Every case, where it actually stands.',
      body:
        'Submitted, in underwriting, issued, placed. Live status across your in-flight book — no refresh, no portal-hopping.',
      stats: [
        { label: 'Submitted', value: '3', note: 'Awaiting carrier intake' },
        { label: 'Underwriting', value: '4', note: '1 urgent (Tom Anderson)', tone: 'monitor' },
        { label: 'Issued', value: '2', note: 'Ready to deliver', tone: 'ready' },
        { label: 'Placed (30d)', value: '6', note: '+$28K FYC', tone: 'opportunity' },
      ],
      items: [
        {
          id: 'patel-tracking',
          title: 'Leela Patel',
          canvasId: 'leela-patel',
          detail: 'Submitted · Term-20',
          meta: 'Carrier intake May 26 · no follow-up needed',
          badge: { label: 'Submitted', tone: 'neutral' },
        },
        {
          id: 'tom-tracking',
          title: 'Tom Anderson',
          canvasId: 'tom-anderson',
          detail: 'Underwriting · APS missing',
          meta: 'Day 11 · resend pending',
          badge: { label: 'Underwriting', tone: 'urgent' },
          action: { label: 'Open case', prompt: "Open Tom Anderson's case and walk me through the underwriting timeline." },
        },
        {
          id: 'maria-tracking',
          title: 'Maria Diaz',
          canvasId: 'maria-diaz',
          detail: 'Underwriting · APS missing',
          meta: 'Day 18 · same blocker',
          badge: { label: 'Underwriting', tone: 'urgent' },
          action: { label: 'Open case', prompt: "Open Maria Diaz's case and walk me through what's blocking the WL conversion." },
        },
        {
          id: 'okafor-tracking',
          title: 'Derek Okafor',
          detail: 'Submitted · Term + DI',
          meta: 'Carrier intake May 28 · awaiting medical',
          badge: { label: 'Submitted', tone: 'neutral' },
        },
        {
          id: 'noor-tracking',
          title: 'Noor Yehya',
          canvasId: 'noor-yehya',
          detail: 'Issued · WL rider for new dependent',
          meta: 'Ready to deliver · client expects Friday',
          badge: { label: 'Issued', tone: 'ready' },
          action: { label: 'Send delivery note', prompt: "Draft the delivery note for Noor Yehya's new WL rider — congrats framing, low-pressure." },
        },
        {
          id: 'reyes-tracking',
          title: 'Paul Reyes',
          canvasId: 'paul-reyes',
          detail: 'Placed · DI policy',
          meta: 'Placed May 20 · first commission cleared',
          badge: { label: 'Placed', tone: 'opportunity' },
        },
      ],
    },
    followup: {
      headline: 'The follow-ups that keep cases alive.',
      body:
        'Outstanding requirements, pending exams, unreturned calls. I queue the nudge; you decide whether it goes out as-is.',
      stats: [
        { label: 'Drafted overnight', value: '5', note: 'Review and send', tone: 'ready' },
        { label: 'Past 5 days', value: '3', note: 'Risk of momentum loss', tone: 'monitor' },
        { label: 'Auto-cleared', value: '11', note: 'No advisor touch needed', tone: 'neutral' },
      ],
      items: [
        {
          id: 'fu-exam-1',
          title: 'Medical exam · J. Wong',
          detail: 'Unscheduled past 5 days',
          meta: 'Coordinator drafted scheduling outreach',
          badge: { label: 'Drafted', tone: 'ready' },
          action: { label: 'Review & send', prompt: "Review the J. Wong medical exam scheduling outreach and send it." },
        },
        {
          id: 'fu-exam-2',
          title: 'Medical exam · D. Okafor',
          detail: 'Unscheduled past 4 days',
          meta: 'Sub-prime carrier · 48-hour exam window',
          badge: { label: 'Drafted', tone: 'ready' },
          action: { label: 'Review & send', prompt: "Review the Derek Okafor medical exam scheduling outreach and send it." },
        },
        {
          id: 'fu-call-tom',
          title: 'Anderson · day-11 expectations call',
          detail: 'You promised an update by EOD',
          meta: 'Call script loaded — under 10 min',
          badge: { label: 'Urgent', tone: 'urgent' },
          action: { label: 'Open call script', prompt: "Open the Tom Anderson expectations call script and walk me through the talking points." },
        },
        {
          id: 'fu-rosenthal',
          title: 'M. Rosenthal · thank-you for referrals',
          detail: 'Two referrals in a month',
          meta: 'Brand Advocate drafted a note',
          badge: { label: 'Drafted', tone: 'ready' },
          action: { label: 'Review & send', prompt: "Review the Rosenthal thank-you note and send it before Friday." },
        },
        {
          id: 'fu-clarke-401k',
          title: 'Clarke · 401(k) rollover post-meeting',
          detail: 'Follow-up after this morning',
          meta: 'Suggested send: 3pm today',
          badge: { label: 'Queued', tone: 'neutral' },
          action: { label: 'Draft the note', prompt: "Draft Emma Clarke's post-meeting 401(k) rollover follow-up — name the $210K, frame the next step." },
        },
      ],
    },
  },
}

/* ----------------------------------------------------------------------------
 * Prospects — Discover / Network / Events / Outreach
 * -------------------------------------------------------------------------- */

const PROSPECTS_SPEC: DestinationSpec = {
  eyebrow: 'Prospects',
  scope: 'My pipeline',
  tabs: [
    { id: 'discover', label: 'Discover' },
    { id: 'network', label: 'Network' },
    { id: 'events', label: 'Events' },
    { id: 'outreach', label: 'Outreach' },
  ],
  content: {
    discover: {
      headline: 'Where the next case lives.',
      body:
        'Pipeline, nests, influence webs, and warm paths. By the time you open this, the next move is already drafted.',
      stats: [
        { label: 'Warm prospects', value: '14', note: '+3 this week', tone: 'opportunity' },
        { label: 'Avg time-to-close', value: '21 days', note: 'From first warm touch' },
        { label: 'Pipeline at risk', value: '2', note: '90+ days no-touch', tone: 'monitor' },
      ],
      items: [
        {
          id: 'reyes-discover',
          title: 'Paul Reyes',
          canvasId: 'paul-reyes',
          detail: 'Fact-finding · 11 AM today',
          meta: 'Referred by Rosenthal · married, 2 kids',
          badge: { label: 'Discovery', tone: 'opportunity' },
          action: { label: 'Open fact-find pack', prompt: "Open the Paul Reyes fact-finding pack — show me the discovery questions and household frame." },
        },
        {
          id: 'jon-discover',
          title: 'Jon Owen',
          canvasId: 'jon-owen',
          detail: 'Warm referral · close window',
          meta: 'Illustration delivered · waiting on close',
          badge: { label: 'Close tomorrow', tone: 'opportunity' },
          action: { label: "Draft Jon's check-in", prompt: "Draft a one-line check-in to Jon Owen — close the loop, no pressure." },
        },
        {
          id: 'frances-discover',
          title: 'Frances Carter',
          canvasId: 'frances-carter',
          detail: 'Beneficiary on Janet · uninsured',
          meta: 'Household protection conversation',
          badge: { label: 'Open intro', tone: 'opportunity' },
          action: { label: 'Draft the intro', prompt: 'Draft a beneficiary-review intro to Frances Carter through Janet Henderson.' },
        },
        {
          id: 'rachel-discover',
          title: 'Rachel Lim',
          canvasId: 'rachel-lim',
          detail: 'LTC research signal · 2 days ago',
          meta: '14 minutes on LTC pages · first explicit interest',
          badge: { label: 'Watch', tone: 'monitor' },
          action: { label: 'Send the LTC primer', prompt: 'Draft a content-led LTC primer for Rachel Lim — no pitch, just open the door.' },
        },
        {
          id: 'wei-discover',
          title: 'Wei Chen',
          canvasId: 'wei-chen',
          detail: 'Engagement score 23 → 41',
          meta: 'Life-event signal · structural lift',
          badge: { label: 'Cross-sell open', tone: 'opportunity' },
          action: { label: 'Draft curiosity opener', prompt: 'Draft a curiosity-led opener to Wei Chen — investigate the score lift without pitching.' },
        },
      ],
    },
    network: {
      headline: 'Your influence web, mapped.',
      body:
        'Who knows whom, which clients refer, where the warm paths run. The graph updates as your book moves.',
      stats: [
        { label: 'Active COIs', value: '7', note: '2 sent referrals this quarter', tone: 'opportunity' },
        { label: 'Strongest path', value: 'Rosenthal', note: '4 mutuals warm', tone: 'opportunity' },
        { label: 'Cold COIs', value: '3', note: '0 referrals in 90d', tone: 'monitor' },
      ],
      items: [
        {
          id: 'rosenthal',
          title: 'M. Rosenthal',
          detail: '4 mutuals · 2 referrals this month',
          meta: 'Top referral source · thank-you drafted',
          badge: { label: 'Hot path', tone: 'opportunity' },
          action: { label: 'Pull mutual list', prompt: "Show me the 4 warm mutuals one degree out from Rosenthal — order by close probability." },
        },
        {
          id: 'patel-circle',
          title: 'Patel circle',
          detail: '4 mutual connections · multi-gen household',
          meta: 'One intro opens 3 households',
          badge: { label: 'Untapped', tone: 'opportunity' },
          action: { label: 'Map the path', prompt: 'Show me the Patel circle — which mutual is the warmest path in?' },
        },
        {
          id: 'henderson-circle',
          title: 'Henderson household',
          canvasId: 'janet',
          detail: 'Frances + adult children · 3 in-book references',
          meta: 'Frances open intro queued',
          badge: { label: 'In motion', tone: 'opportunity' },
          action: { label: 'Open household map', prompt: 'Walk me through the Henderson household map — show me everyone Janet could refer.' },
        },
        {
          id: 'sam-bennett-coi',
          title: 'Sam Bennett',
          canvasId: 'sam-bennett',
          detail: 'NPS 9 · 0 referrals in 18 months',
          meta: 'Worth a referral seat at the next touch',
          badge: { label: 'Untapped', tone: 'monitor' },
          action: { label: 'Plant the seed', prompt: "Help me plant a referral seat at my next Sam Bennett warmth call." },
        },
      ],
    },
    events: {
      headline: 'Rooms worth being in.',
      body:
        'Chambers, workshops, and community moments where your next clients already gather — sequenced to your week.',
      stats: [
        { label: 'On calendar', value: '3', note: 'Next 30 days' },
        { label: 'Pipeline overlap', value: '7', note: 'Prospects attending', tone: 'opportunity' },
        { label: 'Avg new contacts', value: '6/event', note: 'Trailing 6 months', tone: 'opportunity' },
      ],
      items: [
        {
          id: 'astoria-breakfast',
          title: 'Astoria business breakfast',
          detail: 'Thu Jun 5 · 7:30 AM · Astoria Chamber',
          meta: '3 pipeline prospects attending · drilled intros ready',
          badge: { label: 'High overlap', tone: 'opportunity' },
          action: { label: 'Open the run sheet', prompt: 'Open my run sheet for the Astoria business breakfast — show me the 3 prospects and prep the intros.' },
        },
        {
          id: 'queens-chamber',
          title: 'Queens chamber networking',
          detail: 'Thu Jun 12 · 6 PM · Forest Hills',
          meta: 'New room · Strategist surfaced 2 hidden COIs',
          badge: { label: 'New room', tone: 'opportunity' },
          action: { label: 'Draft the goals', prompt: 'Set 2-3 goals for the Queens chamber networking event — who to meet, how to introduce myself.' },
        },
        {
          id: 'linkedin-women',
          title: 'NYL × LinkedIn women-in-finance',
          detail: 'Mon Aug 4 · 5 PM · Midtown',
          meta: 'Q3 visibility play · social drafts queued',
          badge: { label: 'Mark calendar', tone: 'neutral' },
        },
      ],
    },
    outreach: {
      headline: 'The next move, already drafted.',
      body:
        'Intros, re-engagements, birthday notes. By the time you open this, the message is written and waiting for your voice.',
      stats: [
        { label: 'Drafted overnight', value: '5', note: 'Review and send', tone: 'ready' },
        { label: 'Sent this week', value: '12', note: '4 replies so far', tone: 'opportunity' },
        { label: 'Stalled', value: '3', note: '7+ days no reply', tone: 'monitor' },
      ],
      items: [
        {
          id: 'helena-outreach',
          title: 'Helena Garcia · pre-60 reconnection',
          canvasId: 'helena-1',
          detail: 'Retirement-readiness window opens',
          meta: 'Frame the milestone, not the rate · 10:30 send',
          badge: { label: 'Ready', tone: 'ready' },
          action: { label: 'Review & send', prompt: "Review Helena Garcia's pre-60 reconnection message — confirm tone and send." },
        },
        {
          id: 'janet-outreach',
          title: 'Janet Henderson · coverage review',
          canvasId: 'janet',
          detail: 'Coastal move · 30-day window',
          meta: 'Strategist review pack attached',
          badge: { label: 'Ready', tone: 'ready' },
          action: { label: 'Review & send', prompt: "Review Janet Henderson's coverage-review outreach and send it with a calendar link." },
        },
        {
          id: 'jon-outreach',
          title: 'Jon Owen · close-the-loop',
          canvasId: 'jon-owen',
          detail: 'Illustration delivered Friday',
          meta: 'One-line check-in · close window today',
          badge: { label: 'Ready', tone: 'ready' },
          action: { label: 'Review & send', prompt: "Review the Jon Owen close-the-loop message and send it." },
        },
        {
          id: 'chloe-bday',
          title: "Chloe Abrams · 45th birthday",
          canvasId: 'chloe-abrams',
          detail: 'Milestone window opens · 6 months out',
          meta: 'WL age-change conversation entry point',
          badge: { label: 'Drafted', tone: 'opportunity' },
          action: { label: 'Review & send', prompt: "Review the Chloe Abrams 45th-birthday milestone outreach and send it." },
        },
        {
          id: 'no-touch-90',
          title: 'No-touch-90 sequence · 14 households',
          detail: 'Reactivation campaign drafted',
          meta: 'Brand Advocate matched to your voice',
          badge: { label: 'Bulk send', tone: 'opportunity' },
          action: { label: 'Review the batch', prompt: 'Walk me through the 14-household no-touch-90 reactivation batch — let me approve each.' },
        },
      ],
    },
  },
}

const SPECS: Record<string, DestinationSpec> = {
  actives: ACTIVES_SPEC,
  prospects: PROSPECTS_SPEC,
}

/* ----------------------------------------------------------------------------
 * Scene component
 * -------------------------------------------------------------------------- */

export function DestinationScene({ id }: { id: keyof typeof SPECS }) {
  const spec = SPECS[id]
  const setScene = useAppStore((s) => s.setScene)
  const openCollab = useAppStore((s) => s.openCollab)
  const openDeepDive = useAppStore((s) => s.openDeepDive)
  const [tab, setTab] = useState(spec.tabs[0].id)
  const active = spec.content[tab]

  return (
    <section className="relative flex flex-1 flex-col">
      <DestinationTopBar
        eyebrow={spec.eyebrow}
        scope={spec.scope}
        tabs={spec.tabs}
        activeTabId={tab}
        onSelectTab={setTab}
        underlineLayoutId="dest-tab-underline"
        onCalendarClick={() => setScene('calendar')}
      />

      <div className="grid flex-1 grid-cols-12 gap-8 px-8 pb-20 pt-10 md:px-12 md:pt-14">
        <div className="col-span-12 w-full max-w-[1100px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.32, ease: [0.22, 0.65, 0.05, 1] }}
            >
              <h1
                className="font-serif text-[40px] leading-[1.04] tracking-tight text-neutral-900 md:text-[52px]"
                style={{ fontWeight: 400, textWrap: 'balance' }}
              >
                {active.headline}
              </h1>
              <p className="mt-5 max-w-[64ch] text-[14.5px] leading-[1.55] text-neutral-600">
                {active.body}
              </p>

              {active.stats && active.stats.length > 0 && (
                <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {active.stats.map((s) => <StatCard key={s.label} stat={s} />)}
                </div>
              )}

              {active.items && active.items.length > 0 && (
                <ul className="mt-8 flex flex-col gap-2">
                  {active.items.map((it) => (
                    <ItemRow
                      key={it.id}
                      item={it}
                      onClient={() => it.canvasId && openDeepDive(it.canvasId)}
                      onAction={() => it.action && openCollab(it.action.prompt)}
                    />
                  ))}
                </ul>
              )}

              {active.card && (
                <div className="mt-8 rounded-2xl bg-white p-6 shadow-[0_24px_60px_-30px_rgba(0,10,98,0.18)]">
                  <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-neutral-400">
                    {active.card.title}
                  </p>
                  <p className="mt-3 max-w-[58ch] text-[15px] leading-[1.55] text-neutral-700">
                    {active.card.copy}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------------------
 * Building blocks
 * -------------------------------------------------------------------------- */

const TONE_BADGE: Record<ItemTone, { bg: string; text: string }> = {
  urgent:      { bg: 'bg-[#fee2e2]',                       text: 'text-[#b82a1f]' },
  monitor:     { bg: 'bg-[var(--nyl-orange-100)]',         text: 'text-[var(--nyl-orange-500)]' },
  opportunity: { bg: 'bg-[var(--nyl-green-200)]/70',       text: 'text-[var(--nyl-green-800)]' },
  ready:       { bg: 'bg-[var(--nyl-blue-100)]/85',        text: 'text-[var(--nyl-blue-800)]' },
  neutral:     { bg: 'bg-neutral-100',                     text: 'text-neutral-600' },
}

function StatCard({ stat }: { stat: StatTile }) {
  const accent = stat.tone
    ? stat.tone === 'urgent' ? 'text-[#b82a1f]'
      : stat.tone === 'opportunity' ? 'text-[var(--nyl-green-800)]'
      : stat.tone === 'monitor' ? 'text-[var(--nyl-orange-500)]'
      : stat.tone === 'ready' ? 'text-[var(--nyl-blue-800)]'
      : 'text-neutral-900'
    : 'text-neutral-900'
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-neutral-500">{stat.label}</p>
      <p className={['mt-2 font-serif text-[24px] leading-none tracking-tight', accent].join(' ')} style={{ fontWeight: 400 }}>
        {stat.value}
      </p>
      {stat.note && <p className="mt-2 text-[11.5px] leading-snug text-neutral-600">{stat.note}</p>}
    </div>
  )
}

function ItemRow({ item, onClient, onAction }: { item: Item; onClient: () => void; onAction: () => void }) {
  const titleClickable = !!item.canvasId
  const tone = item.badge ? TONE_BADGE[item.badge.tone] : null
  return (
    <li className="rounded-2xl border border-neutral-200 bg-white px-5 py-4 transition-shadow hover:shadow-[0_12px_28px_-18px_rgba(0,10,98,0.18)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-neutral-900">
            {titleClickable ? (
              <button
                type="button"
                onClick={onClient}
                className="text-[var(--nyl-blue-500)] hover:underline"
              >
                {item.title}
              </button>
            ) : (
              item.title
            )}
          </p>
          <p className="mt-1 text-[13px] leading-snug text-neutral-700">{item.detail}</p>
          {item.meta && <p className="mt-1 text-[11.5px] leading-snug text-neutral-500">{item.meta}</p>}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {item.badge && tone && (
            <span className={['inline-flex rounded-md px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.18em]', tone.bg, tone.text].join(' ')}>
              {item.badge.label}
            </span>
          )}
          {item.action && (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-700 hover:border-[var(--nyl-blue-500)] hover:text-[var(--nyl-blue-600)]"
            >
              {item.action.label}
              <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      </div>
    </li>
  )
}

/* ----------------------------------------------------------------------------
 * Top bar (unchanged from before)
 * -------------------------------------------------------------------------- */

export function DestinationTopBar({
  eyebrow,
  scope,
  tabs,
  activeTabId,
  onSelectTab,
  underlineLayoutId,
  onCalendarClick,
}: {
  eyebrow: string
  scope?: string
  tabs: { id: string; label: string }[]
  activeTabId: string
  onSelectTab: (id: string) => void
  underlineLayoutId: string
  onCalendarClick?: () => void
}) {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between gap-6 border-b border-neutral-200 bg-white/85 px-8 py-3 backdrop-blur-sm md:px-12">
      <p className="text-[11.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">
        {eyebrow}
      </p>

      <nav aria-label={eyebrow} className="flex items-center gap-4">
        {scope && (
          <>
            <span className="px-1 text-[13px] text-neutral-500">{scope}</span>
            <span aria-hidden="true" className="h-5 w-px bg-neutral-300" />
          </>
        )}
        <div className="flex items-center gap-1">
          {tabs.map((t) => {
            const isActive = t.id === activeTabId
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectTab(t.id)}
                aria-pressed={isActive}
                className={[
                  'relative px-3 py-2 text-[12.5px] font-medium transition-colors',
                  isActive ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-700',
                ].join(' ')}
              >
                {t.label}
                {isActive && (
                  <motion.span
                    layoutId={underlineLayoutId}
                    className="absolute -bottom-[1px] left-2 right-2 h-[2px] rounded-full bg-[var(--nyl-blue-500)]"
                  />
                )}
              </button>
            )
          })}
        </div>
      </nav>

      <div className="flex items-center gap-4">
        {onCalendarClick && (
          <button
            type="button"
            onClick={onCalendarClick}
            className="hidden items-center gap-3 text-[13.5px] font-medium text-neutral-900 transition-opacity hover:opacity-70 md:flex"
          >
            <CalendarGlyph />
            <span>9:30 AM</span>
            <span className="text-neutral-300">|</span>
            <span>Emma Clarke annual…</span>
          </button>
        )}
        <CollabLauncher />
      </div>
    </div>
  )
}

function CalendarGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-neutral-700">
      <rect x="3" y="5" width="16" height="14" rx="2" />
      <path d="M3 9 H19" />
      <path d="M7 3 V6" />
      <path d="M15 3 V6" />
    </svg>
  )
}
