import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useAppStore } from '@/state/useAppStore'

/* Tom Anderson sequential collab canvas.
 *
 * Stages:
 *  0 — initial issue card with two CTAs
 *  1 — system synthesizes a 3-step play in a header bar
 *  2 — three step cards reveal in stagger
 *  3 — Step 1 expands to show conversation guidance + draft + send
 *
 * Persistent dark navy chat input at the bottom — drives the user forward. */

type Stage = 0 | 1 | 2 | 3 | 4

type Tone = 'personal' | 'professional' | 'apology' | 'update'
type Channel = 'call' | 'text'

const TONES: { id: Tone; label: string }[] = [
  { id: 'personal', label: 'Personal' },
  { id: 'professional', label: 'Professional' },
  { id: 'apology', label: 'Apology' },
  { id: 'update', label: 'Update' },
]

/* Draft variants the tone tabs swap between. Channel ('call' vs 'text') reframes
 * the opener — a spoken script vs a text message. */
const DRAFTS: Record<Channel, Record<Tone, string>> = {
  text: {
    personal:
      "Hey Tom, how are you? I wanted to reach out personally — there's a medical form holding up your application, and that's on our end, not yours. I'm resending it right now. Once it's back, you're clear to close. Shouldn't take more than a couple of days.",
    professional:
      "Hi Tom, following up on your application. We're waiting on a medical form (APS) request that wasn't sent on our end. I've resent it today and will confirm receipt with underwriting. We expect to close within the week.",
    apology:
      "Hi Tom — I owe you an apology. A medical form request never went out on our end, which is why your application stalled. That's on me. I've resent it today and I'm personally tracking it until it closes.",
    update:
      "Quick update, Tom: your application was waiting on a medical form that hadn't been sent. I've resent it today. Once underwriting receives it, you're clear to close — likely within the week. I'll keep you posted.",
  },
  call: {
    personal:
      "Hey Tom, how are you? I wanted to call you myself. There's a medical form that's been holding up your application — that's on our end, not anything you did. I'm resending it right now while we're on the phone. Once it's back, you're clear to close.",
    professional:
      "Hi Tom, thanks for taking my call. I'm reaching out about your application — we were waiting on a medical form (APS) that wasn't sent on our end. I'm resending it now and will confirm with underwriting. We should close within the week.",
    apology:
      "Tom, thanks for picking up. I want to apologize — a medical form request never went out on our side, and that's what stalled your application. That's on me. I'm resending it right now and I'll personally see it through.",
    update:
      "Hi Tom, quick call to update you: your application was held up by a medical form that hadn't been sent. I'm resending it now. Once underwriting has it, you're clear to close — likely within the week.",
  },
}

export function TomGuidedCanvas() {
  const close = useAppStore((s) => s.closeDeepDive)
  const [stage, setStage] = useState<Stage>(0)
  const [chat, setChat] = useState('')

  /* Conversation-guidance step state (Step 1 expanded). */
  const [channel, setChannel] = useState<Channel>('text')
  const [tone, setTone] = useState<Tone>('personal')
  const [draft, setDraft] = useState(DRAFTS.text.personal)
  /* Once the advisor hand-edits the draft, stop overwriting it on tone/channel change. */
  const [edited, setEdited] = useState(false)
  const [editing, setEditing] = useState(false)
  const [sent, setSent] = useState(false)

  function applyDraft(nextChannel: Channel, nextTone: Tone) {
    if (!edited) setDraft(DRAFTS[nextChannel][nextTone])
  }
  function selectChannel(c: Channel) {
    setChannel(c)
    applyDraft(c, tone)
  }
  function selectTone(t: Tone) {
    setTone(t)
    applyDraft(channel, t)
  }

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [close])

  /* Helper: bottom chat input drives the stage forward */
  function submitChat() {
    if (!chat.trim()) return
    setChat('')
    if (stage < 1) setStage(1)
    else if (stage < 2) setStage(2)
    else if (stage < 3) setStage(3)
    else setStage(4)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-4 border-b border-neutral-200 bg-white/85 px-8 py-4 backdrop-blur-sm md:px-12">
        <button
          type="button"
          onClick={close}
          className="flex items-center gap-2 text-[13px] font-medium text-neutral-700 hover:text-neutral-900"
        >
          <span aria-hidden="true">←</span>
          <span className="font-serif text-[18px] tracking-tight text-neutral-900">
            Tom Anderson · stalled application
          </span>
        </button>
        <p className="ml-2 text-[11px] uppercase tracking-[0.22em] text-neutral-400">
          Saved just now
        </p>
      </div>

      {/* Body */}
      <div className="dot-ground relative flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-[760px] flex-col gap-5 px-8 py-10 pb-10 md:px-0">
          {/* Stage 1+ banner — synthesizing */}
          <AnimatePresence>
            {stage >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl border border-neutral-200 bg-white/80 px-5 py-3"
              >
                <p className="text-[12px] text-neutral-500">
                  You'll hit <span className="font-medium text-neutral-900">$4,200 FYC</span> if this closes.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stage 1+: editorial intro */}
          <AnimatePresence>
            {stage >= 1 && (
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="font-serif text-[32px] leading-[1.1] tracking-tight text-neutral-900 md:text-[40px]"
                style={{ fontWeight: 400, textWrap: 'balance' }}
              >
                Run this before 10AM today in 3 steps.
              </motion.h2>
            )}
          </AnimatePresence>

          {/* Issue card — always visible */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 0.65, 0.05, 1] }}
            className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_24px_60px_-30px_rgba(0,10,98,0.18)]"
          >
            <div className="p-6">
              <h2
                className="font-serif text-[20px] leading-[1.22] tracking-tight text-neutral-900 md:text-[22px]"
                style={{ fontWeight: 400, textWrap: 'balance' }}
              >
                Tom Anderson has been sitting at{' '}
                <span className="text-[#B82A1F]">underwriting for 11 days</span> on a missing form. One 10-minute call clears it.
              </h2>
              <div className="mt-5 grid grid-cols-1 gap-5 border-t border-neutral-100 pt-5 md:grid-cols-3">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-400">
                    Analysis
                  </p>
                  <p className="mt-1.5 text-[13.5px] leading-[1.5] text-neutral-700">
                    While the app stalled at underwriting due to a missing APS medical form, Tom hasn't received the request.
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-400">
                    Insight
                  </p>
                  <p className="mt-1.5 text-[13.5px] leading-[1.5] text-neutral-700">
                    This is a system failure, not a client failure. One outreach resolves it.
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-400">
                    Recommendation
                  </p>
                  <p className="mt-1.5 text-[13.5px] leading-[1.5] text-neutral-700">
                    Call Tom Anderson to set expectations, then resend APS request via Sales Central.
                  </p>
                </div>
              </div>
            </div>
            {stage === 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 border-t border-neutral-100 bg-neutral-50/60 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setStage(2)}
                  className="rounded-full bg-[var(--nyl-blue-800)] px-4 py-2 text-[12px] font-medium uppercase tracking-[0.18em] text-white hover:bg-[var(--nyl-blue-600)]"
                >
                  Review the issue
                </button>
                <button
                  type="button"
                  className="rounded-full border border-neutral-300 px-4 py-2 text-[12px] font-medium uppercase tracking-[0.18em] text-neutral-700 hover:border-neutral-900 hover:text-neutral-900"
                >
                  View underwriting timeline
                </button>
              </div>
            )}
          </motion.div>

          {/* Stage 2+: the 3 steps */}
          <AnimatePresence>
            {stage >= 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.32 }}
                className="flex flex-col gap-4"
              >
                <StepCard
                  index={1}
                  badge="Connect with Tom ASAP"
                  title="Own the delay before he notices it"
                  sub="Clients who hear about a problem from their advisor stay clients. Clients who discover it themselves don't."
                  cta="View conversation guidance"
                  expanded={stage >= 3}
                  onExpand={() => setStage((s) => (s < 3 ? 3 : s))}
                >
                  {/* Conversation guidance */}
                  <div className="rounded-xl border border-neutral-200 bg-white">
                    <div className="border-b border-neutral-100 px-4 py-3">
                      <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-400">
                        Conversation guidance
                      </p>
                      <p className="mt-1.5 text-[14.5px] leading-snug text-neutral-900">
                        Take the next 5 min to chat with Tom and resend the application.
                      </p>
                      <p className="mt-1 text-[12.5px] text-neutral-500">
                        When you connect with him, acknowledge the hold, and tell him you've identified the issue and are resolving it today.
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-4 py-2.5">
                      {/* Channel toggle */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => selectChannel('call')}
                          className={[
                            'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors',
                            channel === 'call' ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-700',
                          ].join(' ')}
                        >
                          <PhoneIcon />
                          Call
                        </button>
                        <button
                          type="button"
                          onClick={() => selectChannel('text')}
                          className={[
                            'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors',
                            channel === 'text' ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-700',
                          ].join(' ')}
                        >
                          <ChatIcon />
                          Text
                        </button>
                      </div>
                      {/* Tone tabs */}
                      <div className="flex items-center gap-1.5">
                        {TONES.map((t) => {
                          const isActive = t.id === tone
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => selectTone(t.id)}
                              aria-pressed={isActive}
                              className={[
                                'rounded-full px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] transition-colors',
                                isActive
                                  ? 'bg-neutral-900 text-white'
                                  : 'border border-neutral-300 text-neutral-500 hover:border-neutral-400 hover:text-neutral-800',
                              ].join(' ')}
                            >
                              {t.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Draft — read-only, or editable when adjusting the tone */}
                    {editing ? (
                      <textarea
                        value={draft}
                        onChange={(e) => {
                          setDraft(e.target.value)
                          setEdited(true)
                        }}
                        rows={5}
                        autoFocus
                        className="w-full resize-none bg-transparent px-4 py-4 text-[13.5px] leading-[1.65] text-neutral-800 focus:outline-none"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap px-4 py-4 text-[13.5px] leading-[1.65] text-neutral-800">
                        {draft}
                      </p>
                    )}

                    {/* Footer — Send / Adjust, or a sent confirmation */}
                    {sent ? (
                      <div className="flex items-center gap-2 border-t border-neutral-100 bg-[var(--nyl-green-200)]/25 px-4 py-3 text-[12.5px] text-[var(--nyl-green-800)]">
                        <span aria-hidden="true" className="inline-flex size-4 items-center justify-center rounded-full bg-[var(--nyl-green-600)] text-white">
                          <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2.5 6.5 L5 9 L9.5 3.5" />
                          </svg>
                        </span>
                        <span className="font-medium">
                          {channel === 'call' ? 'Talking points ready' : 'Message sent to Tom'} · logged in Sales Central
                        </span>
                        <button
                          type="button"
                          onClick={() => setSent(false)}
                          className="ml-auto text-[12px] text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline"
                        >
                          Undo
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 border-t border-neutral-100 bg-neutral-50/60 px-4 py-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSent(true)
                            setEditing(false)
                            setStage((s) => (s < 4 ? 4 : s))
                          }}
                          className="rounded-md bg-[var(--nyl-blue-500)] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[var(--nyl-blue-600)]"
                        >
                          {channel === 'call' ? 'Mark as called' : 'Send'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing((v) => !v)}
                          className={[
                            'rounded-md border px-3 py-1.5 text-[12px] transition-colors',
                            editing
                              ? 'border-[var(--nyl-blue-500)] text-[var(--nyl-blue-500)] hover:bg-[var(--nyl-blue-100)]/50'
                              : 'border-neutral-300 text-neutral-700 hover:border-neutral-900 hover:text-neutral-900',
                          ].join(' ')}
                        >
                          {editing ? 'Done editing' : 'Adjust the tone'}
                        </button>
                        {edited && !editing && (
                          <button
                            type="button"
                            onClick={() => {
                              setEdited(false)
                              setDraft(DRAFTS[channel][tone])
                            }}
                            className="text-[12px] text-neutral-400 underline-offset-4 hover:text-neutral-700 hover:underline"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </StepCard>

                <StepCard
                  index={2}
                  badge="Immediate follow-up"
                  title="Resend the APS request via Sales Central"
                  sub="Do this while Tom is still on the call (or immediately after you hang up). Confirm the resend, note the timestamp in the case file, and set a 48-hour follow-up alert in case check receipt."
                  cta="Prepare the resend request"
                />

                <StepCard
                  index={3}
                  badge="Log and protect"
                  title="Update the case and block your follow-up"
                  sub="Log the call in Sales Central with the APS resend timestamp. Set a 48-hour alert to confirm the form was received by underwriting. If the form doesn't return, escalate and don't wait for another 11-day drift."
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Persistent dark navy chat — OUTSIDE the scroll so it stays glued to the viewport bottom */}
      <div className="dot-ground relative border-t border-neutral-200/50 px-8 py-4 md:px-12">
        <div className="mx-auto w-full max-w-[760px]">
          {stage >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="mb-3 flex flex-wrap items-center justify-center gap-2"
            >
              <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">
                Suggested actions
              </p>
              <button
                type="button"
                className="rounded-full px-4 py-2 text-[12.5px] font-medium text-white shadow-[0_10px_24px_-12px_rgba(0,10,98,0.5)] hover:opacity-90"
                style={{
                  background:
                    'linear-gradient(150deg, #122879 0%, #000a62 55%, #00084a 100%)',
                }}
              >
                Review Helena's portfolio
              </button>
              <button
                type="button"
                className="rounded-full px-4 py-2 text-[12.5px] font-medium text-white shadow-[0_10px_24px_-12px_rgba(0,10,98,0.5)] hover:opacity-90"
                style={{
                  background:
                    'linear-gradient(150deg, #122879 0%, #000a62 55%, #00084a 100%)',
                }}
              >
                Review the Tom Anderson timeline
              </button>
            </motion.div>
          )}
          <div
            className="flex items-center gap-3 rounded-2xl px-5 py-3.5 text-white shadow-[0_18px_40px_-22px_rgba(0,10,98,0.5)]"
            style={{
              background:
                'linear-gradient(155deg, #122879 0%, #000a62 55%, #00084a 100%)',
            }}
          >
            <span className="text-[var(--nyl-blue-500)]" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1.5 L13.6 9.2 L21 11 L13.6 12.8 L12 20.5 L10.4 12.8 L3 11 L10.4 9.2 Z" />
              </svg>
            </span>
            <input
              type="text"
              value={chat}
              onChange={(e) => setChat(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitChat()
              }}
              placeholder={stage === 0 ? 'What would you like to change or dive deeper into?' : 'what are the best next steps to resolve this promptly'}
              className="flex-1 bg-transparent text-[14px] text-white placeholder:text-white/45 focus:outline-none"
            />
            <button
              type="button"
              aria-label="Voice"
              className="text-white/55 hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="3" width="6" height="11" rx="3" />
                <path d="M5 11 a7 7 0 0 0 14 0" />
                <path d="M12 18 V21" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6.5 3 H4.2 C3.5 3 3 3.5 3 4.2 C3 10.5 9.5 17 15.8 17 C16.5 17 17 16.5 17 15.8 V13.5 L13.5 12.5 L12 14 C9.8 13 7 10.2 6 8 L7.5 6.5 Z" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 5 a2 2 0 0 1 2-2 H15 a2 2 0 0 1 2 2 V12 a2 2 0 0 1 -2 2 H8 L4 17 V14 H5 a2 2 0 0 1 -2-2 Z" />
    </svg>
  )
}

function StepCard({
  index,
  badge,
  title,
  sub,
  cta,
  expanded,
  onExpand,
  children,
}: {
  index: number
  badge: string
  title: string
  sub: string
  cta?: string
  expanded?: boolean
  onExpand?: () => void
  children?: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.06 * index, ease: [0.22, 0.65, 0.05, 1] }}
      className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
    >
      <div className="p-5">
        <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-[var(--nyl-blue-500)]">
          {badge}
        </p>
        <p className="mt-1.5 text-[16.5px] font-medium leading-snug text-neutral-900">
          {title}
        </p>
        <p className="mt-2 max-w-[60ch] text-[12.5px] leading-snug text-neutral-500">{sub}</p>
        {cta && !expanded && (
          <button
            type="button"
            onClick={onExpand}
            className="mt-4 rounded-full border border-[var(--nyl-blue-500)] bg-white px-3.5 py-1.5 text-[12px] font-medium text-[var(--nyl-blue-500)] hover:bg-[var(--nyl-blue-100)]/55"
          >
            {cta}
          </button>
        )}
      </div>
      {expanded && children && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.35 }}
          className="border-t border-neutral-100 bg-neutral-50/60 px-5 py-5"
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  )
}
