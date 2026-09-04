// scripts/copy/scenes/discovery.mjs
import { FIGMA_BASE } from '../registry.mjs'
import { buildRow } from '../utils.mjs'

const FILE = 'src/scenes/OnboardingFlow.tsx'
const DISCOVERY_FIGMA = `https://www.figma.com/design/VCjqlGu9kQVy2i5nqDxKqa/Exploration-pt-II?node-id=`

function dAdd(section, screen, copyType, content, key, nodeId, vars) {
  return buildRow({
    scene: 'Discovery',
    section,
    screen,
    segment: '',
    copyType,
    content,
    variables: vars || '',
    notes: 'Net-new — not yet implemented in codebase',
    figmaLink: nodeId ? `${DISCOVERY_FIGMA}${nodeId}` : '',
    key,
    file: FILE,
    storage: 'inline',
  })
}

export function rows() {
  const out = []

  out.push(dAdd('Discovery', 'Nyla Introduction', 'headline', "Hi, Sarah. I'm Nyla. Let's build a plan for your practice, your way.",                                                                                       'discovery.intro.headline', '816-25664', 'advisorName'))
  out.push(dAdd('Discovery', 'Nyla Introduction', 'body',     "Every agent is different, and I want to hear what makes your style your own. As we go through this, keep in mind: the plan is always changeable. Let's get to know you.", 'discovery.intro.body', '816-25664'))

  out.push(dAdd('Discovery', 'Plan Reveal', 'loading',  'Great, sounds like', 'discovery.plan-reveal.prefix',   '922-3415'))
  out.push(dAdd('Discovery', 'Plan Reveal', 'headline', 'ALL ABOUT YOU',      'discovery.plan-reveal.headline', '922-3415'))

  ;[
    { id: '1a', label: '1.A Hello',   screen: 'Nyla Introduction', nodeId: '918-2943' },
    { id: '1b', label: '1.B History', screen: 'Advisor History',   nodeId: '918-2941' },
    { id: '1c', label: '1.C Goals',   screen: 'Goals Discovery',   nodeId: '918-2942' },
    { id: '1d', label: '1D Practice', screen: 'Practice Setup',    nodeId: '918-2945' },
  ].forEach(s => {
    out.push(dAdd('Discovery', s.screen, 'label', s.label, `discovery.sections.${s.id}.label`, s.nodeId))
  })

  return out.filter(Boolean)
}
