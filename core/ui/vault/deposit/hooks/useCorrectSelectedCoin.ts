import { Chain } from '@core/chain/Chain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { findByTicker } from '@core/chain/coin/utils/findByTicker'
import { useCallback } from 'react'

import { ChainAction } from '../ChainAction'
import { isStakeableCoin } from '../config'
import { useUnmergeOptions } from '../DepositForm/ActionSpecific/UnmergeSpecific/hooks/useUnmergeOptions'
import { useMergeOptions } from './useMergeOptions'
import { useRedeemOptions } from './useRedeemOptions'

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
  const currentTicker = selected?.ticker
  const unmergeOptions = useUnmergeOptions()
  const mergeOptions = useMergeOptions()
  const redeemOptions = useRedeemOptions()

  return useCallback(() => {
    if (coins) {
      if (
        action === 'stake_ruji' ||
        action === 'unstake_ruji' ||
        action === 'withdraw_ruji_rewards'
      ) {
        return findByTicker({
          coins,
          ticker: 'RUJI',
        })
      }

      if (
        action === 'redeem' &&
        !redeemOptions.some(option => option.ticker === currentTicker)
      ) {
        return redeemOptions[0]
      }

      if (action === 'bond') {
        if (currentTicker === 'RUNE') return
        return findByTicker({
          coins,
          ticker: 'RUNE',
        })
      }

      if (
        action === 'merge' &&
        !mergeOptions.some(option => option.ticker === currentTicker)
      ) {
        return mergeOptions[0]
      }

      if (
        action === 'unmerge' &&
        !unmergeOptions.some(option => option.ticker === currentTicker)
      ) {
        return unmergeOptions[0]
      }

      if (action === 'stake' || action === 'unstake') {
        if (chain === Chain.THORChain) {
          return currentTicker && isStakeableCoin(currentTicker)
            ? selected
            : findByTicker({
                coins,
                ticker: 'TCY',
              })
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
      if (currentTicker === 'RUNE') return null
      return selected
    }

    return selected
  }, [
    coins,
    action,
    selected,
    redeemOptions,
    mergeOptions,
    unmergeOptions,
    currentTicker,
    chain,
  ])
}
