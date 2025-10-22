import { FeeQuote } from '@core/chain/feeQuote/core'

import { ExtractFeeQuoteByCaseResolver } from '../resolver'

export const extractSolanaFeeQuote: ExtractFeeQuoteByCaseResolver<
  'solanaSpecific'
> = ({ value }): FeeQuote<'solana'> => {
  return {
    priorityFee: BigInt(value.priorityFee),
  }
}
