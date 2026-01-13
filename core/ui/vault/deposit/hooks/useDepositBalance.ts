import { ChainAction } from '@core/ui/vault/deposit/ChainAction'
import { useMemo } from 'react'

import { useDepositCoin } from '../providers/DepositCoinProvider'
import { useStakeBalance } from '../staking/useStakeBalance'
import { useDepositCoinBalance } from './useDepositCoinBalance'
import { useRujiraStakeQuery } from './useRujiraStakeQuery'

type Params = {
  selectedChainAction: ChainAction
}

export const useDepositBalance = ({ selectedChainAction }: Params) => {
  const [selectedCoin] = useDepositCoin()
  const chain = selectedCoin.chain

  const { balance: stakeBalance } = useStakeBalance()
  const { data: stakeAndRewards } = useRujiraStakeQuery()

  const selectedCoinBalance = useDepositCoinBalance({
    action: selectedChainAction,
    chain,
  })

  const totalTokenAmount = useMemo(() => {
    if (selectedChainAction === 'unstake') {
      return stakeBalance
    }

    if (selectedChainAction === 'withdraw_ruji_rewards') {
      return stakeAndRewards?.rewardsUSDC ?? 0
    }

    return selectedCoinBalance
  }, [
    selectedChainAction,
    selectedCoinBalance,
    stakeBalance,
    stakeAndRewards?.rewardsUSDC,
  ])

  return {
    balance: totalTokenAmount,
  }
}
