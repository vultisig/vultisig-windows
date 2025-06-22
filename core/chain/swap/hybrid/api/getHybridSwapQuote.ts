import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { Chain } from '@core/chain/Chain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { NoSwapRoutesError } from '@core/chain/swap/NoSwapRoutesError'
import { addQueryParams } from '@lib/utils/query/addQueryParams'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { TransferDirection } from '@lib/utils/TransferDirection'

import { HybridSwapEnabledChain } from '../HybridSwapEnabledChains'
import { HybridSwapQuote } from '../HybridSwapQuote'
import { kyberSwapAffiliateConfig } from '../kyberSwapAffiliateConfig'

type Input = Record<TransferDirection, AccountCoin<HybridSwapEnabledChain>> & {
  amount: number
  isAffiliate: boolean
}

const nativeCoinAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

const getKyberSwapBaseUrl = (chain: Chain) =>
  `https://aggregator-api.kyberswap.com/${chain.toLowerCase()}/api/v1`

export const getHybridSwapQuote = async ({
  from,
  to,
  amount,
  isAffiliate,
}: Input): Promise<HybridSwapQuote> => {
  const chainAmount = toChainAmount(amount, from.decimals)

  const baseRouteParams = {
    tokenIn: isFeeCoin(from) ? nativeCoinAddress : from.id,
    tokenOut: isFeeCoin(to) ? nativeCoinAddress : to.id,
    amountIn: chainAmount.toString(),
    saveGas: true,
    gasInclude: true,
    slippageTolerance: 100,
  }

  // Add affiliate parameters following iOS app pattern
  const routeParams = isAffiliate
    ? {
        ...baseRouteParams,
        source: kyberSwapAffiliateConfig.sourceIdentifier,
        referral: kyberSwapAffiliateConfig.referrerAddress,
      }
    : baseRouteParams

  const routeUrl = addQueryParams(
    `${getKyberSwapBaseUrl(from.chain)}/routes`,
    routeParams
  )

  const routeResponse = await queryUrl<{
    code: number
    data: {
      routeSummary: any
      routerAddress: string
    }
  }>(routeUrl, {
    headers: {
      'X-Client-Id': kyberSwapAffiliateConfig.clientId,
    },
  })

  if (routeResponse.code !== 0 || !routeResponse.data?.routeSummary) {
    throw new NoSwapRoutesError()
  }

  const { routeSummary, routerAddress } = routeResponse.data

  const buildPayload = {
    routeSummary,
    sender: from.address,
    recipient: from.address,
    slippageTolerance: 100,
  }

  const buildResponse = await queryUrl<{
    code: number
    data: {
      amountOut: string
      data: string
      gas: string
      routerAddress: string
    }
  }>(`${getKyberSwapBaseUrl(from.chain)}/route/build`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': kyberSwapAffiliateConfig.clientId,
    },
    body: JSON.stringify(buildPayload),
  })

  if (buildResponse.code !== 0 || !buildResponse.data) {
    throw new NoSwapRoutesError()
  }

  const { amountOut, data, gas } = buildResponse.data

  return {
    dstAmount: amountOut,
    tx: {
      from: from.address,
      to: routerAddress,
      data,
      value: isFeeCoin(from) ? chainAmount.toString() : '0',
      gasPrice: '0',
      gas: parseInt(gas),
    },
  }
}
