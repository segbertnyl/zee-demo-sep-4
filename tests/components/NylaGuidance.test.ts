import { test, expect } from '@playwright/test'
import { gotoStory, expectMounted } from '../helpers/storybook'
import { assertContainsWords } from '../helpers/text'

const DEFAULT_STORY_ID = 'ui-nylaguidance--default'
const ALL_VARIANTS_STORY_ID = 'ui-nylaguidance--all-variants'

test.describe('NylaGuidance', () => {
  test('smoke — mounts without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await expectMounted(page, DEFAULT_STORY_ID)
    expect(errors, `Console errors: ${errors.join('; ')}`).toHaveLength(0)
  })

  test('text spacing — title renders with correct word spacing', async ({ page }) => {
    const root = await gotoStory(page, DEFAULT_STORY_ID)
    const title = root.locator('p').first()
    await title.waitFor({ state: 'visible', timeout: 8_000 })
    await assertContainsWords(title, ['Your', 'client', 'base', 'grew'])
  })

  test('visual snapshot — all variants', async ({ page }) => {
    const root = await gotoStory(page, ALL_VARIANTS_STORY_ID)
    await root.locator('*').first().waitFor({ state: 'attached', timeout: 8_000 })
    await expect(page).toHaveScreenshot('nyla-guidance--all-variants.png')
  })
})
