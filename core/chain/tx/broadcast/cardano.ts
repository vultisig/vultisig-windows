import { OtherChain } from '@core/chain/Chain'
import { broadcastUtxoTransaction } from '@core/chain/chains/utxo/client/broadcastUtxoTransaction'

import { BroadcastTxResolver } from './BroadcastTxResolver'

export const broadcastCardanoTx: BroadcastTxResolver<
  OtherChain.Cardano
> = async ({ tx, chain }) =>
  broadcastUtxoTransaction({
    chain,
    tx: Buffer.from(tx.encoded).toString('hex'),
  })
