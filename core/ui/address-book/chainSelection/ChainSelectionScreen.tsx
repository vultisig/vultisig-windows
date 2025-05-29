import { Chain } from '@core/chain/Chain'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { useNavigate } from '@lib/ui/navigation/hooks/useNavigate'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  ChainContent,
  ChainItem,
  ChainList,
  Checkbox,
  Container,
  Content,
} from './ChainSelectionScreen.styles'

export const ChainSelectionScreen = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const goBack = useNavigateBack()
  const [state] = useCoreViewState<'chainSelection'>()
  const [search, setSearch] = useState('')
  const [selectedChain, setSelectedChain] = useState<Chain | null>(
    state?.selectedChain || null
  )

  const chainOptions = useMemo(() => {
    return Object.values(Chain).map(chain => ({
      value: chain,
      label: chain,
    }))
  }, [])

  const filteredChains = useMemo(() => {
    if (!search) return chainOptions

    const normalizedSearch = search.toLowerCase()
    return chainOptions.filter(option =>
      option.value.toLowerCase().includes(normalizedSearch)
    )
  }, [chainOptions, search])

  const handleChainSelect = (chain: Chain) => {
    if (state.onChainSelect) {
      state.onChainSelect(chain)
    }
    setSelectedChain(chain)
    state.onChainSelect(chain)
    navigate({
      id: 'addAddress',
      state: {
        selectedChain: chain,
        headerTitle: t('add_address'),
      },
    })
  }

  return (
    <Container>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={goBack} />}
        title={<PageHeaderTitle>{t('select_chains')}</PageHeaderTitle>}
      />
      <Content>
        <TextInput
          placeholder={t('search_field_placeholder')}
          onValueChange={setSearch}
          value={search}
        />
        <Text size={12} weight={500} color="light" style={{ marginTop: 16 }}>
          {t('chains')}
        </Text>
        <ChainList>
          {filteredChains.map(option => {
            const isSelected = selectedChain === option.value
            return (
              <ChainItem
                key={option.value}
                alignItems="center"
                onClick={() => handleChainSelect(option.value as Chain)}
              >
                <ChainContent>
                  <ChainEntityIcon
                    value={getChainLogoSrc(option.value)}
                    style={{ width: 24, height: 24, marginRight: 16 }}
                  />
                  <Text color="contrast" size={14} weight="500">
                    {option.value}
                  </Text>
                </ChainContent>
                <Checkbox checked={isSelected} />
              </ChainItem>
            )
          })}
        </ChainList>
      </Content>
    </Container>
  )
}
