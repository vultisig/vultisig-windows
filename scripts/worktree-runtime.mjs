import { execFileSync } from 'child_process'
import { realpathSync } from 'fs'
import path from 'path'

export const parsePort = (value, name, fallback) => {
  if (!value) return fallback

  if (!/^\d+$/.test(value)) {
    throw new Error(`${name} must be an integer between 1 and 65535`)
  }

  const port = Number(value)
  if (!Number.isSafeInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} must be an integer between 1 and 65535`)
  }

  return port
}

const gitPath = (cwd, args) =>
  execFileSync('git', ['-C', cwd, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim()

export const isLinkedWorktree = (cwd, readGitPath = gitPath) => {
  try {
    const gitDir = path.resolve(
      readGitPath(cwd, ['rev-parse', '--absolute-git-dir'])
    )
    const commonDir = path.resolve(
      readGitPath(cwd, [
        'rev-parse',
        '--path-format=absolute',
        '--git-common-dir',
      ])
    )
    return gitDir !== commonDir
  } catch {
    return false
  }
}

const hashPath = value => {
  let hash = 2166136261
  for (const character of value) {
    hash ^= character.codePointAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const worktreePort = (cwd, start) =>
  start + (hashPath(realpathSync(cwd)) % 8000)

export const resolveDesktopRuntime = ({
  cwd,
  env = process.env,
  linkedWorktree = isLinkedWorktree(cwd),
}) => {
  const appPort = parsePort(
    env.APP_PORT,
    'APP_PORT',
    linkedWorktree ? worktreePort(cwd, 20000) : 5173
  )
  const wailsPort = parsePort(
    env.WAILS_DEV_PORT,
    'WAILS_DEV_PORT',
    linkedWorktree ? worktreePort(cwd, 30000) : 34115
  )
  const mediatorPort = parsePort(
    env.VULTISIG_MEDIATOR_PORT,
    'VULTISIG_MEDIATOR_PORT',
    linkedWorktree ? worktreePort(cwd, 48000) : 18080
  )
  const dbPath =
    env.VULTISIG_DB_PATH ||
    (linkedWorktree
      ? path.join(realpathSync(cwd), '.codex/runtime/vultisig.db')
      : undefined)

  return { appPort, dbPath, linkedWorktree, mediatorPort, wailsPort }
}
