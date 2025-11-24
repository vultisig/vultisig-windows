import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { FeeAmountResolver } from '../resolver'

export const getRippleFeeAmount: FeeAmountResolver = ({ keysignPayload }) => {
  const { gas } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'rippleSpecific'
  )

  return gas
}
