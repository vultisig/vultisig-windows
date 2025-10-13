import { Chain } from '@core/chain/Chain'

import { cosmosGasLimitRecord } from '../../chains/cosmos/cosmosGasLimitRecord'
import { cosmosGasRecord } from '../../chains/cosmos/gas'
import { getThorNetworkInfo } from '../../chains/cosmos/thor/getThorNetworkInfo'
import { FeeQuoteResolver } from '../resolver'

export const getCosmosFeeQuote: FeeQuoteResolver<'cosmos'> = async ({
  coin: { chain },
}) => {
  if (chain === Chain.THORChain) {
    const { native_tx_fee_rune } = await getThorNetworkInfo()

    return { gas: BigInt(native_tx_fee_rune) }
  }

  if (chain === Chain.MayaChain) {
    return { gas: cosmosGasLimitRecord[chain] }
  }

  return { gas: cosmosGasRecord[chain] }
}
