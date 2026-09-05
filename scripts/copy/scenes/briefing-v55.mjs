// scripts/copy/scenes/briefing-v55.mjs
import { SECTION_NAMES, SCREEN_NAMES } from '../registry.mjs'
import { buildRow, figmaLink } from '../utils.mjs'

const SCENE = 'BriefingV55'
const FILE = 'src/scenes/BriefingV55Scene.tsx'

function ob(step, key, copyType, content, opts = {}) {
  return buildRow({
    scene: SCENE,
    section: SECTION_NAMES[step] ?? SCENE,
    screen: SCREEN_NAMES[step] ?? step,
    copyType,
    content,
    key,
    file: FILE,
    figmaLink: figmaLink(step),
    ...opts,
  })
}

export function rows() {
  const out = []

  ;[
    { id: 'plan', label: 'My plan' },
    { id: 'day', label: 'Day' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'year', label: 'Year' },
  ].forEach((h) => {
    out.push(ob('nav', `briefing.horizons.${h.id}`, 'label', h.label, { storage: 'constant' }))
  })

  ;[
    ['briefing.hero.day.eyebrow', 'hero', 'eyebrow', "Today's top priorities"],
    ['briefing.hero.day.headline', 'hero', 'headline', 'A couple of quick actions that will set you up for the week.'],
    ['briefing.hero.plan.eyebrow', 'hero', 'eyebrow', 'Your 2026 trajectory'],
    [
      'briefing.hero.plan.headline',
      'hero',
      'headline',
      "You're hitting your Executive Council pace — let's make sure it holds.",
    ],
    ['briefing.featured.eyebrow', 'featured-card', 'eyebrow', 'Needs attention before 10AM'],
    ['briefing.featured.cta', 'featured-card', 'cta', 'Draft a message'],
  ].forEach(([key, step, type, content]) => {
    out.push(ob(step, key, type, content, { storage: 'constant' }))
  })

  return out.filter(Boolean)
}
