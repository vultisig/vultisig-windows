import { existsSync } from 'fs'
import path from 'path'
import type { Plugin } from 'vite'

function toPosix(p: string): string {
  return p.split(path.sep).join('/')
}

function findSdkDistLibDir(startDir: string): string {
  let dir = startDir
  for (let i = 0; i < 32; i++) {
    const lib = path.join(
      dir,
      'node_modules',
      '@vultisig',
      'sdk',
      'dist',
      'lib'
    )
    if (existsSync(path.join(lib, 'dkls', 'vs_wasm_bg.wasm'))) {
      return lib
    }
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  throw new Error(
    `fixSdkPrebundleWasmUrlsPlugin: could not find @vultisig/sdk/dist/lib walking up from ${startDir}`
  )
}

/**
 * `@vultisig/sdk` is pre-bundled into `node_modules/.vite/deps/@vultisig_sdk.js`.
 * The inlined DKLS + ML-DSA glue both default to `new URL("vs_wasm_bg.wasm", import.meta.url)`,
 * which would resolve to the same (usually missing) path under `.vite/deps/` → HTML → MPC init
 * fails. Rewrite those URLs to paths relative to the pre-bundle file so they reach the real
 * files under `node_modules/@vultisig/sdk/dist/lib/{dkls,mldsa,schnorr}/`.
 */
export function fixSdkPrebundleWasmUrlsPlugin(): Plugin {
  return {
    name: 'vultisig-fix-sdk-prebundle-wasm-urls',
    transform(code, id) {
      const cleanId = id.split('?')[0].split('#')[0]
      const viteDepsMarker = `${path.sep}node_modules${path.sep}.vite${path.sep}deps${path.sep}`
      if (!cleanId.includes(viteDepsMarker)) {
        return null
      }
      if (
        !cleanId.endsWith(`${path.sep}@vultisig_sdk.js`) &&
        !cleanId.endsWith('/@vultisig_sdk.js')
      ) {
        return null
      }

      const depsDir = path.dirname(cleanId)
      const libRoot = findSdkDistLibDir(depsDir)
      const dklsWasm = path.join(libRoot, 'dkls', 'vs_wasm_bg.wasm')
      const mldsaWasm = path.join(libRoot, 'mldsa', 'vs_wasm_bg.wasm')
      const schnorrWasm = path.join(
        libRoot,
        'schnorr',
        'vs_schnorr_wasm_bg.wasm'
      )
      const dklsRel = toPosix(path.relative(depsDir, dklsWasm))
      const mldsaRel = toPosix(path.relative(depsDir, mldsaWasm))
      const schnorrRel = toPosix(path.relative(depsDir, schnorrWasm))

      let vsWasmBgCount = 0
      let next = code.replace(
        /new URL\("vs_wasm_bg\.wasm", import\.meta\.url\)/g,
        () => {
          vsWasmBgCount += 1
          if (vsWasmBgCount === 1) {
            return `new URL("${dklsRel}", import.meta.url)`
          }
          return `new URL("${mldsaRel}", import.meta.url)`
        }
      )

      next = next.replace(
        /new URL\("vs_schnorr_wasm_bg\.wasm", import\.meta\.url\)/g,
        () => `new URL("${schnorrRel}", import.meta.url)`
      )

      if (next === code) {
        return null
      }
      return { code: next, map: null }
    },
  }
}
