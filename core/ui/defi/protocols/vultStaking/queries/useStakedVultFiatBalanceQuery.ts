import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useCombineQueries } from '@lib/ui/query/hooks/useCombineQueries'
import { Query } from '@lib/ui/query/Query'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'

import { sVultCoin, vultCoin } from '../core/config'
import { useStakedVultBalanceQuery } from './useStakedVultBalanceQuery'

/** Fiat value of the staked sVULT, priced 1:1 against VULT. */
export const useStakedVultFiatBalanceQuery = (): Query<number> => {
  const balanceQuery = useStakedVultBalanceQuery()
  const priceQuery = useCoinPriceQuery({ coin: vultCoin })

  return useCombineQueries({
    queries: { balance: balanceQuery, price: priceQuery },
    joinData: ({ balance, price }) =>
      fromChainAmount(balance, sVultCoin.decimals) * price,
    eager: false,
  })
}
