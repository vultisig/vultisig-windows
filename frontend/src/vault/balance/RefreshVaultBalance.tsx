import { useMutation } from '@tanstack/react-query';
import { RefreshIcon } from '../../lib/ui/icons/RefreshIcon';
import { PageHeaderIconButton } from '../../ui/page/PageHeaderIconButton';
import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries';
import { getCoinPricesQueryKeys } from '../../coin/query/useCoinPricesQuery';
import { useAssertCurrentVaultCoins } from '../state/useCurrentVault';
import { getStorageCoinKey } from '../../coin/utils/storageCoin';
import { Spinner } from '../../lib/ui/loaders/Spinner';
import { getBalanceQueryKey } from '../../coin/query/useBalanceQuery';

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
