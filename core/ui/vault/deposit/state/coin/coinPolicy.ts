import { Chain } from '@core/chain/Chain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { findByTicker } from '@core/chain/coin/utils/findByTicker'
import { useCallback } from 'react'

import { ChainAction } from '../../ChainAction'
import { isStakeableCoin } from '../../config'
import { useUnmergeOptions } from '../../DepositForm/ActionSpecific/UnmergeSpecific/hooks/useUnmergeOptions'

type Props = {
  chain: Chain
  action: ChainAction
  selected: AccountCoin
  coins: AccountCoin[]
}

export const useCorrectSelectedCoin = (ctx: Props) => {
  const { chain, action, selected, coins } = ctx
  const selTicker = selected?.ticker
  const unmergeOptions = useUnmergeOptions()

  return useCallback(() => {
    if (coins) {
      if (
        action === 'stake_ruji' ||
        action === 'unstake_ruji' ||
        action === 'withdraw_ruji_rewards'
      ) {
        return findByTicker(coins, 'RUJI')
      }

      // BOND requires RUNE explicitly
      if (action === 'bond') {
        return findByTicker(coins, 'RUNE')
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
  }, [action, chain, coins, selTicker, selected, unmergeOptions])
}
