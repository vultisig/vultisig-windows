import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { VaultChainItem } from '@core/ui/vault/page/components/VaultChainItem'
import { useVaultChainsBalancesQuery } from '@core/ui/vault/queries/useVaultChainsBalancesQuery'
import { Button } from '@lib/ui/buttons/Button'
import { CryptoIcon } from '@lib/ui/icons/CryptoIcon'
import { CryptoWalletPenIcon } from '@lib/ui/icons/CryptoWalletPenIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useDeferredValue, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useSearchChain } from './state/searchChainProvider'

export const DefiChainsList = () => {
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

  // Empty state when no chains are enabled
  if (vaultChainBalances.length === 0) {
    return (
      <EmptyWrapper>
        <VStack gap={12} alignItems="center">
          <IconWrapper size={48} color="buttonHover">
            <CryptoIcon />
          </IconWrapper>
          <VStack gap={8}>
            <Text centerHorizontally size={17} weight="600">
              No chains enabled
            </Text>
            <Text size={13} color="shy" centerHorizontally>
              You&apos;ve disabled all chains. Make sure that at least one chain
              is enabled.
            </Text>
          </VStack>
        </VStack>
        <Button
          onClick={() => navigate({ id: 'manageDefiChains' })}
          style={{
            maxWidth: 'fit-content',
            maxHeight: 32,
          }}
          icon={
            <IconWrapper size={16}>
              <CryptoWalletPenIcon />
            </IconWrapper>
          }
        >
          <Text size={12}>Customize chains</Text>
        </Button>
      </EmptyWrapper>
    )
  }

  // Empty state when search returns no results
  if (filteredBalances.length === 0 && normalizedQuery) {
    return (
      <EmptyWrapper>
        <VStack gap={12} alignItems="center">
          <IconWrapper size={48} color="buttonHover">
            <CryptoIcon />
          </IconWrapper>
          <VStack gap={8}>
            <Text centerHorizontally size={17} weight="600">
              {t('no_chains_found')}
            </Text>
            <Text size={13} color="shy" centerHorizontally>
              {t('make_sure_chains')}
            </Text>
          </VStack>
        </VStack>
        <Button
          onClick={() => navigate({ id: 'manageDefiChains' })}
          style={{
            maxWidth: 'fit-content',
            maxHeight: 32,
          }}
          icon={
            <IconWrapper size={16}>
              <CryptoWalletPenIcon />
            </IconWrapper>
          }
        >
          <Text size={12}>{t('customize_chains')}</Text>
        </Button>
      </EmptyWrapper>
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

const EmptyWrapper = styled.div`
  ${vStack({
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
  })};
  padding: 32px 40px;
  border-radius: 16px;
  background: ${getColor('foreground')};
`
