import { AnimatedFiatAmount } from '@core/ui/chain/components/AnimatedFiatAmount'
import { useCore } from '@core/ui/state/core'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { TotalBalanceQuery } from '@core/ui/vault/queries/resolveCoinsTotalBalance'
import { CircleAlertIcon } from '@lib/ui/icons/CircleAlertIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { fiatCurrencySymbolRecord } from '@vultisig/core-config/FiatCurrency'
import { useTranslation } from 'react-i18next'

import { ManageVaultBalanceVisibility } from './visibility/ManageVaultBalanceVisibility'

type VaultTotalBalanceProps = {
  query: TotalBalanceQuery
  isTotal?: boolean
}

/**
 * The home header's large fiat total. Shows the running total as soon as any
 * source resolves, a spinner while others are still loading and an alert when
 * the total excludes sources that failed to load; the two indicators are
 * independent because both states can hold at once. The amount rolls to its
 * new value, including when the home tab or display setting changes it.
 */
export const VaultTotalBalance = ({
  query,
  isTotal,
}: VaultTotalBalanceProps) => {
  const { client } = useCore()
  const isExtension = client === 'extension'
  const fiatCurrency = useFiatCurrency()

  const { t } = useTranslation()

  return (
    <VStack alignItems="center" gap={12} data-testid="vault-total-balance">
      <MatchQuery
        value={query}
        error={() => t('failed_to_load')}
        pending={() => (
          <HStack gap={6} alignItems="center">
            {fiatCurrencySymbolRecord[fiatCurrency]}
            <Spinner size="1.5em" />
          </HStack>
        )}
        success={value => (
          <HStack gap={8} alignItems="center">
            <Text
              color="contrast"
              size={isExtension ? undefined : 28}
              variant={isExtension ? 'stationTitle1' : undefined}
              centerVertically
              data-testid="balance-value"
            >
              <BalanceVisibilityAware size="l">
                <AnimatedFiatAmount value={value} cacheKey="vault-total" />
              </BalanceVisibilityAware>
            </Text>
            {query.isUpdating ? (
              <Spinner size="0.9em" style={{ opacity: 0.5 }} />
            ) : null}
            {query.isIncomplete ? (
              <Tooltip
                content={t('some_balances_failed_to_load')}
                renderOpener={props => (
                  <IconWrapper {...props} color="danger" size={16}>
                    <CircleAlertIcon />
                  </IconWrapper>
                )}
              />
            ) : null}
          </HStack>
        )}
      />
      <ManageVaultBalanceVisibility isTotal={isTotal} />
    </VStack>
  )
}
