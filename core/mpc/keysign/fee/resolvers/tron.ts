import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { FeeAmountResolver } from '../resolver'

export const getTronFeeAmount: FeeAmountResolver = ({ keysignPayload }) => {
  const { gasEstimation } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'tronSpecific'
  )

  return gasEstimation
}
