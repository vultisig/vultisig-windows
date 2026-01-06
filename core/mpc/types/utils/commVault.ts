import { create } from '@bufbuild/protobuf'
import { Timestamp, TimestampSchema } from '@bufbuild/protobuf/wkt'
import { Chain } from '@core/chain/Chain'
import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { Vault, VaultKeyShares } from '@core/mpc/vault/Vault'
import { pick } from '@lib/utils/record/pick'
import { toEntries } from '@lib/utils/record/toEntries'
import { convertDuration } from '@lib/utils/time/convertDuration'

import { hasServer } from '../../devices/localPartyId'
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
    keyShares: [
      ...toEntries(vault.keyShares).map(({ key, value }) =>
        create(Vault_KeyShareSchema, {
          publicKey: key,
          keyshare: value,
        })
      ),
      ...toEntries(vault.chainKeyShares ?? {}).map(({ key, value }) =>
        create(Vault_KeyShareSchema, {
          publicKey: key,
          keyshare: value,
        })
      ),
    ],
    publicKeyEcdsa: vault.publicKeys.ecdsa,
    publicKeyEddsa: vault.publicKeys.eddsa,
    libType: toLibType({
      libType: vault.libType,
      isKeyImport:
        vault.chainPublicKeys !== undefined &&
        Object.keys(vault.chainPublicKeys).length > 0,
    }),
  })

export const fromCommVault = (vault: CommVault): Vault => {
  const publicKeys = {
    ecdsa: vault.publicKeyEcdsa,
    eddsa: vault.publicKeyEddsa,
  }

  const keyShares: VaultKeyShares = {} as any
  const chainKeyShares: Partial<Record<Chain, string>> = {}
  vault.keyShares.forEach(keyShare => {
    if (keyShare.publicKey === 'ecdsa' || keyShare.publicKey === 'eddsa') {
      keyShares[keyShare.publicKey as SignatureAlgorithm] = keyShare.keyshare
    } else {
      chainKeyShares[keyShare.publicKey as Chain] = keyShare.keyshare
    }
  })

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
    chainKeyShares,
    libType: fromLibType(vault.libType),
    isBackedUp: false,
    order: 0,
    lastPasswordVerificationTime: hasServer(vault.signers)
      ? Date.now()
      : undefined,
  }
}
