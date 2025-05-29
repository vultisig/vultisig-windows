import { Chain } from '@core/chain/Chain'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { TextInput } from '@lib/ui/inputs/TextInput'
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
  Content,
  FullScreenContainer,
} from './ChainSelectionScreen.styles'

type ChainSelectionScreenProps = {
  chain?: Chain
  onChainSelect: (chain: Chain) => void
}

export const ChainSelectionScreen = ({
  chain,
  onChainSelect,
}: ChainSelectionScreenProps) => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [selectedChain, setSelectedChain] = useState<Chain | null>(
    chain || null
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
    setSelectedChain(chain)
    onChainSelect(chain)
  }

  return (
    <FullScreenContainer>
      <PageHeader
        primaryControls={
          <PageHeaderBackButton
            onClick={() => onChainSelect(selectedChain as Chain)}
          />
        }
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
    </FullScreenContainer>
  )
}
