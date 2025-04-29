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
  const rippleAccount = await getRippleAccountInfo(coin.address)

  return create(RippleSpecificSchema, {
    sequence: BigInt(rippleAccount.account_data.Sequence),
    gas: BigInt(rippleTxFee),
    lastLedgerSequence: BigInt((rippleAccount.ledger_current_index ?? 0) + 60),
  })
}
