import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useAppStore } from '@/state/useAppStore'

/* Practice Wrapped — Spotify-Wrapped-style year-in-review for the advisor.
 * A vertical deck of story slides with big numbers, bold gradients, and a
 * progress bar across the top. Auto-advances every 6 seconds; tap left/right
 * to navigate manually. Adapted from the v2 prototype concept and tuned to
 * NYL360's typography. */

type Story = {
  id: string
  bg: string
  eyebrow: string
  big: string
  bigSub?: string
  caption: string
}

const STORIES: Story[] = [
  {
    id: 'intro',
    bg: 'radial-gradient(circle at 25% 15%, #6f8cff 0%, #1a2a6b 45%, #060f3f 95%)',
    eyebrow: '2026 · Year in review',
    big: 'Practice Wrapped',
    caption: "Twelve months. Twelve stories. Here's the shape of your year.",
  },
  {
    id: 'fyc',
    bg: 'radial-gradient(circle at 70% 30%, #4a7bff 0%, #0468ff 50%, #0033a0 100%)',
    eyebrow: '#1 · Your year in FYC',
    big: '$132K',
    bigSub: '108% of plan',
    caption: 'Strongest year yet — and four months remain.',
  },
  {
    id: 'cases',
    bg: 'radial-gradient(circle at 30% 60%, #5fd17b 0%, #1ab382 45%, #0a4d3c 100%)',
    eyebrow: '#2 · Cases closed',
    big: '74',
    bigSub: 'vs 58 in 2025',
    caption: '+28% YoY. Half of them were repeat-household closes.',
  },
  {
    id: 'hours',
    bg: 'radial-gradient(circle at 80% 30%, #ffb567 0%, #ff8b3d 40%, #b04d10 100%)',
    eyebrow: '#3 · Hours the OS gave back',
    big: '147',
    bigSub: 'hrs · ~4 work weeks',
    caption: 'Mostly inbox triage, NIGO catches, and pre-meeting prep.',
  },
  {
    id: 'compound',
    bg: 'radial-gradient(circle at 25% 60%, #c084ff 0%, #7028a4 50%, #2e0f4f 100%)',
    eyebrow: '#4 · Where the year compounded',
    big: 'Multi-policy',
    bigSub: '38% of total FYC',
    caption: 'Existing households doing the heavy lifting — your book is healthy.',
  },
  {
    id: 'voice',
    bg: 'radial-gradient(circle at 70% 65%, #ff9bb9 0%, #d23472 50%, #5a0e2f 100%)',
    eyebrow: '#5 · The word you used most',
    big: '"Together"',
    bigSub: '142 times in drafts',
    caption: 'Your voice rang household-first all year. Hold that.',
  },
  {
    id: 'streak',
    bg: 'radial-gradient(circle at 30% 30%, #fff39b 0%, #f5b800 50%, #663f00 100%)',
    eyebrow: '#6 · Longest activity streak',
    big: '41 days',
    bigSub: 'above 80% pace',
    caption: 'September into October. Whatever you did then — do it again.',
  },
  {
    id: 'top-client',
    bg: 'radial-gradient(circle at 25% 50%, #6f8cff 0%, #1a2a6b 50%, #060f3f 100%)',
    eyebrow: '#7 · Your most-trusted client',
    big: 'Maria Garcia',
    bigSub: '2 referrals · 12 yr history',
    caption: 'Send her a hand-written thank you. We\'ll prep the card.',
  },
  {
    id: 'milestone',
    bg: 'radial-gradient(circle at 70% 30%, #4a7bff 0%, #0468ff 50%, #0033a0 100%)',
    eyebrow: '#8 · The milestone',
    big: 'Executive Council',
    bigSub: 'Locked · September 14',
    caption: 'Top 12% of advisors at your tenure. The next bar is Chairman\'s.',
  },
  {
    id: 'next',
    bg: 'radial-gradient(circle at 25% 60%, #1ab382 0%, #0a4d3c 50%, #00261d 100%)',
    eyebrow: '#9 · What 2027 wants',
    big: 'One COI',
    bigSub: 'One estate attorney',
    caption: 'The math says it. Coffee, not pitch. Quarterly cadence.',
  },
  {
    id: 'thanks',
    bg: 'radial-gradient(circle at 50% 40%, #6f8cff 0%, #1a2a6b 45%, #060f3f 95%)',
    eyebrow: 'Thank you',
    big: 'See you in 2027.',
    caption: 'Share the highlights, save the deck, or keep going — your call.',
  },
]

const SLIDE_MS = 6000

export function PracticeWrapped() {
  const open = useAppStore((s) => s.wrappedOpen)
  const close = useAppStore((s) => s.closeWrapped)
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => { if (!open) { setIdx(0); setPaused(false); setProgress(0) } }, [open])

  useEffect(() => {
    if (!open || paused) return
    setProgress(0)
    const start = performance.now()
    let raf: number
    function tick(now: number) {
      const elapsed = now - start
      const p = Math.min(1, elapsed / SLIDE_MS)
      setProgress(p * 100)
      if (p >= 1) {
        if (idx + 1 < STORIES.length) setIdx((i) => i + 1)
        else setPaused(true)
      } else {
        raf = requestAnimationFrame(tick)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [open, paused, idx])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') setIdx((i) => Math.min(STORIES.length - 1, i + 1))
      if (e.key === 'ArrowLeft') setIdx((i) => Math.max(0, i - 1))
      if (e.key === ' ') { e.preventDefault(); setPaused((p) => !p) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  if (!open) return null
  const story = STORIES[idx]

  return (
    <AnimatePresence>
      <motion.div
        key="wrapped"
        role="dialog"
        aria-label="Practice Wrapped"
        className="overlay-bleed z-[210] flex flex-col text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.32 }}
      >
        <motion.div
          key={story.id}
          className="absolute inset-0"
          style={{ background: story.bg }}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 0.65, 0.05, 1] }}
        />
        {/* Top progress bars + close */}
        <div className="relative flex items-center gap-2 px-6 pt-5 md:px-10">
          {STORIES.map((_, i) => (
            <div key={i} className="flex h-[3px] flex-1 overflow-hidden rounded-full bg-white/20">
              <motion.div
                className="h-full bg-white"
                animate={{ width: i < idx ? '100%' : i === idx ? `${progress}%` : '0%' }}
                transition={{ duration: 0.15, ease: 'linear' }}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="ml-3 text-[18px] text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Tap zones for prev/next */}
        <button
          type="button"
          aria-label="Previous"
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          className="absolute left-0 top-0 z-[1] h-full w-1/3 cursor-default"
        />
        <button
          type="button"
          aria-label="Next"
          onClick={() => setIdx((i) => Math.min(STORIES.length - 1, i + 1))}
          className="absolute right-0 top-0 z-[1] h-full w-1/3 cursor-default"
        />

        {/* Body */}
        <div className="relative z-[2] flex flex-1 flex-col items-center justify-center px-8 text-center md:px-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={story.id + '-body'}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: [0.22, 0.65, 0.05, 1] }}
              className="max-w-[860px]"
            >
              <p className="text-[11.5px] font-medium uppercase tracking-[0.32em] text-white/70">{story.eyebrow}</p>
              <p
                className="mt-7 font-serif tracking-tight text-white"
                style={{
                  fontWeight: 400,
                  textWrap: 'balance',
                  fontSize: 'clamp(56px, 11vw, 144px)',
                  lineHeight: 0.95,
                }}
              >
                {story.big}
              </p>
              {story.bigSub && (
                <p className="mt-5 text-[18px] font-medium uppercase tracking-[0.18em] text-white/80 md:text-[22px]">
                  {story.bigSub}
                </p>
              )}
              <p className="mx-auto mt-9 max-w-[44ch] text-[16px] leading-[1.55] text-white/80 md:text-[18px]">
                {story.caption}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer chrome */}
        <div className="relative z-[2] flex items-center justify-between gap-3 px-6 pb-6 md:px-10 md:pb-8">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-white/55">
            ← / → to navigate · space to pause · esc to close
          </p>
          {idx === STORIES.length - 1 && (
            <button
              type="button"
              onClick={close}
              className="rounded-full bg-white px-5 py-2.5 text-[13px] font-medium text-neutral-900 hover:bg-white/90"
            >
              Save and close
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
