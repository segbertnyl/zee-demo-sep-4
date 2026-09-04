import { test, expect } from '@playwright/test'
import { gotoStory, expectMounted } from '../helpers/storybook'
import { assertTextSpacing } from '../helpers/text'

const PLAYGROUND_STORY = 'components-optiontile--playground'
const STATES_STORY = 'components-optiontile--states'
const ALL_VARIANTS_STORY = 'components-optiontile--all-variants'

test.describe('OptionTile', () => {
  // Section 1 — Mount smoke
  test('smoke — mounts without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await expectMounted(page, PLAYGROUND_STORY)
    expect(errors, `Console errors: ${errors.join('; ')}`).toHaveLength(0)
  })

  // Section 2 — Title text with correct word spacing
  test('title renders with correct word spacing', async ({ page }) => {
    const root = await gotoStory(page, PLAYGROUND_STORY)
    const tile = root.locator('button[aria-pressed]')
    await tile.waitFor({ state: 'visible', timeout: 8_000 })
    const titleEl = tile.locator('p').first()
    await assertTextSpacing(titleEl, 'Become a true holistic financial advisor')
  })

  // Section 3 — Selected tile has aria-pressed="true"
  test('selected tile has aria-pressed="true"', async ({ page }) => {
    const root = await gotoStory(page, STATES_STORY)
    // The second tile in the first size group is the selected one
    const tiles = root.locator('button[aria-pressed="true"]')
    await tiles.first().waitFor({ state: 'visible', timeout: 8_000 })
    expect(await tiles.count()).toBeGreaterThan(0)
  })

  // Section 4 — Visual snapshot for States story
  test('visual snapshot — States', async ({ page }) => {
    const root = await gotoStory(page, STATES_STORY)
    await root.locator('*').first().waitFor({ state: 'attached', timeout: 8_000 })
    await expect(page).toHaveScreenshot('option-tile--states.png')
  })
})
