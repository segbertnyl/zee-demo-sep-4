// scripts/copy/scenes/action-board.mjs
import { SECTION_NAMES, SCREEN_NAMES } from '../registry.mjs'
import { buildRow, figmaLink } from '../utils.mjs'

const SCENE = 'ActionBoard'
const FILE = 'src/scenes/ActionBoardScene.tsx'

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
    { id: 'mybook', label: 'My book' },
    { id: 'priorities', label: 'Priorities' },
    { id: 'crosssell', label: 'Cross-sell' },
    { id: 'retention', label: 'Retention' },
    { id: 'reactivation', label: 'Reactivation' },
    { id: 'referral', label: 'Referral' },
  ].forEach((t) => {
    out.push(ob('nav', `actionboard.tabs.${t.id}`, 'label', t.label, { storage: 'constant' }))
  })

  ;[
    [
      'actionboard.hero.crosssell.headline',
      'hero',
      'headline',
      'Protect, expand, and prepare:\nThree opportunities stand out today.',
    ],
    [
      'actionboard.opportunity.henderson.headline',
      'opportunity-card',
      'headline',
      'Janet Henderson has recently had a change of address to a high flood-risk coastal location.',
    ],
    [
      'actionboard.opportunity.garcia.headline',
      'opportunity-card',
      'headline',
      'Helena Garcia is approaching her retirement income planning window.',
    ],
  ].forEach(([key, step, type, content]) => {
    out.push(ob(step, key, type, content, { storage: 'constant' }))
  })

  return out.filter(Boolean)
}
