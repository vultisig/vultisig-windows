import { Chain } from '@core/chain/Chain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { findByTicker } from '@core/chain/coin/utils/findByTicker'
import { useCallback } from 'react'

import { ChainAction } from '../ChainAction'
import { isStakeableCoin } from '../config'
import { useUnmergeOptions } from '../DepositForm/ActionSpecific/UnmergeSpecific/hooks/useUnmergeOptions'
import { useMergeOptions } from './useMergeOptions'

type Props = {
  chain: Chain
  action: ChainAction
  selected: AccountCoin
  coins: AccountCoin[]
}

export const useCorrectSelectedCoin = ({
  chain,
  action,
  selected,
  coins,
}: Props) => {
  const selTicker = selected?.ticker
  const unmergeOptions = useUnmergeOptions()
  const mergeOptions = useMergeOptions()

  return useCallback(() => {
    if (coins) {
      if (
        action === 'stake_ruji' ||
        action === 'unstake_ruji' ||
        action === 'withdraw_ruji_rewards'
      ) {
        return findByTicker(coins, 'RUJI')
      }

      if (action === 'bond') {
        if (selTicker === 'RUNE') return
        return findByTicker(coins, 'RUNE')
      }

      if (
        action === 'merge' &&
        !mergeOptions.some(option => option.ticker === selTicker)
      ) {
        return mergeOptions[0]
      }

      if (
        action === 'unmerge' &&
        !unmergeOptions.some(option => option.ticker === selTicker)
      ) {
        return (
          unmergeOptions.find(c => c.ticker === selTicker) || unmergeOptions[0]
        )
      }

      if (action === 'stake' || action === 'unstake') {
        if (chain === Chain.THORChain) {
          return selTicker && isStakeableCoin(selTicker)
            ? selected
            : findByTicker(coins, 'TCY')
        }
        return null
      }
    }

    if (
      action === 'merge' ||
      action === 'unmerge' ||
      action === 'ibc_transfer' ||
      action === 'switch' ||
      action === 'redeem'
    ) {
      if (selTicker === 'RUNE') return null
      return selected
    }

    return selected
  }, [action, chain, coins, mergeOptions, selTicker, selected, unmergeOptions])
}
