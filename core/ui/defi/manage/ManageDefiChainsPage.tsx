import { Chain } from '@core/chain/Chain'
import { featureFlags } from '@core/ui/featureFlags'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useSupportedDefiChainsForVault } from '@core/ui/storage/defiChains'
import { DoneButton } from '@core/ui/vault/chain/manage/shared/DoneButton'
import { ItemGrid } from '@core/ui/vault/chain/manage/shared/ItemGrid'
import { SearchInput } from '@core/ui/vault/chain/manage/shared/SearchInput'
import { useAvailableChains } from '@core/ui/vault/state/useAvailableChains'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { EmptyState } from '@lib/ui/status/EmptyState'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { circleChain, circleName } from '../protocols/circle/core/config'
import { CircleItem } from './CircleItem'
import { DefiChainItem } from './DefiChainItem'

export const ManageDefiChainsPage = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const navigate = useCoreNavigate()
  const eligibleChains = useSupportedDefiChainsForVault()
  const availableChains = useAvailableChains()

  const hasCircle = featureFlags.circle && availableChains.includes(circleChain)

  const showCircle = useMemo(() => {
    if (!hasCircle) return false
    if (!search) return true

    const normalizedSearch = search.toLowerCase()
    return circleName.toLowerCase().includes(normalizedSearch)
  }, [hasCircle, search])

  const filteredChains = useMemo(() => {
    let chains = eligibleChains

    if (search) {
      const normalizedSearch = search.toLowerCase()
      chains = eligibleChains.filter((chain: Chain) =>
        chain.toLowerCase().includes(normalizedSearch)
      )
    }

    return chains.sort((a, b) => a.localeCompare(b))
  }, [eligibleChains, search])

  const hasNoEligibleItems = eligibleChains.length === 0 && !hasCircle

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={
          <PageHeaderBackButton
            onClick={() => navigate({ id: 'defi', state: {} })}
          />
        }
        secondaryControls={
          <DoneButton onClick={() => navigate({ id: 'defi', state: {} })} />
        }
        title={t('select_chains')}
        hasBorder
      />
      <PageContent gap={24} flexGrow scrollable>
        {!hasNoEligibleItems && (
          <SearchInput value={search} onChange={setSearch} />
        )}
        {hasNoEligibleItems ? (
          <EmptyState
            title={t('defi_add_chain_to_vault_title')}
            description={t('defi_add_chain_to_vault_description')}
          />
        ) : filteredChains.length > 0 || showCircle ? (
          <ItemGrid>
            {showCircle && <CircleItem />}
            {filteredChains.map(chain => (
              <DefiChainItem key={chain} value={chain} />
            ))}
          </ItemGrid>
        ) : (
          <EmptyState title={t('no_chains_found')} />
        )}
      </PageContent>
    </VStack>
  )
}
