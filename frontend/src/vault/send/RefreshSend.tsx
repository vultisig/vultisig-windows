import { useMutation } from '@tanstack/react-query';

import { getBalanceQueryKey } from '../../coin/query/useBalanceQuery';
import { getSpecificTxInfoQueryKey } from '../../coin/query/useSpecificTxInfoQuery';
import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries';
import { PageHeaderRefresh } from '../../ui/page/PageHeaderRefresh';
import { useCurrentVaultAddress } from '../state/currentVault';
import { useFeeSettings } from './fee/settings/state/feeSettings';
import { useCurrentSendCoin } from './state/sendCoin';

export const RefreshSend = () => {
  const invalidateQueries = useInvalidateQueries();

  const [coinKey] = useCurrentSendCoin();
  const address = useCurrentVaultAddress(coinKey.chainId);

  const feeSettings = useFeeSettings();

  const { mutate: refresh, isPending } = useMutation({
    mutationFn: () => {
      const accountCoinKey = {
        ...coinKey,
        address,
      };
      return invalidateQueries(
        getBalanceQueryKey(accountCoinKey),
        getSpecificTxInfoQueryKey({
          coin: accountCoinKey,
          feeSettings,
        })
      );
    },
  });

  return <PageHeaderRefresh onClick={() => refresh()} isPending={isPending} />;
};
