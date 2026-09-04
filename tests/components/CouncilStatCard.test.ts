import { test, expect } from '@playwright/test'
import { gotoStory, expectMounted } from '../helpers/storybook'
import { assertTextSpacing } from '../helpers/text'

const COMPLETE_STORY = 'ui-councilstatcard--complete'
const ALL_VARIANTS_STORY = 'ui-councilstatcard--all-variants'

test.describe('CouncilStatCard', () => {
  test('smoke — mounts without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await expectMounted(page, COMPLETE_STORY)
    expect(errors, `Console errors: ${errors.join('; ')}`).toHaveLength(0)
  })

  test('label renders with correct text spacing', async ({ page }) => {
    const root = await gotoStory(page, COMPLETE_STORY)
    const label = root.locator('span').filter({ hasText: 'Protection FYC' }).first()
    await label.waitFor({ state: 'visible', timeout: 8_000 })
    await assertTextSpacing(label, 'Protection FYC')
  })

  test('visual snapshot — AllVariants', async ({ page }) => {
    const root = await gotoStory(page, ALL_VARIANTS_STORY)
    await root.locator('*').first().waitFor({ state: 'attached', timeout: 8_000 })
    await expect(page).toHaveScreenshot('council-stat-card--all-variants.png')
  })
})
