import { OtherChain } from '@core/chain/Chain'
import { attempt } from '@lib/utils/attempt'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { TxStatusResolver } from '../resolver'

type SubscanExtrinsicResponse = {
  code: number
  message: string
  data: {
    hash: string
    success: boolean
    finalized: boolean
  } | null
}

export const getPolkadotTxStatus: TxStatusResolver<
  OtherChain.Polkadot
> = async ({ hash }) => {
  const url = 'https://assethub-polkadot.subscan.io/api/scan/extrinsic'

  const { data: response, error } = await attempt(
    queryUrl<SubscanExtrinsicResponse>(url, {
      body: { hash },
    })
  )

  if (error || !response || response.code !== 0 || !response.data) {
    return 'pending'
  }

  const { success, finalized } = response.data

  if (finalized) {
    return success ? 'success' : 'error'
  }

  return 'pending'
}
