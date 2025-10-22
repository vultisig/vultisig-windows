import { FeeQuote } from '@core/chain/feeQuote/core'

import { ExtractFeeQuoteByCaseResolver } from '../resolver'

export const extractSuiFeeQuote: ExtractFeeQuoteByCaseResolver<
  'suicheSpecific'
> = ({ value }): FeeQuote<'sui'> => {
  return {
    gas: BigInt(value.referenceGasPrice),
  }
}
