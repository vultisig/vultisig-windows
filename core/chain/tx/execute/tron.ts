import { OtherChain } from '@core/chain/Chain'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { bytesToHex } from 'viem'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeTronTx: ExecuteTxResolver<OtherChain.Tron> = async ({
  tx,
  skipBroadcast,
}) => {
  if (skipBroadcast) return { txHash: bytesToHex(tx.id) }
  const rawTx = tx.json

  const txid = await broadcastTransaction(rawTx)

  return { txHash: txid }
}

async function broadcastTransaction(jsonString: string): Promise<string> {
  const url = 'https://tron-rpc.publicnode.com/wallet/broadcasttransaction'

  const { txid } = await queryUrl<{ txid: string }>(url, {
    body: jsonString,
  })

  return txid
}
