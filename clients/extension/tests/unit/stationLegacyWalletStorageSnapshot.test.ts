import { describe, expect, it } from 'vitest'

import {
  getStationLegacyWalletStorageClassification,
  getStationLegacyWalletStorageSnapshot,
  stationLegacyLocalStorageKeys,
  StationLegacyStorageReader,
} from '@clients/extension/src/storage/stationLegacyWalletStorageSnapshot'

const createStorage = (
  values: Record<string, string | null>
): StationLegacyStorageReader => ({
  getItem: key => values[key] ?? null,
})

describe('getStationLegacyWalletStorageSnapshot', () => {
  it('reads only the legacy Station localStorage keys needed by the classifier', () => {
    const readKeys: string[] = []
    const storage: StationLegacyStorageReader = {
      getItem: key => {
        readKeys.push(key)
        return key === 'wallets' ? '[]' : null
      },
    }

    expect(getStationLegacyWalletStorageSnapshot(storage)).toEqual({
      wallets: '[]',
      keys: null,
      passwordChallenge: null,
      connectedWallet: null,
      isMigrationDone: null,
    })
    expect(readKeys).toEqual(stationLegacyLocalStorageKeys)
  })

  it('classifies the read-only snapshot without writing migration state', () => {
    const result = getStationLegacyWalletStorageClassification(
      createStorage({
        wallets: JSON.stringify([
          {
            name: 'Station Seed',
            encryptedSeed: 'encrypted-seed',
          },
        ]),
        isMigrationDone: 'true',
      })
    )

    expect(result.metadata.isMigrationDone).toBe(true)
    expect(result.wallets).toHaveLength(1)
    expect(result.wallets[0]).toMatchObject({
      walletName: 'Station Seed',
      walletType: 'seed',
      status: 'supported',
    })
  })
})
