import { KeysignLibType, MpcLib } from '@core/mpc/mpcLib'
import { LibType } from '@core/mpc/types/vultisig/keygen/v1/lib_type_message_pb'
import { isKeyImportVault, Vault } from '@core/mpc/vault/Vault'
import { mirrorRecord } from '@lib/utils/record/mirrorRecord'

const mpcLibToLibType: Record<MpcLib, LibType> = {
  GG20: LibType.GG20,
  DKLS: LibType.DKLS,
}

const libTypeToKeysignLibType: Record<LibType, KeysignLibType> = {
  [LibType.GG20]: 'GG20',
  [LibType.DKLS]: 'DKLS',
  [LibType.KEYIMPORT]: 'KeyImport',
}

export const fromLibType = (libType: LibType): MpcLib => {
  if (libType === LibType.KEYIMPORT) {
    return 'DKLS'
  }
  return mirrorRecord(mpcLibToLibType)[libType]
}

type ToLibTypeInput = {
  libType: MpcLib
  isKeyImport?: boolean
}

export const toLibType = ({
  libType,
  isKeyImport,
}: ToLibTypeInput): LibType => {
  if (isKeyImport) {
    return LibType.KEYIMPORT
  }
  return mpcLibToLibType[libType]
}

export const toKeysignLibType = (vault: Vault): KeysignLibType => {
  const libType = toLibType({
    libType: vault.libType,
    isKeyImport: isKeyImportVault(vault),
  })
  return libTypeToKeysignLibType[libType]
}
