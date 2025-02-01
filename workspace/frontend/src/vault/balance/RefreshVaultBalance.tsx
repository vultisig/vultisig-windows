import { useMutation } from '@tanstack/react-query';

import { getBalanceQueryKey } from '../../coin/query/useBalanceQuery';
import { getCoinPricesQueryKeys } from '../../coin/query/useCoinPricesQuery';
import { getStorageCoinKey } from '../../coin/utils/storageCoin';
import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries';
import { PageHeaderRefresh } from '../../ui/page/PageHeaderRefresh';
import { useCurrentVaultCoins } from '../state/currentVault';

export const RefreshVaultBalance = () => {
  const invalidateQueries = useInvalidateQueries();

  const coins = useCurrentVaultCoins();

  const { mutate: refresh, isPending } = useMutation({
    mutationFn: () => {
      return invalidateQueries(
        getCoinPricesQueryKeys(coins.map(getStorageCoinKey)),
        ...coins.map(coin => getBalanceQueryKey(getStorageCoinKey(coin)))
      );
    },
  });

  return <PageHeaderRefresh onClick={() => refresh()} isPending={isPending} />;
};
