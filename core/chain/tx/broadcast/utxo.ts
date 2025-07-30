import { UtxoChain } from '@core/chain/Chain'
import { broadcastUtxoTransaction } from '@core/chain/chains/utxo/client/broadcastUtxoTransaction'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'

import { BroadcastTxResolver } from './BroadcastTxResolver'

export const broadcastUtxoTx: BroadcastTxResolver<UtxoChain> = async ({
  walletCore,
  chain,
  tx,
}) =>
  broadcastUtxoTransaction({
    chain,
    tx: stripHexPrefix(walletCore.HexCoding.encode(tx.encoded)),
  })
