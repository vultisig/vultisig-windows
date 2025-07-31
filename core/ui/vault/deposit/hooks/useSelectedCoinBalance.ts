import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { Coin } from '@core/chain/coin/Coin'
import { useMemo } from 'react'

import { useBalanceQuery } from '../../../chain/coin/queries/useBalanceQuery'
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
  const { data: vaultCoins = [] } = useVaultChainCoinsQuery(chain)

  const vaultEntry: VaultChainCoin | undefined = vaultCoins.find(
    c => c.id === selectedCoin?.id
  )

  const [{ coin: feeCoinKey }] = useCoreViewState<'deposit'>()
  const thorAddr = useCurrentVaultCoin(feeCoinKey)?.address

  const { data: yTokenRawBalance = 0n } = useBalanceQuery(
    selectedCoin && !vaultEntry && thorAddr
      ? {
          chain: Chain.THORChain,
          address: thorAddr,
          id: selectedCoin.id,
        }
      : (undefined as any)
  )

  const { data: mergeBalances = [] } = useMergeableTokenBalancesQuery(
    thorAddr ?? ''
  )

  return useMemo(() => {
    if (!selectedCoin) return 0

    if (action === 'unmerge') {
      const shares =
        mergeBalances.find(b => b.symbol === selectedCoin.ticker)?.shares ?? 0
      return fromChainAmount(shares, 8)
    }

    if (!vaultEntry) {
      return fromChainAmount(yTokenRawBalance, selectedCoin.decimals)
    }

    return fromChainAmount(vaultEntry.amount, vaultEntry.decimals)
  }, [action, mergeBalances, selectedCoin, vaultEntry, yTokenRawBalance])
}
