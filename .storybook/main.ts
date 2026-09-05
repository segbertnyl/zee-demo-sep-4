import type { StorybookConfig } from '@storybook/react-vite'
import path from 'node:path'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: { autodocs: 'tag' },
  staticDirs: ['../public'],
  viteFinal: async (config) => {
    const { default: tailwindcss } = await import('@tailwindcss/vite')
    const { nylaConfigSync } = await import('../scripts/nyla-config-sync.ts')
    config.plugins = [...(config.plugins ?? []), tailwindcss(), nylaConfigSync()]
    config.resolve ??= {}
    config.resolve.alias = {
      ...((config.resolve.alias as Record<string, string>) ?? {}),
      '@': path.resolve(__dirname, '../src'),
    }
    return config
  },
}

export default config
