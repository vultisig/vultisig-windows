import { useMutation } from '@tanstack/react-query';

import { getBalanceQueryKey } from '../../coin/query/useBalanceQuery';
import { getCoinPricesQueryKeys } from '../../coin/query/useCoinPricesQuery';
import { getStorageCoinKey } from '../../coin/utils/storageCoin';
import { RefreshIcon } from '../../lib/ui/icons/RefreshIcon';
import { Spinner } from '../../lib/ui/loaders/Spinner';
import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries';
import { PageHeaderIconButton } from '../../ui/page/PageHeaderIconButton';
import { useAssertCurrentVaultCoins } from '../state/useCurrentVault';

export const RefreshVaultBalance = () => {
  const invalidateQueries = useInvalidateQueries();

  const coins = useAssertCurrentVaultCoins();

  const { mutate: refresh, isPending } = useMutation({
    mutationFn: () => {
      return invalidateQueries(
        getCoinPricesQueryKeys(coins.map(getStorageCoinKey)),
        ...coins.map(coin =>
          getBalanceQueryKey({
            ...getStorageCoinKey(coin),
            address: coin.address,
          })
        )
      );
    },
  });

  return (
    <PageHeaderIconButton
      onClick={() => refresh()}
      icon={isPending ? <Spinner /> : <RefreshIcon />}
    />
  );
};
