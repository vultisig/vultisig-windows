import { StationLegacyWalletClassification } from '@clients/extension/src/storage/stationLegacyWalletClassifier'
import { StationTerraRootKeyImportInput } from '@core/ui/mpc/keygen/keyimport/state/keyImportInput'
import { Chain } from '@vultisig/core-chain/Chain'
import {
  deriveStationTerraKeyMaterial,
  StationTerraCoinType,
  StationTerraKeyMaterial,
} from '@vultisig/core-chain/station/importPrimitives'
import { bech32 } from 'bech32'

import { decryptStationLegacySecret } from './stationLegacyCipher'

export type StationLegacyMigrationFailureCode =
  | 'incorrectPassword'
  | 'missingEncryptedValue'
  | 'invalidSeed'
  | 'invalidLegacyWallet'
  | 'metadataMismatch'
  | 'splitInterchainPrivateKeys'
  | 'unsupported'

export type StationLegacyMigrationResult =
  | {
      status: 'ready'
      walletId: string
      walletName: string
      keyImportInput: StationTerraRootKeyImportInput
      source: 'mnemonic' | 'seed' | 'privateKey'
    }
  | {
      status: 'failed'
      walletId: string
      walletName: string
      failureCode: StationLegacyMigrationFailureCode
    }

type StationLegacyMigrationReadySource = Extract<
  StationLegacyMigrationResult,
  { status: 'ready' }
>['source']

type DecryptStationLegacyWalletInput = {
  wallet: StationLegacyWalletClassification
  password: string
  walletCore: any
}

const stationMigrationChains = [Chain.Terra, Chain.TerraClassic]

export const getStationLegacyWalletId = (
  wallet: StationLegacyWalletClassification
) => `${wallet.storageKey}:${wallet.storageIndex ?? 'storage'}`

const hexToBytes = (hex: string): Uint8Array => {
  const normalized = hex.trim()
  if (normalized.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(normalized)) {
    throw new Error('Invalid seed')
  }

  return Uint8Array.from({ length: normalized.length / 2 }, (_, index) =>
    Number.parseInt(normalized.slice(index * 2, index * 2 + 2), 16)
  )
}

const addressFromStationWords = (words: string) =>
  bech32.encode('terra', hexToBytes(words))

const toKeyImportInput = (
  material: StationTerraKeyMaterial
): StationTerraRootKeyImportInput => ({
  kind: 'stationTerraRoot',
  privateKeyHex: material.privateKeyHex,
  publicKeyHex: material.publicKeyHex,
  chains: stationMigrationChains,
})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const hasLegacyPrivateKey = (value: unknown): value is { privateKey: string } =>
  isRecord(value) && typeof value.privateKey === 'string'

const getExpectedAddresses = (
  wallet: StationLegacyWalletClassification
): string[] => {
  const addresses = new Set<string>()
  const { address, words } = wallet.metadata

  if (address) addresses.add(address)

  for (const wordsValue of [words?.['330'], words?.['118']]) {
    if (!wordsValue) continue
    try {
      addresses.add(addressFromStationWords(wordsValue))
    } catch {
      return ['__invalid_station_words__']
    }
  }

  return [...addresses]
}

const getExpectedPublicKeys = (
  wallet: StationLegacyWalletClassification
): string[] => {
  const publicKeys = new Set<string>()
  const { pubkey } = wallet.metadata

  for (const value of [pubkey?.['330'], pubkey?.['118']]) {
    if (value) publicKeys.add(value)
  }

  return [...publicKeys]
}

const validateAgainstMetadata = ({
  material,
  wallet,
}: {
  material: StationTerraKeyMaterial
  wallet: StationLegacyWalletClassification
}) => {
  const expectedAddresses = getExpectedAddresses(wallet)
  const expectedPublicKeys = getExpectedPublicKeys(wallet)

  if (
    expectedAddresses.length > 0 &&
    !expectedAddresses.every(address => address === material.address)
  ) {
    return false
  }

  if (
    expectedPublicKeys.length > 0 &&
    !expectedPublicKeys.every(
      publicKey => publicKey === material.publicKeyBase64
    )
  ) {
    return false
  }

  return true
}

const deriveValidatedSeedMaterial = ({
  seed,
  wallet,
  walletCore,
}: {
  seed: Uint8Array
  wallet: StationLegacyWalletClassification
  walletCore: any
}) => {
  const primaryCoinType: StationTerraCoinType = wallet.metadata.legacy
    ? 118
    : 330
  const coinTypes: StationTerraCoinType[] =
    primaryCoinType === 118 ? [118, 330] : [330, 118]

  for (const coinType of coinTypes) {
    const material = deriveStationTerraKeyMaterial({
      source: {
        kind: 'seed',
        seed,
        coinType,
        index: wallet.metadata.index ?? 0,
      },
      walletCore,
    })

    if (validateAgainstMetadata({ material, wallet })) return material
  }

  throw new Error('Station metadata mismatch')
}

const decryptSeedMaterial = async ({
  wallet,
  password,
  walletCore,
}: DecryptStationLegacyWalletInput) => {
  const encryptedSeed = wallet.metadata.encryptedSeed
  if (!encryptedSeed) throw new Error('Missing encrypted seed')

  const seedHex = await decryptStationLegacySecret({
    ciphertext: encryptedSeed,
    password,
  })

  return deriveValidatedSeedMaterial({
    seed: hexToBytes(seedHex),
    wallet,
    walletCore,
  })
}

const decryptPrivateKeyMaterial = async ({
  encrypted,
  password,
  wallet,
  walletCore,
}: DecryptStationLegacyWalletInput & { encrypted: string }) => {
  const privateKeyHex = await decryptStationLegacySecret({
    ciphertext: encrypted,
    password,
  })
  const material = deriveStationTerraKeyMaterial({
    source: { kind: 'privateKey', privateKeyHex },
    walletCore,
  })

  if (!validateAgainstMetadata({ material, wallet })) {
    throw new Error('Station metadata mismatch')
  }

  return material
}

export const decryptStationLegacyWallet = async ({
  wallet,
  password,
  walletCore,
}: DecryptStationLegacyWalletInput): Promise<StationLegacyMigrationResult> => {
  const walletId = getStationLegacyWalletId(wallet)
  const failure = (
    failureCode: StationLegacyMigrationFailureCode
  ): StationLegacyMigrationResult => ({
    status: 'failed',
    walletId,
    walletName: wallet.walletName,
    failureCode,
  })

  if (wallet.status !== 'supported') {
    return failure('unsupported')
  }

  try {
    let material: StationTerraKeyMaterial
    let source: StationLegacyMigrationReadySource

    switch (wallet.walletType) {
      case 'mnemonic':
        if (wallet.metadata.encryptedMnemonic) {
          try {
            const mnemonic = await decryptStationLegacySecret({
              ciphertext: wallet.metadata.encryptedMnemonic,
              password,
            })
            material = deriveStationTerraKeyMaterial({
              source: {
                kind: 'mnemonic',
                mnemonic,
                coinType: wallet.metadata.legacy ? 118 : 330,
                index: wallet.metadata.index ?? 0,
              },
              walletCore,
            })
            if (!validateAgainstMetadata({ material, wallet })) {
              throw new Error('Station metadata mismatch')
            }
            source = 'mnemonic'
            break
          } catch (error) {
            if (!wallet.metadata.encryptedSeed) {
              throw error
            }

            try {
              material = await decryptSeedMaterial({
                wallet,
                password,
                walletCore,
              })
            } catch (seedError) {
              const message =
                error instanceof Error ? error.message : String(error)
              if (message.toLowerCase().includes('metadata mismatch')) {
                throw error
              }

              throw seedError
            }
            source = 'seed'
            break
          }
        }

        material = await decryptSeedMaterial({ wallet, password, walletCore })
        source = 'seed'
        break
      case 'seed':
        material = await decryptSeedMaterial({ wallet, password, walletCore })
        source = 'seed'
        break
      case 'privateKey':
        if (typeof wallet.metadata.encrypted !== 'string') {
          return failure('missingEncryptedValue')
        }
        material = await decryptPrivateKeyMaterial({
          encrypted: wallet.metadata.encrypted,
          password,
          wallet,
          walletCore,
        })
        source = 'privateKey'
        break
      case 'interchainPrivateKey':
        if (
          typeof wallet.metadata.encrypted !== 'object' ||
          !wallet.metadata.encrypted['330']
        ) {
          return failure('missingEncryptedValue')
        }
        material = await decryptPrivateKeyMaterial({
          encrypted: wallet.metadata.encrypted['330'],
          password,
          wallet,
          walletCore,
        })
        if (wallet.metadata.encrypted['118']) {
          const terraClassicMaterial = await decryptPrivateKeyMaterial({
            encrypted: wallet.metadata.encrypted['118'],
            password,
            wallet,
            walletCore,
          })
          if (terraClassicMaterial.privateKeyHex !== material.privateKeyHex) {
            return failure('splitInterchainPrivateKeys')
          }
        }
        source = 'privateKey'
        break
      case 'legacyPrivateKey':
        if (!wallet.metadata.wallet) return failure('missingEncryptedValue')
        {
          const decrypted = await decryptStationLegacySecret({
            ciphertext: wallet.metadata.wallet,
            password,
          })
          let parsed: unknown
          try {
            parsed = JSON.parse(decrypted)
          } catch {
            return failure('invalidLegacyWallet')
          }
          if (!hasLegacyPrivateKey(parsed)) {
            return failure('invalidLegacyWallet')
          }
          material = deriveStationTerraKeyMaterial({
            source: { kind: 'privateKey', privateKeyHex: parsed.privateKey },
            walletCore,
          })
          if (!validateAgainstMetadata({ material, wallet })) {
            return failure('metadataMismatch')
          }
          source = 'privateKey'
        }
        break
      default:
        return failure('unsupported')
    }

    return {
      status: 'ready',
      walletId,
      walletName: wallet.walletName,
      keyImportInput: toKeyImportInput(material),
      source,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (message.toLowerCase().includes('metadata mismatch')) {
      return failure('metadataMismatch')
    }
    if (message.includes('Invalid seed')) {
      return failure('invalidSeed')
    }

    return failure('incorrectPassword')
  }
}
