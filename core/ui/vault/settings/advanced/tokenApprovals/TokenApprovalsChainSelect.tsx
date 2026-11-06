import { getChainDisplayName } from '@core/ui/chain/metadata/getChainDisplayName'
import { matchesChainSearch } from '@core/ui/chain/metadata/matchesChainSearch'
import { SelectableChainItem } from '@core/ui/chain/selection/SelectableChainItem'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { ItemGrid } from '@core/ui/vault/chain/manage/shared/ItemGrid'
import { SearchInput } from '@core/ui/vault/chain/manage/shared/SearchInput'
import { StationLayers2FilledIcon } from '@lib/ui/icons/StationFigmaIcons'
import { VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { InputProps } from '@lib/ui/props'
import { SelectableItem } from '@lib/ui/selection/SelectableItem'
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

/** Picks the one chain the approvals list shows, or all of them. */
export const TokenApprovalsChainSelect = ({
  value,
  onChange,
  options,
  onBack,
}: TokenApprovalsChainSelectProps) => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  const showsAllChains = search === ''
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
        {showsAllChains || chains.length > 0 ? (
          <ItemGrid>
            {showsAllChains ? (
              <SelectableItem
                value={value === null}
                onChange={() => onChange(null)}
                icon={<StationLayers2FilledIcon />}
                name={t('token_approvals_all_chains')}
                dimsInactive={false}
              />
            ) : null}
            {chains.map(chain => (
              <SelectableChainItem
                key={chain}
                chain={chain}
                value={chain === value}
                onChange={() => onChange(chain)}
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
