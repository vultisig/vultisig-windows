import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { GetFeeAmountResolver } from '../resolver'

export const getSolanaFeeAmount: GetFeeAmountResolver<'solana'> = ({
  keysignPayload,
}) => {
  const { priorityFee } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'solanaSpecific'
  )

  return BigInt(priorityFee)
}
