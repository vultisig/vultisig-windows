import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { GetFeeAmountResolver } from '../resolver'

export const getRippleFeeAmount: GetFeeAmountResolver = ({
  keysignPayload,
}) => {
  const { gas } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'rippleSpecific'
  )

  return gas
}
