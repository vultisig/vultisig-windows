import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  assertDesktopRuntimePortsAvailable,
  isLinkedWorktree,
  parsePort,
  resolveDesktopRepositoryRoot,
  resolveDesktopRuntime,
} from './worktreeRuntime.mjs'

describe('worktree runtime isolation', () => {
  it('resolves the worktree root when launched through the desktop workspace', () => {
    const root = resolveDesktopRepositoryRoot(
      new URL('./dev-desktop.mjs', import.meta.url)
    )
    expect(root).toBe(path.resolve(import.meta.dirname, '../../..'))
    expect(existsSync(path.join(root, 'wails.json'))).toBe(true)
  })

  it('validates explicit ports', () => {
    expect(parsePort(undefined, 'PORT', 5173)).toBe(5173)
    expect(parsePort('25217', 'PORT', 5173)).toBe(25217)
    expect(() => parsePort('0', 'PORT', 5173)).toThrow('between 1 and 65535')
    expect(() => parsePort('70000', 'PORT', 5173)).toThrow(
      'between 1 and 65535'
    )
  })

  it('distinguishes linked worktrees from primary checkouts', () => {
    const cwd = process.cwd()
    expect(
      isLinkedWorktree(cwd, (_cwd, args) =>
        args.includes('--absolute-git-dir')
          ? '/repo/.git/worktrees/feature'
          : '/repo/.git'
      )
    ).toBe(true)
    expect(isLinkedWorktree(cwd, () => '/repo/.git')).toBe(false)
  })

  it('preserves primary defaults and isolates linked worktree resources', () => {
    const cwd = mkdtempSync(path.join(tmpdir(), 'vultisig-runtime-'))
    try {
      expect(
        resolveDesktopRuntime({ cwd, env: {}, linkedWorktree: false })
      ).toEqual({
        appPort: 5173,
        dbPath: undefined,
        linkedWorktree: false,
        mediatorPort: 18080,
        wailsPort: 34115,
      })

      const worktree = resolveDesktopRuntime({
        cwd,
        env: {},
        linkedWorktree: true,
      })
      expect(worktree.appPort).toBeGreaterThanOrEqual(20000)
      expect(worktree.appPort).toBeLessThan(28000)
      expect(worktree.wailsPort).toBeGreaterThanOrEqual(30000)
      expect(worktree.wailsPort).toBeLessThan(38000)
      expect(worktree.mediatorPort).toBeGreaterThanOrEqual(48000)
      expect(worktree.mediatorPort).toBeLessThan(56000)
      expect(worktree.dbPath).toMatch(/\.codex\/runtime\/vultisig\.db$/)
      expect(
        new Set([worktree.appPort, worktree.wailsPort, worktree.mediatorPort])
          .size
      ).toBe(3)
    } finally {
      rmSync(cwd, { recursive: true, force: true })
    }
  })

  it('fails clearly when a deterministic linked-worktree port is occupied', async () => {
    const runtime = {
      appPort: 21000,
      linkedWorktree: true,
      mediatorPort: 49000,
      wailsPort: 31000,
    }

    await expect(
      assertDesktopRuntimePortsAvailable(
        runtime,
        async port => port !== runtime.wailsPort
      )
    ).rejects.toThrow(
      'WAILS_DEV_PORT=31000. Another linked worktree may share this deterministic port slot.'
    )
  })

  it('accepts a runtime when every derived port is available', async () => {
    await expect(
      assertDesktopRuntimePortsAvailable(
        {
          appPort: 21000,
          linkedWorktree: true,
          mediatorPort: 49000,
          wailsPort: 31000,
        },
        async () => true
      )
    ).resolves.toBeUndefined()
  })
})
