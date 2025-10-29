import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { GetFeeAmountResolver } from '../resolver'

export const getEvmFeeAmount: GetFeeAmountResolver = ({
  blockchainSpecific,
}) => {
  const { maxFeePerGasWei, gasLimit } = getBlockchainSpecificValue(
    blockchainSpecific,
    'ethereumSpecific'
  )

  return BigInt(maxFeePerGasWei) * BigInt(gasLimit)
}
