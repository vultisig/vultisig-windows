import { usePortfolioVaultChainCoins } from '@core/ui/vault/state/currentVaultCoins'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import {
  accountCoinKeyToString,
  extractAccountCoinKey,
} from '@vultisig/core-chain/coin/AccountCoin'
import { isFeeCoin } from '@vultisig/core-chain/coin/utils/isFeeCoin'
import { useMemo } from 'react'

import { useBalancesQuery } from '../../../../chain/coin/queries/useBalancesQuery'

export const useSortedByBalanceCoins = (chain: Chain) => {
  const coinsInSelectedChain = usePortfolioVaultChainCoins(chain)

  const { data: balances } = useBalancesQuery(
    coinsInSelectedChain.map(extractAccountCoinKey)
  )

  return useMemo(() => {
    const getHumanBalance = (c: (typeof coinsInSelectedChain)[number]) => {
      const key = accountCoinKeyToString(extractAccountCoinKey(c))
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
