import { ChainAction } from '@core/ui/vault/deposit/ChainAction'
import { useGetTotalAmountAvailableForChain } from '@core/ui/vault/deposit/hooks/useGetAmountTotalBalance'
import { useMemo } from 'react'

import { useDepositCoin } from '../providers/DepositCoinProvider'
import { useDepositCoinBalance } from './useDepositCoinBalance'
import { useRujiraStakeQuery } from './useRujiraStakeQuery'

type Params = {
  selectedChainAction: ChainAction
}

const defaultPrecision = 2
const actionPrecision: Partial<Record<ChainAction, number>> = {
  redeem: 4,
}

const getPrecisionForAction = (action: ChainAction) =>
  actionPrecision[action] ?? defaultPrecision

export const useDepositBalance = ({ selectedChainAction }: Params) => {
  const [selectedCoin] = useDepositCoin()
  const chain = selectedCoin.chain
  const { data: totalAmountAvailableForChainData } =
    useGetTotalAmountAvailableForChain(chain)
  const { data: stakeAndRewards } = useRujiraStakeQuery()

  const selectedCoinBalance = useDepositCoinBalance({
    action: selectedChainAction,
    chain,
  })

  const isTCYAction =
    selectedChainAction === 'stake' || selectedChainAction === 'unstake'

  const totalTokenAmount = useMemo(() => {
    if (selectedChainAction === 'unstake_ruji')
      return stakeAndRewards?.bonded ?? 0
    if (selectedChainAction === 'withdraw_ruji_rewards')
      return stakeAndRewards?.rewardsUSDC ?? 0
    if (selectedCoin) return selectedCoinBalance
    return totalAmountAvailableForChainData?.totalTokenAmount ?? 0
  }, [
    selectedChainAction,
    stakeAndRewards?.bonded,
    stakeAndRewards?.rewardsUSDC,
    selectedCoin,
    selectedCoinBalance,
    totalAmountAvailableForChainData?.totalTokenAmount,
  ])

  const balance = useMemo(() => {
    if (isTCYAction) return 0
    return totalTokenAmount
  }, [isTCYAction, totalTokenAmount])

  return {
    balance,
    balanceFormatted: balance.toFixed(
      getPrecisionForAction(selectedChainAction)
    ),
  }
}
