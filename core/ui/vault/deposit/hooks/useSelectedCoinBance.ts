import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { Coin } from '@core/chain/coin/Coin'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useMemo } from 'react'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import {
  useVaultChainCoinsQuery,
  VaultChainCoin,
} from '../../queries/useVaultChainCoinsQuery'
import { useCurrentVaultCoin } from '../../state/currentVaultCoins'
import { ChainAction } from '../ChainAction'
import { useMergeableTokenBalancesQuery } from './useMergeableTokenBalancesQuery'

type Params = {
  action: ChainAction
  selectedCoin: Coin | null
  chain: Chain
}

export const useSelectedCoinBalance = ({
  action,
  selectedCoin,
  chain,
}: Params) => {
  const { data: coinsWithAmount = [] } = useVaultChainCoinsQuery(chain)
  const { amount: selectedCoinAmount = 0, decimals: selectedCoinDecimals = 0 } =
    coinsWithAmount.find(c => c.id === selectedCoin?.id) ||
    ({} as VaultChainCoin)

  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  const coinAddress = shouldBePresent(useCurrentVaultCoin(coinKey)?.address)
  const { data: mergableTokenBalances = [] } =
    useMergeableTokenBalancesQuery(coinAddress)

  return useMemo(() => {
    if (!selectedCoin) return 0

    if (action === 'unmerge') {
      const shares =
        mergableTokenBalances.find(b => b.symbol === selectedCoin.ticker)
          ?.shares ?? 0
      return fromChainAmount(shares, 8)
    }

    return fromChainAmount(selectedCoinAmount, selectedCoinDecimals)
  }, [
    action,
    mergableTokenBalances,
    selectedCoin,
    selectedCoinAmount,
    selectedCoinDecimals,
  ])
}
