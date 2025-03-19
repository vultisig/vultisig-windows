import { create } from '@bufbuild/protobuf'
import { getTonAccountInfo } from '@core/chain/chains/ton/account/getTonAccountInfo'
import {
  TonSpecific,
  TonSpecificSchema,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { ChainSpecificResolver } from './ChainSpecificResolver'

export const getTonSpecific: ChainSpecificResolver<TonSpecific> = async ({
  coin,
}) => {
  const { account_state } = await getTonAccountInfo(coin.address)
  const sequenceNumber = BigInt(account_state.seqno || 0)

  return create(TonSpecificSchema, {
    sequenceNumber,
    expireAt: BigInt(Math.floor(Date.now() / 1000) + 600),
    bounceable: false,
  })
}
