import { useTranslation } from 'react-i18next';

import { useGlobalCurrency } from '../../lib/hooks/useGlobalCurrency';
import { HStack } from '../../lib/ui/layout/Stack';
import { MatchQuery } from '../../lib/ui/query/components/MatchQuery';
import { Text } from '../../lib/ui/text';
import { formatAmount } from '../../lib/utils/formatAmount';
import { useVaultTotalBalanceQuery } from '../queries/useVaultTotalBalanceQuery';
import { BalanceVisibilityAware } from './visibility/BalanceVisibilityAware';
import { ManageVaultBalanceVisibility } from './visibility/ManageVaultBalanceVisibility';

export const VaultTotalBalance = () => {
  const query = useVaultTotalBalanceQuery();
  const { globalCurrency } = useGlobalCurrency();

  const { t } = useTranslation();

  return (
    <HStack alignItems="center" gap={4}>
      <MatchQuery
        value={query}
        error={() => t('failed_to_load')}
        pending={() => t('loading')}
        success={value => (
          <Text color="contrast" weight="700" size={26} centerVertically>
            <BalanceVisibilityAware size="l">
              {formatAmount(value, globalCurrency)}
            </BalanceVisibilityAware>{' '}
          </Text>
        )}
      />
      <ManageVaultBalanceVisibility />
    </HStack>
  );
};
