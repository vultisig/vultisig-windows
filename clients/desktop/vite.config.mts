import { defineConfig } from 'vite'
import circleDependency from 'vite-plugin-circular-dependency'
import { viteStaticCopy } from 'vite-plugin-static-copy'

import { getCommonPlugins } from '../../core/ui/vite/plugins'
import { getStaticCopyTargets } from '../../core/ui/vite/staticCopy'
import * as buildInfo from './build.json'

export default defineConfig(async () => {
  return {
    define: {
      __APP_VERSION__: JSON.stringify(buildInfo.version),
      __APP_BUILD__: JSON.stringify(buildInfo.build),
    },
    plugins: [
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
    resolve: {
      alias: {},
    },
  }
})
