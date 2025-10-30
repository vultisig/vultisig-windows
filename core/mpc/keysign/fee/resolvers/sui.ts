import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { FeeAmountResolver } from '../resolver'

export const getSuiFeeAmount: FeeAmountResolver = ({ keysignPayload }) => {
  const { gasBudget } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'suicheSpecific'
  )

  return BigInt(gasBudget)
}
