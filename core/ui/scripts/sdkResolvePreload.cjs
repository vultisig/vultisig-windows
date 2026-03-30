/**
 * CJS preload script that patches Module._resolveFilename to handle
 * SDK packages whose build emits directory-based modules (e.g.
 * `dist/foo/index.js`) but whose internal imports reference the flat
 * `.js` path (`./foo.js`), and whose exports map resolves to
 * non-existent flat files.
 *
 * Usage: node -r ./scripts/sdkResolvePreload.cjs ...
 */
const Module = require('node:module')
const { existsSync } = require('node:fs')
const { dirname, resolve } = require('node:path')

const SDK_TOKEN = 'node_modules/@vultisig/'

function findNodeModulesWithSdk(startDir) {
  let dir = startDir
  const root = resolve('/')
  while (dir !== root) {
    const candidate = resolve(dir, 'node_modules')
    if (existsSync(resolve(candidate, '@vultisig'))) return candidate
    dir = dirname(dir)
  }
  return null
}

function tryIndexFallback(dir, base) {
  const flat = resolve(dir, base + '.js')
  if (existsSync(flat)) return flat
  const index = resolve(dir, base, 'index.js')
  if (existsSync(index)) return index
  return null
}

let cachedNmDir

const origResolve = Module._resolveFilename
Module._resolveFilename = function patchedResolve(request, parent, ...rest) {
  if (
    parent &&
    parent.filename &&
    parent.filename.includes(SDK_TOKEN) &&
    request.endsWith('.js') &&
    request.startsWith('.')
  ) {
    const parentDir = dirname(parent.filename)
    const base = request.replace(/\.js$/, '')
    const indexPath = resolve(parentDir, base, 'index.js')
    if (!existsSync(resolve(parentDir, request)) && existsSync(indexPath)) {
      return origResolve.call(this, indexPath, parent, ...rest)
    }
  }

  try {
    return origResolve.call(this, request, parent, ...rest)
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') throw err

    const match = request.match(/^(@vultisig\/[^/]+)\/(.+)$/)
    if (match) {
      if (!cachedNmDir) cachedNmDir = findNodeModulesWithSdk(process.cwd())
      if (cachedNmDir) {
        const [, pkg, subpath] = match
        const pkgDist = resolve(cachedNmDir, pkg, 'dist')
        const result = tryIndexFallback(pkgDist, subpath)
        if (result) return result
      }
    }

    throw err
  }
}
