import { FeeQuote } from '@core/chain/feeQuote/core'

import { ExtractFeeQuoteByCaseResolver } from '../resolver'

export const extractCardanoFeeQuote: ExtractFeeQuoteByCaseResolver<
  'cardano'
> = ({ value }): FeeQuote<'cardano'> => {
  return {
    byteFee: BigInt(value.byteFee),
  }
}
