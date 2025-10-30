import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { GetFeeAmountResolver } from '../resolver'

export const getSolanaFeeAmount: GetFeeAmountResolver = ({
  keysignPayload,
  publicKey: _publicKey,
}) => {
  const { priorityFee } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'solanaSpecific'
  )

  return BigInt(priorityFee)
}
