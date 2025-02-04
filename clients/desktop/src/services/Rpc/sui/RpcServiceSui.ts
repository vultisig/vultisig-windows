import { create } from '@bufbuild/protobuf';
import {
  SuiCoin,
  SuiCoinSchema,
} from '@core/communication/vultisig/keysign/v1/blockchain_specific_pb';
import { Coin } from '@core/communication/vultisig/keysign/v1/coin_pb';

import { callRpc } from '../../../chain/rpc/callRpc';
import { Endpoint } from '../../Endpoint';
import { IRpcService } from '../IRpcService';

export class RpcServiceSui implements IRpcService {
  async calculateFee(_coin: Coin): Promise<number> {
    return await this.getReferenceGasPrice();
  }

  async getBalance(coin: Coin): Promise<string> {
    const result = await this.callRPC('suix_getBalance', [coin.address]);
    return result.totalBalance;
  }

  private async getReferenceGasPrice(): Promise<number> {
    const result = await this.callRPC('suix_getReferenceGasPrice', []);
    return Number(result);
  }

  async getAllCoins(coin: Coin): Promise<SuiCoin[]> {
    const result = await this.callRPC('suix_getAllCoins', [coin.address]);
    const rawCoins = result.data as SuiCoin[];
    const suiCoins: SuiCoin[] = rawCoins
      .filter(f => f.coinType == '0x2::sui::SUI')
      .map((coin: SuiCoin) => {
        return create(SuiCoinSchema, coin);
      });
    return suiCoins;
  }

  private async callRPC(method: string, params: any[]): Promise<any> {
    return callRpc({
      url: Endpoint.suiServiceRpc,
      method,
      params,
    });
  }
}
