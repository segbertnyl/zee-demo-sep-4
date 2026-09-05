import { test, expect } from '@playwright/test'
import { gotoStory, expectMounted } from '../helpers/storybook'
import { assertTextSpacing } from '../helpers/text'

const SECONDARY_ID = 'ui-sectionheader--secondary'
const PRIMARY_ID = 'ui-sectionheader--primary'
const ALL_VARIANTS_ID = 'ui-sectionheader--all-variants'

test.describe('SectionHeader', () => {
  test('secondary — mounts without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await expectMounted(page, SECONDARY_ID)
    expect(errors, `Console errors: ${errors.join('; ')}`).toHaveLength(0)
  })

  test('primary — mounts without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await expectMounted(page, PRIMARY_ID)
    expect(errors, `Console errors: ${errors.join('; ')}`).toHaveLength(0)
  })

  test('secondary — heading text renders with correct spacing', async ({ page }) => {
    const root = await gotoStory(page, SECONDARY_ID)
    const heading = root.locator('h2').first()
    await heading.waitFor({ state: 'visible', timeout: 8_000 })
    await assertTextSpacing(heading, 'Where do you want your practice to head in the next two to three years?')
  })

  test('primary — heading text renders with correct spacing', async ({ page }) => {
    const root = await gotoStory(page, PRIMARY_ID)
    const heading = root.locator('h2').first()
    await heading.waitFor({ state: 'visible', timeout: 8_000 })
    await assertTextSpacing(heading, "You've got goals. Now let's build around how you actually work.")
  })

  test('AllVariants — visual snapshot', async ({ page }) => {
    const root = await gotoStory(page, ALL_VARIANTS_ID)
    await root.locator('*').first().waitFor({ state: 'attached', timeout: 8_000 })
    await expect(page).toHaveScreenshot('section-header--all-variants.png', {
      animations: 'disabled',
      threshold: 0.02,
    })
  })
})
