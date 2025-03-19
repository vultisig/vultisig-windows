import { create } from '@bufbuild/protobuf'
import { Timestamp, TimestampSchema } from '@bufbuild/protobuf/wkt'
import { defaultMpcLib, MpcLib } from '@core/mpc/mpcLib'
import { toLibType } from '@core/mpc/types/utils/libType'
import {
  Vault_KeyShareSchema,
  VaultSchema,
} from '@core/mpc/types/vultisig/vault/v1/vault_pb'
import { convertDuration } from '@lib/utils/time/convertDuration'

import { storage } from '../../../../wailsjs/go/models'
import { toStorageVault } from '../../utils/storageVault'
export type DatBackup = {
  name: string
  pubKeyECDSA: string
  signers: string[]
  keyshares: DatBackupKeyshare[]
  createdAt: number
  pubKeyEdDSA: string
  hexChainCode: string
  localPartyID: string
  libType?: MpcLib
}

type DatBackupKeyshare = {
  pubkey: string
  keyshare: string
}

const secondsTimestamptToProtoTimestamp = (seconds: number): Timestamp =>
  create(TimestampSchema, {
    seconds: BigInt(Math.floor(seconds)),
    nanos: Math.floor(convertDuration(seconds % 1, 's', 'ns')),
  })

export const fromDatBackup = (backup: DatBackup): storage.Vault => {
  const keyShares = backup.keyshares.map(({ pubkey, keyshare }) =>
    create(Vault_KeyShareSchema, {
      publicKey: pubkey,
      keyshare,
    })
  )

  const vault = create(VaultSchema, {
    name: backup.name,
    publicKeyEcdsa: backup.pubKeyECDSA,
    publicKeyEddsa: backup.pubKeyEdDSA,
    signers: backup.signers,
    createdAt: secondsTimestamptToProtoTimestamp(backup.createdAt),
    hexChainCode: backup.hexChainCode,
    localPartyId: backup.localPartyID,
    keyShares,
    libType: toLibType(backup.libType ?? defaultMpcLib),
  })

  return toStorageVault(vault)
}
