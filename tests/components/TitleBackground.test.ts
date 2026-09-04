import { test, expect } from '@playwright/test'
import { gotoStory, expectMounted } from '../helpers/storybook'

const STORY_ID = 'ui-backgrounds-title--default'

test.describe('TitleBackground', () => {
  // Section 1 — Mount smoke
  test('smoke — mounts without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await expectMounted(page, STORY_ID)
    expect(errors, `Console errors: ${errors.join('; ')}`).toHaveLength(0)
  })

  // Section 2 — Visual snapshot
  test('visual snapshot', async ({ page }) => {
    const root = await gotoStory(page, STORY_ID)
    await root.locator('*').first().waitFor({ state: 'attached', timeout: 8_000 })
    await expect(page).toHaveScreenshot('title-background--default.png')
  })
})
