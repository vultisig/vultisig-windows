import { describe, expect, it } from 'vitest'

import { shouldShowStationLegacyMigration } from '@clients/extension/src/pages/station-migration/stationLegacyMigrationGate'
import { StationLegacyStorageClassification } from '@clients/extension/src/storage/stationLegacyWalletClassifier'

const classificationWithWallets: StationLegacyStorageClassification = {
  wallets: [
    {
      walletName: 'Station Wallet',
      source: 'localStorage',
      storageKey: 'wallets',
      storageIndex: 0,
      walletType: 'seed',
      status: 'supported',
      metadata: {
        encryptedSeed: 'encrypted-seed',
      },
    },
  ],
  metadata: {
    hasPasswordChallenge: false,
    isMigrationDone: false,
    storageKeysDetected: ['wallets'],
  },
}

const emptyClassification: StationLegacyStorageClassification = {
  wallets: [],
  metadata: {
    hasPasswordChallenge: false,
    isMigrationDone: false,
    storageKeysDetected: [],
  },
}

describe('shouldShowStationLegacyMigration', () => {
  it('shows the migration entry only for Station builds with detected legacy wallets', () => {
    expect(
      shouldShowStationLegacyMigration({
        classification: classificationWithWallets,
        productBrand: 'station',
      })
    ).toBe(true)

    expect(
      shouldShowStationLegacyMigration({
        classification: classificationWithWallets,
        productBrand: 'vultisig',
      })
    ).toBe(false)

    expect(
      shouldShowStationLegacyMigration({
        classification: emptyClassification,
        productBrand: 'station',
      })
    ).toBe(false)
  })

  it('lets users continue normal setup after skipping the shell', () => {
    expect(
      shouldShowStationLegacyMigration({
        classification: classificationWithWallets,
        productBrand: 'station',
        skip: true,
      })
    ).toBe(false)
  })
})
