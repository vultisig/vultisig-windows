import { OtherChain } from '@core/chain/Chain'
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { TW } from '@trustwallet/wallet-core'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeTronTx: ExecuteTxResolver<OtherChain> = async ({
  compiledTx,
}) => {
  const output = TW.Tron.Proto.SigningOutput.decode(compiledTx)

  assertErrorMessage(output.errorMessage)

  const rawTx = output.json

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
