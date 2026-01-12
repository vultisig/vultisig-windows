import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { knownCosmosTokens } from '@core/chain/coin/knownTokens/cosmos'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { attempt } from '@lib/utils/attempt'
import { match } from '@lib/utils/match'
import { useMemo } from 'react'

import { useUnstakableStcyQuery } from '../DepositForm/ActionSpecific/StakeSpecific/UnstakeSpecific/hooks/useUnstakableSTcyQuery'
import { useUnstakableTcyQuery } from '../DepositForm/ActionSpecific/StakeSpecific/UnstakeSpecific/hooks/useUnstakableTcyQuery'
import { useRujiraStakeQuery } from '../hooks/useRujiraStakeQuery'
import { useTonUnstakableQuery } from '../hooks/useTonUnstakableQuery'
import { useDepositAction } from '../providers/DepositActionProvider'
import { useDepositCoin } from '../providers/DepositCoinProvider'
import { selectStakeId } from './resolvers'
import { StakeId } from './types'

type StakeBalanceResult = {
  balance: number
  isLoading: boolean
  stakeId: StakeId | null
}

export const useStakeBalance = (): StakeBalanceResult => {
  const [selectedCoin] = useDepositCoin()
  const [action] = useDepositAction()
  const thorchainVaultAddress = useCurrentVaultAddress(Chain.THORChain)
  const tonVaultAddress = useCurrentVaultAddress(Chain.Ton)

  const isUnstake = action === 'unstake'
  const isTonChain = selectedCoin.chain === Chain.Ton

  const stakeId = useMemo(() => {
    if (isTonChain) return null
    return (
      attempt(() => selectStakeId(selectedCoin, { autocompound: false }))
        .data ?? null
    )
  }, [selectedCoin, isTonChain])

  const { data: nativeTcyBalance = 0n, isLoading: isLoadingNativeTcy } =
    useUnstakableTcyQuery({
      address: thorchainVaultAddress,
      options: {
        enabled: Boolean(
          thorchainVaultAddress && isUnstake && stakeId === 'native-tcy'
        ),
      },
    })

  const { data: stcyData, isLoading: isLoadingStcy } = useUnstakableStcyQuery({
    address: thorchainVaultAddress,
    options: {
      enabled: Boolean(
        thorchainVaultAddress && isUnstake && stakeId === 'stcy'
      ),
    },
  })

  const { data: rujiData, isLoading: isLoadingRuji } = useRujiraStakeQuery()

  const { data: tonBalance, isLoading: isLoadingTon } = useTonUnstakableQuery({
    address: tonVaultAddress,
    options: {
      enabled: Boolean(tonVaultAddress && isUnstake && isTonChain),
    },
  })

  return useMemo((): StakeBalanceResult => {
    if (!isUnstake || !stakeId) {
      return { balance: 0, isLoading: false, stakeId }
    }

    if (isTonChain) {
      return {
        balance: tonBalance?.humanReadableBalance ?? 0,
        isLoading: isLoadingTon,
        stakeId: null,
      }
    }

    return match(stakeId, {
      'native-tcy': () => ({
        balance: fromChainAmount(
          nativeTcyBalance,
          knownCosmosTokens.THORChain.tcy.decimals
        ),
        isLoading: isLoadingNativeTcy,
        stakeId,
      }),
      stcy: () => ({
        balance: stcyData?.humanReadableBalance ?? 0,
        isLoading: isLoadingStcy,
        stakeId,
      }),
      ruji: () => ({
        balance: rujiData?.bonded ?? 0,
        isLoading: isLoadingRuji,
        stakeId,
      }),
    })
  }, [
    isUnstake,
    isTonChain,
    stakeId,
    nativeTcyBalance,
    isLoadingNativeTcy,
    stcyData?.humanReadableBalance,
    isLoadingStcy,
    rujiData?.bonded,
    isLoadingRuji,
    tonBalance?.humanReadableBalance,
    isLoadingTon,
  ])
}
