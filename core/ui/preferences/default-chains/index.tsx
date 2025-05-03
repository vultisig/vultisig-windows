import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainEntityIconSrc } from '@core/ui/chain/coin/icon/utils/getChainEntityIconSrc'
import { useSetDefaultChainsMutation } from '@core/ui/storage/defaultChains'
import { useDefaultChains } from '@core/ui/storage/defaultChains'
import { Switch } from '@lib/ui/inputs/switch'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { ListItemTag } from '@lib/ui/list/item/tag'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { without } from '@lib/utils/array/without'
import { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const NativeCoinItem: FC<{
  chain: Chain
  checked?: boolean
  onChange: () => void
  ticker: string
}> = ({ chain, checked, onChange, ticker }) => {
  return (
    <ListItem
      extra={<Switch onChange={onChange} checked={checked} />}
      icon={
        <ChainEntityIcon
          value={getChainEntityIconSrc(chain)}
          style={{ fontSize: 32 }}
        />
      }
      title={
        <HStack gap={12} alignItems="center">
          <Text color="contrast" size={14} weight={500}>
            {ticker}
          </Text>
          <ListItemTag title={chain} />
        </HStack>
      }
    />
  )
}

export const DefaultChainsPage = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState<string | undefined>(undefined)
  const nativeCoins = Object.values(chainFeeCoin)
  const defaultChains = useDefaultChains()
  const setDefaultChains = useSetDefaultChainsMutation()

  const handleSwitch = (chain: Chain, isSelected?: boolean) => {
    setDefaultChains.mutate(
      isSelected ? without(defaultChains, chain) : [...defaultChains, chain]
    )
  }

  const filteredNativeCoins = useMemo(() => {
    if (!search) return nativeCoins

    return nativeCoins.filter(
      ({ chain, ticker }) =>
        chain.toLowerCase().includes(search) ||
        ticker.toLowerCase().includes(search)
    )
  }, [nativeCoins, search])

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={
          <PageHeaderTitle>
            {t('vault_settings_default_chains')}
          </PageHeaderTitle>
        }
        hasBorder
      />
      <PageContent gap={24} flexGrow scrollable>
        <TextInput
          placeholder={t('search_field_placeholder')}
          onValueChange={setSearch}
          value={search}
        />
        <VStack gap={12}>
          <Text color="light" size={12} weight={500}>
            {t('active')}
          </Text>
          <List>
            {filteredNativeCoins
              .filter(({ chain }) => defaultChains.includes(chain))
              .map(({ chain, ticker }) => (
                <NativeCoinItem
                  chain={chain}
                  key={`${chain}-${ticker}`}
                  onChange={() => handleSwitch(chain, true)}
                  ticker={ticker}
                  checked
                />
              ))}
          </List>
        </VStack>
        <VStack gap={12}>
          <Text color="light" size={12} weight={500}>
            {t('available')}
          </Text>
          <List>
            {filteredNativeCoins
              .filter(({ chain }) =>
                defaultChains.every(item => item !== chain)
              )
              .map(({ chain, ticker }) => (
                <NativeCoinItem
                  chain={chain}
                  key={`${chain}-${ticker}`}
                  onChange={() => handleSwitch(chain)}
                  ticker={ticker}
                />
              ))}
          </List>
        </VStack>
      </PageContent>
    </VStack>
  )
}
