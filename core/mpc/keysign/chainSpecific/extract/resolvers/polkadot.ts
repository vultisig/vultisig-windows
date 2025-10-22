import { FeeQuote } from '@core/chain/feeQuote/core'

import { ExtractFeeQuoteByCaseResolver } from '../resolver'

export const extractPolkadotFeeQuote: ExtractFeeQuoteByCaseResolver<
  'polkadotSpecific'
> = (): FeeQuote<'polkadot'> => {
  return {
    gas: BigInt(0),
  }
}
