import { StationLegacyStorageClassification } from '@clients/extension/src/storage/stationLegacyWalletClassifier'
import {
  getStationLegacyMigrationStatusRecords,
  setStationLegacyMigrationStatusRecord,
  setStationLegacyMigrationStatusRecords,
  shouldSuppressStationLegacyMigrationForSetup,
  stationLegacyMigrationStatusStorageKey,
} from '@clients/extension/src/storage/stationLegacyMigrationStatus'
import { describe, expect, it } from 'vitest'

const createClassification = (
  statusRecord?: StationLegacyStorageClassification['wallets'][number]['status']
): StationLegacyStorageClassification => ({
  metadata: {
    hasPasswordChallenge: true,
    isMigrationDone: false,
    storageKeysDetected: ['wallets'],
  },
  wallets: statusRecord
    ? [
        {
          walletName: 'QA Station Wallet',
          source: 'localStorage',
          storageKey: 'wallets',
          storageIndex: 0,
          walletType: 'privateKey',
          status: statusRecord,
          metadata: {},
        },
      ]
    : [],
})

describe('station legacy migration status storage', () => {
  it('persists migration records without touching legacy localStorage keys', async () => {
    await setStationLegacyMigrationStatusRecord({
      status: 'importing',
      updatedAt: 1,
      walletId: 'wallets:0',
      walletName: 'QA Station Wallet',
      source: 'privateKey',
    })
    await setStationLegacyMigrationStatusRecords({
      'wallets:1': {
        status: 'skipped',
        updatedAt: 2,
        walletId: 'wallets:1',
        walletName: 'Skipped Station Wallet',
      },
    })

    await expect(getStationLegacyMigrationStatusRecords()).resolves.toEqual({
      'wallets:0': {
        status: 'importing',
        updatedAt: 1,
        walletId: 'wallets:0',
        walletName: 'QA Station Wallet',
        source: 'privateKey',
      },
      'wallets:1': {
        status: 'skipped',
        updatedAt: 2,
        walletId: 'wallets:1',
        walletName: 'Skipped Station Wallet',
      },
    })

    const storage = await chrome.storage.local.get()
    expect(Object.keys(storage)).toEqual([stationLegacyMigrationStatusStorageKey])
  })

  it('suppresses setup prompt only when supported wallets have terminal records', () => {
    const classification = createClassification('supported')

    expect(
      shouldSuppressStationLegacyMigrationForSetup({
        classification,
        statusRecords: {},
      })
    ).toBe(false)
    expect(
      shouldSuppressStationLegacyMigrationForSetup({
        classification,
        statusRecords: {
          'wallets:0': {
            status: 'migrated',
            updatedAt: 1,
            vaultId: 'vault-id',
            walletId: 'wallets:0',
            walletName: 'QA Station Wallet',
          },
        },
      })
    ).toBe(true)
    expect(
      shouldSuppressStationLegacyMigrationForSetup({
        classification: createClassification('reconnect'),
        statusRecords: {},
      })
    ).toBe(false)
  })
})
