import { test, expect } from '@playwright/test'
import { gotoStory, expectMounted } from '../helpers/storybook'

const DEFAULT_STORY = 'ui-councilcreditschart--default'

test.describe('CouncilCreditsChart', () => {
  test('smoke — mounts without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await expectMounted(page, DEFAULT_STORY)
    expect(errors, `Console errors: ${errors.join('; ')}`).toHaveLength(0)
  })

  test('SVG element renders', async ({ page }) => {
    const root = await gotoStory(page, DEFAULT_STORY)
    const svg = root.locator('svg')
    await svg.waitFor({ state: 'visible', timeout: 8_000 })
    expect(await svg.count()).toBeGreaterThan(0)
  })

  test('visual snapshot', async ({ page }) => {
    const root = await gotoStory(page, DEFAULT_STORY)
    await root.locator('*').first().waitFor({ state: 'attached', timeout: 8_000 })
    await expect(page).toHaveScreenshot('council-credits-chart--default.png')
  })
})
