import { ChainsEmptyState } from '@core/ui/chain/components/ChainsEmptyState'
import { useVaultChainsBalancesQuery } from '@core/ui/vault/queries/useVaultChainsBalancesQuery'
import { Match } from '@lib/ui/base/Match'
import { CryptoIcon } from '@lib/ui/icons/CryptoIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { List } from '@lib/ui/list'
import { useDeferredValue, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useCoreNavigate } from '../../../../navigation/hooks/useCoreNavigate'
import { useSearchChain } from '../../state/searchChainProvider'
import { VaultChainItem } from '../VaultChainItem'

type PortfolioViewState = 'noChains' | 'noSearchResults' | 'list'

export const Portfolio = () => {
  const { data: vaultChainBalances = [] } = useVaultChainsBalancesQuery()
  const [searchQuery] = useSearchChain()
  const deferredQuery = useDeferredValue(searchQuery)
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

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

  const viewState = useMemo((): PortfolioViewState => {
    if (vaultChainBalances.length === 0) {
      return 'noChains'
    }
    if (filteredBalances.length === 0 && normalizedQuery) {
      return 'noSearchResults'
    }
    return 'list'
  }, [vaultChainBalances.length, filteredBalances.length, normalizedQuery])

  const handleCustomize = () => navigate({ id: 'manageVaultChains' })

  return (
    <Match
      value={viewState}
      noChains={() => (
        <ChainsEmptyState
          icon={
            <IconWrapper size={24} color="primaryAccentFour">
              <CryptoIcon />
            </IconWrapper>
          }
          title={t('no_chains_enabled')}
          description={t('no_chains_enabled_description')}
          onCustomize={handleCustomize}
        />
      )}
      noSearchResults={() => (
        <ChainsEmptyState
          icon={
            <IconWrapper size={24} color="buttonHover">
              <CryptoIcon />
            </IconWrapper>
          }
          title={t('no_chains_found')}
          description={t('make_sure_chains')}
          onCustomize={handleCustomize}
        />
      )}
      list={() => (
        <List>
          {filteredBalances.map(balance => (
            <VaultChainItem key={balance.chain} balance={balance} />
          ))}
        </List>
      )}
    />
  )
}
