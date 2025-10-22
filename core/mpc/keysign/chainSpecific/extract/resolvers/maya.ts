import { FeeQuote } from '@core/chain/feeQuote/core'

import { ExtractFeeQuoteByCaseResolver } from '../resolver'

export const extractMayaFeeQuote: ExtractFeeQuoteByCaseResolver<
  'mayaSpecific'
> = (): FeeQuote<'cosmos'> => {
  return {
    gas: BigInt(0),
  }
}
