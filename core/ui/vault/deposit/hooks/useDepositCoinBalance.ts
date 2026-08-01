import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
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
    if (!selectedCoin) return { balance: 0, balanceUnits: 0n }

    if (action === 'unmerge') {
      // Merge shares only exist as a float in the merge API response
      return {
        balance:
          balances.find(b => b.symbol === selectedCoin.ticker)?.shares ?? 0,
        balanceUnits: null,
      }
    }

    if (!vaultEntry) {
      return {
        balance: fromChainAmount(yTokenRawBalance, selectedCoin.decimals),
        balanceUnits: yTokenRawBalance,
      }
    }

    return {
      balance: fromChainAmount(vaultEntry.amount, vaultEntry.decimals),
      // Units are only meaningful when they share the form coin's scale
      balanceUnits:
        vaultEntry.decimals === selectedCoin.decimals
          ? BigInt(vaultEntry.amount)
          : null,
    }
  }, [action, balances, selectedCoin, vaultEntry, yTokenRawBalance])
}
