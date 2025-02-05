import { callRpc } from '../../chain/rpc/callRpc';
import { Endpoint } from '../../services/Endpoint';
import { GetCoinBalanceInput } from './GetCoinBalanceInput';

interface SuiBalanceResponse {
  totalBalance: string;
}

export const getSuiCoinBalance = async (input: GetCoinBalanceInput) => {
  const { totalBalance } = await callRpc<SuiBalanceResponse>({
    url: Endpoint.suiServiceRpc,
    method: 'suix_getBalance',
    params: [input.address],
  });

  return BigInt(totalBalance);
};
