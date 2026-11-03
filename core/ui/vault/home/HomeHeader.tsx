import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { getHeaderCollapseProgress } from '@core/ui/page/headerCollapse'
import { useHomeDisplay } from '@core/ui/storage/homeDisplay'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { CircleAlertIcon } from '@lib/ui/icons/CircleAlertIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
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

/** The home page's sticky header, with the vault's balance marked while it is updating or incomplete. */
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
          {({ data, error, isUpdating, isIncomplete }) => {
            if (data !== undefined) {
              if (!isUpdating && !isIncomplete) return formatFiatAmount(data)

              return (
                <HStack as="span" gap={6} alignItems="center">
                  {formatFiatAmount(data)}
                  {isUpdating ? (
                    <Spinner size="0.8em" style={{ opacity: 0.5 }} />
                  ) : null}
                  {isIncomplete ? (
                    <Tooltip
                      content={t('some_balances_failed_to_load')}
                      renderOpener={props => (
                        <IconWrapper {...props} color="danger" size={14}>
                          <CircleAlertIcon />
                        </IconWrapper>
                      )}
                    />
                  ) : null}
                </HStack>
              )
            }
            if (error) return t('failed_to_load')

            return <Spinner size="0.9em" />
          }}
        </HomeBalanceQuery>
      }
      testId="vault-page-header"
    />
  )
}
