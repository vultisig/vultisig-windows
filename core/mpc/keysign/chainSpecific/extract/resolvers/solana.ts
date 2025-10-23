import { ExtractFeeQuoteResolver } from '../resolver'

export const extractSolanaFeeQuote: ExtractFeeQuoteResolver<
  'solanaSpecific'
> = ({ priorityFee }) => ({ priorityFee: BigInt(priorityFee) })
