import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { coinKeyToString } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { useMemo } from 'react'

import { useBalancesQuery } from '../../../../chain/coin/queries/useBalancesQuery'
import { useCurrentVaultChainCoins } from '../../../state/currentVaultCoins'

export const useSortedByBalanceCoins = (chain: Chain) => {
  const coinsInSelectedChain = useCurrentVaultChainCoins(chain)

  const { data: balances } = useBalancesQuery(
    coinsInSelectedChain.map(extractAccountCoinKey)
  )

  return useMemo(() => {
    const getHumanBalance = (c: (typeof coinsInSelectedChain)[number]) => {
      const key = coinKeyToString(extractAccountCoinKey(c))
      const chainBalance = balances?.[key] || 0
      return fromChainAmount(chainBalance, c.decimals)
    }

    return [...coinsInSelectedChain].sort((a, b) => {
      const aFee = isFeeCoin(a)
      const bFee = isFeeCoin(b)
      if (aFee !== bFee) return aFee ? -1 : 1

      const diff = getHumanBalance(b) - getHumanBalance(a)
      if (diff !== 0) return diff

      return a.ticker.localeCompare(b.ticker)
    })
  }, [coinsInSelectedChain, balances])
}
