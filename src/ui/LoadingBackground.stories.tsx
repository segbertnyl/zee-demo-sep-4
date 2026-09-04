import type { Meta } from '@storybook/react'
import { LoadingBackground } from './LoadingBackground'

export default {
  title: 'UI / Backgrounds / Loading',
  component: LoadingBackground,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { disable: true },
    docs: {
      description: {
        component: 'Background for the plan reveal / loading screen (Figma node 1006-11996).',
      },
    },
  },
} satisfies Meta<typeof LoadingBackground>

export const Default = {
  name: 'Default',
  render: () => <LoadingBackground style={{ width: '100vw', height: '100vh' }} />,
}
