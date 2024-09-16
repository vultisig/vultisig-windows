import { useInAppCurrency } from '../../lib/hooks/useInAppCurrency';
import { HStack } from '../../lib/ui/layout/Stack';
import { QueryDependant } from '../../lib/ui/query/components/QueryDependant';
import { getQueryDependantDefaultProps } from '../../lib/ui/query/utils/getQueryDependantDefaultProps';
import { Text } from '../../lib/ui/text';
import { formatAmount } from '../../lib/utils/formatAmount';
import { useVaultTotalBalanceQuery } from '../queries/useVaultTotalBalanceQuery';
import { BalanceVisibilityAware } from './visibility/BalanceVisibilityAware';
import { ManageVaultBalanceVisibility } from './visibility/ManageVaultBalanceVisibility';

export const VaultTotalBalance = () => {
  const query = useVaultTotalBalanceQuery();
  const { currencySymbol } = useInAppCurrency();

  return (
    <HStack alignItems="center" gap={4}>
      <QueryDependant
        query={query}
        {...getQueryDependantDefaultProps('balance')}
        success={value => (
          <Text color="contrast" weight="700" size={26} centerVertically>
            <BalanceVisibilityAware size="l">
              {formatAmount(value)}
            </BalanceVisibilityAware>{' '}
            {currencySymbol}
          </Text>
        )}
      />
      <ManageVaultBalanceVisibility />
    </HStack>
  );
};
