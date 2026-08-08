import { StationLegacyStorageClassification } from '@clients/extension/src/storage/stationLegacyWalletClassifier'
import {
  getStationLegacyMigrationStatusRecords,
  setStationLegacyMigrationStatusRecord,
  setStationLegacyMigrationStatusRecords,
  shouldSuppressStationLegacyMigrationForSetup,
  stationLegacyMigrationStatusStorageKey,
} from '@clients/extension/src/storage/stationLegacyMigrationStatus'
import { beforeEach, describe, expect, it } from 'vitest'

const createWallet = ({
  status,
  storageIndex,
}: {
  status: StationLegacyStorageClassification['wallets'][number]['status']
  storageIndex: number
}): StationLegacyStorageClassification['wallets'][number] => ({
  walletName: `QA Station Wallet ${storageIndex}`,
  source: 'localStorage',
  storageKey: 'wallets',
  storageIndex,
  walletType: 'privateKey',
  status,
  metadata: {},
})

const createClassification = (
  statuses: StationLegacyStorageClassification['wallets'][number]['status'][] =
    []
): StationLegacyStorageClassification => ({
  metadata: {
    hasPasswordChallenge: true,
    isMigrationDone: false,
    storageKeysDetected: ['wallets'],
  },
  wallets: statuses.map((status, index) =>
    createWallet({ status, storageIndex: index })
  ),
})

describe('station legacy migration status storage', () => {
  beforeEach(async () => {
    await chrome.storage.local.clear()
  })

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
    expect(Object.keys(storage)).toEqual([
      stationLegacyMigrationStatusStorageKey,
    ])
  })

  it('suppresses setup prompt only when supported wallets have terminal records', () => {
    const classification = createClassification(['supported'])

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
        classification: createClassification(['unsupported']),
        statusRecords: {},
      })
    ).toBe(false)
  })

  it('keeps setup migration visible until every supported legacy wallet is terminal', () => {
    const classification = createClassification(['supported', 'supported'])

    expect(
      shouldSuppressStationLegacyMigrationForSetup({
        classification,
        statusRecords: {
          'wallets:0': {
            status: 'migrated',
            updatedAt: 1,
            vaultId: 'vault-id-0',
            walletId: 'wallets:0',
            walletName: 'QA Station Wallet 0',
          },
        },
      })
    ).toBe(false)

    expect(
      shouldSuppressStationLegacyMigrationForSetup({
        classification,
        statusRecords: {
          'wallets:0': {
            status: 'migrated',
            updatedAt: 1,
            vaultId: 'vault-id-0',
            walletId: 'wallets:0',
            walletName: 'QA Station Wallet 0',
          },
          'wallets:1': {
            status: 'migrated',
            updatedAt: 2,
            vaultId: 'vault-id-1',
            walletId: 'wallets:1',
            walletName: 'QA Station Wallet 1',
          },
        },
      })
    ).toBe(true)
  })

  it('ignores malformed records loaded from chrome storage', async () => {
    await chrome.storage.local.set({
      [stationLegacyMigrationStatusStorageKey]: {
        valid: {
          status: 'migrated',
          updatedAt: 1,
          vaultId: 'vault-id',
          walletId: 'wallets:0',
          walletName: 'QA Station Wallet',
        },
        invalidStatus: {
          status: 'ready',
          updatedAt: 1,
          walletId: 'wallets:1',
          walletName: 'Ready is not persisted',
        },
        invalidUpdatedAt: {
          status: 'skipped',
          updatedAt: 'yesterday',
          walletId: 'wallets:2',
          walletName: 'Bad timestamp',
        },
      },
    })

    await expect(getStationLegacyMigrationStatusRecords()).resolves.toEqual({
      valid: {
        status: 'migrated',
        updatedAt: 1,
        vaultId: 'vault-id',
        walletId: 'wallets:0',
        walletName: 'QA Station Wallet',
      },
    })
  })
})
