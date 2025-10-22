import { FeeQuote } from '@core/chain/feeQuote/core'

import { ExtractFeeQuoteByCaseResolver } from '../resolver'

export const extractTonFeeQuote: ExtractFeeQuoteByCaseResolver<
  'tonSpecific'
> = (): FeeQuote<'ton'> => {
  return {
    gas: BigInt(0),
  }
}
