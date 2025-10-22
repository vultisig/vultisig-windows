import { FeeQuote } from '@core/chain/feeQuote/core'

import { ExtractFeeQuoteByCaseResolver } from '../resolver'

export const extractTronFeeQuote: ExtractFeeQuoteByCaseResolver<
  'tronSpecific'
> = ({ value }): FeeQuote<'tron'> => {
  return {
    gas: BigInt(value.gasEstimation ?? 0),
  }
}
