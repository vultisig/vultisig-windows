import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import tsconfigPaths from 'vite-tsconfig-paths'

import { getFeatureFlagDefines } from '../../../core/ui/vite/featureFlagDefines'
import { getCommonPlugins } from '../../../core/ui/vite/plugins'
import { getStaticCopyTargets } from '../../../core/ui/vite/staticCopy'

const rootDir = path.resolve(import.meta.dirname, '../../..')

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, '')

  return {
    root: import.meta.dirname,
    define: {
      ...getFeatureFlagDefines(env),
      __APP_VERSION__: JSON.stringify('qa'),
      __APP_BUILD__: JSON.stringify('qa'),
      __AGENT_BACKEND_URL__: JSON.stringify(
        env.AGENT_BACKEND_URL || 'https://agent.vultisig.com'
      ),
      __VULTISIG_VERIFIER_URL__: JSON.stringify(
        env.VULTISIG_VERIFIER_URL || 'https://verifier.vultisig.com'
      ),
      __VULTISIG_STATION_KYBER_SOURCE__: JSON.stringify(''),
      __FAST_VAULT_URL__: JSON.stringify(''),
      __RELAY_URL__: JSON.stringify(''),
    },
    plugins: [
      tsconfigPaths({ root: rootDir }),
      ...getCommonPlugins(),
      viteStaticCopy({
        targets: getStaticCopyTargets(),
      }),
    ],
    server: {
      host: '127.0.0.1',
      port: 5177,
      strictPort: true,
    },
  }
})
