import { Chain } from '@core/chain/Chain'
import { cosmosGasLimitRecord } from '@core/chain/chains/cosmos/cosmosGasLimitRecord'

import { getThorNetworkInfo } from '../../chains/cosmos/thor/getThorNetworkInfo'
import { FeeQuoteResolver } from '../resolver'

export const getCosmosFeeQuote: FeeQuoteResolver<'cosmos'> = async ({
  coin,
}) => {
  if (coin.chain === Chain.THORChain) {
    const { native_tx_fee_rune } = await getThorNetworkInfo()

    return { gas: BigInt(native_tx_fee_rune) }
  }
  return { gas: cosmosGasLimitRecord[coin.chain] }
}
