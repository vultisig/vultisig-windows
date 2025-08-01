import { OtherChain } from '@core/chain/Chain'
import { getSuiClient } from '@core/chain/chains/sui/client'

import { BroadcastTxResolver } from './BroadcastTxResolver'

export const broadcastSuiTx: BroadcastTxResolver<OtherChain.Sui> = async ({
  tx,
}) =>
  getSuiClient().executeTransactionBlock({
    transactionBlock: tx.unsignedTx,
    signature: [tx.signature],
  })
