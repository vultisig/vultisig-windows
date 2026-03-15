import { create } from '@bufbuild/protobuf'
import { Timestamp, TimestampSchema } from '@bufbuild/protobuf/wkt'
import { Chain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import {
  SignatureAlgorithm,
  signatureAlgorithms,
  signingAlgorithms,
} from '@core/chain/signing/SignatureAlgorithm'
import { isKeyImportVault, Vault } from '@core/mpc/vault/Vault'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { pick } from '@lib/utils/record/pick'
import { recordFromKeys } from '@lib/utils/record/recordFromKeys'
import { toEntries } from '@lib/utils/record/toEntries'
import { convertDuration } from '@lib/utils/time/convertDuration'

import { hasServer } from '../../devices/localPartyId'
import {
  Vault as CommVault,
  Vault_ChainPublicKeySchema,
  Vault_KeyShareSchema,
  VaultSchema,
} from '../vultisig/vault/v1/vault_pb'
import { fromLibType, toLibType } from './libType'

const isoStringToProtoTimestamp = (timestamp: number): Timestamp => {
  const seconds = Math.floor(convertDuration(timestamp, 'ms', 's'))
  const nanos = convertDuration(
    timestamp - convertDuration(seconds, 's', 'ms'),
    'ms',
    'ns'
  )
  return create(TimestampSchema, { seconds: BigInt(seconds), nanos })
}

export const toCommVault = (vault: Vault): CommVault =>
  create(VaultSchema, {
    ...pick(vault, [
      'name',
      'signers',
      'hexChainCode',
      'localPartyId',
      'resharePrefix',
    ]),
    createdAt: vault.createdAt
      ? isoStringToProtoTimestamp(vault.createdAt)
      : undefined,
    keyShares: [
      ...toEntries(vault.keyShares).map(({ key, value }) =>
        create(Vault_KeyShareSchema, {
          publicKey: vault.publicKeys[key as SignatureAlgorithm],
          keyshare: value,
        })
      ),
      ...toEntries(vault.chainKeyShares ?? {}).map(({ key, value }) =>
        create(Vault_KeyShareSchema, {
          publicKey: shouldBePresent(vault.chainPublicKeys?.[key as Chain]),
          keyshare: value,
        })
      ),
      ...(vault.publicKeyMldsa && vault.keyShareMldsa
        ? [
            create(Vault_KeyShareSchema, {
              publicKey: vault.publicKeyMldsa,
              keyshare: vault.keyShareMldsa,
            }),
          ]
        : []),
    ],
    publicKeyEcdsa: vault.publicKeys.ecdsa,
    publicKeyEddsa: vault.publicKeys.eddsa,
    publicKeyMldsa44: vault.publicKeyMldsa ?? '',
    libType: toLibType({
      libType: vault.libType,
      isKeyImport: isKeyImportVault(vault),
    }),
    chainPublicKeys: toEntries(vault.chainPublicKeys ?? {}).map(
      ({ key, value }) =>
        create(Vault_ChainPublicKeySchema, {
          publicKey: value,
          chain: key,
          isEddsa: signatureAlgorithms[getChainKind(key as Chain)] === 'eddsa',
        })
    ),
  })

export const fromCommVault = (vault: CommVault): Vault => {
  const allChainPublicKeys: Partial<Record<Chain, string>> = {}
  const chainKeyShares: Partial<Record<Chain, string>> = {}
  const chainsByPublicKey = new Map<string, Chain[]>()
  const publicKeys = {
    ecdsa: vault.publicKeyEcdsa,
    eddsa: vault.publicKeyEddsa,
  }

  vault.chainPublicKeys.forEach(cp => {
    const chain = cp.chain as Chain
    allChainPublicKeys[chain] = cp.publicKey
    const existing = chainsByPublicKey.get(cp.publicKey) ?? []
    existing.push(chain)
    chainsByPublicKey.set(cp.publicKey, existing)
  })

  const keyShares = recordFromKeys(
    signingAlgorithms,
    algorithm =>
      shouldBePresent(
        vault.keyShares.find(
          keyShare => keyShare.publicKey === publicKeys[algorithm]
        )
      ).keyshare
  )

  const publicKeyMldsa = vault.publicKeyMldsa44 || undefined
  const keyShareMldsa = vault.publicKeyMldsa44
    ? vault.keyShares.find(ks => ks.publicKey === vault.publicKeyMldsa44)
        ?.keyshare
    : undefined

  vault.keyShares.forEach(keyShare => {
    const chains = chainsByPublicKey.get(keyShare.publicKey)
    if (chains) {
      chains.forEach(chain => {
        chainKeyShares[chain] = keyShare.keyshare
      })
    }
  })

  const chainPublicKeysWithKeyShare = toEntries(allChainPublicKeys).filter(
    ({ key }) => key in chainKeyShares
  )
  const chainPublicKeys = chainPublicKeysWithKeyShare.reduce<
    Partial<Record<Chain, string>>
  >((acc, { key, value }) => {
    acc[key] = value
    return acc
  }, {})

  return {
    ...pick(vault, [
      'name',
      'signers',
      'hexChainCode',
      'localPartyId',
      'resharePrefix',
      'libType',
    ]),
    createdAt: vault.createdAt
      ? convertDuration(Number(vault.createdAt.seconds), 's', 'ms')
      : undefined,
    publicKeys,
    keyShares,
    publicKeyMldsa,
    keyShareMldsa,
    chainKeyShares:
      Object.keys(chainKeyShares).length > 0 ? chainKeyShares : undefined,
    chainPublicKeys:
      Object.keys(chainPublicKeys).length > 0 ? chainPublicKeys : undefined,
    libType: fromLibType(vault.libType),
    isBackedUp: false,
    order: 0,
    lastPasswordVerificationTime: hasServer(vault.signers)
      ? Date.now()
      : undefined,
  }
}
