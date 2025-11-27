import { Chain } from '@core/chain/Chain'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useDefiChains } from '@core/ui/storage/defiChains'
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

import { featureFlags } from '../../../featureFlags'
import { defiProtocols } from '../../protocols/core'
import { DefiChainItem } from './DefiChainItem'
import { DefiProtocolItem } from './DefiProtocolItem'
import { useSearchChain } from './state/searchChainProvider'

export const DefiChainsList = () => {
  const { data: vaultChainBalances = [] } = useVaultChainsBalancesQuery()
  const defiChains = useDefiChains()
  const [searchQuery] = useSearchChain()
  const deferredQuery = useDeferredValue(searchQuery)
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  const normalizedQuery = deferredQuery.trim().toLowerCase()

  // Filter to only show chains that are enabled in DeFi settings
  const defiChainBalances = useMemo(() => {
    return vaultChainBalances.filter(({ chain }) =>
      defiChains.includes(chain as Chain)
    )
  }, [vaultChainBalances, defiChains])

  const filteredBalances = useMemo(() => {
    if (!normalizedQuery) {
      return defiChainBalances
    }

    return defiChainBalances.filter(({ chain, coins }) => {
      const normalizedChain = String(chain).toLowerCase()

      if (normalizedChain.includes(normalizedQuery)) {
        return true
      }

      return coins.some(coin =>
        coin.ticker?.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [normalizedQuery, defiChainBalances])

  if (defiChainBalances.length === 0) {
    return (
      <EmptyWrapper>
        <VStack gap={12} alignItems="center">
          <IconWrapper size={48} color="buttonHover">
            <CryptoIcon />
          </IconWrapper>
          <VStack gap={8}>
            <Text centerHorizontally size={17} weight="600">
              {t('no_chains_enabled')}
            </Text>
            <Text size={13} color="shy" centerHorizontally>
              {t('no_chains_enabled_description')}
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
      {defiProtocols.map(protocol => {
        if (protocol === 'circle' && !featureFlags.circle) {
          return null
        }
        return <DefiProtocolItem key={protocol} protocol={protocol} />
      })}
      {filteredBalances.map(balance => (
        <DefiChainItem key={balance.chain} balance={balance} />
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
