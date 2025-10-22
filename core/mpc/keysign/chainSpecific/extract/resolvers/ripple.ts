import { ExtractFeeQuoteResolver } from '../resolver'

export const extractRippleFeeQuote: ExtractFeeQuoteResolver<
  'rippleSpecific'
> = ({ gas }) => ({ gas })
