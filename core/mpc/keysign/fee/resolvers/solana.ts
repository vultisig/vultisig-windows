import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { GetFeeAmountResolver } from '../resolver'

export const getSolanaFeeAmount: GetFeeAmountResolver = ({
  blockchainSpecific,
}) => {
  const { priorityFee } = getBlockchainSpecificValue(
    blockchainSpecific,
    'solanaSpecific'
  )

  return BigInt(priorityFee)
}
