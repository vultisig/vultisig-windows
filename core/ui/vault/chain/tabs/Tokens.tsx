import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { sortCoinsByBalance } from '@core/chain/coin/utils/sortCoinsByBalance'
import { CoinDetailModal } from '@core/ui/vault/chain/coin/CoinDetailModal'
import { adjustVaultChainCoinsLogos } from '@core/ui/vault/chain/manage/coin/adjustVaultChainCoinsLogos'
import { useCurrentVaultChain } from '@core/ui/vault/chain/useCurrentVaultChain'
import { VaultChainCoinItem } from '@core/ui/vault/chain/VaultChainCoinItem'
import { useVaultChainCoinsQuery } from '@core/ui/vault/queries/useVaultChainCoinsQuery'
import { Opener } from '@lib/ui/base/Opener'
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

          return (
            <List>
              {orderedCoins.map((coin, idx) => (
                <Opener
                  key={`${idx}-${coin.id}`}
                  renderOpener={({ onOpen }) => (
                    <StyledPanel onClick={onOpen}>
                      <VaultChainCoinItem value={coin} />
                    </StyledPanel>
                  )}
                  renderContent={({ onClose }) => (
                    <CoinDetailModal coin={coin} onClose={onClose} />
                  )}
                />
              ))}
            </List>
          )
        }}
      />
      <VaultChainPositionsSection />
    </VStack>
  )
}
