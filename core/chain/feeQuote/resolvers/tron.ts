import { getTronBlockInfo } from '@core/chain/chains/tron/getTronBlockInfo'

import { FeeQuoteResolver } from '../resolver'

export const getTronFeeQuote: FeeQuoteResolver<'tron'> = async ({
  coin,
  thirdPartyGasLimitEstimation,
}) => {
  return {
    gas:
      thirdPartyGasLimitEstimation ||
      BigInt((await getTronBlockInfo({ coin })).gasFeeEstimation),
  }
}
