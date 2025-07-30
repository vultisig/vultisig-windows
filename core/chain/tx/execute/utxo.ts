import { UtxoChain } from '@core/chain/Chain'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeUtxoTx: ExecuteTxResolver<UtxoChain> = async ({ tx }) => {
  return { txHash: tx.transactionId }
}
