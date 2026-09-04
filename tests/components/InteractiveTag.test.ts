import { test, expect } from '@playwright/test'
import { gotoStory, expectMounted } from '../helpers/storybook'
import { assertTextSpacing } from '../helpers/text'

const SELECTED_STORY = 'ui-interactivetag--selected'
const ALL_VARIANTS_STORY = 'ui-interactivetag--all-variants'

test.describe('InteractiveTag', () => {
  test('smoke — mounts without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await expectMounted(page, SELECTED_STORY)
    expect(errors, `Console errors: ${errors.join('; ')}`).toHaveLength(0)
  })

  test('text renders with spaces between words', async ({ page }) => {
    const root = await gotoStory(page, SELECTED_STORY)
    const tag = root.locator('button')
    await tag.waitFor({ state: 'visible', timeout: 8_000 })
    await assertTextSpacing(tag, 'Poor lead quality lately')
  })

  test('visual snapshot', async ({ page }) => {
    const root = await gotoStory(page, ALL_VARIANTS_STORY)
    await root.locator('*').first().waitFor({ state: 'attached', timeout: 8_000 })
    await expect(page).toHaveScreenshot('interactive-tag--all-variants.png')
  })
})
