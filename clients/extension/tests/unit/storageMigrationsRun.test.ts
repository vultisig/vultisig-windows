import { runStorageMigrations } from '@core/extension/storage/migrations/run'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  changeFeeCoinKey: vi.fn(),
  removeDuplicateCoins: vi.fn(),
  getLatestMigration: vi.fn(),
  setLatestMigration: vi.fn(),
}))

vi.mock(
  '@core/extension/storage/migrations/entries/changeFeeCoinKey',
  () => ({ changeFeeCoinKey: mocks.changeFeeCoinKey })
)
vi.mock(
  '@core/extension/storage/migrations/entries/removeDuplicateCoins',
  () => ({ removeDuplicateCoins: mocks.removeDuplicateCoins })
)
vi.mock('@core/extension/storage/migrations/latestMigration', () => ({
  getLatestMigration: mocks.getLatestMigration,
  setLatestMigration: mocks.setLatestMigration,
}))

describe('runStorageMigrations', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.getLatestMigration.mockResolvedValue(null)
    mocks.changeFeeCoinKey.mockResolvedValue(undefined)
    mocks.removeDuplicateCoins.mockResolvedValue(undefined)
  })

  it('checkpoints each migration after it succeeds', async () => {
    await runStorageMigrations()

    expect(mocks.setLatestMigration).toHaveBeenNthCalledWith(
      1,
      'changeFeeCoinKey'
    )
    expect(mocks.setLatestMigration).toHaveBeenNthCalledWith(
      2,
      'removeDuplicateCoins'
    )
  })

  it('does not checkpoint a migration that fails', async () => {
    mocks.removeDuplicateCoins.mockRejectedValueOnce(new Error('failed'))

    await expect(runStorageMigrations()).rejects.toThrow(
      'Failed to run removeDuplicateCoins storage migration'
    )
    expect(mocks.setLatestMigration).toHaveBeenCalledOnce()
    expect(mocks.setLatestMigration).toHaveBeenCalledWith('changeFeeCoinKey')
  })
})
