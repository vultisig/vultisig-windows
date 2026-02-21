import { Chain, OtherChain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { attempt } from '@lib/utils/attempt'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { tronRpcUrl } from '../../../chains/tron/config'
import { TxStatusResolver } from '../resolver'

type TronTxInfoResponse = {
  id?: string
  fee?: number
  blockNumber?: number
  receipt?: {
    result?: string
  }
}

export const getTronTxStatus: TxStatusResolver<OtherChain.Tron> = async ({
  hash,
}) => {
  const url = `${tronRpcUrl}/wallet/gettransactioninfobyid`

  const { data: tx, error } = await attempt(
    queryUrl<TronTxInfoResponse>(url, {
      body: { value: hash },
    })
  )

  if (error || !tx || tx.blockNumber === undefined || tx.blockNumber === 0) {
    return { status: 'pending' }
  }

  const receiptResult = tx.receipt?.result
  const success = receiptResult !== 'FAILED'

  const status = success ? 'success' : 'error'
  const feeCoin = chainFeeCoin[Chain.Tron]
  const receipt =
    tx.fee != null
      ? {
          feeAmount: BigInt(tx.fee),
          feeDecimals: feeCoin.decimals,
          feeTicker: feeCoin.ticker,
        }
      : undefined

  return { status, receipt }
}
