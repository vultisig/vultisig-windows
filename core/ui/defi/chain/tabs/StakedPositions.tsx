import { Chain } from '@core/chain/Chain'
import { areEqualCoins, extractCoinKey } from '@core/chain/coin/Coin'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useRemoveFromCoinFinderIgnoreMutation } from '@core/ui/storage/coinFinderIgnore'
import { useCreateCoinMutation } from '@core/ui/storage/coins'
import { useDefiPositions } from '@core/ui/storage/defiPositions'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { StakeCard } from '../components/stake/StakeCard'
import {
  resolveStakeActions,
  resolveStakeTitle,
  resolveStakeToken,
} from '../config/stakeUiResolver'
import { useDefiChainPositionsQuery } from '../queries/useDefiChainPositionsQuery'
import { useCurrentDefiChain } from '../useCurrentDefiChain'
import { DefiPositionEmptyState } from './DefiPositionEmptyState'

type StakeActionType =
  | 'stake'
  | 'unstake'
  | 'mint'
  | 'redeem'
  | 'withdraw_ruji_rewards'
  | 'add_cacao_pool'
  | 'remove_cacao_pool'

export const StakedPositions = () => {
  const chain = useCurrentDefiChain()
  const selectedPositions = useDefiPositions(chain)
  const { data, isPending, error } = useDefiChainPositionsQuery(chain)
  const navigate = useCoreNavigate()
  const vaultCoins = useCurrentVaultCoins()
  const createCoin = useCreateCoinMutation()
  const removeFromIgnored = useRemoveFromCoinFinderIgnoreMutation()
  const { t } = useTranslation()
  const [pendingEnableById, setPendingEnableById] = useState<
    Record<string, boolean>
  >({})
  const translate = (key: string, params?: Record<string, unknown>) =>
    t(key as any, params as any) as string

  const actionsDisabled = chain !== Chain.THORChain && chain !== Chain.MayaChain

  const shouldAutoEnableCoin = useMemo(
    () => (_coinId: string) => {
      // Auto-enable coin when user clicks stake/unstake
      return true
    },
    []
  )

  if (error) {
    return (
      <CenterAbsolutely>
        <Text color="danger">{extractErrorMsg(error)}</Text>
      </CenterAbsolutely>
    )
  }

  if (!isPending && !data?.stake && selectedPositions.length > 0) {
    return (
      <CenterAbsolutely>
        <Text color="danger">{t('failed_to_load')}</Text>
      </CenterAbsolutely>
    )
  }

  if (selectedPositions.length === 0) {
    return <DefiPositionEmptyState />
  }

  const selected = new Set(selectedPositions)
  const positions =
    data?.stake?.positions.filter(position => selected.has(position.id)) ?? []

  if (!isPending && positions.length === 0) {
    return <DefiPositionEmptyState />
  }

  const autoEnableCoinIfNeeded = async (coinId: string, token: any) => {
    if (!shouldAutoEnableCoin(coinId)) return

    try {
      setPendingEnableById(prev => ({ ...prev, [coinId]: true }))
      await removeFromIgnored.mutateAsync(extractCoinKey(token))
      await createCoin.mutateAsync(token)
    } finally {
      setPendingEnableById(prev => ({ ...prev, [coinId]: false }))
    }
  }

  const navigateTo = (
    id: string,
    action: StakeActionType,
    isDisabled: boolean
  ) => {
    if (actionsDisabled || isDisabled) return

    const token = resolveStakeToken(chain, id)

    const coinForAction =
      chain === Chain.THORChain && action === 'mint'
        ? id === 'thor-stake-ytcy'
          ? resolveStakeToken(chain, 'thor-stake-tcy')
          : resolveStakeToken(chain, 'thor-stake-rune')
        : token

    navigate({
      id: 'deposit',
      state: {
        coin: extractCoinKey(coinForAction),
        action,
      },
    })
  }

  return (
    <VStack
      gap={12}
      style={{
        marginBottom: 100,
      }}
    >
      {isPending && positions.length === 0 ? (
        <VStack gap={12}>
          {[1, 2, 3].map(key => {
            const token = resolveStakeToken(chain, 'thor-stake-tcy')
            return (
              <StakeCard
                key={key}
                coin={token}
                title={resolveStakeTitle({
                  position: {
                    id: 'thor-stake-tcy',
                    ticker: token.ticker,
                    amount: 0n,
                    fiatValue: 0,
                  },
                  coin: token,
                  translate,
                })}
                amount={0n}
                fiat={0}
                isSkeleton
              />
            )
          })}
        </VStack>
      ) : null}
      {isPending && positions.length > 0 && <Spinner />}
      {positions.map(position => {
        const token = resolveStakeToken(chain, position.id)
        const hasRequiredCoin = vaultCoins.some(current =>
          areEqualCoins(current, token)
        )
        const supportsAutoEnable = shouldAutoEnableCoin(position.id)
        const missingCoinAndBlocked = !hasRequiredCoin && !supportsAutoEnable
        const actionsDisabledReason = missingCoinAndBlocked
          ? t('defi_token_required', { ticker: token.ticker })
          : undefined
        const {
          stakeAction,
          unstakeAction,
          stakeLabel,
          unstakeLabel,
          actionsDisabled: resolverDisabled,
        } = resolveStakeActions({
          chain,
          position,
          translate: key => t(key as any),
        })
        const cardActionsDisabled =
          actionsDisabled || resolverDisabled || missingCoinAndBlocked
        const hideStats =
          position.id === 'thor-stake-stcy' ||
          position.id === 'thor-stake-yrune' ||
          position.id === 'thor-stake-ytcy'

        const handleNavigate = async (action: StakeActionType) => {
          if (cardActionsDisabled) return
          if (!hasRequiredCoin && supportsAutoEnable) {
            await autoEnableCoinIfNeeded(position.id, token)
          }
          navigateTo(position.id, action, false)
        }

        return (
          <StakeCard
            key={position.id}
            coin={token}
            title={resolveStakeTitle({
              position,
              coin: token,
              translate,
            })}
            amount={position.amount}
            fiat={position.fiatValue}
            apr={position.apr}
            estimatedReward={position.estimatedReward}
            rewards={position.rewards}
            rewardTicker={position.rewardTicker}
            nextPayout={position.nextPayout}
            actionsDisabled={cardActionsDisabled}
            actionsDisabledReason={actionsDisabledReason}
            canUnstake={position.canUnstake}
            unstakeAvailableDate={position.unstakeAvailableDate}
            stakeLabel={stakeLabel}
            unstakeLabel={unstakeLabel}
            hideStats={hideStats}
            isPendingAction={pendingEnableById[position.id]}
            onStake={() => handleNavigate(stakeAction)}
            onUnstake={() => handleNavigate(unstakeAction)}
            onWithdrawRewards={
              position.rewards && position.rewards > 0
                ? () => handleNavigate('withdraw_ruji_rewards')
                : undefined
            }
          />
        )
      })}
    </VStack>
  )
}
