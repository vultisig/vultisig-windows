import { QueryDependant } from '../../lib/ui/query/components/QueryDependant';
import { getQueryDependantDefaultProps } from '../../lib/ui/query/utils/getQueryDependantDefaultProps';
import { Text } from '../../lib/ui/text';
import { formatAmount } from '../../lib/utils/formatAmount';
import { useVaultTotalBalanceQuery } from '../queries/useVaultTotalBalanceQuery';

export const VaultTotalBalance = () => {
  const query = useVaultTotalBalanceQuery();

  return (
    <QueryDependant
      query={query}
      {...getQueryDependantDefaultProps('balance')}
      success={value => (
        <Text color="contrast" weight="700" size={26}>
          ${formatAmount(value)}
        </Text>
      )}
    />
  );
};
