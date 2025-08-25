import { Chain } from '@core/chain/Chain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { findByTicker } from '@core/chain/coin/utils/findByTicker'
import { useMemo } from 'react'

import { ChainAction } from '../ChainAction'
import { isStakeableCoin } from '../config'
import { useUnmergeOptions } from '../DepositForm/ActionSpecific/UnmergeSpecific/hooks/useUnmergeOptions'
import { useMergeOptions } from './useMergeOptions'
import { useMintOptions } from './useMintOptions'
import { useRedeemOptions } from './useRedeemOptions'

type Props = {
  chain?: Chain
  action: ChainAction
  selected?: AccountCoin
  coins?: AccountCoin[]
}

export const useCorrectSelectedCoin = ({
  chain,
  action,
  selected,
  coins,
}: Props) => {
  const unmergeOptions = useUnmergeOptions()
  const mergeOptions = useMergeOptions()
  const redeemOptions = useRedeemOptions()
  const mintOptions = useMintOptions()

  const isReady = useMemo(() => {
    if (!coins || !selected) return false
    switch (action) {
      case 'mint':
        return mintOptions.length > 0
      case 'redeem':
        return redeemOptions.length > 0
      case 'merge':
        return mergeOptions.length > 0
      case 'unmerge':
        return unmergeOptions.length > 0
      default:
        return true
    }
  }, [
    action,
    coins,
    selected,
    mergeOptions,
    mintOptions,
    redeemOptions,
    unmergeOptions,
  ])

  const correctedCoin = useMemo(() => {
    if (!isReady || !coins || !selected) return undefined

    const currentTicker = selected.ticker

    if (
      action === 'stake_ruji' ||
      action === 'unstake_ruji' ||
      action === 'withdraw_ruji_rewards'
    ) {
      return findByTicker({ coins, ticker: 'RUJI' }) ?? selected
    }

    if (action === 'mint') {
      const ok = findByTicker({ coins: mintOptions, ticker: currentTicker })
      return ok ?? mintOptions[0] ?? selected
    }

    if (action === 'redeem') {
      const ok = findByTicker({ coins: redeemOptions, ticker: currentTicker })
      return ok ?? redeemOptions[0] ?? selected
    }

    if (action === 'bond') {
      if (currentTicker !== 'RUNE') {
        return findByTicker({ coins, ticker: 'RUNE' }) ?? selected
      }
      return selected
    }

    if (action === 'merge') {
      const ok = findByTicker({ coins: mergeOptions, ticker: currentTicker })
      return ok ?? mergeOptions[0] ?? selected
    }

    if (action === 'unmerge') {
      const ok = findByTicker({ coins: unmergeOptions, ticker: currentTicker })
      return ok ?? unmergeOptions[0] ?? selected
    }

    if (action === 'stake' || action === 'unstake') {
      if (chain !== Chain.THORChain) return selected
      return currentTicker && isStakeableCoin(currentTicker)
        ? selected
        : (findByTicker({ coins, ticker: 'TCY' }) ?? selected)
    }

    return selected
  }, [
    isReady,
    coins,
    selected,
    action,
    chain,
    mergeOptions,
    mintOptions,
    redeemOptions,
    unmergeOptions,
  ])

  return { correctedCoin, isReady }
}
