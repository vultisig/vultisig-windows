import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainDisplayName } from '@core/ui/chain/metadata/getChainDisplayName'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { ActionForm } from '@core/ui/vault/components/action-form/ActionForm'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { CoinsIcon } from '@lib/ui/icons/CoinsIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { pageConfig } from '@lib/ui/page/config'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { SearchField } from '@lib/ui/search/SearchField'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Chain } from '@vultisig/core-chain/Chain'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCurrentVaultChains } from '../../../state/currentVaultCoins'
import { useChainSummaries } from '../../../swap/form/hooks/useChainSummaries'
import { ChainOption } from '../../components/ChainOption'
import { useSendAssetFilter } from '../../state/assetFilter'
import { filterChainsByQuery, SendChainFilter } from './getSendAssetListing'

/**
 * The "Select chains" page of the send asset step: the vault's chains by the
 * fiat value they hold, "All chains" first. Picking one filters the asset
 * list and returns to it; Back or Escape returns without a change.
 */
export const SendChainPicker = () => {
  const { t } = useTranslation()
  const [{ chain: selectedChain }, setFilter] = useSendAssetFilter()
  const [query, setQuery] = useState('')
  const vaultChains = useCurrentVaultChains()
  const { data: summaries } = useChainSummaries()

  const goBack = () => {
    setFilter(prev => ({
      ...prev,
      isPickingChain: false,
      focusesChainFilter: true,
    }))
  }

  const pick = (chain: SendChainFilter) => {
    setFilter({
      chain,
      query: '',
      isPickingChain: false,
      focusesChainFilter: true,
    })
  }

  const getChainTotal = (chain: Chain) => summaries?.[chain]?.totalUsd ?? 0
  // Array.prototype.sort is stable, so tied chains keep the vault's order.
  const chains = [...vaultChains].sort(
    (a, b) => getChainTotal(b) - getChainTotal(a)
  )
  const allChainsTotal = chains.reduce(
    (total, chain) => total + getChainTotal(chain),
    0
  )

  const isSearching = query.trim() !== ''
  const visibleChains = filterChainsByQuery({ chains, query })

  return (
    <Page
      onKeyDown={event => {
        if (event.key === 'Escape') goBack()
      }}
    >
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={goBack} />}
        title={t('select_chains')}
        hasBorder
      />
      <Content gap={12}>
        <SearchField
          variant="pill"
          showPlaceholderWhenFocused
          value={query}
          onSearch={setQuery}
        />
        <ColumnHeaders justifyContent="space-between" gap={8}>
          <Text size={12} color="shy">
            {t('chains')}
          </Text>
          <Text size={12} color="shy">
            {t('balance')}
          </Text>
        </ColumnHeaders>
        <ScrollArea>
          <List data-testid="send-chain-list">
            {!isSearching && (
              <ChainOption
                icon={<CoinsIcon />}
                name={t('all_chains')}
                totalFiatAmount={allChainsTotal}
                isSelected={selectedChain === null}
                onClick={() => pick(null)}
                data-testid="send-chain-option-all"
              />
            )}
            {visibleChains.map(chain => (
              <ChainOption
                key={chain}
                icon={<ChainEntityIcon value={getChainLogoSrc(chain)} />}
                name={getChainDisplayName(chain)}
                totalFiatAmount={getChainTotal(chain)}
                isSelected={selectedChain === chain}
                onClick={() => pick(chain)}
                data-testid={`send-chain-option-${chain}`}
              />
            ))}
            {isSearching && visibleChains.length === 0 && (
              <EmptyState size={14} color="shy" centerHorizontally>
                {t('no_results_found')}
              </EmptyState>
            )}
          </List>
        </ScrollArea>
      </Content>
    </Page>
  )
}

const Page = styled(VStack)`
  flex: 1 1 0;
  min-height: 0;
`

const Content = styled(ActionForm)`
  flex-basis: 0;
  min-height: 0;
`

const ColumnHeaders = styled(HStack)`
  padding-inline: ${pageConfig.horizontalPadding}px;
`

const ScrollArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  ${hideScrollbars};
`

const List = styled(VStack)`
  ${borderRadius.xl};
  overflow: hidden;
  border: 1px solid ${getColor('foregroundExtra')};
  background: ${getColor('foreground')};
`

const EmptyState = styled(Text)`
  padding: 24px 16px;
`
