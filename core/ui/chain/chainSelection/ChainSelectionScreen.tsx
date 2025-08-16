import { Chain } from '@core/chain/Chain'
import {
  ChainContent,
  ChainItem,
  ChainList,
  Content,
  FullScreenContainer,
} from '@core/ui/chain/chainSelection/ChainSelectionScreen.styles'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { Checkbox } from '@lib/ui/inputs/checkbox/Checkbox'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { InputProps } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const ChainSelectionScreen = ({
  value: chain,
  onChange,
}: InputProps<Chain>) => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  const filteredChains = useMemo(() => {
    if (!search) return Object.values(Chain)

    const normalizedSearch = search.toLowerCase()
    return Object.values(Chain).filter(chain =>
      chain.toLowerCase().includes(normalizedSearch)
    )
  }, [search])

  return (
    <FullScreenContainer>
      <PageHeader
        primaryControls={
          <PageHeaderBackButton onClick={() => onChange(chain)} />
        }
        title={t('select_chains')}
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
            const isSelected = chain === option
            return (
              <ChainItem
                key={option}
                alignItems="center"
                onClick={() => onChange(option)}
              >
                <ChainContent>
                  <ChainEntityIcon
                    value={getChainLogoSrc(option)}
                    style={{ width: 24, height: 24, marginRight: 16 }}
                  />
                  <Text color="contrast" size={14} weight="500">
                    {option}
                  </Text>
                </ChainContent>
                <Checkbox
                  value={isSelected}
                  onChange={() => onChange(option)}
                />
              </ChainItem>
            )
          })}
        </ChainList>
      </Content>
    </FullScreenContainer>
  )
}
