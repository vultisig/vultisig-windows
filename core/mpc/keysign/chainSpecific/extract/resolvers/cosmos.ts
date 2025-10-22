import { FeeQuote } from '@core/chain/feeQuote/core'

import { ExtractFeeQuoteByCaseResolver } from '../resolver'

export const extractCosmosFeeQuote: ExtractFeeQuoteByCaseResolver<
  'cosmosSpecific'
> = ({ value }): FeeQuote<'cosmos'> => {
  return {
    gas: BigInt(value.gas),
  }
}
