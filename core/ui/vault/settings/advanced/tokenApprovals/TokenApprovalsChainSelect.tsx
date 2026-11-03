import { getChainDisplayName } from '@core/ui/chain/metadata/getChainDisplayName'
import { matchesChainSearch } from '@core/ui/chain/metadata/matchesChainSearch'
import { SelectableChainItem } from '@core/ui/chain/selection/SelectableChainItem'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { ItemGrid } from '@core/ui/vault/chain/manage/shared/ItemGrid'
import { SearchInput } from '@core/ui/vault/chain/manage/shared/SearchInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { InputProps } from '@lib/ui/props'
import { EmptyState } from '@lib/ui/status/EmptyState'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { TokenApprovalsChain } from './core/tokenApprovalsChains'
import { TokenApprovalsPageContent } from './TokenApprovalsPageContent'

type TokenApprovalsChainSelectProps = InputProps<TokenApprovalsChain | null> & {
  /** The chains whose approvals the page checks. */
  options: TokenApprovalsChain[]
  onBack: () => void
}

/**
 * Picks the one chain the approvals list shows. Choosing the chain that is
 * already picked clears it, back to all chains.
 */
export const TokenApprovalsChainSelect = ({
  value,
  onChange,
  options,
  onBack,
}: TokenApprovalsChainSelectProps) => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  const chains = options
    .filter(chain => matchesChainSearch({ chain, query: search }))
    .sort((a, b) =>
      getChainDisplayName(a).localeCompare(getChainDisplayName(b))
    )

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={t('select_chain')}
        hasBorder
      />
      <TokenApprovalsPageContent gap={24} scrollable>
        <SearchInput value={search} onChange={setSearch} />
        {chains.length > 0 ? (
          <ItemGrid>
            {chains.map(chain => (
              <SelectableChainItem
                key={chain}
                chain={chain}
                value={chain === value}
                onChange={isSelected => onChange(isSelected ? chain : null)}
                dimsInactive={false}
              />
            ))}
          </ItemGrid>
        ) : (
          <EmptyState title={t('no_chains_found')} />
        )}
      </TokenApprovalsPageContent>
    </VStack>
  )
}
