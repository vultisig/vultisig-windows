import { Chain } from '@core/chain/Chain'
import { areEqualCoins } from '@core/chain/coin/Coin'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useDefiPositions } from '@core/ui/storage/defiPositions'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
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

export const StakedPositions = () => {
  const chain = useCurrentDefiChain()
  const selectedPositions = useDefiPositions(chain)
  const { data, isPending, error } = useDefiChainPositionsQuery(chain)
  const navigate = useCoreNavigate()
  const vaultCoins = useCurrentVaultCoins()
  const { t } = useTranslation()
  const translate = (key: string, params?: Record<string, unknown>) =>
    t(key as any, params as any) as string

  const actionsDisabled = chain !== Chain.THORChain && chain !== Chain.MayaChain

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

  const navigateTo = (
    id: string,
    action:
      | 'stake'
      | 'unstake'
      | 'withdraw_ruji_rewards'
      | 'add_cacao_pool'
      | 'remove_cacao_pool',
    isDisabled: boolean
  ) => {
    if (actionsDisabled || isDisabled) return

    const token = resolveStakeToken(chain, id)

    navigate({
      id: 'deposit',
      state: {
        coin: token,
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
                id="thor-stake-tcy"
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
        const actionsDisabledReason = hasRequiredCoin
          ? undefined
          : t('defi_token_required', { ticker: token.ticker })
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
          actionsDisabled || resolverDisabled || !hasRequiredCoin

        const handleNavigate = (
          action:
            | 'stake'
            | 'unstake'
            | 'withdraw_ruji_rewards'
            | 'add_cacao_pool'
            | 'remove_cacao_pool'
        ) => navigateTo(position.id, action, cardActionsDisabled)

        return (
          <StakeCard
            key={position.id}
            id={position.id}
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
