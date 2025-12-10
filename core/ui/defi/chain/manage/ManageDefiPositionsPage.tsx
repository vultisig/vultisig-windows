import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import {
  getPositionsByType,
  useDefiPositions,
  useToggleDefiPosition,
} from '@core/ui/storage/defiPositions'
import { DoneButton } from '@core/ui/vault/chain/manage/shared/DoneButton'
import { ItemGrid } from '@core/ui/vault/chain/manage/shared/ItemGrid'
import { SearchInput } from '@core/ui/vault/chain/manage/shared/SearchInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DefiPositionTile } from './DefiPositionTile'
import { PositionsEmptyState } from './PositionsEmptyState'
import { filterPositionsBySearch } from './utils/filterPositionsBySearch'

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

  const filteredBondPositions = filterPositionsBySearch(bondPositions, search)
  const filteredStakePositions = filterPositionsBySearch(stakePositions, search)
  const filteredLpPositions = filterPositionsBySearch(lpPositions, search)

  const hasResults =
    filteredBondPositions.length > 0 ||
    filteredStakePositions.length > 0 ||
    filteredLpPositions.length > 0

  const sections = useMemo(
    () =>
      [
        { title: t('bond'), positions: filteredBondPositions },
        { title: t('stake'), positions: filteredStakePositions },
        { title: t('liquidity_pools'), positions: filteredLpPositions },
      ].filter(section => section.positions.length > 0),
    [filteredBondPositions, filteredStakePositions, filteredLpPositions, t]
  )

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
        <VStack gap={12}>
          <Text size={22} weight="600" color="contrast">
            {t('select_positions')}
          </Text>
          <Text size={14} color="shy">
            {t('select_positions_description')}
          </Text>
        </VStack>

        <SearchInput value={search} onChange={setSearch} />

        {hasResults ? (
          <VStack gap={24}>
            {sections.map(section => (
              <VStack key={section.title} gap={12}>
                <Text size={14} weight="600" color="shy">
                  {section.title}
                </Text>
                <ItemGrid>
                  {section.positions.map(position => (
                    <DefiPositionTile
                      key={position.id}
                      position={position}
                      isSelected={selectedPositionIds.includes(position.id)}
                      onToggle={() => togglePosition(position.id)}
                      isLoading={isPending}
                    />
                  ))}
                </ItemGrid>
              </VStack>
            ))}
          </VStack>
        ) : (
          <PositionsEmptyState />
        )}
      </PageContent>
    </VStack>
  )
}
