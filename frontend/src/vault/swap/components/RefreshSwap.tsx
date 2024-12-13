import { useMutation } from '@tanstack/react-query';

import { getBalanceQueryKey } from '../../../coin/query/useBalanceQuery';
import { useInvalidateQueries } from '../../../lib/ui/query/hooks/useInvalidateQueries';
import { PageHeaderRefresh } from '../../../ui/page/PageHeaderRefresh';
import { useCurrentVaultAddress } from '../../state/currentVault';
import { getSwapQuoteQueryKey } from '../queries/useSwapQuoteQuery';
import { useFromAmount } from '../state/fromAmount';
import { useFromCoin } from '../state/fromCoin';
import { useToCoin } from '../state/toCoin';

export const RefreshSwap = () => {
  const invalidateQueries = useInvalidateQueries();

  const [fromCoinKey] = useFromCoin();
  const [toCoinKey] = useToCoin();
  const [fromAmount] = useFromAmount();

  const address = useCurrentVaultAddress(fromCoinKey.chain);

  const { mutate: refresh, isPending } = useMutation({
    mutationFn: () => {
      const accountCoinKey = {
        ...fromCoinKey,
        address,
      };
      return invalidateQueries(
        getBalanceQueryKey(accountCoinKey),
        getSwapQuoteQueryKey({
          fromCoinKey,
          toCoinKey,
          fromAmount,
        })
      );
    },
  });

  return <PageHeaderRefresh onClick={() => refresh()} isPending={isPending} />;
};
