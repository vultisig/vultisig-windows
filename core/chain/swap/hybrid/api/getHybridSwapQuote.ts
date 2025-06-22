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
import { KyberSwapRouteParams, KyberSwapRouteResponse } from './types'

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

  const routeParams: KyberSwapRouteParams = {
    tokenIn: isFeeCoin(from) ? nativeCoinAddress : from.id,
    tokenOut: isFeeCoin(to) ? nativeCoinAddress : to.id,
    amountIn: chainAmount.toString(),
    saveGas: true,
    gasInclude: true,
    slippageTolerance: 100,
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

  // Try with gas estimation first, retry without if TransferHelper error occurs
  return await buildTransactionWithFallback({
    from,
    routeSummary,
    routerAddress,
    chainAmount,
    isAffiliate,
  })
}

const buildTransactionWithFallback = async ({
  from,
  routeSummary,
  routerAddress,
  chainAmount,
  isAffiliate,
}: {
  from: AccountCoin<HybridSwapEnabledChain>
  routeSummary: any
  routerAddress: string
  chainAmount: bigint
  isAffiliate: boolean
}): Promise<HybridSwapQuote> => {
  // First attempt with gas estimation enabled
  try {
    return await buildTransaction({
      from,
      routeSummary,
      routerAddress,
      chainAmount,
      enableGasEstimation: true,
      isAffiliate,
    })
  } catch (error) {
    // TransferHelper error likely due to insufficient allowance during gas estimation
    // Retry without gas estimation
    if (error instanceof Error && error.message.includes('TransferHelper')) {
      return await buildTransaction({
        from,
        routeSummary,
        routerAddress,
        chainAmount,
        enableGasEstimation: false,
        isAffiliate,
      })
    }
    throw error
  }
}

const buildTransaction = async ({
  from,
  routeSummary,
  routerAddress,
  chainAmount,
  enableGasEstimation,
  isAffiliate,
}: {
  from: AccountCoin<HybridSwapEnabledChain>
  routeSummary: any
  routerAddress: string
  chainAmount: bigint
  enableGasEstimation: boolean
  isAffiliate: boolean
}): Promise<HybridSwapQuote> => {
  const buildPayload = {
    routeSummary,
    sender: from.address,
    recipient: from.address,
    slippageTolerance: 100,
    deadline: Math.floor(Date.now() / 1000) + 1200, // 20 minutes from now
    enableGasEstimation,
    source: kyberSwapAffiliateConfig.clientId,
    referral: isAffiliate ? kyberSwapAffiliateConfig.referrerAddress : null,
    ignoreCappedSlippage: false,
  }

  const buildResponse = await queryUrl<KyberSwapBuildResponse>(
    `${getKyberSwapBaseUrl(from.chain)}/route/build`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Id': kyberSwapAffiliateConfig.clientId,
      },
      body: JSON.stringify(buildPayload),
    }
  )

  // Enhanced error handling for gas estimation failures
  if (buildResponse.code !== 0) {
    const errorMessage =
      'message' in buildResponse
        ? (buildResponse as any).message
        : 'Unknown error'

    if (errorMessage.includes('execution reverted')) {
      throw new Error(`Transaction will revert: ${errorMessage}`)
    } else if (errorMessage.includes('insufficient allowance')) {
      throw new Error(`Insufficient allowance: ${errorMessage}`)
    } else if (errorMessage.includes('insufficient funds')) {
      throw new Error(`Insufficient funds: ${errorMessage}`)
    } else {
      throw new NoSwapRoutesError()
    }
  }

  if (!buildResponse.data) {
    throw new NoSwapRoutesError()
  }

  const { amountOut, data, gas } = buildResponse.data

  // Extract gas price from route summary (matching iOS logic)
  const gasPrice = routeSummary?.gasPrice || '0'

  return {
    dstAmount: amountOut,
    tx: {
      from: from.address,
      to: routerAddress,
      data,
      value: isFeeCoin(from) ? chainAmount.toString() : '0',
      gasPrice,
      gas: parseInt(gas),
    },
  }
}
