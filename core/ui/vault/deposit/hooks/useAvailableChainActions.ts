import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { findByTicker } from '@core/chain/coin/utils/findByTicker'
import { match } from '@lib/utils/match'
import { useCallback, useMemo } from 'react'

import { useCurrentVaultCoins } from '../../state/currentVaultCoins'
import { ChainAction, chainActionsRecord } from '../ChainAction'
import { isStakeableCoin } from '../config'
import { DepositEnabledChain } from '../DepositEnabledChain'
import { useUnmergeOptions } from '../DepositForm/ActionSpecific/UnmergeSpecific/hooks/useUnmergeOptions'
import { useDepositCoin } from '../providers/DepositCoinProvider'
import { useMergeOptions } from './useMergeOptions'
import { useMintOptions } from './useMintOptions'
import { useRedeemOptions } from './useRedeemOptions'

const hasTicker = (coins: AccountCoin[], ticker?: string) =>
  !!(ticker && findByTicker({ coins, ticker }))

const hasAnyStakeable = (coins?: AccountCoin[]) =>
  (coins ?? []).some(c => isStakeableCoin(c.ticker))

export const useAvailableChainActions = () => {
  const [coin] = useDepositCoin()
  const chain = coin.chain
  const coins = useCurrentVaultCoins()
  const mintOptions = useMintOptions()
  const redeemOptions = useRedeemOptions()
  const mergeOptions = useMergeOptions()
  const unmergeOptions = useUnmergeOptions()

  const allActions = useMemo<ChainAction[]>(
    () =>
      chain ? (chainActionsRecord[chain as DepositEnabledChain] ?? []) : [],
    [chain]
  )

  const isActionAvailable = useCallback(
    (action: ChainAction): boolean => {
      const handlers: Record<ChainAction, () => boolean> = {
        bond: () => hasTicker(coins, 'RUNE'),
        unbond: () => true,
        leave: () => true,
        custom: () => true,
        bond_with_lp: () => true,
        unbond_with_lp: () => true,
        vote: () => true,
        stake: () =>
          hasAnyStakeable(coins.filter(coin => coin.chain === chain)),
        unstake: () =>
          hasAnyStakeable(coins.filter(coin => coin.chain === chain)),
        ibc_transfer: () => true,
        merge: () => mergeOptions.length > 0,
        switch: () => true,
        unmerge: () => unmergeOptions.length > 0,
        mint: () => mintOptions.length > 0,
        redeem: () => redeemOptions.length > 0,
        withdraw_ruji_rewards: () => hasTicker(coins, 'RUJI'),
      }
      return match<ChainAction, boolean>(action, handlers)
    },
    [
      chain,
      coins,
      mergeOptions.length,
      mintOptions.length,
      redeemOptions.length,
      unmergeOptions.length,
    ]
  )

  const availableActions = useMemo(
    () => allActions.filter(isActionAvailable),

    [allActions, isActionAvailable]
  )

  return availableActions
}
