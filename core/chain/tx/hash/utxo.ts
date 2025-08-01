import { UtxoChain } from '@core/chain/Chain'

import { TxHashResolver } from './TxHashResolver'

export const getUtxoTxHash: TxHashResolver<UtxoChain> = ({ transactionId }) =>
  transactionId
