import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { resolveExtensionReloadPort } from '@clients/extension/worktreeReloadPort.js'
import { describe, expect, it } from 'vitest'

import {
  isLinkedWorktree,
  parsePort,
  resolveDesktopRuntime,
} from './worktree-runtime.mjs'

describe('worktree runtime isolation', () => {
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

  it('isolates and validates the extension reload port', () => {
    const cwd = mkdtempSync(path.join(tmpdir(), 'vultisig-extension-runtime-'))
    try {
      expect(
        resolveExtensionReloadPort({
          cwd,
          env: {},
          linkedWorktree: false,
        })
      ).toBe(18732)
      const worktreePort = resolveExtensionReloadPort({
        cwd,
        env: {},
        linkedWorktree: true,
      })
      expect(worktreePort).toBeGreaterThanOrEqual(40000)
      expect(worktreePort).toBeLessThan(48000)
      expect(
        resolveExtensionReloadPort({
          cwd,
          env: { VITE_EXTENSION_RELOAD_PORT: '25219' },
          linkedWorktree: true,
        })
      ).toBe(25219)
      expect(() =>
        resolveExtensionReloadPort({
          cwd,
          env: { VITE_EXTENSION_RELOAD_PORT: '70000' },
        })
      ).toThrow('between 1 and 65535')
    } finally {
      rmSync(cwd, { recursive: true, force: true })
    }
  })
})
