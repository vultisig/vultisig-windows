import { execFileSync } from 'child_process'
import { realpathSync } from 'fs'
import path from 'path'

const parsePort = (value, fallback) => {
  if (!value) return fallback
  if (!/^\d+$/.test(value)) {
    throw new Error(
      'VITE_EXTENSION_RELOAD_PORT must be an integer between 1 and 65535'
    )
  }

  const port = Number(value)
  if (!Number.isSafeInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      'VITE_EXTENSION_RELOAD_PORT must be an integer between 1 and 65535'
    )
  }
  return port
}

const isLinkedWorktree = cwd => {
  try {
    const readGitPath = args =>
      path.resolve(
        execFileSync('git', ['-C', cwd, ...args], {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'ignore'],
        }).trim()
      )
    return (
      readGitPath(['rev-parse', '--absolute-git-dir']) !==
      readGitPath(['rev-parse', '--path-format=absolute', '--git-common-dir'])
    )
  } catch {
    return false
  }
}

const worktreePort = cwd => {
  let hash = 2166136261
  for (const character of realpathSync(cwd)) {
    hash ^= character.codePointAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return 40000 + ((hash >>> 0) % 8000)
}

export const resolveExtensionReloadPort = ({
  cwd,
  env = process.env,
  linkedWorktree = isLinkedWorktree(cwd),
}) =>
  parsePort(
    env.VITE_EXTENSION_RELOAD_PORT,
    linkedWorktree ? worktreePort(cwd) : 18732
  )
