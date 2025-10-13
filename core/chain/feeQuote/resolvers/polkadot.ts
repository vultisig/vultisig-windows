import { polkadotConfig } from '@core/chain/chains/polkadot/config'

import { FeeQuoteResolver } from '../resolver'

export const getPolkadotFeeQuote: FeeQuoteResolver<'polkadot'> = async () => {
  return { gas: polkadotConfig.fee }
}
