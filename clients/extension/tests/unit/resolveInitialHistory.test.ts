import { describe, expect, it } from 'vitest'

import { AppView } from '@clients/extension/src/navigation/AppView'
import { resolveInitialHistory } from '@clients/extension/src/navigation/resolveInitialHistory'

const vaultView: AppView = { id: 'vault' }
const setupVaultView: AppView = { id: 'setupVault', state: {} }
const settingsView: AppView = { id: 'settings' }

describe('resolveInitialHistory', () => {
  describe('with no vaults', () => {
    it('ignores persisted history and opens on the initial core view', () => {
      // Regression for #4514: abandoning setup mid-flow persisted
      // [vault, setupVault], which skipped the splash on the next open
      expect(
        resolveInitialHistory({
          initialView: null,
          persistedHistory: [vaultView, setupVaultView],
          hasVaults: false,
        })
      ).toEqual([vaultView])
    })

    it('ignores a stored non-onboarding initial view', () => {
      expect(
        resolveInitialHistory({
          initialView: settingsView,
          persistedHistory: null,
          hasVaults: false,
        })
      ).toEqual([vaultView])
    })

    it('honors an onboarding initial view so expanded-tab setup still works', () => {
      expect(
        resolveInitialHistory({
          initialView: setupVaultView,
          persistedHistory: null,
          hasVaults: false,
        })
      ).toEqual([vaultView, setupVaultView])
    })

    it('honors an import-vault initial view', () => {
      const importVaultView: AppView = { id: 'importVault' }

      expect(
        resolveInitialHistory({
          initialView: importVaultView,
          persistedHistory: null,
          hasVaults: false,
        })
      ).toEqual([vaultView, importVaultView])
    })

    it('opens on the initial core view when nothing is stored', () => {
      expect(
        resolveInitialHistory({
          initialView: null,
          persistedHistory: null,
          hasVaults: false,
        })
      ).toEqual([vaultView])
    })
  })

  describe('with vaults', () => {
    it('prefers the stored initial view over persisted history', () => {
      expect(
        resolveInitialHistory({
          initialView: settingsView,
          persistedHistory: [vaultView, setupVaultView],
          hasVaults: true,
        })
      ).toEqual([vaultView, settingsView])
    })

    it('does not duplicate the initial core view', () => {
      expect(
        resolveInitialHistory({
          initialView: vaultView,
          persistedHistory: null,
          hasVaults: true,
        })
      ).toEqual([vaultView])
    })

    it('restores persisted history', () => {
      expect(
        resolveInitialHistory({
          initialView: null,
          persistedHistory: [vaultView, setupVaultView],
          hasVaults: true,
        })
      ).toEqual([vaultView, setupVaultView])
    })

    it('falls back to the initial core view for empty persisted history', () => {
      expect(
        resolveInitialHistory({
          initialView: null,
          persistedHistory: [],
          hasVaults: true,
        })
      ).toEqual([vaultView])
    })
  })
})
