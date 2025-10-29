import { utxoTxSize } from '@core/chain/feeQuote/resolvers/utxo'

import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { GetFeeAmountResolver } from '../resolver'

export const getUtxoFeeAmount: GetFeeAmountResolver = ({
  blockchainSpecific,
}) => {
  const { byteFee } = getBlockchainSpecificValue(
    blockchainSpecific,
    'utxoSpecific'
  )

  return BigInt(byteFee) * utxoTxSize
}
