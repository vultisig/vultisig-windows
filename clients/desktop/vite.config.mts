import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, loadEnv } from 'vite'
import circleDependency from 'vite-plugin-circular-dependency'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import topLevelAwait from 'vite-plugin-top-level-await'
import wasm from 'vite-plugin-wasm'

import { getCommonPlugins } from '../../core/ui/vite/plugins'
import { getStaticCopyTargets } from '../../core/ui/vite/staticCopy'
import * as buildInfo from './build.json'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, rootDir, '')
  return {
    define: {
      __APP_VERSION__: JSON.stringify(buildInfo.version),
      __APP_BUILD__: JSON.stringify(buildInfo.build),
      __AGENT_BACKEND_URL__: JSON.stringify(
        env.AGENT_BACKEND_URL || 'https://agent.vultisig.com'
      ),
      __VULTISIG_VERIFIER_URL__: JSON.stringify(
        env.VULTISIG_VERIFIER_URL || 'https://verifier.vultisig.com'
      ),
      __RELAY_URL__: JSON.stringify(env.RELAY_URL || ''),
      __FAST_VAULT_URL__: JSON.stringify(env.FAST_VAULT_URL || ''),
    },
    plugins: [
      wasm(),
      topLevelAwait(),
      ...getCommonPlugins(),
      viteStaticCopy({
        targets: getStaticCopyTargets(),
      }),
      circleDependency({
        exclude: /node_modules/,
        circleImportThrowErr: false,
        formatOutModulePath(path) {
          const str = 'Circular dependency detected:'
          return str + path
        },
      }),
    ],
    server: {
      port: 5173,
      strictPort: true,
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    },
    publicDir: 'public',
    worker: {
      plugins: () => [wasm(), topLevelAwait()],
    },
    optimizeDeps: {
      exclude: ['fromt-wasm', 'frozt-wasm'],
    },
    resolve: {
      dedupe: ['fromt-wasm', 'frozt-wasm'],
      alias: {},
    },
  }
})
