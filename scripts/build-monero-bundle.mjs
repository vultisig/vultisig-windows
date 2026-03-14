import { build } from 'esbuild'
import { copyFileSync, readFileSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const shimDir = resolve(__dirname, 'monero-shims')
const desktopOutDir = resolve(root, 'clients/desktop/public/libs/monero-ts')
const extensionOutDir = resolve(root, 'clients/extension/public/libs/monero-ts')

const nodeShim = resolve(shimDir, 'node-shim.js')
const httpShim = resolve(shimDir, 'http-shim.js')
const pathShim = resolve(shimDir, 'path-shim.js')
const processShim = resolve(shimDir, 'process-shim.js')
const browserMainCheck =
  'typeof window !== "undefined" && typeof globalThis !== "undefined" && globalThis === window'
const jsDomCheck =
  'typeof window.navigator !== "undefined" && typeof window.navigator.userAgent === "string" && window.navigator.userAgent.includes("jsdom")'
const workerGlobalCheck = 'globalThis'

await build({
  entryPoints: [resolve(root, 'node_modules/monero-ts/dist/index.js')],
  bundle: true,
  format: 'iife',
  globalName: '__moneroTsBundle',
  platform: 'browser',
  outfile: resolve(desktopOutDir, 'index.js'),
  inject: [processShim],
  alias: {
    http: httpShim,
    https: httpShim,
    path: pathShim,
    fs: nodeShim,
    crypto: nodeShim,
    child_process: nodeShim,
    net: nodeShim,
    tls: nodeShim,
    os: nodeShim,
    worker_threads: nodeShim,
    zlib: nodeShim,
    http2: nodeShim,
    tty: nodeShim,
    url: nodeShim,
  },
  logLevel: 'info',
})

const bundlePath = resolve(desktopOutDir, 'index.js')
const rawBundle = readFileSync(bundlePath, 'utf8')
const patchedBundle = rawBundle
  .replace(
    'new Function("try {return this===window;}catch(e){return false;}")()',
    browserMainCheck
  )
  .replace(
    `new Function("try {return window.navigator.userAgent.includes('jsdom');}catch(e){return false;}")()`,
    jsDomCheck
  )

if (patchedBundle === rawBundle) {
  throw new Error('Failed to patch monero-ts bundle for extension CSP')
}

writeFileSync(
  bundlePath,
  `${patchedBundle}\n;globalThis.__moneroTsBundle = __moneroTsBundle;\n`
)

const workerSrc = resolve(root, 'node_modules/monero-ts/dist/monero.worker.js')
const workerDst = resolve(desktopOutDir, 'monero.worker.js')
const rawWorkerCode = readFileSync(workerSrc, 'utf8').replace(
  /\/\/# sourceMappingURL=.*/g,
  ''
)
const patchedWorkerCode = rawWorkerCode
  .replace('new Function("return this")()', workerGlobalCheck)
  .replace(
    'new Function("try {return this===window;}catch(e){return false;}")()',
    browserMainCheck
  )
  .replace(
    `new Function("try {return window.navigator.userAgent.includes('jsdom');}catch(e){return false;}")()`,
    jsDomCheck
  )

if (patchedWorkerCode.includes('new Function(')) {
  throw new Error('Failed to patch monero-ts worker bundle for extension CSP')
}

writeFileSync(workerDst, patchedWorkerCode)

copyFileSync(resolve(desktopOutDir, 'index.js'), resolve(extensionOutDir, 'index.js'))
copyFileSync(workerDst, resolve(extensionOutDir, 'monero.worker.js'))

console.log('monero-ts IIFE bundle + worker copied successfully')
