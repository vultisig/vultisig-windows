import { UtxoChain } from '@core/chain/Chain'
import { broadcastUtxoTransaction } from '@core/chain/chains/utxo/client/broadcastUtxoTransaction'

import { BroadcastTxResolver } from './BroadcastTxResolver'

export const broadcastUtxoTx: BroadcastTxResolver<UtxoChain> = async ({
  chain,
  tx,
}) =>
  broadcastUtxoTransaction({
    chain,
    tx: Buffer.from(tx.encoded).toString('hex'),
  })
