import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { FeeAmountResolver } from '../resolver'

export const getSolanaFeeAmount: FeeAmountResolver = ({ keysignPayload }) => {
  const { priorityFee } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'solanaSpecific'
  )

  return BigInt(priorityFee)
}
