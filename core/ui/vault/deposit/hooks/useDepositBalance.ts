import { ChainAction } from '@core/ui/vault/deposit/ChainAction'
import { useGetTotalAmountAvailableForChain } from '@core/ui/vault/deposit/hooks/useGetAmountTotalBalance'
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

  const { data: totalAmountAvailableForChainData } =
    useGetTotalAmountAvailableForChain(chain)

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

    if (selectedCoin) return selectedCoinBalance

    return totalAmountAvailableForChainData?.totalTokenAmount ?? 0
  }, [
    selectedChainAction,
    selectedCoin,
    selectedCoinBalance,
    stakeBalance,
    stakeAndRewards?.rewardsUSDC,
    totalAmountAvailableForChainData?.totalTokenAmount,
  ])

  return {
    balance: totalTokenAmount,
  }
}
