import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { resolveExtensionReloadPort } from '../../worktreeReloadPort.js'

describe('extension worktree reload port', () => {
  it('isolates linked worktrees and validates explicit ports', () => {
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
