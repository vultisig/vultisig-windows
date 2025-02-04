import { Fetch } from '../../../../wailsjs/go/utils/GoHttp';
import { Coin } from '@core/communication/vultisig/keysign/v1/coin_pb';
import { Endpoint } from '../../Endpoint';
import { IRpcService } from '../IRpcService';

export class RpcServiceTon implements IRpcService {
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
