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

  const { balance: stakeBalance, balanceUnits: stakeBalanceUnits } =
    useStakeBalance()
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
      return { balance: stakeBalance, balanceUnits: stakeBalanceUnits }
    }

    // A Solana delegate spends the entered amount PLUS the stake account's
    // rent-exempt reserve PLUS the fee, so the form's ceiling is the stakeable
    // balance — bounding on the raw balance would let a max stake through and
    // the ceremony would sign a tx the network rejects at simulation.
    if (selectedChainAction === 'solana_delegate') {
      return {
        balance: fromChainAmount(solanaStakeable, selectedCoin.decimals),
        balanceUnits: solanaStakeable,
      }
    }

    if (selectedChainAction === 'unbond') {
      return {
        balance: unbondableBalance?.humanReadableBalance ?? 0,
        balanceUnits: unbondableBalance?.totalBonded ?? null,
      }
    }

    // Rewards and TRON frozen balances only exist as floats upstream
    if (selectedChainAction === 'withdraw_ruji_rewards') {
      return { balance: stakeAndRewards?.rewardsUSDC ?? 0, balanceUnits: null }
    }

    if (selectedChainAction === 'unfreeze') {
      return { balance: tronFrozenBalance, balanceUnits: null }
    }

    return selectedCoinBalance
  }, [
    selectedChainAction,
    selectedCoin.decimals,
    selectedCoinBalance,
    solanaStakeable,
    stakeBalance,
    stakeBalanceUnits,
    tronFrozenBalance,
    unbondableBalance?.humanReadableBalance,
    unbondableBalance?.totalBonded,
    stakeAndRewards?.rewardsUSDC,
  ])

  return {
    balance: totalTokenAmount.balance,
    /** Balance in chain base units when the source is exact, else null (#4496). */
    balanceUnits: totalTokenAmount.balanceUnits,
  }
}
