import { getSuiClient } from '../../chain/sui/client/getSuiClient';
import { CoinBalanceResolver } from './CoinBalanceResolver';

export const getSuiCoinBalance: CoinBalanceResolver = async input => {
  const rpcClient = getSuiClient();

  const { totalBalance } = await rpcClient.getBalance({
    owner: input.address,
  });

  return BigInt(totalBalance);
};
