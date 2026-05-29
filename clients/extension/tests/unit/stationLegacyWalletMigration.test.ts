import { StationLegacyWalletClassification } from '@clients/extension/src/storage/stationLegacyWalletClassifier'
import { decryptStationLegacySecret } from '@clients/extension/src/pages/station-migration/stationLegacyCipher'
import { Chain } from '@vultisig/core-chain/Chain'
import {
  deriveStationTerraKeyMaterial,
} from '@vultisig/core-chain/station/importPrimitives'
import type { StationTerraKeyMaterial } from '@vultisig/core-chain/station/importPrimitives'
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

const createStationMaterial = ({
  address = 'terra1matchingaddress',
  publicKeyBase64 = 'matching-public-key',
  source = 'privateKey',
}: {
  address?: string
  publicKeyBase64?: string
  source?: StationTerraKeyMaterial['source']
} = {}): StationTerraKeyMaterial => ({
  source,
  privateKeyHex: '01'.repeat(32),
  publicKeyHex: '02'.repeat(33),
  publicKeyBase64,
  address,
  chainPublicKeys: [],
})

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

const createMnemonicWallet = (
  metadata: StationLegacyWalletClassification['metadata'] = {}
): StationLegacyWalletClassification => ({
  walletName: 'QA Mnemonic',
  source: 'localStorage',
  storageKey: 'wallets',
  storageIndex: 0,
  walletType: 'mnemonic',
  status: 'supported',
  metadata: {
    encryptedMnemonic: 'encrypted-mnemonic',
    encryptedSeed: '01'.repeat(64),
    ...metadata,
  },
})

describe('station legacy wallet migration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(decryptStationLegacySecret).mockImplementation(({ ciphertext }) =>
      Promise.resolve(ciphertext)
    )
    vi.mocked(deriveStationTerraKeyMaterial).mockImplementation(() =>
      createStationMaterial()
    )
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

  it('falls back from a stale mnemonic to a matching encrypted seed', async () => {
    const { decryptStationLegacyWallet } =
      await import('@clients/extension/src/pages/station-migration/stationLegacyWalletMigration')

    vi.mocked(deriveStationTerraKeyMaterial).mockImplementation(({ source }) =>
      source.kind === 'mnemonic'
        ? createStationMaterial({
            address: 'terra1staleaddress',
            source: source.kind,
          })
        : createStationMaterial({ source: source.kind })
    )

    await expect(
      decryptStationLegacyWallet({
        wallet: createMnemonicWallet({
          address: 'terra1matchingaddress',
        }),
        password: 'station-password',
        walletCore: {},
      })
    ).resolves.toMatchObject({
      status: 'ready',
      source: 'seed',
    })
  })

  it('reports the mnemonic metadata mismatch when seed fallback also mismatches', async () => {
    const { decryptStationLegacyWallet } =
      await import('@clients/extension/src/pages/station-migration/stationLegacyWalletMigration')

    vi.mocked(deriveStationTerraKeyMaterial).mockImplementation(({ source }) =>
      createStationMaterial({
        address: 'terra1staleaddress',
        source: source.kind,
      })
    )

    await expect(
      decryptStationLegacyWallet({
        wallet: createMnemonicWallet({
          address: 'terra1matchingaddress',
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
