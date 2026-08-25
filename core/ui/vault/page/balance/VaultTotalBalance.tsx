import { AnimatedFiatAmount } from '@core/ui/chain/components/AnimatedFiatAmount'
import { useCore } from '@core/ui/state/core'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { useVaultTotalBalanceQuery } from '@core/ui/vault/queries/useVaultTotalBalanceQuery'
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

/**
 * Vault-wide fiat total for the vault home header. Shows the running total as
 * soon as any coin resolves, a spinner while other coins are still loading and
 * an alert when the total excludes chains whose balances failed to load; the
 * two indicators are independent because both states can hold at once.
 */
export const VaultTotalBalance = () => {
  const { client } = useCore()
  const isExtension = client === 'extension'
  const query = useVaultTotalBalanceQuery()
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
      <ManageVaultBalanceVisibility />
    </VStack>
  )
}
