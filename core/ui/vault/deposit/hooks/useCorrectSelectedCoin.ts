import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { findByTicker } from '@core/chain/coin/utils/findByTicker'
import { useMemo } from 'react'

import { isStakeableCoin } from '../config'
import { useUnmergeOptions } from '../DepositForm/ActionSpecific/UnmergeSpecific/hooks/useUnmergeOptions'
import { useDepositAction } from '../providers/DepositActionProvider'
import { useMergeOptions } from './useMergeOptions'
import { useMintOptions } from './useMintOptions'
import { useRedeemOptions } from './useRedeemOptions'

type Props = {
  selected?: AccountCoin
  coins?: AccountCoin[]
}

export const useCorrectSelectedCoin = ({ selected, coins }: Props) => {
  const [action] = useDepositAction()

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
      const fallbackStakeableCoin = coins.find(coin =>
        isStakeableCoin(coin.ticker)
      )

      if (!fallbackStakeableCoin) {
        throw new Error('No stakeable coin found')
      }

      return currentTicker && isStakeableCoin(currentTicker)
        ? selected
        : fallbackStakeableCoin
    }

    return selected
  }, [
    action,
    coins,
    isReady,
    mergeOptions,
    mintOptions,
    redeemOptions,
    selected,
    unmergeOptions,
  ])

  return { correctedCoin, isReady }
}
