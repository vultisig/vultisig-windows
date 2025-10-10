import { cardanoDefaultFee } from '@core/chain/chains/cardano/config'

import { FeeQuoteResolver } from '../resolver'

export const getCardanoFeeQuote: FeeQuoteResolver<'cardano'> = async () => ({
  byteFee: BigInt(cardanoDefaultFee),
})
