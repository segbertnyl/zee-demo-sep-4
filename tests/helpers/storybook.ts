import type { Page } from '@playwright/test'

/**
 * Build a story URL. storyId format: 'ui-badgepill--urgent'
 * Derived from Meta.title + story export name:
 *   title: 'UI / BadgePill', export const Urgent → 'ui-badgepill--urgent'
 *   title and export name both lowercased, spaces→hyphens, ' / '→'-'
 *   export camelCase→kebab: PrimaryDefault→primary-default
 */
export function storyUrl(storyId: string): string {
  return `http://localhost:6006/iframe.html?id=${storyId}&viewMode=story`
}

export async function gotoStory(page: Page, storyId: string) {
  await page.goto(storyUrl(storyId))
  const root = page.locator('#storybook-root')
  await root.waitFor({ state: 'visible', timeout: 10_000 })
  return root
}

export async function expectMounted(page: Page, storyId: string) {
  const root = await gotoStory(page, storyId)
  await root.locator('*').first().waitFor({ state: 'attached', timeout: 8_000 })
  return root
}
