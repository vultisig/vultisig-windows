import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { useMemo } from 'react'

import { useBalanceQuery } from '../../../chain/coin/queries/useBalanceQuery'
import { useVaultChainCoinsQuery } from '../../queries/useVaultChainCoinsQuery'
import { useCurrentVaultAddress } from '../../state/currentVaultCoins'
import { ChainAction } from '../ChainAction'
import { useDepositCoin } from '../providers/DepositCoinProvider'
import { useMergeableTokenBalancesQuery } from './useMergeableTokenBalancesQuery'

type Params = {
  action: ChainAction
  chain: Chain
}

export const useDepositCoinBalance = ({ action, chain }: Params) => {
  const [selectedCoin] = useDepositCoin()
  const { data: vaultCoins = [] } = useVaultChainCoinsQuery(chain)
  const vaultEntry = vaultCoins.find(c => c.id === selectedCoin.id)
  const thorAddr = useCurrentVaultAddress(Chain.THORChain)

  const { data: yTokenRawBalance = 0n } = useBalanceQuery({
    chain: Chain.THORChain,
    address: thorAddr,
    id: selectedCoin.id,
  })

  const { data: { balances = [] } = {} } = useMergeableTokenBalancesQuery()

  return useMemo(() => {
    if (!selectedCoin) return 0

    if (action === 'unmerge') {
      return balances.find(b => b.symbol === selectedCoin.ticker)?.shares ?? 0
    }

    if (!vaultEntry) {
      return fromChainAmount(yTokenRawBalance, selectedCoin.decimals)
    }

    return fromChainAmount(vaultEntry.amount, vaultEntry.decimals)
  }, [action, balances, selectedCoin, vaultEntry, yTokenRawBalance])
}
