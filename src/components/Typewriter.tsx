import { useEffect, useRef, useState } from 'react'

/* Character-by-character reveal — the OS speaking in real time.
 * Cheap visual trick that signals "this is being generated, not read from a static page."
 *
 * - `text` is the full string
 * - `speed` ms per character
 * - `start` delay before typing begins
 * - calls `onDone` once typing completes
 * - renders a cursor while active (optional)
 */
export function Typewriter({
  text,
  speed = 22,
  start = 0,
  cursor = false,
  onDone,
  className,
  as: Tag = 'span',
}: {
  text: string
  speed?: number
  start?: number
  cursor?: boolean
  onDone?: () => void
  className?: string
  as?: keyof React.JSX.IntrinsicElements
}) {
  const [count, setCount] = useState(0)
  /* Hold onDone in a ref so callers can pass inline arrow functions without
   * causing the typing effect to restart on every render. */
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    setCount(0)
    let timer: ReturnType<typeof setTimeout> | undefined
    let i = 0

    timer = setTimeout(() => {
      const step = () => {
        i += 1
        setCount(i)
        if (i < text.length) {
          timer = setTimeout(step, speed)
        } else {
          onDoneRef.current?.()
        }
      }
      step()
    }, start)

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [text, speed, start])

  const visible = text.slice(0, count)
  const done = count >= text.length

  return (
    <Tag className={className}>
      {visible}
      {cursor && !done && (
        <span className="ml-0.5 inline-block h-[0.85em] w-[1.5px] translate-y-[2px] animate-pulse bg-current align-middle" />
      )}
    </Tag>
  )
}
