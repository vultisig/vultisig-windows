import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, loadEnv } from 'vite'
import circleDependency from 'vite-plugin-circular-dependency'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import tsconfigPaths from 'vite-tsconfig-paths'

import { getFeatureFlagDefines } from '../../core/ui/vite/featureFlagDefines'
import { getCommonPlugins } from '../../core/ui/vite/plugins'
import { sdkResolvePlugin } from '../../core/ui/vite/sdkResolvePlugin'
import { getStaticCopyTargets } from '../../core/ui/vite/staticCopy'
import * as buildInfo from './build.json'

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
)

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, rootDir, '')
  return {
    // Crawl the desktop navigation barrel during the *first* dep-optimization pass so
    // `@vultisig/*` deep imports are known before the dev server serves modules. Without
    // this, the first navigation discovers hundreds of new specifiers, invalidates the
    // metadata hash, and Vite forces a full reload — Wails' proxy then drops in-flight
    // fetches and the UI never stabilizes.
    optimizeDeps: {
      entries: ['index.html', 'src/navigation/views.tsx'],
    },
    define: {
      ...getFeatureFlagDefines(env),
      __APP_VERSION__: JSON.stringify(buildInfo.version),
      __APP_BUILD__: JSON.stringify(buildInfo.build),
      __AGENT_BACKEND_URL__: JSON.stringify(
        env.AGENT_BACKEND_URL || 'https://agent.vultisig.com'
      ),
      __VULTISIG_VERIFIER_URL__: JSON.stringify(
        env.VULTISIG_VERIFIER_URL || 'https://verifier.vultisig.com'
      ),
      __FAST_VAULT_URL__: JSON.stringify(env.FAST_VAULT_URL || ''),
      __RELAY_URL__: JSON.stringify(env.RELAY_URL || ''),
    },
    plugins: [
      sdkResolvePlugin(),
      tsconfigPaths({ root: rootDir }),
      ...getCommonPlugins(),
      viteStaticCopy({
        targets: getStaticCopyTargets(),
      }),
      circleDependency({
        exclude: /node_modules/,
        // Fail the build so import cycles (e.g. settings ↔ backup) cannot slip back in.
        circleImportThrowErr: true,
        formatOutModulePath(path) {
          const str = 'Circular dependency detected:'
          return str + path
        },
      }),
    ],
    server: {
      port: 5173,
      strictPort: true,
      // Pre-transform the full desktop navigation graph up front. Otherwise Vite can
      // discover hundreds of `@vultisig/*` deep imports on first navigation, run a new
      // `optimizeDeps` pass, emit `optimized dependencies changed. reloading`, and abort
      // every in-flight module fetch — Wails' dev proxy then floods `request has been stopped`
      // and the webview never recovers (looks like the app "doesn't run").
      warmup: {
        clientFiles: [
          './index.html',
          './src/main.tsx',
          './src/App.tsx',
          './src/navigation/views.tsx',
        ],
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    },
    publicDir: 'public',
    resolve: {
      alias: {},
    },
  }
})
