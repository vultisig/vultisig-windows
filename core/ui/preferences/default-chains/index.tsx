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
  ticker: string
}> = ({ chain, checked, ticker }) => {
  const defaultChains = useDefaultChains()
  const setDefaultChains = useSetDefaultChainsMutation()

  const handleChange = () => {
    setDefaultChains.mutate(
      checked ? without(defaultChains, chain) : [...defaultChains, chain]
    )
  }

  return (
    <ListItem
      extra={<Switch onChange={handleChange} checked={checked} />}
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

  const filteredNativeCoins = useMemo(() => {
    if (!search) return nativeCoins

    return nativeCoins.filter(
      ({ chain, ticker }) =>
        chain.toLowerCase().includes(search) ||
        ticker.toLowerCase().includes(search)
    )
  }, [nativeCoins, search])

  const activeNativeCoins = useMemo(() => {
    return filteredNativeCoins.filter(coin =>
      defaultChains.some(chain => chain === coin.chain)
    )
  }, [filteredNativeCoins, defaultChains])

  const availableNativeCoins = useMemo(() => {
    return filteredNativeCoins.filter(coin =>
      defaultChains.every(chain => chain !== coin.chain)
    )
  }, [filteredNativeCoins, defaultChains])

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
        {activeNativeCoins.length ? (
          <VStack gap={12}>
            <Text color="light" size={12} weight={500}>
              {t('active')}
            </Text>
            <List>
              {activeNativeCoins.map((coin, index) => (
                <NativeCoinItem
                  chain={coin.chain}
                  key={index}
                  ticker={coin.ticker}
                  checked
                />
              ))}
            </List>
          </VStack>
        ) : null}
        {availableNativeCoins.length ? (
          <VStack gap={12}>
            <Text color="light" size={12} weight={500}>
              {t('available')}
            </Text>
            <List>
              {availableNativeCoins.map((coin, index) => (
                <NativeCoinItem
                  chain={coin.chain}
                  key={index}
                  ticker={coin.ticker}
                />
              ))}
            </List>
          </VStack>
        ) : null}
      </PageContent>
    </VStack>
  )
}
