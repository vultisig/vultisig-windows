import { existsSync } from 'fs'
import { dirname, resolve } from 'path'
import type { Plugin } from 'vite'

const sdkPrefix = 'node_modules/@vultisig/'

function getNodeModulesDir(filePath: string): string | null {
  const idx = filePath.lastIndexOf(sdkPrefix)
  if (idx === -1) return null
  return filePath.substring(0, idx + 'node_modules'.length)
}

function tryIndexFallback(dir: string, base: string): string | null {
  const flat = resolve(dir, base + '.js')
  if (existsSync(flat)) return flat

  const index = resolve(dir, base, 'index.js')
  if (existsSync(index)) return index

  return null
}

function resolveVultisigSubpath(nmDir: string, source: string): string | null {
  const match = source.match(/^(@vultisig\/[^/]+)\/(.+)$/)
  if (!match) return null

  const [, pkg, subpath] = match
  const pkgDist = resolve(nmDir, pkg, 'dist')
  return tryIndexFallback(pkgDist, subpath)
}

function findNodeModulesWithSdk(startDir: string): string | null {
  let dir = startDir
  const root = resolve('/')
  while (dir !== root) {
    const candidate = resolve(dir, 'node_modules')
    if (existsSync(resolve(candidate, '@vultisig'))) return candidate
    dir = dirname(dir)
  }
  return null
}

/**
 * Esbuild plugin injected into `optimizeDeps.esbuildOptions.plugins` so that
 * Vite's dependency scan and pre-bundling can resolve the same broken SDK
 * imports that the Vite resolveId hook fixes at request time.
 */
function sdkResolveEsbuildPlugin() {
  return {
    name: 'vultisig-sdk-resolve-esbuild',
    setup(build: {
      onResolve: (
        opts: { filter: RegExp },
        cb: (args: {
          path: string
          importer: string
          resolveDir: string
        }) => { path: string } | null | undefined
      ) => void
    }) {
      let cachedNmDir: string | null | undefined

      function getNmDir(hint: string): string | null {
        if (cachedNmDir !== undefined) return cachedNmDir
        cachedNmDir = findNodeModulesWithSdk(hint || process.cwd())
        return cachedNmDir
      }

      build.onResolve(
        { filter: /^@vultisig\// },
        (args: { path: string; resolveDir: string }) => {
          const nmDir = getNmDir(args.resolveDir)
          if (!nmDir) return null
          const result = resolveVultisigSubpath(nmDir, args.path)
          if (result) return { path: result }
          return null
        }
      )

      build.onResolve(
        { filter: /\.js$/ },
        (args: { path: string; importer: string; resolveDir: string }) => {
          if (!args.importer?.includes(sdkPrefix)) return null

          const dir = args.resolveDir || dirname(args.importer)
          const base = args.path.replace(/\.js$/, '')
          const result = tryIndexFallback(dir, base)
          if (result) return { path: result }
          return null
        }
      )
    },
  }
}

/**
 * Works around SDK packages whose build emits directory-based modules
 * (e.g. `dist/assert/shouldBePresent/index.js`) but whose exports map
 * and internal imports reference the flat `.js` path instead.
 *
 * Provides both a Vite resolveId hook (for dev-time request resolution)
 * and an esbuild plugin (for dependency pre-bundling/scan).
 */
export function sdkResolvePlugin(): Plugin {
  return {
    name: 'vultisig-sdk-resolve',
    enforce: 'pre',
    config() {
      return {
        optimizeDeps: {
          esbuildOptions: {
            plugins: [sdkResolveEsbuildPlugin()],
          },
        },
      }
    },
    resolveId: {
      order: 'pre',
      async handler(source, importer, options) {
        if (importer?.includes(sdkPrefix)) {
          if (source.endsWith('.js')) {
            const resolved = await this.resolve(source, importer, {
              ...options,
              skipSelf: true,
            })
            if (resolved) return resolved

            const indexPath = source.replace(/\.js$/, '/index.js')
            return this.resolve(indexPath, importer, {
              ...options,
              skipSelf: true,
            })
          }

          if (/^@vultisig\//.test(source)) {
            const nmDir = getNodeModulesDir(importer)
            if (nmDir) {
              const result = resolveVultisigSubpath(nmDir, source)
              if (result) return result
            }
          }
        }

        return null
      },
    },
  }
}
