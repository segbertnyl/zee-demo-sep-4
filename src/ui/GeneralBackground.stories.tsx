import type { Meta } from '@storybook/react'
import { GeneralBackground } from './GeneralBackground'

export default {
  title: 'UI / Backgrounds / General',
  component: GeneralBackground,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { disable: true },
    docs: {
      description: {
        component: 'General-purpose light background (Figma node 1006-11989).',
      },
    },
  },
} satisfies Meta<typeof GeneralBackground>

export const Default = {
  name: 'Default',
  render: () => <GeneralBackground style={{ width: '100vw', height: '100vh' }} />,
}
