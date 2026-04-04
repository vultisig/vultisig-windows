import { createRequire } from 'module'
import { dirname, join } from 'path'
import { mergeConfig } from 'vite'

import { sdkResolvePlugin } from '../vite/sdkResolvePlugin.ts'

const require = createRequire(import.meta.url)

function getAbsolutePath(value: string) {
  return dirname(require.resolve(join(value, 'package.json')))
}

/**
 * Storybook dev uses esbuild for `optimizeDeps`; it must resolve the same broken
 * `@vultisig/*` internal paths as the desktop app (`sdkResolvePlugin`).
 * A Vite-only `resolveId` hook is not enough — pre-bundling would loop on errors.
 *
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
      plugins: [sdkResolvePlugin()],
    })
  },
}
export default config
