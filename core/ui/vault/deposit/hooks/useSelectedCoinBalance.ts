import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { Coin } from '@core/chain/coin/Coin'
import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { ChainAction } from '@core/ui/vault/deposit/ChainAction'
import { useMergeableTokenBalancesQuery } from '@core/ui/vault/deposit/hooks/useMergeableTokenBalancesQuery'
import { useDepositCoin } from '@core/ui/vault/deposit/state/coin'
import {
  useVaultChainCoinsQuery,
  VaultChainCoin,
} from '@core/ui/vault/queries/useVaultChainCoinsQuery'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { useMemo } from 'react'

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
  const coin = useDepositCoin()

  const vaultEntry: VaultChainCoin | undefined = vaultCoins.find(
    c => c.id === selectedCoin?.id
  )

  const [{ coin: feeCoinKey }] = useCoreViewState<'deposit'>()
  const address = useCurrentVaultCoin(feeCoinKey)?.address

  const { data: yTokenRawBalance = 0n } = useBalanceQuery({
    chain,
    address,
    id: selectedCoin?.id || coin.id,
  })

  const { data: mergeBalances = [] } = useMergeableTokenBalancesQuery(
    address ?? ''
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
