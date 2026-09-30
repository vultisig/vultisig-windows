import { describe, expect, it } from 'vitest'

import { AppView } from '@clients/extension/src/navigation/AppView'
import { resolveInitialHistory } from '@clients/extension/src/navigation/resolveInitialHistory'

const vaultView: AppView = { id: 'vault' }
const setupVaultView: AppView = { id: 'setupVault', state: {} }
const settingsView: AppView = { id: 'settings' }
const importVaultView: AppView = { id: 'importVault' }

describe('resolveInitialHistory', () => {
  describe('with no vaults', () => {
    it('ignores the persisted view and opens on the initial core view', () => {
      // Regression for #4514: abandoning setup mid-flow persisted
      // setupVault, which skipped the splash on the next open
      expect(
        resolveInitialHistory({
          initialView: null,
          persistedView: setupVaultView,
          hasVaults: false,
        })
      ).toEqual([vaultView])
    })

    it('ignores a stored non-onboarding initial view', () => {
      expect(
        resolveInitialHistory({
          initialView: settingsView,
          persistedView: null,
          hasVaults: false,
        })
      ).toEqual([vaultView])
    })

    it('honors an onboarding initial view so expanded-tab setup still works', () => {
      expect(
        resolveInitialHistory({
          initialView: setupVaultView,
          persistedView: null,
          hasVaults: false,
        })
      ).toEqual([vaultView, setupVaultView])
    })

    it('honors an import-vault initial view', () => {
      const importVaultView: AppView = { id: 'importVault' }

      expect(
        resolveInitialHistory({
          initialView: importVaultView,
          persistedView: null,
          hasVaults: false,
        })
      ).toEqual([vaultView, importVaultView])
    })

    it('opens on the initial core view when nothing is stored', () => {
      expect(
        resolveInitialHistory({
          initialView: null,
          persistedView: null,
          hasVaults: false,
        })
      ).toEqual([vaultView])
    })
  })

  describe('with vaults', () => {
    it('prefers the stored initial view over the persisted view', () => {
      expect(
        resolveInitialHistory({
          initialView: settingsView,
          persistedView: setupVaultView,
          hasVaults: true,
        })
      ).toEqual([vaultView, settingsView])
    })

    it('does not duplicate the initial core view', () => {
      expect(
        resolveInitialHistory({
          initialView: vaultView,
          persistedView: null,
          hasVaults: true,
        })
      ).toEqual([vaultView])
    })

    it.each([importVaultView, setupVaultView])(
      'ignores a previously persisted $id',
      persistedView => {
        expect(
          resolveInitialHistory({
            initialView: null,
            persistedView,
            hasVaults: true,
          })
        ).toEqual([vaultView])
      }
    )

    it.each([importVaultView, setupVaultView])(
      'honors an explicit $id tab launch over a persisted view',
      initialView => {
        expect(
          resolveInitialHistory({
            initialView,
            persistedView: settingsView,
            hasVaults: true,
          })
        ).toEqual([vaultView, initialView])
      }
    )

    it('restores an unrelated persisted view on top of the initial core view', () => {
      expect(
        resolveInitialHistory({
          initialView: null,
          persistedView: settingsView,
          hasVaults: true,
        })
      ).toEqual([vaultView, settingsView])
    })

    it('does not duplicate a persisted initial core view', () => {
      expect(
        resolveInitialHistory({
          initialView: null,
          persistedView: vaultView,
          hasVaults: true,
        })
      ).toEqual([vaultView])
    })
  })
})
