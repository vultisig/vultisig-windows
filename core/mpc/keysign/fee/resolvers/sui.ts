import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { GetFeeAmountResolver } from '../resolver'

export const getSuiFeeAmount: GetFeeAmountResolver = ({ keysignPayload }) => {
  const { gasBudget } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'suicheSpecific'
  )

  return BigInt(gasBudget)
}
