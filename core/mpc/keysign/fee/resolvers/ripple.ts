import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { GetFeeAmountResolver } from '../resolver'

export const getRippleFeeAmount: GetFeeAmountResolver<'ripple'> = ({
  keysignPayload,
}) => {
  const { gas } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'rippleSpecific'
  )

  return gas
}
