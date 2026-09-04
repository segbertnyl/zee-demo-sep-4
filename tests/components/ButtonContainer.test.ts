import { test, expect } from '@playwright/test'
import { gotoStory, expectMounted } from '../helpers/storybook'
import { assertTextSpacing } from '../helpers/text'

const DEFAULT_STORY = 'ui-buttoncontainer--default'
const PRIMARY_ONLY_STORY = 'ui-buttoncontainer--primary-only'
const ALL_VARIANTS_STORY = 'ui-buttoncontainer--all-variants'

test.describe('ButtonContainer', () => {
  test('smoke — mounts without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await expectMounted(page, DEFAULT_STORY)
    expect(errors, `Console errors: ${errors.join('; ')}`).toHaveLength(0)
  })

  test('"Skip" and "Next" render with correct text', async ({ page }) => {
    const root = await gotoStory(page, DEFAULT_STORY)
    const buttons = root.locator('button')
    await buttons.first().waitFor({ state: 'visible', timeout: 8_000 })

    const skipBtn = root.locator('button', { hasText: 'Skip' })
    const nextBtn = root.locator('button', { hasText: 'Next' })

    await assertTextSpacing(skipBtn, 'Skip')
    await assertTextSpacing(nextBtn, 'Next')
  })

  test('PrimaryOnly story has exactly 1 button', async ({ page }) => {
    const root = await gotoStory(page, PRIMARY_ONLY_STORY)
    const buttons = root.locator('button')
    await buttons.first().waitFor({ state: 'visible', timeout: 8_000 })
    expect(await buttons.count()).toBe(1)
  })

  test('visual snapshot — AllVariants', async ({ page }) => {
    const root = await gotoStory(page, ALL_VARIANTS_STORY)
    await root.locator('*').first().waitFor({ state: 'attached', timeout: 8_000 })
    await expect(page).toHaveScreenshot('button-container--all-variants.png')
  })
})
