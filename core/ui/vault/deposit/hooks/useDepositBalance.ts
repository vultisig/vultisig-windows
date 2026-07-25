import { ChainAction } from '@core/ui/vault/deposit/ChainAction'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { TronResourceType } from '@vultisig/core-chain/chains/tron/resources'
import { useMemo } from 'react'

import { useDepositCoin } from '../providers/DepositCoinProvider'
import { useStakeBalance } from '../staking/useStakeBalance'
import { useDepositCoinBalance } from './useDepositCoinBalance'
import { useRujiraStakeQuery } from './useRujiraStakeQuery'
import { useSolanaStakeableBalance } from './useSolanaStakeableBalance'
import { useTronFrozenBalance } from './useTronFrozenBalance'
import { useUnbondableBalanceQuery } from './useUnbondableBalanceQuery'

type Params = {
  selectedChainAction: ChainAction
  tronResourceType?: TronResourceType
}

export const useDepositBalance = ({
  selectedChainAction,
  tronResourceType,
}: Params) => {
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

  const tronFrozenBalance = useTronFrozenBalance({
    resourceType: tronResourceType ?? 'BANDWIDTH',
  })

  const { stakeable: solanaStakeable } = useSolanaStakeableBalance()

  const totalTokenAmount = useMemo(() => {
    if (selectedChainAction === 'unstake') {
      return stakeBalance
    }

    // A Solana delegate spends the entered amount PLUS the stake account's
    // rent-exempt reserve PLUS the fee, so the form's ceiling is the stakeable
    // balance — bounding on the raw balance would let a max stake through and
    // the ceremony would sign a tx the network rejects at simulation.
    if (selectedChainAction === 'solana_delegate') {
      return fromChainAmount(solanaStakeable, selectedCoin.decimals)
    }

    if (selectedChainAction === 'unbond') {
      return unbondableBalance?.humanReadableBalance ?? 0
    }

    if (selectedChainAction === 'withdraw_ruji_rewards') {
      return stakeAndRewards?.rewardsUSDC ?? 0
    }

    if (selectedChainAction === 'unfreeze') {
      return tronFrozenBalance
    }

    return selectedCoinBalance
  }, [
    selectedChainAction,
    selectedCoin.decimals,
    selectedCoinBalance,
    solanaStakeable,
    stakeBalance,
    tronFrozenBalance,
    unbondableBalance?.humanReadableBalance,
    stakeAndRewards?.rewardsUSDC,
  ])

  return {
    balance: totalTokenAmount,
  }
}
