import { ExtractFeeQuoteResolver } from '../resolver'

export const extractCardanoFeeQuote: ExtractFeeQuoteResolver<'cardano'> = ({
  byteFee,
}) => ({ byteFee })
