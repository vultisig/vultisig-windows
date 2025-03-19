import { create } from '@bufbuild/protobuf'
import { getRippleAccountInfo } from '@core/chain/chains/ripple/account/getRippleAccountInfo'
import { rippleTxFee } from '@core/chain/tx/fee/ripple'
import {
  RippleSpecific,
  RippleSpecificSchema,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { ChainSpecificResolver } from './ChainSpecificResolver'

export const getRippleSpecific: ChainSpecificResolver<RippleSpecific> = async ({
  coin,
}) => {
  const { Sequence } = await getRippleAccountInfo(coin.address)

  return create(RippleSpecificSchema, {
    sequence: BigInt(Sequence),
    gas: BigInt(rippleTxFee),
  })
}
