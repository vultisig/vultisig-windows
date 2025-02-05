import { callRpc } from '../../chain/rpc/callRpc';
import { Endpoint } from '../../services/Endpoint';
import { CoinBalanceResolver } from './CoinBalanceResolver';

interface SuiBalanceResponse {
  totalBalance: string;
}

export const getSuiCoinBalance: CoinBalanceResolver = async input => {
  const { totalBalance } = await callRpc<SuiBalanceResponse>({
    url: Endpoint.suiServiceRpc,
    method: 'suix_getBalance',
    params: [input.address],
  });

  return BigInt(totalBalance);
};
