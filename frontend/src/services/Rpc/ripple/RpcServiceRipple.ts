import { callRpc } from '../../../chain/rpc/callRpc';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { Endpoint } from '../../Endpoint';
import { IRpcService } from '../IRpcService';

export class RpcServiceRipple implements IRpcService {
  async getBalance(coin: Coin): Promise<string> {
    const accountInfo = await this.fetchAccountsInfo(coin.address);
    const balance = accountInfo?.account_data?.Balance;
    return balance ?? '0';
  }

  async fetchAccountsInfo(walletAddress: string): Promise<any> {
    return callRpc({
      url: Endpoint.rippleServiceRpc,
      method: 'account_info',
      params: [
        {
          account: walletAddress,
          ledger_index: 'current',
          queue: true,
        },
      ],
    });
  }
}
