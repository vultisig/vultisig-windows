import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { GetFeeAmountResolver } from '../resolver'

export const getSuiFeeAmount: GetFeeAmountResolver = ({
  blockchainSpecific,
}) => {
  const { gasBudget } = getBlockchainSpecificValue(
    blockchainSpecific,
    'suicheSpecific'
  )

  return BigInt(gasBudget)
}
