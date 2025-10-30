import { ExtractFeeQuoteResolver } from '../resolver'

export const extractSuiFeeQuote: ExtractFeeQuoteResolver<'suicheSpecific'> = ({
  referenceGasPrice,
  gasBudget,
}) => ({
  referenceGasPrice: BigInt(referenceGasPrice),
  gasBudget: BigInt(gasBudget),
})
