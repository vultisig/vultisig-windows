import { Chain } from '@core/chain/Chain'
import { knownCosmosTokens } from '@core/chain/coin/knownTokens/cosmos'
import { ChainAction } from '@core/ui/vault/deposit/ChainAction'
import { useGetTotalAmountAvailableForChain } from '@core/ui/vault/deposit/hooks/useGetAmountTotalBalance'
import { useMemo } from 'react'

import { useUnstakableStcyQuery } from '../DepositForm/ActionSpecific/StakeSpecific/UnstakeSpecific/hooks/useUnstakableSTcyQuery'
import { useDepositAction } from '../providers/DepositActionProvider'
import { useDepositCoin } from '../providers/DepositCoinProvider'
import { useDepositCoinBalance } from './useDepositCoinBalance'
import { useRujiraStakeQuery } from './useRujiraStakeQuery'
import { useTonUnstakableQuery } from './useTonUnstakableQuery'

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
  const [action] = useDepositAction()

  const { data: { humanReadableBalance = 0 } = {} } = useUnstakableStcyQuery({
    address: selectedCoin.address,
    options: {
      enabled: Boolean(
        selectedCoin.address &&
          action === 'unstake' &&
          selectedCoin.ticker === knownCosmosTokens.THORChain.tcy.ticker
      ),
    },
  })

  const { data: stakeAndRewards } = useRujiraStakeQuery()

  const { data: { humanReadableBalance: tonUnstakableBalance = 0 } = {} } =
    useTonUnstakableQuery({
      address: selectedCoin.address,
      options: {
        enabled: Boolean(
          selectedCoin.address &&
            action === 'unstake' &&
            selectedCoin.chain === Chain.Ton
        ),
      },
    })

  const selectedCoinBalance = useDepositCoinBalance({
    action: selectedChainAction,
    chain,
  })

  const totalTokenAmount = useMemo(() => {
    if (selectedChainAction === 'unstake') {
      if (selectedCoin.chain === Chain.Ton) {
        return tonUnstakableBalance
      }

      if (
        selectedCoin.ticker ===
        knownCosmosTokens[Chain.THORChain]['x/ruji'].ticker
      ) {
        return stakeAndRewards?.bonded ?? 0
      }

      if (selectedCoin.ticker === knownCosmosTokens.THORChain.tcy.ticker) {
        return humanReadableBalance
      }
    }

    if (selectedChainAction === 'withdraw_ruji_rewards') {
      return stakeAndRewards?.rewardsUSDC ?? 0
    }

    if (selectedCoin) return selectedCoinBalance
    {
      return totalAmountAvailableForChainData?.totalTokenAmount ?? 0
    }
  }, [
    selectedChainAction,
    selectedCoin,
    selectedCoinBalance,
    stakeAndRewards?.bonded,
    stakeAndRewards?.rewardsUSDC,
    humanReadableBalance,
    tonUnstakableBalance,
    totalAmountAvailableForChainData?.totalTokenAmount,
  ])

  return {
    balance: totalTokenAmount,
    balanceFormatted: totalTokenAmount.toFixed(
      getPrecisionForAction(selectedChainAction)
    ),
  }
}
