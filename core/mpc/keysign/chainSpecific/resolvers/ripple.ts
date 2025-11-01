import { create } from '@bufbuild/protobuf'
import { getRippleAccountInfo } from '@core/chain/chains/ripple/account/info'
import { rippleTxFee } from '@core/chain/tx/fee/ripple'
import { RippleSpecificSchema } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { getKeysignCoin } from '../../utils/getKeysignCoin'
import { GetChainSpecificResolver } from '../resolver'

export const getRippleChainSpecific: GetChainSpecificResolver<
  'rippleSpecific'
> = async ({ keysignPayload }) => {
  const { address } = getKeysignCoin(keysignPayload)

  const { account_data, ledger_current_index } =
    await getRippleAccountInfo(address)

  return create(RippleSpecificSchema, {
    sequence: BigInt(account_data.Sequence),
    lastLedgerSequence: BigInt((ledger_current_index ?? 0) + 60),
    gas: rippleTxFee,
  })
}
