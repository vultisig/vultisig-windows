import { OtherChain } from '@core/chain/Chain'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { tronRpcUrl } from '../../../chains/tron/config'
import { BroadcastTxResolver } from '../resolver'

export const broadcastTronTx: BroadcastTxResolver<OtherChain.Tron> = async ({
  tx,
}) =>
  queryUrl<{ txid: string }>(`${tronRpcUrl}/wallet/broadcasttransaction`, {
    body: tx.json,
  })
