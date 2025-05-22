import { Chain } from '@core/chain/Chain'
import { getChainEntityIconSrc } from '@core/ui/chain/coin/icon/utils/getChainEntityIconSrc'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { HStack } from '@lib/ui/layout/Stack'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { getCoinOptions } from '../../helpers/getCoinOptions'

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
`

const ChainList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
`

const ChainItem = styled(HStack)`
  cursor: pointer;
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`

const ChainSelectionScreen = () => {
  const { t } = useTranslation()
  const goBack = useNavigateBack()
  const [state] = useCoreViewState<'chainSelection'>()
  const [search, setSearch] = useState('')

  const chainOptions = useMemo(() => getCoinOptions(), [])

  const filteredChains = useMemo(() => {
    if (!search) return chainOptions

    const normalizedSearch = search.toLowerCase()
    return chainOptions.filter(option =>
      option.value.toLowerCase().includes(normalizedSearch)
    )
  }, [chainOptions, search])

  const handleChainSelect = (chain: Chain) => {
    state.onChainSelect(chain)
  }

  return (
    <Container>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={goBack} />}
        title={<PageHeaderTitle>{'Select Chains'}</PageHeaderTitle>}
      />
      <Content>
        <TextInput
          placeholder={t('search_field_placeholder')}
          onValueChange={setSearch}
          value={search}
        />
        <Text size={12} weight={500} color="light">
          {'Chains'}
        </Text>
        <ChainList>
          {filteredChains.map(option => (
            <ChainItem
              key={option.value}
              alignItems="center"
              gap={12}
              onClick={() => handleChainSelect(option.value as Chain)}
            >
              <img
                src={getChainEntityIconSrc(option.value)}
                alt=""
                style={{ width: 24, height: 24 }}
              />
              <Text color="contrast" size={14} weight="500">
                {option.value}
              </Text>
            </ChainItem>
          ))}
        </ChainList>
      </Content>
    </Container>
  )
}

export default ChainSelectionScreen
