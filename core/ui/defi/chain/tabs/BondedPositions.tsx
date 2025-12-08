import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useDefiPositions } from '@core/ui/storage/defiPositions'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { ArrowUpRightIcon } from '@lib/ui/icons/ArrowUpRightIcon'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { EmptyState } from '@lib/ui/status/EmptyState'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { sum } from '@lib/utils/array/sum'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { BondedSummaryCard } from '../components/bond/BondedSummaryCard'
import { BondNodeCard } from '../components/bond/BondNodeCard'
import {
  BondCard,
  BondSectionHeader,
  BondSectionTitle,
} from '../components/bond/CardPrimitives'
import { useDefiChainPositionsQuery } from '../queries/useDefiChainPositionsQuery'
import { useCurrentDefiChain } from '../useCurrentDefiChain'
import { DefiPositionEmptyState } from './DefiPositionEmptyState'

const AvailableNodeCard = styled(BondCard)`
  background: ${getColor('foreground')};
`

export const BondedPositions = () => {
  const chain = useCurrentDefiChain()
  const selectedPositions = useDefiPositions(chain)
  const { data, isPending, error } = useDefiChainPositionsQuery(chain)
  const navigate = useCoreNavigate()
  const { t } = useTranslation()

  const isBondingDisabled = chain !== Chain.THORChain
  const bondCoin = chainFeeCoin[chain] ?? chainFeeCoin[Chain.THORChain]

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
    !data?.bond &&
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
    data?.bond?.positions.filter(position => selected.has(position.id)) ?? []

  const totalBonded = positions.reduce(
    (acc, position) => acc + position.amount,
    0n
  )
  const totalFiat = sum(positions.map(position => position.fiatValue))
  const canUnbond = Boolean(data?.bond?.canUnbond)
  const availableNodes = data?.bond?.availableNodes ?? []

  const navigateToBond = (overrides?: { nodeAddress?: string }) => {
    if (isBondingDisabled) return

    navigate({
      id: 'deposit',
      state: {
        coin: { ...bondCoin, chain },
        action: 'bond',
        form: overrides?.nodeAddress
          ? { nodeAddress: overrides.nodeAddress }
          : undefined,
      },
    })
  }

  const navigateToUnbond = (nodeAddress: string) => {
    if (isBondingDisabled) return

    navigate({
      id: 'deposit',
      state: {
        coin: { ...bondCoin, chain },
        action: 'unbond',
        form: { nodeAddress },
      },
    })
  }

  return (
    <VStack gap={16}>
      <BondedSummaryCard
        coin={bondCoin}
        totalBonded={totalBonded}
        fiat={totalFiat}
        onBond={() => navigateToBond()}
        isPending={isPending}
        isSkeleton={isPending && positions.length === 0}
        isBondingDisabled={isBondingDisabled}
      />

      <VStack gap={12}>
        <BondSectionHeader>
          <BondSectionTitle size={14} weight="600" color="contrast">
            {t('active_nodes')}
          </BondSectionTitle>
        </BondSectionHeader>
        {isPending && positions.length === 0 ? (
          <VStack gap={12}>
            {[1, 2].map(key => (
              <BondCard key={key}>
                <Skeleton width="60%" height="16px" />
                <Skeleton width="40%" height="24px" />
                <Skeleton width="100%" height="20px" />
              </BondCard>
            ))}
          </VStack>
        ) : positions.length > 0 ? (
          positions.map(position => (
            <BondNodeCard
              key={position.nodeAddress}
              coin={bondCoin}
              nodeAddress={position.nodeAddress}
              amount={position.amount}
              apy={position.apy}
              nextReward={position.nextReward}
              nextChurn={position.nextChurn}
              status={position.status}
              onBond={() =>
                navigateToBond({ nodeAddress: position.nodeAddress })
              }
              onUnbond={() => navigateToUnbond(position.nodeAddress)}
              canUnbond={canUnbond}
              fiatValue={position.fiatValue}
              isBondingDisabled={isBondingDisabled}
            />
          ))
        ) : (
          <EmptyState title={t('no_active_nodes')} />
        )}
      </VStack>

      <VStack gap={8}>
        <BondSectionHeader>
          <BondSectionTitle size={14} weight="600" color="contrast">
            {t('available_nodes')}
          </BondSectionTitle>
        </BondSectionHeader>
        {availableNodes.length ? (
          availableNodes.map(node => (
            <AvailableNodeCard key={node}>
              <HStack
                justifyContent="space-between"
                alignItems="center"
                gap={12}
              >
                <VStack gap={4}>
                  <Text size={13} color="shy">
                    {t('node_address')}
                  </Text>
                  <Text size={15} weight="600" color="contrast">
                    {node}
                  </Text>
                </VStack>
                <IconButton
                  kind="secondary"
                  onClick={() => navigateToBond({ nodeAddress: node })}
                  size="lg"
                  style={{ gap: 6 }}
                  disabled={isBondingDisabled}
                >
                  <ArrowUpRightIcon />
                  <Text size={12} weight="600">
                    {t('request_to_bond')}
                  </Text>
                </IconButton>
              </HStack>
            </AvailableNodeCard>
          ))
        ) : !isPending ? (
          <EmptyState title={t('no_available_nodes')} />
        ) : null}
      </VStack>
    </VStack>
  )
}
