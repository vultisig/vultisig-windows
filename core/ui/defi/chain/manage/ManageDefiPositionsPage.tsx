import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import {
  DefiPosition,
  getPositionsByType,
  useDefiPositions,
  useToggleDefiPosition,
} from '@core/ui/storage/defiPositions'
import { DoneButton } from '@core/ui/vault/chain/manage/shared/DoneButton'
import { SearchInput } from '@core/ui/vault/chain/manage/shared/SearchInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { EmptyState } from '@lib/ui/status/EmptyState'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DefiPositionItem } from './DefiPositionItem'
import { PositionSection } from './PositionSection'

export const ManageDefiPositionsPage = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const navigate = useCoreNavigate()
  const [{ chain }] = useCoreViewState<'manageDefiPositions'>()
  const selectedPositionIds = useDefiPositions(chain)
  const { togglePosition, isPending } = useToggleDefiPosition(chain)

  const bondPositions = useMemo(
    () => getPositionsByType({ chain, type: 'bond' }),
    [chain]
  )
  const stakePositions = useMemo(
    () => getPositionsByType({ chain, type: 'stake' }),
    [chain]
  )
  const lpPositions = useMemo(
    () => getPositionsByType({ chain, type: 'lp' }),
    [chain]
  )

  const filterPositions = (positions: DefiPosition[]) => {
    if (!search) return positions
    const normalizedSearch = search.toLowerCase()
    return positions.filter(
      p =>
        p.name.toLowerCase().includes(normalizedSearch) ||
        p.ticker.toLowerCase().includes(normalizedSearch)
    )
  }

  const filteredBondPositions = filterPositions(bondPositions)
  const filteredStakePositions = filterPositions(stakePositions)
  const filteredLpPositions = filterPositions(lpPositions)

  const hasResults =
    filteredBondPositions.length > 0 ||
    filteredStakePositions.length > 0 ||
    filteredLpPositions.length > 0

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={
          <PageHeaderBackButton
            onClick={() =>
              navigate({ id: 'defiChainDetail', state: { chain } })
            }
          />
        }
        secondaryControls={
          <DoneButton
            onClick={() =>
              navigate({ id: 'defiChainDetail', state: { chain } })
            }
          />
        }
        title={t('select_positions')}
        hasBorder
      />
      <PageContent gap={24} flexGrow scrollable>
        <VStack gap={8}>
          <SearchInput value={search} onChange={setSearch} />
        </VStack>
        {hasResults ? (
          <VStack gap={24}>
            {filteredBondPositions.length > 0 && (
              <PositionSection title={t('bond')}>
                {filteredBondPositions.map(position => (
                  <DefiPositionItem
                    key={position.id}
                    position={position}
                    isSelected={selectedPositionIds.includes(position.id)}
                    onToggle={() => togglePosition(position.id)}
                    isLoading={isPending}
                  />
                ))}
              </PositionSection>
            )}
            {filteredStakePositions.length > 0 && (
              <PositionSection title={t('stake')}>
                {filteredStakePositions.map(position => (
                  <DefiPositionItem
                    key={position.id}
                    position={position}
                    isSelected={selectedPositionIds.includes(position.id)}
                    onToggle={() => togglePosition(position.id)}
                    isLoading={isPending}
                  />
                ))}
              </PositionSection>
            )}
            {filteredLpPositions.length > 0 && (
              <PositionSection title={t('liquidity_pools')}>
                {filteredLpPositions.map(position => (
                  <DefiPositionItem
                    key={position.id}
                    position={position}
                    isSelected={selectedPositionIds.includes(position.id)}
                    onToggle={() => togglePosition(position.id)}
                    isLoading={isPending}
                  />
                ))}
              </PositionSection>
            )}
          </VStack>
        ) : (
          <EmptyState title={t('no_positions_found')} />
        )}
      </PageContent>
    </VStack>
  )
}
