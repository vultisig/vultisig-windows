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
  coinType,
  privateKeyHex = '01'.repeat(32),
  publicKeyHex = '02'.repeat(33),
  publicKeyBase64 = 'matching-public-key',
  source = 'privateKey',
}: {
  address?: string
  coinType?: StationTerraKeyMaterial['coinType']
  privateKeyHex?: string
  publicKeyHex?: string
  publicKeyBase64?: string
  source?: StationTerraKeyMaterial['source']
} = {}): StationTerraKeyMaterial => ({
  source,
  privateKeyHex,
  publicKeyHex,
  publicKeyBase64,
  address,
  coinType,
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

const createInterchainPrivateKeyWallet = (
  metadata: StationLegacyWalletClassification['metadata'] = {}
): StationLegacyWalletClassification => ({
  walletName: 'QA Interchain Private Key',
  source: 'localStorage',
  storageKey: 'wallets',
  storageIndex: 0,
  walletType: 'interchainPrivateKey',
  status: 'supported',
  metadata: {
    encrypted: {
      '330': 'decrypted-private-key-330',
      '118': 'decrypted-private-key-118',
    },
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

  it('validates mnemonic material against the matching Station coin type metadata only', async () => {
    const { decryptStationLegacyWallet } =
      await import('@clients/extension/src/pages/station-migration/stationLegacyWalletMigration')

    vi.mocked(deriveStationTerraKeyMaterial).mockImplementation(({ source }) =>
      createStationMaterial({
        coinType: source.kind === 'privateKey' ? undefined : source.coinType,
        source: source.kind,
      })
    )

    await expect(
      decryptStationLegacyWallet({
        wallet: createMnemonicWallet({
          address: 'terra1matchingaddress',
          pubkey: {
            '330': 'matching-public-key',
            '118': 'different-public-key',
          },
        }),
        password: 'station-password',
        walletCore: {},
      })
    ).resolves.toMatchObject({
      status: 'ready',
      source: 'mnemonic',
    })
  })

  it('validates interchain private keys against matching coin type metadata before split detection', async () => {
    const { decryptStationLegacyWallet } =
      await import('@clients/extension/src/pages/station-migration/stationLegacyWalletMigration')

    vi.mocked(deriveStationTerraKeyMaterial).mockImplementation(({ source }) =>
      source.kind === 'privateKey' &&
      source.privateKeyHex === 'decrypted-private-key-118'
        ? createStationMaterial({
            address: 'terra1classicaddress',
            privateKeyHex: '02'.repeat(32),
            publicKeyBase64: 'terra-classic-public-key',
            source: source.kind,
          })
        : createStationMaterial({
            address: 'terra1terraaddress',
            privateKeyHex: '01'.repeat(32),
            publicKeyBase64: 'terra-public-key',
            source: source.kind,
          })
    )

    await expect(
      decryptStationLegacyWallet({
        wallet: createInterchainPrivateKeyWallet({
          pubkey: {
            '330': 'terra-public-key',
            '118': 'terra-classic-public-key',
          },
        }),
        password: 'station-password',
        walletCore: {},
      })
    ).resolves.toMatchObject({
      status: 'failed',
      failureCode: 'splitInterchainPrivateKeys',
    })
  })

  it('keeps multiple supported Station wallets as distinct ready migration results', async () => {
    const { decryptStationLegacyWallet } =
      await import('@clients/extension/src/pages/station-migration/stationLegacyWalletMigration')

    vi.mocked(deriveStationTerraKeyMaterial).mockImplementation(({ source }) =>
      source.kind === 'privateKey' &&
      source.privateKeyHex === 'decrypted-private-key-1'
        ? createStationMaterial({
            address: 'terra1walletone',
            privateKeyHex: '01'.repeat(32),
            publicKeyHex: '02'.repeat(33),
            publicKeyBase64: 'wallet-one-public-key',
            source: source.kind,
          })
        : createStationMaterial({
            address: 'terra1wallettwo',
            privateKeyHex: '03'.repeat(32),
            publicKeyHex: '04'.repeat(33),
            publicKeyBase64: 'wallet-two-public-key',
            source: source.kind,
          })
    )

    const results = await Promise.all([
      decryptStationLegacyWallet({
        wallet: createPrivateKeyWallet({
          encrypted: 'decrypted-private-key-1',
          pubkey: { '330': 'wallet-one-public-key' },
        }),
        password: 'station-password',
        walletCore: {},
      }),
      decryptStationLegacyWallet({
        wallet: {
          ...createPrivateKeyWallet({
            encrypted: 'decrypted-private-key-2',
            pubkey: { '330': 'wallet-two-public-key' },
          }),
          storageIndex: 1,
          walletName: 'QA Private Key 2',
        },
        password: 'station-password',
        walletCore: {},
      }),
    ])

    expect(Object.fromEntries(results.map(result => [result.walletId, result])))
      .toMatchObject({
        'wallets:0': {
          status: 'ready',
          keyImportInput: {
            privateKeyHex: '01'.repeat(32),
            publicKeyHex: '02'.repeat(33),
          },
        },
        'wallets:1': {
          status: 'ready',
          keyImportInput: {
            privateKeyHex: '03'.repeat(32),
            publicKeyHex: '04'.repeat(33),
          },
        },
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

  it('reports invalid legacy wallet when decrypted legacy JSON is malformed', async () => {
    const { decryptStationLegacyWallet } =
      await import('@clients/extension/src/pages/station-migration/stationLegacyWalletMigration')

    await expect(
      decryptStationLegacyWallet({
        wallet: {
          walletName: 'QA Legacy Wallet',
          source: 'localStorage',
          storageKey: 'keys',
          storageIndex: 0,
          walletType: 'legacyPrivateKey',
          status: 'supported',
          metadata: {
            wallet: '{not-json',
          },
        },
        password: 'station-password',
        walletCore: {},
      })
    ).resolves.toMatchObject({
      status: 'failed',
      failureCode: 'invalidLegacyWallet',
    })
  })
})
