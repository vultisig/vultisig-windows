import { polkadotConfig } from '@core/chain/chains/polkadot/config'

import { ExtractFeeQuoteResolver } from '../resolver'

export const extractPolkadotFeeQuote: ExtractFeeQuoteResolver<
  'polkadotSpecific'
> = ({ gas }) => ({
  gas: gas || polkadotConfig.fee,
})
