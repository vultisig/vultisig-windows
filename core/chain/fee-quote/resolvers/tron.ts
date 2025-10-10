import { getTronBlockInfo } from '@core/chain/chains/tron/getTronBlockInfo'

import { FeeQuoteResolver } from '../resolver'

export const getTronFeeQuote: FeeQuoteResolver<'tron'> = async ({ coin }) => {
  const blockInfo = await getTronBlockInfo(coin)
  return { gas: BigInt(blockInfo.gasFeeEstimation) }
}
