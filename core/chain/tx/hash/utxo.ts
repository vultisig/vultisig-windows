import { UtxoChain } from '@core/chain/Chain'

import { GetTxHashResolver } from './GetTxHashResolver'

export const getUtxoTxHash: GetTxHashResolver<UtxoChain> = ({
  transactionId,
}) => transactionId
