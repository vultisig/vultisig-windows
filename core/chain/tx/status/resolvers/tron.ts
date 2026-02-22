import { OtherChain } from '@core/chain/Chain'
import { attempt } from '@lib/utils/attempt'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { tronRpcUrl } from '../../../chains/tron/config'
import { TxStatusResolver } from '../resolver'

type TronTxResponse = {
  ret?: Array<{
    contractRet: string
  }>
}

export const getTronTxStatus: TxStatusResolver<OtherChain.Tron> = async ({
  hash,
}) => {
  const url = `${tronRpcUrl}/wallet/gettransactionbyid`

  const { data: tx, error } = await attempt(
    queryUrl<TronTxResponse>(url, {
      body: { value: hash },
    })
  )

  if (error || !tx || !tx.ret) {
    return 'pending'
  }

  const success = tx.ret.some(
    (r: { contractRet: string }) => r.contractRet === 'SUCCESS'
  )

  return success ? 'success' : 'error'
}
