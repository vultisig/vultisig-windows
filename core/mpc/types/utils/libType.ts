import { MpcLib } from '@core/mpc/mpcLib'
import { LibType } from '@core/mpc/types/vultisig/keygen/v1/lib_type_message_pb'
import { mirrorRecord } from '@lib/utils/record/mirrorRecord'

const mpcLibToLibType: Record<MpcLib, LibType> = {
  GG20: LibType.GG20,
  DKLS: LibType.DKLS,
}

export const fromLibType = (libType: LibType): MpcLib => {
  return mirrorRecord(mpcLibToLibType)[libType]
}

export const toLibType = (mpcLib: MpcLib): LibType => {
  return mpcLibToLibType[mpcLib]
}
