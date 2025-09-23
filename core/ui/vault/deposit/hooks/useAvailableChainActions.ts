import { Chain } from '@core/chain/Chain'
import { findByTicker } from '@core/chain/coin/utils/findByTicker'
import { match } from '@lib/utils/match'
import { useMemo } from 'react'

import { useCurrentVaultCoins } from '../../state/currentVaultCoins'
import { ChainAction, chainActionsRecord } from '../ChainAction'
import { isStakeableChain, isStakeableCoin } from '../config'
import { DepositEnabledChain } from '../DepositEnabledChain'
import { useUnmergeOptions } from '../DepositForm/ActionSpecific/UnmergeSpecific/hooks/useUnmergeOptions'
import { useMergeOptions } from './useMergeOptions'
import { useMintOptions } from './useMintOptions'
import { useRedeemOptions } from './useRedeemOptions'

export const useAvailableChainActions = (chain: Chain) => {
  const coins = useCurrentVaultCoins()
  const mintOptions = useMintOptions()
  const redeemOptions = useRedeemOptions()
  const mergeOptions = useMergeOptions()
  const unmergeOptions = useUnmergeOptions()

  const hasStakeableCoins = useMemo(
    () =>
      coins
        .filter(({ chain: currentCoinChain }) => currentCoinChain === chain)
        .some(coin => isStakeableCoin(coin.ticker)),
    [chain, coins]
  )

  const areStakeActionsAvailable = hasStakeableCoins && isStakeableChain(chain)

  const allActions = useMemo<ChainAction[]>(
    () =>
      chain ? (chainActionsRecord[chain as DepositEnabledChain] ?? []) : [],
    [chain]
  )

  return useMemo(
    () =>
      allActions.filter(action =>
        match<ChainAction, boolean>(action, {
          bond: () => true,
          unbond: () => true,
          leave: () => true,
          custom: () => true,
          bond_with_lp: () => !!findByTicker({ coins, ticker: 'CACAO' }),
          unbond_with_lp: () => !!findByTicker({ coins, ticker: 'CACAO' }),
          vote: () => true,
          stake: () => areStakeActionsAvailable,
          unstake: () => areStakeActionsAvailable,
          ibc_transfer: () => true,
          merge: () => mergeOptions.length > 0,
          switch: () => true,
          unmerge: () => unmergeOptions.length > 0,
          mint: () => mintOptions.length > 0,
          redeem: () => redeemOptions.length > 0,
          withdraw_ruji_rewards: () =>
            !!findByTicker({ coins, ticker: 'RUJI' }),
        })
      ),

    [
      areStakeActionsAvailable,
      allActions,
      coins,
      mergeOptions.length,
      mintOptions.length,
      redeemOptions.length,
      unmergeOptions.length,
    ]
  )
}
