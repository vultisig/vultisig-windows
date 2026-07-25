import { spawn } from 'child_process'

import {
  assertDesktopRuntimePortsAvailable,
  resolveDesktopRepositoryRoot,
  resolveDesktopRuntime,
} from './worktreeRuntime.mjs'

const cwd = resolveDesktopRepositoryRoot(import.meta.url)
const forwardedArgs = process.argv.slice(2)
const fullIndex = forwardedArgs.indexOf('--full')
const full = fullIndex >= 0
if (full) forwardedArgs.splice(fullIndex, 1)

const runtime = resolveDesktopRuntime({ cwd })
await assertDesktopRuntimePortsAvailable(runtime)
const wailsArgs = [
  'dev',
  ...(full ? [] : ['-s', '-skipbindings', '-m', '-nosyncgomod']),
  '-devserver',
  `127.0.0.1:${runtime.wailsPort}`,
  ...forwardedArgs,
]
const env = {
  ...process.env,
  APP_PORT: String(runtime.appPort),
  WAILS_DEV_PORT: String(runtime.wailsPort),
  VULTISIG_MEDIATOR_PORT: String(runtime.mediatorPort),
  ...(runtime.dbPath ? { VULTISIG_DB_PATH: runtime.dbPath } : {}),
}

console.log(
  `Desktop development runtime: Vite http://127.0.0.1:${runtime.appPort}/, ` +
    `Wails http://127.0.0.1:${runtime.wailsPort}/, ` +
    `mediator http://127.0.0.1:${runtime.mediatorPort}/` +
    (runtime.dbPath ? `, database ${runtime.dbPath}` : '')
)

const child = spawn('wails', wailsArgs, { cwd, env, stdio: 'inherit' })

child.on('error', error => {
  console.error(`Unable to start Wails: ${error.message}`)
  process.exitCode = 1
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal))
}

child.on('exit', (code, signal) => {
  if (signal) {
    process.exitCode = signal === 'SIGINT' ? 130 : 143
    return
  }
  process.exitCode = code ?? 1
})
