import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { GetFeeAmountResolver } from '../resolver'

export const getTronFeeAmount: GetFeeAmountResolver = ({ keysignPayload }) => {
  const { gasEstimation } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'tronSpecific'
  )

  return gasEstimation
}
