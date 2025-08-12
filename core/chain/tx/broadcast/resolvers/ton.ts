import { OtherChain } from '@core/chain/Chain'
import { rootApiUrl } from '@core/config'
import { attempt } from '@lib/utils/attempt'
import { isInError } from '@lib/utils/error/isInError'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { BroadcastTxResolver } from '../resolver'

export const broadcastTonTx: BroadcastTxResolver<OtherChain.Ton> = async ({
  tx,
}) => {
  const url = `${rootApiUrl}/ton/v2/sendBocReturnHash`

  const { error } = await attempt(
    queryUrl<{ result: { hash: string } }>(url, {
      body: { boc: tx.encoded },
    })
  )

  if (error && !isInError(error, 'duplicate message')) {
    throw error
  }
}
