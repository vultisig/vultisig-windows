import { create } from '@bufbuild/protobuf'
import { Timestamp, TimestampSchema } from '@bufbuild/protobuf/wkt'
import { signingAlgorithms } from '@core/chain/signing/SignatureAlgorithm'
import { Vault } from '@core/ui/vault/Vault'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { pick } from '@lib/utils/record/pick'
import { recordFromKeys } from '@lib/utils/record/recordFromKeys'
import { toEntries } from '@lib/utils/record/toEntries'
import { convertDuration } from '@lib/utils/time/convertDuration'

import {
  Vault as CommVault,
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
    keyShares: toEntries(vault.keyShares).map(({ key, value }) =>
      create(Vault_KeyShareSchema, {
        publicKey: vault.publicKeys[key],
        keyshare: value,
      })
    ),
    publicKeyEcdsa: vault.publicKeys.ecdsa,
    publicKeyEddsa: vault.publicKeys.eddsa,
    libType: toLibType(vault.libType),
  })

export const fromCommVault = (vault: CommVault): Vault => {
  const publicKeys = {
    ecdsa: vault.publicKeyEcdsa,
    eddsa: vault.publicKeyEddsa,
  }

  const keyShares = recordFromKeys(
    signingAlgorithms,
    algorithm =>
      shouldBePresent(
        vault.keyShares.find(
          keyShare => keyShare.publicKey === publicKeys[algorithm]
        )
      ).keyshare
  )

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
    libType: fromLibType(vault.libType),
    isBackedUp: false,
    order: 0,
  }
}
