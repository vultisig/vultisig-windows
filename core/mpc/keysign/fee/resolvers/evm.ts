import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { FeeAmountResolver } from '../resolver'

export const getEvmFeeAmount: FeeAmountResolver = ({ keysignPayload }) => {
  const { maxFeePerGasWei, gasLimit } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'ethereumSpecific'
  )

  return BigInt(maxFeePerGasWei) * BigInt(gasLimit)
}
