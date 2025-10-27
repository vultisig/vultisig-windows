import { useVaultChainsBalancesQuery } from '@core/ui/vault/queries/useVaultChainsBalancesQuery'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { Text } from '@lib/ui/text'
import { useDeferredValue, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useSearchChain } from '../../state/searchChainProvider'
import { VaultChainItem } from '../VaultChainItem'

export const Portfolio = () => {
  const { data: vaultChainBalances = [] } = useVaultChainsBalancesQuery()
  const [searchQuery] = useSearchChain()
  const deferredQuery = useDeferredValue(searchQuery)
  const { t } = useTranslation()

  const normalizedQuery = deferredQuery.trim().toLowerCase()

  const filteredBalances = useMemo(() => {
    if (!normalizedQuery) {
      return vaultChainBalances
    }

    return vaultChainBalances.filter(({ chain, coins }) => {
      const normalizedChain = String(chain).toLowerCase()

      if (normalizedChain.includes(normalizedQuery)) {
        return true
      }

      return coins.some(coin =>
        coin.ticker?.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [normalizedQuery, vaultChainBalances])

  if (filteredBalances.length === 0 && normalizedQuery) {
    return (
      <VStack gap={8} alignItems="center" padding={16}>
        <Text color="supporting" size={14}>
          {t('vault_search_no_matches')}
        </Text>
      </VStack>
    )
  }

  return (
    <List>
      {filteredBalances.map(balance => (
        <VaultChainItem key={balance.chain} balance={balance} />
      ))}
    </List>
  )
}
