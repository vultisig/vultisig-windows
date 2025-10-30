import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { GetFeeAmountResolver } from '../resolver'

export const getEvmFeeAmount: GetFeeAmountResolver<'evm'> = ({
  keysignPayload,
}) => {
  const { maxFeePerGasWei, gasLimit } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'ethereumSpecific'
  )

  return BigInt(maxFeePerGasWei) * BigInt(gasLimit)
}
