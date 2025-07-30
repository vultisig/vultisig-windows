import { OtherChain } from '@core/chain/Chain'
import { rootApiUrl } from '@core/config'
import { attempt } from '@lib/utils/attempt'
import { isInError } from '@lib/utils/error/isInError'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeTonTx: ExecuteTxResolver<OtherChain.Ton> = async ({
  tx,
  skipBroadcast,
}) => {
  const txHash = Buffer.from(tx.hash).toString('hex')

  if (skipBroadcast) return { txHash }
  const url = `${rootApiUrl}/ton/v2/sendBocReturnHash`

  const response = await attempt(
    queryUrl<{ result: { hash: string } }>(url, {
      body: { boc: tx.encoded },
    })
  )

  if ('error' in response && !isInError(response.error, 'duplicate message')) {
    throw response.error
  }

  return { txHash }
}
