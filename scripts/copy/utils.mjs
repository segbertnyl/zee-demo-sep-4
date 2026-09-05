// scripts/copy/utils.mjs
import { HEADERS, FIGMA_BASE, FIGMA_FRAMES } from './registry.mjs'

export function csvCell(v) {
  if (v == null) return ''
  const s = String(v).replace(/\r?\n/g, ' ').trim()
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function csvRow(row) {
  return HEADERS.map((h) => csvCell(row[h] ?? '')).join(',')
}

export function figmaLink(step) {
  const nodeId = FIGMA_FRAMES[step]
  return nodeId ? `${FIGMA_BASE}${nodeId}` : ''
}

export const SEG_STEP_MAP = {
  intro: { section: 'Introduction', screen: 'Meet Nyla', frame: '524-2023' },
  growthAreas: { section: 'Business', screen: 'Growth Areas', frame: '524-5692' },
  analystMorning: { section: 'Clients', screen: 'Client Signals', frame: '524-6368' },
  analystSignals: { section: 'Clients', screen: 'Client Signals', frame: '524-6368' },
  strategistDirections: { section: 'Goals', screen: 'Practice Direction', frame: '524-3208' },
  conciergeSlows: { section: 'Business', screen: 'Time Drains', frame: '524-5907' },
  conciergeTimeSuggestions: { section: 'Business', screen: 'Biggest Time Drain', frame: '524-6122' },
  conciergeEliminatePrompt: { section: 'Business', screen: 'Biggest Time Drain', frame: '524-6122' },
  brandChannels: { section: 'Clients', screen: 'Staying Connected', frame: '524-6621' },
  brandLifeEventInstincts: { section: 'Clients', screen: 'Life Event Response', frame: '524-6873' },
  chiefOsStyleOptions: { section: 'Plan', screen: 'Your Plan', frame: '524-9889' },
}

export function buildRow({
  scene,
  section,
  screen,
  segment = '',
  copyType,
  content,
  key = '',
  variables = '',
  condition = '',
  file = '',
  line = '',
  storage = '',
  figmaLink: figmaLinkVal = '',
  notes = '',
  status = 'draft',
}) {
  if (!content || !String(content).trim()) return null
  return {
    Scene: scene,
    Section: section,
    Screen: screen,
    Segment: segment,
    'Copy Type': copyType,
    Content: content,
    Status: status,
    Notes: notes,
    'Figma Link': figmaLinkVal,
    Key: key,
    Variables: variables,
    Condition: condition,
    File: file,
    Line: String(line || ''),
    Storage: storage,
  }
}
