import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { attempt } from '@lib/utils/attempt'
import { isInError } from '@lib/utils/error/isInError'
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

  const tx = await attempt(
    getKyberSwapTx({
      from,
      routeSummary,
      routerAddress,
      amount,
      enableGasEstimation: true,
      isAffiliate,
    })
  )

  if ('error' in tx) {
    const { error } = tx
    if (isInError(error, 'TransferHelper')) {
      return getKyberSwapTx({
        from,
        routeSummary,
        routerAddress,
        amount,
        enableGasEstimation: false,
        isAffiliate,
      })
    }

    throw error
  }

  return tx.data
}
