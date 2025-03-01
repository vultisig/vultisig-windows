import { OtherChain } from '@core/chain/Chain'
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'
import { TW } from '@trustwallet/wallet-core'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeTronTx: ExecuteTxResolver<OtherChain> = async ({
  chain, // eslint-disable-line @typescript-eslint/no-unused-vars
  walletCore, // eslint-disable-line @typescript-eslint/no-unused-vars
  compiledTx,
}) => {
  const output = TW.Tron.Proto.SigningOutput.decode(compiledTx)

  assertErrorMessage(output.errorMessage)

  const rawTx = output.json

  const txid = await broadcastTransaction(rawTx)

  return txid
}

async function broadcastTransaction(jsonString: string): Promise<string> {
  const url = 'https://tron-rpc.publicnode.com/wallet/broadcasttransaction'

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: jsonString,
  })

  if (!response.ok) {
    const responseText = await response.text()
    throw new Error(
      `status code:${response.status}, ${responseText || 'Unknown error'}`
    )
  }

  const data = await response.json()

  if (data.txid) {
    return data.txid
  }

  throw new Error(JSON.stringify(data) || 'Unknown error')
}
