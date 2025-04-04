import { chainTokens } from '@core/chain/coin/chainTokens'
import { areEqualCoins, Coin, coinKeyToString } from '@core/chain/coin/Coin'
import { getCoinSearchString } from '@core/chain/coin/utils/getCoinSearchStrings'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { sortCoinsAlphabetically } from '@core/chain/coin/utils/sortCoinsAlphabetically'
import { NonEmptyOnly } from '@lib/ui/base/NonEmptyOnly'
import { useTransform } from '@lib/ui/hooks/useTransform'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates'
import { t } from 'i18next'
import { useCallback, useMemo } from 'react'

import { useWhitelistedCoinsQuery } from '../../../../../../coin/query/useWhitelistedCoinsQuery'
import { Spinner } from '../../../../../../lib/ui/loaders/Spinner'
import { useCurrentSearch } from '../../../../../../lib/ui/search/CurrentSearchProvider'
import { useSearchFilter } from '../../../../../../lib/ui/search/hooks/useSearchFilter'
import { useCurrentVaultChainCoins } from '../../../../../state/currentVault'
import { useCurrentVaultChain } from '../../../../useCurrentVaultChain'
import { ManageVaultChainCoin } from '../../ManageVaultChainCoin'

export const VaultChainCoinOptions = () => {
  const chain = useCurrentVaultChain()
  const query = useWhitelistedCoinsQuery(chain)
  const [searchQuery] = useCurrentSearch()
  const selectedCoins = useTransform(
    useCurrentVaultChainCoins(chain),
    useCallback(coins => coins.filter(coin => !isFeeCoin(coin)), [])
  )

  const allItems = useMemo(() => {
    let result: Coin[] = []

    const tokens = chainTokens[chain]

    if (tokens) {
      result.push(...tokens)
    }

    if (query.data) {
      result.push(...query.data)
    }

    result = result.filter(
      coin =>
        !selectedCoins.some(selectedCoin => areEqualCoins(selectedCoin, coin))
    )

    return withoutDuplicates(result, areEqualCoins)
  }, [chain, query.data, selectedCoins])

  const options = useTransform(
    useSearchFilter({
      searchQuery,
      items: allItems,
      getSearchStrings: getCoinSearchString,
    }),
    sortCoinsAlphabetically
  )

  return (
    <>
      <NonEmptyOnly
        value={selectedCoins}
        render={coins => (
          <>
            <Text size={18} color="shy">
              {t('selected').toUpperCase()}
            </Text>
            {coins.map(option => (
              <ManageVaultChainCoin
                key={coinKeyToString(option)}
                value={option}
              />
            ))}
          </>
        )}
      />
      <NonEmptyOnly
        value={options}
        render={coins => (
          <>
            <Text size={18} color="shy">
              {t('tokens').toUpperCase()}
            </Text>
            {coins.map(option => (
              <ManageVaultChainCoin
                key={coinKeyToString(option)}
                value={option}
              />
            ))}
          </>
        )}
      />
      {searchQuery && query.isPending && (
        <VStack fullWidth alignItems="center">
          <Spinner size="2em" />
        </VStack>
      )}
    </>
  )
}
