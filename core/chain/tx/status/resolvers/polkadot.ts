import { Chain, OtherChain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { attempt } from '@lib/utils/attempt'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { TxStatusResolver } from '../resolver'

const subscanExtrinsicUrl =
  'https://assethub-polkadot.api.subscan.io/api/scan/extrinsic'

type SubscanExtrinsicResponse = {
  code: number
  message: string
  data: {
    hash: string
    success: boolean
    finalized: boolean
    fee?: string
    fee_used?: string
  } | null
}

export const getPolkadotTxStatus: TxStatusResolver<
  OtherChain.Polkadot
> = async ({ hash }) => {
  const { data: response, error } = await attempt(
    queryUrl<SubscanExtrinsicResponse>(subscanExtrinsicUrl, {
      body: { hash },
    })
  )

  if (error || !response || response.code !== 0 || !response.data) {
    return { status: 'pending' }
  }

  const { success, finalized, fee_used } = response.data

  if (!finalized) {
    return { status: 'pending' }
  }

  const feeCoin = chainFeeCoin[Chain.Polkadot]
  const feeAmount = fee_used ?? response.data.fee
  const receipt =
    feeAmount != null && feeAmount !== ''
      ? {
          feeAmount: BigInt(feeAmount),
          feeDecimals: feeCoin.decimals,
          feeTicker: feeCoin.ticker,
        }
      : undefined

  return {
    status: success ? 'success' : 'error',
    receipt,
  }
}
