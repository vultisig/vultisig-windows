import { assertChainField } from '../../chain/utils/assertChainField';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { RpcServiceFactory } from '../../services/Rpc/RpcServiceFactory';
import { CoinAmount } from '../Coin';

export const getCoinBalance = async (coin: Coin): Promise<CoinAmount> => {
  const { chain } = assertChainField(coin);

  const rpcService = RpcServiceFactory.createRpcService(chain);

  const balance = await rpcService.getBalance(coin);

  return {
    amount: BigInt(balance),
    decimals: coin.decimals,
  };
};
