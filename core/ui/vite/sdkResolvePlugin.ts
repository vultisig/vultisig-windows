/**
 * Vite/esbuild resolution for `@vultisig/*` packages: directory `dist/.../index.js`
 * vs flat `.js` specifiers, and broken **internal** relative imports (e.g.
 * `@vultisig/lib-utils` `record/union/getRecordUnionValue.js` → `../getRecordKeys.js`
 * where the implementation lives under `getRecordKeys/index.js`).
 */
import { existsSync } from 'fs'
import { dirname, resolve } from 'path'
import type { Plugin } from 'vite'

const sdkPrefixFwd = 'node_modules/@vultisig/'
const sdkPrefixWin = 'node_modules\\@vultisig\\'

/** Check whether a file path is inside an `@vultisig/` SDK package. */
function isInsideSdk(filePath: string): boolean {
  return filePath.includes(sdkPrefixFwd) || filePath.includes(sdkPrefixWin)
}

function getNodeModulesDir(filePath: string): string | null {
  let idx = filePath.lastIndexOf(sdkPrefixFwd)
  if (idx === -1) idx = filePath.lastIndexOf(sdkPrefixWin)
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
          if (!args.importer || !isInsideSdk(args.importer)) return null

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
          // vite-plugin-wasm requires WASM-loading packages to be excluded from
          // dep optimization. When pre-bundled, `new URL('*.wasm', import.meta.url)`
          // resolves relative to the .vite/deps/ chunk, not the original package
          // directory, so the WASM fetch returns HTML instead of a binary.
          exclude: [
            // Do **not** add `@vultisig/sdk` here — dev black screen / huge unoptimized graph.
            // Pre-bundled `@vultisig_sdk.js` WASM URLs are rewritten by
            // `fixSdkPrebundleWasmUrlsPlugin` in `core/ui/vite/plugins.ts`.
            '@vultisig/lib-dkls',
            '@vultisig/lib-schnorr',
            '@vultisig/lib-mldsa',
            // MPC engine singleton lives in @vultisig/mpc-types. If Vite pre-bundles
            // these, @vultisig/core-mpc ends up with its own inlined copy of mpc-types
            // while the SDK platform entry writes to a different copy, and
            // getMpcEngine() throws "MPC engine not configured" at runtime.
            // @vultisig/mpc-wasm must stay out of `.vite/deps/` so `import.meta.url`
            // for `.wasm` resolves next to the real package (otherwise fetch returns HTML).
            '@vultisig/mpc-types',
            '@vultisig/mpc-wasm',
            '@vultisig/core-mpc',
          ],
          esbuildOptions: {
            plugins: [sdkResolveEsbuildPlugin()],
          },
        },
      }
    },
    resolveId: {
      order: 'pre',
      async handler(source, importer, options) {
        if (importer && isInsideSdk(importer)) {
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
