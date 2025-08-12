import { OtherChain } from '@core/chain/Chain'
import { getSuiClient } from '@core/chain/chains/sui/client'

import { BroadcastTxResolver } from '../resolver'

export const broadcastSuiTx: BroadcastTxResolver<OtherChain.Sui> = async ({
  tx,
}) =>
  getSuiClient().executeTransactionBlock({
    transactionBlock: tx.unsignedTx,
    signature: [tx.signature],
  })
