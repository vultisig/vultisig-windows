import { Chain } from '@core/chain/Chain'
import { MpcLib } from '@core/mpc/mpcLib'
import { LibType } from '@core/mpc/types/vultisig/keygen/v1/lib_type_message_pb'
import { mirrorRecord } from '@lib/utils/record/mirrorRecord'

const mpcLibToLibType: Record<MpcLib, LibType> = {
  GG20: LibType.GG20,
  DKLS: LibType.DKLS,
}

export const fromLibType = (libType: LibType): MpcLib => {
  if (libType === LibType.KEYIMPORT) {
    return 'DKLS'
  }
  return mirrorRecord(mpcLibToLibType)[libType]
}

type ToLibTypeInput = {
  libType: MpcLib
  chainPublicKeys?: Partial<Record<Chain, string>>
  isKeyImport?: boolean
}

export const toLibType = ({
  libType,
  chainPublicKeys,
  isKeyImport,
}: ToLibTypeInput): LibType => {
  if (
    isKeyImport ||
    (chainPublicKeys && Object.keys(chainPublicKeys).length > 0)
  ) {
    return LibType.KEYIMPORT
  }
  return mpcLibToLibType[libType]
}
