import { useMutation } from '@tanstack/react-query';

import { getBalanceQueryKey } from '../../coin/query/useBalanceQuery';
import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries';
import { PageHeaderRefresh } from '../../ui/page/PageHeaderRefresh';
import { useCurrentVaultAddress } from '../state/currentVault';
import { getSpecificSendTxInfoQueryKey } from './queries/useSpecificSendTxInfoQuery';
import { useCurrentSendCoin } from './state/sendCoin';

export const RefreshSend = () => {
  const invalidateQueries = useInvalidateQueries();

  const [coinKey] = useCurrentSendCoin();
  const address = useCurrentVaultAddress(coinKey.chainId);

  const { mutate: refresh, isPending } = useMutation({
    mutationFn: () => {
      const accountCoinKey = {
        ...coinKey,
        address,
      };
      return invalidateQueries(
        getBalanceQueryKey(accountCoinKey),
        getSpecificSendTxInfoQueryKey(accountCoinKey)
      );
    },
  });

  return <PageHeaderRefresh onClick={() => refresh()} isPending={isPending} />;
};
