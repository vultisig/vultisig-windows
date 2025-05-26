import { chainTokens } from '@core/chain/coin/chainTokens'
import { areEqualCoins } from '@core/chain/coin/Coin'
import { sortCoinsAlphabetically } from '@core/chain/coin/utils/sortCoinsAlphabetically'
import { useWhitelistedCoinsQuery } from '@core/ui/chain/coin/queries/useWhitelistedCoinsQuery'
import { useCurrentVaultChain } from '@core/ui/vault/chain/useCurrentVaultChain'
import { useCurrentVaultChainCoins } from '@core/ui/vault/state/currentVaultCoins'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AddCustomTokenPrompt } from './AddCustomTokenPrompt'
import { ManageVaultCoin } from './ManageVaultCoin'

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
        <VStack alignItems="start" gap={12}>
          <TextInput
            placeholder={t('search_field_placeholder')}
            onValueChange={setSearch}
            value={search}
          />
          <AddCustomTokenPrompt />
        </VStack>
        {activeCoins.length ? (
          <VStack gap={12}>
            <Text color="light" size={12} weight={500}>
              {t('active')}
            </Text>
            <List>
              {activeCoins.map((coin, index) => (
                <ManageVaultCoin key={index} value={coin} />
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
                <ManageVaultCoin key={index} value={coin} />
              ))}
            </List>
          </VStack>
        ) : null}
      </PageContent>
    </VStack>
  )
}
