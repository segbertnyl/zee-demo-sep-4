import { Nyla } from '@/ui/Nyla'

/* Page subnav — the floating bottom pill (Figma 1102-101651 / 1004-15085): a
 * horizon/section switcher plus the Nyla sparkle launcher. Presentational; the
 * caller owns the active value + positioning. See "UI / PageSubnav 🆕". */

export function PageSubnav({
  active,
  options,
  onSelect,
  onAskNyla,
}: {
  active: string
  options: string[]
  onSelect: (value: string) => void
  onAskNyla: () => void
}) {
  return (
    <div className="pointer-events-auto inline-flex items-center gap-4 rounded-full border border-[var(--nyl-gray-warm)] bg-white py-1 pl-8 pr-6 shadow-[0_0_30px_rgba(0,0,0,0.1)]">
      <div className="flex items-center gap-4">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onSelect(o)}
            className={[
              'px-2 py-1.5 text-[16px] tracking-[0.2px] transition-colors',
              active === o
                ? 'font-medium text-[var(--text-headline)]'
                : 'font-normal text-[var(--text-headline)] opacity-60 hover:text-[var(--nyl-blue-500)] hover:opacity-100',
            ].join(' ')}
          >
            {o}
          </button>
        ))}
      </div>
      <span className="h-6 w-px bg-[var(--nyl-gray-100)]" />
      <button
        type="button"
        onClick={onAskNyla}
        aria-label="Ask Nyla"
        className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-[var(--nyl-purple-050)]"
      >
        <Nyla size={40} variant="on-light" />
      </button>
    </div>
  )
}
