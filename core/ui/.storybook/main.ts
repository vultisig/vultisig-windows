import vultisigSdk from '@vultisig/sdk/vite'
import { createRequire } from 'module'
import { dirname, join } from 'path'
import { mergeConfig } from 'vite'

const require = createRequire(import.meta.url)

function getAbsolutePath(value: string) {
  return dirname(require.resolve(join(value, 'package.json')))
}

/**
 * @type { import('@storybook/react-vite').StorybookConfig }
 */
const config = {
  stories: ['../**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [getAbsolutePath('@storybook/addon-docs')],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },
  staticDirs: [{ from: '../public', to: '/core' }],
  async viteFinal(viteConfig) {
    return mergeConfig(viteConfig, {
      plugins: [vultisigSdk()],
    })
  },
}
export default config
