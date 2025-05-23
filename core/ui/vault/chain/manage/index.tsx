import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { areEqualCoins, Coin } from '@core/chain/coin/Coin'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import {
  useCreateCoinMutation,
  useDeleteCoinMutation,
} from '@core/ui/storage/coins'
import { useCurrentVaultNativeCoins } from '@core/ui/vault/state/currentVaultCoins'
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
import { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getChainLogoSrc } from '../../../chain/metadata/getChainLogoSrc'

const NativeCoinItem: FC<Coin> = coin => {
  const currentCoins = useCurrentVaultNativeCoins()
  const createCoin = useCreateCoinMutation()
  const deleteCoin = useDeleteCoinMutation()

  const currentCoin = useMemo(() => {
    return currentCoins.find(c => areEqualCoins(c, coin))
  }, [currentCoins, coin])

  const handleChange = () => {
    if (currentCoin) {
      deleteCoin.mutate(currentCoin)
    } else {
      createCoin.mutate(coin)
    }
  }

  return (
    <ListItem
      extra={
        <Switch
          checked={!!currentCoin}
          onChange={handleChange}
          loading={createCoin.isPending || deleteCoin.isPending}
        />
      }
      icon={
        <ChainEntityIcon
          value={getChainLogoSrc(coin.chain)}
          style={{ fontSize: 32 }}
        />
      }
      title={
        <HStack gap={12} alignItems="center">
          <Text color="contrast" size={14} weight={500}>
            {coin.ticker}
          </Text>
          <ListItemTag title={coin.chain} />
        </HStack>
      }
    />
  )
}

export const ManageVaultChainsPage = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState<string | undefined>(undefined)
  const nativeCoins = Object.values(chainFeeCoin)
  const currentNativeCoins = useCurrentVaultNativeCoins()

  const filteredNativeCoins = useMemo(() => {
    if (!search) return nativeCoins

    const normalizedSearch = search.toLowerCase()

    return nativeCoins.filter(
      ({ chain, ticker }) =>
        chain.toLowerCase().includes(normalizedSearch) ||
        ticker.toLowerCase().includes(normalizedSearch)
    )
  }, [nativeCoins, search])

  const activeNativeCoins = useMemo(() => {
    return filteredNativeCoins.filter(coin =>
      currentNativeCoins.some(c => areEqualCoins(c, coin))
    )
  }, [currentNativeCoins, filteredNativeCoins])

  const availableNativeCoins = useMemo(() => {
    return filteredNativeCoins.filter(coin =>
      currentNativeCoins.every(c => !areEqualCoins(c, coin))
    )
  }, [currentNativeCoins, filteredNativeCoins])

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('manage_chains')}</PageHeaderTitle>}
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
                <NativeCoinItem key={index} {...coin} />
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
                <NativeCoinItem key={index} {...coin} />
              ))}
            </List>
          </VStack>
        ) : null}
      </PageContent>
    </VStack>
  )
}
