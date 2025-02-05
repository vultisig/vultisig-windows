import { getSuiRpcClient } from '../../chain/sui/rpc/getSuiRpcClient';
import { CoinBalanceResolver } from './CoinBalanceResolver';

export const getSuiCoinBalance: CoinBalanceResolver = async input => {
  const rpcClient = getSuiRpcClient();

  const { totalBalance } = await rpcClient.getBalance({
    owner: input.address,
  });

  return BigInt(totalBalance);
};
