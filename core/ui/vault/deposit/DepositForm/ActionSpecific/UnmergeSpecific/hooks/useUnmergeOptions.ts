import { Chain } from '@core/chain/Chain'
import { kujiraCoinsOnThorChain } from '@core/chain/chains/cosmos/thor/kujira-merge/kujiraCoinsOnThorChain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { useEffect, useMemo } from 'react'

import {
  useCurrentVaultAddresses,
  useCurrentVaultChainCoins,
} from '../../../../../state/currentVaultCoins'
import { useMergeableTokenBalancesQuery } from '../../../../hooks/useMergeableTokenBalancesQuery'
import { useDepositCoin } from '../../../../providers/DepositCoinProvider'
import { makeUnmergeSpecificPlaceholderCoin } from '../utils'

/**
  @tony: 
 * The hook returns every coin a user could un‑merge:
 *  – all Kujira‑migration coins
 *  – RUJI itself
 *  – any symbol that appears in `balances`, even if we don’t know it yet
 */
export const useUnmergeOptions = (): AccountCoin[] => {
  const coins = useCurrentVaultChainCoins(Chain.THORChain)
  const address = useCurrentVaultAddresses()[Chain.THORChain]
  const { data: balances = [] } = useMergeableTokenBalancesQuery(address)
  const [{ ticker }, setSelectedCoin] = useDepositCoin()

  const tokens = useMemo(() => {
    const kujiraTokens = coins.filter(
      c => c.id && c.id in kujiraCoinsOnThorChain
    )

    const extraTokens = balances
      .map(
        tb =>
          coins.find(c => c.ticker.toUpperCase() === tb.symbol.toUpperCase()) ??
          makeUnmergeSpecificPlaceholderCoin(tb.symbol, address)
      )
      .filter(
        (c, i, self) =>
          !kujiraTokens.some(b => b.ticker === c.ticker) &&
          self.findIndex(x => x.ticker === c.ticker) === i
      )

    return [...kujiraTokens, ...extraTokens]
  }, [coins, balances, address])

  useEffect(() => {
    if (!tokens.some(({ ticker: currentTicker }) => currentTicker === ticker)) {
      setSelectedCoin(tokens[0])
    }
  }, [setSelectedCoin, ticker, tokens])

  return tokens
}
