import { UtxoChain } from '@core/chain/Chain'

import { TxHashResolver } from '../resolver'

export const getUtxoTxHash: TxHashResolver<UtxoChain> = ({
  transactionId,
  signingResultV2,
}) => {
  if (signingResultV2 && signingResultV2.txid) {
    return Buffer.from(signingResultV2.txid).reverse().toString('hex')
  }
  return transactionId
}
