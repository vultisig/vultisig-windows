import { Chain, OtherChain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { attempt } from '@lib/utils/attempt'
import { ensureHexPrefix } from '@lib/utils/hex/ensureHexPrefix'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { TxStatusResolver } from '../resolver'

import { bittensorConfig } from '@core/chain/chains/bittensor/config'

const taostatsExtrinsicUrl = `${bittensorConfig.taostatsApiUrl}/extrinsic/v1`

type TaostatsExtrinsicResponse = {
  pagination: { page: number; limit: number; total: number }
  data: Array<{
    hash: string
    block_number: number
    success: boolean
    fee?: string
    timestamp: string
  }>
}

export const getBittensorTxStatus: TxStatusResolver<
  OtherChain.Bittensor
> = async ({ hash }) => {
  const txHash = ensureHexPrefix(hash)

  const { data: response, error } = await attempt(
    queryUrl<TaostatsExtrinsicResponse>(
      `${taostatsExtrinsicUrl}?hash=${txHash}`,
      {
        headers: {
          Authorization: bittensorConfig.taostatsApiKey,
        },
      }
    )
  )

  if (error || !response || !response.data || response.data.length === 0) {
    return { status: 'pending' }
  }

  const extrinsic = response.data[0]
  const feeCoin = chainFeeCoin[Chain.Bittensor]
  const receipt = extrinsic.fee
    ? {
        feeAmount: BigInt(extrinsic.fee),
        feeDecimals: feeCoin.decimals,
        feeTicker: feeCoin.ticker,
      }
    : undefined

  return {
    status: extrinsic.success ? 'success' : 'error',
    receipt,
  }
}
