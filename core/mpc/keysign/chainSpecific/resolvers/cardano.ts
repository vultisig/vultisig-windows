import { create } from '@bufbuild/protobuf'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { getCardanoCurrentSlot } from '@core/chain/chains/cardano/client/currentSlot'
import {
  cardanoDefaultFee,
  cardanoSlotOffset,
} from '@core/chain/chains/cardano/config'
import { getCoinBalance } from '@core/chain/coin/balance'
import {
  CardanoChainSpecific,
  CardanoChainSpecificSchema,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { ChainSpecificResolver } from '../resolver'

export const getCardanoSpecific: ChainSpecificResolver<
  CardanoChainSpecific
> = async ({ coin, amount }) => {
  const currentSlot = await getCardanoCurrentSlot()
  const ttl = currentSlot + BigInt(cardanoSlotOffset)

  const result = create(CardanoChainSpecificSchema, {
    byteFee: BigInt(cardanoDefaultFee),
    ttl,
  })

  if (amount) {
    const balance = await getCoinBalance(coin)
    const requested = toChainAmount(amount, coin.decimals)
    result.sendMaxAmount = balance === requested
  }

  return result
}
