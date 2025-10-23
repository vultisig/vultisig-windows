import { tonConfig } from '@core/chain/chains/ton/config'

import { ExtractFeeQuoteResolver } from '../resolver'

export const extractTonFeeQuote: ExtractFeeQuoteResolver<
  'tonSpecific'
> = () => ({ gas: tonConfig.fee })
