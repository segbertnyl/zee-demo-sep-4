import type { Preview } from '@storybook/react'
import '../src/styles/globals.css'
import { withMotionControls } from './MotionDecorator'

const preview: Preview = {
  globalTypes: {
    motionPlayback: {
      name: 'Motion',
      description: 'Play or pause all animations globally',
      defaultValue: 'playing',
      toolbar: {
        icon: 'play',
        items: [
          { value: 'playing', title: 'Motion playing', icon: 'play' },
          { value: 'paused',  title: 'Motion paused',  icon: 'stop' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
  decorators: [withMotionControls],
  parameters: {
    options: {
      storySort: {
        method: 'alphabetical',
      },
    },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    backgrounds: {
      default: 'canvas',
      values: [
        { name: 'canvas',  value: '#ffffff' },
        { name: 'surface', value: '#faf9f8' },
        { name: 'dark',    value: '#000a62' },
      ],
    },
  },
}

export default preview
