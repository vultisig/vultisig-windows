import { cardanoDefaultFee } from '@core/chain/chains/cardano/config'

import { FeeQuoteResolver } from '../resolver'

export const getCardanoFeeQuote: FeeQuoteResolver<'cardano'> = async () => {
  return { byteFee: BigInt(cardanoDefaultFee), byteFeeMultiplier: 1 }
}
