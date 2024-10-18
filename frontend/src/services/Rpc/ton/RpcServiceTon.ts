import { Fetch } from '../../../../wailsjs/go/utils/GoHttp';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { SpecificTon } from '../../../model/specific-transaction-info';
import { Endpoint } from '../../Endpoint';
import { IRpcService } from '../IRpcService';
import { RpcService } from '../RpcService';

export class RpcServiceTon extends RpcService implements IRpcService {
  async calculateFee(_coin: Coin): Promise<number> {
    return 0;
  }

  async sendTransaction(_encodedTransaction: string): Promise<string> {
    return '';
  }

  async broadcastTransaction(_obj: string): Promise<string> {
    return '';
  }

  async getBalance(coin: Coin): Promise<string> {
    const response: TonAddressInformation = await this.getAddressInformation(
      coin.address
    );
    return response.balance;
  }

  async getSpecificTransactionInfo(_coin: Coin): Promise<SpecificTon> {
    return {
      fee: 0,
      gasPrice: 0,
      bounceable: false,
      expireAt: Math.floor(Date.now() / 1000) + 600,
      sequenceNumber: 0,
    };
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
