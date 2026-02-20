import { ChainsEmptyState } from '@core/ui/chain/components/ChainsEmptyState'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useIsCircleIncluded } from '@core/ui/storage/circleVisibility'
import {
  isSupportedDefiChain,
  useDefiChains,
} from '@core/ui/storage/defiChains'
import { CryptoIcon } from '@lib/ui/icons/CryptoIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { Center } from '@lib/ui/layout/Center'
import { List } from '@lib/ui/list'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { useDeferredValue, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { CircleDefiItem } from '../../protocols/circle/CircleDefiItem'
import { useDefiChainPortfolios } from '../hooks/useDefiPortfolios'
import { DefiChainItem } from './DefiChainItem'
import { useSearchChain } from './state/searchChainProvider'

export const DefiChainsList = () => {
  const { data: chainPortfolios = [], isPending } = useDefiChainPortfolios()
  const defiChains = useDefiChains()
  const isCircleVisible = useIsCircleIncluded()
  const [searchQuery] = useSearchChain()
  const deferredQuery = useDeferredValue(searchQuery)
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  const normalizedQuery = deferredQuery.trim().toLowerCase()

  const defiChainBalances = useMemo(() => {
    return chainPortfolios.filter(
      ({ chain }) => isSupportedDefiChain(chain) && defiChains.includes(chain)
    )
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

  const handleCustomize = () => navigate({ id: 'manageDefiChains' })

  if (defiChainBalances.length === 0 && !isCircleVisible) {
    if (isPending) {
      return (
        <Center>
          <Spinner />
        </Center>
      )
    }

    return (
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
    )
  }

  if (filteredBalances.length === 0 && normalizedQuery && !isCircleVisible) {
    return (
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
    )
  }

  return (
    <List>
      {isCircleVisible && <CircleDefiItem />}
      {filteredBalances.map(balance => (
        <DefiChainItem key={balance.chain} balance={balance} />
      ))}
    </List>
  )
}
