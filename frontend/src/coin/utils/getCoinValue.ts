import { EntityWithPrice } from '../../chain/EntityWithPrice';
import { fromChainAmount } from '../../chain/utils/fromChainAmount';
import { CoinAmount } from '../Coin';

export const getCoinValue = ({
  amount,
  decimals,
  price,
}: CoinAmount & EntityWithPrice) => fromChainAmount(amount, decimals) * price;
