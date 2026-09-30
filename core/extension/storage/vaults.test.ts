import { beforeEach, describe, expect, it, vi } from 'vitest'

const store = vi.hoisted(() => ({
  vaults: [] as unknown[],
  failNextWrite: false,
}))

vi.mock('@lib/extension/storage/get', () => ({
  getStorageValue: async () => {
    const snapshot = structuredClone(store.vaults)
    await Promise.resolve()
    return snapshot
  },
}))

vi.mock('@lib/extension/storage/set', () => ({
  setStorageValue: async (_key: string, value: unknown[]) => {
    await Promise.resolve()
    if (store.failNextWrite) {
      store.failNextWrite = false
      throw new Error('write failed')
    }
    store.vaults = structuredClone(value)
  },
}))

vi.mock('./coins', () => ({
  deleteCoinsForVault: async () => {},
}))

vi.mock('@vultisig/core-mpc/vault/Vault', () => ({
  getVaultId: (vault: { id: string }) => vault.id,
}))

import { vaultsStorage } from './vaults'

type TestVault = { id: string; isBackedUp: boolean }

describe('extension vaultsStorage', () => {
  beforeEach(() => {
    store.vaults = ['a', 'b', 'c'].map(id => ({ id, isBackedUp: false }))
  })

  it('keeps every update when vaults are updated in parallel', async () => {
    await Promise.all(
      ['a', 'b', 'c'].map(vaultId =>
        vaultsStorage.updateVault({ vaultId, fields: { isBackedUp: true } })
      )
    )

    expect((store.vaults as TestVault[]).map(v => v.isBackedUp)).toEqual([
      true,
      true,
      true,
    ])
  })

  it('does not lose an update racing with a delete', async () => {
    await Promise.all([
      vaultsStorage.updateVault({ vaultId: 'a', fields: { isBackedUp: true } }),
      vaultsStorage.deleteVault('c'),
      vaultsStorage.updateVault({ vaultId: 'b', fields: { isBackedUp: true } }),
    ])

    expect(store.vaults).toEqual([
      { id: 'a', isBackedUp: true },
      { id: 'b', isBackedUp: true },
    ])
  })

  it('keeps serving updates after one of them fails', async () => {
    store.failNextWrite = true
    const failed = vaultsStorage.updateVault({
      vaultId: 'b',
      fields: { isBackedUp: true },
    })
    const succeeded = vaultsStorage.updateVault({
      vaultId: 'a',
      fields: { isBackedUp: true },
    })

    await expect(failed).rejects.toThrow('write failed')
    await expect(succeeded).resolves.toMatchObject({ id: 'a' })
  })
})
