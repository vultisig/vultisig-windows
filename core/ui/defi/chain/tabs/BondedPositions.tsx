import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useDefiPositions } from '@core/ui/storage/defiPositions'
import { useHasVaultCoin } from '@core/ui/vault/state/useHasVaultCoin'
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
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { sum } from '@lib/utils/array/sum'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { AnimatePresence, motion } from 'framer-motion'
import { ReactNode, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { BondedSummaryCard } from '../components/bond/BondedSummaryCard'
import { BondNodeItem } from '../components/bond/BondNodeItem'
import { useDefiChainPositionsQuery } from '../queries/useDefiChainPositionsQuery'
import { useCurrentDefiChain } from '../useCurrentDefiChain'
import { DefiPositionEmptyState } from './DefiPositionEmptyState'

const collapsibleTransition = {
  duration: 0.35,
  ease: [0.4, 0, 0.2, 1] as const,
}

const collapsibleVariants = {
  collapsed: { height: 0, opacity: 0 },
  open: { height: 'auto', opacity: 1 },
} as const

const SectionContainer = styled.div`
  border-radius: 16px;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundSuper')};
  overflow: hidden;
`

const SectionHeader = styled(UnstyledButton)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 16px;
`

const ChevronWrapper = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: ${getColor('text')};
`

const SectionItem = styled.div`
  padding: 16px;
  border-top: 1px solid ${getColor('foregroundExtra')};
`

const SkeletonItem = styled(SectionItem)`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

type CollapsibleProps = {
  isOpen: boolean
  children: ReactNode
}

const Collapsible = ({ isOpen, children }: CollapsibleProps) => (
  <AnimatePresence initial={false}>
    {isOpen && (
      <motion.div
        key="collapsible-content"
        variants={collapsibleVariants}
        initial="collapsed"
        animate="open"
        exit="collapsed"
        transition={collapsibleTransition}
        style={{ overflow: 'hidden' }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
)

export const BondedPositions = () => {
  const chain = useCurrentDefiChain()
  const selectedPositions = useDefiPositions(chain)
  const { data, isPending, error } = useDefiChainPositionsQuery(chain)
  const navigate = useCoreNavigate()
  const { t } = useTranslation()
  const [activeNodesOpen, setActiveNodesOpen] = useState(true)
  const [availableNodesOpen, setAvailableNodesOpen] = useState(true)

  const isBondingDisabledByChain = chain !== Chain.THORChain
  const bondCoin = {
    ...(chainFeeCoin[chain] ?? chainFeeCoin[Chain.THORChain]),
    chain,
  }
  const hasBondCoin = useHasVaultCoin(bondCoin)
  const isBondingDisabled = isBondingDisabledByChain || !hasBondCoin
  const bondingDisabledReason =
    !hasBondCoin && !isBondingDisabledByChain
      ? t('defi_token_required', { ticker: bondCoin.ticker })
      : undefined

  const renderDisabledAction = useCallback(
    (action: ReactNode) =>
      bondingDisabledReason ? (
        <Tooltip
          content={bondingDisabledReason}
          renderOpener={({ ref, ...props }) => (
            <div
              ref={ref as any}
              {...props}
              style={{ width: '100%', display: 'flex' }}
            >
              {action}
            </div>
          )}
        />
      ) : (
        action
      ),
    [bondingDisabledReason]
  )

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
        coin: bondCoin,
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
        coin: bondCoin,
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
        actionsDisabledReason={bondingDisabledReason}
      />

      {bondingDisabledReason ? (
        <Text size={12} color="warning">
          {bondingDisabledReason}
        </Text>
      ) : null}

      {/* Active Nodes Section */}
      <SectionContainer>
        <SectionHeader onClick={() => setActiveNodesOpen(!activeNodesOpen)}>
          <Text size={14} weight="500" color="shy">
            {t('active_nodes')}
          </Text>
          <ChevronWrapper
            animate={{ rotate: activeNodesOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDownIcon />
          </ChevronWrapper>
        </SectionHeader>
        <Collapsible isOpen={activeNodesOpen}>
          {isPending && positions.length === 0 ? (
            <>
              {[1, 2].map(key => (
                <SkeletonItem key={key}>
                  <Skeleton width="60%" height="16px" />
                  <Skeleton width="40%" height="24px" />
                  <Skeleton width="100%" height="20px" />
                </SkeletonItem>
              ))}
            </>
          ) : positions.length > 0 ? (
            positions.map(position => (
              <SectionItem key={position.nodeAddress}>
                <BondNodeItem
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
                  actionsDisabledReason={bondingDisabledReason}
                />
              </SectionItem>
            ))
          ) : (
            <SectionItem>
              <EmptyState title={t('no_active_nodes')} />
            </SectionItem>
          )}
        </Collapsible>
      </SectionContainer>

      {/* Available Nodes Section */}
      <SectionContainer>
        <SectionHeader
          onClick={() => setAvailableNodesOpen(!availableNodesOpen)}
        >
          <Text size={14} weight="500" color="shy">
            {t('available_nodes')}
          </Text>
          <ChevronWrapper
            animate={{ rotate: availableNodesOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDownIcon />
          </ChevronWrapper>
        </SectionHeader>
        <Collapsible isOpen={availableNodesOpen}>
          {availableNodes.length ? (
            availableNodes.map(node => (
              <SectionItem key={node}>
                <VStack gap={12}>
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text size={14} color="contrast">
                      {t('vulti_node')}: {node.slice(0, 13)}
                    </Text>
                    <Text size={13} weight="500" color="success">
                      {t('active')}
                    </Text>
                  </HStack>
                  {renderDisabledAction(
                    <Button
                      kind="outlined"
                      onClick={() => navigateToBond({ nodeAddress: node })}
                      disabled={isBondingDisabled}
                      icon={<ArrowUpRightIcon />}
                    >
                      {t('request_to_bond')}
                    </Button>
                  )}
                </VStack>
              </SectionItem>
            ))
          ) : isPending ? (
            <>
              {[1, 2].map(key => (
                <SkeletonItem key={key}>
                  <Skeleton width="60%" height="16px" />
                  <Skeleton width="40%" height="20px" />
                  <Skeleton width="100%" height="20px" />
                </SkeletonItem>
              ))}
            </>
          ) : (
            <SectionItem>
              <EmptyState title={t('no_available_nodes')} />
            </SectionItem>
          )}
        </Collapsible>
      </SectionContainer>
    </VStack>
  )
}
