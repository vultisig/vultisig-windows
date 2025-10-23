import { ExtractFeeQuoteResolver } from '../resolver'

export const extractThorchainFeeQuote: ExtractFeeQuoteResolver<
  'thorchainSpecific'
> = ({ fee }) => ({ gas: fee })
