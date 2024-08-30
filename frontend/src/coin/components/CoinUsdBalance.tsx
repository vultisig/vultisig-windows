import { fromChainAmount } from '../../chain/utils/fromChainAmount';
import { ComponentWithValueProps } from '../../lib/ui/props';
import { QueryDependant } from '../../lib/ui/query/components/QueryDependant';
import { formatAmount } from '../../lib/utils/formatAmount';
import { CoinAmount, CoinKey } from '../Coin';
import { useCoinUsdPriceQuery } from '../hooks/useCoinUsdPriceQuery';

export const CoinUsdBalance = ({
  value,
}: ComponentWithValueProps<CoinKey & CoinAmount>) => {
  const { amount, decimals, ...coinKey } = value;
  const query = useCoinUsdPriceQuery(coinKey);

  return (
    <QueryDependant
      query={query}
      success={price => {
        return `$${formatAmount(fromChainAmount(amount, decimals) * price)}`;
      }}
      error={() => null}
      pending={() => null}
    />
  );
};
