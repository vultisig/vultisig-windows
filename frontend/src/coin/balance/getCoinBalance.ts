import { assertChainField } from '../../chain/utils/assertChainField';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { BalanceServiceFactory } from '../../services/Balance/BalanceServiceFactory';
import { CoinAmount } from '../Coin';

export const getCoinBalance = async (coin: Coin): Promise<CoinAmount> => {
  const { chain } = assertChainField(coin);

  const balanceService = BalanceServiceFactory.createBalanceService(chain);

  const { rawAmount } = await balanceService.getBalance(coin);

  return {
    amount: BigInt(Math.round(rawAmount)),
    decimals: coin.decimals,
  };
};
