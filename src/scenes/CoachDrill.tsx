import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useAppStore } from '@/state/useAppStore'

/* Coach drill — interactive 3-beat talk-track rehearsal. Each beat has a
 * countdown, a "what to say" guide, and a "what to listen for" cue. The
 * advisor advances manually with the spacebar / continue button, or the
 * beat advances automatically when the timer expires. A final reflection
 * step lets them save the run before closing.
 *
 * Triggered by openCoachDrill('drill-id') from anywhere; the drill id picks
 * which scenario plays (Helena holistic, Reyes objection, etc.). */

type Beat = {
  id: string
  label: string         /* "BEAT 1 · OPEN WITH THE MILESTONE" */
  durationSec: number
  prompt: string        /* short guidance */
  script: string        /* literal words to say, in quotes */
  listenFor: string     /* what to listen for in the client's reply */
}

type Drill = {
  id: string
  client: string
  title: string
  sub: string
  totalLabel: string    /* "5 minutes · 3 beats" */
  beats: Beat[]
}

const DRILLS: Record<string, Drill> = {
  'helena-holistic': {
    id: 'helena-holistic',
    client: 'Helena Garcia · pre-60 milestone',
    title: 'Holistic talk-track',
    sub: 'The opening you flagged in onboarding · 5 min, 3 beats.',
    totalLabel: '5 min · 3 beats',
    beats: [
      {
        id: 'b1',
        label: 'Beat 1 · Open with the milestone',
        durationSec: 60,
        prompt: 'Lead with what just happened — not what you sell. Curiosity, not consulting.',
        script:
          '"Hi Helena. It\'s been too long — I\'ve been thinking about you and Sergio.\n\nYou just crossed into a new chapter, and I\'d love to hear what\'s on your mind."',
        listenFor:
          'A pause. A small sigh. A "well…". Anything that suggests she\'s already been thinking about the next chapter — that\'s your in.',
      },
      {
        id: 'b2',
        label: 'Beat 2 · One question, then silence',
        durationSec: 90,
        prompt:
          'The hard part: ask one discovery question and don\'t rescue the pause. Let her answer.',
        script:
          '"What does the next ten years look like for you and Sergio?"\n\nThen stop. Don\'t fill it. The silence is the work.',
        listenFor:
          'The first word she chooses. "Travel" / "freedom" / "kids" / "worry" each opens a different door. Whatever she says first, that\'s the conversation.',
      },
      {
        id: 'b3',
        label: 'Beat 3 · Land the soft close',
        durationSec: 90,
        prompt:
          'No quote. No pitch. Offer a 20-minute portfolio walk — and book it before you hang up.',
        script:
          '"Based on what you just shared, I\'d love to walk you through how the plan you have today stacks up against where you\'re heading. No quote, no pitch — just twenty minutes.\n\nWould Tuesday or Wednesday next week work?"',
        listenFor:
          'A specific time. A "let me check with Sergio." Anything but a hard no. If you get a hesitation, offer to send a calendar option in writing.',
      },
    ],
  },
  'reyes-retirement-objection': {
    id: 'reyes-retirement-objection',
    client: 'Paul Reyes · retirement-income objection',
    title: 'Retirement-income objection drill',
    sub: '"Why not just save in my 401(k)?" · 4 min, 3 beats.',
    totalLabel: '4 min · 3 beats',
    beats: [
      {
        id: 'b1',
        label: 'Beat 1 · Acknowledge — don\'t defend',
        durationSec: 60,
        prompt: 'Lead with respect for the question. Defending makes you sound like a salesperson.',
        script:
          '"That\'s a fair question, and most people I work with ask it. Let me answer it honestly — your 401(k) is a great vehicle. The question is whether it\'s the only one you need."',
        listenFor:
          'A relaxation in his tone. He came in expecting pushback; you gave him calm. That earns the next 90 seconds.',
      },
      {
        id: 'b2',
        label: 'Beat 2 · Reframe to risk, not return',
        durationSec: 90,
        prompt: 'Most 401(k) conversations are about return. The real conversation is about timing risk.',
        script:
          '"The piece a 401(k) doesn\'t handle is sequence-of-returns risk — what happens if the market drops in your first year of retirement. The whole plan can shift by ten years from one bad year."',
        listenFor:
          'A question back. If he asks "so what do you do about it?" — you\'ve won the meeting. If he goes quiet, give him 10 seconds before continuing.',
      },
      {
        id: 'b3',
        label: 'Beat 3 · Land the "two buckets" answer',
        durationSec: 90,
        prompt: 'A simple mental model lands better than any product name.',
        script:
          '"The clean way to think about it is two buckets — one for the long game (your 401(k)), one for protected income (what we set up together). The buckets do different jobs. That\'s the conversation I\'d love to have with you and Lily."',
        listenFor:
          'Lily\'s name. If he mentions her, he\'s thinking household, not solo. Lean into that — propose a joint conversation.',
      },
    ],
  },
}

export function CoachDrill() {
  const drillId = useAppStore((s) => s.coachDrillId)
  const close = useAppStore((s) => s.closeCoachDrill)
  const drill = drillId ? DRILLS[drillId] : null
  const [beatIdx, setBeatIdx] = useState(0)
  const [secsLeft, setSecsLeft] = useState(0)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /* Reset when a new drill opens. */
  useEffect(() => {
    if (!drill) return
    setBeatIdx(0)
    setSecsLeft(drill.beats[0].durationSec)
    setRunning(false)
    setDone(false)
  }, [drillId, drill])

  /* Timer tick. */
  useEffect(() => {
    if (!running || done) return
    tickRef.current = setInterval(() => {
      setSecsLeft((s) => {
        if (s <= 1) {
          /* auto-advance */
          if (drill && beatIdx + 1 < drill.beats.length) {
            setBeatIdx((i) => i + 1)
            return drill.beats[beatIdx + 1].durationSec
          }
          setRunning(false)
          setDone(true)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [running, done, drill, beatIdx])

  /* ESC + space shortcuts. */
  useEffect(() => {
    if (!drill) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
      if (e.key === ' ') {
        e.preventDefault()
        if (done) return
        setRunning((r) => !r)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drill, done, close])

  if (!drill) return null
  const d: Drill = drill
  const beat = d.beats[beatIdx]
  const totalBeats = d.beats.length
  const progress = ((beat.durationSec - secsLeft) / beat.durationSec) * 100
  const mm = Math.floor(secsLeft / 60)
  const ss = (secsLeft % 60).toString().padStart(2, '0')

  function next() {
    if (beatIdx + 1 < d.beats.length) {
      setBeatIdx((i) => i + 1)
      setSecsLeft(d.beats[beatIdx + 1].durationSec)
      setRunning(true)
    } else {
      setRunning(false)
      setDone(true)
    }
  }
  function prev() {
    if (beatIdx === 0) return
    setBeatIdx((i) => i - 1)
    setSecsLeft(d.beats[beatIdx - 1].durationSec)
  }

  return (
    <AnimatePresence>
      <motion.div
        key={`drill-${drill.id}`}
        role="dialog"
        aria-label={drill.title}
        className="fixed inset-0 z-[200] flex flex-col"
        style={{
          background:
            'radial-gradient(circle at 25% 15%, #1a2a6b 0%, #060f3f 55%, #02071f 100%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.32 }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-8 py-4 md:px-12">
          <button
            type="button"
            onClick={close}
            className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.22em] text-white/60 hover:text-white"
          >
            <span aria-hidden="true">←</span> Exit drill
          </button>
          <div className="text-center">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-white/40">{drill.client}</p>
            <p className="mt-1 font-serif text-[15px] tracking-tight text-white">{drill.title}</p>
          </div>
          <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-white/40">{drill.totalLabel}</p>
        </div>

        {/* Beat indicator strip */}
        <div className="flex items-center gap-2 px-8 pt-6 md:px-12">
          {drill.beats.map((b, i) => (
            <div key={b.id} className="flex flex-1 flex-col gap-1.5">
              <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className={[
                    'h-full rounded-full',
                    i < beatIdx ? 'bg-[var(--nyl-green-600)]' : i === beatIdx ? 'bg-white' : 'bg-white/0',
                  ].join(' ')}
                  animate={{ width: i < beatIdx ? '100%' : i === beatIdx ? `${progress}%` : '0%' }}
                  transition={{ duration: 0.4, ease: 'linear' }}
                />
              </div>
              <p className={[
                'text-[10px] font-medium uppercase tracking-[0.22em]',
                i === beatIdx ? 'text-white' : 'text-white/40',
              ].join(' ')}>
                Beat {i + 1}
              </p>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex flex-1 items-center justify-center px-8 py-8 md:px-12">
          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div
                key={`beat-${beatIdx}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.36, ease: [0.22, 0.65, 0.05, 1] }}
                className="grid w-full max-w-[1080px] grid-cols-1 gap-8 md:grid-cols-12"
              >
                {/* Left — timer + prompt */}
                <div className="md:col-span-5">
                  <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-[var(--nyl-blue-250,#bccff9)]">
                    {beat.label}
                  </p>
                  <p
                    className="mt-5 font-serif text-[44px] leading-none tracking-tight text-white md:text-[64px]"
                    style={{ fontWeight: 400, fontVariantNumeric: 'tabular-nums' }}
                  >
                    {mm}:{ss}
                  </p>
                  <p className="mt-5 max-w-[44ch] text-[15px] leading-[1.55] text-white/75">
                    {beat.prompt}
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRunning((r) => !r)}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-medium text-neutral-900 hover:bg-white/90"
                    >
                      {running ? (
                        <>
                          <PauseGlyph /> Pause
                        </>
                      ) : (
                        <>
                          <PlayGlyph /> {secsLeft === beat.durationSec ? 'Start beat' : 'Resume'}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={prev}
                      disabled={beatIdx === 0}
                      className="rounded-full border border-white/20 px-4 py-2.5 text-[12px] font-medium text-white/70 hover:border-white/60 hover:text-white disabled:opacity-30"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={next}
                      className="rounded-full border border-white/20 px-4 py-2.5 text-[12px] font-medium text-white/70 hover:border-white/60 hover:text-white"
                    >
                      {beatIdx + 1 === totalBeats ? 'Finish drill →' : 'Next beat →'}
                    </button>
                  </div>
                  <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">
                    Space to start/pause · Esc to exit
                  </p>
                </div>

                {/* Right — script + listen-for */}
                <div className="md:col-span-7">
                  <div className="rounded-2xl bg-white/[0.06] p-7 backdrop-blur-sm md:p-9">
                    <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-[var(--nyl-blue-250,#bccff9)]">What to say</p>
                    <p className="mt-4 whitespace-pre-line font-serif text-[20px] leading-[1.45] tracking-tight text-white md:text-[22px]" style={{ fontWeight: 400, textWrap: 'balance' }}>
                      {beat.script}
                    </p>
                  </div>
                  <div className="mt-4 rounded-2xl bg-white/[0.04] p-6 backdrop-blur-sm md:p-7">
                    <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-white/50">Listen for</p>
                    <p className="mt-3 text-[14px] leading-[1.55] text-white/75">{beat.listenFor}</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 0.65, 0.05, 1] }}
                className="w-full max-w-[720px] text-center"
              >
                <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-[var(--nyl-green-200,#c4f0d9)]">Drill complete</p>
                <h2
                  className="mt-5 font-serif text-[40px] leading-tight tracking-tight text-white md:text-[56px]"
                  style={{ fontWeight: 400, textWrap: 'balance' }}
                >
                  You're ready. Make the call.
                </h2>
                <p className="mx-auto mt-5 max-w-[54ch] text-[15px] leading-[1.55] text-white/70">
                  Three beats logged. The Coach saved the tape — you can replay any beat after the call to see how the live conversation lined up.
                </p>
                <div className="mt-9 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-full bg-white px-5 py-2.5 text-[13px] font-medium text-neutral-900 hover:bg-white/90"
                  >
                    Take me to the call
                  </button>
                  <button
                    type="button"
                    onClick={() => { setBeatIdx(0); setSecsLeft(drill.beats[0].durationSec); setRunning(false); setDone(false) }}
                    className="rounded-full border border-white/20 px-5 py-2.5 text-[13px] font-medium text-white/80 hover:border-white/60 hover:text-white"
                  >
                    Run it again
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

function PlayGlyph() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
      <path d="M3 2 L10 6 L3 10 Z" />
    </svg>
  )
}
function PauseGlyph() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
      <rect x="3" y="2.5" width="2" height="7" rx="0.6" />
      <rect x="7" y="2.5" width="2" height="7" rx="0.6" />
    </svg>
  )
}
