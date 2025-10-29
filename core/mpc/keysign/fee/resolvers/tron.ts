import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { GetFeeAmountResolver } from '../resolver'

export const getTronFeeAmount: GetFeeAmountResolver = ({
  blockchainSpecific,
}) => {
  const { gasEstimation } = getBlockchainSpecificValue(
    blockchainSpecific,
    'tronSpecific'
  )

  return gasEstimation
}
