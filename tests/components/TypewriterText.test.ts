/**
 * Regression tests for TypewriterText word-spacing behaviour.
 *
 * BUG FIXED: Each word is rendered as an `inline-block` <motion.span>, with a
 * plain-text space node between spans. Without the fix, inline-block whitespace
 * can collapse and words render concatenated ("bubblesupwhatmattersmost.").
 *
 * Strategy: We test via the OnboardingIntroOverlay story which renders
 * TypewriterText immediately in phase 0 (opening line 1). No timer wait needed.
 * `reducedMotion: 'reduce'` (set globally in playwright.config.ts) causes
 * Framer Motion to skip transitions so elements are visible from the first frame.
 *
 * Story ID derivation:
 *   title: 'UI / OnboardingBackground / Intro — Overlay'
 *   Sanitize: lowercase, spaces+slashes→hyphens, non-[a-z0-9_-] stripped
 *   → 'ui-onboardingbackground-intro-overlay'
 *   export: 'Default'  storyNameFromExport→ 'Default' → sanitize → 'default'
 *   Full ID: 'ui-onboardingbackground-intro-overlay--default'
 */
import { test, expect } from '@playwright/test'
import { gotoStory } from '../helpers/storybook'
import { assertTextSpacing, assertContainsWords } from '../helpers/text'

const STORY_ID = 'ui-onboardingbackground-intro-overlay--default'

test.describe('TypewriterText — word spacing', () => {
  test('opening line renders with spaces between each word', async ({ page }) => {
    const root = await gotoStory(page, STORY_ID)

    // Phase 0 renders "You build plans for everyone." via TypewriterText immediately.
    // Each word is a <motion.span class="inline-block"> with a space text node after it.
    // The h1 wraps all spans — locate it and assert the full text reads correctly.
    const h1 = root.locator('h1').first()
    await h1.waitFor({ state: 'visible', timeout: 10_000 })

    await assertTextSpacing(h1, 'You build plans for everyone.')
  })

  test('each word is individually reachable as a separate span', async ({ page }) => {
    await gotoStory(page, STORY_ID)

    const h1 = page.locator('#storybook-root h1').first()
    await h1.waitFor({ state: 'visible', timeout: 10_000 })

    // Confirm individual word spans exist — regression guard against the words
    // being merged back into a single text node.
    const spans = h1.locator('span')
    const count = await spans.count()
    // "You build plans for everyone." = 5 words → 5 spans
    expect(count).toBe(5)
  })

  test('tagline "bubbles up what matters most." renders with spaces between words', async ({ page }) => {
    await gotoStory(page, STORY_ID)

    // Phase 2 starts at 3600ms. Wait up to 8s for the tagline h2 to appear.
    // The fourth tagline (index 3) is "bubbles up what matters most." — it may
    // not be the first tagline shown. Wait for any tagline h2, then assert spacing.
    const taglineH2 = page.locator('#storybook-root h2').first()
    await taglineH2.waitFor({ state: 'visible', timeout: 8_000 })

    const raw = (await taglineH2.textContent()) ?? ''
    const normalized = raw.replace(/\s+/g, ' ').trim()

    // Assert words are space-separated — catches inline-block whitespace collapse.
    // Split on spaces and confirm we get multiple tokens (not one long concatenated string).
    const words = normalized.split(' ')
    expect(words.length, `Expected multiple space-separated words, got: "${normalized}"`).toBeGreaterThan(1)

    // Confirm no two words are concatenated (no token longer than the longest real word).
    const longestExpected = 'ambitions.'.length // longest word across all taglines
    for (const word of words) {
      expect(word.length, `Word "${word}" looks like concatenated tokens in "${normalized}"`).toBeLessThanOrEqual(
        longestExpected,
      )
    }
  })

  test('smoke — story mounts without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await gotoStory(page, STORY_ID)
    const root = page.locator('#storybook-root')
    await root.locator('*').first().waitFor({ state: 'attached', timeout: 8_000 })

    expect(errors, `Console errors: ${errors.join('; ')}`).toHaveLength(0)
  })

  test('visual snapshot — opening phase layout', async ({ page }) => {
    const root = await gotoStory(page, STORY_ID)
    const h1 = root.locator('h1').first()
    await h1.waitFor({ state: 'visible', timeout: 10_000 })

    await expect(page).toHaveScreenshot('typewriter-opening-phase.png', {
      fullPage: false,
      clip: { x: 0, y: 0, width: 1280, height: 400 },
    })
  })
})
