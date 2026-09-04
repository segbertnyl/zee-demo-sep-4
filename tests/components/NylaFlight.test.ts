import { test, expect } from '@playwright/test'
import { gotoStory, expectMounted } from '../helpers/storybook'

/* NOTE: the Playwright context runs with reducedMotion: 'reduce', so these
 * tests exercise NylaFlight's prefers-reduced-motion contract — the flight is
 * skipped and the stage hard-cuts to the settled (landed) state. That also
 * keeps the visual snapshot deterministic (PointSphere paints one static,
 * fully resolved frame). */

const FLIGHT_ID = 'ui-nylaflight--flight'
const GATHER_ID = 'ui-nylaflight--gather-in-place'
const LANDED_ID = 'ui-nylaflight--landed-static'

test.describe('NylaFlight', () => {
  // Section 1 — Mount smoke
  test('smoke — mounts without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await expectMounted(page, FLIGHT_ID)
    expect(errors, `Console errors: ${errors.join('; ')}`).toHaveLength(0)
  })

  // Reduced-motion contract — flight skipped, hard cut to the settled intro
  test('reduced motion — hard-cuts to the landed state with copy revealed', async ({ page }) => {
    const root = await gotoStory(page, FLIGHT_ID)
    const landed = root.locator('[data-testid="nyla-flight-landed"]')
    await landed.waitFor({ state: 'visible', timeout: 8_000 })
    await expect(root.getByText("Hi, Sarah. I'm Nyla.")).toBeVisible()
  })

  test('gather-in-place mode lands too', async ({ page }) => {
    const root = await gotoStory(page, GATHER_ID)
    const landed = root.locator('[data-testid="nyla-flight-landed"]')
    await landed.waitFor({ state: 'visible', timeout: 8_000 })
  })

  test('replay re-runs the sequence and lands again', async ({ page }) => {
    const root = await gotoStory(page, FLIGHT_ID)
    const landed = root.locator('[data-testid="nyla-flight-landed"]')
    await landed.waitFor({ state: 'visible', timeout: 8_000 })
    await root.locator('[data-testid="replay"]').click()
    await landed.waitFor({ state: 'visible', timeout: 8_000 })
  })

  // Section 3 — Visual snapshot (deterministic: frozen orb, static background)
  test('visual snapshot', async ({ page }) => {
    const root = await gotoStory(page, LANDED_ID)
    await root.locator('[data-testid="nyla-flight-landed"]').waitFor({ state: 'visible', timeout: 8_000 })
    await expect(page).toHaveScreenshot('nyla-flight--landed-static.png', {
      animations: 'disabled',
      threshold: 0.02,
    })
  })
})

/* Full-motion path — the rest of the suite runs under reducedMotion: 'reduce',
 * which makes NylaFlight skip its RAF loop entirely. This describe opts back
 * into real motion so the travel-mode flight (scatter envelope, bézier drift,
 * cascade + landing callbacks) actually executes. Timing-tolerant on purpose:
 * generous waits, no exact-ms assertions. */
test.describe('NylaFlight — full motion', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } })

  test('real flight travels, cascades, and lands', async ({ page }) => {
    const root = await gotoStory(page, FLIGHT_ID)
    // The story auto-plays on mount — the flight layer mounts in travel mode.
    const orb = page.locator('[data-testid="nyla-flight-orb"][data-flight-mode="travel"]')
    await orb.waitFor({ state: 'attached', timeout: 8_000 })
    // The RAF loop runs to completion: the orb hands off and unmounts…
    await orb.waitFor({ state: 'detached', timeout: 10_000 })
    // …the landed orb takes over, and the cascade revealed the copy.
    await root.locator('[data-testid="nyla-flight-landed"]').waitFor({ state: 'visible', timeout: 8_000 })
    await expect(root.getByText("Hi, Sarah. I'm Nyla.")).toBeVisible()
  })
})
