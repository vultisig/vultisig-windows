import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useDefiPositions } from '@core/ui/storage/defiPositions'
import { Button } from '@lib/ui/buttons/Button'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { ArrowUpRightIcon } from '@lib/ui/icons/ArrowUpRightIcon'
import { ChevronDownIcon } from '@lib/ui/icons/ChevronDownIcon'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { EmptyState } from '@lib/ui/status/EmptyState'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { sum } from '@lib/utils/array/sum'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { BondedSummaryCard } from '../components/bond/BondedSummaryCard'
import { BondNodeCard } from '../components/bond/BondNodeCard'
import { BondCard, BondStatusPill } from '../components/bond/CardPrimitives'
import { useDefiChainPositionsQuery } from '../queries/useDefiChainPositionsQuery'
import { useCurrentDefiChain } from '../useCurrentDefiChain'
import { DefiPositionEmptyState } from './DefiPositionEmptyState'

const SectionHeader = styled(UnstyledButton)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundSuper')};
`

const ChevronWrapper = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: ${getColor('text')};
  transition: transform 0.2s ease;
  ${({ $isOpen }) =>
    !$isOpen &&
    css`
      transform: rotate(180deg);
    `}
`

const CollapsibleContent = styled.div<{ $isOpen: boolean }>`
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
`

const AvailableNodeCard = styled.div`
  padding: 16px;
  border-radius: 16px;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundSuper')};
`

export const BondedPositions = () => {
  const chain = useCurrentDefiChain()
  const selectedPositions = useDefiPositions(chain)
  const { data, isPending, error } = useDefiChainPositionsQuery(chain)
  const navigate = useCoreNavigate()
  const { t } = useTranslation()
  const [activeNodesOpen, setActiveNodesOpen] = useState(true)
  const [availableNodesOpen, setAvailableNodesOpen] = useState(true)

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

      {/* Active Nodes Section */}
      <VStack gap={12}>
        <SectionHeader onClick={() => setActiveNodesOpen(!activeNodesOpen)}>
          <Text size={14} weight="600" color="contrast">
            {t('active_nodes')}
          </Text>
          <ChevronWrapper $isOpen={activeNodesOpen}>
            <ChevronDownIcon />
          </ChevronWrapper>
        </SectionHeader>
        <CollapsibleContent $isOpen={activeNodesOpen}>
          <VStack gap={12}>
            {isPending && positions.length === 0 ? (
              <>
                {[1, 2].map(key => (
                  <BondCard key={key}>
                    <Skeleton width="60%" height="16px" />
                    <Skeleton width="40%" height="24px" />
                    <Skeleton width="100%" height="20px" />
                  </BondCard>
                ))}
              </>
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
        </CollapsibleContent>
      </VStack>

      {/* Available Nodes Section */}
      <VStack gap={12}>
        <SectionHeader
          onClick={() => setAvailableNodesOpen(!availableNodesOpen)}
        >
          <Text size={14} weight="600" color="contrast">
            {t('available_nodes')}
          </Text>
          <ChevronWrapper $isOpen={availableNodesOpen}>
            <ChevronDownIcon />
          </ChevronWrapper>
        </SectionHeader>
        <CollapsibleContent $isOpen={availableNodesOpen}>
          <VStack gap={12}>
            {availableNodes.length ? (
              availableNodes.map(node => (
                <AvailableNodeCard key={node}>
                  <VStack gap={12}>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text size={14} color="contrast">
                        VultiNode: {node.slice(0, 13)}
                      </Text>
                      <BondStatusPill tone="success">Active</BondStatusPill>
                    </HStack>
                    <Button
                      kind="secondary"
                      onClick={() => navigateToBond({ nodeAddress: node })}
                      disabled={isBondingDisabled}
                      icon={<ArrowUpRightIcon />}
                    >
                      {t('request_to_bond')}
                    </Button>
                  </VStack>
                </AvailableNodeCard>
              ))
            ) : !isPending ? (
              <EmptyState title={t('no_available_nodes')} />
            ) : null}
          </VStack>
        </CollapsibleContent>
      </VStack>
    </VStack>
  )
}
