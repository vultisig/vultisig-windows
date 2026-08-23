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
import { useDeferredValue } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

import { CircleDefiItem } from '../../protocols/circle/CircleDefiItem'
import { circleName } from '../../protocols/circle/core/config'
import { useCircleAccountUsdcFiatBalanceQuery } from '../../protocols/circle/queries/useCircleAccountUsdcFiatBalanceQuery'
import { useDefiChainPortfolios } from '../hooks/useDefiPortfolios'
import {
  DefiPortfolioRow,
  orderDefiPortfolioRows,
} from '../utils/orderDefiPortfolioRows'
import { DefiChainItem } from './DefiChainItem'
import { useSearchChain } from './state/searchChainProvider'

export const DefiChainsList = () => {
  const { data: chainPortfolios = [], isPending } = useDefiChainPortfolios()
  const defiChains = useDefiChains()
  const isCircleVisible = useIsCircleIncluded()
  const circleFiatBalanceQuery = useCircleAccountUsdcFiatBalanceQuery()
  const [searchQuery] = useSearchChain()
  const deferredQuery = useDeferredValue(searchQuery)
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const { iconStyle } = useTheme()

  const normalizedQuery = deferredQuery.trim().toLowerCase()

  const defiChainBalances = chainPortfolios.filter(
    ({ chain }) => isSupportedDefiChain(chain) && defiChains.includes(chain)
  )

  const filteredBalances = normalizedQuery
    ? defiChainBalances.filter(({ chain }) =>
        String(chain).toLowerCase().includes(normalizedQuery)
      )
    : defiChainBalances

  const handleCustomize = () => navigate({ id: 'manageDefiChains' })
  const showCircle =
    isCircleVisible &&
    (!normalizedQuery || circleName.toLowerCase().includes(normalizedQuery))

  const chainRows: DefiPortfolioRow[] = filteredBalances.map(portfolio => ({
    kind: 'chain',
    portfolio,
  }))

  // Circle ranks by the same fiat its row displays; an unresolved balance
  // ranks as zero, matching the `0` the row renders until the query lands.
  const rows = orderDefiPortfolioRows(
    showCircle
      ? [
          ...chainRows,
          { kind: 'circle', totalFiat: circleFiatBalanceQuery.data ?? 0 },
        ]
      : chainRows
  )

  if (defiChainBalances.length === 0 && !showCircle) {
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

  if (filteredBalances.length === 0 && normalizedQuery && !showCircle) {
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
    <List
      border={iconStyle === 'station' ? 'solid' : undefined}
      radius={iconStyle === 'station' ? 24 : undefined}
    >
      {rows.map(row =>
        row.kind === 'circle' ? (
          <CircleDefiItem key={circleName} />
        ) : (
          <DefiChainItem key={row.portfolio.chain} balance={row.portfolio} />
        )
      )}
    </List>
  )
}
