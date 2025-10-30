import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { GetFeeAmountResolver } from '../resolver'

export const getCardanoFeeAmount: GetFeeAmountResolver<'cardano'> = ({
  keysignPayload,
}) => {
  const { byteFee } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'cardano'
  )

  return byteFee
}
