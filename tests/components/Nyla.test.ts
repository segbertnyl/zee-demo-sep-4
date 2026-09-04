import { test, expect } from '@playwright/test'
import { gotoStory, expectMounted } from '../helpers/storybook'

test.describe('Nyla', () => {
  test('dark-fill mounts without errors', async ({ page }) => {
    await expectMounted(page, 'ui-nyla--dark-fill')
  })

  test('dark-fill svg has correct accessibility attributes', async ({ page }) => {
    const root = await gotoStory(page, 'ui-nyla--dark-fill')
    const svg = root.locator('svg[aria-label="Nyla"]')
    await expect(svg).toBeVisible()
    await expect(svg).toHaveAttribute('role', 'img')
  })

  test('AllVariants — visual snapshot', async ({ page }) => {
    const root = await gotoStory(page, 'ui-nyla--all-variants')
    await expect(root).toHaveScreenshot('nyla-all-variants.png', {
      animations: 'disabled',
      threshold: 0.02,
    })
  })
})
