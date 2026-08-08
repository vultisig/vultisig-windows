import { AnimatedFiatAmount } from '@core/ui/chain/components/AnimatedFiatAmount'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { useVaultTotalBalanceQuery } from '@core/ui/vault/queries/useVaultTotalBalanceQuery'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { fiatCurrencySymbolRecord } from '@vultisig/core-config/FiatCurrency'
import { useTranslation } from 'react-i18next'

import { ManageVaultBalanceVisibility } from './visibility/ManageVaultBalanceVisibility'

export const VaultTotalBalance = () => {
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
              size={28}
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
          </HStack>
        )}
      />
      <ManageVaultBalanceVisibility />
    </VStack>
  )
}
