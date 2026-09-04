import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useAppStore } from '@/state/useAppStore'
import { Nyla } from '@/ui/Nyla'
import { PROMPTS, type ActionTarget, type Block, type BulletItem, type Prompt, type RowContext } from './freeformContent'

/* Freeform / Chief-of-Staff Collab — generative-UI showpiece.
 *
 * Turn-stack model:
 *  - Each user prompt creates a new turn (prompt + thinking + response state).
 *  - Turns render in order. Latest is in focus.
 *  - Prior turns dim, blur, and scale down so attention stays on what's live.
 *  - Action buttons inside a response can spawn a new turn (continuing the conversation). */

type Phase = 'thinking' | 'composing' | 'settled'

type Turn = {
  id: number
  prompt: Prompt
  phase: Phase
  thinkingShown: number
  blocksShown: number
}

/* Choose follow-up chips based on the most recent turn's prompt id, so a Powell
 * conversation gets Powell-specific next moves instead of defaulting to Henderson. */
function buildFollowups(latest: Turn | null): string[] {
  const id = latest?.prompt.id
  if (!id) return ['Show me the math', 'Have me draft the outreach', 'Find me a calendar slot']
  if (id === 'powell' || id === 'place-call' || id === 'open-record' || id === 'draft-text' || id === 'capture-notes') {
    return ['Have me draft a text', 'Open his record', 'Find me a calendar slot']
  }
  if (id === 'patel' || id === 'start-drill' || id === 'open-prep-card') {
    return ['Open the prep card', 'Send Mira a confirmation', 'Start the 4-min drill']
  }
  if (id === 'recovery' || id === 'recovery-plan' || id === 'monthly-rhythm') {
    return ['Show me the math', 'Find me a calendar slot', 'Show the monthly rhythm']
  }
  if (id === 'clarke' || id === 'clarke-warm') {
    return ['Open the prep card', 'Find me a calendar slot', 'Have me draft the outreach']
  }
  /* Henderson + generic */
  return ['Show me the math', 'Have me draft the outreach', 'Find me a calendar slot']
}

export function FreeformScene() {
  const pendingPromptId = useAppStore((s) => s.pendingPromptId)
  const clearPendingPrompt = useAppStore((s) => s.clearPendingPrompt)
  const coachOpen = useAppStore((s) => s.coachOpen)
  const setCoachOpen = useAppStore((s) => s.setCoachOpen)
  const [query, setQuery] = useState('')
  const [turns, setTurns] = useState<Turn[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const latestRef = useRef<HTMLDivElement>(null)

  const latest = turns.length > 0 ? turns[turns.length - 1] : null

  function pushTurn(prompt: Prompt) {
    setTurns((ts) => [
      ...ts,
      { id: Date.now() + Math.random(), prompt, phase: 'thinking', thinkingShown: 0, blocksShown: 0 },
    ])
    setQuery('')
  }

  function updateLatest(patch: Partial<Turn>) {
    setTurns((ts) =>
      ts.map((t, i) => (i === ts.length - 1 ? { ...t, ...patch } : t))
    )
  }

  function startById(id: string, customLabel?: string) {
    const p = PROMPTS.find((x) => x.id === id)
    if (!p) return
    pushTurn(customLabel ? { ...p, fullPrompt: customLabel } : p)
  }

  function submit() {
    const q = query.trim()
    if (!q) return
    const matched =
      PROMPTS.find(
        (p) =>
          p.shortLabel.toLowerCase().includes(q.toLowerCase()) ||
          p.fullPrompt.toLowerCase().includes(q.toLowerCase())
      ) ?? PROMPTS[0]
    pushTurn({ ...matched, fullPrompt: q })
  }

  function reset() {
    setTurns([])
  }

  /* If a primary action elsewhere in the app sent us in with a seeded prompt, auto-start. */
  useEffect(() => {
    if (!pendingPromptId) return
    startById(pendingPromptId)
    clearPendingPrompt()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPromptId])

  /* Thinking stream — operates on whichever turn is latest + still thinking */
  useEffect(() => {
    if (!latest || latest.phase !== 'thinking') return
    if (latest.thinkingShown >= latest.prompt.thinking.length) {
      const t = setTimeout(() => updateLatest({ phase: 'composing' }), 350)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => updateLatest({ thinkingShown: latest.thinkingShown + 1 }), 520)
    return () => clearTimeout(t)
  }, [latest])

  /* Block composer */
  useEffect(() => {
    if (!latest || latest.phase !== 'composing') return
    if (latest.blocksShown >= latest.prompt.response.length) {
      const t = setTimeout(() => updateLatest({ phase: 'settled' }), 300)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => updateLatest({ blocksShown: latest.blocksShown + 1 }), 380)
    return () => clearTimeout(t)
  }, [latest])

  /* When a new turn is added, scroll it into view */
  useEffect(() => {
    if (turns.length === 0) return
    const t = setTimeout(() => {
      latestRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
    return () => clearTimeout(t)
  }, [turns.length])

  return (
    <section className="relative flex flex-1 flex-col overflow-hidden">
      {/* Coach toggle — sits in the top right, slim affordance */}
      {turns.length > 0 && (
        <button
          type="button"
          onClick={() => setCoachOpen(!coachOpen)}
          aria-expanded={coachOpen}
          className="absolute right-6 top-0 z-[150] flex items-center gap-2 rounded-full bg-[var(--nyl-blue-800)] px-3.5 py-1.5 text-[10.5px] font-medium uppercase tracking-[0.22em] text-white hover:bg-[var(--nyl-blue-600)] md:right-10 md:top-2 xl:right-12"
        >
          <Nyla size={24} variant="on-dark" />
          {coachOpen ? 'Hide Nyla' : 'Nyla'}
        </button>
      )}

      <div
        ref={scrollRef}
        className={[
          'flex-1 overflow-y-auto px-8 pb-56 md:px-12 md:pb-60 transition-[padding] duration-300',
          coachOpen ? 'lg:pr-[420px]' : '',
        ].join(' ')}
      >
        <div className="mx-auto max-w-[820px]">
          <AnimatePresence mode="wait">
            {turns.length === 0 ? (
              <IdleState
                key="idle"
                query={query}
                setQuery={setQuery}
                onSubmit={submit}
                onPickPrompt={pushTurn}
              />
            ) : (
              <motion.div
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.32 }}
                className="pt-6"
              >
                <button
                  type="button"
                  onClick={reset}
                  className="mb-8 flex items-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-400 hover:text-neutral-900"
                >
                  ← Start over
                </button>

                <div className="flex flex-col gap-16">
                  {turns.map((turn, ti) => {
                    const isLatest = ti === turns.length - 1
                    return (
                      <TurnView
                        key={turn.id}
                        turn={turn}
                        isLatest={isLatest}
                        onAction={(target: ActionTarget) => {
                          if (!target.promptId) return
                          startById(target.promptId, target.label)
                        }}
                        ref={isLatest ? latestRef : undefined}
                      />
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Persistent ask bar — visible once any turn has settled */}
      <AnimatePresence>
        {latest && latest.phase === 'settled' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.32 }}
            className={[
              'pointer-events-none absolute bottom-0 left-0 flex flex-col items-center px-8 pb-8 md:px-12 md:pb-10 transition-[right] duration-300',
              coachOpen ? 'right-0 lg:right-[400px]' : 'right-0',
            ].join(' ')}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-48"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 45%, rgba(255,255,255,1) 100%)',
              }}
            />
            <div className="pointer-events-auto relative w-full max-w-[820px]">
              <AskBar
                value={query}
                onChange={setQuery}
                onSubmit={submit}
                placeholder="What would you like to change or dive deeper into?"
                followups={buildFollowups(latest)}
                onFollowup={(text) => {
                  const matched =
                    PROMPTS.find(
                      (p) =>
                        p.shortLabel.toLowerCase() === text.toLowerCase() ||
                        p.fullPrompt.toLowerCase() === text.toLowerCase() ||
                        text.toLowerCase().includes(p.shortLabel.toLowerCase()),
                    ) ?? PROMPTS[0]
                  pushTurn({ ...matched, fullPrompt: text })
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right-rail Nyla companion */}
      <AnimatePresence>
        {coachOpen && turns.length > 0 && (
          <CoachRail
            turns={turns}
            onClose={() => setCoachOpen(false)}
            onAsk={(text) => {
              const matched =
                PROMPTS.find(
                  (p) =>
                    p.shortLabel.toLowerCase().includes(text.toLowerCase()) ||
                    p.fullPrompt.toLowerCase().includes(text.toLowerCase())
                ) ?? PROMPTS[0]
              pushTurn({ ...matched, fullPrompt: text })
            }}
          />
        )}
      </AnimatePresence>
    </section>
  )
}

function CoachRail({
  turns,
  onClose,
  onAsk,
}: {
  turns: Turn[]
  onClose: () => void
  onAsk: (text: string) => void
}) {
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  /* Auto-scroll to bottom of rail when turns change */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [turns.length])

  return (
    <motion.aside
      role="complementary"
      aria-label="Nyla"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.42, ease: [0.22, 0.65, 0.05, 1] }}
      className="fixed bottom-0 right-0 top-0 z-[140] flex w-[min(400px,92vw)] flex-col text-white shadow-[-24px_0_60px_-20px_rgba(0,10,98,0.32)]"
      style={{
        background:
          'linear-gradient(155deg, #122879 0%, #000a62 55%, #00084a 100%)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="text-[var(--nyl-blue-500)]" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1.5 L13.6 9.2 L21 11 L13.6 12.8 L12 20.5 L10.4 12.8 L3 11 L10.4 9.2 Z" />
            </svg>
          </span>
          <p className="text-[12.5px] font-medium">Nyla</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-[18px] leading-none text-white/55 hover:text-white"
        >
          ×
        </button>
      </div>

      {/* Thread */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="flex flex-col gap-7">
          {turns.map((t) => (
            <CoachTurn key={t.id} turn={t} />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/8 px-4 py-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/4 px-3 py-2.5">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && draft.trim()) {
                onAsk(draft.trim())
                setDraft('')
              }
            }}
            placeholder="Ask anything or change scope"
            className="flex-1 bg-transparent text-[13px] text-white placeholder:text-white/40 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (!draft.trim()) return
              onAsk(draft.trim())
              setDraft('')
            }}
            aria-label="Send"
            className="flex size-7 items-center justify-center rounded-full bg-white text-[12px] text-neutral-900 hover:bg-neutral-200"
          >
            ↑
          </button>
        </div>
      </div>
    </motion.aside>
  )
}

function CoachTurn({ turn }: { turn: Turn }) {
  const narrative = turn.prompt.narrative ?? deriveNarrative(turn.prompt)
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="flex flex-col gap-4"
    >
      {/* User echo — chip-style, right aligned */}
      <div className="flex justify-end">
        <span className="max-w-[80%] rounded-2xl rounded-br-md bg-white/10 px-3.5 py-2 text-[12.5px] leading-snug text-white">
          {turn.prompt.fullPrompt}
        </span>
      </div>

      {/* Agent narrative paragraphs */}
      <div className="flex flex-col gap-3">
        {narrative.map((p, i) => (
          <p key={i} className="text-[13.5px] leading-[1.55] text-white/85">
            {p}
          </p>
        ))}
      </div>
    </motion.div>
  )
}

function deriveNarrative(prompt: Prompt): string[] {
  /* Build a fallback narrative from the response if not authored. */
  const out: string[] = []
  for (const b of prompt.response) {
    if (b.kind === 'headline') out.push(b.text)
    if (b.kind === 'subhead') out.push(b.text)
    if (out.length >= 2) break
  }
  if (out.length === 0) out.push("Here's what I see.")
  return out
}

/* ----------------------------------------------------------------------------
 * Idle state
 * -------------------------------------------------------------------------- */

function IdleState({
  query,
  setQuery,
  onSubmit,
  onPickPrompt,
}: {
  query: string
  setQuery: (v: string) => void
  onSubmit: () => void
  onPickPrompt: (p: Prompt) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-[calc(100vh-160px)] flex-col justify-center pt-6"
    >
      <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-neutral-400">
        Nyla · ask
      </p>
      <h1
        className="mt-5 font-serif text-[44px] leading-[1.04] tracking-tight text-neutral-900 md:text-[64px]"
        style={{ fontWeight: 400, textWrap: 'balance' }}
      >
        What do you want to do next?
      </h1>
      <p className="mt-5 max-w-[58ch] text-[15px] leading-[1.55] text-neutral-500">
        I read your book, your calendar, and your last 30 days. Ask me anything — or pick one of the openings I see.
      </p>

      <div className="mt-12">
        <AskBar value={query} onChange={setQuery} onSubmit={onSubmit} placeholder="Ask anything" autoFocus />
      </div>

      <ul className="mt-6 flex flex-col gap-1.5">
        {PROMPTS.slice(0, 5).map((p, i) => (
          <motion.li
            key={p.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
          >
            <button
              type="button"
              onClick={() => onPickPrompt(p)}
              className="group flex w-full items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-neutral-100"
            >
              <span className="flex items-center gap-3 text-[14px] text-neutral-700 group-hover:text-neutral-900">
                <Spark />
                {p.shortLabel}
              </span>
              <span aria-hidden="true" className="text-[12px] text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-neutral-500">
                →
              </span>
            </button>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )
}

/* ----------------------------------------------------------------------------
 * Turn view — one user-question + one streaming response
 * -------------------------------------------------------------------------- */

const TurnView = ({ turn, isLatest, onAction, ref }: {
  turn: Turn
  isLatest: boolean
  onAction: (target: ActionTarget) => void
  ref?: React.Ref<HTMLDivElement>
}) => {
  /* Non-latest turns dim + blur to push focus to the active turn */
  const dimStyle = isLatest
    ? { filter: 'blur(0px)', opacity: 1 }
    : { filter: 'blur(3px)', opacity: 0.32 }

  return (
    <motion.div
      ref={ref}
      animate={dimStyle}
      transition={{ duration: 0.45, ease: [0.22, 0.65, 0.05, 1] }}
      style={{ pointerEvents: isLatest ? 'auto' : 'none' }}
    >
      {/* User question echo */}
      <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-neutral-400">You asked</p>
      <p
        className="mt-2 font-serif text-[22px] leading-[1.22] tracking-tight text-neutral-700 md:text-[26px]"
        style={{ fontWeight: 400, textWrap: 'balance' }}
      >
        "{turn.prompt.fullPrompt}"
      </p>

      {/* Thinking stream */}
      <div className="mt-8 flex flex-col gap-2">
        {turn.prompt.thinking.slice(0, turn.thinkingShown).map((line, i) => {
          const last = i === turn.thinkingShown - 1 && turn.phase === 'thinking'
          return (
            <motion.div
              key={`${line}-${i}`}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.32 }}
              className="flex items-center gap-2.5 text-[12.5px] text-neutral-400"
            >
              {last ? <ThinkingDot /> : <CheckDot />}
              <span>{line}{last ? '…' : ''}</span>
            </motion.div>
          )
        })}
      </div>

      {/* Response blocks — wrapped in a floating card so they pop off the dotted ground */}
      <div className="mt-10 flex flex-col gap-7 rounded-2xl bg-white p-7 shadow-[0_24px_60px_-30px_rgba(0,10,98,0.18)] md:p-10">
        {turn.prompt.response.slice(0, turn.blocksShown).map((b, i) => (
          <BlockRenderer key={`${turn.id}-${i}`} block={b} onAction={onAction} />
        ))}

        <AnimatePresence>
          {turn.phase === 'composing' && turn.blocksShown < turn.prompt.response.length && (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-2"
            >
              <Shimmer width="65%" />
              <Shimmer width="92%" />
              <Shimmer width="40%" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/* ----------------------------------------------------------------------------
 * Block renderers
 * -------------------------------------------------------------------------- */

function BlockRenderer({
  block,
  onAction,
}: {
  block: Block
  onAction: (target: ActionTarget) => void
}) {
  const baseAnim = {
    initial: { opacity: 0, y: 10, scale: 0.985 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.55, ease: [0.22, 0.65, 0.05, 1] as const },
  }

  switch (block.kind) {
    case 'headline':
      return (
        <motion.h2
          {...baseAnim}
          className="font-serif text-[34px] leading-[1.06] tracking-tight text-neutral-900 md:text-[42px]"
          style={{ fontWeight: 400, textWrap: 'balance' }}
        >
          {block.text}
        </motion.h2>
      )
    case 'subhead':
      return (
        <motion.p {...baseAnim} className="max-w-[60ch] text-[16px] leading-[1.55] text-neutral-700">
          {block.text}
        </motion.p>
      )
    case 'bullets':
      return (
        <motion.ul {...baseAnim} className="flex flex-col gap-2.5">
          {block.items.map((it, i) => (
            <BulletRow key={it.text} item={it} delay={0.08 * i} onAction={onAction} />
          ))}
        </motion.ul>
      )
    case 'draft-preview':
      return (
        <motion.div {...baseAnim} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_18px_40px_-22px_rgba(0,0,0,0.18)]">
          {/* Channel header */}
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-neutral-100 text-[11px] uppercase tracking-[0.18em] text-neutral-600">
                {block.channel === 'email' ? '✉' : <Nyla size={24} variant="on-light" />}
              </span>
              <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                {block.channel === 'email' ? 'Email · in your voice' : 'iMessage · in your voice'}
              </p>
            </div>
            {block.tone && (
              <span className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-[10.5px] uppercase tracking-[0.18em] text-neutral-500">
                {block.tone}
              </span>
            )}
          </div>

          {/* To / subject */}
          {block.channel === 'email' && (block.to || block.subject) && (
            <div className="border-b border-neutral-100 px-5 py-3">
              {block.to && (
                <div className="flex items-baseline gap-3">
                  <p className="w-[64px] text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-400">
                    To
                  </p>
                  <p className="text-[13px] text-neutral-700">{block.to}</p>
                </div>
              )}
              {block.subject && (
                <div className="mt-2 flex items-baseline gap-3">
                  <p className="w-[64px] text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-400">
                    Subject
                  </p>
                  <p className="text-[13px] font-medium text-neutral-900">{block.subject}</p>
                </div>
              )}
            </div>
          )}

          {/* Body — pre-wrapped for paragraph breaks */}
          <div className="whitespace-pre-wrap px-5 py-4 text-[14.5px] leading-[1.65] text-neutral-800">
            {block.body}
          </div>

          {/* Inline actions */}
          <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 bg-neutral-50/60 px-5 py-3">
            <button
              type="button"
              onClick={() => onAction(block.primary)}
              className="rounded-full bg-[var(--nyl-blue-800)] px-4 py-2 text-[12px] font-medium text-white hover:bg-[var(--nyl-blue-600)]"
            >
              {block.primary.label}
            </button>
            {block.secondary?.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => onAction(s)}
                className="rounded-full border border-neutral-300 px-3 py-2 text-[12px] text-neutral-700 hover:border-neutral-900 hover:text-neutral-900"
              >
                {s.label}
              </button>
            ))}
          </div>
        </motion.div>
      )
    case 'quote':
      return (
        <motion.figure {...baseAnim} className="border-l-2 border-neutral-900 pl-5">
          <p className="font-serif text-[20px] leading-[1.32] tracking-tight text-neutral-900 md:text-[22px]" style={{ fontWeight: 400 }}>
            "{block.text}"
          </p>
          {block.attribution && (
            <figcaption className="mt-2 text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-400">
              {block.attribution}
            </figcaption>
          )}
        </motion.figure>
      )
    case 'metric-row':
      return (
        <motion.div
          {...baseAnim}
          className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-neutral-200/70 sm:grid-cols-3"
        >
          {block.metrics.map((m) => (
            <div key={m.label} className="bg-white px-5 py-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-400">{m.label}</p>
              <p className="mt-1.5 font-serif text-[26px] leading-none tracking-tight text-neutral-900">{m.value}</p>
              {m.sub && <p className="mt-1 text-[11px] text-neutral-500">{m.sub}</p>}
            </div>
          ))}
        </motion.div>
      )
    case 'sparkline':
      return (
        <motion.div {...baseAnim} className="rounded-2xl border border-neutral-200 p-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-400">{block.label}</p>
          <Sparkline series={block.series} />
          <p className="mt-2 text-[12px] text-neutral-500">{block.note}</p>
        </motion.div>
      )
    case 'sources':
      return (
        <motion.div {...baseAnim} className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-400">Sources</p>
          {block.items.map((s) => (
            <span
              key={s}
              className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-[11px] text-neutral-600"
            >
              {s}
            </span>
          ))}
        </motion.div>
      )
    case 'actions':
      return (
        <motion.div
          {...baseAnim}
          className="mt-2 flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-6"
        >
          <button
            type="button"
            onClick={() => onAction(block.primary)}
            className="rounded-full bg-[var(--nyl-blue-800)] px-5 py-2.5 text-[12.5px] font-medium uppercase tracking-[0.18em] text-white hover:bg-[var(--nyl-blue-600)]"
          >
            {block.primary.label}
          </button>
          {block.secondary?.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => onAction(s)}
              className="rounded-full border border-neutral-300 px-4 py-2.5 text-[12.5px] text-neutral-700 hover:border-neutral-900 hover:text-neutral-900"
            >
              {s.label}
            </button>
          ))}
        </motion.div>
      )
    default:
      return null
  }
}

/* ----------------------------------------------------------------------------
 * Primitives
 * -------------------------------------------------------------------------- */

function AskBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Ask a follow-up',
  autoFocus = false,
  followups,
  onFollowup,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  placeholder?: string
  autoFocus?: boolean
  followups?: string[]
  onFollowup?: (text: string) => void
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white/95 px-5 py-3.5 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.18)] backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Spark />
        <input
          type="text"
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmit()
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-[15px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={onSubmit}
          aria-label="Submit"
          className="flex size-8 items-center justify-center rounded-full bg-[var(--nyl-blue-800)] text-white hover:bg-[var(--nyl-blue-600)]"
        >
          <span aria-hidden="true" className="text-[14px]">↑</span>
        </button>
      </div>
      {followups && followups.length > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-neutral-100 pt-2.5">
          {followups.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onFollowup?.(f)}
              className="rounded-full border border-neutral-200 px-3 py-1 text-[11.5px] text-neutral-600 hover:border-neutral-900 hover:text-neutral-900"
            >
              {f}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ----------------------------------------------------------------------------
 * BulletRow — bullet with optional long-press / hover context popover
 * -------------------------------------------------------------------------- */

function BulletRow({
  item,
  delay,
  onAction,
}: {
  item: BulletItem
  delay: number
  onAction: (target: ActionTarget) => void
}) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* Trigger on long-press (mouse-down 400ms) or click of the spark affordance */
  function startPress() {
    if (!item.context) return
    pressTimer.current = setTimeout(() => setOpen(true), 380)
  }
  function cancelPress() {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  /* Close on Esc */
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open])

  const hasContext = !!item.context

  return (
    <motion.li
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative flex gap-3.5"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false)
        cancelPress()
      }}
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onContextMenu={(e) => {
        if (!hasContext) return
        e.preventDefault()
        setOpen(true)
      }}
    >
      <span aria-hidden="true" className="mt-[10px] inline-block size-1 shrink-0 rounded-full bg-neutral-400" />
      <span
        className={[
          'flex-1 text-[15px] leading-snug',
          item.emphasis ? 'font-medium text-neutral-900' : 'text-neutral-700',
        ].join(' ')}
      >
        {item.text}
      </span>

      {hasContext && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Open contextual menu"
          className={[
            'mt-[6px] inline-flex shrink-0 items-center justify-center rounded-full transition-all',
            hovered || open
              ? 'size-6 bg-[var(--nyl-blue-800)] text-white opacity-100'
              : 'size-5 bg-neutral-100 text-neutral-400 opacity-0',
          ].join(' ')}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 1.5 L13.6 9.2 L21 11 L13.6 12.8 L12 20.5 L10.4 12.8 L3 11 L10.4 9.2 Z" />
          </svg>
        </button>
      )}

      <AnimatePresence>
        {open && item.context && (
          <RowContextPopover
            context={item.context}
            onClose={() => setOpen(false)}
            onAction={(t) => {
              setOpen(false)
              onAction(t)
            }}
          />
        )}
      </AnimatePresence>
    </motion.li>
  )
}

function RowContextPopover({
  context,
  onClose,
  onAction,
}: {
  context: RowContext
  onClose: () => void
  onAction: (t: ActionTarget) => void
}) {
  return (
    <>
      {/* Light scrim to catch outside clicks */}
      <motion.button
        type="button"
        aria-label="Close context menu"
        onClick={onClose}
        className="fixed inset-0 z-[200] cursor-default bg-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      />

      {/* Popover — anchored to the right of the bullet via absolute positioning */}
      <motion.div
        role="dialog"
        initial={{ opacity: 0, y: 6, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 6, scale: 0.96 }}
        transition={{ duration: 0.22, ease: [0.22, 0.65, 0.05, 1] }}
        className="absolute right-0 top-7 z-[210] flex w-[min(440px,calc(100vw-3rem))] flex-col gap-2"
      >
        {/* Navy "Nyla" message — subtle gradient for depth */}
        <div
          className="overflow-hidden rounded-2xl p-4 text-white shadow-[0_24px_60px_-20px_rgba(0,10,98,0.45)]"
          style={{
            background:
              'linear-gradient(155deg, #122879 0%, #000a62 55%, #00084a 100%)',
          }}
        >
          {context.echo && (
            <p className="mb-3 text-[12.5px] leading-snug text-white/45">
              "{context.echo}"
            </p>
          )}
          <div className="rounded-lg bg-white/10 px-3.5 py-2.5 ring-1 ring-inset ring-white/8">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/60">
              Suggested action
            </p>
            <p className="mt-1 text-[13.5px] leading-snug text-white">{context.take}</p>
          </div>
        </div>

        {/* Pale-blue quick-action chips — pulled from the new Figma */}
        <ul className="flex flex-col gap-1.5">
          {context.quickActions.map((q) => (
            <li key={q.label}>
              <button
                type="button"
                onClick={() => onAction(q)}
                className="block w-full rounded-lg border border-[var(--nyl-blue-250)]/55 bg-[var(--nyl-blue-100)]/85 px-3.5 py-2 text-left text-[13px] font-medium text-[var(--nyl-blue-800)] transition-colors hover:bg-[var(--nyl-blue-100)]"
              >
                {q.label}
              </button>
            </li>
          ))}
        </ul>
      </motion.div>
    </>
  )
}

function Spark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0 text-neutral-900">
      <path d="M12 1.5 L13.6 9.2 L21 11 L13.6 12.8 L12 20.5 L10.4 12.8 L3 11 L10.4 9.2 Z" />
    </svg>
  )
}

function ThinkingDot() {
  return (
    <span className="relative inline-flex size-2 shrink-0 items-center justify-center">
      <span className="absolute inline-flex size-2 animate-ping rounded-full bg-neutral-400 opacity-75" />
      <span className="relative inline-flex size-1.5 rounded-full bg-neutral-700" />
    </span>
  )
}

function CheckDot() {
  return (
    <span className="inline-flex size-2 shrink-0 items-center justify-center rounded-full bg-neutral-300">
      <svg width="6" height="6" viewBox="0 0 6 6" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M1 3 L2.5 4.5 L5 1.5" />
      </svg>
    </span>
  )
}

function Shimmer({ width }: { width: string }) {
  return (
    <div
      className="h-3 rounded-full bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100"
      style={{
        width,
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.6s linear infinite',
      }}
    />
  )
}

function Sparkline({ series }: { series: number[] }) {
  const path = useMemo(() => {
    const w = 480
    const h = 64
    const max = Math.max(...series)
    const min = Math.min(...series)
    const range = Math.max(1, max - min)
    return series
      .map((v, i) => {
        const x = (i / (series.length - 1)) * w
        const y = h - ((v - min) / range) * h
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
      })
      .join(' ')
  }, [series])

  return (
    <svg viewBox="0 0 480 64" className="mt-3 h-16 w-full" aria-hidden="true">
      <motion.path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-neutral-900"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: 'easeInOut' }}
      />
    </svg>
  )
}
