import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCore } from '@core/ui/state/core'
import {
  isDefiPositionSelected,
  useAvailableDefiPositions,
  useDefiPositions,
  useToggleDefiPosition,
} from '@core/ui/storage/defiPositions'
import { DoneButton } from '@core/ui/vault/chain/manage/shared/DoneButton'
import { ItemGrid } from '@core/ui/vault/chain/manage/shared/ItemGrid'
import { SearchInput } from '@core/ui/vault/chain/manage/shared/SearchInput'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DefiChainPageTab } from '../tabs/config'
import { setLastDefiChainTab } from '../tabs/lastTab'
import { DefiPositionTile } from './DefiPositionTile'
import { PositionsEmptyState } from './PositionsEmptyState'
import { filterPositionsBySearch } from './utils/filterPositionsBySearch'

export const ManageDefiPositionsPage = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [{ chain, returnTab }] = useCoreViewState<'manageDefiPositions'>()
  const { goBack } = useCore()

  useEffect(() => {
    if (returnTab && ['bonded', 'staked', 'lps'].includes(returnTab)) {
      setLastDefiChainTab(chain, returnTab as DefiChainPageTab)
    }
  }, [chain, returnTab])

  const selectedPositionIds = useDefiPositions(chain)
  const { togglePosition, isPending } = useToggleDefiPosition(chain)
  const { positions: availablePositions, isLoading: isPositionsLoading } =
    useAvailableDefiPositions(chain)

  const bondPositions = useMemo(
    () => availablePositions.filter(position => position.type === 'bond'),
    [availablePositions]
  )
  const stakePositions = useMemo(
    () => availablePositions.filter(position => position.type === 'stake'),
    [availablePositions]
  )
  const lpPositions = useMemo(
    () => availablePositions.filter(position => position.type === 'lp'),
    [availablePositions]
  )

  const filteredBondPositions = filterPositionsBySearch(bondPositions, search)
  const filteredStakePositions = filterPositionsBySearch(stakePositions, search)
  const filteredLpPositions = filterPositionsBySearch(lpPositions, search)

  const hasResults =
    filteredBondPositions.length > 0 ||
    filteredStakePositions.length > 0 ||
    filteredLpPositions.length > 0

  const isLoadingWithoutResults =
    isPositionsLoading &&
    !filteredBondPositions.length &&
    !filteredStakePositions.length &&
    !filteredLpPositions.length

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
        primaryControls={<PageHeaderBackButton onClick={goBack} />}
        secondaryControls={<DoneButton onClick={goBack} />}
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
              <VStack key={section.title} gap={8}>
                <Text size={13} color="shy">
                  {section.title}
                </Text>
                <ItemGrid>
                  {section.positions.map(position => (
                    <DefiPositionTile
                      key={position.id}
                      position={position}
                      isSelected={isDefiPositionSelected({
                        position,
                        selectedPositionIds,
                      })}
                      onToggle={() => togglePosition(position)}
                      isLoading={isPending}
                    />
                  ))}
                </ItemGrid>
              </VStack>
            ))}
          </VStack>
        ) : isLoadingWithoutResults ? (
          <VStack alignItems="center" gap={12}>
            <Spinner size={20} />
          </VStack>
        ) : (
          <PositionsEmptyState />
        )}
      </PageContent>
    </VStack>
  )
}
