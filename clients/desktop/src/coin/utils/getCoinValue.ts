import { CoinAmount } from '@core/chain/coin/Coin';

import { EntityWithPrice } from '../../chain/EntityWithPrice';
import { fromChainAmount } from '../../chain/utils/fromChainAmount';

export const getCoinValue = ({
  amount,
  decimals,
  price,
}: CoinAmount & EntityWithPrice) => fromChainAmount(amount, decimals) * price;
