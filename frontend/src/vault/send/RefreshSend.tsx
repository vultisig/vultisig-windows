import { useMutation } from '@tanstack/react-query';

import { getBalanceQueryKey } from '../../coin/query/useBalanceQuery';
import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries';
import { PageHeaderRefresh } from '../../ui/page/PageHeaderRefresh';
import { useCurrentVaultAddress } from '../state/currentVault';
import { getSendChainSpecificQueryKey } from './queries/useSendChainSpecificQuery';
import { useSendAmount } from './state/amount';
import { useSendReceiver } from './state/receiver';
import { useCurrentSendCoin } from './state/sendCoin';

export const RefreshSend = () => {
  const invalidateQueries = useInvalidateQueries();

  const [coinKey] = useCurrentSendCoin();
  const address = useCurrentVaultAddress(coinKey.chain);
  const [receiver] = useSendReceiver();

  const [amount] = useSendAmount();

  const { mutate: refresh, isPending } = useMutation({
    mutationFn: () => {
      const accountCoinKey = {
        ...coinKey,
        address,
      };
      return invalidateQueries(
        getBalanceQueryKey(accountCoinKey),
        getSendChainSpecificQueryKey({
          coinKey,
          receiver,
          amount,
        })
      );
    },
  });

  return <PageHeaderRefresh onClick={() => refresh()} isPending={isPending} />;
};
