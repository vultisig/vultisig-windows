import { fromChainAmount } from '@core/chain/amount/fromChainAmount';
import { CoinAmount } from '@core/chain/coin/Coin';

import { EntityWithPrice } from '../../chain/EntityWithPrice';

export const getCoinValue = ({
  amount,
  decimals,
  price,
}: CoinAmount & EntityWithPrice) => fromChainAmount(amount, decimals) * price;
