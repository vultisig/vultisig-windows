import { Chain } from '@core/chain/Chain'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { areEqualCoins, Coin, extractCoinKey } from '@core/chain/coin/Coin'
import { getSolanaCoingeckoId } from '@core/chain/coin/coingecko/getCoingeckoId'
import { knownTokens } from '@core/chain/coin/knownTokens'
import { sortCoinsAlphabetically } from '@core/chain/coin/utils/sortCoinsAlphabetically'
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
import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DoneButton } from '../shared/DoneButton'
import { ItemGrid } from '../shared/ItemGrid'
import { SearchInput } from '../shared/SearchInput'
import { TokenItem } from '../shared/TokenItem'
import { AddCustomTokenPrompt } from './AddCustomTokenPrompt'

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
    if (!search) return coins

    const normalizedSearch = search.toLowerCase()

    return coins.filter(({ ticker }) =>
      ticker.toLowerCase().includes(normalizedSearch)
    )
  }, [coins, search])

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
        newCoin.priceProviderId = await getSolanaCoingeckoId({
          id: coin.id,
        })
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
        {filteredCoins.length > 0 || !search ? (
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
          <EmptyState title={t('no_tokens_found')} />
        )}
      </PageContent>
    </VStack>
  )
}
