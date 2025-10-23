import { ExtractFeeQuoteResolver } from '../resolver'

export const extractTronFeeQuote: ExtractFeeQuoteResolver<'tronSpecific'> = ({
  gasEstimation,
}) => ({ gas: gasEstimation })
