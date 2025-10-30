import { extractCoinKey } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { sortCoinsByBalance } from '@core/chain/coin/utils/sortCoinsByBalance'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { adjustVaultChainCoinsLogos } from '@core/ui/vault/chain/manage/coin/adjustVaultChainCoinsLogos'
import { useCurrentVaultChain } from '@core/ui/vault/chain/useCurrentVaultChain'
import { VaultChainCoinItem } from '@core/ui/vault/chain/VaultChainCoinItem'
import { useVaultChainCoinsQuery } from '@core/ui/vault/queries/useVaultChainCoinsQuery'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Panel } from '@lib/ui/panel/Panel'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { getColor } from '@lib/ui/theme/getters'
import { splitBy } from '@lib/utils/array/splitBy'
import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates'
import { useDeferredValue, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { VaultChainPositionsSection } from '../positions/VaultChainPositionsSection'
import { useSearchChainToken } from '../state/searchChainTokenProvider'
import { TokensEmptyState } from './TokensEmptyState'

const StyledPanel = styled(Panel)`
  cursor: pointer;

  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${getColor('foregroundExtra')};
  }
`

export const Tokens = () => {
  const chain = useCurrentVaultChain()
  const vaultCoinsQuery = useVaultChainCoinsQuery(chain)
  const navigate = useCoreNavigate()
  const { t } = useTranslation()
  const [searchQuery] = useSearchChainToken()
  const deferredQuery = useDeferredValue(searchQuery)

  const normalizedQuery = deferredQuery.trim().toLowerCase()

  const filteredCoinsQuery = useMemo(() => {
    if (!vaultCoinsQuery.data || !normalizedQuery) {
      return vaultCoinsQuery
    }

    const filteredCoins = vaultCoinsQuery.data.filter(coin =>
      coin.ticker?.toLowerCase().includes(normalizedQuery)
    )

    return {
      ...vaultCoinsQuery,
      data: filteredCoins,
    }
  }, [normalizedQuery, vaultCoinsQuery])

  return (
    <VStack gap={16} fullWidth>
      <MatchQuery
        value={filteredCoinsQuery}
        error={() => t('failed_to_load')}
        pending={() => (
          <VStack fullWidth>
            <Spinner />
          </VStack>
        )}
        success={coins => {
          const orderedCoins = withoutDuplicates(
            splitBy(coins, coin => (isFeeCoin(coin) ? 0 : 1))
              .map(sortCoinsByBalance)
              .flat(),
            (one, another) => one.ticker === another.ticker
          ).map(adjustVaultChainCoinsLogos)

          // Show empty state if no coins, or only the fee coin exists (user disabled all optional tokens)
          const hasOnlyFeeCoin =
            orderedCoins.length === 1 && isFeeCoin(orderedCoins[0])
          if (orderedCoins.length === 0 || hasOnlyFeeCoin) {
            return <TokensEmptyState />
          }

          return (
            <List>
              {orderedCoins.map((coin, idx) => (
                <StyledPanel
                  key={`${idx}-${coin.id}`}
                  onClick={() =>
                    navigate({
                      id: 'vaultChainCoinDetail',
                      state: { coin: extractCoinKey(coin) },
                    })
                  }
                >
                  <VaultChainCoinItem value={coin} />
                </StyledPanel>
              ))}
            </List>
          )
        }}
      />
      <VaultChainPositionsSection />
    </VStack>
  )
}
