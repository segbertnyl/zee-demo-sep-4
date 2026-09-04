import { motion } from 'motion/react'
import { useAppStore } from '@/state/useAppStore'
import { Nyla } from '@/ui/Nyla'

/* PlaceholderScene — a quiet, on-brand stub for destinations that aren't fully built in v4.
 * Keeps the visual language (dotted ground, big serif headline, single CTA back to Nyla). */

type Spec = {
  eyebrow: string
  headline: string
  body: string
  highlight: { title: string; copy: string }
}

const SPECS: Record<string, Spec> = {
  clients: {
    eyebrow: 'Clients',
    headline: 'Your book — every household, every signal.',
    body:
      "I keep this in the background. When something changes in a client's life, you'll see it on the briefing first. This page is where you go to dig in.",
    highlight: {
      title: 'What I would surface here',
      copy:
        "Household profiles, signal feeds, relationship health, and the talk-tracks that have closed for advisors like you. Ask Nyla for any of it.",
    },
  },
  actives: {
    eyebrow: 'Actives',
    headline: 'Cases in flight — quiet until they need you.',
    body:
      "Underwriting, service requests, applications. They move on their own. I'll pull one into your briefing the moment it actually needs your eye.",
    highlight: {
      title: "What I'm watching today",
      copy:
        "Tom Anderson · day 11 in underwriting · the missing APS form is the only blocker. I would handle that, but you'd want to call him first.",
    },
  },
  prospects: {
    eyebrow: 'Prospects',
    headline: "Where the next case lives.",
    body:
      'Pipeline, nests, influence webs, and warm paths. The system you actually want runs upstream of your day — by the time you open this, the next move is already drafted.',
    highlight: {
      title: 'A move I would recommend',
      copy:
        "Marcus Rosenthal is your strongest influencer this quarter — 4 mutuals are warm. I have a draft intro ready for any one of them.",
    },
  },
  business: {
    eyebrow: 'Business',
    headline: 'Your practice, on pace.',
    body:
      "Production, council pacing, peer ranking. The numbers live here — but the math behind them lives in the briefing, where it can actually change a decision.",
    highlight: {
      title: 'Where you stand',
      copy:
        'On pace for Eagle. 1.4 cases behind the cross-sell line. I queued two conversions and a workshop — that closes the gap.',
    },
  },
}

export function PlaceholderScene({ id }: { id: keyof typeof SPECS }) {
  const spec = SPECS[id]
  const openChiefOfStaff = useAppStore((s) => s.openChiefOfStaff)

  return (
    <section className="flex flex-1 flex-col">
      <div className="grid flex-1 grid-cols-12 gap-8 px-8 pb-20 pt-16 md:px-12 md:pt-24">
        <div className="col-span-12 mx-auto w-full max-w-[820px]">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-neutral-400"
          >
            {spec.eyebrow}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 0.65, 0.05, 1] }}
            className="mt-5 font-serif text-[40px] leading-[1.04] tracking-tight text-neutral-900 md:text-[56px]"
            style={{ fontWeight: 400, textWrap: 'balance' }}
          >
            {spec.headline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="mt-6 max-w-[58ch] text-[15.5px] leading-[1.55] text-neutral-600"
          >
            {spec.body}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.32 }}
            className="mt-10 rounded-2xl bg-white p-6 shadow-[0_24px_60px_-30px_rgba(0,10,98,0.18)]"
          >
            <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-neutral-400">
              {spec.highlight.title}
            </p>
            <p className="mt-3 max-w-[58ch] text-[15px] leading-[1.55] text-neutral-700">
              {spec.highlight.copy}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mt-10 flex items-center gap-3"
          >
            <button
              type="button"
              onClick={openChiefOfStaff}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--nyl-blue-800)] px-5 py-2.5 text-[12.5px] font-medium uppercase tracking-[0.18em] text-white hover:bg-[var(--nyl-blue-600)]"
            >
              <Nyla size={24} variant="on-dark" aria-hidden />
              Ask Nyla
            </button>
            <p className="text-[12.5px] text-neutral-500">
              The full destination ships in the next iteration.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
