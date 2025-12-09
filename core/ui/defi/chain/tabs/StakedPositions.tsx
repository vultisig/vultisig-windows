import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useDefiPositions } from '@core/ui/storage/defiPositions'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useTranslation } from 'react-i18next'

import { StakeCard } from '../components/stake/StakeCard'
import { thorchainTokens } from '../queries/tokens'
import { useDefiChainPositionsQuery } from '../queries/useDefiChainPositionsQuery'
import { useCurrentDefiChain } from '../useCurrentDefiChain'
import { DefiPositionEmptyState } from './DefiPositionEmptyState'

const getStakeToken = (chain: Chain, id: string) => {
  if (id === 'thor-stake-tcy') return thorchainTokens.tcy
  if (id === 'thor-stake-stcy') return thorchainTokens.stcy
  if (id === 'thor-stake-ruji') return thorchainTokens.ruji
  return { ...chainFeeCoin[chain], chain }
}

export const StakedPositions = () => {
  const chain = useCurrentDefiChain()
  const selectedPositions = useDefiPositions(chain)
  const { data, isPending, error } = useDefiChainPositionsQuery(chain)
  const navigate = useCoreNavigate()
  const { t } = useTranslation()

  const actionsDisabled = chain !== Chain.THORChain

  if (error) {
    return (
      <CenterAbsolutely>
        <Text color="danger">{extractErrorMsg(error)}</Text>
      </CenterAbsolutely>
    )
  }

  if (
    !isPending &&
    chain === Chain.THORChain &&
    !data?.stake &&
    selectedPositions.length > 0
  ) {
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
    action: 'stake' | 'unstake' | 'withdraw_ruji_rewards'
  ) => {
    if (actionsDisabled) return

    const token = getStakeToken(chain, id)

    navigate({
      id: 'deposit',
      state: {
        coin: token,
        action,
      },
    })
  }

  const getTitle = (id: string, ticker: string) =>
    id === 'thor-stake-stcy'
      ? t('compounded_token', { ticker })
      : `${t('staked')} ${ticker}`

  return (
    <VStack gap={12}>
      {isPending && positions.length === 0 ? (
        <VStack gap={12}>
          {[1, 2, 3].map(key => {
            const token = getStakeToken(chain, 'thor-stake-tcy')
            return (
              <StakeCard
                key={key}
                id="thor-stake-tcy"
                coin={token}
                title={getTitle('thor-stake-tcy', token.ticker)}
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
        const token = getStakeToken(chain, position.id)
        return (
          <StakeCard
            key={position.id}
            id={position.id}
            coin={token}
            title={getTitle(position.id, token.ticker)}
            amount={position.amount}
            fiat={position.fiatValue}
            apr={position.apr}
            estimatedReward={position.estimatedReward}
            rewards={position.rewards}
            rewardTicker={position.rewardTicker}
            nextPayout={position.nextPayout}
            onStake={() => navigateTo(position.id, 'stake')}
            onUnstake={() => navigateTo(position.id, 'unstake')}
            onWithdrawRewards={
              position.rewards && position.rewards > 0
                ? () => navigateTo(position.id, 'withdraw_ruji_rewards')
                : undefined
            }
            actionsDisabled={actionsDisabled}
          />
        )
      })}
    </VStack>
  )
}
