import { UtxoChain } from '@core/chain/Chain'

import { TxHashResolver } from '../resolver'

export const getUtxoTxHash: TxHashResolver<UtxoChain> = ({ transactionId }) =>
  transactionId
