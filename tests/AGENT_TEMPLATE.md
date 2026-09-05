# Storybook Component Test — Agent Template

Follow this template when adding Playwright tests for a new Storybook component.

---

## 1. Story ID formula

Storybook derives the story ID from the `Meta.title` and the export name:

```
sanitize(title) + '--' + sanitize(storyNameFromExport(exportName))
```

**sanitize rules:**

- Lowercase everything
- Replace spaces and `/` with `-`
- Strip all characters not in `[a-z0-9_-]` (em-dashes, apostrophes, etc. are removed)
- Collapse consecutive hyphens to one

**storyNameFromExport:** inserts a space before each capital letter, then sanitizes.

**Examples:**

| `Meta.title`                                    | Export          | Story ID                                                |
| ----------------------------------------------- | --------------- | ------------------------------------------------------- |
| `'UI / BadgePill'`                              | `Urgent`        | `ui-badgepill--urgent`                                  |
| `'UI / OnboardingBackground / Intro — Overlay'` | `Default`       | `ui-onboardingbackground-intro-overlay--default`        |
| `'UI / OnboardingBackground / Intro — Overlay'` | `FullAnimation` | `ui-onboardingbackground-intro-overlay--full-animation` |
| `'UI / WelcomeSequence'`                        | `WithControls`  | `ui-welcomesequence--with-controls`                     |

---

## 2. Three-section test template

Create `tests/components/<ComponentName>.test.ts`:

```ts
import { test, expect } from '@playwright/test'
import { gotoStory, expectMounted } from '../helpers/storybook'
import { assertTextSpacing } from '../helpers/text'

const STORY_ID = 'ui-mycomponent--default' // ← derive using formula above

test.describe('<ComponentName>', () => {
  // Section 1 — Mount smoke
  test('smoke — mounts without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await expectMounted(page, STORY_ID)
    expect(errors, `Console errors: ${errors.join('; ')}`).toHaveLength(0)
  })

  // Section 2 — Text spacing (only needed for components using TypewriterText
  // or inline-block spans where whitespace collapse is a risk)
  test('text renders with spaces between words', async ({ page }) => {
    const root = await gotoStory(page, STORY_ID)
    const target = root.locator('[data-testid="my-text"]')
    await target.waitFor({ state: 'visible', timeout: 8_000 })
    await assertTextSpacing(target, 'Expected text here')
  })

  // Section 3 — Visual snapshot
  test('visual snapshot', async ({ page }) => {
    const root = await gotoStory(page, STORY_ID)
    await root.locator('*').first().waitFor({ state: 'attached', timeout: 8_000 })
    await expect(page).toHaveScreenshot('<component-name>--default.png')
  })
})
```

---

## 3. When to update snapshots

Run snapshot update after intentional visual changes:

```bash
npm run test:storybook:update-snapshots
```

**Update when:**

- A component's design intentionally changed (new spacing, color, layout)
- You added a new visual snapshot test for the first time (no baseline exists yet)
- A dependency upgrade changed rendering in an expected way

**Do not update when:**

- CI flags a snapshot diff you did not author — investigate the regression first
- The diff shows text concatenation or layout collapse — that is a bug, not a snapshot to accept
