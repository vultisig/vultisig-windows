import { Chain } from '@core/chain/Chain'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useSupportedDefiChainsForVault } from '@core/ui/storage/defiChains'
import { DoneButton } from '@core/ui/vault/chain/manage/shared/DoneButton'
import { ItemGrid } from '@core/ui/vault/chain/manage/shared/ItemGrid'
import { SearchInput } from '@core/ui/vault/chain/manage/shared/SearchInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { EmptyState } from '@lib/ui/status/EmptyState'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DefiChainItem } from './DefiChainItem'

export const ManageDefiChainsPage = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const navigate = useCoreNavigate()
  const eligibleChains = useSupportedDefiChainsForVault()

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

  const hasNoEligibleChains = eligibleChains.length === 0

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
        {!hasNoEligibleChains && (
          <SearchInput value={search} onChange={setSearch} />
        )}
        {hasNoEligibleChains ? (
          <EmptyState
            title={t('defi_add_chain_to_vault_title')}
            description={t('defi_add_chain_to_vault_description')}
          />
        ) : filteredChains.length > 0 ? (
          <ItemGrid>
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
