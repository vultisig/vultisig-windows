import { signingAlgorithms } from '@vultisig/core-chain/signing/SignatureAlgorithm'
import { MpcLib } from '@vultisig/core-mpc/mpcLib'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { recordFromKeys } from '@vultisig/lib-utils/record/recordFromKeys'
import { convertDuration } from '@vultisig/lib-utils/time/convertDuration'

export type DatBackup = {
  name: string
  pubKeyECDSA: string
  signers: string[]
  keyshares: DatBackupKeyshare[]
  createdAt: number
  pubKeyEdDSA: string
  hexChainCode: string
  localPartyID: string
  libType: MpcLib
}

type DatBackupKeyshare = {
  pubkey: string
  keyshare: string
}

export const fromDatBackup = (backup: DatBackup): Vault => {
  const publicKeys = {
    ecdsa: backup.pubKeyECDSA,
    eddsa: backup.pubKeyEdDSA,
  }

  const keyShares = recordFromKeys(signingAlgorithms, algorithm => {
    const publicKey = publicKeys[algorithm]
    if (!publicKey) return ''
    return shouldBePresent(
      backup.keyshares.find(keyShare => keyShare.pubkey === publicKey)
    ).keyshare
  })

  return {
    name: backup.name,
    publicKeys,
    signers: backup.signers,
    createdAt: backup.createdAt
      ? convertDuration(backup.createdAt, 's', 'ms')
      : undefined,
    hexChainCode: backup.hexChainCode,
    localPartyId: backup.localPartyID,
    keyShares,
    libType: backup.libType,
    isBackedUp: true,
    order: 0,
  }
}
