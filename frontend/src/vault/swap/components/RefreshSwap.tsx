import { useMutation } from '@tanstack/react-query';

import { getBalanceQueryKey } from '../../../coin/query/useBalanceQuery';
import { useInvalidateQueries } from '../../../lib/ui/query/hooks/useInvalidateQueries';
import { PageHeaderRefresh } from '../../../ui/page/PageHeaderRefresh';
import { useCurrentVaultAddress } from '../../state/currentVault';
import { useFromCoin } from '../state/fromCoin';

export const RefreshSwap = () => {
  const invalidateQueries = useInvalidateQueries();

  const [coinKey] = useFromCoin();
  const address = useCurrentVaultAddress(coinKey.chainId);

  const { mutate: refresh, isPending } = useMutation({
    mutationFn: () => {
      const accountCoinKey = {
        ...coinKey,
        address,
      };
      return invalidateQueries(getBalanceQueryKey(accountCoinKey));
    },
  });

  return <PageHeaderRefresh onClick={() => refresh()} isPending={isPending} />;
};
