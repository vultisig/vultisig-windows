import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { findByTicker } from '@core/chain/coin/utils/findByTicker'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { match } from '@lib/utils/match'
import { useCallback, useMemo } from 'react'

import { useCurrentVaultCoins } from '../../state/currentVaultCoins'
import { isStakeableCoin } from '../config'
import { useUnmergeOptions } from '../DepositForm/ActionSpecific/UnmergeSpecific/hooks/useUnmergeOptions'
import { useDepositAction } from '../providers/DepositActionProvider'
import { useMergeOptions } from './useMergeOptions'
import { useMintOptions } from './useMintOptions'
import { useRedeemOptions } from './useRedeemOptions'

type Props = {
  currentDepositCoin: AccountCoin
}

export const useCorrectSelectedCoin = ({ currentDepositCoin }: Props) => {
  const [action] = useDepositAction()
  const coins = useCurrentVaultCoins()
  const unmergeOptions = useUnmergeOptions()
  const mergeOptions = useMergeOptions()
  const redeemOptions = useRedeemOptions()
  const mintOptions = useMintOptions()

  const fallbackStakeableCoin = coins.find(coin => isStakeableCoin(coin.ticker))

  const ticker = currentDepositCoin.ticker
  const potentialRUNECoin = findByTicker({ coins, ticker: 'RUNE' })
  const potentialCACAOCoin = findByTicker({ coins, ticker: 'CACAO' })

  const selectStakeableCoin = useCallback(() => {
    if (!fallbackStakeableCoin) {
      throw new Error('No stakeable coin found')
    }

    return isStakeableCoin(currentDepositCoin.ticker)
      ? currentDepositCoin
      : fallbackStakeableCoin
  }, [currentDepositCoin, fallbackStakeableCoin])

  return useMemo(
    () =>
      match(action, {
        ibc_transfer: () => currentDepositCoin,
        switch: () => currentDepositCoin,
        bond_with_lp: () => shouldBePresent(potentialCACAOCoin),
        unbond_with_lp: () => shouldBePresent(potentialCACAOCoin),
        vote: () => shouldBePresent(potentialRUNECoin),
        custom: () => shouldBePresent(potentialRUNECoin),
        mint: () => {
          const currentCoin = findByTicker({
            coins: mintOptions,
            ticker,
          })
          return shouldBePresent(currentCoin || mintOptions[0])
        },
        redeem: () => {
          const currentCoin = findByTicker({
            coins: redeemOptions,
            ticker,
          })
          return shouldBePresent(currentCoin || redeemOptions[0])
        },
        bond: () => shouldBePresent(potentialRUNECoin),
        merge: () => {
          const currentCoin = findByTicker({
            coins: mergeOptions,
            ticker,
          })
          return shouldBePresent(currentCoin || mergeOptions[0])
        },
        unmerge: () => {
          const currentCoin = findByTicker({
            coins: unmergeOptions,
            ticker,
          })
          return shouldBePresent(currentCoin || unmergeOptions[0])
        },
        stake: selectStakeableCoin,
        withdraw_ruji_rewards: () => currentDepositCoin,
        unstake: selectStakeableCoin,
        unbond: () => shouldBePresent(findByTicker({ coins, ticker: 'RUNE' })),
        leave: () =>
          findByTicker({ coins, ticker: 'RUNE' }) ||
          findByTicker({ coins, ticker: 'CACAO' }),
      }),
    [
      action,
      coins,
      currentDepositCoin,
      selectStakeableCoin,
      mergeOptions,
      mintOptions,
      potentialCACAOCoin,
      potentialRUNECoin,
      redeemOptions,
      ticker,
      unmergeOptions,
    ]
  )
}
