import { FeeQuote } from '@core/chain/feeQuote/core'

import { ExtractFeeQuoteResolver } from '../resolver'

export const extractEvmFeeQuote: ExtractFeeQuoteResolver<
  'ethereumSpecific'
> = ({ maxFeePerGasWei, priorityFee, gasLimit }): FeeQuote<'evm'> => ({
  baseFeePerGas: BigInt(maxFeePerGasWei) - BigInt(priorityFee),
  maxPriorityFeePerGas: BigInt(priorityFee),
  gasLimit: BigInt(gasLimit),
})
