import { Chain } from '@core/chain/Chain'
import { Coin } from '@core/chain/coin/Coin'
import { ChainAction } from '@core/ui/vault/deposit/ChainAction'
import { useGetTotalAmountAvailableForChain } from '@core/ui/vault/deposit/hooks/useGetAmountTotalBalance'
import { useMemo } from 'react'

import { useRujiraStakeQuery } from './useRujiraStakeQuery'
import { useSelectedCoinBalance } from './useSelectedCoinBalance'

type Params = {
  chain: Chain
  selectedChainAction: ChainAction
  selectedCoin: Coin | null
}

const defaultPrecision = 2
const actionPrecision: Partial<Record<ChainAction, number>> = {
  redeem: 4,
}

const getPrecisionForAction = (action: ChainAction) =>
  actionPrecision[action] ?? defaultPrecision

export const useDepositBalance = ({
  chain,
  selectedChainAction,
  selectedCoin,
}: Params) => {
  const { data: totalAmountAvailableForChainData } =
    useGetTotalAmountAvailableForChain(chain)
  const { data: stakeAndRewards } = useRujiraStakeQuery()

  const selectedCoinBalance =
    useSelectedCoinBalance({
      action: selectedChainAction,
      selectedCoin,
      chain,
    }) ?? 0

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
