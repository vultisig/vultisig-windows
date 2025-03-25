import { fiatCurrencySymbolRecord } from '@core/config/FiatCurrency'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { formatAmount } from '@lib/utils/formatAmount'
import { useTranslation } from 'react-i18next'

import { HStack } from '../../lib/ui/layout/Stack'
import { Spinner } from '../../lib/ui/loaders/Spinner'
import { Text } from '../../lib/ui/text'
import { useFiatCurrency } from '../../preferences/state/fiatCurrency'
import { useVaultTotalBalanceQuery } from '../queries/useVaultTotalBalanceQuery'
import { BalanceVisibilityAware } from './visibility/BalanceVisibilityAware'
import { ManageVaultBalanceVisibility } from './visibility/ManageVaultBalanceVisibility'

export const VaultTotalBalance = () => {
  const query = useVaultTotalBalanceQuery()
  const [fiatCurrency] = useFiatCurrency()
  const currencySymbol = fiatCurrencySymbolRecord[fiatCurrency]

  const { t } = useTranslation()

  return (
    <HStack alignItems="center" gap={4}>
      <MatchQuery
        value={query}
        error={() => t('failed_to_load')}
        pending={() => (
          <HStack gap={6} alignItems="center">
            {currencySymbol}
            <Spinner size="1.5em" />
          </HStack>
        )}
        success={value => (
          <Text color="contrast" weight="700" size={26} centerVertically>
            <BalanceVisibilityAware size="l">
              {formatAmount(value, fiatCurrency)}
            </BalanceVisibilityAware>{' '}
          </Text>
        )}
      />
      <ManageVaultBalanceVisibility />
    </HStack>
  )
}
