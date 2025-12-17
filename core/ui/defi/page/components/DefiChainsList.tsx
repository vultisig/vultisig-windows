import { useDefiChains } from '@core/ui/storage/defiChains'
import { CryptoIcon } from '@lib/ui/icons/CryptoIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { Center } from '@lib/ui/layout/Center'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useDeferredValue, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { featureFlags } from '../../../featureFlags'
import { CircleDefiItem } from '../../protocols/circle/CircleDefiItem'
import { useDefiChainPortfolios } from '../hooks/useDefiPortfolios'
import { DefiChainItem } from './DefiChainItem'
import { useSearchChain } from './state/searchChainProvider'

export const DefiChainsList = () => {
  const { data: chainPortfolios = [], isPending } = useDefiChainPortfolios()
  const defiChains = useDefiChains()
  const [searchQuery] = useSearchChain()
  const deferredQuery = useDeferredValue(searchQuery)
  const { t } = useTranslation()

  const normalizedQuery = deferredQuery.trim().toLowerCase()

  // Filter to only show chains that are enabled in DeFi settings
  const defiChainBalances = useMemo(() => {
    return chainPortfolios.filter(({ chain }) => defiChains.includes(chain))
  }, [chainPortfolios, defiChains])

  const filteredBalances = useMemo(() => {
    if (!normalizedQuery) {
      return defiChainBalances
    }

    return defiChainBalances.filter(({ chain }) => {
      const normalizedChain = String(chain).toLowerCase()
      if (normalizedChain.includes(normalizedQuery)) {
        return true
      }
      return false
    })
  }, [normalizedQuery, defiChainBalances])

  const hasCircle = featureFlags.circle

  if (defiChainBalances.length === 0 && !hasCircle) {
    if (isPending) {
      return (
        <Center>
          <Spinner />
        </Center>
      )
    }

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
      </EmptyWrapper>
    )
  }

  if (filteredBalances.length === 0 && normalizedQuery && !hasCircle) {
    return (
      <EmptyWrapper>
        <VStack gap={12} alignItems="center">
          <IconWrapper size={18.5} color="buttonHover">
            <CryptoIcon />
          </IconWrapper>
          <VStack gap={8}>
            <Text centerHorizontally size={17}>
              {t('no_chains_found')}
            </Text>
            <Text size={13} color="shy" centerHorizontally>
              {t('make_sure_chains')}
            </Text>
          </VStack>
        </VStack>
      </EmptyWrapper>
    )
  }

  return (
    <List>
      {hasCircle && <CircleDefiItem />}
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
