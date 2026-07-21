import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { findByTicker } from '@vultisig/core-chain/coin/utils/findByTicker'
import { isFeeCoin } from '@vultisig/core-chain/coin/utils/isFeeCoin'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { match } from '@vultisig/lib-utils/match'
import { useCallback } from 'react'

import { useCurrentVaultCoins } from '../../state/currentVaultCoins'
import { isBruneStakeCoin, isStakeableCoin } from '../config'
import { useUnmergeOptions } from '../DepositForm/ActionSpecific/UnmergeSpecific/hooks/useUnmergeOptions'
import { useDepositAction } from '../providers/DepositActionProvider'
import { useMergeOptions } from './useMergeOptions'
import { useMintOptions } from './useMintOptions'
import { useRedeemOptions } from './useRedeemOptions'

export const useCorrectSelectedCoin = () => {
  const [action] = useDepositAction()
  const coins = useCurrentVaultCoins()
  const unmergeOptions = useUnmergeOptions()
  const mergeOptions = useMergeOptions()
  const redeemOptions = useRedeemOptions()
  const mintOptions = useMintOptions()

  return useCallback(
    (currentDepositCoin: AccountCoin) => {
      const isStakeable = (coin: AccountCoin) =>
        isStakeableCoin(coin.ticker) || isBruneStakeCoin(coin)

      const fallbackStakeableCoin = coins.find(
        coin => coin.chain === currentDepositCoin.chain && isStakeable(coin)
      )

      const selectStakeableCoin = () => {
        if (!fallbackStakeableCoin) {
          throw new Error('No stakeable coin found')
        }

        return isStakeable(currentDepositCoin)
          ? currentDepositCoin
          : fallbackStakeableCoin
      }

      const ticker = currentDepositCoin.ticker
      const potentialRUNECoin = findByTicker({ coins, ticker: 'RUNE' })
      const potentialCACAOCoin = findByTicker({ coins, ticker: 'CACAO' })

      return match(action, {
        ibc_transfer: () => currentDepositCoin,
        switch: () => currentDepositCoin,
        bond_with_lp: () => shouldBePresent(potentialCACAOCoin),
        unbond_with_lp: () => shouldBePresent(potentialCACAOCoin),
        vote: () => shouldBePresent(potentialRUNECoin),
        custom: () => currentDepositCoin,
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
        // Claiming RUJI rewards is a RUJI-only action; force the RUJI coin so a
        // different selected coin (e.g. bRUNE) can't reach a claim path its
        // resolver doesn't support.
        withdraw_ruji_rewards: () =>
          shouldBePresent(findByTicker({ coins, ticker: 'RUJI' })),
        unstake: selectStakeableCoin,
        unbond: () => shouldBePresent(findByTicker({ coins, ticker: 'RUNE' })),
        leave: () =>
          findByTicker({ coins, ticker: 'RUNE' }) ||
          findByTicker({ coins, ticker: 'CACAO' }),
        add_cacao_pool: () => shouldBePresent(potentialCACAOCoin),
        remove_cacao_pool: () => shouldBePresent(potentialCACAOCoin),
        add_thor_lp: () => {
          if (currentDepositCoin.chain !== Chain.THORChain) {
            if (isFeeCoin(currentDepositCoin)) {
              return currentDepositCoin
            }
            const nativeCoin = coins.find(
              c => c.chain === currentDepositCoin.chain && isFeeCoin(c)
            )
            return shouldBePresent(nativeCoin)
          }
          return shouldBePresent(potentialRUNECoin)
        },
        remove_thor_lp: () => shouldBePresent(potentialRUNECoin),
        // The trust-line token (issuer/currency) is chosen in the action form
        // and built at keysign time; keep the native XRP fee coin selected here.
        open_trust_line: () => currentDepositCoin,
        freeze: () => currentDepositCoin,
        unfreeze: () => currentDepositCoin,
        delegate: () => currentDepositCoin,
        undelegate: () => currentDepositCoin,
        redelegate: () => currentDepositCoin,
        claim_rewards: () => currentDepositCoin,
        solana_delegate: () => currentDepositCoin,
        solana_unstake: () => currentDepositCoin,
        solana_withdraw: () => currentDepositCoin,
        solana_move_stake: () => currentDepositCoin,
        solana_finish_move: () => currentDepositCoin,
      })
    },
    [action, coins, mergeOptions, mintOptions, redeemOptions, unmergeOptions]
  )
}
