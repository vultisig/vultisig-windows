import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { Endpoint } from '../../Endpoint';
import { IRpcService } from '../IRpcService';
import { RpcService } from '../RpcService';

export class RpcServiceRipple extends RpcService implements IRpcService {
  async getBalance(coin: Coin): Promise<string> {
    const accountInfo = await this.fetchAccountsInfo(coin.address);
    const balance = accountInfo?.account_data?.Balance;
    return balance ?? '0';
  }

  async fetchAccountsInfo(walletAddress: string): Promise<any> {
    try {
      return await super.callRpc(Endpoint.rippleServiceRpc, 'account_info', [
        {
          account: walletAddress,
          ledger_index: 'current',
          queue: true,
        },
      ]);
    } catch {
      console.error('Error in fetchTokenAccountsByOwner:');
    }
  }
}
