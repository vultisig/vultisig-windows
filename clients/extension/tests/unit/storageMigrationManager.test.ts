import { migrateExtensionStorage } from '@core/extension/storage/migrations/migrateExtensionStorage'
import { runStorageMigrations } from '@core/extension/storage/migrations/run'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { chromeMock } from './mocks/chrome'

vi.mock('@core/extension/storage/migrations/run', () => ({
  runStorageMigrations: vi.fn(),
}))

describe('migrateExtensionStorage', () => {
  beforeEach(() => {
    vi.mocked(runStorageMigrations).mockReset()
  })

  it('adopts versionless storage without deleting vaults', async () => {
    const vaults = [{ name: 'Existing vault', isBackedUp: false }]

    await chromeMock.storage.local.set({ vaults, preference: 'keep' })

    await migrateExtensionStorage('0.2.2')

    await expect(chromeMock.storage.local.get()).resolves.toEqual({
      vaults,
      preference: 'keep',
      latestInstalledVersion: '0.2.2',
    })
    expect(chromeMock.storage.local.clear).not.toHaveBeenCalled()
    expect(runStorageMigrations).toHaveBeenCalledOnce()
  })

  it('leaves versionless storage intact when migration fails', async () => {
    const vaults = [{ name: 'Existing vault', isBackedUp: false }]
    vi.mocked(runStorageMigrations).mockRejectedValueOnce(
      new Error('migration failed')
    )

    await chromeMock.storage.local.set({ vaults })

    await expect(migrateExtensionStorage('0.2.2')).rejects.toThrow(
      'migration failed'
    )
    await expect(chromeMock.storage.local.get()).resolves.toEqual({ vaults })
    expect(chromeMock.storage.local.clear).not.toHaveBeenCalled()
  })
})
