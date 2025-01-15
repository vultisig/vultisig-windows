import { Fetch, Post } from '../../../../wailsjs/go/utils/GoHttp';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { Endpoint } from '../../Endpoint';
import { IRpcService } from '../IRpcService';
import { RpcService } from '../RpcService';

export class RpcServiceTon extends RpcService implements IRpcService {
  async broadcastTransaction(obj: string): Promise<string> {
    const response = await Post(Endpoint.broadcastTonTransaction(), {
      boc: obj,
    });

    return Buffer.from(response.result.hash, 'base64').toString('hex');
  }

  async getBalance(coin: Coin): Promise<string> {
    const response: TonAddressInformation = await this.getAddressInformation(
      coin.address
    );
    return response.balance;
  }

  private async getAddressInformation(
    address: string
  ): Promise<TonAddressInformation> {
    return await Fetch(Endpoint.fetchTonBalance(address));
  }
}

export interface TonAddressInformation {
  balance: string;
  code: string;
  data: string;
  frozen_hash: string;
  last_transaction_hash: string;
  last_transaction_lt: string;
  status: string;
}
