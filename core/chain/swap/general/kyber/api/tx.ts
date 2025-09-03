import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { isInError } from '@lib/utils/error/isInError'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { convertDuration } from '@lib/utils/time/convertDuration'

import { EvmChain } from '../../../../Chain'
import { AccountCoin } from '../../../../coin/AccountCoin'
import { isFeeCoin } from '../../../../coin/utils/isFeeCoin'
import { defaultEvmSwapGasLimit } from '../../../../tx/fee/evm/evmGasLimit'
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

const gasMultiplier: Record<EvmChain, number> = {
  [EvmChain.Ethereum]: 1.4,
  [EvmChain.Arbitrum]: 2,
  [EvmChain.Optimism]: 2,
  [EvmChain.Base]: 2,
  [EvmChain.Polygon]: 2,
  [EvmChain.Avalanche]: 2,
  [EvmChain.BSC]: 2,
  [EvmChain.CronosChain]: 1.6,
  [EvmChain.Zksync]: 1.6,
  [EvmChain.Blast]: 1.6,
  [EvmChain.Mantle]: 1.6,
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

  const baseGas = parseInt(gas) || defaultEvmSwapGasLimit

  return {
    dstAmount: amountOut,
    provider: 'kyber',
    tx: {
      evm: {
        from: from.address,
        to: routerAddress,
        data,
        value: isFeeCoin(from) ? amount.toString() : '0',
        gasPrice: routeSummary?.gasPrice || '0',
        gas: Math.round(baseGas * gasMultiplier[from.chain]),
      },
    },
  }
}
