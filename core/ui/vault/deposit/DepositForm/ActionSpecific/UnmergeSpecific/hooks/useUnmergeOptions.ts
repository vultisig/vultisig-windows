// hooks/useUnmergeOptions.ts
import { kujiraCoinsOnThorChain } from '@core/chain/chains/cosmos/thor/kujira-merge/kujiraCoinsOnThorChain'
import { TokenBalance } from '@core/chain/chains/thorchain/ruji/services/fetchMergeableTokenBalances'
import { Coin } from '@core/chain/coin/Coin'
import { useEffect, useMemo } from 'react'

import { useCoreViewState } from '../../../../../../navigation/hooks/useCoreViewState'
import { useCurrentVaultCoin } from '../../../../../state/currentVaultCoins'
import { useDepositFormHandlers } from '../../../../providers/DepositFormHandlersProvider'
import { makeUnmergeSpecificPlaceholderCoin } from '../utils'

/**
  @tony: 
 * The hook returns every coin a user could un‑merge:
 *  – all Kujira‑migration coins
 *  – RUJI itself
 *  – any symbol that appears in `balances`, even if we don’t know it yet
 */
export const useUnmergeOptions = ({
  coins,
  balances,
}: {
  coins: Coin[]
  balances: TokenBalance[]
}): Coin[] => {
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  const { ticker } = useCurrentVaultCoin(coinKey)
  const [{ setValue }] = useDepositFormHandlers()

  const tokens = useMemo(() => {
    const kujiraTokens = coins.filter(c => c.id in kujiraCoinsOnThorChain)

    const extraTokens = balances
      .map(
        tb =>
          coins.find(c => c.ticker.toUpperCase() === tb.symbol.toUpperCase()) ??
          makeUnmergeSpecificPlaceholderCoin(tb.symbol)
      )
      .filter(
        (c, i, self) =>
          !kujiraTokens.some(b => b.ticker === c.ticker) &&
          self.findIndex(x => x.ticker === c.ticker) === i
      )

    return [...kujiraTokens, ...extraTokens]
  }, [coins, balances])

  useEffect(() => {
    if (!tokens.some(({ ticker: currentTicker }) => currentTicker === ticker)) {
      setValue('selectedCoin', tokens[0], {
        shouldValidate: true,
      })
    }
  }, [setValue, ticker, tokens])

  return tokens
}
