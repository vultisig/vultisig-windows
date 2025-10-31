import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { FeeAmountResolver } from '../resolver'

export const getCardanoFeeAmount: FeeAmountResolver = ({ keysignPayload }) => {
  const { byteFee } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'cardano'
  )

  return byteFee
}
