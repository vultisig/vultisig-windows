import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { getHeaderCollapseProgress } from '@core/ui/page/headerCollapse'
import { useHomeDisplay } from '@core/ui/storage/homeDisplay'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { useTransform } from 'framer-motion'
import { ReactNode, Suspense } from 'react'
import { useTranslation } from 'react-i18next'

import { VaultPageHeaderControls } from '../page/components/VaultPageHeaderControls'
import { VaultPageHeaderShell } from '../page/components/VaultPageHeaderShell'
import { HomeBalanceQuery } from './HomeBalanceQuery'
import { useHomeTab } from './homeTab'
import { LazyDefiHomeHeaderControls } from './lazyDefiHome'
import { useHomeScrollOffset } from './useHomeScrollOffset'

type HomeHeaderProps = {
  primaryControls?: ReactNode
}

/**
 * The home's top bar, drawn once for both tabs. Its collapsed row shows the
 * same total as the large balance; the controls follow the tab in place.
 */
export const HomeHeader = ({ primaryControls }: HomeHeaderProps) => {
  const { t } = useTranslation()
  const vault = useCurrentVault()
  const tab = useHomeTab()
  const display = useHomeDisplay()
  const formatFiatAmount = useFormatFiatAmount()
  const collapseProgress = useTransform(
    useHomeScrollOffset(),
    getHeaderCollapseProgress
  )

  return (
    <VaultPageHeaderShell
      vault={vault}
      collapseProgress={collapseProgress}
      primaryControls={primaryControls}
      secondaryControls={
        tab === 'wallet' ? (
          <VaultPageHeaderControls />
        ) : (
          <Suspense fallback={null}>
            <LazyDefiHomeHeaderControls />
          </Suspense>
        )
      }
      balanceLabel={
        display === 'separate' && tab === 'defi'
          ? t('defi')
          : t('portfolio_balance')
      }
      balance={
        <HomeBalanceQuery>
          {({ data, error }) =>
            data === undefined && error ? (
              t('failed_to_load')
            ) : data === undefined ? (
              <Spinner size="0.9em" />
            ) : (
              formatFiatAmount(data)
            )
          }
        </HomeBalanceQuery>
      }
      testId="vault-page-header"
    />
  )
}
