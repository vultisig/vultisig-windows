import { create } from '@bufbuild/protobuf'
import { Timestamp, TimestampSchema } from '@bufbuild/protobuf/wkt'
import { Chain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import {
  SignatureAlgorithm,
  signatureAlgorithms,
  signingAlgorithms,
} from '@core/chain/signing/SignatureAlgorithm'
import { Vault } from '@core/mpc/vault/Vault'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { base64Encode } from '@lib/utils/base64Encode'
import { pick } from '@lib/utils/record/pick'
import { recordFromKeys } from '@lib/utils/record/recordFromKeys'
import { toEntries } from '@lib/utils/record/toEntries'
import { convertDuration } from '@lib/utils/time/convertDuration'

import { fromt_derive_spend_pub_key } from '../../../../lib/fromt/fromt_wasm'
import {
  frozt_keyshare_bundle_pub_key_package,
  frozt_keyshare_bundle_sapling_extras,
  frozt_pubkeypackage_verifying_key,
} from '../../../../lib/frozt/frozt_wasm'
import { hasServer } from '../../devices/localPartyId'
import {
  Vault as CommVault,
  Vault_ChainPublicKeySchema,
  Vault_KeyShareSchema,
  VaultSchema,
} from '../vultisig/vault/v1/vault_pb'
import { fromLibType, toLibType } from './libType'

type FroztBundleMetadata = {
  pubKeyPackage: string
  publicKey: string
  saplingExtras: string
}

type FromtBundleMetadata = {
  chainPublicKey: string
  publicKey: string
}

const isoStringToProtoTimestamp = (timestamp: number): Timestamp => {
  const seconds = Math.floor(convertDuration(timestamp, 'ms', 's'))
  const nanos = convertDuration(
    timestamp - convertDuration(seconds, 's', 'ms'),
    'ms',
    'ns'
  )
  return create(TimestampSchema, { seconds: BigInt(seconds), nanos })
}

const decodeBase64 = (value: string): Uint8Array =>
  new Uint8Array(Buffer.from(value, 'base64'))

const encodeHex = (value: Uint8Array): string =>
  Buffer.from(value).toString('hex')

const getFroztBundleMetadata = (
  bundleBase64: string
): FroztBundleMetadata | undefined => {
  try {
    const bundle = decodeBase64(bundleBase64)
    const pubKeyPackage = frozt_keyshare_bundle_pub_key_package(bundle)

    return {
      pubKeyPackage: base64Encode(pubKeyPackage),
      publicKey: encodeHex(frozt_pubkeypackage_verifying_key(pubKeyPackage)),
      saplingExtras: base64Encode(frozt_keyshare_bundle_sapling_extras(bundle)),
    }
  } catch {
    return undefined
  }
}

const getFromtBundleMetadata = (
  bundleBase64: string
): FromtBundleMetadata | undefined => {
  try {
    const publicKey = fromt_derive_spend_pub_key(decodeBase64(bundleBase64))

    return {
      chainPublicKey: base64Encode(publicKey),
      publicKey: encodeHex(publicKey),
    }
  } catch {
    return undefined
  }
}

const getExportedChainPublicKey = ({
  chain,
  value,
  froztMetadata,
  fromtMetadata,
}: {
  chain: Chain
  value: string
  froztMetadata?: FroztBundleMetadata
  fromtMetadata?: FromtBundleMetadata
}): string => {
  if (chain === Chain.ZcashSapling) {
    return froztMetadata?.publicKey ?? value
  }

  if (chain === Chain.Monero) {
    return fromtMetadata?.publicKey ?? value
  }

  return value
}

export const toCommVault = (vault: Vault): CommVault => {
  const froztBundle = vault.chainKeyShares?.[Chain.ZcashSapling]
  const froztMetadata = froztBundle
    ? getFroztBundleMetadata(froztBundle)
    : undefined

  const fromtBundle = vault.chainKeyShares?.[Chain.Monero]
  const fromtMetadata = fromtBundle
    ? getFromtBundleMetadata(fromtBundle)
    : undefined

  const uniqueChainKeyShares = new Map<string, string>()
  toEntries(vault.chainKeyShares ?? {}).forEach(({ key, value }) => {
    const publicKey = getExportedChainPublicKey({
      chain: key as Chain,
      value: shouldBePresent(vault.chainPublicKeys?.[key as Chain]),
      froztMetadata,
      fromtMetadata,
    })
    if (!uniqueChainKeyShares.has(publicKey)) {
      uniqueChainKeyShares.set(publicKey, value)
    }
  })

  return create(VaultSchema, {
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
      ...Array.from(uniqueChainKeyShares.entries()).map(
        ([publicKey, keyshare]) =>
          create(Vault_KeyShareSchema, {
            publicKey,
            keyshare,
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
    publicKeyFrozt: froztMetadata?.publicKey ?? '',
    publicKeyFromt: fromtMetadata?.publicKey ?? '',
    libType: toLibType(vault.libType),
    chainPublicKeys: [
      ...toEntries(vault.chainPublicKeys ?? {}).map(({ key, value }) => {
        const chain = key as Chain
        return create(Vault_ChainPublicKeySchema, {
          publicKey: getExportedChainPublicKey({
            chain,
            value,
            froztMetadata,
            fromtMetadata,
          }),
          chain: key,
          isEddsa: signatureAlgorithms[getChainKind(chain)] === 'eddsa',
        })
      }),
    ],
  })
}

export const fromCommVault = (vault: CommVault): Vault => {
  const publicKeys = {
    ecdsa: vault.publicKeyEcdsa,
    eddsa: vault.publicKeyEddsa,
  }

  const chainPublicKeys: Partial<Record<Chain, string>> = {}
  const chainsByPublicKey = new Map<string, Chain[]>()
  let saplingExtras: string | undefined

  vault.chainPublicKeys.forEach(cp => {
    if (cp.chain === 'SaplingExtras') {
      saplingExtras = cp.publicKey
      return
    }
    const chain = cp.chain as Chain
    chainPublicKeys[chain] = cp.publicKey
    const chains = chainsByPublicKey.get(cp.publicKey) ?? []
    chains.push(chain)
    chainsByPublicKey.set(cp.publicKey, chains)
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
  const mldsaKeyShare = publicKeyMldsa
    ? vault.keyShares.find(ks => ks.publicKey === publicKeyMldsa)
    : undefined
  const keyShareMldsa = mldsaKeyShare?.keyshare

  const chainKeyShares: Partial<Record<Chain, string>> = {}
  const keyShareByPublicKey = new Map<string, string>()
  vault.keyShares.forEach(keyShare => {
    keyShareByPublicKey.set(keyShare.publicKey, keyShare.keyshare)

    const chains = chainsByPublicKey.get(keyShare.publicKey) ?? []
    chains.forEach(chain => {
      chainKeyShares[chain] = keyShare.keyshare
    })
  })

  const froztKeyShare =
    chainKeyShares[Chain.ZcashSapling] ??
    (vault.publicKeyFrozt
      ? keyShareByPublicKey.get(vault.publicKeyFrozt)
      : undefined)

  if (froztKeyShare) {
    const froztMetadata = getFroztBundleMetadata(froztKeyShare)
    if (froztMetadata) {
      chainPublicKeys[Chain.ZcashSapling] = froztMetadata.pubKeyPackage
      if (!saplingExtras) {
        saplingExtras = froztMetadata.saplingExtras
      }
    }
    chainKeyShares[Chain.ZcashSapling] = froztKeyShare
  }

  const fromtKeyShare =
    chainKeyShares[Chain.Monero] ??
    (vault.publicKeyFromt
      ? keyShareByPublicKey.get(vault.publicKeyFromt)
      : undefined)

  if (fromtKeyShare) {
    const fromtMetadata = getFromtBundleMetadata(fromtKeyShare)
    if (fromtMetadata) {
      chainPublicKeys[Chain.Monero] = fromtMetadata.chainPublicKey
    }
    chainKeyShares[Chain.Monero] = fromtKeyShare
  }

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
    saplingExtras,
    libType: fromLibType(vault.libType),
    isBackedUp: false,
    order: 0,
    lastPasswordVerificationTime: hasServer(vault.signers)
      ? Date.now()
      : undefined,
  }
}
