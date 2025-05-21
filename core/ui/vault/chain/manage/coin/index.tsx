import { chainTokens } from '@core/chain/coin/chainTokens'
import { areEqualCoins, Coin, extractCoinKey } from '@core/chain/coin/Coin'
import { sortCoinsAlphabetically } from '@core/chain/coin/utils/sortCoinsAlphabetically'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getCoinLogoSrc } from '@core/ui/chain/coin/icon/utils/getCoinLogoSrc'
import { useWhitelistedCoinsQuery } from '@core/ui/chain/coin/queries/useWhitelistedCoinsQuery'
import {
  useAddToCoinFinderIgnoreMutation,
  useRemoveFromCoinFinderIgnoreMutation,
} from '@core/ui/storage/coinFinderIgnore'
import {
  useCreateCoinMutation,
  useDeleteCoinMutation,
} from '@core/ui/storage/coins'
import { useCurrentVaultChain } from '@core/ui/vault/chain/useCurrentVaultChain'
import {
  useCurrentVaultChainCoins,
  useCurrentVaultCoins,
} from '@core/ui/vault/state/currentVaultCoins'
import { Switch } from '@lib/ui/inputs/switch'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates'
import { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const CoinItem: FC<Coin> = coin => {
  const currentVaultCoins = useCurrentVaultCoins()
  const createCoin = useCreateCoinMutation()
  const deleteCoin = useDeleteCoinMutation()
  const addToCoinFinderIgnore = useAddToCoinFinderIgnoreMutation()
  const removeFromCoinFinderIgnore = useRemoveFromCoinFinderIgnoreMutation()

  const currentVaultCoin = useMemo(() => {
    return currentVaultCoins.find(c => areEqualCoins(c, coin))
  }, [currentVaultCoins, coin])

  const handleChange = () => {
    if (currentVaultCoin) {
      deleteCoin.mutate(currentVaultCoin, {
        onSuccess: () =>
          addToCoinFinderIgnore.mutate(extractCoinKey(currentVaultCoin)),
      })
    } else {
      createCoin.mutate(coin, {
        onSuccess: () =>
          removeFromCoinFinderIgnore.mutate(extractCoinKey(coin)),
      })
    }
  }

  return (
    <ListItem
      extra={
        <Switch
          checked={!!currentVaultCoin}
          onChange={handleChange}
          loading={createCoin.isPending || deleteCoin.isPending}
        />
      }
      icon={
        <ChainEntityIcon
          value={getCoinLogoSrc(coin.logo)}
          style={{ fontSize: 32 }}
        />
      }
      title={
        <HStack gap={12} alignItems="center">
          <Text color="contrast" size={14} weight={500}>
            {coin.ticker}
          </Text>
        </HStack>
      }
    />
  )
}

export const ManageVaultChainCoinsPage = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState<string | undefined>(undefined)
  const currentchain = useCurrentVaultChain()
  const currentCoins = useCurrentVaultChainCoins(currentchain)
  const whitelistedQuery = useWhitelistedCoinsQuery(currentchain)

  const coins = useMemo(() => {
    const currentChainCoins = sortCoinsAlphabetically(
      chainTokens[currentchain] || []
    )
    const whitelistedCoins = sortCoinsAlphabetically(
      whitelistedQuery.data || []
    )

    return withoutDuplicates(
      [...currentChainCoins, ...whitelistedCoins],
      areEqualCoins
    )
  }, [currentchain, whitelistedQuery.data])

  const filteredCoins = useMemo(() => {
    if (!search) return coins

    const normalizedSearch = search.toLowerCase()

    return coins.filter(({ ticker }) =>
      ticker.toLowerCase().includes(normalizedSearch)
    )
  }, [coins, search])

  const activeCoins = useMemo(() => {
    return filteredCoins.filter(coin =>
      currentCoins.some(c => areEqualCoins(c, coin))
    )
  }, [currentCoins, filteredCoins])

  const availableCoins = useMemo(() => {
    return filteredCoins.filter(coin =>
      currentCoins.every(c => !areEqualCoins(c, coin))
    )
  }, [currentCoins, filteredCoins])

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('choose_tokens')}</PageHeaderTitle>}
        hasBorder
      />
      <PageContent gap={24} flexGrow scrollable>
        <TextInput
          placeholder={t('search_field_placeholder')}
          onValueChange={setSearch}
          value={search}
        />
        {activeCoins.length ? (
          <VStack gap={12}>
            <Text color="light" size={12} weight={500}>
              {t('active')}
            </Text>
            <List>
              {activeCoins.map((coin, index) => (
                <CoinItem key={index} {...coin} />
              ))}
            </List>
          </VStack>
        ) : null}
        {availableCoins.length ? (
          <VStack gap={12}>
            <Text color="light" size={12} weight={500}>
              {t('available')}
            </Text>
            <List>
              {availableCoins.map((coin, index) => (
                <CoinItem key={index} {...coin} />
              ))}
            </List>
          </VStack>
        ) : null}
      </PageContent>
    </VStack>
  )
}
