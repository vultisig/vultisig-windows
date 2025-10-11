import { getTronBlockInfo } from '@core/chain/chains/tron/getTronBlockInfo'

import { FeeQuoteResolver } from '../resolver'

export const getTronFeeQuote: FeeQuoteResolver<'tron'> = async ({ coin }) => {
  const { gasFeeEstimation } = await getTronBlockInfo(coin)

  return { gas: BigInt(gasFeeEstimation) }
}
