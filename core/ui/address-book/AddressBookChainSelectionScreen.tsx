import { FullScreenContainer } from '@core/ui/chain/chainSelection/ChainSelectionScreen.styles'
import { getChainDisplayName } from '@core/ui/chain/metadata/getChainDisplayName'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { matchesChainSearch } from '@core/ui/chain/metadata/matchesChainSearch'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { ChainTile } from '@core/ui/vault/chain/manage/shared/ChainTile'
import { ItemGrid } from '@core/ui/vault/chain/manage/shared/ItemGrid'
import { SearchInput } from '@core/ui/vault/chain/manage/shared/SearchInput'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { InputProps, OptionsProp } from '@lib/ui/props'
import { EmptyState } from '@lib/ui/status/EmptyState'
import { Chain, EvmChain } from '@vultisig/core-chain/Chain'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AddressBookChainType } from './AddressBookChainType'

const evmChains = Object.values(EvmChain)

type Props = InputProps<AddressBookChainType | undefined> &
  OptionsProp<AddressBookChainType>

export const AddressBookChainSelectionScreen = ({
  value,
  onChange,
  options,
}: Props) => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  const filteredOptions = useMemo(() => {
    if (!search) return options

    const normalizedSearch = search.toLowerCase()
    return options.filter(option => {
      if (option.kind === 'evm') {
        return evmChains.some(chain =>
          matchesChainSearch({ chain, query: normalizedSearch })
        )
      }
      return matchesChainSearch({
        chain: option.chain,
        query: normalizedSearch,
      })
    })
  }, [options, search])

  const isSelected = (option: AddressBookChainType): boolean => {
    if (!value) return false
    if (option.kind === 'evm' && value.kind === 'evm') return true
    if (option.kind === 'chain' && value.kind === 'chain') {
      return option.chain === value.chain
    }
    return false
  }

  const getDisplayName = (option: AddressBookChainType): string => {
    if (option.kind === 'evm') {
      return t('evm_chains')
    }
    return getChainDisplayName(option.chain)
  }

  const getLogoSrc = (option: AddressBookChainType): string => {
    if (option.kind === 'evm') {
      return getChainLogoSrc(Chain.Ethereum)
    }
    return getChainLogoSrc(option.chain)
  }

  return (
    <FullScreenContainer>
      <PageHeader
        primaryControls={
          <PageHeaderBackButton onClick={() => onChange(value)} />
        }
        title={t('select_chains')}
        hasBorder
      />
      <PageContent gap={24} flexGrow scrollable>
        <SearchInput
          value={search}
          onChange={setSearch}
          data-testid="chain-search-input"
        />
        {filteredOptions.length > 0 ? (
          <ItemGrid data-testid="chain-grid">
            {filteredOptions.map(option => {
              const key = option.kind === 'evm' ? 'evm' : option.chain
              return (
                <ChainTile
                  key={key}
                  data-testid={`chain-item-${key}`}
                  iconSrc={getLogoSrc(option)}
                  name={getDisplayName(option)}
                  isSelected={isSelected(option)}
                  onClick={() => onChange(option)}
                />
              )
            })}
          </ItemGrid>
        ) : (
          <EmptyState title={t('no_chains_found')} />
        )}
      </PageContent>
    </FullScreenContainer>
  )
}
