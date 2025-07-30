import { UtxoChain } from '@core/chain/Chain'
import { broadcastUtxoTransaction } from '@core/chain/chains/utxo/client/broadcastUtxoTransaction'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeUtxoTx: ExecuteTxResolver<UtxoChain> = async ({
  tx,
  walletCore,
  chain,
  skipBroadcast,
}) => {
  if (!skipBroadcast) {
    await broadcastUtxoTransaction({
      chain,
      tx: stripHexPrefix(walletCore.HexCoding.encode(tx.encoded)),
    })
  }
  return { txHash: tx.transactionId }
}
