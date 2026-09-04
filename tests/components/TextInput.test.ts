import { test, expect } from '@playwright/test'
import { gotoStory, expectMounted } from '../helpers/storybook'
import { assertTextSpacing } from '../helpers/text'

const DEFAULT_STORY = 'ui-textinput--default'
const ALL_VARIANTS_STORY = 'ui-textinput--all-variants'

test.describe('TextInput', () => {
  test('smoke — mounts without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await expectMounted(page, DEFAULT_STORY)
    expect(errors, `Console errors: ${errors.join('; ')}`).toHaveLength(0)
  })

  test('text renders with spaces between words', async ({ page }) => {
    const root = await gotoStory(page, DEFAULT_STORY)
    const input = root.locator('input')
    await input.waitFor({ state: 'visible', timeout: 8_000 })
    await assertTextSpacing(input, '$ 47,000')
  })

  test('visual snapshot', async ({ page }) => {
    const root = await gotoStory(page, ALL_VARIANTS_STORY)
    await root.locator('*').first().waitFor({ state: 'attached', timeout: 8_000 })
    await expect(page).toHaveScreenshot('text-input--all-variants.png')
  })
})
