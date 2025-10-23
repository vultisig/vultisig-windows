import { ExtractFeeQuoteResolver } from '../resolver'

export const extractCosmosFeeQuote: ExtractFeeQuoteResolver<
  'cosmosSpecific'
> = ({ gas }) => ({ gas })
