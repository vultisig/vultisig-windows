import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { GetFeeAmountResolver } from '../resolver'

export const getCardanoFeeAmount: GetFeeAmountResolver = ({
  blockchainSpecific,
}) => {
  const { byteFee } = getBlockchainSpecificValue(blockchainSpecific, 'cardano')

  return byteFee
}
