import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { NoSwapRoutesError } from '@core/chain/swap/NoSwapRoutesError'
import { attempt } from '@lib/utils/attempt'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { addQueryParams } from '@lib/utils/query/addQueryParams'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { TransferDirection } from '@lib/utils/TransferDirection'

import { HybridSwapEnabledChain } from '../HybridSwapEnabledChains'
import { HybridSwapQuote } from '../HybridSwapQuote'
import { hybridSwapSlippageTolerance, kyberSwapAffiliateConfig } from './config'
import { getKyberSwapBaseUrl } from './getKyberSwapBaseUrl'
import { getKyberSwapQuoteFromRoute } from './getKyberSwapQuoteFromRoute'
import { KyberSwapRouteParams, KyberSwapRouteResponse } from './types'

type Input = Record<TransferDirection, AccountCoin<HybridSwapEnabledChain>> & {
  amount: number
  isAffiliate: boolean
}

const nativeCoinAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

export const getHybridSwapQuote = async ({
  from,
  to,
  amount,
  isAffiliate,
}: Input): Promise<HybridSwapQuote> => {
  const chainAmount = toChainAmount(amount, from.decimals)

  const routeParams: KyberSwapRouteParams = {
    tokenIn: isFeeCoin(from) ? nativeCoinAddress : from.id,
    tokenOut: isFeeCoin(to) ? nativeCoinAddress : to.id,
    amountIn: chainAmount.toString(),
    saveGas: true,
    gasInclude: true,
    slippageTolerance: hybridSwapSlippageTolerance,
    ...(isAffiliate ? kyberSwapAffiliateConfig : {}),
  }

  const routeUrl = addQueryParams(
    `${getKyberSwapBaseUrl(from.chain)}/routes`,
    routeParams
  )

  const routeResponse = await queryUrl<KyberSwapRouteResponse>(routeUrl, {
    headers: {
      'X-Client-Id': kyberSwapAffiliateConfig.source,
    },
  })

  if (routeResponse.code !== 0 || !routeResponse.data?.routeSummary) {
    throw new NoSwapRoutesError()
  }

  const { routeSummary, routerAddress } = routeResponse.data

  const txWithGasEstimationResult = await attempt(
    getKyberSwapQuoteFromRoute({
      from,
      routeSummary,
      routerAddress,
      chainAmount,
      enableGasEstimation: true,
      isAffiliate,
    })
  )

  if ('error' in txWithGasEstimationResult) {
    if (
      extractErrorMsg(txWithGasEstimationResult.error).includes(
        'TransferHelper'
      )
    ) {
      return getKyberSwapQuoteFromRoute({
        from,
        routeSummary,
        routerAddress,
        chainAmount,
        enableGasEstimation: false,
        isAffiliate,
      })
    }

    throw txWithGasEstimationResult.error
  }

  return txWithGasEstimationResult.data
}
