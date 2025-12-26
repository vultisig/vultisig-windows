import { Chain, EvmChain } from '@core/chain/Chain'
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
import { InputProps, OptionsProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AddressBookChainType } from './AddressBookChainType'

const evmChainNames = Object.values(EvmChain) as string[]

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
        return evmChainNames.some(chainName =>
          chainName.toLowerCase().includes(normalizedSearch)
        )
      }
      return option.chain.toLowerCase().includes(normalizedSearch)
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
    return option.chain
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
          {filteredOptions.map(option => {
            const key = option.kind === 'evm' ? 'evm' : `chain-${option.chain}`
            return (
              <ChainItem
                key={key}
                alignItems="center"
                onClick={() => onChange(option)}
              >
                <ChainContent>
                  <ChainEntityIcon
                    value={getLogoSrc(option)}
                    style={{ width: 24, height: 24, marginRight: 16 }}
                  />
                  <Text color="contrast" size={14} weight="500">
                    {getDisplayName(option)}
                  </Text>
                </ChainContent>
                <Checkbox
                  value={isSelected(option)}
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
