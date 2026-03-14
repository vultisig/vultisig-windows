import { readFileSync } from 'fs'
import { runInNewContext } from 'vm'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const bundlePath = resolve(root, 'clients/desktop/public/libs/monero-ts/index.js')
const workerPath = resolve(root, 'clients/desktop/public/libs/monero-ts/monero.worker.js')

const ctx = Object.create(globalThis)
Object.defineProperty(ctx, 'window', { value: ctx, configurable: true })
Object.defineProperty(ctx, 'self', { value: ctx, configurable: true })
Object.defineProperty(ctx, 'navigator', {
  value: { userAgent: 'Mozilla/5.0 Safari' },
  configurable: true,
})
ctx.document = { currentScript: null }
ctx.location = { href: 'http://localhost' }
ctx.Worker = class Worker { constructor() {} }
ctx.XMLHttpRequest = class XMLHttpRequest {}
ctx.WebSocket = class WebSocket { constructor() {} }
ctx.__dirname = '/'
ctx.__filename = 'index.js'

console.log('Loading IIFE bundle...')
const code = readFileSync(bundlePath, 'utf-8')
if (code.includes('new Function(')) {
  console.error('FAIL: bundle still contains CSP-blocked new Function() usage')
  process.exit(1)
}
const workerCode = readFileSync(workerPath, 'utf-8')
if (workerCode.includes('new Function(')) {
  console.error('FAIL: worker bundle still contains CSP-blocked new Function() usage')
  process.exit(1)
}
runInNewContext(code, ctx)

const mod = ctx.__moneroTsBundle
if (mod === undefined || mod === null) {
  console.error('FAIL: __moneroTsBundle is', mod)
  process.exit(1)
}

if (ctx.window.__moneroTsBundle !== mod) {
  console.error('FAIL: bundle was not assigned to window/globalThis')
  process.exit(1)
}

const bundle = mod.default || mod
const keys = Object.keys(bundle)
console.log('Export count:', keys.length)
console.log('First 15:', keys.slice(0, 15))
console.log('createWalletFull:', typeof bundle.createWalletFull)
console.log('LibraryUtils:', typeof bundle.LibraryUtils)
console.log('MoneroNetworkType:', typeof bundle.MoneroNetworkType)
console.log('MoneroWalletListener:', typeof bundle.MoneroWalletListener)

const required = ['createWalletFull', 'LibraryUtils', 'MoneroNetworkType', 'MoneroWalletListener']
const missing = required.filter(n => typeof bundle[n] === 'undefined')
if (missing.length > 0) {
  console.error('MISSING:', missing)
  process.exit(1)
}

console.log('TEST PASSED')
