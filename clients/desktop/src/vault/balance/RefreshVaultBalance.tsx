import { useMutation } from '@tanstack/react-query';

import { getBalanceQueryKey } from '../../coin/query/useBalanceQuery';
import { getCoinPricesQueryKeys } from '../../coin/query/useCoinPricesQuery';
import { getStorageCoinKey } from '../../coin/utils/storageCoin';
import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries';
import { useFiatCurrency } from '../../preferences/state/fiatCurrency';
import { PageHeaderRefresh } from '../../ui/page/PageHeaderRefresh';
import { useCurrentVaultCoins } from '../state/currentVault';

export const RefreshVaultBalance = () => {
  const invalidateQueries = useInvalidateQueries();

  const coins = useCurrentVaultCoins();

  const [fiatCurrency] = useFiatCurrency();

  const { mutate: refresh, isPending } = useMutation({
    mutationFn: () => {
      return invalidateQueries(
        getCoinPricesQueryKeys({
          coins: coins.map(getStorageCoinKey),
          fiatCurrency,
        }),
        ...coins.map(coin => getBalanceQueryKey(getStorageCoinKey(coin)))
      );
    },
  });

  return <PageHeaderRefresh onClick={() => refresh()} isPending={isPending} />;
};
