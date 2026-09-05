// scripts/copy/scenes/onboarding.mjs
import { SECTION_NAMES, SCREEN_NAMES } from '../registry.mjs'
import { buildRow, figmaLink } from '../utils.mjs'

const SCENE = 'OnboardingFlow'
const FILE = 'src/scenes/OnboardingFlow.tsx'

function ob(step, key, copyType, content, opts = {}) {
  return buildRow({
    scene: SCENE,
    section: SECTION_NAMES[step] ?? SCENE,
    screen: SCREEN_NAMES[step] ?? step,
    copyType,
    content,
    key,
    file: FILE,
    figmaLink: figmaLink(step),
    ...opts,
  })
}

export function rows() {
  const out = []

  // Stage rail labels
  ;[
    { step: 'profile', label: 'Profile', sub: 'Where you are now' },
    { step: 'goals', label: 'Goals', sub: "Where you're going" },
    { step: 'business', label: 'Business', sub: 'How you run your business' },
    { step: 'clients', label: 'Clients', sub: 'How you work' },
    { step: 'plan', label: 'Your plan', sub: '' },
  ].forEach(({ step, label, sub }) => {
    out.push(ob('nav', `onboarding.stages.${step}.label`, 'label', label, { line: 23, storage: 'constant' }))
    if (sub) out.push(ob('nav', `onboarding.stages.${step}.sub`, 'label', sub, { line: 23, storage: 'constant' }))
  })

  // Intro taglines
  ;[
    'makes the most of your time.',
    'simplifies your day.',
    'stays current as things change.',
    'bubbles up what matters most.',
    'frees you to focus on clients.',
    'powers your growth & ambitions.',
  ].forEach((t, i) => {
    out.push(ob('intro', `onboarding.intro.taglines[${i}]`, 'tagline', `A plan that ${t}`, { storage: 'constant' }))
  })

  // Intro fixed lines
  ;[
    ['onboarding.intro.line1', 'intro', 'headline', 'You build plans for everyone.'],
    ['onboarding.intro.line2', 'intro', 'headline', "Let's build one for you."],
    ['onboarding.intro.cta', 'intro', 'cta', 'Get started'],
    ['onboarding.intro.greeting', 'intro', 'label', 'Welcome, {advisorName}', 'advisorName'],
  ].forEach(([key, step, type, content, vars]) => {
    out.push(ob(step, key, type, content, { variables: vars || '', storage: 'inline' }))
  })

  // Create-plan step
  ;[
    ['onboarding.create-plan.headline', 'create-plan', 'headline', "Hi, I'm Nyla and I'm here to support your plan."],
    [
      'onboarding.create-plan.body1',
      'create-plan',
      'body',
      "We'll use existing insights about your business, along some questions, to create a plan tailored to your practice and clients.",
    ],
    [
      'onboarding.create-plan.body2',
      'create-plan',
      'body',
      'The next few questions help personalize your experience. It takes about 4 minutes, and you can adjust this information at any time.',
    ],
    ['onboarding.create-plan.cta', 'create-plan', 'cta', "I'm ready"],
  ].forEach(([key, step, type, content]) => {
    out.push(ob(step, key, type, content, { storage: 'inline' }))
  })

  // Welcome step
  ;[
    ['onboarding.welcome.headline', 'welcome', 'headline', "Let's help you get where you want to go."],
    [
      'onboarding.welcome.body',
      'welcome',
      'body',
      "I'm Nyla. Before we start, I want to learn how you work — your book, your rhythm, what you're trying to build. A few quick questions, then I get out of your way.",
    ],
    ['onboarding.welcome.sub', 'welcome', 'body', 'Takes about 3 minutes.'],
    ['onboarding.welcome.cta-primary', 'welcome', 'cta', "Let's start"],
    ['onboarding.welcome.cta-skip', 'welcome', 'cta', 'Skip — just show me the dashboard →'],
  ].forEach(([key, step, type, content]) => {
    out.push(ob(step, key, type, content, { storage: 'inline' }))
  })

  // Profile step
  ;[
    ['onboarding.profile.headline', 'profile', 'headline', "Let's start with what we know"],
    [
      'onboarding.profile.subheadline',
      'profile',
      'body',
      "We've already gathered some information about your practice. Take a look, confirm what's correct, and update anything that needs attention.",
    ],
    ['onboarding.profile.loaded-indicator', 'profile', 'label', 'Profile loaded'],
    [
      'onboarding.profile.analysis',
      'profile',
      'body',
      'You seem to have a strong foundation in protection products, with opportunities to build toward a more holistic advice practice. The questions ahead focus on your future goals.',
    ],
    ['onboarding.profile.cta-primary', 'profile', 'cta', 'Looks good'],
    ['onboarding.profile.cta-secondary', 'profile', 'cta', 'Something seems wrong'],
  ].forEach(([key, step, type, content]) => {
    out.push(ob(step, key, type, content, { storage: 'inline' }))
  })

  // Profile loading waves
  ;[
    'Connecting to Salesforce…',
    'Reading your production history from Salesforce…',
    'Pulling product mix from Salesforce, licensing from Sales Central…',
    'Confirming practice structure in Sales Central…',
  ].forEach((t, i) => {
    out.push(ob('profile', `onboarding.profile.loading[${i}]`, 'loading', t, { storage: 'constant' }))
  })

  // Profile cards
  ;[
    { id: 'years', k: 'Years with New York Life', v: '5', sub: 'Since 2021' },
    { id: 'council', k: 'Council standing', v: 'Quality Council', sub: '2 years running' },
    { id: 'clients', k: 'Active clients', v: '213', sub: 'in your book', src: 'Source: Salesforce' },
    { id: 'pace', k: '2026 production pace', v: '+8%', sub: 'vs. last year', src: 'Source: Salesforce' },
    { id: 'fyc', k: '3 year average FYC', v: '$52K', src: 'Source: Salesforce' },
    {
      id: 'product',
      k: 'Primary product',
      v: 'Protection',
      sub: 'Transitioning to holistic',
      src: 'Source: Salesforce',
    },
    { id: 'licensing', k: 'Licensing', v: '6 active licenses', src: 'Source: Sales Central' },
    { id: 'practice', k: 'Practice type', v: 'Solo', src: 'Source: Sales Central' },
  ].forEach((c) => {
    out.push(ob('profile', `onboarding.profile.cards.${c.id}.label`, 'label', c.k, { storage: 'constant' }))
    out.push(
      ob('profile', `onboarding.profile.cards.${c.id}.value`, 'stat', c.v, {
        storage: 'constant',
        notes: 'Demo value — will be data-driven in production',
      }),
    )
    if (c.sub) out.push(ob('profile', `onboarding.profile.cards.${c.id}.sub`, 'label', c.sub, { storage: 'constant' }))
    if (c.src)
      out.push(ob('profile', `onboarding.profile.cards.${c.id}.source`, 'label', c.src, { storage: 'constant' }))
  })

  // Targets step
  ;[
    [
      'onboarding.targets.body',
      'targets',
      'body',
      'Your manager Elisa F. has set some targets for your development. These factor into how I suggest your goals.',
    ],
    ['onboarding.targets.section-label', 'targets', 'label', 'Your targets'],
    ['onboarding.targets.cta-primary', 'targets', 'cta', 'This looks good'],
    ['onboarding.targets.cta-secondary', 'targets', 'cta', "There's an issue"],
  ].forEach(([key, step, type, content]) => {
    out.push(ob(step, key, type, content, { storage: 'inline' }))
  })

  // Goals intro
  ;[
    [
      'onboarding.goals-intro.headline',
      'goals-intro',
      'headline',
      "Let's define your goals for 2026.",
      '',
      'mode !== "revisit-goals"',
    ],
    [
      'onboarding.goals-intro.headline-revisit',
      'goals-intro',
      'headline',
      "Let's revisit your goals.",
      '',
      'mode === "revisit-goals"',
    ],
    [
      'onboarding.goals-intro.body',
      'goals-intro',
      'body',
      "Set the targets that you want to keep track against. We'll help you figure out the pace and the steps to get there. Don't worry, you can adjust this at any time.",
      '',
      'mode !== "revisit-goals"',
    ],
    [
      'onboarding.goals-intro.body-revisit',
      'goals-intro',
      'body',
      "Walk through each question and update anything that's changed. Your previous answers are already filled in — just adjust what you want and confirm the rest.",
      '',
      'mode === "revisit-goals"',
    ],
    ['onboarding.goals-intro.cta', 'goals-intro', 'cta', 'Continue'],
  ].forEach(([key, step, type, content, vars, cond]) => {
    out.push(ob(step, key, type, content, { variables: vars || '', condition: cond || '', storage: 'inline' }))
  })

  // Advisor vision step
  ;[
    [
      'onboarding.advisor-vision.headline',
      'advisor-vision',
      'headline',
      'Anything else you want to share about your vision?',
    ],
    ['onboarding.advisor-vision.sub', 'advisor-vision', 'body', 'In your own words — no right answer.'],
    [
      'onboarding.advisor-vision.placeholder',
      'advisor-vision',
      'placeholder',
      'e.g. Someone who helps people think about their whole financial picture, not just their policies',
    ],
  ].forEach(([key, step, type, content]) => {
    out.push(ob(step, key, type, content, { storage: 'inline' }))
  })

  // Direction step
  ;[
    [
      'onboarding.direction.headline',
      'direction',
      'headline',
      'Where do you want your practice to head in the next 2–3 years?',
    ],
    ['onboarding.direction.sub', 'direction', 'body', 'Select up to 3.'],
  ].forEach(([key, step, type, content]) => {
    out.push(ob(step, key, type, content, { storage: 'inline' }))
  })
  ;[
    {
      id: 'holistic',
      title: 'Become a true holistic financial advisor',
      sub: 'Planning, investments, protection together',
    },
    { id: 'eagle', title: 'Build toward Eagle and investment advisory', sub: 'IAR track, AUM, fee-based' },
    { id: 'referrals', title: 'Generating qualified referrals consistently', sub: 'Before expanding further' },
    {
      id: 'referral-practice',
      title: 'Build a referral-driven practice',
      sub: 'Less cold outreach, more warm pipeline',
    },
    { id: 'team', title: 'Build toward a team-based model', sub: 'Teaming, staff, shared clients' },
  ].forEach((o) => {
    out.push(ob('direction', `onboarding.direction.options.${o.id}.title`, 'label', o.title, { storage: 'constant' }))
    out.push(ob('direction', `onboarding.direction.options.${o.id}.sub`, 'label', o.sub, { storage: 'constant' }))
  })

  // FYC target step
  ;[
    ['onboarding.fyc-target.headline', 'fyc-target', 'headline', "Let's set meaningful targets that work for you."],
    [
      'onboarding.fyc-target.body',
      'fyc-target',
      'body',
      'I recommend aiming for $42,000–$51,000 targets based on your past performance and current targets. You can adjust them at any time.',
    ],
    ['onboarding.fyc-target.card-heading', 'fyc-target', 'label', 'Set your FYC target for 2026'],
    ['onboarding.fyc-target.gauge-conservative', 'fyc-target', 'label', 'Conservative'],
    ['onboarding.fyc-target.gauge-stretch', 'fyc-target', 'label', 'Stretch'],
    [
      'onboarding.fyc-target.feedback-conservative',
      'fyc-target',
      'body',
      'A conservative goal that builds momentum.',
      '',
      'val < 35000',
    ],
    [
      'onboarding.fyc-target.feedback-ambitious',
      'fyc-target',
      'body',
      'This is a comfortably ambitious goal based on your current trajectory.',
      '',
      '35000 <= val <= 55000',
    ],
    [
      'onboarding.fyc-target.feedback-stretch',
      'fyc-target',
      'body',
      'A stretch — possible, but it leaves no slack.',
      '',
      'val > 55000',
    ],
    ['onboarding.fyc-target.cta', 'fyc-target', 'cta', 'Save this goal'],
  ].forEach(([key, step, type, content, vars, cond]) => {
    out.push(ob(step, key, type, content, { variables: vars || '', condition: cond || '', storage: 'inline' }))
  })

  // Activity targets step
  ;[
    ['onboarding.activity-target.headline', 'activity-target', 'headline', 'What are your weekly activity targets?'],
    [
      'onboarding.activity-target.sub',
      'activity-target',
      'body',
      'These give your plan leading indicators, beyond outcomes tracking.',
    ],
    [
      'onboarding.activity-target.guidance',
      'activity-target',
      'body',
      "I've suggested a comfortable starting point based on your historic performance and current goals.",
    ],
    ['onboarding.activity-target.slider1-label', 'activity-target', 'label', 'New prospects to contact'],
    ['onboarding.activity-target.slider2-label', 'activity-target', 'label', 'Client appointments'],
    ['onboarding.activity-target.slider3-label', 'activity-target', 'label', 'Client reviews'],
    ['onboarding.activity-target.cta', 'activity-target', 'cta', 'Next'],
  ].forEach(([key, step, type, content]) => {
    out.push(ob(step, key, type, content, { storage: 'inline' }))
  })

  // Outside work step
  ;[
    [
      'onboarding.outside-work.headline',
      'outside-work',
      'headline',
      'What are you looking forward to outside of work this year?',
    ],
    [
      'onboarding.outside-work.sub',
      'outside-work',
      'body',
      "Optional. This is what makes your morning briefing feel like it's on your side, not just your pipeline.",
    ],
    ['onboarding.outside-work.placeholder', 'outside-work', 'placeholder', 'Or describe in your own words…'],
  ].forEach(([key, step, type, content]) => {
    out.push(ob(step, key, type, content, { storage: 'inline' }))
  })
  ;[
    'Time with family',
    'Travel',
    'A wellness and fitness goal',
    'A passion project',
    'Financial independence',
    'More free time',
  ].forEach((t, i) => {
    out.push(ob('outside-work', `onboarding.outside-work.chips[${i}]`, 'tag', t, { storage: 'constant' }))
  })

  // Growth intro
  ;[
    [
      'onboarding.growth-intro.headline',
      'growth-intro',
      'headline',
      "We've talked about your goals; now let's talk about how you want to get there.",
    ],
    [
      'onboarding.growth-intro.body',
      'growth-intro',
      'body',
      "We'll synthesize everything — your goals, your book, your calendar — and put the most important things in front of you each day. These answers shape what that feels like.",
    ],
    ['onboarding.growth-intro.cta', 'growth-intro', 'cta', "Let's do it"],
  ].forEach(([key, step, type, content]) => {
    out.push(ob(step, key, type, content, { storage: 'inline' }))
  })

  // Progress areas step
  ;[
    ['onboarding.progress-areas.headline', 'progress-areas', 'headline', 'How do you want to grow this year?'],
    [
      'onboarding.progress-areas.sub',
      'progress-areas',
      'body',
      "Choose up to 3 — I'll prioritize the work around these.",
    ],
  ].forEach(([key, step, type, content]) => {
    out.push(ob(step, key, type, content, { storage: 'inline' }))
  })
  ;[
    { id: 'eagle', title: 'Understanding my path to Eagle or IAR', sub: "Licensing, sequencing, what's next" },
    { id: 'broader', title: 'Starting broader planning conversations', sub: 'Moving clients beyond protection' },
    { id: 'referrals', title: 'Generating qualified referrals consistently', sub: 'Beyond my initial market' },
    { id: 'positioning', title: 'Positioning NYL as a full partner', sub: 'Not just life insurance' },
    { id: 'pipeline', title: 'Keeping pipeline moving despite service burden', sub: 'Finding time to prospect' },
    { id: 'holistic', title: 'Understanding how holistic activity pays me', sub: 'Council, Eagle, fee-based' },
  ].forEach((o) => {
    out.push(
      ob('progress-areas', `onboarding.progress-areas.options.${o.id}.title`, 'label', o.title, {
        storage: 'constant',
      }),
    )
    out.push(
      ob('progress-areas', `onboarding.progress-areas.options.${o.id}.sub`, 'label', o.sub, { storage: 'constant' }),
    )
  })

  // Time pulls step
  ;[
    ['onboarding.time-pulls.headline', 'time-pulls', 'headline', "What's eating your week right now?"],
    ['onboarding.time-pulls.sub', 'time-pulls', 'body', "Choose up to 3 — I'll start by taking these off your plate."],
  ].forEach(([key, step, type, content]) => {
    out.push(ob(step, key, type, content, { storage: 'inline' }))
  })
  ;[
    { id: 'nigo', title: 'Chasing case status and NIGO updates', sub: 'Delays that kill momentum' },
    { id: 'service', title: 'Client service issues pulling me away', sub: 'From prospecting and growth' },
    { id: 'systems', title: 'Finding the right system, form, or answer', sub: 'Too much hunting' },
    {
      id: 'meeting-prep',
      title: 'Preparing for meetings across product lines',
      sub: 'More complex than pure protection',
    },
    { id: 'admin', title: 'Admin after meetings', sub: 'Notes, next steps, follow-up emails' },
    { id: 'workflows', title: 'Managing multi-product workflows', sub: 'Life + investments + planning' },
  ].forEach((o) => {
    out.push(ob('time-pulls', `onboarding.time-pulls.options.${o.id}.title`, 'label', o.title, { storage: 'constant' }))
    out.push(ob('time-pulls', `onboarding.time-pulls.options.${o.id}.sub`, 'label', o.sub, { storage: 'constant' }))
  })

  // Clients intro
  ;[
    [
      'onboarding.clients-intro.headline',
      'clients-intro',
      'headline',
      "You've told us where you're headed. Now let's understand how you're spending your time with clients.",
    ],
    [
      'onboarding.clients-intro.body',
      'clients-intro',
      'body',
      "This is about how you engage clients, where you want support, and what earns your attention. I'll use those signals to surface the right opportunities, conversations, and next steps at the right time.",
    ],
    ['onboarding.clients-intro.cta', 'clients-intro', 'cta', "Let's do it"],
  ].forEach(([key, step, type, content]) => {
    out.push(ob(step, key, type, content, { storage: 'inline' }))
  })

  // Client signals
  ;[
    ['onboarding.client-signals.headline', 'client-signals', 'headline', 'Which client signals matter most to you?'],
    [
      'onboarding.client-signals.sub',
      'client-signals',
      'body',
      "Select all that apply. I'll prioritize your alerts in this order.",
    ],
  ].forEach(([key, step, type, content]) => {
    out.push(ob(step, key, type, content, { storage: 'inline' }))
  })
  ;[
    { id: 'life', title: 'Life events worth a planning conversation', sub: 'The right moment to go deeper' },
    { id: 'lapse', title: 'Lapse & retention risks', sub: 'Clients at risk before they act' },
    { id: 'expansion', title: 'Holistic expansion signals', sub: 'Clients ready for more than protection' },
    { id: 'milestones', title: 'Policy & plan milestones', sub: 'Anniversaries, conversion windows, RMDs' },
    { id: 'referral', title: 'Referral network signals', sub: 'Household connections worth exploring' },
  ].forEach((o) => {
    out.push(
      ob('client-signals', `onboarding.client-signals.options.${o.id}.title`, 'label', o.title, {
        storage: 'constant',
      }),
    )
    out.push(
      ob('client-signals', `onboarding.client-signals.options.${o.id}.sub`, 'label', o.sub, { storage: 'constant' }),
    )
  })

  // Client conversations
  ;[
    [
      'onboarding.client-conversations.headline',
      'client-conversations',
      'headline',
      'Which client conversations do you want more support with?',
    ],
    [
      'onboarding.client-conversations.sub',
      'client-conversations',
      'body',
      'Select up to three areas where pre-meeting prep would help the most.',
    ],
  ].forEach(([key, step, type, content]) => {
    out.push(ob(step, key, type, content, { storage: 'inline' }))
  })
  ;[
    { id: 'protection', title: 'Protection & life insurance' },
    { id: 'retirement', title: 'Retirement income' },
    { id: 'investment', title: 'Investment planning' },
    { id: 'estate', title: 'Estate and legacy' },
    { id: 'business', title: 'Business owner solutions' },
    { id: 'ltc', title: 'LTC & benefits' },
  ].forEach((o) => {
    out.push(
      ob('client-conversations', `onboarding.client-conversations.options.${o.id}.title`, 'label', o.title, {
        storage: 'constant',
      }),
    )
  })

  // Stay in front
  ;[
    [
      'onboarding.stay-in-front.headline',
      'stay-in-front',
      'headline',
      'How do you currently stay connected with clients and prospects between meetings?',
    ],
    ['onboarding.stay-in-front.sub', 'stay-in-front', 'body', 'Select up to three methods you use the most today.'],
  ].forEach(([key, step, type, content]) => {
    out.push(ob(step, key, type, content, { storage: 'inline' }))
  })

  // Plan step
  ;[
    ['onboarding.plan.headline', 'plan', 'headline', "Here's how your goals become a plan."],
    [
      'onboarding.plan.body',
      'plan',
      'body',
      "You set a goal of {fyc}. Let's do the math to figure out a weekly cadence of how many cases and appointments you need to take to get you there.",
      'fyc',
    ],
    ['onboarding.plan.cta', 'plan', 'cta', 'Build my plan'],
  ].forEach(([key, step, type, content, vars]) => {
    out.push(ob(step, key, type, content, { variables: vars || '', storage: 'inline' }))
  })

  // Processing states
  ;[
    'Processing your inputs',
    'Personalizing',
    'Calibrating',
    'Refining your plan',
    'Mapping your goals',
    'Almost there',
  ].forEach((t, i) => {
    out.push(ob('processing', `onboarding.processing[${i}]`, 'loading', t, { storage: 'constant' }))
  })

  // Right rail
  ;[
    ['onboarding.plan-rail.heading', 'plan-rail', 'label', 'Building your plan'],
    ['onboarding.plan-rail.section1', 'plan-rail', 'label', 'Long-term goals'],
    ['onboarding.plan-rail.section2', 'plan-rail', 'label', 'Your business'],
    ['onboarding.plan-rail.section3', 'plan-rail', 'label', 'Your clients'],
    ['onboarding.plan-rail.calibrating', 'plan-rail', 'loading', 'Calibrating…'],
  ].forEach(([key, step, type, content]) => {
    out.push(ob(step, key, type, content, { storage: 'inline' }))
  })

  return out.filter(Boolean)
}
