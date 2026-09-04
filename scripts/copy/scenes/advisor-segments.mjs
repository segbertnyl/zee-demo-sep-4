// scripts/copy/scenes/advisor-segments.mjs
import { FIGMA_BASE } from '../registry.mjs'
import { buildRow, SEG_STEP_MAP } from '../utils.mjs'

function segAdd(seg, stepKey, copyType, content, optionId, vars) {
  const m = SEG_STEP_MAP[stepKey]
  const keyParts = optionId ? `${stepKey}.${optionId}` : stepKey
  return buildRow({
    scene: 'AdvisorSegments',
    section: m.section,
    screen: m.screen,
    segment: seg.code,
    copyType,
    content,
    variables: vars || '',
    figmaLink: m.frame ? `${FIGMA_BASE}${m.frame}` : '',
    key: `segment.${seg.code}.${keyParts}`,
    file: 'src/data/advisorSegments.ts',
    storage: 'data-file',
  })
}

const SEGMENTS = [
  {
    code: 'cs-leading',
    label: 'Core Specialist · Leading (Marcus)',
    intro: {
      coachIdentityPrompt: "How would your best long-term clients describe what makes you different from other advisors they've worked with?",
      coachIdentityPlaceholder: "e.g., Warm and direct. They know I'm being straight with them, not selling.",
      coachConsentLabel: 'Would you like the OS to flag when your activity pace changes — so you can get ahead of it before it affects your numbers?',
      brandVoicePlaceholder: "e.g., Warm, direct. They know I'm being straight with them, not selling.",
      chiefBigGoalPlaceholder: "e.g., Building a practice that doesn't depend on me being in every room.",
    },
    growthAreas: [
      { id: 'scale',     label: 'Scaling without adding complexity',       sub: 'Doing more with what I have' },
      { id: 'holistic',  label: 'Deepening into planning conversations',   sub: 'Beyond protection' },
      { id: 'team',      label: 'Building or developing my team',          sub: 'Succession, teaming, staff' },
      { id: 'digital',   label: 'Building a stronger digital presence',    sub: 'Brand, referrals, LinkedIn' },
      { id: 'retention', label: 'Holding onto clients at key transitions', sub: 'Policy changes, rate shopping' },
      { id: 'complex',   label: 'Handling more complex cases',             sub: 'Advanced UW, appeals, ratings' },
    ],
    analystMorning: [
      { id: 'atrisk',    label: 'Clients at risk of lapsing or churning',       sub: 'Before they act' },
      { id: 'lifeevent', label: 'Clients with a life event or signal',          sub: 'Worth a personal call' },
      { id: 'crosssell', label: 'Cross-sell and deepening opportunities',       sub: 'In my existing book' },
      { id: 'pipeline',  label: 'Pipeline items that need attention',           sub: 'Cases, follow-ups, open items' },
      { id: 'council',   label: 'Where I am vs. my council goal',               sub: 'Pacing and gap' },
    ],
    analystSignals: [
      { id: 'lapse',     label: 'Lapse & at-risk alerts',                       sub: 'Before the client calls to cancel' },
      { id: 'lifeevent', label: 'Life events (marriage, kids, job, home)',       sub: 'Moments to reach out' },
      { id: 'milestone', label: 'Policy milestones & anniversaries',            sub: 'Cash value, conversion windows' },
      { id: 'crosssell', label: 'Cross-sell gaps in my book',                   sub: "Coverage they don't have yet" },
      { id: 'market',    label: 'Market changes affecting client portfolios',   sub: 'Rate changes, product updates' },
    ],
    strategistDirections: [
      { id: 'deepen',    label: 'Go deeper into protection',                    sub: "Build on what's working" },
      { id: 'holistic',  label: 'Expand into planning and holistic advice',     sub: 'Move clients beyond protection' },
      { id: 'team',      label: 'Scale with a team or develop a successor',     sub: 'Build something that outlasts me' },
      { id: 'eagle',     label: 'Grow my Eagle and investment advisory book',   sub: 'AUM, fee-based, wealth management' },
      { id: 'stabilize', label: 'Stabilize and serve what I have',              sub: 'Quality over growth right now' },
    ],
    conciergeSlows: [
      { id: 'service',     label: 'Client service requests & follow-ups',         sub: 'Too many inbound requests' },
      { id: 'casetrack',   label: 'Tracking cases through underwriting',          sub: 'Chasing status and NIGOs' },
      { id: 'meetingprep', label: 'Meeting prep for a large client book',         sub: '633 clients to stay ahead of' },
      { id: 'staff',       label: 'Coordinating work across my staff',            sub: 'Too much passing through me' },
      { id: 'admin',       label: 'Admin after meetings',                         sub: 'Notes, follow-ups, next steps' },
      { id: 'systems',     label: 'Navigating too many systems',                  sub: 'Finding the right answer fast' },
    ],
    conciergeTimeSuggestions: [
      'Admin after client meetings',
      'Chasing case status across systems',
      'Coordinating with staff on routine tasks',
      'Manually pulling reports and dashboards',
    ],
    conciergeEliminatePrompt: 'If you could reclaim 5 hours a week from one thing, what would it be?',
    brandChannels: [
      { id: 'personal',  label: 'Personal emails I write myself',              sub: 'High-touch, relationship-first' },
      { id: 'phone',     label: 'Phone calls — I prefer direct contact',       sub: 'Not a big email person' },
      { id: 'social',    label: 'LinkedIn — building my professional brand',   sub: 'Referrals, visibility, COIs' },
      { id: 'events',    label: 'Events I host or attend',                     sub: 'Seminars, community, client dinners' },
      { id: 'referrals', label: 'Referral requests from happy clients',        sub: 'My primary growth channel' },
      { id: 'nosystem',  label: "I don't have a consistent system",            sub: "I'd like to change that" },
    ],
    brandLifeEventInstincts: [
      { id: 'always',    label: 'I reach out immediately — always',              sub: "It's what the relationship is for" },
      { id: 'financial', label: "I reach out if there's a clear financial angle", sub: 'Targeted, not reflexive' },
      { id: 'sooner',    label: "I'd reach out more if I knew sooner",           sub: 'The timing is the challenge' },
      { id: 'wait',      label: 'I let clients come to me at these moments',     sub: "I don't want to intrude" },
    ],
    chiefOsStyleOptions: [
      { id: 'briefing', label: 'Give me a morning briefing when I start',          sub: 'Top priorities, no noise' },
      { id: 'urgent',   label: 'Only alert me when something urgent needs action', sub: 'I prefer quiet unless it matters' },
      { id: 'auto',     label: 'Handle routine tasks without asking me',           sub: 'I trust it — just get it done' },
      { id: 'checkin',  label: 'Check in when my pace shifts',                     sub: "I want to know before it's a problem" },
    ],
  },
  {
    code: 'hl-accelerating',
    label: 'Holistic Leaning · Accelerating (Priya)',
    intro: {
      coachIdentityPrompt: "What kind of advisor are you building toward — how would you want clients to describe you in 3 years?",
      coachIdentityPlaceholder: 'e.g., Someone who helps people think about their whole financial picture, not just their policies.',
      coachConsentLabel: 'Would you like the OS to check in when your activity slows down — and surface specific actions to get back on track?',
      brandVoicePlaceholder: 'e.g., Thoughtful and curious. Like a friend who happens to know a lot about money.',
      chiefBigGoalPlaceholder: 'e.g., Having my first clients who think of me as their full financial advisor, not just their insurance person.',
    },
    growthAreas: [
      { id: 'pathway',      label: 'Understanding my path to Eagle or IAR',               sub: "Licensing, sequencing, what's next" },
      { id: 'conversation', label: 'Starting broader planning conversations',              sub: 'Moving clients beyond protection' },
      { id: 'referral',     label: 'Generating qualified referrals consistently',          sub: 'Beyond my initial market' },
      { id: 'positioning',  label: 'Positioning NYL as a full financial partner',          sub: 'Not just life insurance' },
      { id: 'pipeline',     label: 'Keeping pipeline moving despite service burden',       sub: 'Finding time to prospect' },
      { id: 'compensation', label: 'Understanding how holistic activity pays me',          sub: 'Council, Eagle, fee-based' },
    ],
    analystMorning: [
      { id: 'pathway',   label: 'Clients ready for a holistic conversation',    sub: 'Beyond what they have today' },
      { id: 'lifeevent', label: 'Life events worth reaching out about',          sub: 'Timely, personal moments' },
      { id: 'pipeline',  label: 'Pipeline items that need my attention',         sub: 'Cases, NIGOs, follow-ups' },
      { id: 'referral',  label: 'Referral opportunities in my book',             sub: 'Household and network connections' },
      { id: 'council',   label: 'My production pace vs. goal',                   sub: 'What I need to do this week' },
    ],
    analystSignals: [
      { id: 'lifeevent', label: 'Life events worth a planning conversation',     sub: 'The right moment to go deeper' },
      { id: 'lapse',     label: 'Lapse & retention risks',                       sub: 'Clients at risk before they act' },
      { id: 'crosssell', label: 'Holistic expansion signals',                    sub: 'Clients ready for more than protection' },
      { id: 'milestone', label: 'Policy & plan milestones',                      sub: 'Anniversaries, conversion windows, RMDs' },
      { id: 'referral',  label: 'Referral network signals',                      sub: 'Household connections worth exploring' },
    ],
    strategistDirections: [
      { id: 'holistic',    label: 'Become a true holistic financial advisor',    sub: 'Planning, investments, protection together' },
      { id: 'eagle',       label: 'Build toward Eagle and investment advisory',  sub: 'IAR track, AUM, fee-based' },
      { id: 'protection',  label: 'Strengthen my protection foundation first',   sub: 'Before expanding further' },
      { id: 'referral',    label: 'Build a referral-driven practice',            sub: 'Less cold outreach, more warm pipeline' },
      { id: 'team',        label: 'Build toward a team-based model',             sub: 'Teaming, staff, shared clients' },
    ],
    conciergeSlows: [
      { id: 'casetrack',   label: 'Chasing case status and NIGO updates',         sub: 'Delays that kill momentum' },
      { id: 'service',     label: 'Client service issues pulling me away',        sub: 'From prospecting and growth' },
      { id: 'navigation',  label: 'Finding the right system, form, or answer',    sub: 'Too much hunting' },
      { id: 'meetingprep', label: 'Preparing for meetings across product lines',  sub: 'More complex than pure protection' },
      { id: 'admin',       label: 'Admin after meetings',                         sub: 'Notes, next steps, follow-up emails' },
      { id: 'workflow',    label: 'Managing multi-product workflows',             sub: 'Life + investments + planning' },
    ],
    conciergeTimeSuggestions: [
      'Following up on stalled cases',
      'Navigating which system has the answer',
      'Writing post-meeting emails from scratch',
      'Preparing for meetings across multiple product lines',
    ],
    conciergeEliminatePrompt: "What's the one thing in your week that consistently pulls you away from the work that actually grows your business?",
    brandChannels: [
      { id: 'personal',  label: 'Personal emails — relationship-driven',          sub: 'I write them myself' },
      { id: 'social',    label: 'LinkedIn and social media',                      sub: 'Building my profile as a broader advisor' },
      { id: 'referrals', label: 'Referral requests and COI relationships',        sub: 'Key to growing beyond warm market' },
      { id: 'events',    label: 'Events and community involvement',               sub: 'Niche or market-specific' },
      { id: 'content',   label: 'Sharing content and market insights',            sub: 'Email, social, text' },
      { id: 'nosystem',  label: 'I want to do more but lack a system',            sub: 'Would like help building one' },
    ],
    brandLifeEventInstincts: [
      { id: 'always',    label: 'I try to reach out — it matters to clients',     sub: 'Even if just to acknowledge' },
      { id: 'sooner',    label: "I'd do it more if I knew about it sooner",       sub: 'I miss too many moments' },
      { id: 'financial', label: "I reach out when there's a financial angle",     sub: 'I focus on relevant moments' },
      { id: 'unsure',    label: "I'm not sure what's appropriate yet",            sub: 'I could use guidance on this' },
    ],
    chiefOsStyleOptions: [
      { id: 'briefing', label: 'Give me a morning briefing',           sub: 'Show me what needs attention today' },
      { id: 'urgent',   label: 'Alert me when something needs action', sub: 'Cases, signals, time-sensitive items' },
      { id: 'auto',     label: 'Handle routine admin without asking',  sub: 'Free me up for client-facing work' },
      { id: 'checkin',  label: "Check in when I'm off pace",           sub: "So I can adjust before it's too late" },
      { id: 'quiet',    label: 'Stay quiet unless I ask',              sub: "I'll use it on my terms" },
    ],
  },
  {
    code: 'cs-building',
    label: 'Core Specialist · Building (Jordan)',
    intro: {
      coachIdentityPrompt: "What drew you to this career — what do you most want to be known for with clients?",
      coachIdentityPlaceholder: 'e.g., The advisor who actually shows up and takes the time to explain things.',
      coachConsentLabel: 'Would you like the OS to check in with you when momentum dips — not just report on it, but actually help you get moving again?',
      brandVoicePlaceholder: "e.g., Approachable and real — I don't want to sound like a corporate script.",
      chiefBigGoalPlaceholder: "e.g., Getting to a point where I stop worrying about whether this career is going to work.",
    },
    growthAreas: [
      { id: 'nameflow',      label: 'Building name flow beyond warm market',              sub: 'New prospects, referrals' },
      { id: 'conversations', label: 'Starting and handling client conversations',         sub: 'Discovery, objections, closing' },
      { id: 'workflow',      label: 'Navigating applications and underwriting',           sub: 'Less chasing, more selling' },
      { id: 'income',        label: 'Understanding how my income works',                  sub: 'Commission, chargeback, council' },
      { id: 'rhythm',        label: 'Building a weekly routine that works',               sub: 'Prospecting, meetings, follow-up' },
      { id: 'confidence',    label: 'Building confidence in client conversations',        sub: 'Role-play, scripts, objections' },
    ],
    analystMorning: [
      { id: 'leads',    label: 'New leads or prospects to contact',    sub: 'Who to call today' },
      { id: 'pipeline', label: 'Cases and applications that need action', sub: 'NIGOs, status, next steps' },
      { id: 'followup', label: "Follow-ups I haven't done yet",         sub: "Who's waiting to hear from me" },
      { id: 'income',   label: 'Where I am vs. my income goal',         sub: 'This week, this month' },
      { id: 'learning', label: 'Something to improve my craft',         sub: 'A skill, scenario, or tip' },
    ],
    analystSignals: [
      { id: 'leads',     label: 'New leads assigned to me',                  sub: 'With a 24-hour action window' },
      { id: 'followup',  label: "Prospects I haven't contacted recently",    sub: "Who's been waiting" },
      { id: 'nigo',      label: 'NIGO and case issues that need me',         sub: 'Before they delay further' },
      { id: 'lifeevent', label: 'Life events in my small book',              sub: 'Moments to check in' },
      { id: 'learning',  label: 'When my activity is off track',             sub: "So I can adjust before week's end" },
    ],
    strategistDirections: [
      { id: 'survive',    label: 'Establish a sustainable income this year',           sub: 'Make the career work financially' },
      { id: 'protection', label: 'Build a strong protection practice',                sub: 'Life, WL, term — core products' },
      { id: 'holistic',   label: 'Start learning holistic conversations early',        sub: "Even before I'm fully licensed" },
      { id: 'referral',   label: 'Build a referral-based pipeline',                   sub: "So I'm not always starting cold" },
      { id: 'niche',      label: 'Find a market or community to specialize in',       sub: 'A niche I can own' },
    ],
    conciergeSlows: [
      { id: 'navigation',  label: 'Finding the right tool, form, or answer',          sub: 'Too many systems, unclear paths' },
      { id: 'casetrack',   label: 'Submitting and tracking my first cases',           sub: 'Applications, NIGOs, UW updates' },
      { id: 'admin',       label: 'Admin that pulls me away from prospecting',        sub: 'Notes, logging, emails' },
      { id: 'followup',    label: 'Following up consistently',                        sub: "I forget who's waiting on me" },
      { id: 'conversions', label: 'Converting initial interest to appointments',      sub: 'The reply-then-silence cycle' },
      { id: 'income',      label: 'Understanding what my income actually looks like', sub: 'Commission timing, chargebacks' },
    ],
    conciergeTimeSuggestions: [
      'Figuring out where to go for what',
      'Manually tracking my pipeline in a spreadsheet',
      'Writing follow-up emails after every meeting',
      'Chasing NIGO updates and UW status',
    ],
    conciergeEliminatePrompt: "What's taking the most time in your week that feels like it shouldn't be your job?",
    brandChannels: [
      { id: 'personal',  label: 'Personal texts or calls',              sub: "Still building my natural market" },
      { id: 'social',    label: 'Social media — building my presence',  sub: 'LinkedIn, Instagram, community groups' },
      { id: 'referrals', label: 'Asking happy clients for referrals',   sub: 'My best source right now' },
      { id: 'events',    label: 'Community events and local groups',    sub: 'Where I meet new people' },
      { id: 'content',   label: 'Sharing educational content',          sub: 'Building trust before the ask' },
      { id: 'nosystem',  label: "I don't have a system yet",            sub: "I'd like one" },
    ],
    brandLifeEventInstincts: [
      { id: 'always',    label: 'I try to reach out — it matters to clients',     sub: 'Even if just to acknowledge' },
      { id: 'sooner',    label: "I'd do it more if I knew about it sooner",       sub: 'I miss too many moments' },
      { id: 'financial', label: "I reach out when there's a financial angle",     sub: 'I focus on relevant moments' },
      { id: 'unsure',    label: "I'm not sure what's appropriate yet",            sub: 'I could use guidance on this' },
    ],
    chiefOsStyleOptions: [
      { id: 'briefing',   label: 'Walk me through my day each morning',   sub: "I'm still building my routine" },
      { id: 'stepbystep', label: 'Guide me step by step on new tasks',    sub: 'Applications, illustrations, UW' },
      { id: 'checkin',    label: "Check in if I haven't done my activity", sub: 'Help me stay consistent' },
      { id: 'urgent',     label: 'Alert me when something needs action',  sub: 'Cases, leads, follow-ups' },
    ],
  },
]

export function rows() {
  const out = []

  SEGMENTS.forEach(seg => {
    // Intro prompts & placeholders
    out.push(segAdd(seg, 'intro', 'headline',    seg.intro.coachIdentityPrompt,       'coachIdentityPrompt'))
    out.push(segAdd(seg, 'intro', 'placeholder', seg.intro.coachIdentityPlaceholder,  'coachIdentityPlaceholder'))
    out.push(segAdd(seg, 'intro', 'label',       seg.intro.coachConsentLabel,         'coachConsentLabel'))
    out.push(segAdd(seg, 'intro', 'placeholder', seg.intro.brandVoicePlaceholder,     'brandVoicePlaceholder'))
    out.push(segAdd(seg, 'intro', 'placeholder', seg.intro.chiefBigGoalPlaceholder,   'chiefBigGoalPlaceholder'))

    // Option arrays — title + sub per option
    const optionFields = [
      'growthAreas', 'analystMorning', 'analystSignals',
      'strategistDirections', 'conciergeSlows',
      'brandChannels', 'brandLifeEventInstincts', 'chiefOsStyleOptions',
    ]
    optionFields.forEach(field => {
      seg[field].forEach(opt => {
        out.push(segAdd(seg, field, 'label', opt.label, `${opt.id}.label`))
        if (opt.sub) out.push(segAdd(seg, field, 'label', opt.sub, `${opt.id}.sub`))
      })
    })

    // Time suggestions (plain strings)
    seg.conciergeTimeSuggestions.forEach((t, i) => {
      out.push(segAdd(seg, 'conciergeTimeSuggestions', 'tag', t, `[${i}]`))
    })

    // Eliminate prompt (single question)
    out.push(segAdd(seg, 'conciergeEliminatePrompt', 'body', seg.conciergeEliminatePrompt, ''))
  })

  return out.filter(Boolean)
}
