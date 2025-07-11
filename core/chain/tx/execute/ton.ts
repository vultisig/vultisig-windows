import { rootApiUrl } from '@core/config'
import { attempt } from '@lib/utils/attempt'
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'
import { isInError } from '@lib/utils/error/isInError'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { TW } from '@trustwallet/wallet-core'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeTonTx: ExecuteTxResolver = async ({ compiledTx }) => {
  const output = TW.TheOpenNetwork.Proto.SigningOutput.decode(compiledTx)

  const txHash = Buffer.from(output.hash).toString('hex')

  assertErrorMessage(output.errorMessage)

  const url = `${rootApiUrl}/ton/v2/sendBocReturnHash`

  const response = await attempt(
    queryUrl<{ result: { hash: string } }>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ boc: output.encoded }),
    })
  )

  if ('error' in response && !isInError(response.error, 'duplicate message')) {
    throw response.error
  }

  return { txHash }
}
