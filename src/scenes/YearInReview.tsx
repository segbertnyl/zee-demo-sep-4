import { useMemo, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useAppStore } from '@/state/useAppStore'
import { BgReflections } from '@/ui/BgReflections'
import type { BgReflectionsVariant } from '@/ui/BgReflections'
import { Nyla } from '@/ui/Nyla'
import { EASE, DURATION } from '@/motion'

/* Year in Review — Spotify-Wrapped-style 1-year milestone review.
 * Advisor is the protagonist; AI contributions are woven into captions. */

const CONFETTI_COLORS = [
  '#c084ff',
  '#ffffff',
  '#2db868',
  '#f5c842',
  '#4a7bff',
  '#ff8b3d',
  '#f472b6',
  '#34d399',
  '#fbbf24',
]

function Confetti({ animKey, delay: baseDelay = 0 }: { animKey: string; delay?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 110 }, (_, i) => {
        const angle = (i / 110) * 2 * Math.PI + (Math.random() - 0.5) * 0.25
        const burstR = 220 + Math.random() * 280
        return {
          id: i,
          dx: Math.cos(angle) * burstR,
          dy: Math.sin(angle) * burstR,
          delay: baseDelay + Math.random() * 0.12,
          duration: 1.4 + Math.random() * 0.8,
          size: 9 + Math.random() * 14,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          rotate: Math.random() * 360,
          rotateEnd: Math.random() * 900 - 450,
          shape: i % 3 === 0 ? 'circle' : 'rect',
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }),
    [animKey],
  )

  return (
    <div key={animKey} className="pointer-events-none absolute inset-0 z-[3] overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            width: p.shape === 'circle' ? p.size : p.size * 0.55,
            height: p.size,
            borderRadius: p.shape === 'circle' ? '50%' : 2,
            backgroundColor: p.color,
            marginLeft: -(p.size / 2),
            marginTop: -(p.size / 2),
          }}
          initial={{ x: 0, y: 0, rotate: p.rotate, scale: 0 }}
          animate={{
            x: p.dx,
            y: p.dy,
            rotate: p.rotate + p.rotateEnd,
            scale: 1,
            opacity: 0,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
            opacity: { delay: p.delay + p.duration * 0.5, duration: p.duration * 0.5, ease: 'easeIn' },
            scale: { duration: p.duration * 0.1, delay: p.delay },
          }}
        />
      ))}
    </div>
  )
}

type Card = {
  id: string
  bgVariant: BgReflectionsVariant
  eyebrow: string
  big: string
  caption: string
  aiNod?: string
  quoteMode?: boolean
  confetti?: boolean
  charReveal?: boolean
  nylaIntro?: boolean
}

const CARDS: Card[] = [
  {
    id: 'intro',
    bgVariant: 'purple' as BgReflectionsVariant,
    eyebrow: 'Practice wrapped 2027',
    big: 'Your year\nin review.',
    caption: "I kept track so you could stay focused. Here's what we built together.",
    nylaIntro: true,
  },
  {
    id: 'commission',
    bgVariant: 'blue' as BgReflectionsVariant,
    eyebrow: 'First year commission',
    big: '$198,000',
    caption: 'You set a goal of $175,000. You beat it by $23,000.',
    aiNod: 'Surfaced 3 coverage-gap clients off your radar and lined them up — you closed two.',
    confetti: true,
  },
  {
    id: 'cases',
    bgVariant: 'green' as BgReflectionsVariant,
    eyebrow: 'Cases closed',
    big: '934 families\nwith a plan',
    caption: "That's not a number — that's a legacy.",
    aiNod: 'Triaged 89 at-risk cases and stayed ahead of them — you cleared every one before its review window closed.',
  },
  {
    id: 'network',
    bgVariant: 'orange' as BgReflectionsVariant,
    eyebrow: 'Expanding your network',
    big: '40 people added\nto your book',
    caption: '22 through warm paths, 8 through referrals, 10 you brought in cold.',
    aiNod: 'Mapped 6 households near your Henderson win and cased them — you turned 4 into meetings.',
  },
  {
    id: 'client-voice',
    bgVariant: 'blue' as BgReflectionsVariant,
    eyebrow: 'Your clients said it best',
    big: '"She didn\'t just sell me a policy. She gave me peace of mind."',
    caption: '— Janet Mercer, client since 2024 · 5-star review, April 2027',
    quoteMode: true,
    aiNod: 'Drafted the annual review summary and prepped you for it — you walked in and earned every word.',
  },
  {
    id: 'nyla-tasks',
    bgVariant: 'purple' as BgReflectionsVariant,
    eyebrow: 'Handled by Nyla',
    big: '140+ tasks',
    caption:
      '67 meeting packs. 31 follow-up reminders. 14 stalled cases flagged before they slipped. You stayed in front of it.',
  },
  {
    id: 'outro',
    bgVariant: 'green' as BgReflectionsVariant,
    eyebrow: "What's next",
    big: 'You made your ambitions a reality.',
    caption: 'Your 2028 plan is already taking shape.',
    charReveal: true,
  },
]

function getBigStyle(card: Card): React.CSSProperties {
  if (card.quoteMode) {
    return { fontSize: 64, lineHeight: 1.2, fontStyle: 'italic', maxWidth: 744 }
  }
  if (card.charReveal || card.nylaIntro) {
    return { fontSize: 100, lineHeight: 1 }
  }
  if (/^[\$\d,]+$/.test(card.big) || card.big.includes('+')) {
    return { fontSize: 120, lineHeight: '130px' }
  }
  return { fontSize: 70, lineHeight: 1.2 }
}

function CharReveal({
  text,
  animKey,
  staggerSpan = 1.4,
  charDuration = 0.4,
}: {
  text: string
  animKey: string
  staggerSpan?: number
  charDuration?: number
}) {
  const chars = text.split('')
  const total = chars.length

  return (
    <>
      {chars.map((ch, i) => (
        <motion.span
          key={animKey + i}
          style={{ display: 'inline', whiteSpace: 'pre-wrap' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: charDuration,
            delay: 0.15 + (i / Math.max(total - 1, 1)) * staggerSpan,
            ease: 'easeOut',
          }}
        >
          {ch}
        </motion.span>
      ))}
    </>
  )
}

// Returns the time (seconds) when the last character of a CharReveal fully appears
function charRevealDuration(staggerSpan = 1.4, charDuration = 0.4): number {
  return 0.15 + staggerSpan + charDuration
}

const SLIDE_MS = 6000

export function YearInReview() {
  const open = useAppStore((s) => s.yearInReviewOpen)
  const close = useAppStore((s) => s.closeYearInReview)
  const openLanding = useAppStore((s) => s.openLanding)
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setIdx(0)
        setPaused(false)
        setProgress(0)
      }, 0)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    if (!open || paused) return
    const resetT = setTimeout(() => setProgress(0), 0)
    const start = performance.now()
    let raf: number
    function tick(now: number) {
      const elapsed = now - start
      const p = Math.min(1, elapsed / SLIDE_MS)
      setProgress(p * 100)
      if (p >= 1) {
        if (idx + 1 < CARDS.length) setIdx((i) => i + 1)
        else setPaused(true)
      } else {
        raf = requestAnimationFrame(tick)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(resetT)
    }
  }, [open, paused, idx])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') setIdx((i) => Math.min(CARDS.length - 1, i + 1))
      if (e.key === 'ArrowLeft') setIdx((i) => Math.max(0, i - 1))
      if (e.key === ' ') {
        e.preventDefault()
        setPaused((p) => !p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  if (!open) return null

  const card = CARDS[idx]
  const isOutro = idx === CARDS.length - 1
  const isFirst = idx === 0
  const bigStyle = getBigStyle(card)

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="year-in-review"
        role="dialog"
        aria-label="Year in Review"
        className="overlay-bleed z-[210] flex flex-col text-white"
        style={{ background: '#1a0530' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: DURATION.standard }}
      >
        {/* BgReflections animated background */}
        <AnimatePresence>
          <motion.div
            key={card.id + '-bg'}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: EASE.settle }}
          >
            <BgReflections variant={card.bgVariant} className="absolute inset-0" />
          </motion.div>
        </AnimatePresence>

        {/* Subtle grain texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            backgroundSize: '200px',
          }}
        />

        {/* Top bar — Space to Pause / progress / close, all vertically centered */}
        <div className="absolute inset-x-0 top-0 z-[3] flex items-center px-[27px]" style={{ height: 90 }}>
          <p
            className="shrink-0 text-[14px] font-medium uppercase tracking-[0.14em] text-white"
            style={{ opacity: 0.6 }}
          >
            Space to Pause
          </p>
          {/* Progress bars — absolutely centered in the top bar */}
          <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1.5" style={{ width: '38%' }}>
            {CARDS.map((_, i) => (
              <div key={i} className="flex h-[4px] flex-1 overflow-hidden rounded-full bg-white/20">
                <motion.div
                  className="h-full bg-white"
                  animate={{ width: i < idx ? '100%' : i === idx ? `${progress}%` : '0%' }}
                  transition={{ duration: 0.15, ease: 'linear' }}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="ml-auto shrink-0 text-[18px] text-white/70 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Confetti burst — fires after text fully appears */}
        <AnimatePresence>
          {card.confetti && (
            <Confetti key={card.id + '-confetti'} animKey={card.id} delay={charRevealDuration(0.28, 0.25) + 0.05} />
          )}
        </AnimatePresence>

        {/* Invisible tap zones */}
        <button
          type="button"
          aria-label="Previous"
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          className="absolute left-0 top-0 z-[1] h-full w-1/3 cursor-default"
        />
        <button
          type="button"
          aria-label="Next"
          onClick={() => setIdx((i) => Math.min(CARDS.length - 1, i + 1))}
          className="absolute right-0 top-0 z-[1] h-full w-1/3 cursor-default"
        />

        {/* Body */}
        <div className="relative z-[2] flex flex-1 flex-col items-center text-center px-8 md:px-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={card.id + '-body'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE.settle }}
              className={`flex w-full max-w-[820px] flex-col items-center ${card.nylaIntro ? 'flex-1 justify-center' : 'flex-1'}`}
            >
              {card.nylaIntro ? (
                /* First card — keep centered layout */
                <>
                  <p className="text-[14px] font-medium uppercase tracking-[0.14em] text-white">{card.eyebrow}</p>
                  <p
                    className="mt-7 whitespace-pre-line font-serif font-normal tracking-tight text-white"
                    style={bigStyle}
                  >
                    <CharReveal text={card.big} animKey={card.id} />
                  </p>
                  <div className="mt-8">
                    <Nyla size={96} variant="on-dark" />
                  </div>
                  <p
                    className="mx-auto mt-8 font-normal text-white"
                    style={{ fontSize: 20, lineHeight: '30px', letterSpacing: '0.3px', maxWidth: 749 }}
                  >
                    {card.caption}
                  </p>
                </>
              ) : (
                /* All other cards — eyebrow at 20vh top, big text centered, caption+pill at 20vh bottom */
                <>
                  {/* Eyebrow — 20vh from top of viewport (top bar is ~90px) */}
                  <p
                    className="text-[14px] font-medium uppercase tracking-[0.14em] text-white"
                    style={{ paddingTop: 'calc(32vh - 90px)' }}
                  >
                    {card.eyebrow}
                  </p>

                  {/* Big text — flex-1 so it centers between eyebrow and bottom group */}
                  <div className="flex flex-1 items-center justify-center">
                    <p
                      className="whitespace-pre-line font-serif font-normal tracking-tight text-white"
                      style={bigStyle}
                    >
                      {card.id === 'commission' ? (
                        <CharReveal text={card.big} animKey={card.id} staggerSpan={0.28} charDuration={0.25} />
                      ) : (
                        <CharReveal text={card.big} animKey={card.id} />
                      )}
                    </p>
                  </div>

                  {/* Caption + pill — 20vh from bottom */}
                  <div className="flex flex-col items-center gap-5 w-full" style={{ paddingBottom: '18vh' }}>
                    <p
                      className="font-normal text-white"
                      style={{ fontSize: 20, lineHeight: '30px', letterSpacing: '0.3px', maxWidth: 749 }}
                    >
                      {card.caption}
                    </p>
                    {card.aiNod && (
                      <div className="flex items-center gap-[10px] rounded-full border border-white/50 bg-white/10 py-3 pl-3 pr-6">
                        <Nyla size={48} variant="on-dark" />
                        <p className="whitespace-nowrap text-[14px] leading-[20px] tracking-[0.2px] text-white">
                          {card.aiNod}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Visible arrow buttons — bottom of screen */}
        {/* Left arrow */}
        <div className="absolute bottom-[32px] left-[27px] z-[2]">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            className="flex size-[40px] items-center justify-center rounded-[8px] border-[1.5px] border-white bg-transparent hover:bg-white/10"
            style={{ opacity: isFirst ? 0 : 1, pointerEvents: isFirst ? 'none' : 'auto' }}
          >
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
              <path d="M8 2L4 7L8 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Right arrow / outro CTAs */}
        <div className="absolute bottom-[32px] right-[27px] z-[2]">
          {isOutro ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={close}
                className="rounded-[var(--radius-md)] border border-white/50 px-5 py-2.5 text-[14px] font-medium text-white hover:border-white hover:bg-white/10"
              >
                Return to briefing
              </button>
              <button
                type="button"
                onClick={() => {
                  close()
                  openLanding()
                }}
                className="rounded-[var(--radius-md)] bg-white px-5 py-2.5 text-[14px] font-semibold text-neutral-900 hover:bg-white/90"
              >
                Adjust goals for 2028
              </button>
            </div>
          ) : (
            <button
              type="button"
              aria-label="Next"
              onClick={() => setIdx((i) => Math.min(CARDS.length - 1, i + 1))}
              className="flex size-[40px] items-center justify-center rounded-[8px] border-[1.5px] border-white bg-transparent hover:bg-white/10"
            >
              <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                <path d="M4 2L8 7L4 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}
