import { test, expect } from '@playwright/test'
import { gotoStory, expectMounted } from '../helpers/storybook'

const STORY_ID = 'ui-textarea--with-tags'

test.describe('Textarea', () => {
  // Section 1 — Mount smoke
  test('smoke — mounts without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await expectMounted(page, STORY_ID)
    expect(errors, `Console errors: ${errors.join('; ')}`).toHaveLength(0)
  })

  // Section 2 — Textarea renders
  test('textarea element renders', async ({ page }) => {
    const root = await gotoStory(page, STORY_ID)
    const textarea = root.locator('textarea')
    await textarea.waitFor({ state: 'visible', timeout: 8_000 })
    await expect(textarea).toBeVisible()
  })

  // Section 3 — Visual snapshot
  test('visual snapshot', async ({ page }) => {
    const root = await gotoStory(page, STORY_ID)
    await root.locator('*').first().waitFor({ state: 'attached', timeout: 8_000 })
    await expect(page).toHaveScreenshot('textarea--with-tags.png')
  })
})
