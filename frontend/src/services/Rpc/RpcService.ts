import { Post } from '../../../wailsjs/go/utils/GoHttp';
import { Chain } from '../../model/chain';

export class RpcService {
  chain: Chain;
  constructor(chain: Chain) {
    this.chain = chain;
  }

  async callRpc(url: string, method: string, params: any[]): Promise<any> {
    try {
      const payload = {
        jsonrpc: '2.0',
        method: method,
        params: params,
        id: 1,
      };

      const response = await Post(url, payload);
      if (response && response.result !== undefined) {
        return response.result;
      } else {
        return response.error || 'Unknown error occurred';
      }
    } catch (error: any) {
      return error.message || 'Unknown error occurred';
    }
  }
}
