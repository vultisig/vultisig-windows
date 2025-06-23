import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { attempt } from '@lib/utils/attempt'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { TransferDirection } from '@lib/utils/TransferDirection'

import { GeneralSwapQuote } from '../../GeneralSwapQuote'
import { KyberSwapEnabledChain } from '../chains'
import { getKyberSwapRoute } from './route'
import { getKyberSwapTx } from './tx'

type Input = Record<TransferDirection, AccountCoin<KyberSwapEnabledChain>> & {
  amount: bigint
  isAffiliate: boolean
}

export const getKyberSwapQuote = async ({
  from,
  to,
  amount,
  isAffiliate,
}: Input): Promise<GeneralSwapQuote> => {
  const { routeSummary, routerAddress } = await getKyberSwapRoute({
    from,
    to,
    amount,
    isAffiliate,
  })

  const txWithGasEstimationResult = await attempt(
    getKyberSwapTx({
      from,
      routeSummary,
      routerAddress,
      amount,
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
      return getKyberSwapTx({
        from,
        routeSummary,
        routerAddress,
        amount,
        enableGasEstimation: false,
        isAffiliate,
      })
    }

    throw txWithGasEstimationResult.error
  }

  return txWithGasEstimationResult.data
}
