import { Chain } from '@core/chain/Chain'
import { SelectableChainItem } from '@core/ui/chain/selection/SelectableChainItem'
import { ItemGrid } from '@core/ui/vault/chain/manage/shared/ItemGrid'
import { SearchInput } from '@core/ui/vault/chain/manage/shared/SearchInput'
import { Button } from '@lib/ui/buttons/Button'
import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { toggleInclusion } from '@lib/utils/array/toggleInclusion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useSelectedChains } from './state/selectedChains'

const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  ${hideScrollbars}
`

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;
`

export const SelectChainsStep = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [selectedChains, setSelectedChains] = useSelectedChains()

  const allChains = Object.values(Chain)

  const filteredChains = search
    ? allChains.filter(chain =>
        chain.toLowerCase().includes(search.toLowerCase())
      )
    : allChains

  const sortedChains = [...filteredChains].sort((a, b) => a.localeCompare(b))

  const toggleChain = (chain: Chain) => {
    setSelectedChains(prev => toggleInclusion(prev, chain))
  }

  const handleFinish = () => {
    console.log('Import complete')
  }

  return (
    <Wrapper>
      <SearchInput value={search} onChange={setSearch} />
      <ScrollableContent>
        <ItemGrid>
          {sortedChains.map(chain => (
            <SelectableChainItem
              key={chain}
              chain={chain}
              value={selectedChains.includes(chain)}
              onChange={() => toggleChain(chain)}
            />
          ))}
        </ItemGrid>
      </ScrollableContent>
      <Button disabled={selectedChains.length === 0} onClick={handleFinish}>
        {t('next')}
      </Button>
    </Wrapper>
  )
}
