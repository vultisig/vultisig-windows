import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { addQueryParams } from '@lib/utils/query/addQueryParams'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { TransferDirection } from '@lib/utils/TransferDirection'

import { evmNativeCoinAddress } from '../../../../chains/evm/config'
import { KyberSwapEnabledChain } from '../chains'
import { kyberSwapAffiliateConfig, kyberSwapSlippageTolerance } from '../config'
import { getKyberSwapBaseUrl } from './baseUrl'

type Input = Record<TransferDirection, AccountCoin<KyberSwapEnabledChain>> & {
  amount: bigint
  isAffiliate: boolean
}

type KyberSwapRoute = {
  routeSummary: any
  routerAddress: string
}

type KyberSwapRouteResponse = {
  code: number
  message: string
  data: KyberSwapRoute
  requestId: string
}

type KyberSwapRouteParams = {
  tokenIn: string
  tokenOut: string
  amountIn: string
  saveGas: boolean
  gasInclude: boolean
  slippageTolerance: number
  source?: string
  referral?: string
}

export const getKyberSwapRoute = async ({
  from,
  to,
  amount,
  isAffiliate,
}: Input): Promise<KyberSwapRoute> => {
  const [tokenIn, tokenOut] = [from, to].map(
    ({ id }) => id || evmNativeCoinAddress
  )

  const routeParams: KyberSwapRouteParams = {
    tokenIn,
    tokenOut,
    amountIn: amount.toString(),
    saveGas: true,
    gasInclude: true,
    slippageTolerance: kyberSwapSlippageTolerance,
    ...(isAffiliate ? kyberSwapAffiliateConfig : {}),
  }

  const routeUrl = addQueryParams(
    `${getKyberSwapBaseUrl(from.chain)}/routes`,
    routeParams
  )

  const { data } = await queryUrl<KyberSwapRouteResponse>(routeUrl, {
    headers: {
      'X-Client-Id': kyberSwapAffiliateConfig.source,
    },
  })

  return data
}
