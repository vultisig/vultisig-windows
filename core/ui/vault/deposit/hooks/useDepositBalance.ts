import { Chain } from '@core/chain/Chain'
import { knownCosmosTokens } from '@core/chain/coin/knownTokens/cosmos'
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

  const totalTokenAmount = useMemo(() => {
    if (
      selectedChainAction === 'unstake' &&
      selectedCoin.ticker ===
        knownCosmosTokens[Chain.THORChain]['x/ruji'].ticker
    ) {
      return stakeAndRewards?.bonded ?? 0
    }
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

  return {
    balance: totalTokenAmount,
    balanceFormatted: totalTokenAmount.toFixed(
      getPrecisionForAction(selectedChainAction)
    ),
  }
}
