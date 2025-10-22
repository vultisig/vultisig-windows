import { FeeQuote } from '@core/chain/feeQuote/core'

import { ExtractFeeQuoteByCaseResolver } from '../resolver'

export const extractEvmFeeQuote: ExtractFeeQuoteByCaseResolver<
  'ethereumSpecific'
> = ({ value }): FeeQuote<'evm'> => {
  const baseFeePerGas =
    BigInt(value.maxFeePerGasWei) - BigInt(value.priorityFee)
  return {
    baseFeePerGas,
    maxPriorityFeePerGas: BigInt(value.priorityFee),
    gasLimit: BigInt(value.gasLimit),
  }
}
