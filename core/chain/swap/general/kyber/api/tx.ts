import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { isInError } from '@lib/utils/error/isInError'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { convertDuration } from '@lib/utils/time/convertDuration'

import { AccountCoin } from '../../../../coin/AccountCoin'
import { isFeeCoin } from '../../../../coin/utils/isFeeCoin'
import { EvmFeeQuote } from '../../../../tx/fee/evm/EvmFeeSettings'
import { GeneralSwapQuote } from '../../GeneralSwapQuote'
import { KyberSwapEnabledChain } from '../chains'
import {
  kyberSwapAffiliateConfig,
  kyberSwapSlippageTolerance,
  kyberSwapTxLifespan,
} from '../config'
import { getKyberSwapBaseUrl } from './baseUrl'

type GetKyberSwapTxInput = {
  from: AccountCoin<KyberSwapEnabledChain>
  routeSummary: any
  routerAddress: string
  amount: bigint
  enableGasEstimation: boolean
  isAffiliate: boolean
}

type KyberSwapBuildResponse = {
  code: number
  data: {
    amountOut: string
    data: string
    gas: string
    routerAddress: string
    gasPrice?: string
  }
}

export const getKyberSwapTx = async ({
  from,
  routeSummary,
  routerAddress,
  amount,
  enableGasEstimation,
  isAffiliate,
}: GetKyberSwapTxInput): Promise<GeneralSwapQuote> => {
  const buildPayload = {
    routeSummary,
    sender: from.address,
    recipient: from.address,
    slippageTolerance: kyberSwapSlippageTolerance,
    deadline: Math.round(
      convertDuration(
        Date.now() + convertDuration(kyberSwapTxLifespan, 'min', 'ms'),
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
      headers: {
        'X-Client-Id': kyberSwapAffiliateConfig.source,
      },
      body: buildPayload,
    }
  )

  if (buildResponse.code !== 0 || !buildResponse.data) {
    if ('message' in buildResponse) {
      const { message } = buildResponse

      if (isInError(message, 'execution reverted')) {
        throw new Error(`Transaction will revert: ${message}`)
      }

      if (isInError(message, 'insufficient allowance')) {
        throw new Error(`Insufficient allowance: ${message}`)
      }

      if (isInError(message, 'insufficient funds')) {
        throw new Error(`Insufficient funds: ${message}`)
      }

      throw new Error(extractErrorMsg(message))
    }

    throw new Error('Failed to build transaction')
  }

  const { amountOut, data, gas } = buildResponse.data

  const feeQuote: Partial<EvmFeeQuote> = {}
  if (routeSummary?.gasPrice) {
    feeQuote.maxFeePerGas = BigInt(routeSummary?.gasPrice)
  }
  if (gas) {
    feeQuote.gasLimit = BigInt(gas)
  }

  return {
    dstAmount: amountOut,
    provider: 'kyber',
    tx: {
      evm: {
        from: from.address,
        to: routerAddress,
        data,
        value: isFeeCoin(from) ? amount.toString() : '0',
        feeQuote,
      },
    },
  }
}
