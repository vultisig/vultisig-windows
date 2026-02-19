import { Chain, OtherChain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { rootApiUrl } from '@core/config'
import { attempt } from '@lib/utils/attempt'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { TxStatusResolver } from '../resolver'

type TonTransaction = {
  transaction_id: {
    hash: string
  }
  out_msgs: Array<unknown>
  fee?: string
  description?: {
    aborted?: boolean
    compute_ph?: {
      exit_code?: number
    }
  }
}

type TonTransactionsResponse = {
  ok: boolean
  result: Array<TonTransaction>
}

export const getTonTxStatus: TxStatusResolver<OtherChain.Ton> = async ({
  hash,
}) => {
  const url = `${rootApiUrl}/ton/v2/getTransactions?hash=${hash}`

  const { data: response, error } = await attempt(
    queryUrl<TonTransactionsResponse>(url)
  )

  if (error || !response || !response.ok || response.result.length === 0) {
    return { status: 'pending' }
  }

  const tx = response.result[0]

  // Check if transaction was aborted
  if (tx.description?.aborted) {
    return { status: 'error' }
  }

  // Check compute phase exit code
  const exitCode = tx.description?.compute_ph?.exit_code

  // Exit code 0 or 1 indicates success
  // If no exit code is present (simple transfers), assume success
  const success = exitCode === undefined || exitCode === 0 || exitCode === 1
  const status = success ? 'success' : 'error'

  const feeCoin = chainFeeCoin[Chain.Ton]
  const feeStr = tx.fee
  const receipt =
    feeStr != null && feeStr !== ''
      ? {
          feeAmount: BigInt(feeStr),
          feeDecimals: feeCoin.decimals,
          feeTicker: feeCoin.ticker,
        }
      : undefined

  return { status, receipt }
}
