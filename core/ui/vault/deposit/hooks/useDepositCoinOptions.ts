import { Chain } from '@core/chain/Chain'
import { useMemo } from 'react'

import {
  useCurrentVaultAddresses,
  useCurrentVaultChainCoins,
  useCurrentVaultCoins,
} from '../../state/currentVaultCoins'
import type { ChainAction } from '../ChainAction'
import { depositActionPolicies } from '../depositActionPolicies'
import { useDepositCoin } from '../providers/DepositCoinProvider'
import { useMergeableTokenBalancesQuery } from './useMergeableTokenBalancesQuery'

export function useDepositCoinOptions(action: ChainAction) {
  const [selected] = useDepositCoin()
  const allCoins = useCurrentVaultCoins()
  const thorCoins = useCurrentVaultChainCoins(Chain.THORChain)
  const addresses = useCurrentVaultAddresses()

  const hasBuilder = !!depositActionPolicies[action].buildOptions
  const needsUnmergeBalances = action === 'unmerge' && hasBuilder

  const { data: balances = [], isLoading: balancesLoading } =
    useMergeableTokenBalancesQuery(addresses[Chain.THORChain])

  const options = useMemo(() => {
    const build = depositActionPolicies[action].buildOptions

    if (!build) return []

    return build({
      allCoins,
      thorCoins,
      addresses,
      selected,
      unmergeBalances: needsUnmergeBalances ? balances : undefined,
    })
  }, [
    action,
    allCoins,
    thorCoins,
    addresses,
    selected,
    balances,
    needsUnmergeBalances,
  ])

  const isReady = hasBuilder
    ? options.length > 0 && !(needsUnmergeBalances && balancesLoading)
    : !!selected

  return { options, isReady }
}
