import { useWhitelistedCoinsQuery } from '@core/ui/chain/coin/queries/useWhitelistedCoinsQuery'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCore } from '@core/ui/state/core'
import {
  useAddToCoinFinderIgnoreMutation,
  useRemoveFromCoinFinderIgnoreMutation,
} from '@core/ui/storage/coinFinderIgnore'
import {
  useCreateCoinMutation,
  useDeleteCoinMutation,
} from '@core/ui/storage/coins'
import { useCurrentVaultChain } from '@core/ui/vault/chain/useCurrentVaultChain'
import { useCurrentVaultChainCoins } from '@core/ui/vault/state/currentVaultCoins'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { EmptyState } from '@lib/ui/status/EmptyState'
import { Text } from '@lib/ui/text'
import { Chain } from '@vultisig/core-chain/Chain'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'
import {
  areEqualCoins,
  Coin,
  extractCoinKey,
} from '@vultisig/core-chain/coin/Coin'
import { getSolanaCoingeckoId } from '@vultisig/core-chain/coin/coingecko/getCoingeckoId'
import { knownTokens } from '@vultisig/core-chain/coin/knownTokens'
import { sortCoinsAlphabetically } from '@vultisig/core-chain/coin/utils/sortCoinsAlphabetically'
import { withoutDuplicates } from '@vultisig/lib-utils/array/withoutDuplicates'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DoneButton } from '../shared/DoneButton'
import { ItemGrid } from '../shared/ItemGrid'
import { SearchInput } from '../shared/SearchInput'
import { TokenItem } from '../shared/TokenItem'
import { AddCustomTokenPrompt } from './AddCustomTokenPrompt'

const strip0xPrefix = (value: string) =>
  value.startsWith('0x') ? value.slice(2) : value

const coinMatchesTokenSearch = (coin: Coin, normalizedQuery: string) => {
  if (!normalizedQuery) {
    return true
  }

  if (coin.ticker.toLowerCase().includes(normalizedQuery)) {
    return true
  }

  if (!coin.id) {
    return false
  }

  const id = coin.id.toLowerCase()

  if (id.includes(normalizedQuery) || normalizedQuery.includes(id)) {
    return true
  }

  const idCore = strip0xPrefix(id)
  const queryCore = strip0xPrefix(normalizedQuery)

  if (!queryCore) {
    return false
  }

  return idCore.includes(queryCore) || queryCore.includes(idCore)
}

export const ManageVaultChainCoinsPage = () => {
  const { t } = useTranslation()
  const { goBack } = useCore()
  const [search, setSearch] = useState('')
  const currentchain = useCurrentVaultChain()
  const currentCoins = useCurrentVaultChainCoins(currentchain)
  const whitelistedQuery = useWhitelistedCoinsQuery(currentchain)
  const createCoin = useCreateCoinMutation()
  const deleteCoin = useDeleteCoinMutation()
  const addToCoinFinderIgnore = useAddToCoinFinderIgnoreMutation()
  const removeFromCoinFinderIgnore = useRemoveFromCoinFinderIgnoreMutation()

  const isLoading =
    createCoin.isPending ||
    deleteCoin.isPending ||
    addToCoinFinderIgnore.isPending ||
    removeFromCoinFinderIgnore.isPending

  const coins = useMemo(() => {
    const currentChainCoins = sortCoinsAlphabetically(knownTokens[currentchain])
    const whitelistedCoins = sortCoinsAlphabetically(
      whitelistedQuery.data || []
    )

    return withoutDuplicates(
      [...currentChainCoins, ...whitelistedCoins],
      areEqualCoins
    )
  }, [currentchain, whitelistedQuery.data])

  const filteredCoins = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase()

    const matching = !normalizedQuery
      ? coins
      : coins.filter(coin => coinMatchesTokenSearch(coin, normalizedQuery))

    const selected = matching.filter(coin =>
      currentCoins.some(c => areEqualCoins(c, coin))
    )
    const unselected = matching.filter(
      coin => !currentCoins.some(c => areEqualCoins(c, coin))
    )

    return [...selected, ...unselected]
  }, [coins, search, currentCoins])

  const handleToggle = async (coin: Coin) => {
    if (isLoading) return
    const currentCoin = currentCoins.find(c => areEqualCoins(c, coin))
    if (currentCoin) {
      await addToCoinFinderIgnore.mutateAsync(extractCoinKey(currentCoin))
      await deleteCoin.mutateAsync(extractAccountCoinKey(currentCoin))
    } else {
      await removeFromCoinFinderIgnore.mutateAsync(extractCoinKey(coin))

      const newCoin = { ...coin }

      if (coin.chain === Chain.Solana && coin.id && !coin.priceProviderId) {
        const priceProviderId = await getSolanaCoingeckoId({ id: coin.id })
        if (priceProviderId) {
          newCoin.priceProviderId = priceProviderId
        }
      }

      await createCoin.mutateAsync(newCoin)
    }
  }

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={<DoneButton onClick={goBack} />}
        title={t('choose_tokens')}
        hasBorder
      />
      <PageContent gap={24} flexGrow scrollable>
        <VStack gap={16}>
          <Text size={14} weight={500} color="shy">
            {t('enable_token_instruction')}
          </Text>
          <SearchInput value={search} onChange={setSearch} />
        </VStack>
        {filteredCoins.length > 0 || !search.trim() ? (
          <ItemGrid>
            <AddCustomTokenPrompt />
            {filteredCoins.map((coin, index) => (
              <TokenItem
                key={index}
                value={coin}
                currentCoins={currentCoins}
                onToggle={handleToggle}
                isLoading={isLoading}
              />
            ))}
          </ItemGrid>
        ) : (
          <VStack gap={24} alignItems="center">
            <EmptyState title={t('no_tokens_found')} />
            <ItemGrid>
              <AddCustomTokenPrompt />
            </ItemGrid>
          </VStack>
        )}
      </PageContent>
    </VStack>
  )
}
