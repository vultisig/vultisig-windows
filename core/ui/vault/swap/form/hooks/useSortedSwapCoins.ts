import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { CoinKey, coinKeyToString } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useMemo } from 'react'

import { useBalancesQuery } from '../../../../chain/coin/queries/useBalancesQuery'
import {
  useCurrentVaultCoin,
  useCurrentVaultCoins,
} from '../../../state/currentVaultCoins'

export const useSortedSwapCoins = (value: CoinKey) => {
  const coins = useCurrentVaultCoins()
  const coin = shouldBePresent(useCurrentVaultCoin(value))

  const coinsInSelectedChain = useMemo(
    () => coins.filter(c => c.chain === coin.chain),
    [coin.chain, coins]
  )

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
