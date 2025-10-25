import { fiatCurrencySymbolRecord } from '@core/config/FiatCurrency'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { useVaultTotalBalanceQuery } from '@core/ui/vault/queries/useVaultTotalBalanceQuery'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { ManageVaultBalanceVisibility } from './visibility/ManageVaultBalanceVisibility'

export const VaultTotalBalance = () => {
  const query = useVaultTotalBalanceQuery()
  const fiatCurrency = useFiatCurrency()
  const formatFiatAmount = useFormatFiatAmount()

  const { t } = useTranslation()

  return (
    <VStack alignItems="center" gap={12}>
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
          <Text color="contrast" size={28} centerVertically>
            <BalanceVisibilityAware size="l">
              {formatFiatAmount(value)}
            </BalanceVisibilityAware>
          </Text>
        )}
      />
      <ManageVaultBalanceVisibility />
    </VStack>
  )
}
