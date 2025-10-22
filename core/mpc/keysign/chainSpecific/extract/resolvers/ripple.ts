import { FeeQuote } from '@core/chain/feeQuote/core'

import { ExtractFeeQuoteByCaseResolver } from '../resolver'

export const extractRippleFeeQuote: ExtractFeeQuoteByCaseResolver<
  'rippleSpecific'
> = ({ value }): FeeQuote<'ripple'> => {
  return {
    gas: BigInt(value.gas),
  }
}
