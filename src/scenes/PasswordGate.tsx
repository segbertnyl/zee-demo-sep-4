import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'

/* Lightweight client-side password gate for the NYL360 prototype. Not real
 * security — keeps the demo from being shared/indexed accidentally. Unlocked
 * state persists for the browser session via sessionStorage. */

const PASSWORD = 'nyl2026'
const SESSION_KEY = 'agent-os-v5.unlocked'

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    try {
      /* Deep-link (e.g. #briefing-v6) shares a direct preview — skip the gate. */
      if (window.location.hash.includes('briefing-v6')) {
        window.sessionStorage.setItem(SESSION_KEY, '1')
        return true
      }
      return window.sessionStorage.getItem(SESSION_KEY) === '1'
    } catch { return false }
  })
  const [value, setValue] = useState('')
  const [shake, setShake] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!unlocked) inputRef.current?.focus()
  }, [unlocked])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (value.trim().toLowerCase() === PASSWORD) {
      try { window.sessionStorage.setItem(SESSION_KEY, '1') } catch { /* no-op */ }
      setUnlocked(true)
      return
    }
    setShake(true)
    setTimeout(() => setShake(false), 380)
    setValue('')
  }

  if (unlocked) return <>{children}</>

  return (
    <div
      className="overlay-bleed z-[300] flex items-center justify-center px-6"
      style={{ background: 'linear-gradient(150deg, #e9efff 0%, #d3e0ff 55%, #b9cef9 100%)' }}
    >
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0, x: shake ? [-6, 6, -4, 4, 0] : 0 }}
        transition={shake ? { duration: 0.38 } : { duration: 0.4, ease: [0.22, 0.65, 0.05, 1] }}
        className="w-full max-w-[420px] rounded-[28px] bg-white p-10 shadow-[0_30px_80px_-25px_rgba(0,10,98,0.35)]"
      >
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-lg bg-[var(--nyl-blue-500)] font-serif text-[16px] text-white" style={{ fontWeight: 400 }}>
            N
          </span>
          <p className="text-[11.5px] font-medium uppercase tracking-[0.22em] text-[var(--nyl-blue-800)]">
            NYL360 prototype
          </p>
        </div>
        <h1
          className="mt-6 font-serif text-[30px] leading-tight tracking-tight text-[var(--nyl-blue-800)]"
          style={{ fontWeight: 400, textWrap: 'balance' }}
        >
          Enter the access code to continue.
        </h1>
        <p className="mt-3 text-[13px] leading-snug text-neutral-600">
          This is an internal preview. Reach out to the NYL360 team if you need the code.
        </p>

        <label className="mt-7 block">
          <span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-neutral-500">Access code</span>
          <input
            ref={inputRef}
            type="password"
            autoComplete="current-password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            spellCheck={false}
            className={[
              'mt-2 block w-full rounded-lg border bg-white px-4 py-3 text-[15px] tracking-wide text-neutral-900 outline-none transition-colors',
              shake ? 'border-[#dc2626] focus:border-[#dc2626]' : 'border-neutral-300 focus:border-[var(--nyl-blue-500)]',
            ].join(' ')}
            aria-invalid={shake}
          />
          {shake && (
            <span className="mt-2 block text-[12px] text-[#b82a1f]">That code doesn't match. Try again.</span>
          )}
        </label>

        <button
          type="submit"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--nyl-blue-500)] px-5 py-3 text-[13.5px] font-medium text-white hover:bg-[var(--nyl-blue-600)]"
        >
          Unlock <span aria-hidden="true">→</span>
        </button>
      </motion.form>
    </div>
  )
}
