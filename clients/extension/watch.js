import { spawn } from 'child_process'
import { rm } from 'fs/promises'
import { WebSocketServer } from 'ws'

import { resolveExtensionReloadPort } from './worktreeReloadPort.js'

const reloadPortEnvName = 'VITE_EXTENSION_RELOAD_PORT'
const reloadHost = '127.0.0.1'
const wsPort = resolveExtensionReloadPort({ cwd: process.cwd() })

const wss = await new Promise((resolve, reject) => {
  const server = new WebSocketServer({ host: reloadHost, port: wsPort })
  server.once('listening', () => resolve(server))
  server.once('error', reject)
}).catch(error => {
  console.error(
    `\x1b[31mUnable to start the extension reload server on port ${wsPort}: ${error.message}\x1b[0m`
  )
  process.exit(1)
})

let reloadTimeout
const scheduleReload = () => {
  clearTimeout(reloadTimeout)
  reloadTimeout = setTimeout(() => {
    for (const client of wss.clients) {
      if (client.readyState === 1) client.send('reload')
    }
  }, 300)
}

await rm('dist', { recursive: true, force: true })

const chunks = [
  { label: 'App', env: {} },
  { label: 'Background', env: { CHUNK: 'background' } },
  { label: 'Content', env: { CHUNK: 'content' } },
  { label: 'Inpage', env: { CHUNK: 'inpage' } },
]

const children = []

for (const { label, env } of chunks) {
  const nodeOptions = [process.env.NODE_OPTIONS, '--max-old-space-size=8192']
    .filter(Boolean)
    .join(' ')

  const proc = spawn('vite', ['build', '--watch'], {
    env: {
      ...process.env,
      ...env,
      VITE_DEV_RELOAD: 'true',
      [reloadPortEnvName]: String(wsPort),
      NODE_OPTIONS: nodeOptions,
    },
    stdio: 'pipe',
    shell: true,
  })

  children.push(proc)

  proc.stdout.on('data', data => {
    const text = data.toString()
    process.stdout.write(text)
    if (text.includes('built in')) {
      console.log(`\x1b[32m${label} ready\x1b[0m`)
      scheduleReload()
    }
  })

  proc.stderr.on('data', data => process.stderr.write(data))

  proc.on('exit', code => {
    if (code) console.error(`\x1b[31m${label} exited with code ${code}\x1b[0m`)
  })
}

const cleanup = () => {
  children.forEach(proc => proc.kill())
  wss.close()
  process.exit()
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)

console.log(
  `\x1b[36mWebSocket reload server on ws://${reloadHost}:${wsPort}\x1b[0m`
)
console.log('\x1b[36mWatching for changes...\x1b[0m')
