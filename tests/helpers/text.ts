import type { Locator } from '@playwright/test'
import { expect } from '@playwright/test'

/** Assert words are space-separated — catches inline-block whitespace collapsing. */
export async function assertTextSpacing(locator: Locator, expectedText: string) {
  const raw = await locator.textContent()
  const normalized = (raw ?? '').replace(/\s+/g, ' ').trim()
  expect(normalized).toBe(expectedText)
}

export async function assertContainsWords(locator: Locator, words: string[]) {
  const raw = (await locator.textContent()) ?? ''
  for (const word of words) {
    const re = new RegExp(`(?:^|\\s)${word}(?:\\s|$)`)
    expect(re.test(raw), `Expected "${word}" to be space-separated in "${raw}"`).toBe(true)
  }
}
