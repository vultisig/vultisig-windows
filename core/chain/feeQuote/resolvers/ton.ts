import { tonConfig } from '@core/chain/chains/ton/config'

import { FeeQuoteResolver } from '../resolver'

export const getTonFeeQuote: FeeQuoteResolver<'ton'> = async () => {
  return { gas: tonConfig.fee }
}
