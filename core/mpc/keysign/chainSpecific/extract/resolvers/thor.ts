import { FeeQuote } from '@core/chain/feeQuote/core'

import { ExtractFeeQuoteByCaseResolver } from '../resolver'

export const extractThorchainFeeQuote: ExtractFeeQuoteByCaseResolver<
  'thorchainSpecific'
> = ({ value }): FeeQuote<'cosmos'> => {
  return {
    gas: BigInt(value.fee),
  }
}
