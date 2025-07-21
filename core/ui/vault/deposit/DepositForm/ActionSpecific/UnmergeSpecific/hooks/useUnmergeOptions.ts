// hooks/useUnmergeOptions.ts
import { kujiraCoinsOnThorChain } from '@core/chain/chains/cosmos/thor/kujira-merge/kujiraCoinsOnThorChain'
import { TokenBalance } from '@core/chain/chains/thorchain/ruji/services/fetchMergeableTokenBalances'
import { Coin } from '@core/chain/coin/Coin'
import { knownCosmosTokens } from '@core/chain/coin/knownTokens/cosmos'
import { useEffect, useMemo } from 'react'

import { useCoreViewState } from '../../../../../../navigation/hooks/useCoreViewState'
import { useCurrentVaultCoin } from '../../../../../state/currentVaultCoins'
import { useDepositFormHandlers } from '../../../../providers/DepositFormHandlersProvider'
import { makePlaceholderCoin } from '../utils'

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

    const rujiToken = coins.find(
      c => c.ticker === knownCosmosTokens.THORChain['x/ruji'].ticker
    )

    const base = rujiToken ? [...kujiraTokens, rujiToken] : kujiraTokens

    const extra = balances
      .map(
        tb =>
          coins.find(c => c.ticker.toUpperCase() === tb.symbol.toUpperCase()) ??
          makePlaceholderCoin(tb.symbol)
      )
      .filter(
        (c, i, self) =>
          !base.some(b => b.ticker === c.ticker) &&
          self.findIndex(x => x.ticker === c.ticker) === i
      )

    return [...base, ...extra]
  }, [coins, balances])

  useEffect(() => {
    if (!tokens.some(token => token.ticker === ticker)) {
      setValue('selectedCoin', tokens[0], {
        shouldValidate: true,
      })
    }
  }, [setValue, ticker, tokens])

  return tokens
}
