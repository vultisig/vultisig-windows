import { MpcLib } from '@core/mpc/mpcLib'
import { LibType } from '@core/mpc/types/vultisig/keygen/v1/lib_type_message_pb'
import { Vault } from '@core/mpc/vault/Vault'
import { mirrorRecord } from '@lib/utils/record/mirrorRecord'

const mpcLibToLibType: Record<MpcLib, LibType> = {
  GG20: LibType.GG20,
  DKLS: LibType.DKLS,
  KeyImport: LibType.KEYIMPORT,
}

const libTypeToMpcLib: Record<LibType, MpcLib> = mirrorRecord(mpcLibToLibType)

export const fromLibType = (libType: LibType): MpcLib =>
  libTypeToMpcLib[libType]

export const toLibType = (libType: MpcLib): LibType => mpcLibToLibType[libType]

export const toKeysignLibType = (vault: Vault): MpcLib => vault.libType
