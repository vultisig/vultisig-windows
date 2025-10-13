import { create } from '@bufbuild/protobuf'
import { EthereumSpecificSchema } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { BuildChainSpecificResolver } from '../resolver'

export const buildEthereumSpecific: BuildChainSpecificResolver<
  'ethereumSpecific'
> = ({
  feeQuote: { baseFeePerGas, maxPriorityFeePerGas, gasLimit },
  txData,
}) => {
  const maxFeePerGas = baseFeePerGas + maxPriorityFeePerGas

  return create(EthereumSpecificSchema, {
    ...txData,
    maxFeePerGasWei: maxFeePerGas.toString(),
    priorityFee: maxPriorityFeePerGas.toString(),
    gasLimit: gasLimit.toString(),
  })
}
