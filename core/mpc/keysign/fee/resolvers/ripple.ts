import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { GetFeeAmountResolver } from '../resolver'

export const getRippleFeeAmount: GetFeeAmountResolver = ({
  blockchainSpecific,
}) => {
  const { gas } = getBlockchainSpecificValue(
    blockchainSpecific,
    'rippleSpecific'
  )

  return gas
}
