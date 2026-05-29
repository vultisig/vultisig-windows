import { StationLegacyWalletClassification } from '@clients/extension/src/storage/stationLegacyWalletClassifier'
import { Chain } from '@vultisig/core-chain/Chain'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock(
  '@clients/extension/src/pages/station-migration/stationLegacyCipher',
  () => ({
    decryptStationLegacySecret: vi.fn(({ ciphertext }) =>
      Promise.resolve(ciphertext)
    ),
  })
)

vi.mock('@vultisig/core-chain/station/importPrimitives', () => ({
  deriveStationTerraKeyMaterial: vi.fn(() => ({
    source: 'privateKey',
    privateKeyHex: '01'.repeat(32),
    publicKeyHex: '02'.repeat(33),
    publicKeyBase64: 'matching-public-key',
    address: 'terra1matchingaddress',
    chainPublicKeys: [],
  })),
}))

const createPrivateKeyWallet = (
  metadata: StationLegacyWalletClassification['metadata'] = {}
): StationLegacyWalletClassification => ({
  walletName: 'QA Private Key',
  source: 'localStorage',
  storageKey: 'wallets',
  storageIndex: 0,
  walletType: 'privateKey',
  status: 'supported',
  metadata: {
    encrypted: 'decrypted-private-key',
    ...metadata,
  },
})

describe('station legacy wallet migration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('marks a private-key wallet ready when every Station metadata value matches', async () => {
    const { decryptStationLegacyWallet } =
      await import('@clients/extension/src/pages/station-migration/stationLegacyWalletMigration')

    await expect(
      decryptStationLegacyWallet({
        wallet: createPrivateKeyWallet({
          address: 'terra1matchingaddress',
          pubkey: {
            '330': 'matching-public-key',
            '118': 'matching-public-key',
          },
        }),
        password: 'station-password',
        walletCore: {},
      })
    ).resolves.toMatchObject({
      status: 'ready',
      keyImportInput: {
        kind: 'stationTerraRoot',
        chains: [Chain.Terra, Chain.TerraClassic],
      },
    })
  })

  it('fails when only one of multiple Station metadata values matches', async () => {
    const { decryptStationLegacyWallet } =
      await import('@clients/extension/src/pages/station-migration/stationLegacyWalletMigration')

    await expect(
      decryptStationLegacyWallet({
        wallet: createPrivateKeyWallet({
          pubkey: {
            '330': 'matching-public-key',
            '118': 'different-public-key',
          },
        }),
        password: 'station-password',
        walletCore: {},
      })
    ).resolves.toMatchObject({
      status: 'failed',
      failureCode: 'metadataMismatch',
    })
  })
})
