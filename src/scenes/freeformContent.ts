/* Seeded generative responses for the Freeform scene.
 *
 * Each prompt has:
 *  - `thinking`: short stream of narration that types in as the system "thinks"
 *  - `response`: an ordered list of block primitives that materialize in stagger
 *
 * Keep block primitives minimal — the prototype should feel composed, not crowded. */

export type ActionTarget = { label: string; promptId?: string }

/* Context popover — surfaces on long-press / hover of a bullet.
 * Contains the agent's contextual reading + a small chip rail of quick actions. */
export type RowContext = {
  echo?: string /* faded "you might be wondering" prompt */
  take: string /* the agent's contextual take, highlighted */
  quickActions: ActionTarget[]
}

export type BulletItem = {
  text: string
  emphasis?: boolean
  context?: RowContext
}

export type Block =
  | { kind: 'headline'; text: string }
  | { kind: 'subhead'; text: string }
  | { kind: 'bullets'; items: BulletItem[] }
  | { kind: 'quote'; text: string; attribution?: string }
  | { kind: 'metric-row'; metrics: { label: string; value: string; sub?: string }[] }
  | { kind: 'sparkline'; label: string; series: number[]; note: string }
  | { kind: 'sources'; items: string[] }
  | {
      kind: 'draft-preview'
      /* a polished email/message preview with inline send/schedule/save */
      channel: 'email' | 'imessage'
      to?: string
      subject?: string
      body: string
      tone?: string /* e.g. "Warm · in your voice" */
      primary: ActionTarget
      secondary?: ActionTarget[]
    }
  | { kind: 'actions'; primary: ActionTarget; secondary?: ActionTarget[] }

export type Prompt = {
  id: string
  shortLabel: string /* what appears in the suggestion chip */
  fullPrompt: string /* what gets shown as the "user's question" once submitted */
  thinking: string[]
  /* Longer narrative summary that appears in the right-rail Nyla chat. */
  narrative?: string[]
  response: Block[]
}

export const PROMPTS: Prompt[] = [
  {
    id: 'henderson',
    shortLabel: 'Turn the Henderson household into a multi-gen client',
    fullPrompt:
      'Turn Janet Henderson\'s household into a multi-generational client.',
    thinking: [
      'Reading the Henderson household profile',
      'Cross-checking beneficiary records and household composition',
      'Scanning 12,000 advisor patterns for matched playbooks',
      'Drafting',
    ],
    narrative: [
      "The Hendersons are the highest-probability multi-gen play in your book right now. Janet trusts you, the spouse is uninsured but already named as beneficiary, and you have an annual review on the calendar this month.",
      "Use the review to plant the seed for two policies — Frances first, the adult children second. The script is in the right place. The math is in your favor.",
    ],
    response: [
      { kind: 'headline', text: 'Turn Janet Henderson\'s household into a multi-generational client.' },
      {
        kind: 'subhead',
        text: 'You already have the door open. The opening expires when Frances calls her own broker.',
      },
      {
        kind: 'bullets',
        items: [
          {
            text: 'The Hendersons are your highest-probability cross-sell in the next 30 days.',
            emphasis: true,
            context: {
              echo: 'How do I act in the moment with more info from Janet?',
              take: 'Analyze similar households you converted in 2025',
              quickActions: [
                { label: 'Compose an outreach message', promptId: 'draft-outreach' },
                { label: 'Identify more opportunities for engagement', promptId: 'henderson' },
                { label: 'Start up conversation coach', promptId: 'start-drill' },
                { label: 'Set an alert for life events' },
              ],
            },
          },
          {
            text: '4-member household. Frances is named beneficiary but uninsured.',
            context: {
              echo: 'What does her current coverage actually look like?',
              take: 'Frances has nothing in force. Janet\'s policies list her as primary on both.',
              quickActions: [
                { label: 'Open household builder' },
                { label: 'Show coverage timeline' },
                { label: 'Draft her introduction', promptId: 'draft-outreach' },
              ],
            },
          },
          {
            text: 'Two adult children (23, 26) — lifetime rates locked at lowest they\'ll ever see.',
            context: {
              echo: 'How do parents usually take this conversation?',
              take: 'Frame it as a gift, not a referral ask. Conversion is 3.4× higher.',
              quickActions: [
                { label: 'Show me a script that lands' },
                { label: 'Find similar conversations I\'ve won' },
                { label: 'Draft a soft intro to the kids', promptId: 'draft-outreach' },
              ],
            },
          },
          { text: 'You already have an annual review on the calendar this month.' },
        ],
      },
      {
        kind: 'metric-row',
        metrics: [
          { label: 'Household score', value: '82', sub: 'top 6% of your book' },
          { label: 'Cross-sell window', value: '21d', sub: 'avg before signal cools' },
          { label: 'Est. household FYC', value: '$12K', sub: 'across three policies' },
        ],
      },
      {
        kind: 'quote',
        text:
          "As part of your annual review, I noticed Frances isn’t currently covered. I’d like to make sure your whole household is protected the way you are.",
        attribution: 'Suggested opener · in your voice',
      },
      {
        kind: 'sources',
        items: ['NYL beneficiary record', 'Household composition · public records', '12,000-advisor pattern match'],
      },
      {
        kind: 'actions',
        primary: { label: 'Open the meeting pack', promptId: 'open-meeting-pack' },
        secondary: [
          { label: 'Draft the outreach', promptId: 'draft-outreach' },
          { label: 'Show the math', promptId: 'show-math' },
          { label: 'Find a calendar slot', promptId: 'find-slot' },
        ],
      },
    ],
  },
  {
    id: 'powell',
    shortLabel: 'Show me my Powell call card',
    fullPrompt: 'Show me the Powell call card.',
    thinking: [
      'Pulling Powell\'s file',
      'Checking last touch + renewal pattern',
      'Composing the call card',
    ],
    narrative: [
      "Cesar has renewed within a 90-day window the last two times you called him. You are at day 84. This is the call most likely to land — and the one most likely to slip if you don't make it today.",
      "He doesn't respond to sold-to language. Lead with his family, anchor on his daughter just starting college, and let him bring up coverage when he's ready.",
    ],
    response: [
      { kind: 'headline', text: 'Cesar Powell · Queens · term expires September' },
      {
        kind: 'subhead',
        text: 'He renewed within a 90-day window the last two times you called him. You\'re at day 84.',
      },
      {
        kind: 'metric-row',
        metrics: [
          { label: 'Days since last touch', value: '84' },
          { label: 'Prior reactivation hits', value: '2 of 2' },
          { label: 'Term expires', value: 'Sept 14' },
        ],
      },
      {
        kind: 'bullets',
        items: [
          { text: 'Lead with the family — his daughter just started Queens College.' },
          { text: "Don’t pitch term-vs-WL on the call. He pushes back when he feels sold to." },
          { text: 'If he says "let me think about it," book a follow-up. He always returns the call.' },
        ],
      },
      {
        kind: 'sparkline',
        label: 'Powell touch rhythm · last 24 months',
        series: [3, 8, 4, 10, 6, 9, 4, 12, 5, 11, 7, 14, 8, 16, 9, 18, 10, 21, 12, 30, 18, 40, 60, 84],
        note: 'Day 84 is past your usual cadence — that\'s why this is the top of your day.',
      },
      {
        kind: 'actions',
        primary: { label: 'Place the call', promptId: 'place-call' },
        secondary: [
          { label: 'Open his record', promptId: 'open-record' },
          { label: 'Have me draft a text instead', promptId: 'draft-text' },
        ],
      },
    ],
  },
  {
    id: 'recovery',
    shortLabel: 'Fastest path to recovery this month',
    fullPrompt: 'I\'m behind. What\'s the fastest path to recovery this month?',
    thinking: [
      'Comparing your pace to your own history',
      'Identifying the highest-yield levers',
      'Modeling close-rate math',
      'Compressing',
    ],
    response: [
      { kind: 'headline', text: "You’re behind by 1.4 cases. Two moves close the gap." },
      {
        kind: 'subhead',
        text: 'I checked your last six months. The fastest pattern for you is conversions + a workshop, not net-new prospecting.',
      },
      {
        kind: 'bullets',
        items: [
          {
            text: 'Convert two term-expiring clients into WL.',
            emphasis: true,
          },
          { text: 'Run one cross-sell workshop with a multi-gen household.' },
          { text: 'Skip prospecting this month. You\'ll lose more time than you\'d gain.' },
        ],
      },
      {
        kind: 'metric-row',
        metrics: [
          { label: 'Gap', value: '1.4 cases' },
          { label: 'Path A · conversion', value: '+1.0' },
          { label: 'Path B · workshop', value: '+0.7' },
        ],
      },
      {
        kind: 'quote',
        text:
          'Recovery is almost always behind you, not ahead of you. The fastest case is the one where your client already trusts you.',
        attribution: 'Coach memo · drawn from your own pattern',
      },
      {
        kind: 'actions',
        primary: { label: 'Build the recovery plan', promptId: 'recovery-plan' },
        secondary: [
          { label: 'Show me the math', promptId: 'show-math' },
          { label: 'Find a workshop slot', promptId: 'find-slot' },
        ],
      },
    ],
  },
  {
    id: 'patel',
    shortLabel: 'Help me prep for Patel at 10',
    fullPrompt: 'Help me prep for the Patel annual review at 10:00.',
    thinking: [
      'Reading the Patel file',
      'Replaying notes from last review',
      'Identifying the question you froze on',
      'Building the drill',
    ],
    response: [
      { kind: 'headline', text: 'Patel review · 10:00 am · the legacy question is the moment.' },
      {
        kind: 'subhead',
        text: 'Last year you froze when Mira asked whether the trust covered her parents. I built a 4-minute drill on a synthetic Patel persona.',
      },
      {
        kind: 'bullets',
        items: [
          { text: 'Open with the daughter — Aanya turns 18 in September.' },
          { text: 'Don\'t bring up beneficiaries until after the legacy frame lands.' },
          { text: 'If Mira asks "do we even need this?" — pause, then ask what she\'s thinking about.' },
        ],
      },
      {
        kind: 'metric-row',
        metrics: [
          { label: 'Last review NPS', value: '8/10' },
          { label: 'Open coverage gap', value: '$420K' },
          { label: 'Time since last review', value: '11 mo' },
        ],
      },
      {
        kind: 'sources',
        items: ['Last meeting notes', 'Coach\'s drill library', 'Patel household record'],
      },
      {
        kind: 'actions',
        primary: { label: 'Start the 4-min drill', promptId: 'start-drill' },
        secondary: [
          { label: 'Open the prep card', promptId: 'open-prep-card' },
          { label: 'Send Mira a confirmation', promptId: 'draft-text' },
        ],
      },
    ],
  },
  {
    id: 'clarke',
    shortLabel: 'How do I handle Emily Clarke\'s review today?',
    fullPrompt: 'How should I approach Emily Clarke\'s annual review at 9?',
    thinking: [
      'Reading the Clarke file',
      'Scanning recent signals',
      'Matching to advisors who handled similar cases',
      'Building the approach',
    ],
    narrative: [
      "I've done the preparation so you can focus on the conversation. This client is showing signs of retirement planning awareness, and I recommend using your next touchpoint to validate goals, uncover gaps, and explore future planning needs.",
      "Use your next meeting to understand how retirement goals have evolved and whether their current strategy is still built for what's ahead.",
    ],
    response: [
      {
        kind: 'headline',
        text: 'Recent signals suggest retirement planning should be top of mind and sooner than expected.',
      },
      {
        kind: 'sparkline',
        label: 'Clarke · retirement-readiness signal · last 24 months',
        series: [12, 14, 13, 18, 16, 22, 19, 25, 24, 29, 30, 34, 33, 38, 41, 45, 48, 54, 58, 62, 66, 71, 78, 88],
        note: 'The line accelerates after she started searching for advice in mid-2025.',
      },
      {
        kind: 'bullets',
        items: [
          {
            text: 'Client recently turned 58 and there\'s a spike in retirement-related content engagement detected.',
            emphasis: true,
            context: {
              echo: 'Where do I see those signals?',
              take: 'LinkedIn shifts, financial-content reads, and three "near 60" search clusters.',
              quickActions: [
                { label: 'Show me the signals' },
                { label: 'Compare to peer averages' },
                { label: 'Open her Client 360', promptId: 'open-record' },
              ],
            },
          },
          {
            text: 'No documented retirement planning conversation within the last 24 months.',
            context: {
              echo: 'Why is this the moment?',
              take: 'Your conversion is 2.6× higher on retirement convos started before age 60.',
              quickActions: [
                { label: 'Show the conversion math', promptId: 'show-math' },
                { label: 'Build the prep card', promptId: 'open-prep-card' },
              ],
            },
          },
          {
            text: 'Use rejuvenated milestones as opportunities to recruit broader goals.',
            context: {
              echo: 'How would you frame the opener?',
              take: 'Anchor on the milestone, not the product. The product follows the goal.',
              quickActions: [
                { label: 'Draft the warm opener', promptId: 'clarke-warm' },
                { label: 'Show me 3 talking angles' },
              ],
            },
          },
        ],
      },
      {
        kind: 'subhead',
        text: 'Suggested approach: open with the milestone and the planning posture, not the product or rate.',
      },
      {
        kind: 'actions',
        primary: { label: 'View draft', promptId: 'clarke-warm' },
        secondary: [
          { label: 'Open prep card', promptId: 'open-prep-card' },
          { label: 'Find a calendar slot', promptId: 'find-slot' },
        ],
      },
    ],
  },
  {
    id: 'clarke-warm',
    shortLabel: 'View the warm outreach draft',
    fullPrompt: 'Show me the warm outreach approach.',
    thinking: ['Pulling Emily\'s tone preferences', 'Drafting in your voice'],
    response: [
      { kind: 'headline', text: 'A warm outreach approach.' },
      {
        kind: 'subhead',
        text: 'Time for a planning-readiness review. No pricing talk yet — just the question that opens the door.',
      },
      {
        kind: 'draft-preview',
        channel: 'email',
        to: 'emily.clarke@example.com',
        subject: 'A planning-readiness check-in',
        tone: 'Warm · in your voice',
        body:
          "Hi Emily,\n\nIt's been a while since we sat down on the bigger picture. The next chapter — the years where you're winding into retirement rather than away from it — is the part of planning that tends to need fresher conversations, not bigger numbers.\n\nProvide often-evolve over time. Promises often-evolve over time, and a quick walk-through helps make sure your existing strategy is still built for what's ahead.\n\nWould you have a 20-minute slot in the next two weeks? Looking forward to catching up.",
        primary: { label: 'Send', promptId: 'sent-confirmation' },
        secondary: [
          { label: 'Schedule for Tuesday 9 am', promptId: 'sent-confirmation' },
          { label: 'Save as a draft', promptId: 'sent-confirmation' },
          { label: 'Try a crisper tone' },
        ],
      },
      {
        kind: 'sources',
        items: ['Your last 12 outreaches to Emily', 'Clarke channel preference · email', 'Retirement-planning playbook'],
      },
    ],
  },
  /* ── Continuation flows ─────────────────────────────────────────────────── */
  {
    id: 'place-call',
    shortLabel: 'Place the call',
    fullPrompt: 'Place the call to Cesar Powell.',
    thinking: ['Checking his preferred line', 'Loading the talking points', 'Dialing'],
    response: [
      { kind: 'headline', text: 'Dialing Cesar now.' },
      {
        kind: 'subhead',
        text: "I'll transcribe and surface the next step the second you're off the call.",
      },
      {
        kind: 'bullets',
        items: [
          { text: 'Talking points are on the right of your screen.' },
          { text: "If he asks about Aanya's policy, I'll surface it inline." },
          { text: "If he wants to think about it, I'll book the follow-up for you." },
        ],
      },
      {
        kind: 'actions',
        primary: { label: 'End call · capture notes', promptId: 'capture-notes' },
        secondary: [{ label: 'Mute & step away' }],
      },
    ],
  },
  {
    id: 'open-record',
    shortLabel: 'Open his record',
    fullPrompt: 'Open Cesar Powell\'s record.',
    thinking: ['Pulling the file', 'Stitching the last six interactions'],
    response: [
      { kind: 'headline', text: 'Cesar Powell · Queens · since 2018.' },
      {
        kind: 'metric-row',
        metrics: [
          { label: 'Active policies', value: '2' },
          { label: 'Household AUM', value: '$420K' },
          { label: 'Relationship', value: '8 yrs' },
        ],
      },
      {
        kind: 'bullets',
        items: [
          { text: 'Daughter Aanya turned 18 in March — coverage convo open.' },
          { text: 'Two policies in force · term + small WL.' },
          { text: 'Last NPS 9. Always returns calls within 48 hours.' },
        ],
      },
      {
        kind: 'actions',
        primary: { label: 'Open his household', promptId: 'henderson' },
        secondary: [{ label: 'Draft outreach', promptId: 'draft-outreach' }],
      },
    ],
  },
  {
    id: 'draft-text',
    shortLabel: 'Have me draft a text',
    fullPrompt: 'Draft a text to him instead.',
    thinking: ['Reading his channel preference', 'Composing in your voice'],
    response: [
      { kind: 'subhead', text: 'In your voice, 117 characters — under the read-rate inflection.' },
      {
        kind: 'quote',
        text:
          "Hey Cesar — quick one. Your term renews in Sept and I'd love to catch up before that. Got 15 minutes Friday?",
        attribution: 'Suggested · iMessage',
      },
      {
        kind: 'actions',
        primary: { label: 'Send now', promptId: 'sent-confirmation' },
        secondary: [
          { label: 'Tighten by 30%' },
          { label: 'Schedule for tomorrow 9 am' },
        ],
      },
    ],
  },
  {
    id: 'open-meeting-pack',
    shortLabel: 'Open the meeting pack',
    fullPrompt: 'Open the Henderson meeting pack.',
    thinking: ['Compiling the pack', 'Pulling household data', 'Assembling pages'],
    response: [
      { kind: 'headline', text: 'Henderson household · meeting pack ready.' },
      {
        kind: 'subhead',
        text: '4 pages · printed, presenter-mode, or sent to your iPad. Auto-updates if anything changes before the meeting.',
      },
      {
        kind: 'bullets',
        items: [
          { text: 'Page 1 · Household snapshot + the legacy frame.' },
          { text: 'Page 2 · Frances coverage gap with three product options.' },
          { text: 'Page 3 · Adult-children playbook — soft intro.' },
          { text: 'Page 4 · Pricing illustrations · three scenarios.' },
        ],
      },
      {
        kind: 'actions',
        primary: { label: 'Send to my iPad', promptId: 'sent-confirmation' },
        secondary: [
          { label: 'Open in presenter mode' },
          { label: 'Print the pack' },
        ],
      },
    ],
  },
  {
    id: 'draft-outreach',
    shortLabel: 'Draft the outreach',
    fullPrompt: 'Draft the outreach.',
    thinking: ['Reading your prior outreach', 'Matching tone', 'Composing'],
    response: [
      { kind: 'headline', text: 'A warm outreach approach.' },
      {
        kind: 'subhead',
        text: 'Drafted in your voice. Three tone variations are queued — switch any time.',
      },
      {
        kind: 'draft-preview',
        channel: 'email',
        to: 'janet.henderson@example.com',
        subject: 'Quick beneficiary review before our annual',
        tone: 'Warm · in your voice',
        body:
          "Hi Janet,\n\nAs I'm prepping for our review later this month, I noticed something worth a quick conversation. Frances is listed as a beneficiary on your policies but doesn't have any coverage of her own — and that's a gap most households don't realize they have until it matters.\n\nI'd love to walk through it together. A 20-minute beneficiary review with both of you, no pricing talk yet. Just a conversation about whether Frances should be covered the same way you are.\n\nDo you have time the week of June 9? I can come to you or do it virtually — whatever works best.\n\nWarmly,\nSarah",
        primary: { label: 'Send now', promptId: 'sent-confirmation' },
        secondary: [
          { label: 'Schedule for Tuesday 9 am', promptId: 'sent-confirmation' },
          { label: 'Save as a draft', promptId: 'sent-confirmation' },
          { label: 'Try a crisper tone' },
        ],
      },
      {
        kind: 'sources',
        items: ['Your last 20 outreaches', 'Henderson channel preference', 'Frances beneficiary record'],
      },
    ],
  },
  {
    id: 'show-math',
    shortLabel: 'Show me the math',
    fullPrompt: 'Show me the math.',
    thinking: ['Pulling your close rate', 'Running the projection'],
    response: [
      { kind: 'headline', text: "Here's how I got there." },
      {
        kind: 'metric-row',
        metrics: [
          { label: 'Your close rate', value: '34%', sub: 'last 12 months' },
          { label: 'Avg case size', value: '$4,950', sub: 'your history' },
          { label: 'Cases needed', value: '28' },
        ],
      },
      {
        kind: 'subhead',
        text: '$138K ÷ $4,950 = 28 cases. 28 ÷ 0.34 = 82 qualified appointments. 82 ÷ 12 ≈ 7 per month.',
      },
      {
        kind: 'bullets',
        items: [
          { text: 'Every input above is from your history — push back on any of them.' },
          { text: "I'll relax the targets if you close a large case." },
          { text: "I'll find the recovery path if you fall behind." },
        ],
      },
      {
        kind: 'actions',
        primary: { label: 'Adjust the close rate', promptId: 'adjust-rate' },
        secondary: [
          { label: 'Adjust avg case size' },
          { label: 'Show the monthly rhythm', promptId: 'monthly-rhythm' },
        ],
      },
    ],
  },
  {
    id: 'find-slot',
    shortLabel: 'Find me a calendar slot',
    fullPrompt: 'Find me a calendar slot.',
    thinking: ['Reading your calendar', 'Honoring your protected mornings', 'Finding open windows'],
    response: [
      { kind: 'headline', text: 'Three slots that fit your week.' },
      {
        kind: 'bullets',
        items: [
          { text: 'Wed 2:30 pm · 45 min · clear hour after — best for a real talk.' },
          { text: 'Thu 10:30 am · 30 min · between Patel and your block.' },
          { text: 'Fri 1:00 pm · 45 min · light afternoon, your usual cadence.' },
        ],
      },
      {
        kind: 'actions',
        primary: { label: 'Book Wed 2:30 pm', promptId: 'sent-confirmation' },
        secondary: [
          { label: 'Show me next week instead' },
          { label: 'Block this off for Henderson outreach' },
        ],
      },
    ],
  },
  {
    id: 'recovery-plan',
    shortLabel: 'Build the recovery plan',
    fullPrompt: 'Build the recovery plan.',
    thinking: ['Compressing your gap', 'Routing your two strongest paths', 'Building the cadence'],
    response: [
      { kind: 'headline', text: 'Recovery plan · 30 days · two paths.' },
      {
        kind: 'subhead',
        text: 'I sequenced the two highest-yield conversion paths. You can drop either; I\'ll rebuild.',
      },
      {
        kind: 'bullets',
        items: [
          { text: 'Week 1: Convert Maria Diaz term → WL · meeting prepped Wed.', emphasis: true },
          { text: 'Week 2: Convert Diego Russo term → WL · soft script ready.' },
          { text: 'Week 3: Workshop with the Henderson household.' },
          { text: 'Week 4: Pause prospecting · close anything stalled.' },
        ],
      },
      {
        kind: 'actions',
        primary: { label: 'Put it on my calendar', promptId: 'sent-confirmation' },
        secondary: [{ label: 'Swap Diaz for Russo' }, { label: 'Show the math', promptId: 'show-math' }],
      },
    ],
  },
  {
    id: 'monthly-rhythm',
    shortLabel: 'Show the monthly rhythm',
    fullPrompt: 'Show me the monthly rhythm.',
    thinking: ['Translating the math into a cadence'],
    response: [
      { kind: 'headline', text: 'Your monthly rhythm.' },
      {
        kind: 'metric-row',
        metrics: [
          { label: 'FYC / month', value: '$11.5K' },
          { label: 'Cases / month', value: '2.3' },
          { label: 'Client appts / wk', value: '6' },
        ],
      },
      {
        kind: 'metric-row',
        metrics: [
          { label: 'Prospect contacts / wk', value: '8' },
          { label: 'Client reviews / yr', value: '32' },
          { label: 'Referral asks / mo', value: '3' },
        ],
      },
      {
        kind: 'subhead',
        text: "If you close a large case, this relaxes. If you fall behind, I'll find the recovery path.",
      },
      {
        kind: 'actions',
        primary: { label: 'Save as my plan', promptId: 'sent-confirmation' },
        secondary: [{ label: 'Show me the source clients', promptId: 'henderson' }],
      },
    ],
  },
  {
    id: 'start-drill',
    shortLabel: 'Start the 4-min drill',
    fullPrompt: 'Start the 4-min drill.',
    thinking: ['Booting the Patel persona', 'Loading the legacy scenario', 'Calibrating to your tone'],
    response: [
      { kind: 'headline', text: 'Drill loaded. Pressing record in 3.' },
      {
        kind: 'subhead',
        text: "Synthetic Mira Patel ready. Same risk profile, same skepticism. I'll surface real-time feedback as you go.",
      },
      {
        kind: 'bullets',
        items: [
          { text: 'I\'ll measure hedging language, latency, and filler.' },
          { text: 'If you freeze on the legacy question, I\'ll prompt you with a recovery line.' },
        ],
      },
      {
        kind: 'actions',
        primary: { label: 'Begin', promptId: 'sent-confirmation' },
        secondary: [{ label: 'Open the prep card', promptId: 'open-prep-card' }],
      },
    ],
  },
  {
    id: 'open-prep-card',
    shortLabel: 'Open the prep card',
    fullPrompt: 'Open the prep card.',
    thinking: ['Pulling the prep card'],
    response: [
      { kind: 'headline', text: 'Patel · prep card.' },
      {
        kind: 'bullets',
        items: [
          { text: 'Lead with Aanya — she\'s in her senior year.' },
          { text: 'Skip the rate comparison. Mira pushed back last time.' },
          { text: 'Land the legacy frame before anything product-shaped.' },
        ],
      },
      {
        kind: 'sources',
        items: ['Last meeting notes', 'Patel household record', "Coach's drill library"],
      },
      {
        kind: 'actions',
        primary: { label: 'Start the drill', promptId: 'start-drill' },
        secondary: [{ label: 'Send Mira a confirmation', promptId: 'draft-text' }],
      },
    ],
  },
  {
    id: 'sent-confirmation',
    shortLabel: 'Confirmation',
    fullPrompt: 'Done.',
    thinking: ['Saving'],
    response: [
      { kind: 'headline', text: 'Done.' },
      {
        kind: 'subhead',
        text: "I'll surface it back on your briefing tomorrow morning — or sooner if anything changes.",
      },
      {
        kind: 'actions',
        primary: { label: 'Ask me something else' },
      },
    ],
  },
  {
    id: 'capture-notes',
    shortLabel: 'Capture call notes',
    fullPrompt: 'Capture the call.',
    thinking: ['Transcribing', 'Pulling out next steps'],
    response: [
      { kind: 'headline', text: 'Call captured. 3 next steps drafted.' },
      {
        kind: 'bullets',
        items: [
          { text: 'Send the WL illustration (drafted, pending your approval).' },
          { text: 'Book the follow-up · Cesar suggested Tuesday after 2 pm.' },
          { text: 'Update Aanya as a warm next-gen prospect.' },
        ],
      },
      {
        kind: 'actions',
        primary: { label: 'Approve all', promptId: 'sent-confirmation' },
        secondary: [{ label: 'Review one at a time' }],
      },
    ],
  },
  {
    id: 'adjust-rate',
    shortLabel: 'Adjust close rate',
    fullPrompt: 'Let me adjust the close rate.',
    thinking: ['Pulling your last 12 months', 'Modeling sensitivity'],
    response: [
      { kind: 'subhead', text: 'Drag to adjust. Plan updates in place.' },
      {
        kind: 'metric-row',
        metrics: [
          { label: 'Current', value: '34%' },
          { label: 'Cases needed at 30%', value: '32' },
          { label: 'Cases needed at 40%', value: '24' },
        ],
      },
      {
        kind: 'actions',
        primary: { label: 'Keep my actual close rate', promptId: 'sent-confirmation' },
      },
    ],
  },
]
