// scripts/copy/scenes/briefing.mjs
import { buildRow } from '../utils.mjs'

const FILE = 'src/data/briefingContent.ts'

function bAdd(segment, section, screen, copyType, content, key, vars, condition) {
  return buildRow({
    scene: 'Briefing',
    section,
    screen,
    segment,
    copyType,
    content,
    key,
    variables: vars || '',
    condition: condition || '',
    figmaLink: '',
    file: FILE,
    storage: 'data-file',
  })
}

const DAILY_BRIEFINGS = [
  {
    segment: 'cs-leading',
    opportunityToday: {
      fycInPlayLabel: '$6,000 in FYC is sitting on your desk today.',
      ringNudge: 'Close two threads today and you cross 80% — Cabinet pace.',
      streak: '9 days in a row above 80% pace',
    },
    headline: 'Clear the Anderson stall before 10 — one call resets your highest-leverage close of the week.',
    summary: 'Two threads ready to close · 2 meetings · one 10-minute call clears your biggest stall',
    whyThisOrder: 'You told the OS lapse & at-risk alerts and pipeline items come first. Anderson hits both.',
    priorities: [
      {
        id: 'anderson',
        headline:
          'Tom Anderson has been sitting at underwriting for 11 days on a missing form. One 10-minute call clears it.',
        sub: null,
        badgeLabel: 'Urgent',
        details: {
          analysis:
            "Whole life app stalled at underwriting due to a missing APS medical form and Tom hasn't received the request.",
          insight:
            'This is a system failure, not a client failure since the form was never sent. One resend resolves it.',
          recommendation: 'Call Tom Anderson to set expectations, then resend APS request via Sales Central.',
          followup: "You'll hit $4,200 FYC if this closes.",
        },
      },
      {
        id: 'clarke',
        headline: "Prepare for Emma Clarke's annual review at 11:00 AM",
        sub: '12-year client · WL + term + investment · pre-meeting brief loaded',
        badgeLabel: 'Prep ready',
      },
      {
        id: 'lau',
        headline: "Patricia Lau's UL policy lapses in 2 days — payment not received",
        sub: 'Day 28 of 30 · $1,800 FYC reversal risk',
        badgeLabel: 'Urgent',
      },
      {
        id: 'okafor',
        headline: 'Derek Okafor prospect discovery at 2:30 PM — confirm meeting first',
        sub: 'Referred by Clarke · business owner, age 44, no current life coverage',
        badgeLabel: 'Need to prep',
      },
      {
        id: 'clarke-referral',
        headline: "Emma's business partner may need coverage — listen for the second name at close",
        sub: "Opportunity surfaces in today's annual review",
        badgeLabel: 'Opportunity',
      },
      {
        id: 'holloway',
        headline: 'James Holloway turns 45 in six months — WL age-change deadline approaching',
        sub: 'Add to next-week contact list',
        badgeLabel: 'Monitor',
      },
    ],
    schedule: [
      {
        id: 'admin',
        title: 'Office open / admin block',
        body: 'Anderson follow-up call, inbox triage, pipeline review. Target: clear the APS hold before 10.',
      },
      {
        id: 'clarke',
        title: 'Emma Clarke — Annual Review',
        body: '12-year client, WL + term + investment account. Key agenda: beneficiary update (catch before she notices), fee-based rollover conversation ($210K), college funding gap. See pre-meeting brief for full pack.',
      },
      {
        id: 'okafor',
        title: 'Derek Okafor — Prospect discovery',
        body: 'Referred by Clarke. Business owner, age 44, no current life coverage. Target: term + DI conversation. Confirm meeting — he was only verbal-committed.',
      },
      {
        id: 'wrap',
        title: 'End-of-day wrap',
        body: 'Log meeting notes, queue follow-ups, update pipeline. Flag Okafor for Concierge scheduling.',
      },
    ],
    signals: [
      {
        id: 'lau',
        title: 'Patricia Lau — policy lapse warning (day 28 of 30)',
        body: 'UL policy. Premium payment not received. Two days before lapse.',
        action: 'Call today or queue automated payment reminder via GuideMe',
      },
      {
        id: 'holloway',
        title: 'James Holloway — half birthday alert',
        body: 'Turns 45 in 6 months. WL age-change deadline approaching.',
        action: 'No action today; add to next-week contact list',
      },
      {
        id: 'clarke-referral',
        title: 'Clarke meeting — second referral opportunity',
        body: 'Emma mentioned her business partner may also need coverage.',
        action: 'Prepare referral ask at close — the mood after the beneficiary catch will be right',
      },
    ],
    autonomous: [
      {
        id: 'a1',
        label: 'Resent Anderson APS reminder',
        meta: 'Sales Central · 7:48 AM',
        summary:
          'Re-sent the APS medical form request to Tom Anderson via Sales Central with a follow-up SMS scheduled if not signed by 9:00 AM.',
      },
      {
        id: 'a2',
        label: 'Assembled Clarke meeting pack',
        meta: 'Pre-meeting brief · 8:02 AM',
        summary:
          "Built Emma Clarke's full annual-review brief — beneficiary catch, 401(k) rollover, and college funding ready to lead with.",
      },
      {
        id: 'a3',
        label: 'Queued Lau payment reminder',
        meta: 'GuideMe · queued for 9:00 AM send',
        summary:
          "Queued a GuideMe payment reminder for Patricia Lau's UL policy (day 28 of 30). You can hold it and call instead.",
      },
      {
        id: 'a4',
        label: 'Triaged 23 inbox items',
        meta: 'Concierge · filed overnight',
        summary: 'Concierge sorted 23 overnight inbox items. 18 routed/auto-replied, 5 await your eyes.',
      },
      {
        id: 'a5',
        label: 'Refreshed pipeline state',
        meta: '7 open cases · 1 stuck on client docs',
        summary: '7 open cases re-scored. Anderson is the only one stuck — everything else has a clear next step.',
      },
    ],
  },
  {
    segment: 'hl-accelerating',
    opportunityToday: {
      fycInPlayLabel: '$8,200 in FYC is in play today.',
      ringNudge: 'One holistic conversation today moves your monthly pace from 27% to 38%.',
      streak: 'Holistic-talk-track readiness: 100%',
    },
    headline: "Open Helena's holistic chapter at 10:30 — the move your plan has been waiting for.",
    summary: '2 items require your attention · 1 client meeting today · 1 holistic opening this week',
    whyThisOrder:
      "You said holistic openings and life events matter most. Helena's the rare moment where both line up.",
    priorities: [
      {
        id: 'helena',
        headline:
          'Helena Garcia just turned 58 and is engaging with retirement content. Park morning prep until 10:30, then make the call.',
        sub: null,
        badgeLabel: 'Opportunity',
        details: {
          analysis:
            'Helena just crossed the pre-60 milestone. Three retirement-readiness articles opened in 7 days; engagement score jumped from 23 to 41.',
          insight: "This is the holistic opening you've been waiting for.",
          recommendation: 'Draft a warm reconnection that frames the milestone, not the rate.',
          followup: 'You said holistic openings and life events matter most. This is both.',
        },
      },
      {
        id: 'patel',
        headline: "Leela Patel's annual review at 11:00 AM — cross-sell entry point identified",
        sub: 'Household grew · $1.2M term right-sized to a smaller household · education funding angle',
        badgeLabel: 'Prep ready',
      },
      {
        id: 'janet',
        headline: 'Janet Henderson moved to a coastal household — coverage gap on the new property',
        sub: '30-day post-move window · review pack queued by Strategist',
        badgeLabel: 'Monitor',
      },
      {
        id: 'tom-stall',
        headline: 'Tom Anderson application stalled, day 11 — underwriting hold on a missing APS',
        sub: 'Resend via Sales Central today; this kills momentum on close',
        badgeLabel: 'Urgent',
      },
      {
        id: 'drill',
        headline: 'Holistic talk-track drill loaded for 1:00 PM',
        sub: 'Strategist queued the Helena prep card · 5-min run before the call',
        badgeLabel: 'Need to prep',
      },
    ],
    schedule: [
      {
        id: 'plan',
        title: 'Plan the day · review pipeline',
        body: 'Three open cases, one stalled at NIGO. Helena outreach drafted by Brand Advocate — review and send.',
      },
      {
        id: 'patel',
        title: 'Leela Patel — annual review window opens',
        body: 'Household grew (second dependent, new home). $1.2M term right-sized to a smaller household — talking points loaded.',
      },
      {
        id: 'block',
        title: 'Cross-sell prep · holistic talk-track drill',
        body: 'Strategist queued the Helena prep card. Voice-over rehearsal: 5 min. Run before the call.',
      },
      {
        id: 'wrap',
        title: 'End-of-day wrap',
        body: 'Log Helena outreach. Confirm Patel next-touch on 529 conversation. Flag any new signals.',
      },
    ],
    signals: [
      {
        id: 'helena',
        title: 'Helena Garcia — engagement spike on retirement content',
        body: '3 retirement-readiness articles opened in 7 days. Score jumped from 23 → 41.',
        action: 'Lead with curiosity, not the rate.',
      },
      {
        id: 'henderson',
        title: 'Janet Henderson — new address detected',
        body: 'Coastal household in a flood-risk zone. Coverage gap on the new property.',
        action: 'Add to this week — review pack queued by Strategist',
      },
      {
        id: 'tom-stall',
        title: 'Tom Anderson — application stalled, day 11',
        body: 'Underwriting hold on a missing APS form.',
        action: 'Resend APS via Sales Central today',
      },
    ],
    autonomous: [
      {
        id: 'a1',
        label: 'Drafted Helena reconnection',
        meta: 'Brand Advocate · matched your voice',
        summary:
          'A warm, milestone-first reconnection drafted in your voice. Frames the pre-60 planning window, not the rate.',
      },
      {
        id: 'a2',
        label: 'Loaded Patel review pack',
        meta: 'Intelligence Analyst · cross-sell notes',
        summary:
          "Leela's review pack is ready. Household grew (baby #2 in February), term is right-sized to the old household, education gap surfaced.",
      },
      {
        id: 'a3',
        label: 'Queued holistic talk-track drill',
        meta: 'Coach · 5-min run before 10:30',
        summary:
          'A 5-minute Coach drill on the holistic talk-track, tuned to a pre-60 milestone conversation. Three roleplay beats.',
      },
      {
        id: 'a4',
        label: 'Flagged Janet flood-risk gap',
        meta: 'Signals · review by Friday',
        summary:
          'Janet moved to a coastal address in March; FEMA Zone AE flood map shows risk her current household coverage does not address.',
      },
      {
        id: 'a5',
        label: "Filed yesterday's NIGO update",
        meta: 'Concierge · case status refreshed',
        summary: "Yesterday's NIGO on the Reyes term app was an SSN format issue. Concierge corrected it overnight.",
      },
    ],
  },
  {
    segment: 'cs-building',
    opportunityToday: {
      fycInPlayLabel: '$1,200 in FYC is one signature away.',
      ringNudge: 'Land Nguyen today and you cross 25% — first time this year.',
      streak: 'Activity up 22% this month',
    },
    headline: 'Get the Nguyen signature today — your first close of the week is one resend away.',
    summary: '2 items require your attention · 1 prospect call today · 4 follow-ups owed',
    whyThisOrder:
      'You said the OS should help you keep the rhythm and call out when momentum dips. This week, the rhythm is on — Coach is pointing at confidence, not pace.',
    priorities: [
      {
        id: 'nguyen',
        headline: 'Nguyen application — DocuSign reminder pending, day 5. Resend before noon.',
        sub: 'Standard send-twice-then-call pattern · est. first commission: $1,400',
        badgeLabel: 'Urgent',
        details: {
          analysis: "Application complete and submitted. Client hasn't returned the electronic signature.",
          insight:
            "This is your first close. The send-twice-then-call pattern is your training playbook — don't deviate.",
          recommendation: 'Resend the DocuSign reminder, then text Nguyen to confirm receipt.',
          followup: 'Est. first commission: $1,400.',
        },
      },
      {
        id: 'reyes',
        headline: 'Paul Reyes fact-finding (virtual) at 11:00 AM — referred by M. Rosenthal',
        sub: 'Married, two kids, freelance income · lead with goals, not products',
        badgeLabel: 'Prep ready',
      },
      {
        id: 'momentum',
        headline: 'Your activity is up 22% this month — 11 contacts, 4 fact-finds, 1 close pending',
        sub: 'Above your weekly target three weeks running',
        badgeLabel: 'On pace',
      },
      {
        id: 'rosenthal',
        headline: 'M. Rosenthal sent two referrals in a month — worth a thank-you',
        sub: 'Brand Advocate drafted a note · review and send before Friday',
        badgeLabel: 'Monitor',
      },
      {
        id: 'drill',
        headline: '4-min retirement-income objection drill loaded for the Reyes call',
        sub: 'Coach pointed at confidence, not pace — based on your onboarding answers',
        badgeLabel: 'Need to prep',
      },
    ],
    schedule: [
      {
        id: 'admin',
        title: 'Plan the day · 4 follow-ups owed',
        body: 'Adams (call), Reyes (text), Patel (email), Chen (text). All warm. Brand Advocate drafted three of them.',
      },
      {
        id: 'reyes',
        title: 'Paul Reyes — fact-finding (virtual)',
        body: 'Referred by M. Rosenthal. Married, two kids, freelance income. Lead with goals, not products.',
      },
      {
        id: 'prospecting',
        title: 'Cold outreach block · Coach drilled this with you',
        body: '6 new contacts queued from the warm-warm cohort. Pick 3 and call.',
      },
      { id: 'wrap', title: 'End-of-day wrap', body: 'Log Reyes notes, schedule the follow-up, queue tomorrow.' },
    ],
    signals: [
      {
        id: 'income',
        title: 'Your activity is up 22% this month',
        body: '11 new contacts, 4 fact-finds, 1 close pending. Above your weekly target three weeks running.',
        action: "Keep the rhythm. Coach will surface a milestone callout at week's end.",
      },
      {
        id: 'rosenthal',
        title: 'M. Rosenthal — referral source warming',
        body: 'Two referrals in a month from one COI. Worth a thank-you message and a check-in.',
        action: 'Brand Advocate drafted a thank-you · review and send before Friday',
      },
      {
        id: 'learning',
        title: 'Coach: a 4-min objection drill on retirement-income questions',
        body: 'You flagged confidence as a focus area.',
        action: 'Start the 4-min drill now',
      },
    ],
    autonomous: [
      {
        id: 'a1',
        label: 'Resent Nguyen DocuSign reminder',
        meta: 'Concierge · 7:55 AM',
        summary: 'Re-sent the DocuSign envelope to Nguyen with a short personalized note. Day 5 of 7.',
      },
      {
        id: 'a2',
        label: 'Drafted Adams + Reyes follow-ups',
        meta: 'Brand Advocate · review before send',
        summary: 'Two warm follow-ups drafted in your voice — both wait for your sign-off before sending.',
      },
      {
        id: 'a3',
        label: 'Queued 6 contacts for the afternoon',
        meta: 'Coach · warm-warm cohort',
        summary:
          '6 warm contacts queued for your 1:00 PM block — all "warm-warm" (no cold calls), each with a written opener.',
      },
      {
        id: 'a4',
        label: 'Loaded retirement-income drill',
        meta: 'Coach · 4 min · for the Reyes call',
        summary: 'A 4-minute Coach drill on the most common retirement-income objection, tuned for Paul Reyes.',
      },
      {
        id: 'a5',
        label: "Logged yesterday's 11 contacts",
        meta: 'Concierge · activity refreshed',
        summary: "Concierge logged yesterday's 11 client contacts. You are 22% above weekly target.",
      },
    ],
  },
]

const PRE_MEETINGS = [
  {
    id: 'clarke',
    segment: 'cs-leading',
    title: 'Emma Clarke — Annual Review',
    bottomLine:
      'Emma is your most engaged multi-product client. This meeting has two jobs: (1) deepen trust by catching the beneficiary gap before she finds it, and (2) open the fee-based planning conversation — she is ready but has not been asked directly.',
    needsAttention: [
      {
        id: 'beneficiary',
        title: 'Beneficiary on WL policy not updated since 2012',
        body: 'Still lists ex-husband as primary beneficiary. Catch it before she does — this is what a great advisor looks like.',
        badgeLabel: 'Fix today',
      },
      {
        id: 'rollover',
        title: 'Old 401(k) rollover — $210K sitting at prior employer',
        body: 'She has not acted. This is the fee-based conversation entry point.',
        badgeLabel: 'Opportunity',
      },
      {
        id: 'college',
        title: 'College funding gap — oldest child starts in 14 months',
        body: '529 balance: $44K. Estimated need: $80K+. This year it is urgent — the clock is visible now.',
        badgeLabel: 'Discuss',
      },
    ],
    talkingPoints: [
      {
        heading: 'Lead with the beneficiary catch',
        body: '"I flagged something before we start — I want to make sure this is right." This sets the tone as proactive, not reactive.',
      },
      { heading: 'Acknowledge the referral', body: '"Derek reaching out means a lot." Don\'t dwell — move on.' },
      {
        heading: 'Reference the 401(k) directly',
        body: '"We talked about this last March. I\'ve been thinking about it — now feels like the right time." Don\'t ask, offer.',
      },
      {
        heading: 'On college funding: name the number',
        body: '"You have $44K. You need $80K. Here\'s what we can do in 14 months."',
      },
    ],
    landmines: [
      'Michael (spouse) not present and skeptical of fees. Do not close without his buy-in.',
      'Cash pressure from college starting soon. Be sensitive.',
      "DI and LTC are real gaps but not for today — she'll feel sold at.",
    ],
    decisionToClose:
      "Beneficiary update — get the form signed before she leaves. Everything else is conversation opener for follow-up. Don't overload.",
  },
  {
    id: 'okafor',
    segment: 'cs-leading',
    title: 'Derek Okafor — Prospect discovery',
    bottomLine:
      "Derek is a referral from Emma Clarke — he's verbal-committed but not yet confirmed in writing. Earn the right to a second meeting by listening more than you talk.",
    needsAttention: [
      {
        id: 'no-life',
        title: 'No personal life coverage — 3 kids under 12, business with payroll',
        body: 'The gap will surface in his own answers if you ask the right discovery questions. Let him say it first.',
        badgeLabel: 'Listen for',
      },
      {
        id: 'no-di',
        title: 'No DI — owner of a service business, sole rainmaker',
        body: 'Probably the single most-leveraged product for his profile.',
        badgeLabel: 'Opportunity',
      },
      {
        id: 'bizcon',
        title: 'Business continuity — no buy-sell, no key-person',
        body: 'Park it for meeting 2 if today goes well.',
        badgeLabel: 'Discuss later',
      },
    ],
    talkingPoints: [
      {
        heading: 'Confirm the meeting first thing',
        body: 'He was only verbal-committed. Confirm calendar acceptance before he sits down.',
      },
      { heading: 'Open with Emma', body: '"Emma told me a little about you — but I\'d rather hear it from you."' },
      {
        heading: 'Ask three questions, then shut up',
        body: '"What does the business look like in five years?" / "What happens to it if you can\'t work for six months?" / "What does Sarah know about how all this is set up?" Don\'t rescue the silence.',
      },
      {
        heading: 'End with a next step, not a pitch',
        body: "\"Based on what you've shared, here's what I'd want to look at together — can we book 45 minutes next week?\"",
      },
    ],
    landmines: [
      'Don\'t lead with product. Emma told him "Marcus is different — he asks before he sells."',
      "His prior advisor burned him on a fee discussion. Don't raise fees in meeting 1.",
      'Sarah is the household decision-maker for protection conversations.',
    ],
    decisionToClose:
      "Get a second meeting on the calendar before he leaves. Don't pitch a product today — your win is earning meeting 2.",
  },
  {
    id: 'patel',
    segment: 'hl-accelerating',
    title: 'Leela Patel — Annual Review',
    bottomLine:
      "Leela's household has grown and her current $1.2M term is right-sized to her old household, not her new one. Walk her through what changed and open the education-funding conversation while the new dependent is fresh.",
    needsAttention: [
      {
        id: 'right-size',
        title: 'Term is right-sized to her old household — second child arrived 3 months ago',
        body: "Recommended need now: ~$1.8M total. This is the conversation she's already prepared for.",
        badgeLabel: 'Right-size today',
      },
      {
        id: 'edu',
        title: 'No 529 for the new baby yet · oldest 529 underfunded for the timeline',
        body: 'Open a second 529 today. The math is friendly and the moment is right.',
        badgeLabel: 'Opportunity',
      },
      {
        id: 'holistic',
        title: 'Arjun is not a client yet — household has only half a plan',
        body: 'Frame as a household check, not a sales ask. Suggest a joint conversation later this quarter.',
        badgeLabel: 'Discuss',
      },
    ],
    talkingPoints: [
      {
        heading: 'Lead with the milestone',
        body: '"Before anything else — congratulations on baby #2. How is everyone doing?" Two minutes here earns you the rest of the meeting.',
      },
      {
        heading: 'Walk her through what changed',
        body: '"Your household looks different than it did 12 months ago. Let me show you what your plan looks like next to it."',
      },
      {
        heading: 'Name the education number',
        body: "\"For two kids at private + state-flagship blend, you're looking at roughly $360K total. You're at $18K. Here's the monthly that closes the gap.\"",
      },
      {
        heading: 'End with the joint check-in',
        body: '"I\'d love to do a 30-minute household look with you and Arjun in the next month — no pitch, just a picture."',
      },
    ],
    landmines: [
      "Don't over-index on permanent life today — she's cash-constrained with the new baby.",
      "Arjun has been the slower yes historically. Don't pressure for a joint call today.",
      'Her 529 question last year felt like a sales push. Lead with the gap, not the product.',
    ],
    decisionToClose:
      "Submit the term right-size application today. Open the second 529 enrollment in-meeting. The Arjun conversation is meeting 2 — don't push.",
  },
  {
    id: 'reyes',
    segment: 'cs-building',
    title: 'Paul Reyes — Fact-finding (virtual)',
    bottomLine:
      "Paul is a warm referral from M. Rosenthal. The way to land this is not to close. Listen. Ask about Lily and the kids. Find the goal he hasn't told anyone yet.",
    needsAttention: [
      {
        id: 'no-life',
        title: 'No life coverage — primary earner with two young kids',
        body: "Term-20 modeled at $1.2M lines up with his profile. Don't pitch it today — let him tell you what he wants to protect.",
        badgeLabel: 'Listen for',
      },
      {
        id: 'no-di',
        title: 'No DI — freelance income · cannot afford a six-month gap',
        body: 'For a freelancer, DI is more existential than life. Lead with the question.',
        badgeLabel: 'Opportunity',
      },
      {
        id: 'roth',
        title: 'Solo 401(k) is self-managed — likely under-optimized',
        body: "Mention it lightly. It's the door to meeting 2 if today goes well.",
        badgeLabel: 'Discuss later',
      },
    ],
    talkingPoints: [
      {
        heading: 'Open with M. Rosenthal',
        body: '"Maria spoke really highly of you — she said your work on her studio rebrand was a turning point."',
      },
      {
        heading: 'Three goals questions',
        body: '"What\'s the next big thing for you and Lily?" / "What scares you when you think 10 years out?" / "If you couldn\'t work for six months, what happens?" Don\'t fill the pause after #3.',
      },
      {
        heading: 'Show that you heard him',
        body: '"Here\'s what I think I heard — tell me where I got it wrong." Mirror back his words. This is what wins meeting 2.',
      },
      {
        heading: 'Coach drill — retirement-income objection',
        body: '5 min before the call, run the drill the Coach queued. If he asks "why not just buy term online?" — you\'ll have it ready.',
      },
    ],
    landmines: [
      "Don't pitch product today. Your win is a second meeting and a fact-finder completed.",
      "Maria has told him he can ask hard questions — don't get defensive.",
      'He has financial trauma from a parent who lost coverage. Be careful around "what if you couldn\'t work."',
    ],
    decisionToClose:
      "Get a second meeting on the calendar before the call ends. Complete the fact-finder in real time. Don't close anything — meeting 2 is the win.",
  },
]

export function rows() {
  const out = []

  DAILY_BRIEFINGS.forEach((b) => {
    const seg = b.segment
    out.push(
      bAdd(
        seg,
        'Briefing',
        'Daily Headline',
        'headline',
        b.opportunityToday.fycInPlayLabel,
        `briefing.${seg}.fycInPlayLabel`,
        'advisorName',
      ),
    )
    out.push(bAdd(seg, 'Briefing', 'Daily Headline', 'body', b.opportunityToday.ringNudge, `briefing.${seg}.ringNudge`))
    if (b.opportunityToday.streak)
      out.push(bAdd(seg, 'Briefing', 'Daily Headline', 'label', b.opportunityToday.streak, `briefing.${seg}.streak`))
    out.push(bAdd(seg, 'Briefing', 'Daily Headline', 'headline', b.headline, `briefing.${seg}.headline`))
    out.push(bAdd(seg, 'Briefing', 'Daily Headline', 'body', b.summary, `briefing.${seg}.summary`))
    out.push(bAdd(seg, 'Briefing', 'Daily Headline', 'body', b.whyThisOrder, `briefing.${seg}.whyThisOrder`))

    b.priorities.forEach((p) => {
      out.push(
        bAdd(seg, 'Briefing', 'Priority Cards', 'headline', p.headline, `briefing.${seg}.priorities.${p.id}.headline`),
      )
      if (p.sub)
        out.push(bAdd(seg, 'Briefing', 'Priority Cards', 'body', p.sub, `briefing.${seg}.priorities.${p.id}.sub`))
      if (p.badgeLabel)
        out.push(
          bAdd(seg, 'Briefing', 'Priority Cards', 'tag', p.badgeLabel, `briefing.${seg}.priorities.${p.id}.badge`),
        )
      if (p.details) {
        out.push(
          bAdd(
            seg,
            'Briefing',
            'Priority Cards',
            'body',
            p.details.analysis,
            `briefing.${seg}.priorities.${p.id}.analysis`,
          ),
        )
        out.push(
          bAdd(
            seg,
            'Briefing',
            'Priority Cards',
            'body',
            p.details.insight,
            `briefing.${seg}.priorities.${p.id}.insight`,
          ),
        )
        out.push(
          bAdd(
            seg,
            'Briefing',
            'Priority Cards',
            'body',
            p.details.recommendation,
            `briefing.${seg}.priorities.${p.id}.recommendation`,
          ),
        )
        if (p.details.followup)
          out.push(
            bAdd(
              seg,
              'Briefing',
              'Priority Cards',
              'body',
              p.details.followup,
              `briefing.${seg}.priorities.${p.id}.followup`,
            ),
          )
      }
    })

    b.schedule.forEach((s) => {
      out.push(bAdd(seg, 'Briefing', 'Schedule', 'label', s.title, `briefing.${seg}.schedule.${s.id}.title`))
      out.push(bAdd(seg, 'Briefing', 'Schedule', 'body', s.body, `briefing.${seg}.schedule.${s.id}.body`))
    })

    b.signals.forEach((s) => {
      out.push(bAdd(seg, 'Briefing', 'Client Signals', 'headline', s.title, `briefing.${seg}.signals.${s.id}.title`))
      out.push(bAdd(seg, 'Briefing', 'Client Signals', 'body', s.body, `briefing.${seg}.signals.${s.id}.body`))
      out.push(bAdd(seg, 'Briefing', 'Client Signals', 'cta', s.action, `briefing.${seg}.signals.${s.id}.action`))
    })

    b.autonomous.forEach((a) => {
      out.push(
        bAdd(seg, 'Briefing', 'Autonomous Actions', 'label', a.label, `briefing.${seg}.autonomous.${a.id}.label`),
      )
      out.push(bAdd(seg, 'Briefing', 'Autonomous Actions', 'label', a.meta, `briefing.${seg}.autonomous.${a.id}.meta`))
      out.push(
        bAdd(seg, 'Briefing', 'Autonomous Actions', 'body', a.summary, `briefing.${seg}.autonomous.${a.id}.summary`),
      )
    })
  })

  PRE_MEETINGS.forEach((m) => {
    out.push(bAdd(m.segment, 'Pre-Meeting Brief', m.title, 'headline', m.title, `brief.${m.id}.title`))
    out.push(bAdd(m.segment, 'Pre-Meeting Brief', m.title, 'body', m.bottomLine, `brief.${m.id}.bottomLine`))
    m.needsAttention.forEach((n) => {
      out.push(bAdd(m.segment, 'Pre-Meeting Brief', m.title, 'headline', n.title, `brief.${m.id}.needs.${n.id}.title`))
      out.push(bAdd(m.segment, 'Pre-Meeting Brief', m.title, 'body', n.body, `brief.${m.id}.needs.${n.id}.body`))
      out.push(bAdd(m.segment, 'Pre-Meeting Brief', m.title, 'tag', n.badgeLabel, `brief.${m.id}.needs.${n.id}.badge`))
    })
    m.talkingPoints.forEach((t, i) => {
      out.push(bAdd(m.segment, 'Pre-Meeting Brief', m.title, 'label', t.heading, `brief.${m.id}.talking[${i}].heading`))
      out.push(bAdd(m.segment, 'Pre-Meeting Brief', m.title, 'body', t.body, `brief.${m.id}.talking[${i}].body`))
    })
    m.landmines.forEach((l, i) => {
      out.push(bAdd(m.segment, 'Pre-Meeting Brief', m.title, 'body', l, `brief.${m.id}.landmines[${i}]`))
    })
    out.push(bAdd(m.segment, 'Pre-Meeting Brief', m.title, 'body', m.decisionToClose, `brief.${m.id}.decisionToClose`))
  })

  return out.filter(Boolean)
}
