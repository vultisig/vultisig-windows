import { ChainsEmptyState } from '@core/ui/chain/components/ChainsEmptyState'
import { useCore } from '@core/ui/state/core'
import { useVaultChainsBalancesQuery } from '@core/ui/vault/queries/useVaultChainsBalancesQuery'
import { Match } from '@lib/ui/base/Match'
import { borderRadiusPx } from '@lib/ui/css/borderRadius'
import { CryptoIcon } from '@lib/ui/icons/CryptoIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { List } from '@lib/ui/list'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Text } from '@lib/ui/text'
import { Chain } from '@vultisig/core-chain/Chain'
import { useDeferredValue } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

import { useCoreNavigate } from '../../../../navigation/hooks/useCoreNavigate'
import { useSearchChain } from '../../state/searchChainProvider'
import { VaultChainItem } from '../VaultChainItem'
import { VaultChainItemBalance } from '../VaultChainItemBalance'

type PortfolioViewState = 'noChains' | 'noSearchResults' | 'list'

/**
 * Vault home chain list. Chains whose balances resolved render with their
 * values; a chain still waiting for its first balance keeps its row with a
 * spinner, and a chain whose balance read failed keeps its row with a "failed
 * to load" state instead of disappearing or showing zero. The page-level
 * loading and failure states only appear when no chain resolved at all.
 */
export const Portfolio = () => {
  const { client } = useCore()
  const { data, isPending } = useVaultChainsBalancesQuery()
  const [searchQuery] = useSearchChain()
  const deferredQuery = useDeferredValue(searchQuery)
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const { iconStyle } = useTheme()
  const usesStationList = client === 'extension' || iconStyle === 'station'

  const handleCustomize = () => navigate({ id: 'manageVaultChains' })

  if (!data) {
    return isPending ? (
      <Spinner />
    ) : (
      <Text centerHorizontally>{t('failed_to_load')}</Text>
    )
  }

  const { balances, loadingChains, failedChains } = data

  const normalizedQuery = deferredQuery.trim().toLowerCase()

  const matchesChain = (chain: Chain) =>
    chain.toLowerCase().includes(normalizedQuery)

  const filteredBalances = normalizedQuery
    ? balances.filter(
        ({ chain, coins }) =>
          matchesChain(chain) ||
          coins.some(coin =>
            coin.ticker.toLowerCase().includes(normalizedQuery)
          )
      )
    : balances

  const filteredLoadingChains = normalizedQuery
    ? loadingChains.filter(matchesChain)
    : loadingChains

  const filteredFailedChains = normalizedQuery
    ? failedChains.filter(matchesChain)
    : failedChains

  const hasChains =
    balances.length + loadingChains.length + failedChains.length > 0
  const hasMatches =
    filteredBalances.length +
      filteredLoadingChains.length +
      filteredFailedChains.length >
    0

  const viewState: PortfolioViewState = !hasChains
    ? 'noChains'
    : !hasMatches && normalizedQuery
      ? 'noSearchResults'
      : 'list'

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
        <List
          border={usesStationList ? 'solid' : undefined}
          radius={usesStationList ? borderRadiusPx.xl : undefined}
        >
          {filteredBalances.map(({ chain, coins }) => (
            <VaultChainItem key={chain} chain={chain}>
              <VaultChainItemBalance coins={coins} />
            </VaultChainItem>
          ))}
          {filteredLoadingChains.map(chain => (
            <VaultChainItem key={chain} chain={chain}>
              <Spinner />
            </VaultChainItem>
          ))}
          {filteredFailedChains.map(chain => (
            <VaultChainItem key={chain} chain={chain}>
              <Text color="danger" weight="550" size={14}>
                {t('failed_to_load')}
              </Text>
            </VaultChainItem>
          ))}
        </List>
      )}
    />
  )
}
