import { isInError } from '@lib/utils/error/isInError'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { convertDuration } from '@lib/utils/time/convertDuration'

import { AccountCoin } from '../../../coin/AccountCoin'
import { isFeeCoin } from '../../../coin/utils/isFeeCoin'
import { NoSwapRoutesError } from '../../NoSwapRoutesError'
import { HybridSwapEnabledChain } from '../HybridSwapEnabledChains'
import { HybridSwapQuote } from '../HybridSwapQuote'
import {
  hybridSwapSlippageTolerance,
  hybridSwapTxLifespan,
  kyberSwapAffiliateConfig,
} from './config'
import { getKyberSwapBaseUrl } from './getKyberSwapBaseUrl'
import { KyberSwapBuildResponse } from './types'

type GetKyberSwapTxInput = {
  from: AccountCoin<HybridSwapEnabledChain>
  routeSummary: any
  routerAddress: string
  chainAmount: bigint
  enableGasEstimation: boolean
  isAffiliate: boolean
}

export const getKyberSwapQuoteFromRoute = async ({
  from,
  routeSummary,
  routerAddress,
  chainAmount,
  enableGasEstimation,
  isAffiliate,
}: GetKyberSwapTxInput): Promise<HybridSwapQuote> => {
  const buildPayload = {
    routeSummary,
    sender: from.address,
    recipient: from.address,
    slippageTolerance: hybridSwapSlippageTolerance,
    deadline: Math.round(
      convertDuration(
        Date.now() + convertDuration(hybridSwapTxLifespan, 'min', 'ms'),
        'ms',
        's'
      )
    ),
    enableGasEstimation,
    ...(isAffiliate ? kyberSwapAffiliateConfig : {}),
    ignoreCappedSlippage: false,
  }

  const buildResponse = await queryUrl<KyberSwapBuildResponse>(
    `${getKyberSwapBaseUrl(from.chain)}/route/build`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Id': kyberSwapAffiliateConfig.source,
      },
      body: JSON.stringify(buildPayload),
    }
  )

  if (buildResponse.code !== 0 || !buildResponse.data) {
    if ('message' in buildResponse) {
      const { message } = buildResponse

      if (isInError(message, 'execution reverted')) {
        throw new Error(`Transaction will revert: ${message}`)
      } else if (isInError(message, 'insufficient allowance')) {
        throw new Error(`Insufficient allowance: ${message}`)
      } else if (isInError(message, 'insufficient funds')) {
        throw new Error(`Insufficient funds: ${message}`)
      }
    }

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
      gasPrice: routeSummary?.gasPrice || '0',
      gas: parseInt(gas),
    },
  }
}
