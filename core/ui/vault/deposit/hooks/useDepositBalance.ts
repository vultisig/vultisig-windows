import { ChainAction } from '@core/ui/vault/deposit/ChainAction'
import { useMemo } from 'react'

import { useDepositCoin } from '../providers/DepositCoinProvider'
import { useStakeBalance } from '../staking/useStakeBalance'
import { useDepositCoinBalance } from './useDepositCoinBalance'
import { useRujiraStakeQuery } from './useRujiraStakeQuery'
import { useUnbondableBalanceQuery } from './useUnbondableBalanceQuery'

type Params = {
  selectedChainAction: ChainAction
}

export const useDepositBalance = ({ selectedChainAction }: Params) => {
  const [selectedCoin] = useDepositCoin()
  const chain = selectedCoin.chain

  const { balance: stakeBalance } = useStakeBalance()
  const { data: stakeAndRewards } = useRujiraStakeQuery()
  const { data: unbondableBalance } = useUnbondableBalanceQuery({
    enabled: selectedChainAction === 'unbond',
  })

  const selectedCoinBalance = useDepositCoinBalance({
    action: selectedChainAction,
    chain,
  })

  const totalTokenAmount = useMemo(() => {
    if (selectedChainAction === 'unstake') {
      return stakeBalance
    }

    if (selectedChainAction === 'unbond') {
      return unbondableBalance?.humanReadableBalance ?? 0
    }

    if (selectedChainAction === 'withdraw_ruji_rewards') {
      return stakeAndRewards?.rewardsUSDC ?? 0
    }

    return selectedCoinBalance
  }, [
    selectedChainAction,
    selectedCoinBalance,
    stakeBalance,
    unbondableBalance?.humanReadableBalance,
    stakeAndRewards?.rewardsUSDC,
  ])

  return {
    balance: totalTokenAmount,
  }
}
