import { Serialization } from '@cardano-sdk/core'
import { Chain, OtherChain } from '@core/chain/Chain'

import { broadcastUtxoTransaction } from '../../chains/utxo/client/broadcastUtxoTransaction'
import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeCardanoTx: ExecuteTxResolver<OtherChain.Cardano> = async ({
  tx,
  skipBroadcast,
}) => {
  if (skipBroadcast) return { txHash: tx.txId }
  const rawTx = Buffer.from(tx.encoded).toString('hex')

  await broadcastUtxoTransaction({ chain: Chain.Cardano, tx: rawTx })

  const txHash = Serialization.Transaction.fromCbor(
    Serialization.TxCBOR(rawTx)
  ).getId()

  return { txHash }
}
