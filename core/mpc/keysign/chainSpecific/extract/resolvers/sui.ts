import { ExtractFeeQuoteResolver } from '../resolver'

export const extractSuiFeeQuote: ExtractFeeQuoteResolver<'suicheSpecific'> = ({
  referenceGasPrice,
}) => ({ gas: BigInt(referenceGasPrice) })
