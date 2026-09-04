import type { Meta, StoryObj } from '@storybook/react'
import { PaceChart } from './PaceChart'
import type { LegendItem, PacePoint } from './PaceChart'

const meta = {
  title: 'UI / PaceChart',
  component: PaceChart,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PaceChart>

export default meta
type Story = StoryObj<typeof meta>

const NYL_FISCAL_X_LABELS = [
  { x: 2, label: 'July', anchor: 'start' as const },
  { x: 4 * 71.5, label: 'Nov', anchor: 'middle' as const },
  { x: 8 * 71.5, label: 'Mar', anchor: 'middle' as const },
  { x: 856, label: 'Jun', anchor: 'end' as const },
]

const ON_TRACK_LEGEND: LegendItem[] = [
  { label: 'Actual · $52.4K', color: '#9b9997' },
  { label: 'Current pace', color: '#bc79ec' },
  { label: 'FYC goal · $42K', color: '#bc79ec', dotted: true },
  { label: 'Needed pace for EC · $37.6K gap', color: '#66a8ff' },
  { label: 'FYC goal · $90K', color: '#66a8ff', dotted: true },
]

export const OnTrack: Story = {
  args: {
    actualPoints: [
      { x: 0, value: 40 },
      { x: 71.5, value: 42.5 },
      { x: 143, value: 41 },
      { x: 214.5, value: 45.5 },
      { x: 286, value: 44 },
      { x: 357.5, value: 48.5 },
      { x: 395, value: 52.4 },
    ] satisfies PacePoint[],
    currentPacePoints: [
      { x: 395, value: 52.4 },
      { x: 500, value: 53 },
      { x: 620, value: 54.5 },
      { x: 740, value: 55 },
      { x: 858, value: 55.5 },
    ] satisfies PacePoint[],
    neededPacePoints: [
      { x: 395, value: 52.4 },
      { x: 470, value: 57 },
      { x: 540, value: 67 },
      { x: 640, value: 75 },
      { x: 740, value: 82 },
      { x: 858, value: 88 },
    ] satisfies PacePoint[],
    todayX: 395,
    todayLabel: 'Today, Dec 16',
    actualValueAtToday: 52.4,
    fycGoal: 47,
    
    legend: ON_TRACK_LEGEND,
    xAxisLabels: NYL_FISCAL_X_LABELS,
  },
}

export const BehindPace: Story = {
  args: {
    actualPoints: [
      { x: 0, value: 38 },
      { x: 71.5, value: 39 },
      { x: 143, value: 37 },
      { x: 214.5, value: 36 },
      { x: 286, value: 35 },
      { x: 357.5, value: 34 },
      { x: 395, value: 33 },
    ] satisfies PacePoint[],
    currentPacePoints: [
      { x: 395, value: 33 },
      { x: 500, value: 34 },
      { x: 620, value: 35 },
      { x: 740, value: 36 },
      { x: 858, value: 37 },
    ] satisfies PacePoint[],
    neededPacePoints: [
      { x: 395, value: 33 },
      { x: 470, value: 42 },
      { x: 540, value: 55 },
      { x: 640, value: 68 },
      { x: 740, value: 80 },
      { x: 858, value: 90 },
    ] satisfies PacePoint[],
    todayX: 395,
    todayLabel: 'Today, Dec 16',
    actualValueAtToday: 33,
    fycGoal: 47,
    
    legend: [
      { label: 'Actual · $33K', color: '#9b9997' },
      { label: 'Current pace', color: '#bc79ec' },
      { label: 'FYC goal · $42K', color: '#bc79ec', dotted: true },
      { label: 'Needed pace for EC · $57K gap', color: '#66a8ff' },
      { label: 'FYC goal · $90K', color: '#66a8ff', dotted: true },
    ],
    xAxisLabels: NYL_FISCAL_X_LABELS,
  },
}

export const JustStarted: Story = {
  args: {
    actualPoints: [
      { x: 0, value: 40 },
      { x: 71.5, value: 43 },
    ] satisfies PacePoint[],
    currentPacePoints: [
      { x: 71.5, value: 43 },
      { x: 214.5, value: 45 },
      { x: 395, value: 48 },
      { x: 620, value: 50 },
      { x: 858, value: 52 },
    ] satisfies PacePoint[],
    neededPacePoints: [
      { x: 71.5, value: 43 },
      { x: 214.5, value: 52 },
      { x: 395, value: 65 },
      { x: 620, value: 80 },
      { x: 858, value: 90 },
    ] satisfies PacePoint[],
    todayX: 71.5,
    todayLabel: 'Today, Aug 15',
    actualValueAtToday: 43,
    fycGoal: 47,
    
    legend: [
      { label: 'Actual · $43K', color: '#9b9997' },
      { label: 'Current pace', color: '#bc79ec' },
      { label: 'FYC goal · $42K', color: '#bc79ec', dotted: true },
      { label: 'Needed pace for EC · $47K gap', color: '#66a8ff' },
      { label: 'FYC goal · $90K', color: '#66a8ff', dotted: true },
    ],
    xAxisLabels: NYL_FISCAL_X_LABELS,
  },
}

export const YearComplete: Story = {
  args: {
    actualPoints: [
      { x: 0, value: 40 },
      { x: 71.5, value: 43 },
      { x: 143, value: 42 },
      { x: 214.5, value: 47 },
      { x: 286, value: 46 },
      { x: 357.5, value: 51 },
      { x: 429, value: 55 },
      { x: 500.5, value: 59 },
      { x: 572, value: 63 },
      { x: 643.5, value: 68 },
      { x: 715, value: 74 },
      { x: 786.5, value: 80 },
      { x: 858, value: 87 },
    ] satisfies PacePoint[],
    currentPacePoints: [],
    neededPacePoints: [],
    todayX: 858,
    todayLabel: 'Jun 30',
    actualValueAtToday: 87,
    fycGoal: 47,
    
    legend: [
      { label: 'Final · $87K', color: '#9b9997' },
      { label: 'FYC goal · $42K', color: '#bc79ec', dotted: true },
      { label: 'FYC goal · $90K', color: '#66a8ff', dotted: true },
    ],
    xAxisLabels: NYL_FISCAL_X_LABELS,
  },
}

export const Playground: Story = {
  args: {
    actualPoints: [
      { x: 0, value: 40 },
      { x: 71.5, value: 42.5 },
      { x: 143, value: 41 },
      { x: 214.5, value: 45.5 },
      { x: 286, value: 44 },
      { x: 357.5, value: 48.5 },
      { x: 395, value: 52.4 },
    ],
    currentPacePoints: [
      { x: 395, value: 52.4 },
      { x: 500, value: 53 },
      { x: 620, value: 54.5 },
      { x: 740, value: 55 },
      { x: 858, value: 55.5 },
    ],
    neededPacePoints: [
      { x: 395, value: 52.4 },
      { x: 470, value: 57 },
      { x: 540, value: 67 },
      { x: 640, value: 75 },
      { x: 740, value: 82 },
      { x: 858, value: 88 },
    ],
    todayX: 395,
    todayLabel: 'Today, Dec 16',
    actualValueAtToday: 52.4,
    fycGoal: 47,
    
    legend: ON_TRACK_LEGEND,
    width: 858,
    height: 196,
    yMin: 0,
    yMax: 100,
    yMinPx: 164,
    yMaxPx: 36,
    xAxisLabels: NYL_FISCAL_X_LABELS,
    gridlineCount: 13,
    gridlineSpacing: 71.5,
  },
}
