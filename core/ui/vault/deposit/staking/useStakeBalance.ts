import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { knownCosmosTokens } from '@vultisig/core-chain/coin/knownTokens/cosmos'
import { attempt } from '@vultisig/lib-utils/attempt'
import { match } from '@vultisig/lib-utils/match'
import { useMemo } from 'react'

import { useUnstakableBruneQuery } from '../DepositForm/ActionSpecific/StakeSpecific/UnstakeSpecific/hooks/useUnstakableBruneQuery'
import { useUnstakableRujiQuery } from '../DepositForm/ActionSpecific/StakeSpecific/UnstakeSpecific/hooks/useUnstakableRujiQuery'
import { useUnstakableStcyQuery } from '../DepositForm/ActionSpecific/StakeSpecific/UnstakeSpecific/hooks/useUnstakableSTcyQuery'
import { useUnstakableTcyQuery } from '../DepositForm/ActionSpecific/StakeSpecific/UnstakeSpecific/hooks/useUnstakableTcyQuery'
import { useTonUnstakableQuery } from '../hooks/useTonUnstakableQuery'
import { useDepositAction } from '../providers/DepositActionProvider'
import { useDepositCoin } from '../providers/DepositCoinProvider'
import { selectStakeId } from './resolvers'
import { StakeId } from './types'

type StakeBalanceResult = {
  balance: number
  /** Balance in chain base units — exact source for percentage shares (#4496). */
  balanceUnits: bigint
  isLoading: boolean
  stakeId: StakeId | null
}

export const useStakeBalance = (): StakeBalanceResult => {
  const [selectedCoin] = useDepositCoin()
  const [action] = useDepositAction()
  const [{ form }] = useCoreViewState<'deposit'>()
  const thorchainVaultAddress = useCurrentVaultAddress(Chain.THORChain)
  const tonVaultAddress = useCurrentVaultAddress(Chain.Ton)

  const isUnstake = action === 'unstake'
  const isTonChain = selectedCoin.chain === Chain.Ton
  const autocompound = form?.autoCompound === true

  const stakeId = useMemo(() => {
    if (isTonChain) return null
    return (
      attempt(() => selectStakeId(selectedCoin, { autocompound })).data ?? null
    )
  }, [selectedCoin, isTonChain, autocompound])

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

  const { data: rujiData, isLoading: isLoadingRuji } = useUnstakableRujiQuery({
    address: thorchainVaultAddress,
    options: {
      enabled: Boolean(
        thorchainVaultAddress && isUnstake && stakeId === 'ruji'
      ),
    },
  })

  const { data: bruneData, isLoading: isLoadingBrune } =
    useUnstakableBruneQuery({
      address: thorchainVaultAddress,
      options: {
        enabled: Boolean(
          thorchainVaultAddress && isUnstake && stakeId === 'brune'
        ),
      },
    })

  const { data: tonBalance, isLoading: isLoadingTon } = useTonUnstakableQuery({
    address: tonVaultAddress,
    options: {
      enabled: Boolean(tonVaultAddress && isUnstake && isTonChain),
    },
  })

  if (!isUnstake) {
    return { balance: 0, balanceUnits: 0n, isLoading: false, stakeId }
  }

  if (isTonChain) {
    return {
      balance: tonBalance?.humanReadableBalance ?? 0,
      balanceUnits: tonBalance?.chainBalance ?? 0n,
      isLoading: isLoadingTon,
      stakeId: null,
    }
  }

  if (!stakeId) {
    return { balance: 0, balanceUnits: 0n, isLoading: false, stakeId }
  }

  return match(stakeId, {
    'native-tcy': () => ({
      balance: fromChainAmount(
        nativeTcyBalance,
        knownCosmosTokens.THORChain.tcy.decimals
      ),
      balanceUnits: nativeTcyBalance,
      isLoading: isLoadingNativeTcy,
      stakeId,
    }),
    stcy: () => ({
      balance: stcyData?.humanReadableBalance ?? 0,
      balanceUnits: stcyData?.chainBalance ?? 0n,
      isLoading: isLoadingStcy,
      stakeId,
    }),
    ruji: () => ({
      // RUJI surfaces two positions unstaked via different routes; the card the
      // user came from sets `autocompound` (true → auto-compounding / sRUJI).
      balance: (autocompound ? rujiData?.autoCompound : rujiData?.bonded) ?? 0,
      balanceUnits:
        (autocompound ? rujiData?.autoCompoundUnits : rujiData?.bondedUnits) ??
        0n,
      isLoading: isLoadingRuji,
      stakeId,
    }),
    brune: () => ({
      balance: bruneData?.humanReadableBalance ?? 0,
      balanceUnits: bruneData?.chainBalance ?? 0n,
      isLoading: isLoadingBrune,
      stakeId,
    }),
  })
}
